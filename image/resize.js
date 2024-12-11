let currentImage = null;
let originalWidth = 0;
let originalHeight = 0;
const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('file-input');
const previewImage = document.getElementById('preview-image');
const resizeControls = document.getElementById('resize-controls');
const actionButtons = document.getElementById('action-buttons');

// 拖放功能
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false);
});

function highlight() {
    dropArea.classList.add('dragover');
}

function unhighlight() {
    dropArea.classList.remove('dragover');
}

// 处理文件拖放
dropArea.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}

// 点击上传
dropArea.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', function() {
    handleFiles(this.files);
});

// 处理文件
async function handleFiles(files) {
    const file = files[0];
    if (!file) return;

    try {
        const fileExt = file.name.split('.').pop().toLowerCase();
        let imageUrl;

        if (fileExt === 'heic' || fileExt === 'heif') {
            // 使用 heic2any 转换 HEIC 文件为 JPEG
            const jpegBlob = await heic2any({
                blob: file,
                toType: 'image/jpeg',
                quality: 0.9
            });
            imageUrl = URL.createObjectURL(jpegBlob);
        } else if (file.type.startsWith('image/')) {
            imageUrl = URL.createObjectURL(file);
        } else {
            throw new Error('不支持的文件格式');
        }

        const img = new Image();
        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = imageUrl;
        });

        previewImage.src = imageUrl;
        previewImage.style.display = 'block';
        document.querySelector('.drop-text').style.display = 'none';
        document.getElementById('resize-controls').style.display = 'block';
        document.getElementById('action-buttons').style.display = 'block';
        
        // 更新尺寸输入框
        document.getElementById('width').value = img.width;
        document.getElementById('height').value = img.height;
        originalWidth = img.width;
        originalHeight = img.height;
        aspectRatio = originalWidth / originalHeight;
        currentImage = img;
    } catch (error) {
        console.error('Error processing file:', error);
        alert(error.message || '处理文件时出错，请重试');
    }
}

// 更新尺寸信息
function updateSizeInfo() {
    const sizeInfo = document.getElementById('size-info');
    sizeInfo.innerHTML = `原始尺寸: ${originalWidth} × ${originalHeight} 像素`;
}

// 调整尺寸选项切换
document.querySelectorAll('.resize-option').forEach(option => {
    option.addEventListener('click', function() {
        // 更新选中状态
        document.querySelectorAll('.resize-option').forEach(opt => {
            opt.classList.remove('active');
        });
        this.classList.add('active');
        
        // 显示对应的控制面板
        const type = this.dataset.type;
        document.querySelectorAll('.custom-size').forEach(el => {
            el.classList.remove('show');
        });
        
        if (type !== 'percentage') {
            document.getElementById(`${type}-control`).classList.add('show');
        }
        
        // 重置输入值
        resetInputs();
    });
});

// 重置输入值
function resetInputs() {
    document.getElementById('scale-percentage').value = 100;
    document.getElementById('scale-value').textContent = '100%';
    document.getElementById('width-input').value = originalWidth;
    document.getElementById('height-input').value = originalHeight;
    document.getElementById('custom-width').value = originalWidth;
    document.getElementById('custom-height').value = originalHeight;
}

// 监听百分比滑块
document.getElementById('scale-percentage').addEventListener('input', function() {
    document.getElementById('scale-value').textContent = this.value + '%';
});

// 监听质量滑块
document.getElementById('quality').addEventListener('input', function() {
    document.getElementById('quality-value').textContent = this.value + '%';
});

// 保持宽高比
let isUpdating = false;
document.getElementById('custom-width').addEventListener('input', function() {
    if (!document.getElementById('maintain-ratio').checked || isUpdating) return;
    isUpdating = true;
    const ratio = originalHeight / originalWidth;
    document.getElementById('custom-height').value = Math.round(this.value * ratio);
    isUpdating = false;
});

document.getElementById('custom-height').addEventListener('input', function() {
    if (!document.getElementById('maintain-ratio').checked || isUpdating) return;
    isUpdating = true;
    const ratio = originalWidth / originalHeight;
    document.getElementById('custom-width').value = Math.round(this.value * ratio);
    isUpdating = false;
});

// 调整图片尺寸
function resizeImage() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = currentImage;
    
    img.onload = function() {
        let newWidth, newHeight;
        const type = document.querySelector('.resize-option.active').dataset.type;
        
        switch(type) {
            case 'percentage':
                const scale = document.getElementById('scale-percentage').value / 100;
                newWidth = originalWidth * scale;
                newHeight = originalHeight * scale;
                break;
            case 'width':
                newWidth = parseInt(document.getElementById('width-input').value);
                newHeight = (newWidth / originalWidth) * originalHeight;
                break;
            case 'height':
                newHeight = parseInt(document.getElementById('height-input').value);
                newWidth = (newHeight / originalHeight) * originalWidth;
                break;
            case 'custom':
                newWidth = parseInt(document.getElementById('custom-width').value);
                newHeight = parseInt(document.getElementById('custom-height').value);
                break;
        }
        
        canvas.width = newWidth;
        canvas.height = newHeight;
        
        // 使用双线性插值算法
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        
        previewImage.src = canvas.toDataURL('image/jpeg', document.getElementById('quality').value / 100);
        currentImage = previewImage.src;
    };
}

// 下载图片
function downloadImage() {
    const link = document.createElement('a');
    link.download = 'resized-image.jpg';
    link.href = currentImage;
    link.click();
} 
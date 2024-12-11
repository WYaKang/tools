let imageFiles = [];
const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('file-input');
const imageList = document.getElementById('image-list');
const mergeBtn = document.getElementById('merge-btn');

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

// 创建图片项
function createImageItem(img, fileName) {
    const div = document.createElement('div');
    div.className = 'image-item';
    div.innerHTML = `
        <img src="${img.src}" alt="${fileName}">
        <div class="image-info">
            <span class="file-name">${fileName}</span>
            <span class="image-size">${img.width} × ${img.height}</span>
        </div>
        <button class="remove-btn" onclick="removeImage(this)">
            <i class="fas fa-times"></i>
        </button>
    `;
    imageFiles.push({
        element: div,
        image: img
    });
    return div;
}

// 处理文件
async function handleFiles(files) {
    for (const file of files) {
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

            const imageItem = createImageItem(img, file.name);
            imageList.appendChild(imageItem);
            updateImageCount();
            checkMergeButton();
        } catch (error) {
            console.error('Error processing file:', error);
            alert(`处理文件 ${file.name} 时���错：${error.message || '请重试'}`);
        }
    }
}

// 移除图片
function removeImage(btn) {
    const item = btn.closest('.image-item');
    const index = Array.from(imageList.children).indexOf(item);
    if (index !== -1) {
        imageFiles.splice(index, 1);
        item.remove();
        updateImageCount();
        checkMergeButton();
    }
}

// 更新图片计数
function updateImageCount() {
    const count = imageFiles.length;
    document.getElementById('image-count').textContent = count;
}

// 检查合并按钮状态
function checkMergeButton() {
    const count = imageFiles.length;
    mergeBtn.disabled = count < 2;
    if (count >= 2) {
        mergeBtn.classList.remove('disabled');
    } else {
        mergeBtn.classList.add('disabled');
    }
}

// 合并图片
async function mergeImages() {
    if (imageFiles.length < 2) return;

    const direction = document.querySelector('input[name="merge-direction"]:checked').value;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    let totalWidth = 0;
    let totalHeight = 0;
    let maxWidth = 0;
    let maxHeight = 0;

    // 计算总尺寸
    imageFiles.forEach(({image}) => {
        if (direction === 'horizontal') {
            totalWidth += image.width;
            maxHeight = Math.max(maxHeight, image.height);
        } else {
            totalHeight += image.height;
            maxWidth = Math.max(maxWidth, image.width);
        }
    });

    // 设置画布尺寸
    if (direction === 'horizontal') {
        canvas.width = totalWidth;
        canvas.height = maxHeight;
    } else {
        canvas.width = maxWidth;
        canvas.height = totalHeight;
    }

    // 绘制图片
    let currentX = 0;
    let currentY = 0;
    imageFiles.forEach(({image}) => {
        if (direction === 'horizontal') {
            // 水平居中
            const y = (maxHeight - image.height) / 2;
            ctx.drawImage(image, currentX, y, image.width, image.height);
            currentX += image.width;
        } else {
            // 水平居中
            const x = (maxWidth - image.width) / 2;
            ctx.drawImage(image, x, currentY, image.width, image.height);
            currentY += image.height;
        }
    });

    // 下载合并后的图片
    const link = document.createElement('a');
    link.download = 'merged-image.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
} 
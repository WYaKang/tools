let currentImage = null;
let currentFormat = '';
const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('file-input');
const previewImage = document.getElementById('preview-image');
const convertControls = document.getElementById('convert-controls');
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
function handleFiles(files) {
    const file = files[0];
    if (file && file.type.startsWith('image/')) {
        currentFormat = file.type;
        const reader = new FileReader();
        reader.onload = function(e) {
            previewImage.src = e.target.result;
            previewImage.style.display = 'block';
            document.querySelector('.drop-text').style.display = 'none';
            convertControls.style.display = 'block';
            actionButtons.style.display = 'block';
            currentImage = e.target.result;
            updateFileInfo(file);
            
            // 默认选中不同于当前格式的选项
            selectDefaultFormat();
        };
        reader.readAsDataURL(file);
    }
}

// 更新文件信息
function updateFileInfo(file) {
    const fileInfo = document.getElementById('file-info');
    fileInfo.innerHTML = `
        当前文件：${file.name}<br>
        格式：${file.type.split('/')[1].toUpperCase()}<br>
        大小：${formatFileSize(file.size)}
    `;
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 选择默认输出格式
function selectDefaultFormat() {
    const options = document.querySelectorAll('.format-option');
    options.forEach(option => {
        option.classList.remove('active');
        if (option.dataset.format !== currentFormat) {
            option.classList.add('active');
            return;
        }
    });
}

// 格式选择
document.querySelectorAll('.format-option').forEach(option => {
    option.addEventListener('click', function() {
        document.querySelectorAll('.format-option').forEach(opt => {
            opt.classList.remove('active');
        });
        this.classList.add('active');
    });
});

// 监听质量滑块
document.getElementById('quality').addEventListener('input', function() {
    document.getElementById('quality-value').textContent = this.value + '%';
});

// 转换图片
function convertImage() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = currentImage;
    
    img.onload = function() {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const format = document.querySelector('.format-option.active').dataset.format;
        const quality = document.getElementById('quality').value / 100;
        
        previewImage.src = canvas.toDataURL(format, quality);
        currentImage = previewImage.src;
    };
}

// 下载图片
function downloadImage() {
    const format = document.querySelector('.format-option.active').dataset.format;
    const extension = format.split('/')[1];
    
    const link = document.createElement('a');
    link.download = `converted-image.${extension}`;
    link.href = currentImage;
    link.click();
} 
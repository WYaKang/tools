let currentImage = null;
const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('file-input');
const previewImage = document.getElementById('preview-image');
const resultArea = document.getElementById('result-area');
const resultImage = document.getElementById('result-image');
const mirrorButtons = document.querySelectorAll('.mirror-btn');

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
        const reader = new FileReader();
        reader.onload = function(e) {
            currentImage = new Image();
            currentImage.onload = function() {
                previewImage.src = this.src;
                previewImage.style.display = 'block';
                document.querySelector('.drop-text').style.display = 'none';
                mirrorButtons.forEach(btn => btn.disabled = false);
            };
            currentImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

// 镜像处理
function mirrorImage(direction) {
    if (!currentImage) return;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = currentImage.width;
    canvas.height = currentImage.height;
    
    // 根据方向设置变换
    switch(direction) {
        case 'horizontal':
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
            break;
        case 'vertical':
            ctx.translate(0, canvas.height);
            ctx.scale(1, -1);
            break;
        case 'both':
            ctx.translate(canvas.width, canvas.height);
            ctx.scale(-1, -1);
            break;
    }
    
    ctx.drawImage(currentImage, 0, 0);
    
    resultImage.src = canvas.toDataURL('image/png');
    resultArea.style.display = 'block';
    
    // 平滑滚动到结果区域
    resultArea.scrollIntoView({ behavior: 'smooth' });
}

// 下载图片
function downloadImage() {
    if (!resultImage.src) return;
    
    const link = document.createElement('a');
    link.download = 'mirrored-image.png';
    link.href = resultImage.src;
    link.click();
} 
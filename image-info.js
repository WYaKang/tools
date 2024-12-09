let currentImage = null;
const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('file-input');
const previewImage = document.getElementById('preview-image');
const infoSection = document.getElementById('info-section');

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
        // 显示预览
        const reader = new FileReader();
        reader.onload = function(e) {
            previewImage.src = e.target.result;
            previewImage.style.display = 'block';
            document.querySelector('.drop-text').style.display = 'none';
            
            // 加载图片以获取尺寸信息
            const img = new Image();
            img.onload = function() {
                showImageInfo(file, this);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);

        // 读取EXIF信息
        const exifReader = new FileReader();
        exifReader.onload = function(e) {
            try {
                const exif = ExifReader.load(e.target.result);
                showExifInfo(exif);
            } catch (error) {
                showExifInfo(null);
            }
        };
        exifReader.readAsArrayBuffer(file);
    }
}

// 显示图片基本信息和尺寸信息
function showImageInfo(file, img) {
    infoSection.style.display = 'block';
    
    // 基本信息
    const basicInfo = document.getElementById('basic-info');
    basicInfo.innerHTML = `
        <div class="info-item">
            <span class="info-label">文件名</span>
            <span class="info-value">${file.name}</span>
        </div>
        <div class="info-item">
            <span class="info-label">文件类型</span>
            <span class="info-value">${file.type}</span>
        </div>
        <div class="info-item">
            <span class="info-label">文件大小</span>
            <span class="info-value">${formatFileSize(file.size)}</span>
        </div>
        <div class="info-item">
            <span class="info-label">最后修改</span>
            <span class="info-value">${new Date(file.lastModified).toLocaleString()}</span>
        </div>
    `;

    // 尺寸信息
    const sizeInfo = document.getElementById('size-info');
    sizeInfo.innerHTML = `
        <div class="info-item">
            <span class="info-label">原始宽度</span>
            <span class="info-value">${img.naturalWidth}px</span>
        </div>
        <div class="info-item">
            <span class="info-label">原始高度</span>
            <span class="info-value">${img.naturalHeight}px</span>
        </div>
        <div class="info-item">
            <span class="info-label">宽高比</span>
            <span class="info-value">${(img.naturalWidth / img.naturalHeight).toFixed(2)}</span>
        </div>
        <div class="info-item">
            <span class="info-label">分辨率</span>
            <span class="info-value">${formatResolution(img.naturalWidth * img.naturalHeight)}</span>
        </div>
    `;
}

// 显示EXIF信息
function showExifInfo(exif) {
    const exifInfo = document.getElementById('exif-info');
    
    if (!exif) {
        exifInfo.innerHTML = '<div class="text-muted">未找到EXIF信息</div>';
        return;
    }

    let exifHtml = '';
    const excludeKeys = ['MakerNote', 'UserComment', 'ComponentsConfiguration'];
    
    for (let key in exif) {
        if (excludeKeys.includes(key)) continue;
        
        const value = exif[key].description;
        if (value && typeof value === 'string') {
            exifHtml += `
                <div class="info-item">
                    <span class="info-label">${key}</span>
                    <span class="info-value">${value}</span>
                </div>
            `;
        }
    }
    
    exifInfo.innerHTML = exifHtml || '<div class="text-muted">未找到EXIF信息</div>';
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 格式化分辨率
function formatResolution(pixels) {
    if (pixels < 1000000) {
        return `${(pixels / 1000).toFixed(1)}K pixels`;
    }
    return `${(pixels / 1000000).toFixed(1)}M pixels`;
} 
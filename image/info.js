let currentImage = null;
const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('file-input');
const previewImage = document.getElementById('preview-image');
const infoSection = document.getElementById('info-section');
const loadingSpinner = document.getElementById('loading-spinner');
const errorMessage = document.getElementById('error-message');

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

// 检查是否为HEIC/HEIF格式
function isHeicFormat(file) {
    const fileExt = file.name.split('.').pop().toLowerCase();
    return fileExt === 'heic' || fileExt === 'heif';
}

// 读取EXIF信息
function readExifData(file) {
    return new Promise((resolve, reject) => {
        EXIF.getData(file, function() {
            const exifData = EXIF.getAllTags(this);
            if (Object.keys(exifData).length === 0) {
                console.warn('No EXIF data found');
                resolve(null);
            } else {
                resolve(exifData);
            }
        });
    });
}

// 格式化EXIF值
function formatExifValue(tag, value) {
    if (tag === 'DateTimeOriginal' || tag === 'DateTime' || tag === 'DateTimeDigitized') {
        return value;
    }
    if (tag === 'GPSLatitude' || tag === 'GPSLongitude') {
        return EXIF.getTag(this, tag);
    }
    if (Array.isArray(value)) {
        return value.join(', ');
    }
    if (typeof value === 'number') {
        return value.toFixed(2);
    }
    return value;
}

// 处理文件
async function handleFiles(files) {
    const file = files[0];
    if (!file) return;

    try {
        loadingSpinner.style.display = 'block';
        errorMessage.style.display = 'none';
        document.querySelector('.drop-text').style.display = 'none';

        console.log('Processing file:', file.name, file.type);
        let imageUrl;
        let exifData = null;

        if (isHeicFormat(file)) {
            // 转换HEIC为JPEG以显示预览
            const jpegBlob = await heic2any({
                blob: file,
                toType: 'image/jpeg',
                quality: 0.9
            });
            imageUrl = URL.createObjectURL(jpegBlob);
            
            // 尝试从转换后的JPEG读取EXIF
            try {
                exifData = await readExifData(jpegBlob);
            } catch (exifError) {
                console.warn('无法读取HEIC的EXIF数据:', exifError);
            }
        } else if (file.type.startsWith('image/')) {
            imageUrl = URL.createObjectURL(file);
            try {
                exifData = await readExifData(file);
            } catch (exifError) {
                console.warn('无法读取EXIF数据:', exifError);
            }
        } else {
            throw new Error('不支持的文件格式');
        }

        // 获取图片尺寸并显示预览
        await new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                // 显示基本信息
                displayImageInfo({
                    name: file.name,
                    type: file.type || `image/${file.name.split('.').pop().toLowerCase()}`,
                    size: file.size,
                    width: img.width,
                    height: img.height,
                    exif: exifData
                });
                
                previewImage.src = imageUrl;
                previewImage.style.display = 'block';
                resolve();
            };
            img.onerror = reject;
            img.src = imageUrl;
        });

    } catch (error) {
        console.error('Error processing file:', error);
        errorMessage.style.display = 'block';
        errorMessage.textContent = error.message || '处理文件时出错，请重试';
    } finally {
        loadingSpinner.style.display = 'none';
    }
}

// 显示图片信息
function displayImageInfo(info) {
    const infoContainer = document.getElementById('image-info');
    const exifContainer = document.getElementById('exif-info');
    
    // 基本信息
    infoContainer.innerHTML = `
        <table class="table">
            <tr><td>文件名</td><td>${info.name}</td></tr>
            <tr><td>文件类型</td><td>${info.type}</td></tr>
            <tr><td>文件大小</td><td>${formatFileSize(info.size)}</td></tr>
            <tr><td>图片尺寸</td><td>${info.width} × ${info.height} 像素</td></tr>
        </table>
    `;
    
    // EXIF信息
    if (info.exif) {
        const commonTags = {
            'Make': '相机制造商',
            'Model': '相机型号',
            'DateTimeOriginal': '拍摄时间',
            'ExposureTime': '曝光时间',
            'FNumber': '光圈值',
            'ISOSpeedRatings': 'ISO感光度',
            'FocalLength': '焦距',
            'GPSLatitude': '纬度',
            'GPSLongitude': '经度'
        };

        let exifHtml = '<table class="table">';
        
        // 首先显示常用标签
        for (const [tag, label] of Object.entries(commonTags)) {
            if (info.exif[tag]) {
                const value = formatExifValue(tag, info.exif[tag]);
                exifHtml += `<tr><td>${label}</td><td>${value}</td></tr>`;
            }
        }
        
        // 然后显示其他标签
        for (const [tag, value] of Object.entries(info.exif)) {
            if (!commonTags[tag] && value !== undefined && !tag.startsWith('thumbnail')) {
                exifHtml += `<tr><td>${tag}</td><td>${formatExifValue(tag, value)}</td></tr>`;
            }
        }
        
        exifHtml += '</table>';
        exifContainer.innerHTML = exifHtml;
    } else {
        exifContainer.innerHTML = '<p class="text-muted text-center">无EXIF信息</p>';
    }
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
} 
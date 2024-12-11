let currentImage = null;
let currentFormat = '';
let currentImageData = null;

const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('file-input');
const previewImage = document.getElementById('preview-image');
const convertControls = document.getElementById('convert-controls');
const actionButtons = document.getElementById('action-buttons');
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

// 处理文件��放
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

// 检查是否为已转换的图片
function isConvertedImage(fileName) {
    return fileName.startsWith('converted-image');
}

// 读取文件为ArrayBuffer
function readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

// 处理HEIC文件
async function convertHeicToJpeg(file) {
    try {
        // 如果是已转换的图片，直接读取为DataURL
        if (isConvertedImage(file.name)) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = e => resolve(e.target.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        }

        console.log('Starting HEIC conversion...', file.name, file.type);
        
        // 读取文件内容
        const arrayBuffer = await readFileAsArrayBuffer(file);
        
        // 检查文件头部标识
        const uint8Array = new Uint8Array(arrayBuffer.slice(0, 12));
        const header = Array.from(uint8Array)
            .map(byte => byte.toString(16).padStart(2, '0'))
            .join('');
            
        console.log('File header:', header);
        
        // 检查是否为有效的HEIC/HEIF文件
        if (!header.includes('66747970686569') && !header.includes('ftyp')) {
            throw new Error('无效的HEIC/HEIF文件格式');
        }

        console.log('Converting to JPEG...');
        const resultBlob = await heic2any({
            blob: file,
            toType: "image/jpeg",
            quality: 0.92
        });

        if (!resultBlob) {
            throw new Error('转换失败：未能生成有效的输出文件');
        }

        // 如果结果是数组，取第一个元素
        const outputBlob = Array.isArray(resultBlob) ? resultBlob[0] : resultBlob;
        return URL.createObjectURL(outputBlob);
    } catch (error) {
        console.error('HEIC conversion error:', error);
        
        if (error.message.includes('无效的HEIC')) {
            throw error;
        }
        
        // 错误处理
        if (error.code) {
            switch (error.code) {
                case 2:
                    throw new Error('HEIC文件格式不正确或已损坏');
                case 3:
                    throw new Error('不支持的HEIC文件版本');
                case 4:
                    throw new Error('HEIC文件解码失败');
                default:
                    throw new Error('HEIC转换失败：' + (error.message || '未知错误'));
            }
        }
        
        throw new Error('HEIC转换失败：' + (error.message || '未知错误'));
    }
}

// 处理文件
async function handleFiles(files) {
    const file = files[0];
    if (!file) return;

    try {
        errorMessage.style.display = 'none';
        loadingSpinner.style.display = 'block';
        document.querySelector('.drop-text').style.display = 'none';
        
        console.log('Processing file:', file.name, file.type, file.size);
        
        if (isHeicFormat(file)) {
            currentImage = await convertHeicToJpeg(file);
            currentFormat = 'image/heic';
        } else if (file.type.startsWith('image/')) {
            currentImage = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = e => resolve(e.target.result);
                reader.onerror = () => reject(new Error('读取文件失败'));
                reader.readAsDataURL(file);
            });
            currentFormat = file.type;
        } else {
            throw new Error('不支持的文件格式');
        }

        // 显示预览
        previewImage.src = currentImage;
        previewImage.style.display = 'block';
        
        // 更新文件信息
        updateFileInfo({
            name: file.name,
            type: currentFormat,
            size: file.size
        });

        convertControls.style.display = 'block';
        actionButtons.style.display = 'block';
        selectDefaultFormat();
    } catch (error) {
        console.error('Error processing file:', error);
        errorMessage.style.display = 'block';
        errorMessage.textContent = error.message || '处理文件时出错，请重试';
        resetUI();
    } finally {
        loadingSpinner.style.display = 'none';
    }
}

// 重置UI状态
function resetUI() {
    previewImage.style.display = 'none';
    document.querySelector('.drop-text').style.display = 'block';
    convertControls.style.display = 'none';
    actionButtons.style.display = 'none';
    currentImage = null;
    currentFormat = '';
}

// 更新文件信息
function updateFileInfo(file) {
    const fileInfo = document.getElementById('file-info');
    const format = file.type.split('/')[1].toUpperCase();
    fileInfo.innerHTML = `
        当前文件：${file.name}<br>
        格式：${format}<br>
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
    const currentExt = currentFormat.split('/')[1].toLowerCase();
    
    options.forEach(option => {
        option.classList.remove('active');
        const optionFormat = option.dataset.format.split('/')[1];
        if (optionFormat !== currentExt) {
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
async function convertImage() {
    if (!currentImage) {
        alert('请先选择图片');
        return;
    }

    const format = document.querySelector('.format-option.active').dataset.format;
    const quality = document.getElementById('quality').value / 100;
    
    try {
        loadingSpinner.style.display = 'block';
        errorMessage.style.display = 'none';
        
        const img = new Image();
        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = currentImage;
        });
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const dataUrl = canvas.toDataURL(format, quality);
        if (!dataUrl.startsWith('data:image/')) {
            throw new Error('转换失败，请重试');
        }
        
        previewImage.src = dataUrl;
        currentImage = dataUrl;
    } catch (error) {
        console.error('Error converting image:', error);
        errorMessage.style.display = 'block';
        errorMessage.textContent = '转换图片时出错，请重试';
    } finally {
        loadingSpinner.style.display = 'none';
    }
}

// 下载图片
function downloadImage() {
    if (!currentImage) {
        alert('请先转换图片');
        return;
    }

    const format = document.querySelector('.format-option.active').dataset.format;
    const extension = format.split('/')[1];
    
    const link = document.createElement('a');
    link.download = `converted-image.${extension}`;
    link.href = currentImage;
    link.click();
} 
let currentImage = null;
const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('file-input');
const previewImage = document.getElementById('preview-image');
const filterControls = document.getElementById('filter-controls');
const actionButtons = document.getElementById('action-buttons');

// 预设滤镜配置
const presets = {
    none: {
        brightness: 100,
        contrast: 100,
        saturate: 100,
        'hue-rotate': 0,
        blur: 0
    },
    grayscale: {
        brightness: 100,
        contrast: 100,
        saturate: 0,
        'hue-rotate': 0,
        blur: 0
    },
    sepia: {
        brightness: 110,
        contrast: 110,
        saturate: 120,
        'hue-rotate': 30,
        blur: 0
    },
    warm: {
        brightness: 105,
        contrast: 105,
        saturate: 120,
        'hue-rotate': 15,
        blur: 0
    },
    cool: {
        brightness: 105,
        contrast: 105,
        saturate: 110,
        'hue-rotate': 180,
        blur: 0
    },
    blur: {
        brightness: 100,
        contrast: 100,
        saturate: 100,
        'hue-rotate': 0,
        blur: 3
    },
    sharpen: {
        brightness: 110,
        contrast: 130,
        saturate: 110,
        'hue-rotate': 0,
        blur: 0
    },
    vintage: {
        brightness: 120,
        contrast: 120,
        saturate: 50,
        'hue-rotate': 45,
        blur: 0.5
    }
};

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
            previewImage.src = e.target.result;
            previewImage.style.display = 'block';
            document.querySelector('.drop-text').style.display = 'none';
            filterControls.style.display = 'block';
            actionButtons.style.display = 'block';
            currentImage = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

// 监听滤镜调整
const filters = ['brightness', 'contrast', 'saturate', 'hue-rotate', 'blur'];
filters.forEach(filter => {
    const slider = document.getElementById(filter);
    const value = document.getElementById(`${filter}-value`);
    
    slider.addEventListener('input', function() {
        let unit = filter === 'hue-rotate' ? 'deg' : 
                  filter === 'blur' ? 'px' : '%';
        value.textContent = this.value + unit;
        applyFilters();
        
        // 取消预设的选中状态
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.classList.remove('active');
        });
    });
});

// 应用滤镜
function applyFilters() {
    const brightness = document.getElementById('brightness').value;
    const contrast = document.getElementById('contrast').value;
    const saturate = document.getElementById('saturate').value;
    const hueRotate = document.getElementById('hue-rotate').value;
    const blur = document.getElementById('blur').value;
    
    previewImage.style.filter = `
        brightness(${brightness}%)
        contrast(${contrast}%)
        saturate(${saturate}%)
        hue-rotate(${hueRotate}deg)
        blur(${blur}px)
    `;
}

// 预设滤镜点击事件
document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const preset = presets[this.dataset.preset];
        
        // 更新所有滤镜值
        for (let filter in preset) {
            const slider = document.getElementById(filter);
            const value = document.getElementById(`${filter}-value`);
            slider.value = preset[filter];
            
            let unit = filter === 'hue-rotate' ? 'deg' : 
                      filter === 'blur' ? 'px' : '%';
            value.textContent = preset[filter] + unit;
        }
        
        // 应用滤镜
        applyFilters();
        
        // 更新按钮状态
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        this.classList.add('active');
    });
});

// 重置滤镜
function resetFilters() {
    const preset = presets.none;
    
    for (let filter in preset) {
        const slider = document.getElementById(filter);
        const value = document.getElementById(`${filter}-value`);
        slider.value = preset[filter];
        
        let unit = filter === 'hue-rotate' ? 'deg' : 
                  filter === 'blur' ? 'px' : '%';
        value.textContent = preset[filter] + unit;
    }
    
    applyFilters();
    
    // 更新按钮状态
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector('[data-preset="none"]').classList.add('active');
}

// 下载图片
function downloadImage() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // 设置画布尺寸为图片原始尺寸
    canvas.width = previewImage.naturalWidth;
    canvas.height = previewImage.naturalHeight;
    
    // 应用滤镜
    ctx.filter = previewImage.style.filter;
    
    // 绘制图片
    ctx.drawImage(previewImage, 0, 0);
    
    // 创建下载链接
    const link = document.createElement('a');
    link.download = 'filtered-image.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
} 
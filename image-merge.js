let imageFiles = [];
const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('file-input');
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

// 处理文件
function handleFiles(files) {
    const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    
    [...files].forEach(file => {
        if (imageTypes.includes(file.type)) {
            imageFiles.push(file);
            displayImage(file);
        }
    });
    
    updateMergeButton();
}

// 显示预览图
function displayImage(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const div = document.createElement('div');
        div.className = 'image-item';
        div.innerHTML = `
            <img src="${e.target.result}">
            <button class="remove-btn" onclick="removeImage(this)">
                <i class="fas fa-times"></i>
            </button>
        `;
        dropArea.appendChild(div);
    }
    reader.readAsDataURL(file);
}

// 移除图片
function removeImage(btn) {
    const item = btn.parentElement;
    const index = Array.from(item.parentNode.children).indexOf(item);
    imageFiles.splice(index - 1, 1); // -1 是因为还有提示文本元素
    item.remove();
    updateMergeButton();
}

// 更新合并按钮状态
function updateMergeButton() {
    mergeBtn.disabled = imageFiles.length < 2;
}

// 合并图片
function mergeImages() {
    const direction = document.getElementById('merge-direction').value;
    const gap = parseInt(document.getElementById('merge-gap').value) || 0;
    const bgColor = document.getElementById('merge-bg').value;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // 加载所有图片
    Promise.all(imageFiles.map(file => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.src = URL.createObjectURL(file);
        });
    })).then(images => {
        // 计算画布尺寸
        let totalWidth = 0;
        let totalHeight = 0;
        let maxWidth = 0;
        let maxHeight = 0;
        
        images.forEach(img => {
            if (direction === 'horizontal') {
                totalWidth += img.width;
                maxHeight = Math.max(maxHeight, img.height);
            } else {
                totalHeight += img.height;
                maxWidth = Math.max(maxWidth, img.width);
            }
        });
        
        // 添加间距
        if (direction === 'horizontal') {
            totalWidth += gap * (images.length - 1);
            canvas.width = totalWidth;
            canvas.height = maxHeight;
        } else {
            totalHeight += gap * (images.length - 1);
            canvas.width = maxWidth;
            canvas.height = totalHeight;
        }
        
        // 设置背景色
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 绘制图片
        let x = 0;
        let y = 0;
        
        images.forEach((img, index) => {
            if (direction === 'horizontal') {
                ctx.drawImage(img, x, (maxHeight - img.height) / 2);
                x += img.width + gap;
            } else {
                ctx.drawImage(img, (maxWidth - img.width) / 2, y);
                y += img.height + gap;
            }
        });
        
        // 下载合并后的图片
        const link = document.createElement('a');
        link.download = 'merged-image.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
} 
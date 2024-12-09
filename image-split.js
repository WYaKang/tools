let currentImage = null;
const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('file-input');
const previewImage = document.getElementById('preview-image');
const splitBtn = document.getElementById('split-btn');
const resultArea = document.getElementById('result-area');

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
                splitBtn.disabled = false;
                updatePreviewGrid();
            };
            currentImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

// 更新预览网格
function updatePreviewGrid() {
    const cols = parseInt(document.getElementById('split-cols').value);
    const rows = parseInt(document.getElementById('split-rows').value);
    
    // 移除旧的网格线
    const oldGrid = document.querySelector('.split-grid');
    if (oldGrid) oldGrid.remove();
    
    // 创建新的网格线
    const grid = document.createElement('div');
    grid.className = 'split-grid';
    
    // 添加垂直线
    for (let i = 1; i < cols; i++) {
        const line = document.createElement('div');
        line.className = 'split-grid-line split-grid-line-vertical';
        line.style.left = `${(i / cols * 100)}%`;
        grid.appendChild(line);
    }
    
    // 添加水平线
    for (let i = 1; i < rows; i++) {
        const line = document.createElement('div');
        line.className = 'split-grid-line split-grid-line-horizontal';
        line.style.top = `${(i / rows * 100)}%`;
        grid.appendChild(line);
    }
    
    previewImage.parentElement.appendChild(grid);
}

// 监听分割参数变化
document.getElementById('split-cols').addEventListener('change', updatePreviewGrid);
document.getElementById('split-rows').addEventListener('change', updatePreviewGrid);

// 分割图片
function splitImage() {
    if (!currentImage) return;
    
    const cols = parseInt(document.getElementById('split-cols').value);
    const rows = parseInt(document.getElementById('split-rows').value);
    const format = document.getElementById('output-format').value;
    
    const pieceWidth = currentImage.width / cols;
    const pieceHeight = currentImage.height / rows;
    
    resultArea.style.display = 'grid';
    resultArea.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    resultArea.innerHTML = '';
    
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const canvas = document.createElement('canvas');
            canvas.width = pieceWidth;
            canvas.height = pieceHeight;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(currentImage,
                col * pieceWidth, row * pieceHeight,
                pieceWidth, pieceHeight,
                0, 0,
                pieceWidth, pieceHeight
            );
            
            const piece = document.createElement('div');
            piece.className = 'split-piece';
            
            const img = new Image();
            img.src = canvas.toDataURL(`image/${format}`);
            
            const downloadBtn = document.createElement('a');
            downloadBtn.className = 'btn btn-sm btn-primary mt-2';
            downloadBtn.innerHTML = '<i class="fas fa-download"></i> 下载';
            downloadBtn.href = img.src;
            downloadBtn.download = `piece_${row + 1}_${col + 1}.${format}`;
            
            piece.appendChild(img);
            piece.appendChild(downloadBtn);
            resultArea.appendChild(piece);
        }
    }
    
    // 添加打包下载按钮
    const zipBtn = document.createElement('button');
    zipBtn.className = 'btn btn-success mt-3';
    zipBtn.innerHTML = '<i class="fas fa-file-archive me-2"></i>打���下载所有图片';
    zipBtn.onclick = () => downloadAll(format);
    
    const btnContainer = document.createElement('div');
    btnContainer.className = 'text-center';
    btnContainer.style.gridColumn = `1 / ${cols + 1}`;
    btnContainer.appendChild(zipBtn);
    
    resultArea.appendChild(btnContainer);
}

// 打包下载所有图片
function downloadAll(format) {
    const pieces = document.querySelectorAll('.split-piece img');
    pieces.forEach((img, index) => {
        const link = document.createElement('a');
        link.href = img.src;
        link.download = `piece_${Math.floor(index / cols) + 1}_${(index % cols) + 1}.${format}`;
        link.click();
    });
} 
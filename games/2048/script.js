// 游戏状态
let grid = [];
let score = 0;
let gameOver = false;
let moveHistory = [];
const gridSize = 4;

// 初始化游戏
function initGame() {
    // 创建网格单元格
    const gridContainer = document.getElementById('grid-container');
    gridContainer.innerHTML = '';
    
    for (let i = 0; i < gridSize * gridSize; i++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        gridContainer.appendChild(cell);
    }
    
    // 初始化游戏状态
    grid = Array(gridSize).fill().map(() => Array(gridSize).fill(0));
    score = 0;
    gameOver = false;
    moveHistory = [];
    document.getElementById('score').textContent = '0';
    document.getElementById('game-over').classList.remove('show');
    document.getElementById('undoBtn').disabled = true;
    
    // 添加两个初始数字
    addNewNumber();
    addNewNumber();
    
    // 更新显示
    updateDisplay();
}

// 添加新数字
function addNewNumber() {
    const emptyCells = [];
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (grid[i][j] === 0) {
                emptyCells.push({x: i, y: j});
            }
        }
    }
    
    if (emptyCells.length > 0) {
        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        grid[randomCell.x][randomCell.y] = Math.random() < 0.9 ? 2 : 4;
    }
}

// 更新显示
function updateDisplay() {
    const cells = document.getElementsByClassName('grid-cell');
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            const value = grid[i][j];
            const cell = cells[i * gridSize + j];
            cell.innerHTML = '';
            
            if (value !== 0) {
                const tile = document.createElement('div');
                tile.className = `tile tile-${value}`;
                tile.textContent = value;
                cell.appendChild(tile);
            }
        }
    }
}

// 移动和合并
function move(direction) {
    if (gameOver) return false;
    
    // 保存移动前的状态
    const previousState = {
        grid: grid.map(row => [...row]),
        score: score
    };
    
    let moved = false;
    const newGrid = grid.map(row => [...row]);
    
    // 根据方向处理每一行/列
    if (direction === 'left' || direction === 'right') {
        for (let i = 0; i < gridSize; i++) {
            const row = newGrid[i];
            const newRow = moveAndMergeArray(row, direction === 'left');
            if (newRow.some((val, idx) => val !== row[idx])) {
                moved = true;
                newGrid[i] = newRow;
            }
        }
    } else {
        for (let j = 0; j < gridSize; j++) {
            const column = newGrid.map(row => row[j]);
            const newColumn = moveAndMergeArray(column, direction === 'up');
            if (newColumn.some((val, idx) => val !== column[idx])) {
                moved = true;
                newColumn.forEach((val, idx) => newGrid[idx][j] = val);
            }
        }
    }
    
    if (moved) {
        grid = newGrid;
        moveHistory.push(previousState);
        document.getElementById('undoBtn').disabled = false;
        addNewNumber();
        updateDisplay();
        document.getElementById('score').textContent = score;
        
        // 检查游戏是否结束
        if (!canMove()) {
            gameOver = true;
            document.getElementById('game-over').classList.add('show');
        }
    }
    
    return moved;
}

// 移动和合并数组
function moveAndMergeArray(arr, toStart) {
    // 移除所有0
    let numbers = arr.filter(x => x !== 0);
    
    // 如果需要反转（向右或向下移动）
    if (!toStart) numbers = numbers.reverse();
    
    // 合并相同的数字
    for (let i = 0; i < numbers.length - 1; i++) {
        if (numbers[i] === numbers[i + 1]) {
            numbers[i] *= 2;
            score += numbers[i];
            numbers.splice(i + 1, 1);
        }
    }
    
    // 补充0
    while (numbers.length < gridSize) {
        numbers.push(0);
    }
    
    // 如果之前反转过，再反转回来
    if (!toStart) numbers = numbers.reverse();
    
    return numbers;
}

// 检查是否可以移动
function canMove() {
    // 检查是否有空格
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (grid[i][j] === 0) return true;
        }
    }
    
    // 检查是否有相邻的相同数字
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            const current = grid[i][j];
            // 检查右边
            if (j < gridSize - 1 && current === grid[i][j + 1]) return true;
            // 检查下边
            if (i < gridSize - 1 && current === grid[i + 1][j]) return true;
        }
    }
    
    return false;
}

// 撤销移动
function undoMove() {
    if (moveHistory.length > 0) {
        const previousState = moveHistory.pop();
        grid = previousState.grid.map(row => [...row]);
        score = previousState.score;
        gameOver = false;
        document.getElementById('game-over').classList.remove('show');
        document.getElementById('score').textContent = score;
        document.getElementById('undoBtn').disabled = moveHistory.length === 0;
        updateDisplay();
    }
}

// 键盘控制
document.addEventListener('keydown', function(event) {
    let moved = false;
    switch(event.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
            moved = move('left');
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            moved = move('right');
            break;
        case 'ArrowUp':
        case 'w':
        case 'W':
            moved = move('up');
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            moved = move('down');
            break;
    }
    
    if (moved) {
        event.preventDefault();
    }
});

// 触摸控制
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', function(event) {
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
});

document.addEventListener('touchend', function(event) {
    if (!touchStartX || !touchStartY) return;
    
    const touchEndX = event.changedTouches[0].clientX;
    const touchEndY = event.changedTouches[0].clientY;
    
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (Math.abs(deltaX) > 30) {
            if (deltaX > 0) {
                move('right');
            } else {
                move('left');
            }
        }
    } else {
        if (Math.abs(deltaY) > 30) {
            if (deltaY > 0) {
                move('down');
            } else {
                move('up');
            }
        }
    }
    
    touchStartX = 0;
    touchStartY = 0;
});

// 新游戏
function newGame() {
    initGame();
}

// 初始化游戏
initGame(); 
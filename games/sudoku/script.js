// 游戏状态
let grid = Array(9).fill().map(() => Array(9).fill(0));
let solution = Array(9).fill().map(() => Array(9).fill(0));
let notes = Array(9).fill().map(() => Array(9).fill().map(() => new Set()));
let selectedCell = null;
let isNotesMode = false;
let hintsUsed = 0;
let startTime = null;
let timerInterval = null;
let moveHistory = [];

// 难度设置
const difficulties = {
    easy: { clues: 35, name: '简单' },
    medium: { clues: 30, name: '中等' },
    hard: { clues: 25, name: '困难' },
    expert: { clues: 20, name: '专家' }
};

// 初始化游戏
function initGame() {
    const gridElement = document.getElementById('grid');
    gridElement.innerHTML = '';
    
    // 创建单元格
    for (let i = 0; i < 81; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.row = Math.floor(i / 9);
        cell.dataset.col = i % 9;
        cell.addEventListener('click', () => selectCell(cell));
        gridElement.appendChild(cell);
    }
    
    // 键盘事件
    document.addEventListener('keydown', handleKeyPress);
}

// 生成新游戏
function newGame() {
    // 停止计时器
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    // 重置状态
    grid = Array(9).fill().map(() => Array(9).fill(0));
    solution = Array(9).fill().map(() => Array(9).fill(0));
    notes = Array(9).fill().map(() => Array(9).fill().map(() => new Set()));
    selectedCell = null;
    hintsUsed = 0;
    moveHistory = [];
    document.getElementById('game-over').classList.remove('show');
    
    // 生成完整的数独解
    generateSolution();
    
    // 根据难度移除数字
    const difficulty = document.getElementById('difficulty').value;
    const numClues = difficulties[difficulty].clues;
    createPuzzle(numClues);
    
    // 开始计时
    startTime = Date.now();
    updateTimer();
    timerInterval = setInterval(updateTimer, 1000);
    
    // 更新显示
    updateDisplay();
}

// 生成完整的数独解
function generateSolution() {
    // 清空网格
    solution = Array(9).fill().map(() => Array(9).fill(0));
    
    // 填充对角线上的3个3x3方块
    for (let i = 0; i < 9; i += 3) {
        fillBox(i, i);
    }
    
    // 填充剩余单元格
    solveSudoku(solution);
}

// 填充3x3方块
function fillBox(row, col) {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    shuffle(numbers);
    
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            solution[row + i][col + j] = numbers[i * 3 + j];
        }
    }
}

// 创建谜题
function createPuzzle(numClues) {
    // 复制解决方案
    grid = solution.map(row => [...row]);
    
    // 计算要移除的单元格数量
    const cellsToRemove = 81 - numClues;
    
    // 随机移除单元格
    for (let i = 0; i < cellsToRemove; i++) {
        let row, col;
        do {
            row = Math.floor(Math.random() * 9);
            col = Math.floor(Math.random() * 9);
        } while (grid[row][col] === 0);
        
        grid[row][col] = 0;
    }
}

// 更新显示
function updateDisplay() {
    const cells = document.getElementsByClassName('cell');
    
    for (let i = 0; i < 81; i++) {
        const row = Math.floor(i / 9);
        const col = i % 9;
        const cell = cells[i];
        const value = grid[row][col];
        
        // 清除所有类
        cell.className = 'cell';
        cell.innerHTML = '';
        
        // 设置数字
        if (value !== 0) {
            cell.textContent = value;
            if (solution[row][col] === value) {
                cell.classList.add('fixed');
            }
        } else {
            // 显示笔记
            const cellNotes = notes[row][col];
            if (cellNotes.size > 0) {
                const notesElement = document.createElement('div');
                notesElement.className = 'notes';
                for (let n = 1; n <= 9; n++) {
                    const note = document.createElement('div');
                    note.className = 'note';
                    note.textContent = cellNotes.has(n) ? n : '';
                    notesElement.appendChild(note);
                }
                cell.appendChild(notesElement);
            }
        }
        
        // 高亮选中的单元格
        if (selectedCell === cell) {
            cell.classList.add('selected');
        }
        
        // 高亮相同数字
        if (selectedCell && value !== 0 && value === parseInt(selectedCell.textContent)) {
            cell.classList.add('same-number');
        }
    }
}

// 选择单元格
function selectCell(cell) {
    // 移除之前选中单元格的高亮
    if (selectedCell) {
        selectedCell.classList.remove('selected');
    }
    
    // 设置新的选中单元格
    selectedCell = cell;
    selectedCell.classList.add('selected');
    
    // 更新显示以高亮相同数字
    updateDisplay();
}

// 输入数字
function inputNumber(number) {
    if (!selectedCell || selectedCell.classList.contains('fixed')) return;
    
    const row = parseInt(selectedCell.dataset.row);
    const col = parseInt(selectedCell.dataset.col);
    
    // 保存移动历史
    moveHistory.push({
        row: row,
        col: col,
        oldValue: grid[row][col],
        oldNotes: new Set(notes[row][col]),
        wasNotesMode: isNotesMode
    });
    
    if (isNotesMode) {
        // 切换笔记
        if (notes[row][col].has(number)) {
            notes[row][col].delete(number);
        } else {
            notes[row][col].add(number);
        }
    } else {
        // 输入数字
        grid[row][col] = number;
        notes[row][col].clear();
        
        // 检查是否完成
        if (checkCompletion()) {
            gameOver();
        }
    }
    
    updateDisplay();
}

// 切换笔记模式
function toggleNotes() {
    isNotesMode = !isNotesMode;
    document.querySelector('.fa-pencil-alt').parentElement.classList.toggle('active', isNotesMode);
}

// 自动填写笔记
function autoNotes() {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (grid[row][col] === 0) {
                notes[row][col] = new Set(getPossibleNumbers(row, col));
            }
        }
    }
    updateDisplay();
}

// 清除笔记
function clearNotes() {
    notes = Array(9).fill().map(() => Array(9).fill().map(() => new Set()));
    updateDisplay();
}

// 获取可能的数字
function getPossibleNumbers(row, col) {
    const numbers = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    
    // 检查行
    for (let i = 0; i < 9; i++) {
        numbers.delete(grid[row][i]);
    }
    
    // 检查列
    for (let i = 0; i < 9; i++) {
        numbers.delete(grid[i][col]);
    }
    
    // 检查3x3方块
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            numbers.delete(grid[boxRow + i][boxCol + j]);
        }
    }
    
    return numbers;
}

// 获取提示
function getHint() {
    if (!selectedCell) return;
    
    const row = parseInt(selectedCell.dataset.row);
    const col = parseInt(selectedCell.dataset.col);
    
    if (grid[row][col] !== solution[row][col]) {
        grid[row][col] = solution[row][col];
        hintsUsed++;
        updateDisplay();
        
        // 检查是否完成
        if (checkCompletion()) {
            gameOver();
        }
    }
}

// 撤销
function undo() {
    if (moveHistory.length === 0) return;
    
    const move = moveHistory.pop();
    grid[move.row][move.col] = move.oldValue;
    notes[move.row][move.col] = new Set(move.oldNotes);
    isNotesMode = move.wasNotesMode;
    
    updateDisplay();
}

// 检查解答
function checkSolution() {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (grid[row][col] !== 0 && grid[row][col] !== solution[row][col]) {
                const cells = document.getElementsByClassName('cell');
                cells[row * 9 + col].classList.add('error');
            }
        }
    }
}

// 检查完成情况
function checkCompletion() {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (grid[row][col] !== solution[row][col]) {
                return false;
            }
        }
    }
    return true;
}

// 游戏结束
function gameOver() {
    clearInterval(timerInterval);
    
    const difficulty = document.getElementById('difficulty').value;
    document.getElementById('final-difficulty').textContent = difficulties[difficulty].name;
    document.getElementById('final-time').textContent = document.getElementById('timer').textContent;
    document.getElementById('hints-used').textContent = hintsUsed;
    
    document.getElementById('game-over').classList.add('show');
}

// 更新计时器
function updateTimer() {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
    const seconds = (elapsed % 60).toString().padStart(2, '0');
    document.getElementById('timer').textContent = `${minutes}:${seconds}`;
}

// 处理键盘输入
function handleKeyPress(event) {
    if (!selectedCell) return;
    
    if (event.key >= '1' && event.key <= '9') {
        inputNumber(parseInt(event.key));
    } else if (event.key === 'Backspace' || event.key === 'Delete') {
        eraseNumber();
    } else if (event.key === 'n') {
        toggleNotes();
    }
}

// 擦除数字
function eraseNumber() {
    if (!selectedCell || selectedCell.classList.contains('fixed')) return;
    
    const row = parseInt(selectedCell.dataset.row);
    const col = parseInt(selectedCell.dataset.col);
    
    // 保存移动历史
    moveHistory.push({
        row: row,
        col: col,
        oldValue: grid[row][col],
        oldNotes: new Set(notes[row][col]),
        wasNotesMode: isNotesMode
    });
    
    grid[row][col] = 0;
    notes[row][col].clear();
    updateDisplay();
}

// 求解数独
function solveSudoku(board) {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (board[row][col] === 0) {
                const numbers = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
                for (const num of numbers) {
                    if (isValid(board, row, col, num)) {
                        board[row][col] = num;
                        if (solveSudoku(board)) {
                            return true;
                        }
                        board[row][col] = 0;
                    }
                }
                return false;
            }
        }
    }
    return true;
}

// 检查数字是否有效
function isValid(board, row, col, num) {
    // 检查行
    for (let x = 0; x < 9; x++) {
        if (board[row][x] === num) return false;
    }
    
    // 检查列
    for (let x = 0; x < 9; x++) {
        if (board[x][col] === num) return false;
    }
    
    // 检查3x3方块
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[i + startRow][j + startCol] === num) return false;
        }
    }
    
    return true;
}

// 打乱数组
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// 自动求解
function solve() {
    grid = solution.map(row => [...row]);
    updateDisplay();
}

// 初始化游戏
initGame();
newGame(); 
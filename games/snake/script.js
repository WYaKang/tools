// 游戏状态
let snake = [];
let food = null;
let direction = 'right';
let nextDirection = 'right';
let gameLoop = null;
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let isPaused = false;
let gridSize = 20;
let canvas, ctx;

// 初始化游戏
function initGame() {
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');
    
    // 设置画布大小
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // 初始化蛇的位置
    const centerX = Math.floor(gridSize / 2);
    const centerY = Math.floor(gridSize / 2);
    snake = [
        { x: centerX, y: centerY },
        { x: centerX - 1, y: centerY },
        { x: centerX - 2, y: centerY }
    ];
    
    // 生成第一个食物
    generateFood();
    
    // 更新显示
    updateScore();
    document.getElementById('high-score').textContent = highScore;
    
    // 添加键盘事件监听
    document.addEventListener('keydown', handleKeyPress);
    
    // 监听设置变化
    document.getElementById('speed').addEventListener('input', updateSpeedDisplay);
    document.getElementById('gridLines').addEventListener('change', draw);
}

// 调整画布大小
function resizeCanvas() {
    const container = canvas.parentElement;
    const size = Math.min(container.clientWidth, container.clientHeight);
    canvas.width = size;
    canvas.height = size;
    if (gameLoop) draw(); // 如果游戏正在运行，重新绘制
}

// 开始游戏
function startGame() {
    if (gameLoop) {
        clearInterval(gameLoop);
    }
    
    // 重置游戏状态
    direction = 'right';
    nextDirection = 'right';
    score = 0;
    isPaused = false;
    
    // 初始化蛇的位置
    const centerX = Math.floor(gridSize / 2);
    const centerY = Math.floor(gridSize / 2);
    snake = [
        { x: centerX, y: centerY },
        { x: centerX - 1, y: centerY },
        { x: centerX - 2, y: centerY }
    ];
    
    // 生成新的食物
    generateFood();
    
    // 更新显示
    updateScore();
    document.getElementById('game-over').classList.remove('show');
    
    // 设置游戏循环
    const speed = document.getElementById('speed').value;
    const interval = 1000 / speed;
    gameLoop = setInterval(gameStep, interval);
    
    // 更新按钮状态
    document.getElementById('pauseBtn').disabled = false;
}

// 暂停游戏
function pauseGame() {
    if (!gameLoop) return;
    
    if (isPaused) {
        // 继续游戏
        const speed = document.getElementById('speed').value;
        const interval = 1000 / speed;
        gameLoop = setInterval(gameStep, interval);
        document.getElementById('pauseBtn').innerHTML = '<i class="fas fa-pause me-2"></i>暂停';
    } else {
        // 暂停游戏
        clearInterval(gameLoop);
        gameLoop = null;
        document.getElementById('pauseBtn').innerHTML = '<i class="fas fa-play me-2"></i>继续';
    }
    
    isPaused = !isPaused;
}

// 游戏步进
function gameStep() {
    // 更新方向
    direction = nextDirection;
    
    // 获取蛇头位置
    const head = { ...snake[0] };
    
    // 根据方向移动蛇头
    switch (direction) {
        case 'up': head.y--; break;
        case 'down': head.y++; break;
        case 'left': head.x--; break;
        case 'right': head.x++; break;
    }
    
    // 检查墙壁碰撞
    if (document.getElementById('wallCollision').checked) {
        if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
            gameOver();
            return;
        }
    } else {
        // 穿墙
        head.x = (head.x + gridSize) % gridSize;
        head.y = (head.y + gridSize) % gridSize;
    }
    
    // 检查自身碰撞
    if (document.getElementById('selfCollision').checked) {
        for (let segment of snake) {
            if (segment.x === head.x && segment.y === head.y) {
                gameOver();
                return;
            }
        }
    }
    
    // 在蛇头位置添加新节点
    snake.unshift(head);
    
    // 检查是否吃到食物
    if (head.x === food.x && head.y === food.y) {
        // 增加分数
        score += 10;
        updateScore();
        
        // 生成新的食物
        generateFood();
        
        // 不删除尾部，让蛇变长
    } else {
        // 没吃到食物，删除尾部
        snake.pop();
    }
    
    // 重新绘制
    draw();
}

// 生成食物
function generateFood() {
    while (true) {
        food = {
            x: Math.floor(Math.random() * gridSize),
            y: Math.floor(Math.random() * gridSize)
        };
        
        // 确保食物不会生成在蛇身上
        let onSnake = false;
        for (let segment of snake) {
            if (segment.x === food.x && segment.y === food.y) {
                onSnake = true;
                break;
            }
        }
        
        if (!onSnake) break;
    }
}

// 绘制游戏画面
function draw() {
    const cellSize = canvas.width / gridSize;
    
    // 清空画布
    ctx.fillStyle = '#4a9e5c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制网格
    if (document.getElementById('gridLines').checked) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        
        for (let i = 1; i < gridSize; i++) {
            const pos = i * cellSize;
            
            // 垂直线
            ctx.beginPath();
            ctx.moveTo(pos, 0);
            ctx.lineTo(pos, canvas.height);
            ctx.stroke();
            
            // 水平线
            ctx.beginPath();
            ctx.moveTo(0, pos);
            ctx.lineTo(canvas.width, pos);
            ctx.stroke();
        }
    }
    
    // 绘制食物
    ctx.fillStyle = '#ff4757';
    ctx.beginPath();
    ctx.arc(
        (food.x + 0.5) * cellSize,
        (food.y + 0.5) * cellSize,
        cellSize * 0.4,
        0,
        Math.PI * 2
    );
    ctx.fill();
    
    // 绘制蛇
    snake.forEach((segment, index) => {
        // 为蛇身设置渐变色
        const hue = (120 + index * 2) % 360;
        ctx.fillStyle = `hsl(${hue}, 70%, 50%)`;
        
        // 绘制圆角矩形
        roundRect(
            ctx,
            segment.x * cellSize + 1,
            segment.y * cellSize + 1,
            cellSize - 2,
            cellSize - 2,
            cellSize * 0.3
        );
    });
    
    // 绘制蛇眼睛
    if (snake.length > 0) {
        const head = snake[0];
        const eyeSize = cellSize * 0.15;
        const eyeOffset = cellSize * 0.2;
        ctx.fillStyle = 'white';
        
        // 根据方向调整眼睛位置
        let eyeX1, eyeY1, eyeX2, eyeY2;
        switch (direction) {
            case 'up':
                eyeX1 = head.x * cellSize + cellSize * 0.3;
                eyeY1 = head.y * cellSize + cellSize * 0.3;
                eyeX2 = head.x * cellSize + cellSize * 0.7;
                eyeY2 = head.y * cellSize + cellSize * 0.3;
                break;
            case 'down':
                eyeX1 = head.x * cellSize + cellSize * 0.3;
                eyeY1 = head.y * cellSize + cellSize * 0.7;
                eyeX2 = head.x * cellSize + cellSize * 0.7;
                eyeY2 = head.y * cellSize + cellSize * 0.7;
                break;
            case 'left':
                eyeX1 = head.x * cellSize + cellSize * 0.3;
                eyeY1 = head.y * cellSize + cellSize * 0.3;
                eyeX2 = head.x * cellSize + cellSize * 0.3;
                eyeY2 = head.y * cellSize + cellSize * 0.7;
                break;
            case 'right':
                eyeX1 = head.x * cellSize + cellSize * 0.7;
                eyeY1 = head.y * cellSize + cellSize * 0.3;
                eyeX2 = head.x * cellSize + cellSize * 0.7;
                eyeY2 = head.y * cellSize + cellSize * 0.7;
                break;
        }
        
        ctx.beginPath();
        ctx.arc(eyeX1, eyeY1, eyeSize, 0, Math.PI * 2);
        ctx.arc(eyeX2, eyeY2, eyeSize, 0, Math.PI * 2);
        ctx.fill();
    }
}

// 绘制圆角矩形
function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
    ctx.fill();
}

// 处理键盘输入
function handleKeyPress(event) {
    // 如果游戏暂停，只响应空格键
    if (isPaused && event.code !== 'Space') return;
    
    switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
            if (direction !== 'down') nextDirection = 'up';
            break;
        case 'ArrowDown':
        case 'KeyS':
            if (direction !== 'up') nextDirection = 'down';
            break;
        case 'ArrowLeft':
        case 'KeyA':
            if (direction !== 'right') nextDirection = 'left';
            break;
        case 'ArrowRight':
        case 'KeyD':
            if (direction !== 'left') nextDirection = 'right';
            break;
        case 'Space':
            if (gameLoop) pauseGame();
            break;
    }
}

// 处理移动端控制
function handleMobileControl(dir) {
    if (isPaused) return;
    
    switch (dir) {
        case 'up':
            if (direction !== 'down') nextDirection = 'up';
            break;
        case 'down':
            if (direction !== 'up') nextDirection = 'down';
            break;
        case 'left':
            if (direction !== 'right') nextDirection = 'left';
            break;
        case 'right':
            if (direction !== 'left') nextDirection = 'right';
            break;
    }
}

// 更新分数显示
function updateScore() {
    document.getElementById('score').textContent = score;
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
        document.getElementById('high-score').textContent = highScore;
    }
}

// 更新速度显示
function updateSpeedDisplay() {
    const speed = document.getElementById('speed').value;
    document.getElementById('speed-value').textContent = speed;
    
    // 如果游戏正在运行，更新游戏速度
    if (gameLoop && !isPaused) {
        clearInterval(gameLoop);
        const interval = 1000 / speed;
        gameLoop = setInterval(gameStep, interval);
    }
}

// 游戏结束
function gameOver() {
    clearInterval(gameLoop);
    gameLoop = null;
    document.getElementById('pauseBtn').disabled = true;
    
    // 更新最终分数
    document.getElementById('final-score').textContent = score;
    document.getElementById('final-high-score').textContent = highScore;
    
    // 显示游戏结束界面
    document.getElementById('game-over').classList.add('show');
}

// 初始化游戏
initGame(); 
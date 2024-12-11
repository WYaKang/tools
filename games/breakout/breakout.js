// 游戏配置
const config = {
    paddleHeight: 10,
    paddleWidth: 75,
    ballRadius: 5,
    brickRowCount: 5,
    brickColumnCount: 8,
    brickWidth: 50,
    brickHeight: 20,
    brickPadding: 5,
    brickOffsetTop: 30,
    brickOffsetLeft: 30,
    ballSpeed: 3,
    paddleSpeed: 7
};

// 游戏状态
let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");
let score = 0;
let lives = 3;
let level = 1;
let gameStarted = false;
let gamePaused = false;
let rightPressed = false;
let leftPressed = false;
let paddleX = (canvas.width - config.paddleWidth) / 2;
let ballX = canvas.width / 2;
let ballY = canvas.height - 30;
let ballDX = config.ballSpeed;
let ballDY = -config.ballSpeed;
let bricks = [];

// 初始化砖块
function initBricks() {
    for(let c = 0; c < config.brickColumnCount; c++) {
        bricks[c] = [];
        for(let r = 0; r < config.brickRowCount; r++) {
            const brickX = c * (config.brickWidth + config.brickPadding) + config.brickOffsetLeft;
            const brickY = r * (config.brickHeight + config.brickPadding) + config.brickOffsetTop;
            bricks[c][r] = { 
                x: brickX, 
                y: brickY, 
                status: 1,
                color: getBrickColor(r),
                points: getBrickPoints(r)
            };
        }
    }
}

// 获取砖块颜色和分数
function getBrickColor(row) {
    const colors = ["#f00", "#ff0", "#0f0", "#00f", "#f0f"];
    return colors[row];
}

function getBrickPoints(row) {
    const points = [50, 40, 30, 20, 10];
    return points[row];
}

// 键盘事件处理
document.addEventListener("keydown", function(e) {
    if(e.key === "Right" || e.key === "ArrowRight" || e.key === "d") {
        rightPressed = true;
    }
    else if(e.key === "Left" || e.key === "ArrowLeft" || e.key === "a") {
        leftPressed = true;
    }
    else if(e.key === " ") {
        if(gameStarted) {
            pauseGame();
        }
    }
});

document.addEventListener("keyup", function(e) {
    if(e.key === "Right" || e.key === "ArrowRight" || e.key === "d") {
        rightPressed = false;
    }
    else if(e.key === "Left" || e.key === "ArrowLeft" || e.key === "a") {
        leftPressed = false;
    }
});

// 碰撞检测
function collisionDetection() {
    for(let c = 0; c < config.brickColumnCount; c++) {
        for(let r = 0; r < config.brickRowCount; r++) {
            let b = bricks[c][r];
            if(b.status === 1) {
                if(ballX > b.x && ballX < b.x + config.brickWidth && 
                   ballY > b.y && ballY < b.y + config.brickHeight) {
                    ballDY = -ballDY;
                    b.status = 0;
                    score += b.points;
                    document.getElementById("score").textContent = score;
                    
                    if(checkLevelComplete()) {
                        levelUp();
                    }
                    return true;
                }
            }
        }
    }
    return false;
}

// 检查是否过关
function checkLevelComplete() {
    for(let c = 0; c < config.brickColumnCount; c++) {
        for(let r = 0; r < config.brickRowCount; r++) {
            if(bricks[c][r].status === 1) {
                return false;
            }
        }
    }
    return true;
}

// 关卡升级
function levelUp() {
    level++;
    document.getElementById("level").textContent = level;
    config.ballSpeed += 0.5;
    ballDX = ballDX > 0 ? config.ballSpeed : -config.ballSpeed;
    ballDY = -config.ballSpeed;
    initBricks();
}

// 绘制小球
function drawBall() {
    ctx.beginPath();
    ctx.arc(ballX, ballY, config.ballRadius, 0, Math.PI*2);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}

// 绘制挡板
function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - config.paddleHeight, config.paddleWidth, config.paddleHeight);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}

// 绘制砖块
function drawBricks() {
    for(let c = 0; c < config.brickColumnCount; c++) {
        for(let r = 0; r < config.brickRowCount; r++) {
            if(bricks[c][r].status === 1) {
                ctx.beginPath();
                ctx.rect(bricks[c][r].x, bricks[c][r].y, config.brickWidth, config.brickHeight);
                ctx.fillStyle = bricks[c][r].color;
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

// 游戏主循环
function draw() {
    if(!gameStarted || gamePaused) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawBricks();
    drawBall();
    drawPaddle();
    
    // 碰撞检测
    let collision = collisionDetection();
    
    // 墙壁碰撞检测
    if(ballX + ballDX > canvas.width - config.ballRadius || ballX + ballDX < config.ballRadius) {
        ballDX = -ballDX;
    }
    if(ballY + ballDY < config.ballRadius) {
        ballDY = -ballDY;
    } else if(ballY + ballDY > canvas.height - config.ballRadius) {
        if(ballX > paddleX && ballX < paddleX + config.paddleWidth) {
            let hitPos = (ballX - paddleX) / config.paddleWidth;
            ballDX = config.ballSpeed * (hitPos - 0.5) * 2;
            ballDY = -ballDY;
        } else {
            lives--;
            document.getElementById("lives").textContent = lives;
            if(lives === 0) {
                gameOver();
                return;
            } else {
                ballX = canvas.width/2;
                ballY = canvas.height-30;
                ballDX = config.ballSpeed;
                ballDY = -config.ballSpeed;
                paddleX = (canvas.width-config.paddleWidth)/2;
            }
        }
    }
    
    // 更新挡板位置
    if(rightPressed && paddleX < canvas.width - config.paddleWidth) {
        paddleX += config.paddleSpeed;
    }
    else if(leftPressed && paddleX > 0) {
        paddleX -= config.paddleSpeed;
    }
    
    // 只有在没有碰撞的情况下才更新小球位置
    if(!collision) {
        ballX += ballDX;
        ballY += ballDY;
    }
    
    requestAnimationFrame(draw);
}

// 开始游戏
function startGame() {
    if(!gameStarted) {
        gameStarted = true;
        score = 0;
        lives = 3;
        level = 1;
        document.getElementById("score").textContent = score;
        document.getElementById("lives").textContent = lives;
        document.getElementById("level").textContent = level;
        initBricks();
        draw();
    }
}

// 暂停游戏
function pauseGame() {
    gamePaused = !gamePaused;
    if(!gamePaused) {
        draw();
    }
}

// 游戏结束
function gameOver() {
    gameStarted = false;
    alert("游戏结束！\n得分：" + score + "\n关卡：" + level);
}

// 初始化游戏
window.onload = function() {
    initBricks();
    document.getElementById("startBtn").onclick = startGame;
    document.getElementById("pauseBtn").onclick = pauseGame;
    document.getElementById("helpBtn").onclick = function() {
        alert("游戏说明：\n\n" +
              "1. 使用左右方向键或A/D键移动挡板\n" +
              "2. 空格键可以暂停/继续游戏\n" +
              "3. 不同颜色的砖块有不同分数\n" +
              "4. 击碎所有砖块即可进入下一关\n" +
              "5. 小球落地则失去一条生命");
    };
};
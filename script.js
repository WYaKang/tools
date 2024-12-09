let currentSection = 'stopwatch';
let stopwatchInterval;
let countdownInterval;
let stopwatchRunning = false;
let countdownRunning = false;
let startTime;
let laps = [];
let clocks = [{
    timezone: 'Asia/Shanghai',
    name: '北京'
}];

// 添加更多时区选项
const availableTimezones = [
    { timezone: 'Asia/Shanghai', name: '北京', offset: '+8:00' },
    { timezone: 'America/New_York', name: '纽约', offset: '-5:00' },
    { timezone: 'Europe/London', name: '伦敦', offset: '+0:00' },
    { timezone: 'Asia/Tokyo', name: '东京', offset: '+9:00' },
    { timezone: 'Australia/Sydney', name: '悉尼', offset: '+10:00' },
    { timezone: 'Europe/Paris', name: '巴黎', offset: '+1:00' },
    { timezone: 'Asia/Singapore', name: '新加坡', offset: '+8:00' },
    { timezone: 'Asia/Dubai', name: '迪拜', offset: '+4:00' },
    { timezone: 'Europe/Moscow', name: '莫斯科', offset: '+3:00' },
    { timezone: 'Asia/Seoul', name: '首尔', offset: '+9:00' },
    { timezone: 'America/Los_Angeles', name: '洛杉矶', offset: '-8:00' },
    { timezone: 'America/Chicago', name: '芝加哥', offset: '-6:00' },
    { timezone: 'Asia/Bangkok', name: '曼谷', offset: '+7:00' },
    { timezone: 'Europe/Berlin', name: '柏林', offset: '+1:00' },
    { timezone: 'Europe/Rome', name: '罗马', offset: '+1:00' },
    { timezone: 'Asia/Hong_Kong', name: '香港', offset: '+8:00' },
    { timezone: 'Asia/Taipei', name: '台北', offset: '+8:00' },
    { timezone: 'Pacific/Auckland', name: '奥克兰', offset: '+12:00' },
    { timezone: 'America/Toronto', name: '多伦多', offset: '-5:00' },
    { timezone: 'Europe/Amsterdam', name: '阿姆斯特丹', offset: '+1:00' }
];

// 添加全局变量
let customEpoch = new Date('1970-01-01T00:00:00.000Z');

// 切换显示区域
function showSection(section) {
    // 更新显示状态
    document.querySelectorAll('.time-section').forEach(el => el.style.display = 'none');
    document.getElementById(section).style.display = 'block';
    
    // 更新按钮状态
    document.querySelectorAll('.nav-link').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[onclick="showSection('${section}')"]`).classList.add('active');
    
    currentSection = section;
}

// 正计时功能
function startStopwatch() {
    if (!stopwatchRunning) {
        startTime = Date.now() - (laps.length > 0 ? laps.reduce((a, b) => a + b, 0) : 0);
        stopwatchInterval = setInterval(updateStopwatch, 10);
        stopwatchRunning = true;
    } else {
        recordLap();
    }
}

function updateStopwatch() {
    const elapsed = Date.now() - startTime;
    document.querySelector('#stopwatch .display').textContent = formatTime(elapsed);
}

function recordLap() {
    const elapsed = Date.now() - startTime;
    const lapTime = elapsed - (laps.length > 0 ? laps.reduce((a, b) => a + b, 0) : 0);
    laps.push(lapTime);
    updateLaps();
}

function updateLaps() {
    const lapsDiv = document.querySelector('.laps');
    let totalTime = 0;
    // 创建时数组存储所有记录
    const lapRecords = laps.map((lap, i) => {
        totalTime += lap;
        return {
            lap: lap,
            total: totalTime,
            index: i + 1
        };
    });
    
    // 反转数组顺序并生成 HTML
    lapsDiv.innerHTML = lapRecords.reverse().map(record => {
        return `<div>
            <span>第 ${record.index} 段: ${formatTime(record.lap)}</span>
            &nbsp;&nbsp;&nbsp;<span>总计: ${formatTime(record.total)}</span>
        </div>`;
    }).join('');
}

function stopStopwatch() {
    if (stopwatchRunning) {
        recordLap(); // 在停止时记录最后一段
        clearInterval(stopwatchInterval);
        stopwatchRunning = false;
        document.getElementById('reset-stopwatch').style.display = 'block';
    }
}

function resetStopwatch() {
    clearInterval(stopwatchInterval);
    stopwatchRunning = false;
    laps = [];
    document.querySelector('#stopwatch .display').textContent = '00:00:00.000';
    document.querySelector('.laps').innerHTML = '';
    document.getElementById('reset-stopwatch').style.display = 'none';
}

// 倒计时功能
function startCountdown() {
    if (!countdownRunning) {
        const hours = parseInt(document.getElementById('hours').value) || 0;
        const minutes = parseInt(document.getElementById('minutes').value) || 0;
        const seconds = parseInt(document.getElementById('seconds').value) || 0;
        const milliseconds = parseInt(document.getElementById('milliseconds').value) || 0;
        
        let totalTime = (hours * 3600 + minutes * 60 + seconds) * 1000 + milliseconds;
        
        if (totalTime <= 0) return;
        
        const endTime = Date.now() + totalTime;
        countdownInterval = setInterval(() => {
            const remaining = endTime - Date.now();
            if (remaining <= 0) {
                clearInterval(countdownInterval);
                document.querySelector('#countdown .display').textContent = '00:00:00.000';
                countdownRunning = false;
                document.getElementById('reset-countdown').style.display = 'block';
                return;
            }
            document.querySelector('#countdown .display').textContent = formatTime(remaining);
        }, 10);
        
        countdownRunning = true;
        document.getElementById('reset-countdown').style.display = 'block';
    } else {
        clearInterval(countdownInterval);
        countdownRunning = false;
    }
}

// 世界时钟功能
function updateWorldClocks() {
    const container = document.querySelector('.clock-container');
    
    // 只在时钟数量变化时重建容器
    if (container.children.length !== clocks.length + 1) { // +1 是因为添加按钮
        container.innerHTML = '';
        
        // 添加时区选择按钮
        const addButtonContainer = document.createElement('div');
        addButtonContainer.className = 'add-clock text-center w-100 mb-4';
        addButtonContainer.innerHTML = clocks.length < 6 ? 
            '<button class="btn btn-success" onclick="showTimezoneSelector()"><i class="fas fa-plus"></i> 添加时区</button>' : '';
        container.appendChild(addButtonContainer);
        
        // 创建时钟元素
        clocks.forEach((clock, index) => {
            const clockElement = document.createElement('div');
            clockElement.className = 'clock card';
            clockElement.innerHTML = `
                ${clocks.length > 1 ? 
                    `<button class="btn btn-link text-danger position-absolute top-0 end-0" onclick="deleteClock(${index})">
                        <i class="fas fa-times"></i>
                    </button>` : ''
                }
                <div class="card-body">
                    <h5 class="card-title">${clock.name}</h5>
                    <div class="analog-clock"></div>
                    <div class="digital-time mt-3"></div>
                </div>
            `;
            
            // 创建时钟刻度和指针
            const analogClock = clockElement.querySelector('.analog-clock');
            for (let i = 1; i <= 12; i++) {
                const mark = document.createElement('div');
                mark.className = 'clock-mark';
                mark.style.transform = `rotate(${i * 30}deg)`;
                analogClock.appendChild(mark);
            }
            
            ['hour', 'minute', 'second'].forEach(hand => {
                const handElement = document.createElement('div');
                handElement.className = `hand ${hand}`;
                analogClock.appendChild(handElement);
            });
            
            container.appendChild(clockElement);
        });
    }
    
    // 更新时间显示
    clocks.forEach((clock, index) => {
        const clockElement = container.children[index + 1]; // +1 过添加按钮
        const digitalTime = clockElement.querySelector('.digital-time');
        const now = new Date();
        
        // 获取目标时区的完整时间信息
        const options = {
            timeZone: clock.timezone,
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        };
        
        const timeString = now.toLocaleString('zh-CN', options);
        const timeZoneString = `UTC${clock.offset}`;
        
        // 更新显示
        digitalTime.innerHTML = `
            <div class="date-info">${timeString.split(' ')[0]}</div>
            <div class="time-info">
                ${timeString.split(' ')[1]}
                <span class="timezone">${timeZoneString}</span>
            </div>
        `;
        
        updateClockHands(clockElement.querySelector('.analog-clock'), clock.timezone);
    });
}

function addClock() {
    if (clocks.length >= 6) return;
    
    const timezones = [
        { timezone: 'America/New_York', name: '纽约' },
        { timezone: 'Europe/London', name: '伦敦' },
        { timezone: 'Asia/Tokyo', name: '东京' },
        { timezone: 'Australia/Sydney', name: '尼' }
    ];
    
    const available = timezones.filter(tz => 
        !clocks.some(clock => clock.timezone === tz.timezone)
    );
    
    if (available.length > 0) {
        clocks.push(available[0]);
        updateWorldClocks();
    }
}

function deleteClock(index) {
    if (clocks.length > 1) {
        clocks.splice(index, 1);
        updateWorldClocks();
    }
}

// 辅助函数
function formatTime(ms) {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = ms % 1000;
    
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${pad(milliseconds, 3)}`;
}

function pad(num, length = 2) {
    return String(num).padStart(length, '0');
}

// 事件监听
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        if (currentSection === 'stopwatch') {
            startStopwatch();
        } else if (currentSection === 'countdown') {
            startCountdown();
        }
    } else if (e.code === 'Enter' && currentSection === 'stopwatch') {
        stopStopwatch();
    }
});

document.getElementById('reset-stopwatch').addEventListener('click', resetStopwatch);
document.getElementById('reset-countdown').addEventListener('click', () => {
    clearInterval(countdownInterval);
    countdownRunning = false;
    document.querySelector('#countdown .display').textContent = '00:00:00.000';
    document.getElementById('reset-countdown').style.display = 'none';
    // 清空输入框
    document.getElementById('hours').value = '';
    document.getElementById('minutes').value = '';
    document.getElementById('seconds').value = '';
    document.getElementById('milliseconds').value = '';
});

// 初始化世界时钟
setInterval(updateWorldClocks, 1000);
updateWorldClocks();

// 添加选择时区的函数
function showTimezoneSelector() {
    const available = availableTimezones.filter(tz => 
        !clocks.some(clock => clock.timezone === tz.timezone)
    );
    
    if (available.length > 0) {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'timezoneModal';
        modal.innerHTML = `
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">选择时区</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="timezone-grid">
                            ${available.map(tz => `
                                <div class="timezone-item" data-timezone="${tz.timezone}" data-name="${tz.name}">
                                    <div class="timezone-name">${tz.name}</div>
                                    <div class="timezone-offset">UTC${tz.offset}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 初始化 Bootstrap modal
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();
        
        // 添加点击事件
        modal.querySelectorAll('.timezone-item').forEach(item => {
            item.addEventListener('click', () => {
                const timezone = item.dataset.timezone;
                const name = item.dataset.name;
                clocks.push({ timezone, name });
                updateWorldClocks();
                modalInstance.hide();
                modal.addEventListener('hidden.bs.modal', () => {
                    modal.remove();
                });
            });
        });
    }
}

// 添加 updateClockHands 函数
function updateClockHands(clockElement, timezone) {
    const now = new Date();
    const localTime = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
    
    const hours = localTime.getHours() % 12;
    const minutes = localTime.getMinutes();
    const seconds = localTime.getSeconds();
    const milliseconds = localTime.getMilliseconds();
    
    const hourDeg = (hours + minutes / 60) * 30;
    const minuteDeg = (minutes + seconds / 60) * 6;
    const secondDeg = (seconds + milliseconds / 1000) * 6;
    
    const hourHand = clockElement.querySelector('.hour');
    const minuteHand = clockElement.querySelector('.minute');
    const secondHand = clockElement.querySelector('.second');
    
    // 只在值变化时更新，减少不必要的重绘
    if (hourHand.dataset.deg !== hourDeg.toString()) {
        hourHand.style.transform = `rotate(${hourDeg}deg)`;
        hourHand.dataset.deg = hourDeg;
    }
    
    if (minuteHand.dataset.deg !== minuteDeg.toString()) {
        minuteHand.style.transform = `rotate(${minuteDeg}deg)`;
        minuteHand.dataset.deg = minuteDeg;
    }
    
    if (secondHand.dataset.deg !== secondDeg.toString()) {
        secondHand.style.transform = `rotate(${secondDeg}deg)`;
        secondHand.dataset.deg = secondDeg;
    }
}

// 确保在页面加载时初始化时钟更新
document.addEventListener('DOMContentLoaded', () => {
    // 正计时按钮事件
    document.getElementById('start-stopwatch').addEventListener('click', startStopwatch);
    document.getElementById('stop-stopwatch').addEventListener('click', stopStopwatch);
    document.getElementById('reset-stopwatch').addEventListener('click', resetStopwatch);

    // 倒计时按钮事件
    document.getElementById('start-countdown').addEventListener('click', startCountdown);
    document.getElementById('reset-countdown').addEventListener('click', () => {
        clearInterval(countdownInterval);
        countdownRunning = false;
        document.querySelector('#countdown .display').textContent = '00:00:00.000';
        // 清空输入框
        document.getElementById('hours').value = '';
        document.getElementById('minutes').value = '';
        document.getElementById('seconds').value = '';
        document.getElementById('milliseconds').value = '';
    });

    // 初始化世界时钟更新
    setInterval(() => {
        if (currentSection === 'worldclock') {
            const clockElements = document.querySelectorAll('.analog-clock');
            clockElements.forEach((clock, index) => {
                updateClockHands(clock, clocks[index].timezone);
            });
        }
    }, 1000);

    // 添加当前时间戳的自动更新
    if (document.getElementById('timestamp')) {
        updateCurrentTimestamp(); // 立即更新一次
        setInterval(updateCurrentTimestamp, 1000); // 每秒更新
    }
});

// 修改时钟样式相关的 CSS

// 在现有代码前面添加时间戳转换相关函数
function convertTimestamp() {
    const timestamp = document.getElementById('timestamp-input').value;
    const resultDiv = document.getElementById('timestamp-result');
    
    if (!timestamp) {
        resultDiv.innerHTML = '<span class="text-danger">请输入时间戳</span>';
        return;
    }
    
    try {
        const date = new Date(parseInt(timestamp) + customEpoch.getTime());
        if (isNaN(date.getTime())) {
            throw new Error('无效的时间戳');
        }
        
        // 获取本地时间的完整格式（包含星期）
        const localTimeOptions = {
            weekday: 'long',
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        };
        
        const result = `UTC时间：${date.toUTCString()}
ISO格式：${date.toISOString()}
本地时间：${date.toLocaleString('zh-CN', localTimeOptions)}`;
        
        resultDiv.innerHTML = result;
    } catch (error) {
        resultDiv.innerHTML = `<span class="text-danger">${error.message}</span>`;
    }
}

function convertDatetime() {
    const datetimeInput = document.getElementById('datetime-input').value;
    const resultDiv = document.getElementById('datetime-result');
    
    if (!datetimeInput) {
        resultDiv.innerHTML = '<span class="text-danger">请选择时间</span>';
        return;
    }
    
    try {
        const date = new Date(datetimeInput);
        const timestamp = date.getTime() - customEpoch.getTime();
        const result = `时间戳（秒）：${Math.floor(timestamp / 1000)}
时间戳（毫秒）：${timestamp}`;
        
        resultDiv.innerHTML = result;
    } catch (error) {
        resultDiv.innerHTML = `<span class="text-danger">${error.message}</span>`;
    }
}

// 修改时间戳更新函数
function updateCurrentTimestamp() {
    const now = new Date();
    const timestamp = now.getTime() - customEpoch.getTime();
    document.getElementById('current-timestamp').textContent = `${timestamp} 毫秒`;
}

// 添加自定义起始时间功能
function setCustomEpoch() {
    const epochInput = document.getElementById('epoch-input').value;
    if (!epochInput) {
        alert('请选择起始时间');
        return;
    }
    
    customEpoch = new Date(epochInput);
    updateCurrentTimestamp();
    
    // 更新说明文字
    const instructions = document.querySelector('#timestamp .instructions');
    instructions.innerHTML = `
        当前使用的起始时间为：${customEpoch.toLocaleString()}
        <br>时间戳为此时间至今的毫秒数。
    `;
}

// 添加复位功能
function resetEpoch() {
    customEpoch = new Date('1970-01-01T00:00:00.000Z');
    updateCurrentTimestamp();
    
    // 清空输入框
    document.getElementById('epoch-input').value = '';
    
    // 更新说明文字
    const instructions = document.querySelector('#timestamp .instructions');
    instructions.innerHTML = `
        默认时间戳是指格林威治时间1970年01月01日00时00分00秒起至现在的总秒数。
        <br>您可以在下方输入时间戳（毫秒）或选择时间进行转换。
    `;
}
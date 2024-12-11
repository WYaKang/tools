// 当前显示的部分
let currentSection = 'horoscope';

// 切换显示区域
function showSection(section) {
    document.querySelectorAll('.section').forEach(el => el.style.display = 'none');
    document.getElementById(section).style.display = 'block';
    
    document.querySelectorAll('.nav-link').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[onclick="showSection('${section}')"]`).classList.add('active');
    
    currentSection = section;
}

// 获取星座运势
function getHoroscope(zodiac) {
    const horoscopeResult = document.getElementById('horoscope-result');
    horoscopeResult.style.display = 'block';
    
    // 这里应该调用实际的星座运势API
    // 以下是示例数据
    const fortuneData = {
        overall: "今日运势不错，适合与人交流沟通。",
        love: "单身者容易遇到心动的对象，已有伴侣的感情稳定。",
        career: "工作上会遇到一些挑战，但都能顺利解决。",
        wealth: "财运平稳，适合理财规划。",
        health: "注意保持运动，避免久坐。"
    };
    
    horoscopeResult.innerHTML = `
        <div class="fortune-item">
            <div class="fortune-title">综合运势</div>
            <div>${fortuneData.overall}</div>
        </div>
        <div class="fortune-item">
            <div class="fortune-title">感情运势</div>
            <div>${fortuneData.love}</div>
        </div>
        <div class="fortune-item">
            <div class="fortune-title">事业运势</div>
            <div>${fortuneData.career}</div>
        </div>
        <div class="fortune-item">
            <div class="fortune-title">财运</div>
            <div>${fortuneData.wealth}</div>
        </div>
        <div class="fortune-item">
            <div class="fortune-title">健康</div>
            <div>${fortuneData.health}</div>
        </div>
    `;
}

// 获取黄历信息
function getAlmanac() {
    const date = document.getElementById('almanac-date').value;
    
    // 这里应该调用实际的黄历API
    // 以下是示例数据
    const almanacData = {
        lunarDate: "壬寅年三月初三",
        suitable: "祭祀、出行、结婚、搬家",
        unsuitable: "动土、安葬、开业"
    };
    
    document.getElementById('lunar-date').textContent = almanacData.lunarDate;
    document.getElementById('suitable').textContent = almanacData.suitable;
    document.getElementById('unsuitable').textContent = almanacData.unsuitable;
}

// 页面加载时初始化日期选择器为今天
document.addEventListener('DOMContentLoaded', () => {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('almanac-date').value = today;
    getAlmanac();
}); 
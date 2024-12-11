// 黄历相关的代码
function getAlmanac() {
    // 保持原来的黄历代码
}

document.addEventListener('DOMContentLoaded', () => {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('almanac-date').value = today;
    getAlmanac();
}); 
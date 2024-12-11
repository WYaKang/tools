// 引入lunar-typescript库
import { Solar, LunarYear, I18n } from 'lunar-typescript';

// 设置中文语言包
I18n.setMessages('chs', {
    'my.shu': '属',
    'my.jieQi': '节气',
    'my.week': '星期',
    'my.xingZuo': '座',
    'my.suiSha': '岁煞',
    'my.zhou': '周',
    'label.gongLi': '公历',
    'label.nongLi': '农历',
    'label.nian': '年',
    'label.yue': '月',
    'label.ri': '日',
    'label.suiSha': '岁煞',
    'label.jiShen': '吉神宜趋',
    'label.xiongSha': '凶煞宜忌',
    'label.caiShen': '财神位',
    'label.yinYang': '阴阳贵神',
    'label.jiuGong': '九宫飞星'
});

// 设置英文语言包
I18n.setMessages('en', {
    'my.shu': ' ',
    'my.jieQi': ' ',
    'my.week': ' ',
    'my.xingZuo': ' ',
    'my.suiSha': ' ',
    'my.zhou': ' ',
    'label.gongLi': 'Solar',
    'label.nongLi': 'Lunar',
    'label.nian': 'Year',
    'label.yue': 'Month',
    'label.ri': 'Day'
});

// 设置繁体中文语言包
I18n.setMessages('cht', {
    'my.shu': '屬',
    'my.jieQi': '節氣',
    'my.suiSha': '歲煞',
    'label.gongLi': '西歴',
    'label.nongLi': '夏歴',
    'label.suiSha': '歲煞',
    'label.jiShen': '吉神宜趨',
    'label.xiongSha': '兇煞宜忌',
    'label.caiShen': '財神位',
    'label.yinYang': '陰陽貴神',
    'label.jiuGong': '九宮飛星',
    'label.nian': '年',
    'label.yue': '月',
    'label.ri': '日',
    'my.week': '星期',
    'my.xingZuo': '座',
    'my.zhou': '周'
});

// 添加天干地支、生肖等其他语言包内容
I18n.setMessages('cht', {
    'tg.jia': '甲', 'tg.yi': '乙', 'tg.bing': '丙', 'tg.ding': '丁', 'tg.wu': '戊',
    'tg.ji': '己', 'tg.geng': '庚', 'tg.xin': '辛', 'tg.ren': '壬', 'tg.gui': '癸',
    'dz.zi': '子', 'dz.chou': '醜', 'dz.yin': '寅', 'dz.mao': '卯', 'dz.chen': '辰',
    'dz.si': '巳', 'dz.wu': '午', 'dz.wei': '未', 'dz.shen': '申', 'dz.you': '酉',
    'dz.xu': '戌', 'dz.hai': '亥',
    'sx.rat': '鼠', 'sx.ox': '牛', 'sx.tiger': '虎', 'sx.rabbit': '兔', 'sx.dragon': '龍',
    'sx.snake': '蛇', 'sx.horse': '馬', 'sx.goat': '羊', 'sx.monkey': '猴', 'sx.rooster': '雞',
    'sx.dog': '狗', 'sx.pig': '豬'
});

// 状态管理
const state = {
    lang: 'chs',
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    day: new Date().getDate()
};

// 渲染黄历数据
function render() {
    const solar = Solar.fromYmd(state.year, state.month, state.day);
    const lunar = solar.getLunar();

    // 更新年月日输入框
    document.getElementById('yearInput').value = state.year;
    document.getElementById('monthSelect').value = state.month;
    document.getElementById('dayInput').value = state.day;
    document.getElementById('currentDay').textContent = state.day;

    // 更新公历和农历信息
    document.getElementById('gongLiInfo').textContent = `${I18n.getMessage('label.gongLi')} ${state.year}${I18n.getMessage('label.nian')} ${state.month}${I18n.getMessage('label.yue')} ${state.day}${I18n.getMessage('label.ri')} ${I18n.getMessage('my.week')}${solar.getWeekInChinese()} ${solar.getXingZuo()}${I18n.getMessage('my.xingZuo')}`;
    document.getElementById('nongLiInfo').textContent = `${I18n.getMessage('label.nongLi')} ${lunar.getYearInChinese()}${I18n.getMessage('label.nian')} ${lunar.getMonthInChinese()}${I18n.getMessage('label.yue')} ${lunar.getDayInChinese()}`;

    // 更新年份信息
    document.getElementById('yearGanZhi').textContent = lunar.getYearInGanZhi();
    document.getElementById('yearShengXiao').textContent = `${I18n.getMessage('my.shu')}${lunar.getYearShengXiao()}`;
    document.getElementById('yearNaYin').textContent = lunar.getYearNaYin();

    // 更新月份信息
    document.getElementById('monthGanZhi').textContent = lunar.getMonthInGanZhi();
    document.getElementById('monthShengXiao').textContent = `${I18n.getMessage('my.shu')}${lunar.getMonthShengXiao()}`;
    document.getElementById('monthNaYin').textContent = lunar.getMonthNaYin();

    // 更新日期信息
    document.getElementById('dayGanZhi').textContent = lunar.getDayInGanZhi();
    document.getElementById('dayShengXiao').textContent = `${I18n.getMessage('my.shu')}${lunar.getDayShengXiao()}`;
    document.getElementById('dayNaYin').textContent = lunar.getDayNaYin();

    // 更新节气信息
    const prevJq = lunar.getPrevJieQi(true);
    const prevJqSolar = prevJq.getSolar();
    document.getElementById('prevJieQi').textContent = `${I18n.getMessage('my.jieQi')}${prevJq.getName()}：${prevJqSolar.toYmd()} ${I18n.getMessage('my.zhou')}${prevJqSolar.getWeekInChinese()}`;

    const nextJq = lunar.getNextJieQi(true);
    const nextJqSolar = nextJq.getSolar();
    document.getElementById('nextJieQi').textContent = `${I18n.getMessage('my.jieQi')}${nextJq.getName()}：${nextJqSolar.toYmd()} ${I18n.getMessage('my.zhou')}${nextJqSolar.getWeekInChinese()}`;

    // 更新宜忌
    document.getElementById('yiList').innerHTML = lunar.getDayYi().map(item => `<li>${item}</li>`).join('');
    document.getElementById('jiList').innerHTML = lunar.getDayJi().map(item => `<li>${item}</li>`).join('');

    // 更新吉神凶煞
    document.getElementById('jiShenList').innerHTML = lunar.getDayJiShen().map(item => `<li>${item}</li>`).join('');
    document.getElementById('xiongShaList').innerHTML = lunar.getDayXiongSha().map(item => `<li>${item}</li>`).join('');

    // 更新彭祖百忌
    document.getElementById('pengZuGan').textContent = lunar.getPengZuGan();
    document.getElementById('pengZuZhi').textContent = lunar.getPengZuZhi();

    // 更新月相信息
    document.getElementById('yueMing').textContent = lunar.getSeason();
    document.getElementById('yueXiang').textContent = `${lunar.getYueXiang()}月`;
    document.getElementById('wuHou').textContent = `${lunar.getHou()} ${lunar.getWuHou()}`;

    // 更新神煞信息
    document.getElementById('dayChong').textContent = `${lunar.getDayShengXiao()}日冲${lunar.getDayChongDesc()}`;
    document.getElementById('dayZhiShen').textContent = lunar.getZhiXing();
    document.getElementById('dayTianShen').textContent = `${lunar.getDayTianShen()}(${lunar.getDayTianShenType()}日)`;

    // 更新胎神信息
    document.getElementById('monthTaiShen').textContent = lunar.getMonthPositionTai();
    document.getElementById('dayTaiShen').textContent = lunar.getDayPositionTai();

    // 更新其他信息
    document.getElementById('daySha').textContent = lunar.getDaySha();
    document.getElementById('liuYao').textContent = lunar.getLiuYao();
    document.getElementById('dayLu').textContent = lunar.getDayLu();

    // 更新方位信息
    document.getElementById('positionXi').textContent = lunar.getPositionXiDesc();
    document.getElementById('positionFu').textContent = lunar.getPositionFuDesc();
    document.getElementById('positionCai').textContent = lunar.getPositionCaiDesc();
    document.getElementById('positionYangGui').textContent = lunar.getPositionYangGuiDesc();
    document.getElementById('positionYinGui').textContent = lunar.getPositionYinGuiDesc();

    // 更新空亡信息
    document.getElementById('yearKongWang').textContent = lunar.getYearXunKong();
    document.getElementById('monthKongWang').textContent = lunar.getMonthXunKong();
    document.getElementById('dayKongWang').textContent = lunar.getDayXunKong();

    // 更新九宫飞星
    const dayNineStar = lunar.getDayNineStar();
    document.getElementById('dayJiuXing').textContent = dayNineStar.toString();
    document.getElementById('xiu').textContent = `${lunar.getGong()}方${lunar.getXiu()}${lunar.getZheng()}${lunar.getAnimal()}(${lunar.getXiuLuck()})`;

    const lunarYear = LunarYear.fromYear(lunar.getYear());
    document.getElementById('yearZhiShui').textContent = lunarYear.getZhiShui();
    document.getElementById('yearDeJin').textContent = lunarYear.getDeJin();
    document.getElementById('yearFenBing').textContent = lunarYear.getFenBing();
    document.getElementById('yearGenTian').textContent = lunarYear.getGengTian();
}

// 前一天
function prevDay() {
    const solar = Solar.fromYmd(state.year, state.month, state.day).next(-1);
    state.year = solar.getYear();
    state.month = solar.getMonth();
    state.day = solar.getDay();
    render();
}

// 后一天
function nextDay() {
    const solar = Solar.fromYmd(state.year, state.month, state.day).next(1);
    state.year = solar.getYear();
    state.month = solar.getMonth();
    state.day = solar.getDay();
    render();
}

// 初始化事件监听
function initEventListeners() {
    document.getElementById('prevDay').addEventListener('click', prevDay);
    document.getElementById('nextDay').addEventListener('click', nextDay);

    document.getElementById('yearInput').addEventListener('change', (e) => {
        const year = parseInt(e.target.value, 10);
        if (!isNaN(year)) {
            state.year = year;
            render();
        }
    });

    document.getElementById('monthSelect').addEventListener('change', (e) => {
        const month = parseInt(e.target.value, 10);
        if (!isNaN(month)) {
            state.month = month;
            render();
        }
    });

    document.getElementById('dayInput').addEventListener('change', (e) => {
        const day = parseInt(e.target.value, 10);
        if (!isNaN(day)) {
            state.day = day;
            render();
        }
    });
}

// 初始化
function init() {
    initEventListeners();
    render();
}

// 导出
export { init }; 
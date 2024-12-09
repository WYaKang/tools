// 单位转换数据
const unitData = {
    length: {
        name: '长度',
        units: {
            mm: { name: '毫米', ratio: 1 },
            cm: { name: '厘米', ratio: 10 },
            m: { name: '米', ratio: 1000 },
            km: { name: '千米', ratio: 1000000 },
            inch: { name: '英寸', ratio: 25.4 },
            ft: { name: '英尺', ratio: 304.8 },
            yd: { name: '码', ratio: 914.4 },
            mile: { name: '英里', ratio: 1609344 }
        }
    },
    weight: {
        name: '重量',
        units: {
            mg: { name: '毫克', ratio: 1 },
            g: { name: '克', ratio: 1000 },
            kg: { name: '千克', ratio: 1000000 },
            t: { name: '吨', ratio: 1000000000 },
            oz: { name: '盎司', ratio: 28349.523125 },
            lb: { name: '磅', ratio: 453592.37 }
        }
    },
    temperature: {
        name: '温度',
        units: {
            C: { name: '摄氏度' },
            F: { name: '华氏度' },
            K: { name: '开尔文' }
        }
    },
    area: {
        name: '面积',
        units: {
            mm2: { name: '平方毫米', ratio: 1 },
            cm2: { name: '平方厘米', ratio: 100 },
            m2: { name: '平方米', ratio: 1000000 },
            km2: { name: '平方千米', ratio: 1000000000000 },
            ha: { name: '公顷', ratio: 10000000000 }
        }
    },
    volume: {
        name: '体积',
        units: {
            ml: { name: '毫升', ratio: 1 },
            l: { name: '升', ratio: 1000 },
            m3: { name: '立方米', ratio: 1000000 },
            gal: { name: '加仑', ratio: 3785.41178 }
        }
    }
};

// 初始化页面
document.addEventListener('DOMContentLoaded', () => {
    const conversionType = document.getElementById('conversion-type');
    const inputUnit = document.getElementById('input-unit');
    const outputUnit = document.getElementById('output-unit');
    const inputValue = document.getElementById('input-value');
    const outputValue = document.getElementById('output-value');

    // 更新单位选择器
    function updateUnitSelectors(type) {
        const units = unitData[type].units;
        inputUnit.innerHTML = '';
        outputUnit.innerHTML = '';
        
        Object.entries(units).forEach(([key, value]) => {
            inputUnit.add(new Option(value.name, key));
            outputUnit.add(new Option(value.name, key));
        });
    }

    // 转换计算
    function convert() {
        const type = conversionType.value;
        const input = parseFloat(inputValue.value);
        
        if (isNaN(input)) {
            outputValue.value = '';
            return;
        }

        if (type === 'temperature') {
            const fromUnit = inputUnit.value;
            const toUnit = outputUnit.value;
            outputValue.value = convertTemperature(input, fromUnit, toUnit);
        } else {
            const fromRatio = unitData[type].units[inputUnit.value].ratio;
            const toRatio = unitData[type].units[outputUnit.value].ratio;
            outputValue.value = (input * fromRatio / toRatio).toFixed(6);
        }
    }

    // 温度转换特殊处理
    function convertTemperature(value, from, to) {
        let kelvin;
        
        // 转换为开尔文
        switch(from) {
            case 'C': kelvin = value + 273.15; break;
            case 'F': kelvin = (value - 32) * 5/9 + 273.15; break;
            case 'K': kelvin = value; break;
        }
        
        // 从开尔文转换为目标单位
        switch(to) {
            case 'C': return (kelvin - 273.15).toFixed(2);
            case 'F': return ((kelvin - 273.15) * 9/5 + 32).toFixed(2);
            case 'K': return kelvin.toFixed(2);
        }
    }

    // 事件监听
    conversionType.addEventListener('change', () => {
        updateUnitSelectors(conversionType.value);
        convert();
    });

    inputUnit.addEventListener('change', convert);
    outputUnit.addEventListener('change', convert);
    inputValue.addEventListener('input', convert);

    // 初始化
    updateUnitSelectors(conversionType.value);
}); 
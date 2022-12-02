export function getNRandomItems(arr, n) {
    let result = new Array(n),
        len = arr.length,
        taken = new Array(len);
    if (n > len)
        throw new RangeError("getRandom: more elements taken than available");
    while (n--) {
        const x = Math.floor(Math.random() * len);
        result[n] = arr[x in taken ? taken[x] : x];
        taken[x] = --len in taken ? taken[len] : len;
    }
    return result;
}

export function randomIntBetween(min, max) { // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
}

export function randomItem(arrayOfItems){
    return arrayOfItems[Math.floor(Math.random() * arrayOfItems.length)];
}

export function randomString(length, charset='abcdefghijklmnopqrstuvwxyz') {
    let res = '';
    while (length--) res += charset[(Math.random() * charset.length) | 0];
    return res;
}

export function httpBuildQuery (data) {
    return Object.keys(data).map(function(key) {
        return [key, data[key]].map(encodeURIComponent).join("=");
    }).join("&");
}

export function doLoadCounters() {
    return {
        100: new Counter('http_1xx'),
        200: new Counter('http_2xx'),
        300: new Counter('http_3xx'),
        400: new Counter('http_4xx'),
        500: new Counter('http_5xx'),
    };
}

export function collectStatusCode(response, counters) {
    let currentCounter;
    if (response.status >= 500) {
        currentCounter = counters[500]
    }  else if (response.status >= 400) {
        currentCounter = counters[400]
    } else if (response.status >= 300) {
        currentCounter = counters[300]
    } else if (response.status >= 200) {
        currentCounter = counters[200]
    } else {
        currentCounter = counters[100]
    }
    if (currentCounter) {
        currentCounter.add(1)
    }
}


/**
 * TODO - refactor
 *
 * Функция - комбайн для отрисовки различных сценариев.
 * Может сделать кривую любой формы с одним изгибом
 * Примеры использования:
 * curveDistribution(200, 300, 20, 10) - нормальное распределение с жирными хвостами
 * curveDistribution(200, 300, 20, 10, false, 2)) - нормальное распределение с плато посередине
 * curveDistribution(300, 400, 20, 0.67, true, 1, 30) - плавное повышение нагрузки до максимальной и треть времени на ней
 * curveDistribution(200, 300, 20, 30, true, 2) - быстрый рост до максимальной нагрузки и работа на ней
 * curveDistribution(200, 300, 20, 1, true, 1000) - константный сценарий
 *
 * @param maxVus
 * @param durationSeconds
 * @param numberOfStages
 * @param scale
 * @param doNotLower
 * @param size
 * @param minVus
 * @returns {*[]}
 */
export function curveDistribution(maxVus, durationSeconds, numberOfStages = 10, scale = 1, doNotLower = false, size = 1, minVus = 1) {
    function normalDensity(mean, scale, x) {
        return Math.exp(-1 / 2 * Math.pow((x - mean) / scale, 2)) / (scale * Math.sqrt(2 * Math.PI));
    }

    const mean = 1;
    let curve = new Array(numberOfStages + 2).fill(0);
    let durations = new Array(numberOfStages + 2).fill(Math.ceil(durationSeconds / 6));
    let k6stages = [];

    for (let i = 0; i <= numberOfStages + 1; i++) {
        curve[i] = normalDensity(mean, scale, -2 * scale + 4 * scale * i / numberOfStages);
    }

    let peakDistribution = Math.max(...curve);

    let vus = curve.map(x => Math.round(x * maxVus / peakDistribution));
    vus = vus.map(x => x < minVus ? minVus : x)
    if (doNotLower) {
        let isMax = false;
        let currentElement;
        for (let i = 0; i <= numberOfStages + 1; i++) {
            currentElement = vus[i];
            if (!isMax && currentElement === maxVus) {
                isMax = true;
            }
            if (isMax) {
                vus[i] = maxVus;
            }
        }
    }

    if (size !== 1 && size > 0) {
        let currentElement;
        for (let i = 0; i <= numberOfStages + 1; i++) {
            currentElement = vus[i] * 2;
            vus[i] = currentElement <= maxVus ? currentElement : maxVus
        }
    }

    for (let j = 1; j <= numberOfStages; j++) {
        durations[j] = Math.ceil(4 * durationSeconds / (6 * numberOfStages));
    }

    for (let k = 0; k <= numberOfStages + 1; k++) {
        k6stages.push({duration: `${durations[k]}s`, target: vus[k]});
    }

    return k6stages;
}
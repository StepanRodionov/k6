import demo from "k6/x/demo";
import http from 'k6/http';
import {check} from 'k6';
import papaparse from '../lib/papaparse.js';
import {SharedArray} from 'k6/data';

// Здесь происходит настройка сценария
export const options = {
    scenarios: {
        scenario_1: {
            executor: 'shared-iterations',
            vus: 2,
            iterations: 10,
        },
    }
}

// Здесь можем объявлять пользовательские функции, которые понадобятся в сценарии

// Получаем данные из файла ./data/products.csv, можем использовать их далее в скрипте
const products_ids = new SharedArray("товары по id", function () {
    return papaparse.parse(open('./data/products.csv'), {header: false}).data;
}).map(val => {
    return Number(val[0]);
});

export function setup() {
    // функция которая должна выполниться перед стартом сценария
}

export default function (data) {
    // сценарий пользователя
    let body = '';
    let res

    console.log(demo.getAnswer());  // выведет 42, а код в пакете /plugins/demo

    // Делаем запрос
    res = http.post(`${MY_HOST}/v1/products/search`, body, {
        headers: {},
        tags: {"name": "Мой запрос"}
    })
    // Проверяем код результата
    check(res, {"check 200 POST /v1/products/search": (res) => res.status === 200})
}

export function teardown(data) {
    // функция которая должна выполниться по завершению сценария
}

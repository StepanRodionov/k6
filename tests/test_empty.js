import demo from "k6/x/demo";

// Здесь происходит настройка сценария
export const options = {

}

export function setup() {
    // функция которая должна выполниться перед стартом тестирования
}

export default function (data) {
    // сценарий пользователя

    console.log(demo);
}

export function teardown(data) {
    // функция которая должна выполниться по завершению теста
}

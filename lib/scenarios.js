import {curveDistribution} from "./utils.js";

function determineStagesCount(duration) {
    switch (true) {
        case duration < 0:
            return 20
        case duration < 20:
            return +duration;
        case duration < 599:
            return 20;
        case duration < 3000:
            return 30
        default:
            return 50
    }
}

export function getConstantScenario(maxVus, tps, duration) {
    return {
        executor: 'constant-arrival-rate',
        rate: tps,
        timeUnit: `1s`,
        preAllocatedVUs: Math.ceil(maxVus / 2),
        maxVUs: maxVus,
        duration: duration * 1000
    }
}

export function getRampingScenario(maxVus, tps, duration) {
    const stagesCount = determineStagesCount(duration);
    return {
        executor: 'ramping-arrival-rate',
        startRate: 0,
        timeUnit: `1s`,
        preAllocatedVUs: Math.ceil(maxVus / 5),
        maxVUs: maxVus,
        gracefulStop: '30s',
        stages: curveDistribution(tps, duration, stagesCount, 10),
    }
}

export function getFlatRampingScenario(maxVus, tps, duration) {
    const stagesCount = determineStagesCount(duration);
    return {
        executor: 'ramping-arrival-rate',
        startRate: 0,
        timeUnit: `1s`,
        preAllocatedVUs: Math.ceil(maxVus / 5),
        maxVUs: maxVus,
        gracefulStop: '30s',
        stages: curveDistribution(tps, duration, stagesCount, 10, false, 2),
    }
}

export function getIncreasingScenario(maxVus, tps, duration) {
    const stagesCount = determineStagesCount(duration);
    const minIterations = 3 // да, это хардкод :)
    return {
        executor: 'ramping-arrival-rate',
        startRate: 0,
        timeUnit: `1s`,
        preAllocatedVUs: Math.ceil(maxVus / 5),
        maxVUs: maxVus,
        gracefulStop: '30s',
        stages: curveDistribution(tps, duration, stagesCount, 0.67, true, 1, minIterations),
    }
}

export function determineScenario(type) {
    switch (type) {
        case 'linear':
            return function (maxVus, tps, duration) {
                return getConstantScenario(maxVus, tps, duration)
            }
        case 'curve_flat':
            return function (maxVus, tps, duration) {
                return getFlatRampingScenario(maxVus, tps, duration)
            }
        case 'increasing':
            return function (maxVus, tps, duration) {
                return getIncreasingScenario(maxVus, tps, duration)
            }
        case 'curve':
        default:
            return function (maxVus, tps, duration) {
                return getRampingScenario(maxVus, tps, duration)
            }
    }
}
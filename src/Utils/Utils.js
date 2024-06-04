export function measureTime(lambda) {
    const t = performance.now();
    lambda()
    return 1e-3 * (performance.now() - t);
}

export async function measureTimeWithAsyncResult(lambda) {
    const t = performance.now();
    const result = await lambda();
    return { result, time: 1e-3 * (performance.now() - t) };
}

export function measureTimeWithResult(lambda) {
    const t = performance.now();
    const result = lambda();
    return { result, time: 1e-3 * (performance.now() - t) };
}

export function groupBy(array, groupFunction) {
    const ans = {};
    array.forEach((x, i) => {
        const key = groupFunction(x, i);
        if (!ans[key]) ans[key] = [];
        ans[key].push(x);
    });
    return ans;
}

export function argmin(array, costFunction = x => x) {
    let argminIndex = -1;
    let cost = Number.MAX_VALUE;
    // faster than forEach
    for (let i = 0; i < array.length; i++) {
        const newCost = costFunction(array[i], i);
        if (newCost < cost) {
            cost = newCost;
            argminIndex = i;
        }
    }
    return argminIndex;
}

export function memoize(func) {
    // not working...
    const cache = {}
    return (...args) => {
        const key = JSON.stringify(args.map(x => typeof x === "object" ? JSON.stringify(x) : x.toString()));
        if (key in cache) return cache[key];
        const ans = func(...args);
        cache[key] = ans;
        return ans;
    }
}


const RANDOM = Array(1000).fill().map(Math.random);
let i = 0;
export function fRandom() {
    if(i > 1e6) i = 0;
    return RANDOM[i++ % RANDOM.length];
}
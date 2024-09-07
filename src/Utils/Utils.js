export async function measureTime(lambda) {
    const t = performance.now();
    await lambda()
    return 1e-3 * (performance.now() - t);
}

export async function measureTimeWithResult(lambda) {
    const t = performance.now();
    const result = await lambda();
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
    if (i > 1e6) i = 0;
    return RANDOM[i++ % RANDOM.length];
}

const setTimeOut = typeof window === "undefined" ? setTimeout : requestAnimationFrame;
if(typeof window !== "undefined") window.globalAnimationIDs = [];
export function loop(lambda) {
    let isFinished = false;
    const loopControl = {
        stop: () => {
            isFinished = true;
        },
        play: () => play({ oldT: new Date().getTime(), time: 0 })
    };
    const play = async ({ time, oldT }) => {
        const newT = new Date().getTime();
        const dt = (newT - oldT) * 1e-3;

        await lambda({ time, dt });

        if (isFinished) return loopControl;
        const id = setTimeOut(() => play({
            oldT: newT,
            time: time + dt,
        }));
        if(typeof window !== "undefined") window.globalAnimationIDs.push(id);

        return loopControl;
    }
    return loopControl;
}

export function hashStr(string) {
    let hash = 0;
    for (let i = 0; i < string.length; i++) {
        hash = (hash * 37) ^ string.charCodeAt(i);
    }
    return hash >>> 0; // Convert to unsigned 32-bit integer
}
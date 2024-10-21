import { IS_NODE } from "./Constants.js";

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
if (typeof window !== "undefined") window.globalAnimationIDs = [];
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
        if (typeof window !== "undefined") window.globalAnimationIDs.push(id);

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

const __Worker = IS_NODE ? (await import("node:worker_threads")).Worker : Worker;
export class MyWorker {
    constructor(path) {
        const IS_GITHUB = typeof window !== "undefined" && (window.location.host || window.LOCATION_HOST) === "pedroth.github.io";
        const SOURCE = IS_GITHUB ? "/tela.js" : "";
        try {
            if (IS_NODE) {
                let workerPath = "/" + (import.meta.dirname).split('/').slice(1, -1).join('/');
                if (workerPath === "/") workerPath = "\\" + (import.meta.dirname).split('\\').slice(1, -1).join('\\')
                this.worker = new __Worker(`${workerPath}/${path}`, { type: "module" });
            } else {
                const workerPath = `${SOURCE}/src/${path}`;
                this.worker = new __Worker(`${workerPath}`, { type: "module" });
                this.worker.onerror = () => {
                    this.worker = new __Worker(`/node_modules/tela.js/src/${path}`, { type: "module" });
                    console.log(`Caught error while import from ${SOURCE} web, trying node_modules`);
                }
            }
        } catch (e) {
            console.log("Caught error while importing worker", e);
        }
    }

    onMessage(lambda) {
        if (IS_NODE) {
            this.worker.removeAllListeners('message');
            this.worker.on("message", lambda);
        } else {
            if (this.__lambda) {
                this.worker.removeEventListener('message', this.__lambda);
            }
            this.__lambda = message => lambda(message.data);
            this.worker.addEventListener("message", this.__lambda);
        }
    }

    postMessage(message) {
        return this.worker.postMessage(message);
    }
}
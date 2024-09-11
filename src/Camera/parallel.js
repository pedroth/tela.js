import { CHANNELS, IS_NODE, NUMBER_OF_CORES } from "../Utils/Constants.js";
import Color from "../Color/Color.js";

//========================================================================================
/*                                                                                      *
 *                                         UTILS                                        *
 *                                                                                      */
//========================================================================================

const __Worker = IS_NODE ? (await import("node:worker_threads")).Worker : Worker;
class MyWorker {
    constructor(path) {
        this.path = path;
        try {
            this.worker = new __Worker(path, { type: 'module' });
        } catch (e) {
            console.log("Caught error while importing worker", e);
        }
    }

    onMessage(lambda) {
        if (IS_NODE) {
            this.worker.removeAllListeners('message');
            this.worker.on("message", lambda);
            this.worker.on("error", e => console.log("Caught error on worker", e))
        } else {
            if (this.__lambda) {
                this.worker.removeEventListener('message', this.__lambda);
            }
            this.__lambda = message => lambda(message.data);
            this.worker.addEventListener("message", this.__lambda);
            this.worker.addEventListener("error", e => console.log("Caught error on worker", e));
        }
    }

    postMessage(message) {
        return this.worker.postMessage(message);
    }
}

let RAY_TRACE_WORKERS = [];
let RAY_MAP_WORKERS = [];
let prevSceneHash = undefined;
let isFirstTimeCounter = NUMBER_OF_CORES;

const MAGIC_SETUP_TIME = 400;
//========================================================================================
/*                                                                                      *
 *                                         MAIN                                         *
 *                                                                                      */
//========================================================================================

export function rayTraceWorkers(camera, scene, canvas, params = {}) {
    // lazy loading workers
    if (RAY_TRACE_WORKERS.length === 0) {
        // needs to be here...
        const isGithub = typeof window !== "undefined" && (window.location.host || window.LOCATION_HOST) === "pedroth.github.io";
        const SOURCE = isGithub ? "/tela.js" : ""
        RAY_TRACE_WORKERS = [...Array(NUMBER_OF_CORES)]
            .map(() => new MyWorker(`${IS_NODE ? "." : SOURCE}/src/Camera/rayTraceWorker.js`));
    }
    const w = canvas.width;
    const h = canvas.height;
    const newHash = scene?.getHash();
    const isNewScene = prevSceneHash !== newHash;
    if (isNewScene) prevSceneHash = newHash;
    return RAY_TRACE_WORKERS.map((worker, k) => {
        return new Promise((resolve) => {
            worker.onMessage(message => {
                const { image, startRow, endRow, } = message;
                let index = 0;
                const startIndex = CHANNELS * w * startRow;
                const endIndex = CHANNELS * w * endRow;
                for (let i = startIndex; i < endIndex; i += CHANNELS) {
                    canvas.setPxlData(i, Color.ofRGB(image[index++], image[index++], image[index++], image[index++]));
                }
                resolve();
            })
            const ratio = Math.floor(h / RAY_TRACE_WORKERS.length);

            const message = {
                width: w,
                height: h,
                vars: params,
                startRow: k * ratio,
                endRow: Math.min(h, (k + 1) * ratio),
                camera: camera.serialize(),
                scene: isNewScene ? scene.serialize() : undefined
            };
            if (isFirstTimeCounter > 0 && !IS_NODE) {
                // hack to work in the browser, don't know why it works
                isFirstTimeCounter--;
                setTimeout(() => worker.postMessage(message), MAGIC_SETUP_TIME);
            } else {
                worker.postMessage(message)
            }
        });
    })
}

export function rayMapWorkers(camera, scene, canvas, lambda, vars = [], dependencies = []) {
    // lazy loading workers
    if (RAY_MAP_WORKERS.length === 0) {
        // needs to be here...
        const isGithub = typeof window !== "undefined" && (window.location.host || window.LOCATION_HOST) === "pedroth.github.io";
        const SOURCE = isGithub ? "/tela.js" : ""
        RAY_MAP_WORKERS = [...Array(NUMBER_OF_CORES)]
            .map(() => new MyWorker(`${IS_NODE ? "." : SOURCE}/src/Camera/rayMapWorker.js`));
    }
    const w = canvas.width;
    const h = canvas.height;
    const newHash = scene?.getHash();
    const isNewScene = prevSceneHash !== newHash;
    if (isNewScene) prevSceneHash = newHash;
    return RAY_MAP_WORKERS.map((worker, k) => {
        return new Promise((resolve) => {
            worker.onMessage(message => {
                const { image, startRow, endRow, } = message;
                let index = 0;
                const startIndex = CHANNELS * w * startRow;
                const endIndex = CHANNELS * w * endRow;
                for (let i = startIndex; i < endIndex; i += CHANNELS) {
                    canvas.setPxlData(i, Color.ofRGB(image[index++], image[index++], image[index++], image[index++]));
                }
                resolve();
            })
            const ratio = Math.floor(h / RAY_MAP_WORKERS.length);
            
            const message = {
                width: w,
                height: h,
                vars: vars,
                lambda: lambda.toString(),
                startRow: k * ratio,
                endRow: Math.min(h, (k + 1) * ratio),
                camera: camera.serialize(),
                dependencies: dependencies.map(d => d.toString()),
                scene: isNewScene ? scene.serialize() : undefined
            };
            if (isFirstTimeCounter > 0 && !IS_NODE) {
                // hack to work in the browser, don't know why it works
                isFirstTimeCounter--;
                setTimeout(() => worker.postMessage(message), MAGIC_SETUP_TIME);
            } else {
                worker.postMessage(message)
            }
            
        });
    })
}

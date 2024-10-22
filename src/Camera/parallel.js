import { CHANNELS, IS_NODE, NUMBER_OF_CORES } from "../Utils/Constants.js";
import Color from "../Color/Color.js";
import { MyWorker } from "../Utils/Utils.js";

//========================================================================================
/*                                                                                      *
 *                                         UTILS                                        *
 *                                                                                      */
//========================================================================================

let RAY_TRACE_WORKERS = [];
let RAY_MAP_WORKERS = [];

let prevSceneHash = undefined;
let prevScene = undefined;
let serializedScene = undefined;
let isFirstTimeCounter = NUMBER_OF_CORES;

const ERROR_MSG_TIMEOUT = 1000;
//========================================================================================
/*                                                                                      *
 *                                         MAIN                                         *
 *                                                                                      */
//========================================================================================

export function rayTraceWorkers(camera, scene, canvas, params = {}) {
    // lazy loading workers
    if (RAY_TRACE_WORKERS.length === 0) {
        RAY_TRACE_WORKERS = [...Array(NUMBER_OF_CORES)]
            .map(() => new MyWorker(`./Camera/rayTraceWorker.js`));
    }
    const w = canvas.width;
    const h = canvas.height;
    const newHash = scene?.getHash();
    const isNewScene = prevSceneHash !== newHash;
    if (isNewScene) {
        prevSceneHash = newHash;
        serializedScene = scene?.serialize()
        prevScene = serializedScene;
    } else {
        serializedScene = undefined;
    }
    return RAY_TRACE_WORKERS.map((worker, k) => {
        let timerId = undefined;
        return new Promise((resolve) => {
            worker.onMessage(message => {
                const { image, startRow, endRow, hasScene } = message;
                prevScene = hasScene ? undefined : prevScene;
                if (!IS_NODE) clearTimeout(timerId);
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
                params: params,
                startRow: k * ratio,
                endRow: Math.min(h, (k + 1) * ratio),
                camera: camera.serialize(),
                scene: isNewScene ? serializedScene : prevScene !== undefined ? prevScene : undefined
            };
            worker.postMessage(message);
            if (isFirstTimeCounter > 0 && !IS_NODE) {
                // hack to work in the browser, don't know why it works
                isFirstTimeCounter--;
                timerId = setTimeout(() => {
                    console.log("TIMEOUT!!")
                    // doesn't block promise 
                    resolve();
                }, ERROR_MSG_TIMEOUT);
            }
        });
    })
}


export function rayMapWorkers(camera, scene, canvas, lambda, vars = [], dependencies = []) {
    // lazy loading workers
    if (RAY_MAP_WORKERS.length === 0) {
        RAY_MAP_WORKERS = [...Array(NUMBER_OF_CORES)]
            .map(() => new MyWorker(`./Camera/rayMapWorker.js`));
    }
    const w = canvas.width;
    const h = canvas.height;
    const newHash = scene?.getHash();
    const isNewScene = prevSceneHash !== newHash;
    if (isNewScene) {
        prevSceneHash = newHash;
        serializedScene = scene?.serialize()
        prevScene = serializedScene;
    } else {
        serializedScene = undefined;
    }
    return RAY_MAP_WORKERS.map((worker, k) => {
        return new Promise((resolve) => {
            let timerId = undefined;
            worker.onMessage(message => {
                const { image, startRow, endRow, hasScene } = message;
                prevScene = hasScene ? undefined : prevScene;
                if (!IS_NODE) clearTimeout(timerId);
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
                scene: isNewScene ? serializedScene : prevScene !== undefined ? prevScene : undefined
            };
            worker.postMessage(message);
            if (isFirstTimeCounter > 0 && !IS_NODE) {
                // hack to work in the browser, don't know why it works
                isFirstTimeCounter--;
                timerId = setTimeout(() => {
                    console.log("TIMEOUT!!")
                    // doesn't block promise 
                    fail();
                }, ERROR_MSG_TIMEOUT);
            }
        });
    })
}

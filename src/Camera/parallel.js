import { IS_NODE, NUMBER_OF_CORES } from "../Utils/Constants.js";
import Color from "../Color/Color.js";
import { CHANNELS } from "../Tela/Tela.js";

//========================================================================================
/*                                                                                      *
 *                                         UTILS                                        *
 *                                                                                      */
//========================================================================================

const __Worker = IS_NODE ? (await import("node:worker_threads")).Worker : Worker;
class MyWorker {
    constructor(path) {
        this.path = path;
        this.worker = new __Worker(path, { type: 'module' });
    }

    onMessage(lambda) {
        if (IS_NODE) {
            this.worker.removeAllListeners('message');
            this.worker.on("message", lambda);
        } else {
            this.worker.onmessage = message => lambda(message.data);
        }
    }

    postMessage(message) {
        return this.worker.postMessage(message);
    }
}

const isGithub = typeof window !== "undefined" && window.location.host === "pedroth.github.io";
const SOURCE = isGithub ? "/tela.js" : ""

let WORKERS = [];
let prevSceneHash = undefined;

//========================================================================================
/*                                                                                      *
 *                                         MAIN                                         *
 *                                                                                      */
//========================================================================================

export function parallelWorkers(camera, scene, canvas, params = {}) {
    // lazy loading workers
    if (WORKERS.length === 0) {
        WORKERS = [...Array(NUMBER_OF_CORES)]
            .map(() => new MyWorker(`${IS_NODE ? "." : SOURCE}/src/Camera/rayTraceWorker.js`));
    }
    const w = canvas.width;
    const h = canvas.height;
    const isNewScene = prevSceneHash !== scene.hash;
    if (isNewScene) prevSceneHash = scene.hash;
    return WORKERS.map((worker, k) => {
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
            const ratio = Math.floor(h / WORKERS.length);

            const message = {
                width: w,
                height: h,
                params: params,
                startRow: k * ratio,
                endRow: Math.min(h, (k + 1) * ratio),
                camera: camera.serialize(),
                scene: isNewScene ? scene.serialize() : undefined
            };
            worker.postMessage(message);
        });
    })
}
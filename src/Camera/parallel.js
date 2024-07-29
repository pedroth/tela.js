import { CHANNELS } from "../Tela/Tela.js";
import { IS_NODE, NUMBER_OF_CORES } from "../Utils/Constants.js"
const Worker = IS_NODE ? await import("node:worker_threads") : window.Worker;
let WORKERS = [];

export function parallelWorkers(camera, scene, params, canvas) {
    // lazy loading workers
    if (WORKERS.length === 0)
        WORKERS = [...Array(NUMBER_OF_CORES)].map(() => new Worker(`/src/Camera/RayTraceWorker.js`, { type: 'module' }));
    const w = canvas.width;
    const h = canvas.height;
    const readMessage = resolve => message => {
        const { image, startRow, endRow, } = message;
        let index = 0;
        const startIndex = CHANNELS * w * startRow;
        const endIndex = CHANNELS * w * endRow;
        for (let i = startIndex; i < endIndex; i += CHANNELS) {
            canvas.setPxlData(i, [image[index++], image[index++], image[index++]]);
            index++;
        }
        resolve();
    }
    return WORKERS.map((worker, k) => {
        return new Promise((resolve) => {
            if (IS_NODE) {
                worker.removeAllListeners('message');
                worker.on("message", readMessage(resolve));
            } else {
                worker.onmessage = message => {
                    const { image, startRow, endRow, } = message;
                    let index = 0;
                    const startIndex = CHANNELS * w * startRow;
                    const endIndex = CHANNELS * w * endRow;
                    for (let i = startIndex; i < endIndex; i += CHANNELS) {
                        canvas.setPxlData(i, [image[index++], image[index++], image[index++]]);
                        index++;
                    }
                    resolve();
                }
            }
            const ratio = Math.floor(h / WORKERS.length);
            const message = {
                width: w,
                height: h,
                params: params,
                startRow: k * ratio,
                endRow: Math.min(h - 1, (k + 1) * ratio),
                camera: camera.serialize(),
                scene: scene ? scene.serialize() : []
            };
            worker.postMessage(message);
        });
    })
}
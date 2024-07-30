import Color from "../Color/Color.js";
import { CHANNELS } from "../Tela/Tela.js";

const NUMBER_OF_CORES = navigator.hardwareConcurrency;
let WORKERS = [];
let prevSceneHash = undefined;
export function parallelWorkers(camera, scene, canvas, params = {}) {
    // lazy loading workers
    if (WORKERS.length === 0) WORKERS = [...Array(NUMBER_OF_CORES)].map(() => new Worker(`/src/Camera/RayTraceWorker.js`, { type: 'module' }));
    const w = canvas.width;
    const h = canvas.height;
    let { samplesPerPxl, bounces, variance, gamma, bilinearTexture } = params;
    bounces = bounces ?? 10;
    variance = variance ?? 0.001;
    samplesPerPxl = samplesPerPxl ?? 1;
    gamma = gamma ?? 0.5;
    bilinearTexture = bilinearTexture ?? false;
    const isNewScene = prevSceneHash !== scene.hash;
    if (isNewScene) prevSceneHash = scene.hash;
    return WORKERS.map((worker, k) => {
        return new Promise((resolve) => {
            worker.onmessage = message => {
                const { image, startRow, endRow, } = message.data;
                let index = 0;
                const startIndex = CHANNELS * w * startRow;
                const endIndex = CHANNELS * w * endRow;
                for (let i = startIndex; i < endIndex; i += CHANNELS) {
                    canvas.setPxlData(i, Color.ofRGB(image[index++], image[index++], image[index++], image[index++]));
                }
                resolve();
            }
            const ratio = Math.floor(h / WORKERS.length);

            const message = {
                width: w,
                height: h,
                params: { samplesPerPxl, bounces, variance, gamma, bilinearTexture },
                startRow: k * ratio,
                endRow: Math.min(h - 1, (k + 1) * ratio),
                camera: camera.serialize(),
                scene: isNewScene ? scene.serialize() : undefined
            };
            worker.postMessage(message);
        });
    })
}
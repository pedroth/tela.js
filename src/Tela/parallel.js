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

let WORKERS = [];
//========================================================================================
/*                                                                                      *
 *                                         MAIN                                         *
 *                                                                                      */
//========================================================================================

export function parallelWorkers(tela, lambda, dependencies, vars) {
    // lazy loading workers
    if (WORKERS.length === 0) {
        // needs to be here...
        const isGithub = typeof window !== "undefined" && (window.location.host || window.LOCATION_HOST) === "pedroth.github.io";
        const SOURCE = isGithub ? "/tela.js" : ""
        WORKERS = [...Array(NUMBER_OF_CORES)]
            .map(() => new MyWorker(`${IS_NODE ? "." : SOURCE}/src/Tela/telaWorker.js`));
    }
    const w = tela.width;
    const h = tela.height;
    return WORKERS.map((worker, k) => {
        return new Promise((resolve) => {
            worker.onMessage(message => {
                const { image, startRow, endRow, } = message;
                let index = 0;
                const startIndex = CHANNELS * w * startRow;
                const endIndex = CHANNELS * w * endRow;
                for (let i = startIndex; i < endIndex; i += CHANNELS) {
                    tela.setPxlData(i, Color.ofRGB(image[index++], image[index++], image[index++], image[index++]));
                }
                resolve();
            })
            const ratio = Math.floor(h / WORKERS.length);
            const message = {
                __vars: vars,
                __lambda: lambda.toString(),
                __width: w,
                __height: h,
                __startRow: k * ratio,
                __endRow: Math.min(h, (k + 1) * ratio),
                __dependencies: dependencies.map(d => d.toString()),
            };
            worker.postMessage(message);
        });
    })
}
import { CHANNELS, IS_NODE, NUMBER_OF_CORES } from "../Utils/Constants.js";
import Color from "../Color/Color.js";
import { MyWorker } from "../Utils/Utils.js";
//========================================================================================
/*                                                                                      *
 *                                         UTILS                                        *
 *                                                                                      */
//========================================================================================

let WORKERS = [];
const ERROR_MSG_TIMEOUT = 2000;

//========================================================================================
/*                                                                                      *
 *                                         MAIN                                         *
 *                                                                                      */
//========================================================================================

export function parallelWorkers(tela, lambda, dependencies = [], vars = []) {
    // lazy loading workers
    if (WORKERS.length === 0) {
        WORKERS = [...Array(NUMBER_OF_CORES)]
            .map(() => new MyWorker(`./Tela/telaWorker.js`));
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
            setTimeout(() => {
                // doesn't block promise 
                resolve();
            }, ERROR_MSG_TIMEOUT);
        });
    })
}
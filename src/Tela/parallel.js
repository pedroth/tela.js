import { CHANNELS, IS_NODE, NUMBER_OF_CORES } from "../Utils/Constants.js";
import Color from "../Color/Color.js";
import { MyWorker } from "../Utils/Utils.js";
//========================================================================================
/*                                                                                      *
 *                                         UTILS                                        *
 *                                                                                      */
//========================================================================================

let WORKERS = [];
const ERROR_MSG_TIMEOUT = 1000;
let isFirstTimeCounter = NUMBER_OF_CORES;

// Shared memory for zero-copy image transfer
let sharedImageBuffer = null;
let sharedImageArray = null;
let prevWidth = 0;
let prevHeight = 0;

/**
 * Check if SharedArrayBuffer is available (requires COOP/COEP headers in browsers)
 */
function isSharedMemoryAvailable() {
    return typeof SharedArrayBuffer !== 'undefined';
}

/**
 * Initialize or resize shared memory buffers
 */
function ensureSharedBuffers(width, height) {
    if (!isSharedMemoryAvailable()) return false;
    
    const requiredSize = width * height * CHANNELS * Float32Array.BYTES_PER_ELEMENT;
    
    if (sharedImageBuffer === null || width !== prevWidth || height !== prevHeight) {
        // Allocate shared buffer for image data
        sharedImageBuffer = new SharedArrayBuffer(requiredSize);
        sharedImageArray = new Float32Array(sharedImageBuffer);
        
        prevWidth = width;
        prevHeight = height;
    }
    
    return true;
}

//========================================================================================
/*                                                                                      *
 *                                         MAIN                                         *
 *                                                                                      */
//========================================================================================

export function parallelWorkers(tela, lambda, dependencies = [], vars = [], memory = {}) {
    // lazy loading workers
    if (WORKERS.length === 0) {
        WORKERS = [...Array(NUMBER_OF_CORES)]
            .map(() => new MyWorker(`./Tela/telaWorker.js`));
    }
    const w = tela.width;
    const h = tela.height;
    const numWorkers = WORKERS.length;
    
    // Try to use shared memory for zero-copy transfer
    const useSharedMemory = ensureSharedBuffers(w, h);
    
    return WORKERS.map((worker, k) => {
        let timerId = undefined;
        return new Promise((resolve) => {
            worker.onMessage(message => {
                const { startRow, endRow, image } = message;
                if (!IS_NODE) clearTimeout(timerId);
                
                if (useSharedMemory) {
                    // Data is already in shared buffer - just copy to tela
                    const startIndex = CHANNELS * w * startRow;
                    const endIndex = CHANNELS * w * endRow;
                    for (let i = startIndex; i < endIndex; i += CHANNELS) {
                        tela.setPxlData(i, Color.ofRGB(
                            sharedImageArray[i],
                            sharedImageArray[i + 1],
                            sharedImageArray[i + 2],
                            sharedImageArray[i + 3]
                        ));
                    }
                } else {
                    // Fallback: copy from transferred array
                    let index = 0;
                    const startIndex = CHANNELS * w * startRow;
                    const endIndex = CHANNELS * w * endRow;
                    for (let i = startIndex; i < endIndex; i += CHANNELS) {
                        tela.setPxlData(i, Color.ofRGB(image[index++], image[index++], image[index++], image[index++]));
                    }
                }
                resolve();
            });
            
            // Calculate row range - use ceiling division for even distribution
            const rowsPerWorker = Math.ceil(h / numWorkers);
            const startRow = k * rowsPerWorker;
            const endRow = Math.min(h, (k + 1) * rowsPerWorker);
            
            const message = {
                __vars: vars,
                __lambda: lambda.toString(),
                __width: w,
                __height: h,
                __startRow: startRow,
                __endRow: endRow,
                __workerIndex: k,
                __dependencies: dependencies.map(d => d.toString()),
                __memory: memory,
                // Shared memory reference (only if available)
                __sharedImageBuffer: useSharedMemory ? sharedImageBuffer : undefined,
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
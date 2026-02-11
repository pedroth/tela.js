import { CHANNELS, IS_NODE, NUMBER_OF_CORES } from "../Utils/Constants.js";
import Color from "../Color/Color.js";
import { MyWorker } from "../Utils/Utils.js";

//========================================================================================
/*                                                                                      *
 *                                         UTILS                                        *
 *                                                                                      */
//========================================================================================

let RAY_MAP_WORKERS = [];

let prevSceneHash = undefined;
let prevScene = undefined;
let serializedScene = undefined;
let isFirstTimeCounter = NUMBER_OF_CORES;

// Shared memory for zero-copy image transfer
let sharedImageBuffer = null;
let sharedImageArray = null;
let sharedSignalBuffer = null;
let sharedSignalArray = null;
let prevWidth = 0;
let prevHeight = 0;

const ERROR_MSG_TIMEOUT = 1000;

/**
 * Check if SharedArrayBuffer is available (requires COOP/COEP headers in browsers)
 */
function isSharedMemoryAvailable() {
    return typeof SharedArrayBuffer !== 'undefined';
}

/**
 * Initialize or resize shared memory buffers
 */
function ensureSharedBuffers(width, height, numWorkers) {
    if (!isSharedMemoryAvailable()) return false;
    
    const requiredSize = width * height * CHANNELS * Float32Array.BYTES_PER_ELEMENT;
    
    if (sharedImageBuffer === null || width !== prevWidth || height !== prevHeight) {
        // Allocate shared buffer for image data
        sharedImageBuffer = new SharedArrayBuffer(requiredSize);
        sharedImageArray = new Float32Array(sharedImageBuffer);
        
        // Allocate shared buffer for worker completion signals (one int32 per worker)
        sharedSignalBuffer = new SharedArrayBuffer(numWorkers * Int32Array.BYTES_PER_ELEMENT);
        sharedSignalArray = new Int32Array(sharedSignalBuffer);
        
        prevWidth = width;
        prevHeight = height;
    }
    
    // Reset completion signals
    sharedSignalArray.fill(0);
    
    return true;
}
//========================================================================================
/*                                                                                      *
 *                                         MAIN                                         *
 *                                                                                      */
//========================================================================================

export function rayMapWorkers(camera, scene, canvas, lambda, vars = [], dependencies = []) {
    // lazy loading workers
    if (RAY_MAP_WORKERS.length === 0) {
        RAY_MAP_WORKERS = [...Array(NUMBER_OF_CORES)]
            .map(() => new MyWorker(`./Camera/rayMapWorker.js`));
    }
    const w = canvas.width;
    const h = canvas.height;
    const numWorkers = RAY_MAP_WORKERS.length;
    
    // Try to use shared memory for zero-copy transfer
    const useSharedMemory = ensureSharedBuffers(w, h, numWorkers);
    
    const newHash = scene?.getHash();
    const isNewScene = prevSceneHash !== newHash;
    if (isNewScene) {
        prevSceneHash = newHash;
        serializedScene = scene?.serialize()
        prevScene = serializedScene;
    } else {
        serializedScene = undefined;
    }
    
    const promises = RAY_MAP_WORKERS.map((worker, k) => {
        return new Promise((resolve) => {
            let timerId = undefined;
            
            worker.onMessage(message => {
                const { startRow, endRow, hasScene, image } = message;
                prevScene = hasScene ? undefined : prevScene;
                if (!IS_NODE) clearTimeout(timerId);
                
                if (useSharedMemory) {
                    // Data is already in shared buffer - just copy to canvas
                    const startIndex = CHANNELS * w * startRow;
                    const endIndex = CHANNELS * w * endRow;
                    for (let i = startIndex; i < endIndex; i += CHANNELS) {
                        canvas.setPxlData(i, Color.ofRGB(
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
                        canvas.setPxlData(i, Color.ofRGB(image[index++], image[index++], image[index++], image[index++]));
                    }
                }
                resolve();
            });
            
            // Calculate row range - use ceiling division for even distribution
            const rowsPerWorker = Math.ceil(h / numWorkers);
            const startRow = k * rowsPerWorker;
            const endRow = Math.min(h, (k + 1) * rowsPerWorker);

            const message = {
                width: w,
                height: h,
                vars: vars,
                lambda: lambda.toString(),
                startRow: startRow,
                endRow: endRow,
                workerIndex: k,
                camera: camera.serialize(),
                dependencies: dependencies.map(d => d.toString()),
                scene: isNewScene ? serializedScene : prevScene !== undefined ? prevScene : undefined,
                // Shared memory references (only if available)
                sharedImageBuffer: useSharedMemory ? sharedImageBuffer : undefined,
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
    });
    
    return promises;
}

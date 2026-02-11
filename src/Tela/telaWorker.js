import { CHANNELS, IS_NODE } from "../Utils/Constants.js";
import { memoize } from "../Utils/Utils.js";
// necessary to load this even though is not used in the code, it might be used in the eval.
import Color from "../Color/Color.js";
import Box from "../Geometry/Box.js";
import Triangle from "../Geometry/Triangle.js";
import Line from "../Geometry/Line.js";
import Vec, { Vec2, Vec3 } from "../Vector/Vector.js";
import Camera from "../Camera/Camera.js";
import Ray from "../Ray/Ray.js";

const parentPort = IS_NODE ? (await import("node:worker_threads")).parentPort : undefined;
let memory = {}

// Cached shared memory view
let sharedImageArray = null;

async function main(inputs) {
    const {
        __vars,
        __lambda,
        __width,
        __height,
        __startRow,
        __endRow,
        __dependencies,
        __memory,
        __sharedImageBuffer,
        __workerIndex,
    } = inputs;
    memory = {...memory, ...__memory };
    
    // Use shared memory if available, otherwise allocate local buffer
    const useSharedMemory = __sharedImageBuffer !== undefined;
    let image;
    let writeIndex;
    
    if (useSharedMemory) {
        // Create or reuse view into shared buffer
        if (sharedImageArray === null || sharedImageArray.buffer !== __sharedImageBuffer) {
            sharedImageArray = new Float32Array(__sharedImageBuffer);
        }
        image = sharedImageArray;
        // Write directly to our region in the shared buffer
        writeIndex = CHANNELS * __width * __startRow;
    } else {
        // Fallback to local buffer (will be copied on postMessage)
        const bufferSize = __width * (__endRow - __startRow + 1) * CHANNELS;
        image = new Float32Array(bufferSize);
        writeIndex = 0;
    }
    
    const func = getLambda(__lambda, __dependencies);
    // the order does matter
    for (let i = __startRow; i < __endRow; i++) {
        for (let x = 0; x < __width; x++) {
            const y = __height - 1 - i;
            const color = await func(x, y, __vars, memory);
            if (!color) continue;
            image[writeIndex++] = color.red;
            image[writeIndex++] = color.green;
            image[writeIndex++] = color.blue;
            image[writeIndex++] = color.alpha;
        }
    }
    
    // Return metadata only when using shared memory (no data copy needed)
    if (useSharedMemory) {
        return { startRow: __startRow, endRow: __endRow, workerIndex: __workerIndex };
    }
    return { image, startRow: __startRow, endRow: __endRow };
}

const getLambda = memoize((lambda, dependencies) => {
    const __lambda = eval(`
        ${dependencies.map(d => d.toString()).join("\n")}
        const __lambda = ${lambda};
        __lambda;
    `)
    return __lambda;
});


if (IS_NODE) {
    parentPort.on("message", async message => {
        const input = message;
        const output = await main(input);
        parentPort.postMessage(output);
    });
} else {
    onmessage = async message => {
        const input = message.data;
        const output = await main(input);
        postMessage(output);
    };
}

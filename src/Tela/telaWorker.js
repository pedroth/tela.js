import { CHANNELS, IS_NODE } from "../Utils/Constants.js";
import { memoize } from "../Utils/Utils.js";
// necessary to load this even though is not used in the code, it might be used in the eval.
import Color from "../Color/Color.js";
import Box from "../Geometry/Box.js";
import Vec, { Vec2, Vec3 } from "../Vector/Vector.js";
import Camera from "../Camera/Camera.js";
import Ray from "../Ray/Ray.js";

const parentPort = IS_NODE ? (await import("node:worker_threads")).parentPort : undefined;

async function main(inputs) {
    const {
        __vars,
        __lambda,
        __width,
        __height,
        __startRow,
        __endRow,
        __dependencies,
    } = inputs;
    const bufferSize = __width * (__endRow - __startRow + 1) * CHANNELS;
    const image = new Float32Array(bufferSize);
    let index = 0;
    const func = getLambda(__lambda, __dependencies);
    // the order does matter
    for (let i = __startRow; i < __endRow; i++) {
        for (let x = 0; x < __width; x++) {
            const y = __height - 1 - i;
            const color = func(x, y, __vars);
            if (!color) continue;
            image[index++] = color.red;
            image[index++] = color.green;
            image[index++] = color.blue;
            image[index++] = color.alpha;
        }
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

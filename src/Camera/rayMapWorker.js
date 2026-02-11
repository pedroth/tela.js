import Camera from "./Camera.js";
import { memoize } from "../Utils/Utils.js";
import { clamp } from "../Utils/Math.js";
import { CHANNELS, IS_NODE } from "../Utils/Constants.js";
import { deserializeScene } from "../Scene/utils.js";
import Color from "../Color/Color.js";
import Box from "../Geometry/Box.js";
import Sphere from "../Geometry/Sphere.js";
import Vec, { Vec2, Vec3 } from "../Vector/Vector.js";
import Ray from "../Ray/Ray.js";
import { rayTrace, renderBackground } from "./rayTrace.js";

const Canvas = !IS_NODE ? (await import("../Tela/Canvas.js")).default : undefined;
const Image = IS_NODE ? (await import("../Tela/Image.js")).default : undefined;
const TELA = IS_NODE ? Image : Canvas;
const parentPort = IS_NODE ? (await import("node:worker_threads")).parentPort : undefined;

let scene = undefined;
let _memory_ = {}

// Cached shared memory views
let sharedImageArray = null;

function getScene(serializedScene) {
    return deserializeScene(serializedScene).then(s => s.rebuild());
}

async function main(inputs) {
    const {
        startRow,
        endRow,
        width,
        height,
        vars,
        dependencies,
        lambda,
        scene: serializedScene,
        camera: serializedCamera,
        sharedImageBuffer,
        workerIndex,
    } = inputs;

    scene = serializedScene ? (await getScene(serializedScene)) : scene;
    const camera = Camera.deserialize(serializedCamera);
    const rayGen = camera.rayFromImage(width, height);
    const __lambda = getLambda(lambda, dependencies);
    
    // Use shared memory if available, otherwise allocate local buffer
    const useSharedMemory = sharedImageBuffer !== undefined;
    let image;
    let writeIndex;
    
    if (useSharedMemory) {
        // Create or reuse view into shared buffer
        if (sharedImageArray === null || sharedImageArray.buffer !== sharedImageBuffer) {
            sharedImageArray = new Float32Array(sharedImageBuffer);
        }
        image = sharedImageArray;
        // Write directly to our region in the shared buffer
        writeIndex = CHANNELS * width * startRow;
    } else {
        // Fallback to local buffer (will be copied on postMessage)
        const bufferSize = width * (endRow - startRow + 1) * CHANNELS;
        image = new Float32Array(bufferSize);
        writeIndex = 0;
    }
    
    // the order does matter
    for (let y = startRow; y < endRow; y++) {
        for (let x = 0; x < width; x++) {
            const ray = rayGen(x, height - 1 - y);
            const color = await __lambda(ray, { ...vars, scene, _memory_ });
            if (!color) continue;
            image[writeIndex++] = color.red;
            image[writeIndex++] = color.green;
            image[writeIndex++] = color.blue;
            image[writeIndex++] = color.alpha;
        }
    }
    
    // Return metadata only when using shared memory (no data copy needed)
    if (useSharedMemory) {
        return { startRow, endRow, workerIndex };
    }
    return { image, startRow, endRow };
}

const getLambda = memoize((lambda, dependencies) => {
    const code = `
        ${dependencies.map(d => d.toString()).join("\n")}
        const __lambda = ${lambda};
        __lambda;
        `
    const __lambda = eval(code)
    return __lambda;
});


if (IS_NODE) {
    parentPort.on("message", async message => {
        const input = message;
        const output = await main(input);
        parentPort.postMessage({ ...output, hasScene: scene !== undefined });
    });
} else {
    self.onmessage = async message => {
        const input = message.data;
        const output = await main(input);
        postMessage({ ...output, hasScene: scene !== undefined });
    };
}

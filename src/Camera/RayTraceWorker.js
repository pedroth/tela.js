import Camera from "./Camera.js";
import Scene from "../Scene/Scene.js"
import { rayTrace } from "./raytrace.js";
import { CHANNELS } from "../Tela/Tela.js";
import { IS_NODE } from "../Utils/Constants.js";

const parentPort = IS_NODE ? (await import("node:worker_threads")).parentPort : undefined;

let scene = undefined;

function main(inputs) {
    const {
        startRow,
        endRow,
        width,
        height,
        params,
        scene: serializedScene,
        camera: serializedCamera,
    } = inputs;
    scene = serializedScene ? Scene.deserialize(serializedScene).rebuild() : scene;
    const camera = Camera.deserialize(serializedCamera);
    const rayGen = camera.rayFromImage(width, height);
    const bufferSize = width * (endRow - startRow + 1) * CHANNELS;
    const image = new Float32Array(bufferSize);
    if (!scene) return { image, startRow, endRow };
    let index = 0;
    // the order does matter
    for (let y = startRow; y < endRow; y++) {
        for (let x = 0; x < width; x++) {
            const ray = rayGen(x, height - 1 - y);
            const color = rayTrace(ray, scene, params);
            image[index++] = color.red;
            image[index++] = color.green;
            image[index++] = color.blue;
            image[index++] = color.alpha;
        }
    }
    return { image, startRow, endRow };
}


if (IS_NODE) {
    parentPort.on("message", message => {
        const input = message;
        const output = main(input);
        parentPort.postMessage(output);
    });
} else {
    onmessage = message => {
        const input = message.data;
        const output = main(input);
        postMessage(output);
    };
}

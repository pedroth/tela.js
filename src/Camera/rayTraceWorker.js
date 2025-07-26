import Camera from "./Camera.js";
import { rayTrace } from "./rayTrace.js";
import { CHANNELS, IS_NODE } from "../Utils/Constants.js";
import { deserializeScene } from "../Scene/utils.js";
import Color from "../Color/Color.js";


const Canvas = !IS_NODE ? (await import("../Tela/Canvas.js")).default : undefined;
const Image = IS_NODE ? (await import("../Tela/Image.js")).default : undefined;
const parentPort = IS_NODE ? (await import("node:worker_threads")).parentPort : undefined;

let scene = undefined;
let _memory_ = {}

function getScene(serializedScene) {
    return deserializeScene(serializedScene).then(s => s.rebuild());
}

async function main(inputs) {
    const {
        startRow,
        endRow,
        width,
        height,
        params,
        scene: serializedScene,
        camera: serializedCamera,
    } = inputs;
    scene = serializedScene ? await getScene(serializedScene) : scene;
    const camera = Camera.deserialize(serializedCamera);
    const rayGen = camera.rayFromImage(width, height);
    const bufferSize = width * (endRow - startRow + 1) * CHANNELS;
    const image = new Float32Array(bufferSize);
    let index = 0;
    // the order does matter
    for (let y = startRow; y < endRow; y++) {
        for (let x = 0; x < width; x++) {
            const ray = rayGen(x, height - 1 - y);
            const color = scene ? rayTrace(ray, scene, params) : Color.random();
            image[index++] = color.red;
            image[index++] = color.green;
            image[index++] = color.blue;
            image[index++] = color.alpha;
        }
    }
    return { image, startRow, endRow };
}


if (IS_NODE) {
    parentPort.on("message", async message => {
        const input = message;
        const output = await main(input);
        parentPort.postMessage({ ...output, hasScene: scene !== undefined });
    });
} else {
    onmessage = async message => {
        const input = message.data;
        const output = await main(input);
        postMessage({ ...output, hasScene: scene !== undefined });
    };

    onerror = e => console.log("Caught error on rayTrace worker", e);
}

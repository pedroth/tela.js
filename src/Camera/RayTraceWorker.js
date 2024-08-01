import Ray from "../Ray/Ray.js";
import Camera from "./Camera.js";
import Scene from "../Scene/Scene.js"
import Color from "../Color/Color.js";
import Vec from "../Vector/Vector.js";
import { trace } from "./raytrace.js";
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
    let index = 0;
    const bounces = params.bounces;
    const samplesPerPxl = params.samplesPerPxl;
    const variance = params.variance;
    const gamma = params.gamma;
    const invSamples = (bounces || 1) / samplesPerPxl;
    // const useCache = params.useCache;
    // the order does matter
    for (let y = startRow; y < endRow; y++) {
        for (let x = 0; x < width; x++) {
            let c = Color.BLACK;
            const ray = rayGen(x, height - 1 - y)
            for (let i = 0; i < samplesPerPxl; i++) {
                const epsilon = Vec.RANDOM(3).scale(variance);
                const epsilonOrtho = epsilon.sub(ray.dir.scale(epsilon.dot(ray.dir)));
                const r = Ray(ray.init, ray.dir.add(epsilonOrtho).normalize());
                c = c.add(trace(r, scene, { bounces }))
            }
            const color = c.scale(invSamples).toGamma(gamma);
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

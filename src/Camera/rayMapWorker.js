import Camera from "./Camera.js";
import { memoize} from "../Utils/Utils.js";
import { clamp } from "../Utils/Math.js";
import { CHANNELS, IS_NODE } from "../Utils/Constants.js";
import { deserializeScene } from "../Scene/utils.js";
import Color from "../Color/Color.js";
import Box from "../Geometry/Box.js";
import Sphere from "../Geometry/Sphere.js";
import Vec, { Vec2, Vec3 } from "../Vector/Vector.js";
import Ray from "../Ray/Ray.js";

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
        vars,
        dependencies,
        lambda,
        scene: serializedScene,
        camera: serializedCamera,
    } = inputs;

    scene = serializedScene ? (await getScene(serializedScene)) : scene;
    const camera = Camera.deserialize(serializedCamera);
    const rayGen = camera.rayFromImage(width, height);
    const __lambda = getLambda(lambda, dependencies);
    const bufferSize = width * (endRow - startRow + 1) * CHANNELS;
    const image = new Float32Array(bufferSize);
    let index = 0;
    // the order does matter
    for (let y = startRow; y < endRow; y++) {
        for (let x = 0; x < width; x++) {
            const ray = rayGen(x, height - 1 - y);
            const color = await __lambda(ray, { ...vars, scene, _memory_});
            if(!color) continue;
            image[index++] = color.red;
            image[index++] = color.green;
            image[index++] = color.blue;
            image[index++] = color.alpha;
        }
    }
    return { image, startRow, endRow };
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
        parentPort.postMessage({...output, hasScene: scene !== undefined});
    });
} else {
    self.onmessage = async message => {
        const input = message.data;
        const output = await main(input);
        postMessage({...output, hasScene: scene !== undefined});
    };
}

import { IS_NODE } from "../Utils/Constants.js";
import Color from "../Color/Color.js";
import { CHANNELS } from "../Tela/Tela.js";

const parentPort = IS_NODE ? (await import("node:worker_threads")).parentPort : undefined;

function random() {
    return new Promise((res) => {
        setTimeout(() => res(Color.random()), 1);
    })
}

async function main(inputs) {
    const {
        startRow,
        endRow,
        width,
    } = inputs;
    const bufferSize = width * (endRow - startRow + 1) * CHANNELS;
    const image = new Float32Array(bufferSize);
    let index = 0;
    // the order does matter
    for (let y = startRow; y < endRow; y++) {
        for (let x = 0; x < width; x++) {
            const color = await random();
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
        parentPort.postMessage(output);
    });
} else {
    onmessage = async message => {
        const input = message.data;
        const output = await main(input);
        postMessage(output);
    };
}

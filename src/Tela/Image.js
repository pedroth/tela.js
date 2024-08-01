import Color from "../Color/Color.js";
import { readImageFrom } from "../IO/IO.js";
import { MAX_8BIT } from "../Utils/Constants.js";
import { memoize } from "../Utils/Utils.js";
import Tela, { CHANNELS } from "./Tela.js";
import { Worker } from "node:worker_threads";
import os from "node:os";

export default class Image extends Tela {

    mapParallel = memoize((lambda, dependencies = []) => {
        const N = os.cpus().length;
        const w = this.width;
        const h = this.height;
        const fun = ({ _start_row, _end_row, _width_, _height_, _worker_id_, _vars_ }) => {
            const image = new Float32Array(CHANNELS * _width_ * (_end_row - _start_row));
            const startIndex = CHANNELS * _width_ * _start_row;
            const endIndex = CHANNELS * _width_ * _end_row;
            let index = 0;
            for (let k = startIndex; k < endIndex; k += CHANNELS) {
                const i = Math.floor(k / (CHANNELS * _width_));
                const j = Math.floor((k / CHANNELS) % _width_);
                const x = j;
                const y = _height_ - 1 - i;
                const color = lambda(x, y, { ..._vars_ });
                if (!color) continue;
                image[index] = color.red;
                image[index + 1] = color.green;
                image[index + 2] = color.blue;
                image[index + 3] = 1;
                index += CHANNELS;
            }
            return { image, _start_row, _end_row, _worker_id_ };
        }
        const workers = [...Array(N)].map(() => createWorker(fun, lambda, dependencies));
        return {
            run: (vars = {}) => {
                // in node promise.all is faster than the canvas method
                return Promise
                    .all(workers.map((worker, k) => {
                        return new Promise((resolve) => {
                            worker.removeAllListeners('message');
                            worker.on("message", (message) => {
                                const { image, _start_row, _end_row } = message;
                                let index = 0;
                                const startIndex = CHANNELS * w * _start_row;
                                const endIndex = CHANNELS * w * _end_row;
                                for (let i = startIndex; i < endIndex; i++) {
                                    this.image[i] = image[index];
                                    index++;
                                }
                                return resolve();
                            });
                            const ratio = Math.floor(h / N);
                            worker.postMessage({
                                _start_row: k * ratio,
                                _end_row: Math.min(h - 1, (k + 1) * ratio),
                                _width_: w,
                                _height_: h,
                                _worker_id_: k,
                                _vars_: vars
                            });
                        })
                    }))
                    .then(() => this.paint());
            }
        }
    });

    toArray() {
        const w = this.width;
        const h = this.height;
        const imageData = new Uint8Array(this.width * this.height * 4);

        for (let i = 0; i < h; i++) {
            for (let j = 0; j < w; j++) {
                let index = w * i + j;
                index <<= 2; // multiply by 4
                imageData[index] = this.image[index] * MAX_8BIT;
                imageData[index + 1] = this.image[index + 1] * MAX_8BIT;
                imageData[index + 2] = this.image[index + 2] * MAX_8BIT;
                imageData[index + 3] = this.image[index + 3] * MAX_8BIT;
            }
        }
        return imageData;
    }

    //========================================================================================
    /*                                                                                      *
     *                                    Static Methods                                    *
     *                                                                                      */
    //========================================================================================


    static ofUrl(url) {
        return readImageFrom(url);
    }

    static ofSize(width, height) {
        return new Image(width, height);
    }

    static ofImage(image) {
        const w = image.width;
        const h = image.height;
        return Image.ofSize(w, h)
            .map((x, y) => {
                return image.getPxl(x, y);
            })
    }
}

//========================================================================================
/*                                                                                      *
 *                                        Private                                       *
 *                                                                                      */
//========================================================================================


const createWorker = (main, lambda, dependencies) => {
    const workerFile = `
    const { parentPort } = require("node:worker_threads");
    const CHANNELS = ${CHANNELS};
    ${dependencies.concat([Color]).map(d => d.toString()).join("\n")}
    const lambda = ${lambda.toString()};
    const __main__ = ${main.toString()};
    parentPort.on("message", message => {
        const output = __main__(message);
        parentPort.postMessage(output);
    });
    `;
    const worker = new Worker(workerFile, { eval: true });
    return worker;
};
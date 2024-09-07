import Tela from "./Tela.js";
import Color from "../Color/Color.js";
import { readImageFrom } from "../IO/IO.js";
import { memoize } from "../Utils/Utils.js";
import { CHANNELS } from "../Utils/Constants.js";
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

    serialize() {
        return { type: Image.name, url: this.url };
    }

    //========================================================================================
    /*                                                                                      *
     *                                    Static Methods                                    *
     *                                                                                      */
    //========================================================================================


    static ofUrl(url) {
        const { width: w, height: h, pixels } = readImageFrom(url);
        const img = Image.ofSize(w, h);
        for (let k = 0; k < pixels.length; k++) {
            const { r, g, b } = pixels[k];
            const i = Math.floor(k / w);
            const j = k % w;
            const x = j;
            const y = h - 1 - i;
            img.setPxl(x, y, Color.ofRGBRaw(r, g, b));
        }
        img.url = url;
        return img;
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
    import("./src/index.js").then(_module => {
        const {
            Box,
            Vec,
            Vec2,
            Vec3,
            Mesh,
            Color,
            Image,
            BScene,
            Camera,
            KScene,
            Sphere,
            CHANNELS
            MAX_8BIT,
            NaiveScene,
        } = _module;
        ${dependencies.map(d => d.toString()).join("\n")}
        const lambda = ${lambda.toString()};
        const __main__ = ${main.toString()};
        parentPort.on("message", message => {
            const output = __main__(message);
            parentPort.postMessage(output);
        });
    })
    `;
    const worker = new Worker(workerFile, { eval: true });
    return worker;
};
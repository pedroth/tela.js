import { memoize } from "../Utils/Utils.js";
import Color from "../Color/Color.js";
import { MAX_8BIT } from "../Utils/Constants.js";
import { clamp } from "../Utils/Math.js";
import sdl from "@kmamal/sdl";
import os from 'node:os';
import { Worker } from "node:worker_threads";
import Tela, { CHANNELS } from "./Tela.js";
import { Buffer } from "node:buffer";


const clamp01 = clamp();

export default class Window extends Tela {

    constructor(width, height, title = "") {
        super(width, height);
        this.title = title;
        this.window = sdl.video.createWindow({ title, width, height, resizable: true });
    }

    setTitle(title) {
        this.title = title;
        this.window.setTitle(title);
        return this;
    }

    paint() {
        const buffer = Buffer.allocUnsafe(this.image.length);
        buffer.set(this.image.map(x => clamp01(x) * MAX_8BIT));
        this.window.render(this.width, this.height, this.width * CHANNELS, 'rgba32', buffer);
        return this;
    }

    close() {
        this.window.hide();
        this.window.destroy();
        return this;
    }

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

    onMouseDown(lambda) {
        this.window.on("mouseButtonDown", handleMouse(this, lambda));
        return this;
    }

    onMouseUp(lambda) {
        this.window.on("mouseButtonUp", handleMouse(this, lambda));
        return this;
    }

    onMouseMove(lambda) {
        this.window.on("mouseMove", handleMouse(this, lambda));
        return this;
    }

    onMouseWheel(lambda) {
        this.window.on("mouseWheel", lambda);
        return this;
    }

    onKeyDown(lambda) {
        this.window.on("keyDown", lambda);
        return this;
    }

    onKeyUp(lambda) {
        this.window.on("keyDown", lambda);
        return this;
    }

    setWindowSize(w, h) {
        this.window.setSize(w, h);
        return this;
    }

    //========================================================================================
    /*                                                                                      *
     *                                    Static Methods                                    *
     *                                                                                      */
    //========================================================================================

    static ofUrl(url) {
        // TODO
    }

    static ofSize(width, height) {
        return new Window(width, height);
    }

    static ofImage(image) {
        const w = image.width;
        const h = image.height;
        return Window.ofSize(w, h)
            .map((x, y) => {
                return image.get(x, y);
            })
    }

    static LEFT_CLICK = 1;
    static MIDDLE_CLICK = 2;
    static RIGHT_CLICK = 3;
}

//========================================================================================
/*                                                                                      *
 *                                   Private functions                                  *
 *                                                                                      */
//========================================================================================

function handleMouse(canvas, lambda) {
    return ({ x, y }) => {
        return lambda(x, canvas.height - 1 - y);
    }
}

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
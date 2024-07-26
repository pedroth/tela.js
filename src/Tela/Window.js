import Box from "../Geometry/Box.js";
import { memoize } from "../Utils/Utils.js";
import Color from "../Color/Color.js";
import { MAX_8BIT } from "../Utils/Constants.js";
import { clamp, clipLine, isInsideConvex, mod } from "../Utils/Math.js";
import { Vec2 } from "../Vector/Vector.js";
import sdl from "@kmamal/sdl";
import os from 'node:os';
import { Worker } from "node:worker_threads";


const clamp01 = clamp();

export default class Window {

    constructor(width, height, title = "") {
        this._width = width;
        this._height = height;
        this._title = title;
        this._window = sdl.video.createWindow({ title, width, height, resizable: true });
        this._image = new Float32Array(this._width * this._height * 4);
        this.box = new Box(Vec2(0, 0), Vec2(this._width, this._height))
    }

    get width() {
        return this._width;
    }

    get height() {
        return this._height;
    }

    setTitle(title) {
        this._title = title;
        this._window.setTitle(title);
        return this;
    }

    paint() {
        const buffer = Buffer.allocUnsafe(this._image.length);
        buffer.set(this._image.map(x => clamp01(x) * MAX_8BIT));
        this._window.render(this._width, this._height, this._width * 4, 'rgba32', buffer);
        return this;
    }

    close() {
        this._window.hide();
        this._window.destroy();
        return this;
    }

    /**
     * lambda: (x: Number, y: Number) => Color 
     */
    map(lambda, paint = true) {
        const n = this._image.length;
        const w = this._width;
        const h = this._height;
        for (let k = 0; k < n; k += 4) {
            const i = Math.floor(k / (4 * w));
            const j = Math.floor((k / 4) % w);
            const x = j;
            const y = h - 1 - i;
            const color = lambda(x, y);
            if (!color) continue;
            this._image[k] = color.red;
            this._image[k + 1] = color.green;
            this._image[k + 2] = color.blue;
            this._image[k + 3] = 1;
        }
        if (paint) return this.paint();
        return this;
    }

    mapParallel = memoize((lambda, dependencies = []) => {
        const N = os.cpus().length;
        const w = this._width;
        const h = this._height;
        const fun = ({ _start_row, _end_row, _width_, _height_, _worker_id_, _vars_ }) => {
            const image = new Float32Array(4 * _width_ * (_end_row - _start_row));
            const startIndex = 4 * _width_ * _start_row;
            const endIndex = 4 * _width_ * _end_row;
            let index = 0;
            for (let k = startIndex; k < endIndex; k += 4) {
                const i = Math.floor(k / (4 * _width_));
                const j = Math.floor((k / 4) % _width_);
                const x = j;
                const y = _height_ - 1 - i;
                const color = lambda(x, y, { ..._vars_ });
                if (!color) continue;
                image[index] = color.red;
                image[index + 1] = color.green;
                image[index + 2] = color.blue;
                image[index + 3] = 1;
                index += 4;
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
                                const startIndex = 4 * w * _start_row;
                                const endIndex = 4 * w * _end_row;
                                for (let i = startIndex; i < endIndex; i++) {
                                    this._image[i] = image[index];
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

    /**
     * color: Color 
     */
    fill(color) {
        if (!color) return;
        const n = this._image.length;
        for (let k = 0; k < n; k += 4) {
            this._image[k] = color.red;
            this._image[k + 1] = color.green;
            this._image[k + 2] = color.blue;
            this._image[k + 3] = 1;
        }
        return this;
    }

    onMouseDown(lambda) {
        this._window.on("mouseButtonDown", handleMouse(this, lambda));
        return this;
    }

    onMouseUp(lambda) {
        this._window.on("mouseButtonUp", handleMouse(this, lambda));
        return this;
    }

    onMouseMove(lambda) {
        this._window.on("mouseMove", handleMouse(this, lambda));
        return this;
    }

    onMouseWheel(lambda) {
        this._window.on("mouseWheel", lambda);
        return this;
    }

    onKeyDown(lambda) {
        this._window.on("keyDown", lambda);
        return this;
    }

    onKeyUp(lambda) {
        this._window.on("keyDown", lambda);
        return this;
    }

    getPxl(x, y) {
        const w = this._width;
        const h = this._height;
        let [i, j] = this.canvas2grid(x, y);
        i = mod(i, h);
        j = mod(j, w);
        let index = 4 * (w * i + j);
        return Color.ofRGB(this._image[index], this._image[index + 1], this._image[index + 2], this._image[index + 3]);
    }

    setPxl(x, y, color) {
        const w = this._width;
        const [i, j] = this.canvas2grid(x, y);
        let index = 4 * (w * i + j);
        this._image[index] = color.red;
        this._image[index + 1] = color.green;
        this._image[index + 2] = color.blue;
        this._image[index + 3] = 1;
        return this;
    }

    setPxlData(index, [r, g, b]) {
        this._image[index] = r;
        this._image[index + 1] = g;
        this._image[index + 2] = b;
        this._image[index + 3] = 1.0;
        return this;
    }

    drawLine(p1, p2, shader) {
        const w = this._width;
        const h = this._height;
        const line = clipLine(p1, p2, this.box);
        if (line.length <= 1) return;
        const [pi, pf] = line;
        const v = pf.sub(pi);
        const n = v.map(Math.abs).fold((e, x) => e + x);
        for (let k = 0; k < n; k++) {
            const s = k / n;
            const lineP = pi.add(v.scale(s)).map(Math.floor);
            const [x, y] = lineP.toArray();
            const j = x;
            const i = h - 1 - y;
            const index = w * i + j;
            const color = shader(x, y);
            if (!color) continue;
            this._image[index] = color;
        }
        return this;
    }

    drawTriangle(x1, x2, x3, shader) {
        return drawConvexPolygon(this, [x1, x2, x3], shader);
    }

    //========================================================================================
    /*                                                                                      *
     *                                     Window Utils                                     *
     *                                                                                      */
    //========================================================================================

    grid2canvas(i, j) {
        const h = this.height;
        const x = j;
        const y = h - 1 - i;
        return [x, y]
    }

    canvas2grid(x, y) {
        const h = this._height;
        const j = Math.floor(x);
        const i = Math.floor(h - 1 - y);
        return [i, j];
    }

    exposure(time = Number.MAX_VALUE) {
        let it = 1;
        const ans = {};
        for (let key of Object.getOwnPropertyNames(Object.getPrototypeOf(this))) {
            const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(this), key);
            if (descriptor && typeof descriptor.value === 'function') {
                ans[key] = descriptor.value.bind(this);
            }
        }
        ans.width = this.width;
        ans.height = this.height;
        ans.map = (lambda) => {
            const n = this._image.length;
            const w = this._width;
            const h = this._height;
            for (let k = 0; k < n; k++) {
                const i = Math.floor(k / w);
                const j = k % w;
                const x = j;
                const y = h - 1 - i;
                const color = lambda(x, y);
                if (!color) continue;
                this._image[k] = Color.ofRGB(
                    this._image[k].red + (color.red - this._image[k].red) / it,
                    this._image[k].green + (color.green - this._image[k].green) / it,
                    this._image[k].blue + (color.blue - this._image[k].blue) / it,
                );
            }
            if (it < time) it++
            return this.paint();
        }
        return ans;
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

function drawConvexPolygon(canvas, positions, shader) {
    const { width, height } = canvas;
    const canvasBox = canvas.box;
    let boundingBox = Box.EMPTY;
    positions.forEach((x) => {
        boundingBox = boundingBox.add(new Box(x, x));
    });
    const finalBox = canvasBox.intersection(boundingBox);
    if (finalBox.isEmpty) return canvas;
    const [xMin, yMin] = finalBox.min.toArray();
    const [xMax, yMax] = finalBox.max.toArray();

    const isInsideFunc = isInsideConvex(positions);
    for (let x = xMin; x < xMax; x++) {
        for (let y = yMin; y < yMax; y++) {
            if (isInsideFunc(Vec2(x, y))) {
                const j = x;
                const i = height - 1 - y;
                const color = shader(x, y);
                if (!color) continue;
                const index = 4 * (width * i + j);
                canvas._image[index] = color.red;
                canvas._image[index + 1] = color.green;
                canvas._image[index + 2] = color.blue;
                canvas._image[index + 3] = color.alpha;
            }
        }
    }
    return canvas;
}

function handleMouse(canvas, lambda) {
    return ({ x, y }) => {
        return lambda(x, canvas.height - 1 - y);
    }
}

const createWorker = (main, lambda, dependencies) => {
    const workerFile = `
    const { parentPort } = require("node:worker_threads");

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
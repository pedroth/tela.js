import Box from "../Box/Box.js";
import Color from "../Color/Color.js";
import { clipLine, isInsideConvex, mod } from "../Utils/Math.js";
import { Vec2 } from "../Vector/Vector.js";
import sdl from "@kmamal/sdl"

export default class Window {

    constructor(width, height, title = "") {
        this._width = width;
        this._height = height;
        this._title = title;
        this._window = sdl.video.createWindow({ title });
        this._image = new Array(this._width * this._height)
            .fill(() => Color.ofRGB());
    }

    get width() {
        return this._width;
    }

    get height() {
        return this._height;
    }

    setTitle(title) {
        this._title = title;
        return this;
    }

    /**
     * color: Color 
     */
    fill(color) {
        return this.map(() => color);
    }

    paint() {
        const buffer = this.toArray();
        this._window.render(this._width, this._height, this._width * 4, 'bgra32', buffer)
        return this;
    }

    /**
     * lambda: (x: Number, y: Number) => Color 
     */
    map(lambda) {
        const n = this._image.length;
        const w = this._width;
        const h = this._height;
        for (let k = 0; k < n; k++) {
            const i = Math.floor(k / w);
            const j = k % w;
            const x = j;
            const y = h - 1 - i;
            this._image[k] = lambda(x, y);
        }
        return this;
    }

    setPxl(x, y, color) {
        const w = this._width;
        const [i, j] = this.canvas2grid(x, y);
        let index = w * i + j;
        this._image[index] = color;
        return this;
    }

    getPxl(x, y) {
        const w = this._width;
        const h = this._height;
        let [i, j] = this.canvas2grid(x, y);
        i = mod(i, h);
        j = mod(j, w);
        let index = w * i + j;
        return this._image[index];
    }

    drawLine(p1, p2, shader) {
        const w = this._width;
        const h = this._height;
        const line = clipLine(p1, p2, new Box(Vec2(0, 0), Vec2(w, h)));
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

    array() {
        return this.toArray();
    }

    toArray() {
        const w = this._width;
        const h = this._height;
        const imageData = new Uint8Array(this._width * this._height * 4);

        for (let i = 0; i < h; i++) {
            for (let j = 0; j < w; j++) {
                let index = w * i + j;
                const color = this._image[index];
                index <<= 2; // multiply by 4
                imageData[index] = color.red * 255;
                imageData[index + 1] = color.green * 255;
                imageData[index + 2] = color.blue * 255;
                imageData[index + 3] = 255;
            }
        }
        return imageData;
    }

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
}



function drawConvexPolygon(canvas, positions, shader) {
    const { width, height } = canvas;
    const canvasBox = new Box(Vec2(), Vec2(width, height));
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
                const index = width * i + j;
                canvas._image[index] = color;
            }
        }
    }
    return canvas;
}
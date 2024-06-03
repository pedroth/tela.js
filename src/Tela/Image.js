import Box from "../Geometry/Box.js";
import Color from "../Color/Color.js";
import { readImageFrom } from "../IO/IO.js";
import { MAX_8BIT } from "../Utils/Constants.js";
import { clipLine, isInsideConvex, mod } from "../Utils/Math.js";
import { Vec2 } from "../Vector/Vector.js";

export default class Image {

    constructor(width, height) {
        this._width = width;
        this._height = height;
        this._image = new Array(this._width * this._height)
            .fill(() => Color.ofRGB());
        this.box = new Box(Vec2(0, 0), Vec2(this._width, this._height))
    }

    get width() {
        return this._width;
    }

    get height() {
        return this._height;
    }

    paint() {
        // to implement the same interface as canvas
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

    /**
     * color: Color 
     */
    fill(color) {
        return this.map(() => color);
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
     *                                      Image Utils                                     *
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
            for (let k = 0; k < n; k += 4) {
                const i = Math.floor(k / (4 * w));
                const j = Math.floor((k / 4) % w);
                const x = j;
                const y = h - 1 - i;
                const color = lambda(x, y);
                if (!color) continue;
                this._image[k] = this._image[k] + (color.red * MAX_8BIT - this._image[k]) / it;
                this._image[k + 1] = this._image[k + 1] + (color.green * MAX_8BIT - this._image[k + 1]) / it;
                this._image[k + 2] = this._image[k + 2] + (color.blue * MAX_8BIT - this._image[k + 2]) / it;
                this._image[k + 3] = MAX_8BIT;
            }
            if (it < time) it++
            return this.paint();
        }
        return ans;
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
                imageData[index] = color.red * MAX_8BIT;
                imageData[index + 1] = color.green * MAX_8BIT;
                imageData[index + 2] = color.blue * MAX_8BIT;
                imageData[index + 3] = MAX_8BIT;
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
                return image.get(x, y);
            })
    }
}

//========================================================================================
/*                                                                                      *
 *                                   Private functions                                  *
 *                                                                                      */
//========================================================================================

function drawConvexPolygon(canvas, positions, shader) {
    const { width, height } = canvas;
    const canvasBox = this.box;
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
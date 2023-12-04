import Color from "../Color/Color.js";
export default class Image {

    constructor(width, height) {
        this._width = width;
        this._height = height;
        this._image = new Array(this._width * this._height)
            .fill(() => Color.ofRGB());
    }

    get width() {
        return this._width;
    }

    get height() {
        return this._height;
    }

    /**
     * color: Color 
     */
    fill(color) {
        return this._image.map(() => color);
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

    toArray() {
        const w = this._width;
        const h = this._height;
        const imageData = new Uint8Array(this._width * this._height * 4);

        for (let i = 0; i < h; i++) {
            for (let j = 0; j < w; j++) {
                let index = (w * i + j);
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

    static ofSize(width, height) {
        return new Image(width, height);
    }

    static ofDOM(canvasDOM) {
        const ctx = canvasDOM.getContext("2d", { willReadFrequently: true });
        const w = canvasDOM.width;
        const h = canvasDOM.height;
        const imageData = ctx.getImageData(0, 0, w, h);
        const data = imageData.data;
        const image = Image.ofSize(w, h)
        for (let i = 0; i < data.length; i += 4) {
            const color = Color.ofRGB(data[i] / 255, data[i + 1] / 255, data[i + 2] / 255);
            image._image[Math.floor(i / 4)] = color;
        }
    }

    static ofCanvas(canvas) {
        const w = canvas.width;
        const h = canvas.height;
        return Image.ofSize(w, h)
            .map((x, y) => {
                return canvas.get(x, y);
            })
    }
}

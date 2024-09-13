import Tela from "./Tela.js";
import Color from "../Color/Color.js";
import { readImageFrom } from "../IO/IO.js";

export default class Image extends Tela {

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
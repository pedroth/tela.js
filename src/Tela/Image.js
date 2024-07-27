import { readImageFrom } from "../IO/IO.js";
import { MAX_8BIT } from "../Utils/Constants.js";
import Tela from "./Tela.js";

export default class Image extends Tela {

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
import Color from "../Color/Color.js";
import Tela, { CHANNELS } from "./Tela.js";

export function deserialize(telaJson) {
    if (!telaJson) return;
    const { width, height, image } = telaJson;
    const tela = new Tela(width, height);
    for (let i = 0; i < image.length; i += CHANNELS) {
        tela.setPxlData(
            i,
            Color.ofRGB(
                image[i],
                image[i + 1],
                image[i + 2],
                image[i + 3],
            )
        )
    }
    return tela;
}
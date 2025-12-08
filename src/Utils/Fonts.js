import Box from "../Geometry/Box.js";
import { Vec2 } from "../Vector/Vector.js";
import { IS_NODE } from "./Constants.js";

const gridX = 16;
const gridY = 16;
let fontImageWidth;
let fontImageHeight;
let deltaX;
let deltaY;
let fontImage;

try {
    const TELA = await import(IS_NODE ? "../Tela/Image.js" : "../Tela/Canvas.js").then(def => def.default)
    // octaviogood fonts documentation: https://www.shadertoy.com/view/llcXRl
    fontImage = await or(
        () => TELA.ofUrl(`../src/Utils/sdf_font.png`),
        () => TELA.ofUrl(`./src/Utils/sdf_font.png`),
        () => TELA.ofUrl(`./node_modules/tela.js/src/Utils/sdf_font.png`),
        () => TELA.ofUrl(`https://cdn.jsdelivr.net/npm/tela.js/src/Utils/sdf_font.png`)
    );
    fontImageWidth = fontImage.width;
    fontImageHeight = fontImage.height;
    deltaX = fontImageWidth / gridX;
    deltaY = fontImageHeight / gridY;
} catch (e) {
    console.log("Caught error initializing Fonts.js", e);
}

export const imageFromString = (string) => {
    const chars = [...string];
    const charsId = chars.map(c => c.charCodeAt(0));
    const ans = {};
    /**
     * in texture space, x \in [0,1], y \in [0,1]
     * @returns Color
     */
    ans.getPxl = (x, y) => {
        if (!fontImage) {
            console.log("Error initializing Fonts.js");
            return 0;
        }
        const charIndex = Math.floor((x * chars.length)) % chars.length;
        const char = chars[charIndex];
        if (char === " ") return;
        // ascii coordinates
        // -------> x
        // |
        // |    *
        // v
        // y
        const charX = charsId[charIndex] % gridX;
        const charY = gridY - Math.floor(charsId[charIndex] / gridY) - 1;
        const imageX = charX * deltaX;
        const imageY = charY * deltaY;
        const boxImage = new Box(Vec2(imageX, imageY), Vec2(imageX + deltaX, imageY + deltaY))
        const px = x * chars.length - charIndex;
        const py = y;
        const color = fontImage.getPxl(boxImage.min.x + boxImage.diagonal.x * px, boxImage.min.y + boxImage.diagonal.y * py);
        return color.alpha; // distance stored in red || green || blue and normalized [0,1]
    }
    return ans;
}


//========================================================================================
/*                                                                                      *
 *                                         UTILS                                        *
 *                                                                                      */
//========================================================================================

async function or(...lambdas) {
    let error;
    for (let i = 0; i < lambdas.length; i++) {
        try {
            const ans = await lambdas[i]();
            return ans;
        }
        catch (e) {
            error = e;
        }
    }
    throw error;
}

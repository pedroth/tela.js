import Box from "../Geometry/Box.js";
import Canvas from "../Tela/Canvas.js";
import Image from "../Tela/Image.js";
import { Vec2 } from "../Vector/Vector.js";
import { IS_NODE } from "./Constants.js";



const gridX = 16;
const gridY = 16;
// octaviogood fonts documentation: https://www.shadertoy.com/view/llcXRl
const fontImage = IS_NODE ? Image.ofUrl("./assets/sdf_font.ppm") : Canvas.ofUrl("./assets/sdf_font.ppm");
const fontImageWidth = fontImage.width;
const fontImageHeight = fontImage.height;
const deltaX = fontImageWidth / gridX;
const deltaY = fontImageHeight / gridY;

export const imageFromString = (string) => {
    const chars = [...string];
    const charsId = chars.map(c => c.charCodeAt(0));
    const ans = {};
    /**
     * in texture space, x \in [0,1], y \in [0,1]
     * @returns Color
     */
    ans.getPxl = (x, y) => {
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
        return color.red; // distance stored in red || green || blue and normalized [0,1]

    }
    return ans;
}

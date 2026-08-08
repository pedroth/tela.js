import Color from "../Color/Color.js";
import { lerp } from "../Utils/Math.js";
import { Vec2 } from "../Vector/Vector.js";

function applyTextureAlphaKey(color, texture) {
    const alphaKey = texture?.alphaKey;
    if (!alphaKey) return color;
    const [red, green, blue] = alphaKey.color;
    const threshold = alphaKey.threshold ?? 0;
    const distance = Math.max(
        Math.abs(color.red - red),
        Math.abs(color.green - green),
        Math.abs(color.blue - blue)
    );
    if (distance <= threshold) {
        return Color.ofRGB(color.red, color.green, color.blue, 0);
    }
    return color;
}

export function getDefaultTexColor(texUV) {
    texUV = texUV.scale(16).map(x => x % 1)
    return texUV.x < 0.5 && texUV.y < 0.5 ?
        Color.BLACK :
        texUV.x > 0.5 && texUV.y > 0.5 ?
            Color.BLACK :
            Color.PURPLE;
}

export function getBiLinearTexColor(texUV, texture) {
    const size = Vec2(texture.width, texture.height);
    const texInt = texUV.mul(size);

    const texInt0 = texInt.map(Math.floor);
    const texInt1 = texInt0.add(Vec2(1, 0));
    const texInt2 = texInt0.add(Vec2(0, 1));
    const texInt3 = texInt0.add(Vec2(1, 1));

    const color0 = applyTextureAlphaKey(texture.getPxl(...texInt0.toArray()), texture);
    const color1 = applyTextureAlphaKey(texture.getPxl(...texInt1.toArray()), texture);
    const color2 = applyTextureAlphaKey(texture.getPxl(...texInt2.toArray()), texture);
    const color3 = applyTextureAlphaKey(texture.getPxl(...texInt3.toArray()), texture);

    const x = texInt.sub(texInt0);
    const bottomX = lerp(color0, color1)(x.x);
    const topX = lerp(color2, color3)(x.x);
    return lerp(bottomX, topX)(x.y);
}

export function getTexColor(texUV, texture) {
    return applyTextureAlphaKey(texture.getPxl(texUV.x * texture.width, texUV.y * texture.height), texture);
}
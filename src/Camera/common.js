import Color from "../Color/Color";
import { lerp } from "../Utils/Math";
import { Vec2 } from "../Vector/Vector";

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

    const color0 = texture.getPxl(...texInt0.toArray());
    const color1 = texture.getPxl(...texInt1.toArray());
    const color2 = texture.getPxl(...texInt2.toArray());
    const color3 = texture.getPxl(...texInt3.toArray());

    const x = texInt.sub(texInt0);
    const bottomX = lerp(color0, color1)(x.x);
    const topX = lerp(color2, color3)(x.x);
    return lerp(bottomX, topX)(x.y);
}

export function getTexColor(texUV, texture) {
    return texture.getPxl(texUV.x * texture.width, texUV.y * texture.height);
}
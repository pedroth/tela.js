import { Vec2, Window, loop, Box, Color } from "../../src/index.node.js";
import { imageFromString } from "../../src/Utils/Fonts.js";

const width = 1024;
const height = 240;
const window = new Window(width, height).onResizeWindow(() => window.paint());
//main
const box = new Box(Vec2(), Vec2(width, height));
loop(async ({ dt, time }) => {
    window.setTitle(`FPS: ${(1 / dt).toFixed(2)}`);
    const imageFromStr = imageFromString(`FPS: ${(1 / dt).toFixed(2)}`);
    const magicThreshold = ((Math.sin(2 * time) + 1) / 2) * 0.05 + Math.random() * 0.01;
    window.mapBox((x, y) => {
        const px = x / box.diagonal.x;
        const py = y / box.diagonal.y;
        const distance = imageFromStr.getPxl(px, py);
        if (distance < 0.45) return Color.RED;
        const t = (distance - 0.45) / (0.6 - 0.45);
        if (distance < 0.6 + magicThreshold) return Color.GREEN.scale(t).add(Color.RED.scale(1 - t));
        return Color.BLACK;
    }, box);
    window.paint();
}).play();
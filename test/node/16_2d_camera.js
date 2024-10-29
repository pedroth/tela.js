import { Vec2, Window, loop, Box, Color, Anima, Camera2D, imageFromString } from "../../src/index.node.js";

const width = 640;
const height = 480;
const window = new Window(width, height).onResizeWindow(() => window.paint());
const camera = new Camera2D(new Box(Vec2(-1, -1), Vec2(1, 1)));

const charSize = 0.25;
const charStart = -0.85;
const duration = 0.5;
const charBottom = 0;
const charHeight = 0.5;
const chars = [..."x²+1=0"];
const chars_2 = [..."x = ±i"];
const charBoxes = chars.map((_, i) => new Box(Vec2(charStart + i * charSize, charBottom), Vec2(charStart + (i + 1) * charSize, charHeight)))

function drawString(p, string, box, tau) {
    const img = imageFromString(string);
    const z = p.sub(box.min).div(box.diagonal);
    const d = img.getPxl(z.x, z.y);
    if (Number.isNaN(d)) return Color.BLACK;
    if (d < 0.45 * tau) return Color.WHITE;
    const mu = (d - 0.45) / (0.6 - 0.45);
    if (d < 0.6 * tau) return Color.WHITE.scale(1 - mu).add(Color.BLACK.scale(mu));
    return Color.BLACK;
}

const animation = Anima.list(
    ...chars.map((x, i) => {
        return Anima.behavior(
            (t) => {
                return camera.mapBox((p) => {
                    const tau = t / duration;
                    return drawString(p, x, charBoxes[i], tau);
                }, charBoxes[i]).to(window);
            }, duration)
    }
    ),
    // Anima.behavior(() => window.fill(Color.BLACK), 0.01),
    ...chars.map((x, i) => {
        return Anima.behavior(
            (t) => {
                return camera.mapBox((p) => {
                    const tau = t / duration;
                    const c1 = drawString(p, x, charBoxes[i], 1);
                    const c2 = drawString(p, chars_2[i], charBoxes[i], 1);
                    return c1.scale(1 - tau).add(c2.scale(tau))
                }, charBoxes[i]).to(window);
            }, duration+0.1)
    })
);

// main
loop(async ({ dt, time }) => {
    window.setTitle(`FPS: ${(1 / dt).toFixed(2)}`);
    animation.loop(time);
    window.paint();
}).play();
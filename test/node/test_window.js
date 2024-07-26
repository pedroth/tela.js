import { Color, loop } from "../../dist/node/index.js";
import Window from "../../src/Tela/Window.js";

const width = 640;
const height = 480;
const window = Window.ofSize(width, height);
loop(({ time, dt }) => {
    window.setTitle(`FPS: ${Math.floor(1 / dt)}`);
    window.map((x, y) => {
        return Color.ofRGB(
            ((x * time) / width) % 1,
            ((y * time) / height) % 1
        )
    })
}).play();


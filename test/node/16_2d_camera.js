import Camera2D from "../../src/Camera2D/Camera2D.js";
import { Vec2, Window, loop, Box, Color, KScene, Sphere } from "../../src/index.node.js";
import { imageFromString } from "../../src/Utils/Fonts.js";

const width = 640;
const height = 480;
const window = new Window(width, height).onResizeWindow(() => window.paint());
const camera = new Camera2D(new Box(Vec2(-1, -1), Vec2(1, 1)))
const scene = new KScene();
scene.add(Sphere.builder().name("Test").position(Vec2(0.5,0.5)).radius(0.5).color(Color.RED).build());
//main
loop(async ({ dt, time }) => {
    window.setTitle(`FPS: ${(1 / dt).toFixed(2)}`);
    camera.map(p => {
        const c = p.length() < 0.5 ? 1 : 0;
        return Color.ofRGB(c, c, c);
    }).to(window)
    camera.raster(scene).to(window);
    window.paint();
}).play();
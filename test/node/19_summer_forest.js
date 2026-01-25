import { Camera, Color, KScene, Mesh, Vec2, Vec3, loop, Image, Window } from "../../src/index.node.js";
import { readFileSync } from "fs";

// resize incoming canvas:Canvas object.
const width = 640 / 2;
const height = 480 / 2;
const window = Window.ofSize(width, height);
window.setWindowSize(width * 2, height * 2);

// scene
const scene = new KScene();
const camera = new Camera({ lookAt: Vec3(8496, 1431, 2429) }).orbit(3, 0, 0);

// From https://www.models-resource.com/playstation/spyro2riptosrage/
const texture = await Image.ofUrl("./assets/summer_forest.png");
const meshObj = readFileSync("./assets/summer_forest.obj", { encoding: "utf-8" });
const mesh = Mesh.readObj(meshObj, "summer_forest")
    .mapColors(() => Color.ofRGB(0.25, 0.25, 0.25))
    .addTexture(texture);
scene.add(mesh);

// mouse handling
let mousedown = false;
let mouse = Vec2();
let camSpeed = Vec3();

window.onMouseDown((x, y) => {
    mousedown = true;
    mouse = Vec2(x, y);
});

window.onMouseUp(() => {
    mousedown = false;
    mouse = Vec2();
});

window.onMouseMove((x, y) => {
    const newMouse = Vec2(x, y);
    if (!mousedown || newMouse.equals(mouse)) {
        return;
    }
    const [dx, dy] = newMouse.sub(mouse).toArray();
    camera.orient(coords =>
        coords.add(
            Vec2(
                -2 * Math.PI * (dx / window.width),
                -2 * Math.PI * (dy / window.height)
            )
        )
    );
    mouse = newMouse;
});

window.onKeyDown((e) => {
    const magnitude = 500;
    if (e.key === "w") camSpeed = Vec3(0, 0, magnitude);
    if (e.key === "s") camSpeed = Vec3(0, 0, -magnitude);
});

window.onKeyUp(() => {
    camSpeed = Vec3();
});

loop(({ dt }) => {
    camera.position = camera.position.add(camera.toWorldCoord(camSpeed).scale(dt));
    camera
        .reverseShot(scene, {
            cullBackFaces: false,
            bilinearTextures: false,
            clipCameraPlane: true,
            perspectiveCorrect: true,
        })
        .to(window)
        .paint();
    window.setTitle(`FPS: ${(1 / dt).toFixed(2)}`);
}).play();

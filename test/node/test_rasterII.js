import {
    Camera,
    Mesh,
    Vec3,
    Vec2,
    Image,
    loop,
    Window,
    NaiveScene,
    Color
} from "../../src/index.node.js";
import { readFileSync } from "fs";

const width = 640;
const height = 480;
const window = Window.ofSize(width, height);
window.setWindowSize(width, height);

// scene
const scene = new NaiveScene();
const camera = new Camera({ distancePlane: 0.5 }).orbit(5, 0, 0);

// mouse handling
let mousedown = false;
let mouse = Vec2();

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
    camera.orbit((orbitCoord) =>
        orbitCoord.add(
            Vec3(
                0,
                -2 * Math.PI * (dx / window.width),
                -2 * Math.PI * (dy / window.height)
            )
        )
    );
    mouse = newMouse;
});

window.onMouseWheel(({ deltaY }) => {
    camera.orbit((orbitCoord) => orbitCoord.add(Vec3(deltaY * 0.1, 0, 0)));
});

const meshObj = readFileSync("./assets/plane.obj", { encoding: "utf-8" });
let mesh = Mesh.readObj(meshObj, "mesh");
const meshBox = mesh.getBoundingBox();
const maxDiagInv = 2 / meshBox.diagonal.fold((e, x) => Math.max(e, x), Number.MIN_VALUE);
let i = 0;
mesh = mesh
    .mapVertices(v => v.sub(meshBox.center).scale(maxDiagInv))
    .mapColors(() => {
        switch (i) {
            case 0: i++; return Color.RED;
            case 1: i++; return Color.GREEN;
            case 2: i++; return Color.BLUE;
            default: return Color.YELLOW;
        }
    })
    // .addTexture(await Image.ofUrl("./assets/earth.jpg"))
scene.addList(mesh.asTriangles());
scene.rebuild();

// play
let imageL = Image.ofSize(width / 2, height);
let imageR = Image.ofSize(width / 2, height);

loop(({ dt }) => {
    imageL = camera
        .reverseShot(scene)
        .to(imageL)
        .paint();
    imageR = camera
        .reverseShot(scene, { perspectiveCorrect: true })
        .to(imageR)
        .paint();
    window.map((x, y) => {
        if (x < width / 2) {
            return imageL.getPxl(x, y);
        } else {
            return imageR.getPxl(x - width / 2, y);
        }
    }).paint();
    window.setTitle(`FPS: ${(1 / dt).toFixed(2)}`);
}).play();

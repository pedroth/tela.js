import { Camera, Mesh, Vec3, Vec2, Color, DiElectric, Triangle, KScene, Image, loop, Metallic, Window, Sphere } from "../../src/index.node.js";
import { readFileSync } from "fs";

const width = 640;
const height = 480;
const window = Window.ofSize(width / 2, height / 2);
window.setWindowSize(width, height);
let exposedWindow = window.exposure();

// scene
const scene = new KScene();
const camera = new Camera().orbit(5, 0, 0);

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
    exposedWindow = window.exposure();
});

window.onMouseWheel(({ deltaY }) => {
    camera.orbit((orbitCoord) => orbitCoord.add(Vec3(deltaY, 0, 0)));
    exposedWindow = window.exposure();
});

const meshObj = readFileSync("./assets/moses.obj", { encoding: "utf-8" });
let mesh = Mesh.readObj(meshObj, "mesh");
const meshBox = mesh.getBoundingBox();
const maxDiagInv = 2 / meshBox.diagonal.fold((e, x) => Math.max(e, x), Number.MIN_VALUE);
mesh = mesh
    .mapVertices(v => v.sub(meshBox.center).scale(maxDiagInv))
    .mapVertices(v => v.scale(1))
    .mapVertices(v => Vec3(-v.z, -v.x, v.y))
    .mapVertices(v => v.add(Vec3()))
    .mapColors(() => Color.WHITE)
scene.addList(mesh.asTriangles());
scene.add(
    Triangle.builder()
        .name("bottom-1")
        .colors(Color.RED, Color.RED, Color.RED)
        .positions(Vec3(-3, -3, -1), Vec3(3, -3, -1), Vec3(3, 3, -1))
        .build(),
    Triangle.builder()
        .name("bottom-2")
        .colors(Color.RED, Color.RED, Color.RED)
        .positions(Vec3(3, 3, -1), Vec3(-3, 3, -1), Vec3(-3, -3, -1))
        .build()
);
scene.add(
    Sphere
        .builder()
        .position(Vec3(-10, -10, 10))
        .radius(12)
        .color(Color.WHITE)
        .emissive(true)
        .build()
);

scene.rebuild();

// play
loop(async ({ dt }) => {
    const image = await camera
        .parallelShot(scene, {
            bounces: 10,
            samplesPerPxl: 1,
            gamma: 0.5,
            useCache: true,
            useMetro: true,
            isBiased: true
        })
        .to(exposedWindow);
    image.paint();
    window.setTitle(`FPS: ${(1 / dt).toFixed(2)}`);
}).play();

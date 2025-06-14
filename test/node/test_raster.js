import { Camera, Mesh, Vec3, Vec2, Color, DiElectric, Triangle, KScene, Image, loop, Metallic, Window, Sphere, NaiveScene } from "../../src/index.node.js";
import { readFileSync } from "fs";

const width = 640;
const height = 480;
const window = Window.ofSize(width, height);
window.setWindowSize(width, height);

// scene
const scene = new NaiveScene();
const camera = new Camera({distancePlane: 0.5}).orbit(5, 0, 0);

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
    camera.orbit((orbitCoord) => orbitCoord.add(Vec3(deltaY, 0, 0)));
});
    
const meshObj = readFileSync("./assets/JesusMary.obj", { encoding: "utf-8" });
let mesh = Mesh.readObj(meshObj, "mesh");
const meshBox = mesh.getBoundingBox();
const maxDiagInv = 2 / meshBox.diagonal.fold((e, x) => Math.max(e, x), Number.MIN_VALUE);
mesh = mesh
    .mapVertices(v => v.sub(meshBox.center).scale(maxDiagInv))
    .mapVertices(v => v.scale(1))
    .mapVertices(v => Vec3(-v.z, -v.x, v.y))
    .mapVertices(v => v.add(Vec3()))
    .addTexture(await Image.ofUrl("./assets/JesusMary.jpg"))
scene.addList(mesh.asTriangles());
scene.rebuild();

// play
loop(({ dt }) => {
    const image = camera
        .reverseShot(scene)
        .to(window);
    image.paint();
    window.setTitle(`FPS: ${(1 / dt).toFixed(2)}`);
}).play();

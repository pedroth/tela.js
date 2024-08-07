import { Camera, Mesh, NaiveScene, Vec3, Vec2, Image, loop, Window } from "../../src/index.node.js";
import { readFileSync } from "fs"
const width = 640;
const height = 480;
const maxRadius = 3;
const window = Window.ofSize(width, height);
// scene
const scene = new NaiveScene()
const camera = new Camera().orbit(maxRadius, Math.PI, 0);
// scene
const obj = readFileSync("./assets/megaman.obj", { encoding: "utf-8" });
let mesh = Mesh.readObj(obj, "mesh");
const box = mesh.getBoundingBox();
const scaleInv = 2 / box.diagonal.fold((e, x) => Math.max(e, x), Number.MIN_VALUE);
mesh = mesh
    .mapVertices(v => v.sub(box.center).scale(scaleInv))
    .mapVertices(v => Vec3(-v.y, v.x, v.z))
    .mapVertices(v => Vec3(v.z, v.y, -v.x))
    .addTexture(await Image.ofUrl("./assets/megaman.png"))
scene.addList(mesh.asTriangles());
// mouse handling
let mousedown = false;
let mouse = Vec2();
window.onMouseDown((x, y) => {
    mousedown = true;
    mouse = Vec2(x, y);
})
window.onMouseUp(() => {
    mousedown = false;
    mouse = Vec2();
})
window.onMouseMove((x, y) => {
    const newMouse = Vec2(x, y);
    if (!mousedown || newMouse.equals(mouse)) {
        return;
    }
    const [dx, dy] = newMouse.sub(mouse).toArray();
    camera.orbit(orbitCoord => orbitCoord.add(
        Vec3(
            0,
            -2 * Math.PI * (dx / window.width),
            -2 * Math.PI * (dy / window.height)
        )
    ));
    mouse = newMouse;
})
window.onMouseWheel(({ dy }) => {
    camera.orbit(orbitCoord => orbitCoord.add(Vec3(-dy, 0, 0)));
})

// play
loop(({ dt }) => {
    camera.reverseShot(
        scene,
        {
            cullBackFaces: true,
            bilinearTextures: false,
            clipCameraPlane: false
        }
    )
        .to(window);
    window.setTitle(`FPS: ${Math.floor(1 / dt)}`);
}).play()
import { Color, Window, loop, Mesh, Vec3, KScene, Camera, clamp } from "../../src/index.node.js";
import { readFileSync } from "node:fs";

const width = 640;
const height = 480;
const window = Window.ofSize(width, height);
window.setWindowSize(width, height);

// scene
const scene = new KScene();
const camera = new Camera().orbit(10, 0, Math.PI / 6);
const stanfordBunnyObj = readFileSync("./assets/bunny.obj", { encoding: "utf-8" });
let bunnyMesh = Mesh.readObj(stanfordBunnyObj, "bunny");
const bunnyBox = bunnyMesh.getBoundingBox();
bunnyMesh = bunnyMesh
    .mapVertices(v => v.sub(bunnyBox.min).div(bunnyBox.diagonal).scale(2).sub(Vec3(1, 1, 1)))
    .mapVertices(v => Vec3(-v.y, v.x, v.z))
    .mapVertices(v => Vec3(v.z, v.y, -v.x))
    .mapVertices(v => v.add(Vec3(0, 0, 3)))
    .mapColors(v => Color.ofRGB(...v.map(x => clamp()((x + 1) / 2)).toArray()));

const originalPositions = bunnyMesh.asSpheres(0.02);
const bunnyPoints = bunnyMesh.asSpheres(0.02);
const bunnySpeeds = [...Array(bunnyPoints.length)].map(() => Vec3().map(() => 5 * (2 * Math.random() - 1)));
scene.addList(bunnyPoints);

function resetBunny() {
    for (let i = 0; i < bunnyPoints.length; i++) {
        bunnyPoints[i].position = originalPositions[i].position;
        bunnySpeeds[i] = Vec3().map(() => 5 * (2 * Math.random() - 1));
    }
    time = 0;
}
// Keyboard handling for reset
window.onKeyDown(e => {
    if (e.key && (e.key === 'r' || e.key === 'R')) {
        resetBunny();
    }
});

// physics
const g = -9.8;
const bunnyPhysics = dt => {
    for (let i = 0; i < bunnyPoints.length; i++) {
        const acceleration = Vec3(0, 0, g);
        bunnySpeeds[i] = bunnyPoints[i].position.z <= 0 ?
            Vec3(0, 0, -bunnyPoints[i].position.z) :
            bunnySpeeds[i].add(acceleration.scale(dt));
        bunnyPoints[i].position = bunnyPoints[i].position.add(bunnySpeeds[i].scale(dt));
    }
}

// Mouse handling for camera movement
let mousedown = false;
let mouse = Vec3();
window.onMouseDown((x, y) => {
    mousedown = true;
    mouse = Vec3(x, y, 0);
});
window.onMouseUp(() => {
    mousedown = false;
    mouse = Vec3();
});
window.onMouseMove((x, y) => {
    const newMouse = Vec3(x, y, 0);
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
});
window.onMouseWheel(({ deltaY }) => {
    camera.orbit(orbitCoord => orbitCoord.add(Vec3(0.1 * deltaY, 0, 0)));
});

// Render loop
let time = 0;
loop(async ({ dt }) => {
    // Physics after 5 seconds
    if (time > 5) bunnyPhysics(dt);

    camera.reverseShot(scene).to(window).paint();
    window.setTitle(`Bunny Explode| R: reset | FPS: ${Math.floor(1 / dt)}`);
    time += dt;
}).play();


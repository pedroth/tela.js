import { readFileSync } from "fs";
import {
    Camera,
    Vec3,
    Vec2,
    Color,
    Triangle,
    KScene,
    loop,
    Window,
    Image,
    Mesh
} from "../../src/index.node.js";

// resize incoming canvas:Canvas object.
const width = 640 ;
const height = 480;
const window = Window.ofSize(width/3, height/3);
window.setWindowSize(width, height);
let exposedCanvas = window.exposure();
// scene
const scene = new KScene();
const camera = new Camera({ lookAt: Vec3(1.5, 1.5, 1.0) }).orbit(3, 0, 0);
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
    camera.orbit(coords => coords.add(
        Vec3(
            0,
            -2 * Math.PI * (dx / window.width),
            -2 * Math.PI * (dy / window.height)
        )
    ));
    mouse = newMouse;
    exposedCanvas = window.exposure();

})
window.onMouseWheel(({ deltaY }) => {
    camera.orbit(coords => coords.add(Vec3(deltaY * 0.01, 0, 0)));
    exposedCanvas = window.exposure();
})
// cornell box
scene.add(
    Triangle
        .builder()
        .name("bottom-1")
        .colors(Color.WHITE, Color.WHITE, Color.WHITE)
        .positions(Vec3(), Vec3(3, 0, 0), Vec3(3, 3, 0))
        .build(),
    Triangle
        .builder()
        .name("bottom-2")
        .colors(Color.WHITE, Color.WHITE, Color.WHITE)
        .positions(Vec3(3, 3, 0), Vec3(0, 3, 0), Vec3())
        .build(),
)

// some objects
const meshObj = readFileSync("./assets/megaman.obj", { encoding: "utf-8" });
let mesh = Mesh.readObj(meshObj, "mesh");
const meshBox = mesh.getBoundingBox();
const maxDiagInv = 2 / meshBox.diagonal.fold((e, x) => Math.max(e, x), Number.MIN_VALUE);
mesh = mesh
    .mapVertices(v => v.sub(meshBox.center).scale(maxDiagInv))
    .mapVertices(v => v.scale(1))
    .mapVertices(v => Vec3(-v.y, v.x, v.z))
    .mapVertices(v => Vec3(v.z, v.y, -v.x))
    .mapVertices(v => Vec3(-v.x, -v.y, v.z))
    .mapVertices(v => v.add(Vec3(1.5, 1.5, 1.0)))
    .addTexture(await Image.ofUrl("./assets/megaman.png"))
    .mapColors(() => Color.WHITE)
scene.addList(mesh.asTriangles());

function renderSkyBox(ray) {
    const dir = ray.dir;
    const skyColorHorizon = Color.ofRGB(0.5, 0.7, 1.0); // Light blue near horizon
    const skyColorZenith = Color.ofRGB(0.1, 0.2, 0.4);   // Darker blue overhead
    const skyBlendFactor = Math.pow(Math.max(0, dir.z), 0.5);
    const skyColor = skyColorHorizon.scale(1 - skyBlendFactor).add(skyColorZenith.scale(skyBlendFactor));
    const sunDirection = Vec3(0.7, 0.3, 0.5).normalize();
    const sunDot = dir.dot(sunDirection);
    const sunSharpness = 20000.0; // Controls how sharp the sun disk is
    const sunGlow = Math.pow(Math.max(0, sunDot), sunSharpness);
    const atmosphereGlow = Math.pow(Math.max(0, sunDot), 500.0); // Softer power for wider glow
    const sunColor = Color.ofRGB(1.0, 0.8, 0.5); // Warm yellow/orange
    const sunEffect = sunColor.scale(sunGlow * 2.0).add(sunColor.scale(atmosphereGlow * 0.5));
    return sunEffect;
}

loop(async ({ dt }) => {
    const image = await camera
        .parallelShot(
            scene,
            {
                samplesPerPxl: 5,
                bounces: 10,
                gamma: 0.5,
                // isBiased: true,
                useMetro: true,
                // useCache: true,
                renderSkyBox
            })
        .to(exposedCanvas);
    image.paint();
    window.setTitle(`FPS: ${(1 / dt).toFixed(2)}`);
}).play();
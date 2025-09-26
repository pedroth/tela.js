import {
    Camera,
    Vec3,
    Vec2,
    Color,
    Triangle,
    KScene,
    loop,
    Window,
    Sphere,
    renderBackground,
    Image,
    DiElectric,
    Metallic
} from "../../src/index.node.js";

const width = 640;
const height = 480;
const window = Window.ofSize(width, height);
window.setWindowSize(width, height);
let exposedWindow = window.exposure();

// scene
const scene = new KScene();
const camera = new Camera().orbit(5, 0, Math.PI / 8);

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
    camera.orient(coords => {
        return coords.add(
            Vec2(
                -2 * Math.PI * (dx / window.width),
                -2 * Math.PI * (dy / window.height)
            )
        )
    });
    mouse = newMouse;
    exposedWindow = window.exposure();
});

window.onKeyDown((e) => {
    const magnitude = 1.5;
    if (e.key === "w") camSpeed = Vec3(0, 0, magnitude);
    if (e.key === "s") camSpeed = Vec3(0, 0, -magnitude);
    exposedWindow = window.exposure();
});

window.onKeyUp(() => {
    camSpeed = Vec3();
    exposedWindow = window.exposure();
});


scene.add(
    Triangle.builder()
        .name("bottom-1")
        .colors(Color.ORANGE, Color.ORANGE, Color.ORANGE)
        .positions(Vec3(-3, -3, 0), Vec3(3, -3, 0), Vec3(3, 3, 0))
        .build(),
    Triangle.builder()
        .name("bottom-2")
        .colors(Color.ORANGE, Color.ORANGE, Color.ORANGE)
        .positions(Vec3(3, 3, 0), Vec3(-3, 3, 0), Vec3(-3, -3, 0))
        .build(),
    Sphere.builder()
        .name("sphere")
        .color(Color.ofRGB(0.5, 0.2, 0.8))
        .position(Vec3(0, 0, 1.5))
        .material(Metallic(1.5))
        .radius(1)
        .build()
);

scene.add(
    Triangle.builder()
        .name("light_00")
        .colors(Color.WHITE, Color.WHITE, Color.WHITE)
        .positions(Vec3(0, 0, 2.9), Vec3(1, 0, 2.9), Vec3(1, 1, 2.9))
        .emissive(true)
        .build(),
    Triangle.builder()
        .name("light_01")
        .colors(Color.WHITE, Color.WHITE, Color.WHITE)
        .positions(Vec3(1, 1, 2.9), Vec3(0, 1, 2.9), Vec3(0, 0, 2.9))
        .emissive(true)
        .build(),
    Triangle.builder()
        .name("light_10")
        .colors(Color.WHITE, Color.WHITE, Color.WHITE)
        .positions(Vec3(-1, -1, 2.9), Vec3(0, -1, 2.9), Vec3(0, 0, 2.9))
        .emissive(true)
        .build(),
    Triangle.builder()
        .name("light_11")
        .colors(Color.WHITE, Color.WHITE, Color.WHITE)
        .positions(Vec3(0, 0, 2.9), Vec3(-1, 0, 2.9), Vec3(-1, -1, 2.9))
        .emissive(true)
        .build()
);

scene.rebuild()

function renderSkyBox(ray) {
    const dir = ray.dir;
    const skyColorHorizon = Color.ofRGB(0.5, 0.7, 1.0); // Light blue near horizon
    const skyColorZenith = Color.ofRGB(0.1, 0.2, 0.4);   // Darker blue overhead
    const skyBlendFactor = Math.pow(Math.max(0, dir.z), 0.5);
    const skyColor = skyColorHorizon.scale(1 - skyBlendFactor).add(skyColorZenith.scale(skyBlendFactor));
    const sunDirection = Vec3(0.7, 0.3, 0.5).normalize();
    const sunDot = dir.dot(sunDirection);
    const sunSharpness = 200.0; // Controls how sharp the sun disk is
    const sunGlow = Math.pow(Math.max(0, sunDot), sunSharpness);
    const atmosphereGlow = Math.pow(Math.max(0, sunDot), 5.0); // Softer power for wider glow
    const sunColor = Color.ofRGB(1.0, 0.8, 0.5); // Warm yellow/orange
    const sunEffect = sunColor.scale(sunGlow * 2.0).add(sunColor.scale(atmosphereGlow * 0.5));
    return skyColor.add(sunEffect);
}

loop(async ({ dt }) => {
    camera.position = camera.position.add(camera.toWorldCoord(camSpeed).scale(dt));
    const image = await camera
        .sceneShot(
            scene,
            {
                bounces: 10,
                isBiased: true,
                useMetro: true,
                useCache: true,
                renderSkyBox
            })
        .to(exposedWindow);
    image.paint();
    window.setTitle(`FPS: ${(1 / dt).toFixed(2)}`);
}).play();

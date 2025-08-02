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
    Image
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
    const magnitude = 0.5;
    if (e.key === "w") camSpeed = Vec3(0, 0, magnitude);
    if (e.key === "s") camSpeed = Vec3(0, 0, -magnitude);
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
        .position(Vec3(0, 0, 1))
        .radius(1)
        .build()
);

// play
loop(async ({ dt }) => {
    camera.position = camera.position.add(camera.toWorldCoord(camSpeed).scale(dt));
    const image = await camera
        .rayMapParallel(async (ray, { scene, bounces, gamma, _memory_ }) => {
            if (_memory_.backgroundImage === undefined) {
                https://steamcommunity.com/sharedfiles/filedetails/?id=3009862235
                _memory_.backgroundImage = await Image.ofUrl("./assets/sky.jpg");
            }

            const clampAcos = (x) => x > 1 ? 1 : x < -1 ? -1 : x;
            function renderBG(ray) {
                const dir = ray.dir;
                // atan2 returns [-π, π], we want [0, 1]
                const theta = Math.atan2(dir.y, dir.x) / (2 * Math.PI) + 0.5;
                const alpha = Math.acos(-clampAcos(dir.z)) / (Math.PI);
                return _memory_.backgroundImage
                    .getPxl(
                        theta * _memory_.backgroundImage.width,
                        alpha * _memory_.backgroundImage.height
                    );
            }


            function renderSkyBox(ray) {
                const dir = ray.dir;
                const skyColorHorizon = Color.ofRGB(0.5, 0.7, 1.0); // Light blue near horizon
                const skyColorZenith = Color.ofRGB(0.1, 0.2, 0.4);   // Darker blue overhead
                const skyBlendFactor = Math.pow(Math.max(0, dir.z), 0.5);
                const skyColor = skyColorHorizon.scale(1 - skyBlendFactor).add(skyColorZenith.scale(skyBlendFactor));
                const sunDirection = Vec3(0.7, 0.3, 0.5).normalize();
                const sunDot = dir.dot(sunDirection);
                const sunSharpness = 100.0; // Controls how sharp the sun disk is
                const sunGlow = Math.pow(Math.max(0, sunDot), sunSharpness);
                const atmosphereGlow = Math.pow(Math.max(0, sunDot), 5.0); // Softer power for wider glow
                const sunColor = Color.ofRGB(1.0, 0.8, 0.5); // Warm yellow/orange
                const sunEffect = sunColor.scale(sunGlow * 2.0).add(sunColor.scale(atmosphereGlow * 0.5));
                return sunEffect;
            }

            function traceMetro(ray, scene, options) {
                const { bounces, bilinearTexture } = options;
                if (bounces < 0) return renderBG(ray);
                const hit = scene.interceptWithRay(ray);
                if (!hit) return renderBG(ray);
                const [, p, e] = hit;
                const color = e.color ?? e.colors[0];
                const mat = e.material;
                let r = mat.scatter(ray, p, e);
                let rStar = mat.scatter(ray, p, e);
                let finalC = trace(
                    r,
                    scene,
                    { bounces: bounces - 1, bilinearTexture }
                );
                let CStar = trace(
                    rStar,
                    scene,
                    { bounces: bounces - 1, bilinearTexture }
                );
                const probM = CStar.toGray().red / finalC.toGray().red;
                if (Math.random() < probM) {
                    finalC = CStar;
                }
                const dot = r.dir.dot(e.normalToPoint(p));
                const finalCScale = dot <= 0 ? -dot : dot;
                return e.emissive ? color.add(color.mul(finalC.scale(finalCScale))) : color.mul(finalC.scale(finalCScale));
            }

            function trace(ray, scene, options) {
                const { bounces } = options;
                if (bounces < 0) return renderBG(ray);
                const hit = scene.interceptWithRay(ray);
                if (!hit) return renderBG(ray);
                const [, p, e] = hit;
                const color = e.color ?? e.colors[0];
                const mat = e.material;
                let r = mat.scatter(ray, p, e);
                let finalC = trace(
                    r,
                    scene,
                    { bounces: bounces - 1 }
                );
                const dot = r.dir.dot(e.normalToPoint(p));
                const finalCScale = dot <= 0 ? -dot : dot;
                return e.emissive ? color.add(color.mul(finalC.scale(finalCScale))) : color.mul(finalC.scale(finalCScale));
            }
            return traceMetro(ray, scene, { bounces }).toGamma(gamma)
        })
        .to(exposedWindow, { scene, bounces: 10, samplesPerPxl: 1, gamma: 0.5 });
    image.paint();
    window.setTitle(`FPS: ${(1 / dt).toFixed(2)}`);
}).play();


// const sky = await Image.ofUrl("./assets/beach.jpg")
// function renderSkyBox(ray) {
//     return renderBackground(ray, sky);
// }

// loop(async ({ dt }) => {
//     camera.position = camera.position.add(camera.toWorldCoord(camSpeed).scale(dt));
//     const image = await camera
//         .sceneShot(scene, { bounces: 10, gamma: 0.5, isBiased: false, renderSkyBox })
//         .to(exposedWindow);
//     image.paint();
//     window.setTitle(`FPS: ${(1 / dt).toFixed(2)}`);
// }).play();

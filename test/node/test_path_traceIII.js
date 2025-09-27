import {
    Camera,
    Mesh,
    Vec3,
    Vec2,
    Color,
    Triangle,
    KScene,
    loop,
    Window,
    Alpha
} from "../../src/index.node.js";
import { readFileSync } from "fs";

const width = 640;
const height = 480;
const window = Window.ofSize(width, height);
window.setWindowSize(width, height);
let exposedWindow = window.exposure();

// scene
const scene = new KScene();
const camera = new Camera().orbit(5, 0, 0);

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
        .colors(Color.RED, Color.RED, Color.RED)
        .positions(Vec3(-3, -3, 0), Vec3(3, -3, 0), Vec3(3, 3, 0))
        .build(),
    Triangle.builder()
        .name("bottom-2")
        .colors(Color.RED, Color.RED, Color.RED)
        .positions(Vec3(3, 3, 0), Vec3(-3, 3, 0), Vec3(-3, -3, 0))
        .build()
);

const meshObj = readFileSync("./assets/sibenik.obj", { encoding: "utf-8" });
let mesh = Mesh.readObj(meshObj, "mesh")
const box = mesh.getBoundingBox();
const scaleInv = 2 / box.diagonal.fold((e, x) => Math.max(e, x), Number.MIN_VALUE);
mesh = mesh
    .mapVertices(v => v.sub(box.center).scale(scaleInv))
    .mapVertices(v => Vec3(-v.y, v.x, v.z))
    .mapVertices(v => Vec3(v.z, v.y, -v.x))
    .mapVertices(v => v.add(Vec3(0, 0, 0.8)))
    .mapColors(() => Color.WHITE)
    .mapMaterials(() => Alpha(0.5));
scene.addList(mesh.asTriangles());
scene.rebuild();

// play
loop(async ({ dt }) => {
    camera.position = camera.position.add(camera.toWorldCoord(camSpeed).scale(dt));
    const image = await camera
        .rayMapParallel(async (ray, { scene, bounces, gamma }) => {
            function renderSkyBox(ray) {
                const dir = ray.dir;
                const skyColorHorizon = Color.ofRGB(0.5, 0.7, 1.0); // Light blue near horizon
                const skyColorZenith = Color.ofRGB(0.1, 0.2, 0.4);   // Darker blue overhead
                const skyBlendFactor = Math.pow(Math.max(0, dir.z), 0.5);
                const skyColor = skyColorHorizon.scale(1 - skyBlendFactor).add(skyColorZenith.scale(skyBlendFactor));
                const sunDirection = Vec3(0.7, 0.3, 0.5).normalize();
                const sunDot = dir.dot(sunDirection);
                const sunSharpness = 10000.0; // Controls how sharp the sun disk is
                const sunGlow = Math.pow(Math.max(0, sunDot), sunSharpness);
                const atmosphereGlow = Math.pow(Math.max(0, sunDot), 5.0); // Softer power for wider glow
                const sunColor = Color.ofRGB(1.0, 0.8, 0.5); // Warm yellow/orange
                const sunEffect = sunColor.scale(sunGlow * 2.0).add(sunColor.scale(atmosphereGlow * 0.5));
                return skyColor.add(sunEffect);
            }

            function trace(ray, scene, options) {
                const { bounces } = options;
                if (bounces < 0) return Color.BLACK;
                const hit = scene.interceptWithRay(ray);
                if (!hit) return renderSkyBox(ray);
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

            return trace(ray, scene, { bounces }).toGamma(gamma)
        })
        .to(exposedWindow, { scene, bounces: 10, samplesPerPxl: 1, gamma: 0.5 });
    image.paint();
    window.setTitle(`FPS: ${(1 / dt).toFixed(2)}`);
}).play();

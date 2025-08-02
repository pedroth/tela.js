import { Camera, Mesh, Vec3, Vec2, Color, DiElectric, Triangle, KScene, Image, loop, Metallic, Window, Sphere, Box, Line } from "../../src/index.node.js";
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
    camera.orbit((orbitCoord) => orbitCoord.add(Vec3(0.1 * deltaY, 0, 0)));
    exposedWindow = window.exposure();
});


scene.add(
    Triangle.builder()
        .name("bottom-1")
        .colors(Color.ORANGE, Color.ORANGE, Color.ORANGE)
        .positions(Vec3(-3, -3, 0), Vec3(3, -3, 0), Vec3(3, 3, 0))
        .material(Metallic(0.01))
        .build(),
    Triangle.builder()
        .name("bottom-2")
        .colors(Color.ORANGE, Color.ORANGE, Color.ORANGE)
        .positions(Vec3(3, 3, 0), Vec3(-3, 3, 0), Vec3(-3, -3, 0))
        .material(Metallic(0.01))
        .build(),
    // Triangle.builder()
    //     .name("light-1")
    //     .colors(Color.WHITE, Color.WHITE, Color.WHITE)
    //     .positions(Vec3(-1, -1, 2.9), Vec3(1, -1, 2.9), Vec3(1, 1, 2.9))
    //     .emissive(true)
    //     .build(),
    // Triangle.builder()
    //     .name("light-2")
    //     .colors(Color.WHITE, Color.WHITE, Color.WHITE)
    //     .positions(Vec3(1, 1, 2.9), Vec3(-1, 1, 2.9), Vec3(-1, -1, 2.9))
    //     .emissive(true)
    //     .build(),
    // Sphere
    //     .builder()
    //     .position(Vec3(0, 0, 0))
    //     .radius(0.5)
    //     .color(Color.YELLOW)
    //     .material(Metallic(0.01))
    //     .build(),
)

const meshObj = readFileSync("./assets/teapot.obj", { encoding: "utf-8" });
let mesh = Mesh.readObj(meshObj, "mesh")
const box = mesh.getBoundingBox();
const scaleInv = 2 / box.diagonal.fold((e, x) => Math.max(e, x), Number.MIN_VALUE);
mesh = mesh
    .mapVertices(v => v.sub(box.center).scale(scaleInv))
    .mapVertices(v => Vec3(-v.y, v.x, v.z))
    .mapVertices(v => Vec3(v.z, v.y, -v.x))
    .mapVertices(v => v.add(Vec3(0, 0, 0.5)))
    .mapColors(() => Color.WHITE)
    .mapMaterials(() => Metallic(0.1));
// .mapMaterials(() => DiElectric(1.3333));
scene.addList(mesh.asTriangles());
scene.rebuild();

// play
loop(async ({ dt }) => {
    const image = await camera
        .rayMapParallel(async (ray, { scene, bounces, gamma, _memory_ }) => {
            if (_memory_.backgroundImage === undefined) {
                _memory_.backgroundImage = await Image.ofUrl("./assets/beach.jpg");
            }

            function renderBG(ray) {
                const clampAcos = (x) => x > 1 ? 1 : x < -1 ? -1 : x;
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

            function trace(ray, scene, options) {
                const { bounces } = options;
                if (bounces < 0) return Color.BLACK;
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

            return trace(ray, scene, { bounces }).toGamma(gamma)
        })
        .to(exposedWindow, { scene, bounces: 10, samplesPerPxl: 1, gamma: 0.5 });
    image.paint();
    window.setTitle(`FPS: ${(1 / dt).toFixed(2)}`);
}).play();

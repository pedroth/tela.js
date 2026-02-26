import { Camera, Mesh, Vec3, Vec2, Color, DiElectric, Triangle, KScene, Image, loop, Metallic, Window } from "../../src/index.node.js";
import { readFileSync } from "fs";

const width = 640 / 2;
const height = 480 / 2;
const window = Window.ofSize(width, height);
window.setWindowSize(width * 2, height * 2);
let exposedWindow = window.exposure();

// scene
const scene = new KScene();
const camera = new Camera({ lookAt: Vec3(1.5, 1.5, 1.5) }).orbit(5, 0, 0);

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

const meshes = [
    { mesh: "./assets/spot.obj", texture: "./assets/spot.png" },
    { mesh: "./assets/megaman.obj", texture: "./assets/megaman.png" },
    { mesh: "./assets/spyro.obj", texture: "./assets/spyro.png" },
    { mesh: "./assets/earth.obj", texture: "./assets/earth.jpg" },
    { mesh: "./assets/blub.obj", texture: "./assets/blub.png" },
    { mesh: "./assets/bob.obj", texture: "./assets/bob.png" },
    { mesh: "./assets/oil.obj", texture: "./assets/oil.png" },
    { mesh: "./assets/riku.obj", texture: "./assets/riku.png" },
    { mesh: "./assets/wipeout.obj", texture: "./assets/wipeout.png" },
    { mesh: "./assets/bunny_orig.obj", texture: undefined },
    { mesh: "./assets/rocker_arm.obj", texture: undefined },
    { mesh: "./assets/teapot.obj", texture: undefined },
    { mesh: "./assets/torus.obj", texture: undefined },
    { mesh: "./assets/moses_min.obj", texture: undefined },
    { mesh: "./assets/dragonHD.obj", texture: undefined },
];
const meshIndex = 0;
const meshObj = readFileSync(meshes[meshIndex].mesh, { encoding: "utf-8" });
let mesh = Mesh.readObj(meshObj, "mesh");
const meshBox = mesh.getBoundingBox();
const maxDiagInv = 2 / meshBox.diagonal.fold((e, x) => Math.max(e, x), Number.MIN_VALUE);
mesh = mesh
    .mapVertices(v => v.sub(meshBox.center).scale(maxDiagInv))
    .mapVertices(v => v.scale(1))
    .mapVertices(v => Vec3(-v.z, -v.x, v.y))
    .mapVertices(v => v.add(Vec3(1.5, 1.5, 1.0)))
    .mapColors(() => Color.WHITE)
    // .mapMaterials(() => Metallic(1.33333));
if (meshes[meshIndex].texture) {
    mesh = mesh.addTexture(await Image.ofUrl(meshes[meshIndex].texture));
}
scene.addList(mesh.asTriangles());

// cornell box
scene.add(
    Triangle.builder()
        .name("left-1")
        .colors(Color.RED, Color.RED, Color.RED)
        .positions(Vec3(3, 0, 3), Vec3(3, 0, 0), Vec3())
        .build(),
    Triangle.builder()
        .name("left-2")
        .colors(Color.RED, Color.RED, Color.RED)
        .positions(Vec3(), Vec3(0, 0, 3), Vec3(3, 0, 3))
        .build(),
    Triangle.builder()
        .name("right-1")
        .colors(Color.GREEN, Color.GREEN, Color.GREEN)
        .positions(Vec3(0, 3, 0), Vec3(3, 3, 0), Vec3(3, 3, 3))
        .build(),
    Triangle.builder()
        .name("right-2")
        .colors(Color.GREEN, Color.GREEN, Color.GREEN)
        .positions(Vec3(3, 3, 3), Vec3(0, 3, 3), Vec3(0, 3, 0))
        .build(),
    Triangle.builder()
        .name("bottom-1")
        .colors(Color.WHITE, Color.WHITE, Color.WHITE)
        .positions(Vec3(), Vec3(3, 0, 0), Vec3(3, 3, 0))
        .build(),
    Triangle.builder()
        .name("bottom-2")
        .colors(Color.WHITE, Color.WHITE, Color.WHITE)
        .positions(Vec3(3, 3, 0), Vec3(0, 3, 0), Vec3())
        .build(),
    Triangle.builder()
        .name("top-1")
        .colors(Color.WHITE, Color.WHITE, Color.WHITE)
        .positions(Vec3(3, 3, 3), Vec3(3, 0, 3), Vec3(0, 0, 3))
        .build(),
    Triangle.builder()
        .name("top-2")
        .colors(Color.WHITE, Color.WHITE, Color.WHITE)
        .positions(Vec3(0, 0, 3), Vec3(0, 3, 3), Vec3(3, 3, 3))
        .build(),
    Triangle.builder()
        .name("back-1")
        .colors(Color.WHITE, Color.WHITE, Color.WHITE)
        .positions(Vec3(), Vec3(0, 3, 0), Vec3(0, 3, 3))
        .build(),
    Triangle.builder()
        .name("back-2")
        .colors(Color.WHITE, Color.WHITE, Color.WHITE)
        .positions(Vec3(0, 3, 3), Vec3(0, 0, 3), Vec3())
        .build(),
    Triangle.builder()
        .name("light-1")
        .colors(Color.WHITE, Color.WHITE, Color.WHITE)
        .positions(Vec3(1, 1, 2.9), Vec3(2, 1, 2.9), Vec3(2, 2, 2.9))
        .emissive(true)
        .build(),
    Triangle.builder()
        .name("light-2")
        .colors(Color.WHITE, Color.WHITE, Color.WHITE)
        .positions(Vec3(2, 2, 2.9), Vec3(1, 2, 2.9), Vec3(1, 1, 2.9))
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
            bilinearTexture: true,
            gamma: 0.5,
            isBiased: false,
            skyBoxPath: "./assets/sky.jpg",
        })
        .to(exposedWindow);
    image.paint();
    window.setTitle(`FPS: ${(1 / dt).toFixed(2)}`);
}).play();

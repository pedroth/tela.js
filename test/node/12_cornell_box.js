import { Camera, Mesh, Vec3, Vec2, Color, DiElectric, Triangle, KScene, BScene } from "../../dist/node/index.js";
import Window from "../../src/Tela/Window.js";
import { readFileSync } from "fs"

(async () => {
    // resize incoming canvas:Canvas object.
    const width = 640 / 2;
    const height = 480 / 2;
    const window = Window.ofSize(width, height);
    let exposedCanvas = window.exposure();
    // scene
    const scene = new KScene();
    const camera = new Camera({ lookAt: Vec3(1.5, 1.5, 1.5) }).orbit(5, 0, 0);
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
        exposedCanvas = window.exposure();

    })
    window.onMouseWheel(({ dy }) => {
        camera.orbit(orbitCoord => orbitCoord.add(Vec3(-dy, 0, 0)))
        exposedCanvas = window.exposure();
    })

    const meshObj = readFileSync("./assets/bunny_orig.obj", { encoding: "utf-8" });
    let mesh = Mesh.readObj(meshObj, "mesh");
    const box = mesh.getBoundingBox();
    mesh = mesh
        .mapVertices(v => v.sub(box.min).div(box.diagonal).scale(2).sub(Vec3(1, 1, 1)))
        .mapVertices(v => v.scale(1))
        .mapVertices(v => Vec3(-v.y, v.x, v.z))
        .mapVertices(v => Vec3(v.z, v.y, -v.x))
        .mapVertices(v => v.add(Vec3(0.5, 1.5, 1.0)))
        .mapColors(() => Color.BLUE)
        .mapMaterials(() => DiElectric(1.33333))
    scene.add(mesh);

    // cornell box
    scene.add(
        Triangle
            .builder()
            .name("left-1")
            .colors(Color.RED, Color.RED, Color.RED)
            .positions(Vec3(3, 0, 3), Vec3(3, 0, 0), Vec3())
            .build(),
        Triangle
            .builder()
            .name("left-2")
            .colors(Color.RED, Color.RED, Color.RED)
            .positions(Vec3(), Vec3(0, 0, 3), Vec3(3, 0, 3))
            .build(),
        Triangle
            .builder()
            .name("right-1")
            .colors(Color.GREEN, Color.GREEN, Color.GREEN)
            .positions(Vec3(0, 3, 0), Vec3(3, 3, 0), Vec3(3, 3, 3))
            .build(),
        Triangle
            .builder()
            .name("right-2")
            .colors(Color.GREEN, Color.GREEN, Color.GREEN)
            .positions(Vec3(3, 3, 3), Vec3(0, 3, 3), Vec3(0, 3, 0))
            .build(),
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
        Triangle
            .builder()
            .name("top-1")
            .colors(Color.WHITE, Color.WHITE, Color.WHITE)
            .positions(Vec3(3, 3, 3), Vec3(3, 0, 3), Vec3(0, 0, 3))
            .build(),
        Triangle
            .builder()
            .name("top-2")
            .colors(Color.WHITE, Color.WHITE, Color.WHITE)
            .positions(Vec3(0, 0, 3), Vec3(0, 3, 3), Vec3(3, 3, 3))
            .build(),
        Triangle
            .builder()
            .name("back-1")
            .colors(Color.WHITE, Color.WHITE, Color.WHITE)
            .positions(Vec3(), Vec3(0, 3, 0), Vec3(0, 3, 3))
            .build(),
        Triangle
            .builder()
            .name("back-2")
            .colors(Color.WHITE, Color.WHITE, Color.WHITE)
            .positions(Vec3(0, 3, 3), Vec3(0, 0, 3), Vec3())
            .build(),
        Triangle
            .builder()
            .name("light-1")
            .colors(Color.WHITE, Color.WHITE, Color.WHITE)
            .positions(Vec3(1, 1, 2.9), Vec3(2, 1, 2.9), Vec3(2, 2, 2.9))
            .emissive(true)
            .build(),
        Triangle
            .builder()
            .name("light-2")
            .colors(Color.WHITE, Color.WHITE, Color.WHITE)
            .positions(Vec3(2, 2, 2.9), Vec3(1, 2, 2.9), Vec3(1, 1, 2.9))
            .emissive(true)
            .build(),
    )
    scene.rebuild();

    // play
    const play = async ({ time, oldT }) => {
        const newT = new Date().getTime();
        const dt = (new Date().getTime() - oldT) * 1e-3;
        // camera.sceneShot(scene, { bounces: 10, samplesPerPxl: 10, gamma: 0.1 }).to(exposedCanvas);
        camera.sceneShot(scene).to(exposedCanvas);
        window.setTitle(`FPS: ${Math.floor(1 / dt)}`);

        setTimeout(() => play({
            oldT: newT,
            time: time + dt,
        }));
    }
    setTimeout(() => play({ oldT: new Date().getTime(), time: 0 }))
})()
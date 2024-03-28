import { Camera, Mesh, Scene, Vec3, Vec2, Color, Image } from "../../src/index.node.js";
import Window from "../../src/Window/Window.js";
import { readFileSync } from "fs"
// resize incoming canvas:Canvas object.
(async () => {
    const width = 640;
    const height = 480;
    const window = Window.ofSize(width, height);
    // scene
    const scene = new Scene()
    const camera = new Camera({ sphericalCoords: Vec3(100, Math.PI, 0) });
    // scene
    const obj = readFileSync("./assets/megaman.obj", { encoding: "utf-8" });
    let mesh = Mesh.readObj(obj, "mesh");
    mesh = mesh
        .addTexture(await Image.ofUrl("./assets/megaman.png"))
        .mapColors(() => Color.ofRGB(0.25, 0.25, 0.25))
        .mapVertices(v => Vec3(-v.y, v.x, v.z))
        .mapVertices(v => Vec3(v.z, v.y, -v.x))
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
        camera.sphericalCoords = camera.sphericalCoords.add(
            Vec3(
                0,
                -2 * Math.PI * (dx / window.width),
                2 * Math.PI * (dy / window.height)
            )
        );
        mouse = newMouse;
        camera.orbit();
    })
    window.onMouseWheel(({ dy }) => {
        camera.sphericalCoords = camera.sphericalCoords.add(Vec3(-dy, 0, 0));
        camera.orbit();
    })

    // play
    const play = async ({ time, oldT }) => {
        const newT = new Date().getTime();
        const dt = (new Date().getTime() - oldT) * 1e-3;
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

        setTimeout(() => play({
            oldT: newT,
            time: time + dt,
        }));
    }
    setTimeout(() => play({ oldT: new Date().getTime(), time: 0 }))
})();
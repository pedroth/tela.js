import { Camera, Window, Mesh, Scene, Vec3, Color } from "../../src/index.node.js";
import { readFileSync } from "fs"
// resize incoming canvas:Canvas object.
(async () => {
    const width = 640;
    const height = 480;
    const window = Window.ofSize(width, height)
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

    Animation
        .builder()
        .initialState({ it: 1, oldTime: new Date().getTime() })
        .nextState(({ it, oldTime }) => {
            camera.reverseShot(
                scene,
                {
                    cullBackFaces: true,
                    bilinearTextures: false,
                    clipCameraPlane: false
                }
            )
                .to(window);
            const dt = (new Date().getTime() - oldTime) * 1e-3;
            window.setTitle(`FPS: ${Math.floor(1 / dt)}`);
            return {
                it: it + 1,
                oldTime: new Date().getTime()
            };
        })
        .while(() => true)
        .build()
        .play();
})();
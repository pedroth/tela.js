import { Camera, Image, Mesh, Scene, Stream, Utils, IO, Vec3, Color } from "../../dist/node/index.js";
import { readFileSync } from "fs"
const { measureTime } = Utils;
const { saveImageStreamToVideo } = IO;
// resize incoming canvas:Canvas object.
(async () => {
    const width = 640;
    const height = 480;
    const FPS = 25;
    const dt = 1 / FPS;
    const maxT = 20;
    // scene
    const scene = new Scene()
    const camera = new Camera().orbit(100, Math.PI, 0);
    // scene
    const obj = readFileSync("./assets/megaman.obj", { encoding: "utf-8" });
    let mesh = Mesh.readObj(obj, "mesh");
    mesh = mesh
        .addTexture(Image.ofUrl("./assets/megaman.png"))
        .mapColors(() => Color.ofRGB(0.25, 0.25, 0.25))
        .mapVertices(v => Vec3(-v.y, v.x, v.z))
        .mapVertices(v => Vec3(v.z, v.y, -v.x))
    scene.addList(mesh.asTriangles());

    const imageStream = new Stream(
        { time: 0, i: 0, image: camera.reverseShot(scene, {cullBackFaces: false}).to(Image.ofSize(width, height)) },
        ({ time, i, image }) => {
            camera.orbit(100, time, 0);
            const newImage = camera.reverseShot(scene, {cullBackFaces: false}).to(image);
            return { time: time + dt, i: i + 1, image: newImage }
        }
    )

    console.log(
        "Video created in: ",
        measureTime(() => {
            saveImageStreamToVideo(
                "./mesh_video.mp4",
                imageStream,
                { fps: FPS }
            ).until(({ time }) => time < maxT);
        })
    )
})();
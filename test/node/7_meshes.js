import { Camera, Image, Mesh, NaiveScene, Stream, measureTime, IO, Vec3 } from "../../dist/node/index.js";
import { readFileSync } from "fs"
const { saveImageStreamToVideo } = IO;

const width = 640;
const height = 480;
const FPS = 25;
const dt = 1 / FPS;
const maxT = 20;
const cameraRadius = 3;
// scene
const scene = new NaiveScene();
const camera = new Camera().orbit(cameraRadius, Math.PI, 0);
// scene
const obj = readFileSync("./assets/megaman.obj", { encoding: "utf-8" });
let mesh = Mesh.readObj(obj, "mesh");
const box = mesh.getBoundingBox();
const scaleInv = 2 / box.diagonal.fold((e, x) => Math.max(e, x), Number.MIN_VALUE);
mesh = mesh
    .mapVertices(v => v.sub(box.center).scale(scaleInv))
    .mapVertices(v => Vec3(-v.y, v.x, v.z))
    .mapVertices(v => Vec3(v.z, v.y, -v.x))
    .addTexture(await Image.ofUrl("./assets/megaman.png"))
scene.addList(mesh.asTriangles());

const imageStream = new Stream(
    { time: 0, i: 0, image: camera.reverseShot(scene, { cullBackFaces: false }).to(Image.ofSize(width, height)) },
    ({ time, i, image }) => {
        camera.orbit(cameraRadius, time, 0);
        const newImage = camera.reverseShot(scene, { cullBackFaces: false }).to(image);
        return { time: time + dt, i: i + 1, image: newImage }
    }
);

console.log(
    "Video created in: ",
    await measureTime(async () => {
        await saveImageStreamToVideo(
            "./mesh_video.mp4",
            imageStream,
            { fps: FPS }
        ).while(({ time }) => time < maxT);
    })
);
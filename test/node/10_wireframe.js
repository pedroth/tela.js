import {
    Image,
    Stream,
    IO,
    measureTime,
    Color,
    NaiveScene,
    Camera,
    Vec3,
    Mesh,
    clamp
} from "../../dist/node/index.js";
import { readFileSync } from "fs";
const { saveImageStreamToVideo } = IO;

(async () => {
    const width = 640;
    const height = 480;
    const FPS = 25;
    const dt = 1 / FPS;
    const maxT = 10;
    // scene
    const scene = new NaiveScene();
    const camera = new Camera().orbit(5, 0, 0);

    const spotObj = readFileSync("./assets/spot.obj", { encoding: "utf-8" });
    const spotMesh = Mesh.readObj(spotObj, "spot")
        .mapVertices(v => Vec3(-v.y, v.x, v.z))
        .mapVertices(v => Vec3(v.z, v.y, -v.x))
        .mapColors(() => Color.ofRGB(0.25, 0.25, 0.25))
        .addTexture(await Image.ofUrl("./assets/spot.png"))
    scene.addList(spotMesh.asTriangles());

    const stanfordBunnyObj = readFileSync("./assets/bunny.obj", { encoding: "utf-8" })
    let bunnyMesh = Mesh.readObj(stanfordBunnyObj, "bunny");
    const bunnyBox = bunnyMesh.getBoundingBox();
    bunnyMesh = bunnyMesh
        .mapVertices(v =>
            v
                .sub(bunnyBox.min)
                .div(bunnyBox.diagonal)
                .scale(2)
                .sub(Vec3(1, 1, 1))
        )
        .mapVertices(v => Vec3(-v.y, v.x, v.z))
        .mapVertices(v => Vec3(v.z, v.y, -v.x))
        .mapColors(v =>
            Color.ofRGB(
                ...v.map(x => clamp()(0.5 * (x + 1)))
                    .toArray()
            )
        )
    scene.addList(bunnyMesh.asLines());

    const imageStream = new Stream(
        { time: 0, i: 0, image: Image.ofSize(width, height) },
        ({ time, i, image }) => {
            const theta = Math.PI / 4 * time;
            camera.orbit(orbit => Vec3(orbit.x, theta, 0));
            const newImage = camera.reverseShot(scene).to(image);
            return {
                time: time + dt,
                i: i + 1,
                image: newImage
            };
        }
    )

    console.log(
        "Video created in: ",
        measureTime(() => {
            saveImageStreamToVideo(
                "./wireframe.mp4",
                imageStream,
                { fps: FPS }
            ).until(({ time }) => time < maxT);
        })
    )
})()

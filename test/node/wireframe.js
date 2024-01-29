import {
    Image,
    Stream,
    IO,
    Utils,
    Color,
    NaiveScene,
    Camera,
    Vec3,
    Mesh
} from "../../dist/node/index.js";
import { readFileSync } from "fs";
const { saveImageStreamToVideo } = IO;
const { measureTime } = Utils;

(async () => {
    const width = 640;
    const height = 480;
    const FPS = 25;
    const dt = 1 / FPS;
    const maxT = 20;
    // scene
    const scene = new NaiveScene();
    const camera = new Camera({ sphericalCoords: Vec3(5, 0, 0) });

    const spotObj = readFileSync("./assets/spot.obj", { encoding: "utf-8" });
    const spotMesh = Mesh.readObj(spotObj)
        .mapVertices(v => Vec3(-v.y, v.x, v.z))
        .mapVertices(v => Vec3(v.z, v.y, -v.x))
        .mapColors(() => Color.ofRGB(0.25, 0.25, 0.25))
        .addTexture(await Image.ofUrl("./assets/spot.png"))
    scene.addList(spotMesh.asTriangles("spot"));

    const stanfordBunnyObj = readFileSync("./assets/bunny.obj", { encoding: "utf-8" })
    let bunnyMesh = Mesh.readObj(stanfordBunnyObj);
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
            Color.ofRGB(...v
                .map(x =>
                    Math.max(
                        0,
                        Math.min(
                            1,
                            0.5 * (x + 1)
                        )
                    )
                )
                .toArray()
            )
        )
    scene.addList(bunnyMesh.asLines("bunny"));

    const imageStream = new Stream(
        { time: 0, i: 0, image: Image.ofSize(width, height) },
        ({ time, i, image }) => {
            const theta = Math.PI / 4 * time;
            camera.sphericalCoords = Vec3(camera.sphericalCoords.get(0), theta, 0);
            camera.orbit();
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

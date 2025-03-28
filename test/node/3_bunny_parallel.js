import { Camera, IO, Parallel, Vec3, Mesh, Color, KScene, measureTime } from "../../src/index.node.js";
import os from "node:os";
const { saveParallelImageStreamToVideo } = IO;

const width = 640;
const height = 480;
const FPS = 25;
const maxT = 10;
const dt = 1 / FPS;
const numberOfProcessors = os.cpus().length;
const numOfFrames = Math.floor(FPS * maxT);

function bunny({ time, scene, width, height }) {
    const theta = Math.PI / 4 * time;
    const camera = new Camera().orbit(5, theta, 0);
    return camera.normalShot(scene).to(Image.ofSize(width, height));
}

const parallelImagesStream =
    Parallel
        .builder()
        .numberOfStreams(numOfFrames)
        .lazyInitialState(() => {
            const scene = new KScene();
            // eslint-disable-next-line no-undef
            const stanfordBunnyObj = fs.readFileSync("./assets/bunny_orig.obj", { encoding: "utf-8" });
            let bunnyMesh = Mesh.readObj(stanfordBunnyObj, "bunny");
            const bunnyBox = bunnyMesh.getBoundingBox();
            bunnyMesh = bunnyMesh
                .mapVertices(v => v.sub(bunnyBox.min).div(bunnyBox.diagonal).scale(2).sub(Vec3(1, 1, 1)))
                .mapVertices(v => Vec3(-v.y, v.x, v.z))
                .mapVertices(v => Vec3(v.z, v.y, -v.x))
                .mapColors(v => Color.ofRGB(...v.map(x => Math.max(0, Math.min(1, 0.5 * (x + 1)))).toArray()));
            scene.addList(bunnyMesh.asSpheres(0.05));
            return { scene };
        })
        .inputStreamGenerator((i) => ({ time: i * dt, width, height }))
        .partitionFunction((_, i) => i % (numberOfProcessors))
        .stateGenerator(({ time, width, height, scene }) => bunny({ time, width, height, scene }), [bunny])
        .build()

console.log(
    "Video created in: ",
    await measureTime(async () => {
        await saveParallelImageStreamToVideo(
            "./bunny_parallel.mp4",
            parallelImagesStream,
            { fps: FPS }
        );
    })
)
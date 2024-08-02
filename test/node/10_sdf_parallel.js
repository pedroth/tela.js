import { Camera, IO, Parallel, Vec3, Mesh, KScene, measureTime } from "../../dist/node/index.js";
import os from "os";
const { saveParallelImageStreamToVideo } = IO;

const width = 640;
const height = 480;
const FPS = 25;
const maxT = 10;
const dt = 1 / FPS;
const numberOfProcessors = os.cpus().length;
const numOfFrames = Math.floor(FPS * maxT);

function video({ time, scene, width, height }) {
    const theta = Math.PI / 4 * time;
    const camera = new Camera().orbit(5, theta, 0);
    return camera.sdfShot(scene).to(Image.ofSize(width, height));
}

const parallelImagesStream =
    Parallel
        .builder()
        .numberOfStreams(numOfFrames)
        .lazyInitialState(() => {
            const scene = new KScene();
            // eslint-disable-next-line no-undef
            const obj = fs.readFileSync("./assets/spot.obj", { encoding: "utf-8" });
            let mesh = Mesh.readObj(obj, "mesh");
            mesh = mesh
                .mapVertices(v => Vec3(-v.y, v.x, v.z))
                .mapVertices(v => Vec3(v.z, v.y, -v.x))
            scene.add(...mesh.asPoints(0.05));
            scene.rebuild();
            return { scene };
        })
        .inputStreamGenerator((i) => ({ time: i * dt, width, height }))
        .partitionFunction((_, i) => i % (numberOfProcessors))
        .stateGenerator(({ time, width, height, scene }) => video({ time, width, height, scene }), [video])
        .build()

console.log(
    "Video created in: ",
    await measureTime(async () => {
        await saveParallelImageStreamToVideo(
            "./sdf_parallel.mp4",
            parallelImagesStream,
            { fps: FPS }
        );
    })
)
import { Camera, IO, Parallel, Vec3, Mesh, KScene, measureTime, Vec2, Color, Ray } from "../../src/index.node.js";
import os from "os";
const { saveParallelImageStreamToVideo } = IO;

const width = 640;
const height = 480;
const FPS = 30;
const maxT = 4;
const dt = 1 / FPS;
const numberOfProcessors = os.cpus().length;
const numOfFrames = Math.floor(FPS * maxT);

function video({ time, scene, width, height }) {

    function torusSdf(r, R) {
        return p => {
            const q = Vec2(p.x, p.y).length() - r;
            return Vec2(q, p.z).length() - R;
        }
    }

    function smin(a, b, k = 32) {
        const res = Math.exp(-k * a) + Math.exp(-k * b);
        return -Math.log(res) / k;
    }

    function normalFunction(F, p) {
        const epsilon = 1e-3;
        const f = F(p);
        const n = Vec3(
            F(p.add(Vec3(epsilon, 0, 0))) - f,
            F(p.add(Vec3(0, epsilon, 0))) - f,
            F(p.add(Vec3(0, 0, epsilon))) - f,
        );
        return n.normalize();
    }

    const rayScene = (ray, { scene, time }) => {
        const maxIte = 100;
        const maxDist = 10;
        const epsilon = 1e-3;
        const { init } = ray;
        let p = init;
        let t = 0;
        const torusDist = torusSdf(0.75, 0.25);
        for (let i = 0; i < maxIte; i++) {
            p = ray.trace(t);
            const tau = ((Math.sin(2 * Math.PI * 0.25 * (time - 1)) + 1) / 2);
            const torusD = torusDist(p);
            const sceneDist = scene.distanceOnRay(Ray(p, ray.dir), smin);
            const d = tau * torusD + (1 - tau) * sceneDist;
            t += d;
            if (d < epsilon) {
                const normal = normalFunction(torusDist, p).scale(tau).add(scene.normalToPoint(p).scale(1 - tau)).normalize();
                return Color.ofRGB(...normal.map(x => (x + 1) / 2).toArray());
            }
            if (d > maxDist) return Color.ofRGB(0, 0, 0);
        }
        return Color.BLACK;
    };

    const theta = 2 * Math.PI * 0.25 * (time - 1);
    const camera = new Camera().orbit(3, theta, Math.PI / 4);
    return camera.rayMap(ray => rayScene(ray, { time, scene })).to(Image.ofSize(width, height));
}

const parallelImagesStream =
    Parallel
        .builder()
        .numberOfStreams(numOfFrames)
        .lazyInitialState(() => {
            const scene = new KScene();
            // eslint-disable-next-line no-undef
            const obj = fs.readFileSync("./assets/bunny_orig.obj", { encoding: "utf-8" });
            let mesh = Mesh.readObj(obj, "mesh");
            const box = mesh.getBoundingBox();
            const scaleInv = 2 / box.diagonal.fold((e, x) => Math.max(e, x), Number.MIN_VALUE);
            mesh = mesh
                .mapVertices((v) => v.sub(box.center).scale(scaleInv))
                .mapVertices((v) => Vec3(-v.y, v.x, v.z))
                .mapVertices((v) => Vec3(v.z, v.y, -v.x))
            scene.addList(mesh.asSpheres(0.05));
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
            "./sdf_parallel_2.mp4",
            parallelImagesStream,
            { fps: FPS }
        );
    })
)
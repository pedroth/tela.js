import { Color, Image, Stream, IO, Mesh, Vec3, KScene, Camera, clamp, measureTime } from "../../src/index.node.js";
import { readFileSync } from "node:fs"

const { saveImageStreamToVideo } = IO;

// constants
const width = 640*2;
const height = 480*2;
const FPS = 25;
const dt = 1 / FPS;
const maxT = 10;

// scene
const scene = new KScene();
const camera = new Camera().orbit(10, 0, Math.PI / 6);
const stanfordBunnyObj = readFileSync("./assets/bunny_orig.obj", { encoding: "utf-8" });
let bunnyMesh = Mesh.readObj(stanfordBunnyObj, "bunny");
const bunnyBox = bunnyMesh.getBoundingBox();
bunnyMesh = bunnyMesh
    .mapVertices(v => v.sub(bunnyBox.min).div(bunnyBox.diagonal).scale(2).sub(Vec3(1, 1, 1)))
    .mapVertices(v => Vec3(-v.y, v.x, v.z))
    .mapVertices(v => Vec3(v.z, v.y, -v.x))
    .mapVertices(v => v.add(Vec3(0, 0, 3)))
    .mapColors(v => Color.ofRGB(...v.map(x => clamp()((x + 1) / 2)).toArray()));

const bunnyTriangles = bunnyMesh.asTriangles();
const bunnySpeeds = [...Array(bunnyTriangles.length * 3)].map(() => Vec3().map(() => 5 * (2 * Math.random() - 1)));
scene.addList(bunnyTriangles);


// physics
const g = -9.8;
const epsilon = 0.01;
const bunnyPhysics = dt => {
    for (let i = 0; i < bunnyTriangles.length; i++) {
        const acceleration = Vec3(0, 0, g);
        const si = i * 3;
        bunnySpeeds[si] = bunnyTriangles[i].positions[0].z <= epsilon ?
            Vec3(0, 0, -bunnyTriangles[i].positions[0].z) :
            bunnySpeeds[si].add(acceleration.scale(dt));
        bunnySpeeds[si + 1] = bunnyTriangles[i].positions[1].z <= epsilon ?
            Vec3(0, 0, -bunnyTriangles[i].positions[1].z) :
            bunnySpeeds[si + 1].add(acceleration.scale(dt));
        bunnySpeeds[si + 2] = bunnyTriangles[i].positions[2].z <= epsilon ?
            Vec3(0, 0, -bunnyTriangles[i].positions[2].z) :
            bunnySpeeds[si + 2].add(acceleration.scale(dt));
        bunnyTriangles[i].positions = [
            bunnyTriangles[i].positions[0].add(bunnySpeeds[si].scale(dt)),
            bunnyTriangles[i].positions[1].add(bunnySpeeds[si + 1].scale(dt)),
            bunnyTriangles[i].positions[2].add(bunnySpeeds[si + 2].scale(dt))
        ];
        // make constraints satisfied to maintain triangle shape
        const edges = [...bunnyTriangles[i].edges]; // edges are calculated from beginning of triangle creation
        const edgeDistances = edges.map(e => e.length());
        const n = bunnyTriangles[i].positions.length;
        const mod = (x, n) => ((x % n) + n) % n;
        // calculate the gradient for each vertex in the triangle
        // to move them towards the correct position
        // this is a simple gradient descent approach
        // to maintain the triangle shape
        for (let k = 0; k < 10; k++) {
            for (let j = 0; j < n; j++) {
                const curr = j;
                const prev = mod(curr - 1, n);
                const next = mod(curr + 1, n);
                const c1 = bunnyTriangles[i].positions[curr].sub(bunnyTriangles[i].positions[prev]).length() - edgeDistances[prev];
                const c2 = bunnyTriangles[i].positions[curr].sub(bunnyTriangles[i].positions[next]).length() - edgeDistances[curr];
                const grad1 = bunnyTriangles[i].positions[curr].sub(bunnyTriangles[i].positions[prev]).normalize().scale(2 * c1);
                const grad2 = bunnyTriangles[i].positions[curr].sub(bunnyTriangles[i].positions[next]).normalize().scale(2 * c2);
                const grad = grad1.add(grad2);
                bunnyTriangles[i].positions[curr] = bunnyTriangles[i].positions[curr].add(grad.scale(-dt));
            }
        }
    }
}

const canvas = Image.ofSize(width, height);
const imageStream = new Stream(
    { time: 0, image: camera.sceneShot(scene).to(canvas) },
    async ({ time, image }) => {
        const theta = Math.PI / 6 * time;
        camera.orbit(orbit => Vec3(orbit.x, theta, Math.PI / 6));
        const newImage = camera.reverseShot(scene).to(image);
        if (time > 5) bunnyPhysics(dt);
        return {
            time: time + dt,
            image: newImage
        };
    }
)

console.log(
    "Video created in: ",
    await measureTime(async () => {
        await saveImageStreamToVideo(
            "./bunny_explode_tri.mp4",
            imageStream,
            { fps: FPS }
        ).while(({ time }) => time < maxT);
    })
)


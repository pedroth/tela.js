import { writeFileSync, unlinkSync } from "fs";
import { IO } from "../../dist/node/index.js";
import { exec, execSync, spawn } from "child_process";
import path from "path";
const { createPPMFromFromImage } = IO;

export async function measureTime(lambda) {
    const t = performance.now();
    await lambda()
    return 1e-3 * (performance.now() - t);
}


const fileName = "bunny_parallel_optimized";
const deltaT = 0.04; //seconds per frame
const maxT = 10; // seconds
const numOfFrames = Math.floor(maxT / deltaT);
const FPS = Math.floor(1 / deltaT);
const parallelStreams = 20;
const partitions = [...Array(numOfFrames)].map((_,i) => i).reduce((e,x) => {
    const index = x % parallelStreams;
    if(!e[index]) e[index] = [];
    e[index].push(x);
    return e;
}, {}) 
const imageProducers = Object.values(partitions).map(partition => {
    return (
        `
        import { Color, Image, Stream, IO, Utils, Mesh, Vec3, Scene, Camera } from "./dist/node/index.js";
        import { readFileSync, writeFileSync } from "fs"

        ${createPPMFromFromImage.toString().replaceAll("function", "function createPPMFromFromImage")}
        
        (() => {
            const width = 640;
            const height = 480;

            const scene = new Scene()
            const camera = new Camera({ sphericalCoords: Vec3(5, 0, 0) });
            const stanfordBunnyObj = readFileSync("./assets/bunny.obj", { encoding: "utf-8" });
            let bunnyMesh = Mesh.readObj(stanfordBunnyObj);
            const bunnyBox = bunnyMesh.getBoundingBox();
            bunnyMesh = bunnyMesh
                .mapVertices(v => v.sub(bunnyBox.min).div(bunnyBox.diagonal).scale(2).sub(Vec3(1, 1, 1)))
                .mapVertices(v => Vec3(-v.y, v.x, v.z))
                .mapVertices(v => Vec3(v.z, v.y, -v.x))
                .mapColors(v => Color.ofRGB(...v.map(x => Math.max(0, Math.min(1, 0.5 * (x + 1)))).toArray()));
            scene.add(...bunnyMesh.asPoints("bunny", 0.05));
            const deltaT = ${deltaT};
            const partitionIndices = [${partition.toString()}];
            for(let i = 0; i < partitionIndices.length; i++) {
                const j = partitionIndices[i];
                const time = deltaT * j;
                const theta = Math.PI / 4 * time;
                camera.sphericalCoords = Vec3(camera.sphericalCoords.get(0), theta, 0);
                camera.orbit();
                const image = camera.sceneShot(scene).to(Image.ofSize(width, height));
                writeFileSync(\`${fileName}_\${j}.ppm\`, createPPMFromFromImage(image));
                console.log("Image created", j);
            }
            return 0;
        })();
    `
    );
});

(async () => {
    const time = await measureTime(
        () => {
            const promises = [...Array(parallelStreams)].map((_, i) => {
                const spawnFile = "ParallelRender_" + i + ".js";
                const spawnFilePath = path.join("./", spawnFile);
                writeFileSync(spawnFilePath, imageProducers[i]);
                return new Promise(resolve => {
                    exec(`bun ${spawnFilePath.toString()}`, () => {
                        resolve();
                    });
                });
            });
            return Promise
                .all(promises)
                .then(() => {
                    return new Promise(resolve => exec(
                        `ffmpeg -framerate ${FPS} -i ${fileName}_%d.ppm ${fileName}.mp4`,
                        () => resolve()
                    )
                    );
                })
                .then(() => {
                    for (let i = 0; i < numOfFrames; i++) {
                        unlinkSync(`${fileName}_${i}.ppm`);
                    }
                    for (let i = 0; i < parallelStreams; i++) {
                        unlinkSync(`ParallelRender_${i}.js`);
                    }
                });
        });
    console.log(
        "Video created in: ",
        time
    )
})()
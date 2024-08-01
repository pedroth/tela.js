import os from "node:os";
import { Color, Image, IO, measureTime, Parallel } from "../../dist/node/index.js";
const { saveParallelImageStreamToVideo } = IO;

const width = 640;
const height = 480;
const FPS = 100;
const dt = 1 / FPS; // 100 FPS
const maxT = 5;
const numberOfProcessors = os.cpus().length;
const numOfFrames = Math.floor(FPS * maxT);



function clamp(x) { return Math.max(Math.min(1, x), 0) }
function palette(t) {
    let a = [0.5, 0.5, 0.5];
    let b = [0.5, 0.5, 0.5];
    let c = [1.0, 1.0, 1.0];
    let d = [0.263, 0.416, 0.557];
    return [a[0] + b[0] * Math.cos(6.28318 * (c[0] * t + d[0])), a[1] + b[1] * Math.cos(6.28318 * (c[1] * t + d[1])), a[2] + b[2] * Math.cos(6.28318 * (c[2] * t + d[2]))];
}

function amazing({ time, width, height }) {
    return Image.ofSize(width, height)
        .map((x, y) => {
            let u = (2 * x - width) / height
            let v = (2 * y - height) / height;
            const u0 = u;
            const v0 = v;
            let finalColor = [0, 0, 0]
            for (let i = 0; i < 4; i++) {
                u = (u * 1.5 - Math.floor(u * 1.5)) - 0.5;
                v = (v * 1.5 - Math.floor(v * 1.5)) - 0.5;
                const d0 = -Math.sqrt(u0 * u0 + v0 * v0);
                let d = Math.sqrt(u * u + v * v) * Math.exp(d0);
                const col = palette(d0 + i * 0.4 + time * 0.4);
                d = Math.sin(d * 8 + time) / 8;
                d = Math.abs(d);
                d = Math.pow(0.01 / d, 1.2);

                finalColor = [finalColor[0] + col[0] * d, finalColor[1] + col[1] * d, finalColor[2] + col[2] * d]
            }
            return Color.ofRGB(clamp(finalColor[0]), clamp(finalColor[1]), clamp(finalColor[2]));
        });
}

const parallelImagesStream =
    Parallel
        .builder()
        .numberOfStreams(numOfFrames)
        .inputStreamGenerator((i) => ({ time: i * dt, width, height }))
        .partitionFunction((_, i) => i % (numberOfProcessors))
        .stateGenerator(({ time, width, height }) => amazing({ time, width, height }), [amazing, clamp, palette])
        .build();

console.log(
    "Video created in: ",
    await measureTime(async () => {
        await saveParallelImageStreamToVideo(
            "./amazing_parallel_2.mp4",
            parallelImagesStream,
            { fps: FPS }
        );
    })
)
import os from "os";
import { Image, IO, Utils, Vec2, Box, Color, Parallel } from "../../dist/node/index.js";
const { saveParallelImageStreamToVideo } = IO;
const { measureTime, measureTimeWithAsyncResult } = Utils;

(async () => {
    const width = 640;
    const height = 480;
    const FPS = 25;
    const maxT = 60;
    const dt = 1 / FPS;
    const numberOfProcessors = os.cpus().length;
    const numOfFrames = Math.floor(FPS * maxT);

    function mandelbrot(i, width, height) {
        const ite = 100;
        const size = Vec2(width, height);
        const complexMul = (z, w) => Vec2(z.x * w.x - z.y * w.y, z.x * w.y + z.y * w.x);
        const image = Image.ofSize(width, height);
        let box = new Box(
            Vec2(-0.948163086364632, 0.2561877382574972),
            Vec2(-0.9481630863646167, 0.25618773825751284)
        );
        const beta = 1.025;
        box = box.scale(beta ** i);
        return image.map((x, y) => {
            let p = Vec2(x, y).div(size);
            p = p.map(z => 2 * z - 1);
            p = Vec2(p.x * (size.x / size.y) - 0.5, p.y);
            p = box.min.add(
                box.diagonal.mul(
                    p.add(Vec2(1, 1)).scale(1 / 2)
                )
            )
            let z = Vec2();
            for (let i = 0; i < ite; i++) {
                z = complexMul(z, z).add(p);
            }
            const l = z.length();
            const ll = Math.min(1, Math.max(0, l));
            return Color.ofRGB(1 - ll, ll, 0);
        })
    }

    const parallelImagesStream =
        Parallel
            .builder()
            .numberOfStreams(numOfFrames)
            .inputStreamGenerator((i) => ({ i, width, height }))
            .partitionFunction((_, i) => i % (numberOfProcessors))
            .stateGenerator(({ i, width, height }) => mandelbrot(i, width, height), [mandelbrot])
            .build()

    console.log(
        "Video created in: ",
        await measureTimeWithAsyncResult(async () => {
            await saveParallelImageStreamToVideo(
                "./mandelbrot_parallel.mp4",
                parallelImagesStream,
                { fps: FPS }
            );
        })
    )
})()

import { Image, Stream, IO, Utils, Vec2, Box, Color } from "../../dist/node/index.js";
const { saveImageStreamToVideo } = IO;
const { measureTimeWithResult, measureTime } = Utils;

(async () => {
    const width = 640;
    const height = 480;
    const FPS = 25;
    // utils
    const size = Vec2(width, height);
    const complexMul = (z, w) => Vec2(z.x * w.x - z.y * w.y, z.x * w.y + z.y * w.x);
    // let box = new Box(Vec2(-1, -1), Vec2(1, 1));
    let box = new Box(
        Vec2(-0.948163086364632, 0.2561877382574972),
        Vec2(-0.9481630863646167, 0.25618773825751284)
    );
    function mandelbrot(image) {
        const ite = 100;
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

    // scene
    const imageStream = new Stream(
        { time: 0, image: mandelbrot(Image.ofSize(width, height)) },
        ({ time, image }) => {
            const dt = 1 / FPS;
            const scale = 1e-1 * time;
            box = box.scale(1 + scale);
            const { result: newImage, time: t } = measureTimeWithResult(() => mandelbrot(image));
            console.log(`Image took ${t}s`);
            return {
                time: time + dt,
                image: newImage
            };
        }
    )

    console.log(
        "Video created in: ",
        measureTime(() => {
            saveImageStreamToVideo(
                "./mandelbrot.mp4",
                imageStream,
                { fps: 25 }
            ).until(({ time }) => time < 20);
        })
    )
})()

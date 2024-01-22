import { Image, Stream, IO, Utils, Vec2, Box } from "../../dist/node/index.js";
const { saveImageStreamToVideo } = IO;
const { measureTimeWithResult, measureTime } = Utils;

(async () => {
    const width = 640;
    const height = 480;
    const FPS = 25;
    const dt = 1 / FPS;
    const maxT = 20;
    // utils
    const size = Vec2(width, height);
    const texture = await Image.ofUrl("./assets/earth.jpg");
    function shader(image, box) {
        return image.map((x, y) => {
            let p = Vec2(x, y).div(size);
            p = p.map(z => 2 * z - 1);
            p = box.min.add(
                box.diagonal.mul(
                    p.add(Vec2(1, 1)).scale(1 / 2)
                )
            )
            return texture.getPxl(p.x * texture.width, p.y * texture.height);
        });
    }
    const initialImage = shader(
        Image.ofSize(width, height),
        new Box(Vec2(), Vec2(1, 1))
    );
    // scene
    const imageStream = new Stream(
        { time: 0, i: 0, image: initialImage },
        ({ time, i, image }) => {
            const box = new Box(
                Vec2(-time, -time),
                Vec2(1 + time, 1 + time)
            );
            // const box = new Box(
            //     Vec2(time, time),
            //     Vec2(1 + time, 1 + time)
            // );
            const { result: newImage, time: t } = measureTimeWithResult(
                () => shader(image, box)
            );
            console.log(`Image took ${t}s`);
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
                "./texture_shader.mp4",
                imageStream,
                { fps: FPS }
            ).until(({ time }) => time < maxT);
        })
    )
})()

import { Image, Stream, IO, measureTimeWithResult, measureTime, Vec2, Box } from "../../src/index.node.js";
const { saveImageStreamToVideo } = IO;

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
        const speed = 0.25;
        const box = new Box(
            Vec2(-speed * time + time, -speed * time + time),
            Vec2(1 + speed * time + time, 1 + speed * time + time)
        );
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
    await measureTime(async () => {
        await saveImageStreamToVideo(
            "./texture_shader.mp4",
            imageStream,
            { fps: FPS }
        ).while(({ time }) => time < maxT);
    })
)

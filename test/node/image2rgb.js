import { Image, Stream, IO, Utils, Vec3, NaiveScene, Camera, Point } from "../../dist/node/index.js";
const { saveStreamToFile } = IO;
const { measureTimeWithResult, measureTime } = Utils;

(async () => {
    const width = 640;
    const height = 480;

    // scene
    const scene = new NaiveScene();
    const camera = new Camera({ sphericalCoords: Vec3(4, 0, 0) });
    const [img, time] = await measureTimeWithResult(() => Image.ofUrl("./assets/kakashi.jpg"));
    const grid = [...Array(img.width * img.height)]
        .map((_, k) => {
            const i = Math.floor(k / img.width);
            const j = k % img.width;
            const x = j;
            const y = i;
            return Point
                .builder()
                .name(`pxl_${k}`)
                .radius(0.01)
                .position(
                    Vec3(0, x / img.width, y / img.height)
                )
                .color(img.getPxl(x, y))
                .build();
        });
    console.log(">>>>", time)
    scene.addList(grid);
    // saveImageToFile("kakashi.png", camera.reverseShot(scene).to(Image.ofSize(width, height)));

    const imageStream = new Stream(
        { time: 0, image: camera.reverseShot(scene).to(Image.ofSize(width, height)) },
        ({ time, image }) => {
            const dt = 0.04; // 25 FPS
            const theta = Math.PI / 4 * time;
            camera.sphericalCoords = Vec3(camera.sphericalCoords.get(0), theta, Math.PI / 4);
            camera.orbit();
            const { result: newImage, time: t } = measureTimeWithResult(() => camera.reverseShot(scene).to(image));
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
            saveStreamToFile(
                "./kakashi.mp4",
                imageStream,
                { fps: 25 }
            ).until(({ time }) => time < 10);
        })
    )
})()

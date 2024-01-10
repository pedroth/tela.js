import { Image, Stream, IO, Utils, Vec3, NaiveScene, Camera, Point, Color } from "../../dist/node/index.js";
const { saveStreamToFile, saveImageToFile } = IO;
const { measureTimeWithResult, measureTime } = Utils;

(async () => {
    const width = 640;
    const height = 480;
    const FPS = 25;

    // scene
    const scene = new NaiveScene();
    const camera = new Camera({ sphericalCoords: Vec3(2, 0, 0), focalPoint: Vec3(0.5, 0.5, 0.5) });
    const img = await Image.ofUrl("./assets/chapelle.jpg");
    const grid = [...Array(img.width * img.height)]
        .map((_, k) => {
            const i = Math.floor(k / img.width);
            const j = k % img.width;
            const x = j;
            const y = i;
            const initial = Vec3(0, x / img.width, y / img.height);
            return {
                init: initial,
                point: Point
                    .builder()
                    .name(`pxl_${k}`)
                    .radius(0.01)
                    .position(initial)
                    .color(img.getPxl(x, y))
                    .build()
            }
        });
    scene.addList(grid.map(({ point }) => point));

    const stateMachine = (() => {
        let state = 0;
        const dt = 1 / FPS;
        const period = 10;
        const halfPeriod = period / 2;
        return t => {
            let time = t % period;
            if (state === 0 && time < halfPeriod) {
                grid.forEach(({ init, point }) => {
                    const speed = init.sub(point.position);
                    point.position = point.position.add(speed.scale(dt));
                })
                return state;
            }
            if (state === 0 && time >= halfPeriod) {
                return state++;
            }
            if (state === 1 && time >= halfPeriod) {
                grid.forEach(({ point }) => {
                    const colorVec3 = Vec3(...point.color.toArray());
                    const speed = colorVec3.sub(point.position);
                    point.position = point.position.add(speed.scale(dt));
                })
                return state;
            }
            if (state === 1 && time < halfPeriod) {
                return state--;
            }
        }
    })();

    // let image = camera.reverseShot(scene).to(Image.ofSize(width, height));
    // saveImageToFile("test0.jpg", image);
    // saveImageToFile("test1.jpg", image.fill(Color.BLACK));

    const imageStream = new Stream(
        { time: 0, image: camera.reverseShot(scene).to(Image.ofSize(width, height)) },
        ({ time, image }) => {
            const dt = 1 / FPS;
            const theta = Math.PI / 4 * time;
            camera.sphericalCoords = Vec3(camera.sphericalCoords.get(0), theta, 0);
            camera.orbit();
            stateMachine(time);
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
                "./image2rgb.mp4",
                imageStream,
                { fps: 25 }
            ).until(({ time }) => time < 20);
        })
    )
})()

import { Image, Stream, IO, Utils, Vec3, NaiveScene, Camera, Point } from "../../dist/node/index.js";
const { saveImageStreamToVideo } = IO;
const { measureTimeWithResult, measureTime } = Utils;

(async () => {
    const width = 640;
    const height = 480;
    const FPS = 25;

    // scene
    const scene = new NaiveScene();
    const camera = new Camera({ sphericalCoords: Vec3(2, 0, 0), lookAt: Vec3(0.5, 0.5, 0.5) });
    const img = await Image.ofUrl("./assets/kakashi.jpg");
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
                    .radius(1e-5)
                    .position(initial)
                    .color(img.getPxl(x, y))
                    .build()
            }
        })
    // for (let i = grid.length - 1; i > 0; i--) {
    //     // random number between 0 and i
    //     const r = Math.floor(Math.random() * (i + 1));
    //     //swap in place
    //     const temp = grid[i];
    //     grid[i] = grid[r];
    //     grid[r] = temp;
    // }
    console.log(measureTime(() => scene.addList(grid.map(({ point }) => point))));

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
            saveImageStreamToVideo(
                "./image2rgb.mp4",
                imageStream,
                { fps: 25 }
            ).until(({ time }) => time < 20);
        })
    )
})()

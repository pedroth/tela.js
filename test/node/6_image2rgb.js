import { Image, Stream, IO, measureTimeWithResult, measureTime, Vec3, NaiveScene, Camera, Sphere } from "../../src/index.node.js";
const { saveImageStreamToVideo } = IO;

const width = 640;
const height = 480;
const FPS = 25;

// scene
const scene = new NaiveScene();
const camera = new Camera({ lookAt: Vec3(0.5, 0.5, 0.5) }).orbit(2, 0, 0);
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
            point: Sphere
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
    async ({ time, image }) => {
        const dt = 1 / FPS;
        const theta = Math.PI / 4 * time;
        camera.orbit(coord => Vec3(coord.x, theta, 0));
        stateMachine(time);
        const { result: newImage, time: t } = await measureTimeWithResult(() => camera.reverseShot(scene).to(image));
        console.log(`Image took ${t}s`);
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
            "./image2rgb.mp4",
            imageStream,
            { fps: 25 }
        ).while(({ time }) => time < 20);
    })
)

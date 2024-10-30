import { Image, measureTime, Vec3, NaiveScene, Camera, Sphere, Anima, videoAsync, Window, loop } from "../../src/index.node.js";

const width = 640;
const height = 480;
const FPS = 25;
const dt = 1 / FPS;
// scene
const scene = new NaiveScene();
const camera = new Camera({ lookAt: Vec3(0.5, 0.5, 0.5) }).orbit(5, 0, 0);
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
scene.addList(grid.map(({ point }) => point));


const duration = 1;
const animation = Anima.list(
    Anima.behavior(t => {
        grid.forEach(({ init, point }) => {
            const speed = init.sub(point.position);
            point.position = point.position.add(speed.scale(t));
        })
    }, duration),
    Anima.wait(duration),
    Anima.behavior(t => {
        grid.forEach(({ point }) => {
            const colorVec3 = Vec3(...point.color.toArray());
            const speed = colorVec3.sub(point.position);
            point.position = point.position.add(speed.scale(t));
        })
    }, duration),
    Anima.wait(duration)
)

const videoUpdate = async ({ time, image }) => {
    const theta = Math.PI / 4 * time;
    camera.orbit(coord => Vec3(coord.x, theta, 0));
    animation.loop(0.25 * time, dt);
    const newImage = camera.reverseShot(scene).to(image).paint();
    return newImage;
}

console.log(
    "Video created in: ",
    await measureTime(async () => {
        await videoAsync(
            "./image2rgb.mp4",
            videoUpdate,
            { width, height, FPS }
        ).while(({ time }) => time < 20);
    })
)

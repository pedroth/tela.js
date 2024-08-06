import { Color, video } from "../../src/index.node.js";

const width = 640;
const height = 480;
const FPS = 25;
const maxVideoTime = 10; // time in seconds

function animation({ time, image }) {
    return image.map((x, y) => {
        return Color.ofRGB(
            ((x * time) / width) % 1,
            ((y * time) / height) % 1
        )
    });
}

video(
    "hello_world.mp4",
    animation,
    { width, height, FPS }
)
    .while(({ time }) => time < maxVideoTime);
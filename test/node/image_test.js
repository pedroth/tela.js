import { Color, Image, Stream, IO, Utils } from "../../dist/node/index.js";

const { measureTime } = Utils;
const { saveImageToFile, saveStreamToFile } = IO;

const width = 640;
const height = 480;
const step = (threshold) => (x) => x < threshold ? 0 : 1;
const mod = (x) => (n) => ((x % n) + n) % n;

saveImageToFile(
    "./test0.png",
    Image.ofSize(width, height)
        .map((x, y) => {
            let u = x / width;
            let v = y / height;
            return Color.ofRGB((2 * u) % 1, (2 * v) % 1, 0);
        })
)

saveImageToFile(
    "./test1.jpeg",
    Image.ofSize(width, height)
        .map((x, y) => {
            let u = x / (width - 1);
            let v = y / (height - 1);
            const grid = 10;
            u *= grid;
            v *= grid;
            const t = 1;
            const u_t = Math.cos(t) * u + Math.sin(t) * v;
            const v_t = -Math.sin(t) * u + Math.cos(t) * v;
            const color =
                (1 - step(0.95)(mod(u_t)(1))) * (1 - step(0.95)(mod(v_t)(1)));
            return Color.ofRGB(color, color, color);
        })
)


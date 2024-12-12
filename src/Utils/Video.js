import Stream from "./Stream.js";
import Image from "../Tela/Image.js"
import { saveImageStreamToVideo } from "../IO/IO.js"

export function video(file, lambda, { width = 640, height = 480, FPS = 25 }) {
    const dt = 1 / FPS;
    const stream = new Stream(
        {
            time: 0,
            image: lambda({ time: 0, image: Image.ofSize(width, height) })
        },
        ({ time, image }) => {
            return {
                time: time + dt,
                image: lambda({ time, image })
            }
        }
    );
    return saveImageStreamToVideo(file, stream, { fps: FPS });
}

export function videoAsync(file, lambda, { width = 640, height = 480, FPS = 25 }) {
    const dt = 1 / FPS;
    const lazyStream = async () => new Stream(
        {
            time: 0,
            image: await lambda({ time: 0, image: Image.ofSize(width, height) })
        },
        async ({ time, image }) => {
            return {
                time: time + dt,
                image: await lambda({ time, image, dt })
            }
        }
    );
    return saveImageStreamToVideo(file, lazyStream, { fps: FPS });
}
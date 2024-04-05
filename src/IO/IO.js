import { writeFileSync, unlinkSync, readFileSync } from "fs";
import { execSync, exec } from "child_process";
import Image from "../Image/Image.js";
import Color from "../Color/Color.js";

export function saveImageToFile(fileAddress, image) {
    const { fileName, extension } = getFileNameAndExtensionFromAddress(fileAddress);
    const ppmName = `${fileName}.ppm`;
    writeFileSync(ppmName, createPPMFromImage(image));
    if (extension !== "ppm") {
        execSync(`ffmpeg -i ${ppmName} ${fileName}.${extension}`);
        unlinkSync(ppmName)
    }
}

function getFileNameAndExtensionFromAddress(address) {
    const lastDotIndex = address.lastIndexOf(".");
    const fileName = address.slice(0, lastDotIndex);
    const extension = address.slice(lastDotIndex + 1);
    return { fileName, extension };
}

// parse p6 type of ppm image file
// with help of chatGPT
function parsePPM(data) {
    const NEW_LINE_CHAR = 10;
    let index = 0;
    let headerLines = 3;
    // read until end of header
    while (headerLines > 0) {
        if (data[index] === NEW_LINE_CHAR) headerLines--;
        index++;
    }
    const [, width, height, maxColor] = data
        .slice(0, index)
        .map(x => String.fromCharCode(x))
        .join("")
        .match(/\d+/g)
        .map(Number);

    const pixelStart = index;
    const pixels = [];
    for (let i = pixelStart; i < data.length; i += 3) {
        pixels.push({
            r: data[i],
            g: data[i + 1],
            b: data[i + 2],
        });
    }
    return { width, height, maxColor, pixels };
}

export function readImageFrom(src) {
    const { fileName } = getFileNameAndExtensionFromAddress(src);
    execSync(`ffmpeg -i ${src} ${fileName}.ppm`);
    const imageFile = readFileSync(`${fileName}.ppm`);
    const { width: w, height: h, pixels } = parsePPM(Array.from(imageFile));
    unlinkSync(`${fileName}.ppm`);
    const img = Image.ofSize(w, h);
    for (let k = 0; k < pixels.length; k++) {
        const { r, g, b } = pixels[k];
        const i = Math.floor(k / w);
        const j = k % w;
        const x = j;
        const y = h - 1 - i;
        img.setPxl(x, y, Color.ofRGBRaw(r, g, b));
    }
    return img;
}

export function createPPMFromImage(image) {
    const width = image.width;
    const height = image.height;
    const pixelData = image.toArray();
    const MAX_8_BIT = 255;
    let file = `P3\n${width} ${height}\n${MAX_8_BIT}\n`;
    for (let i = 0; i < pixelData.length; i += 4) {
        file += `${pixelData[i]} ${pixelData[i + 1]} ${pixelData[i + 2]}\n`;
    }
    return file;
}

export function saveImageStreamToVideo(fileAddress, streamWithImages, { imageGetter = s => s.image, fps }) {
    const { fileName, extension } = getFileNameAndExtensionFromAddress(fileAddress);
    let ite = 0;
    let time = 0;
    let timeCheck = performance.now();
    return {
        until: streamStatePredicate => {
            let s = streamWithImages;
            while (streamStatePredicate(s.head)) {
                const image = imageGetter(s.head);
                writeFileSync(`${fileName}_${ite++}.ppm`, createPPMFromImage(image));
                const newTimeCheck = performance.now();
                time += (newTimeCheck - timeCheck) * 1e-3;
                timeCheck = performance.now();
                s = s.tail;
            }
            if (!fps) fps = ite / time;
            execSync(`ffmpeg -framerate ${fps} -i ${fileName}_%d.ppm ${fileName}.${extension}`);
            for (let i = 0; i < ite; i++) {
                unlinkSync(`${fileName}_${i}.ppm`);
            }
        }
    }
}

export function saveParallelImageStreamToVideo(fileAddress, parallelStreamOfImages, options) {
    const { fps, isNode = true } = options;
    const { fileName, extension } = getFileNameAndExtensionFromAddress(fileAddress);
    const partition = parallelStreamOfImages.getPartition();
    const inputParamsPartitions = Object.values(partition);
    const n = inputParamsPartitions.reduce((acc, partition) => { acc += partition.length; return acc; }, 0);
    const promises = inputParamsPartitions.map((inputParams, i) => {
        const spawnFile = "IO_parallel" + i + ".js";
        writeFileSync(spawnFile, `
            import {DOM, Color, Animation, Scene, Camera, Vec2, Vec3, Vec, Box, Point, Mesh, Image,NaiveScene} from "./dist/node/index.js"
            import fs from "fs";

            
            ${createPPMFromImage.toString().replaceAll("function createPPMFromImage(image)", "function __createPPMFromImage__(image)")}
            
            ${parallelStreamOfImages.dependencies.map(dependency => dependency.toString()).join("\n")}
            
            const __initial_state__ = (${parallelStreamOfImages.lazyInitialState})();

            const __gen__ = ${parallelStreamOfImages.stateGenerator.toString()};
            
            const partition_inputs = ${JSON.stringify(inputParams)};
            partition_inputs.forEach(input => {
                const {__ite__} = input;
                const combinedInput = !__initial_state__ ? input : {...input, ...__initial_state__}; 
                const __img__ = __gen__(combinedInput);
                fs.writeFileSync(\`${fileName}_\${__ite__}.ppm\`, __createPPMFromImage__(__img__));
            });
        `);
        return new Promise(resolve => {
            exec(`${isNode ? "node" : "bun"} ${spawnFile}`, () => resolve());
        });
    })
    return Promise.all(promises)
        .then(() => {
            execSync(`ffmpeg -framerate ${fps} -i ${fileName}_%d.ppm ${fileName}.${extension}`);
            for (let i = 0; i < n; i++) {
                unlinkSync(`${fileName}_${i}.ppm`);
            }
            for (let i = 0; i < inputParamsPartitions.length; i++) {
                const spawnFile = "IO_parallel" + i + ".js";
                unlinkSync(spawnFile);
            }
        })
}
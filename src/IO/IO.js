import { writeFileSync, unlinkSync, readFileSync } from "fs";
import { execSync, exec } from "child_process";
import { CHANNELS, MAX_8BIT } from "../Utils/Constants.js";
import { PNG } from "pngjs";

export function saveImageToFile(fileAddress, image) {
    const { fileName, extension } = getFileNameAndExtensionFromAddress(fileAddress);
    const ppmName = `${fileName}.ppm`;
    writeFileSync(ppmName, createPPMFromImage(image));
    if (extension !== "ppm") {
        execSync(`ffmpeg -i ${ppmName} -y ${fileName}.${extension}`);
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
    const [, width, height, maxColor] = Array.from(data.slice(0, index))
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
    const { fileName, extension } = getFileNameAndExtensionFromAddress(src);
    if ("ppm" === extension.toLowerCase()) return parsePPM(readFileSync(src));
    if ("png" === extension.toLowerCase()) return parsePNG(readFileSync(src));
    const finalName = `${fileName}_${Math.floor(Math.random() * 1e6)}`;
    execSync(`ffmpeg -i ${src} ${finalName}.ppm`);
    const imageFile = readFileSync(`${finalName}.ppm`);
    const { width, height, pixels } = parsePPM(imageFile);
    unlinkSync(`${finalName}.ppm`);
    return { width, height, pixels };
}

export function createPPMFromImage(telaImage) {
    const width = telaImage.width;
    const height = telaImage.height;
    const pixelData = telaImage.image;
    const rgbClamp = x => Math.floor(Math.min(MAX_8BIT, Math.max(0, MAX_8BIT * x)));
    let file = `P3\n${width} ${height}\n${MAX_8BIT}\n`;
    for (let i = 0; i < pixelData.length; i += 4) {
        file += `${rgbClamp(pixelData[i])} ${rgbClamp(pixelData[i + 1])} ${rgbClamp(pixelData[i + 2])}\n`;
    }
    return file;
}

export function saveImageStreamToVideo(fileAddress, streamWithImages, { imageGetter = s => s.image, fps }) {
    const { fileName, extension } = getFileNameAndExtensionFromAddress(fileAddress);
    let ite = 0;
    let time = 0;
    let timeCheck = performance.now();
    return {
        while: async streamStatePredicate => {
            console.log("Generating video...");
            let s = typeof streamWithImages === 'function' ? await streamWithImages() : streamWithImages;
            while (streamStatePredicate(s.head)) {
                const image = imageGetter(s.head);
                writeFileSync(`${fileName}_${ite++}.ppm`, createPPMFromImage(image));
                const newTimeCheck = performance.now();
                time += (newTimeCheck - timeCheck) * 1e-3;
                timeCheck = performance.now();
                s = await s.tail;
            }
            if (!fps) fps = ite / time;
            execSync(`ffmpeg -framerate ${fps} -i ${fileName}_%d.ppm -y ${fileName}.${extension}`);
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
            import fs from "node:fs";
            import * as _module from "./src/index.node.js"
            const {
                Box,
                Vec,
                Vec2,
                Vec3,
                Ray,
                Mesh,
                Color,
                Image,
                BScene,
                Camera,
                KScene,
                Sphere,
                MAX_8BIT,
                NaiveScene,
            } = _module;
            
            ${parallelStreamOfImages.dependencies.map(dependency => dependency.toString()).join("\n")}

            ${createPPMFromImage.toString().replaceAll("function createPPMFromImage(telaImage)", "function __createPPMFromImage__(telaImage)")}
        
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
            execSync(`ffmpeg -framerate ${fps} -i ${fileName}_%d.ppm -y ${fileName}.${extension}`);
            for (let i = 0; i < n; i++) {
                unlinkSync(`${fileName}_${i}.ppm`);
            }
            for (let i = 0; i < inputParamsPartitions.length; i++) {
                const spawnFile = "IO_parallel" + i + ".js";
                unlinkSync(spawnFile);
            }
        })
}

export function parsePNG(fileBuffer) {
    const png = PNG.sync.read(fileBuffer);
    const width = png.width;
    const height = png.height;
    const data = png.data;
    const pixels = [];
    for (let i = 0; i < data.length; i += CHANNELS) {
        pixels.push({
            r: data[i],
            g: data[i + 1],
            b: data[i + 2],
            a: data[i + 3],
        });
    }
    return { width, height, pixels };
}

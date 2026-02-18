import { writeFileSync, unlinkSync, readFileSync } from "fs";
import { execSync, exec } from "child_process";
import { CHANNELS, MAX_8BIT } from "../Utils/Constants.js";

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
    const numPixels = width * height;
    const pixels = new Uint8Array(numPixels * CHANNELS);
    for (let i = 0; i < numPixels; i++) {
        const srcIdx = pixelStart + i * 3;
        const dstIdx = i * CHANNELS;
        pixels[dstIdx] = data[srcIdx];
        pixels[dstIdx + 1] = data[srcIdx + 1];
        pixels[dstIdx + 2] = data[srcIdx + 2];
        pixels[dstIdx + 3] = MAX_8BIT;
    }
    return { width, height, maxColor, pixels };
}

export function readImageFrom(src) {
    const { fileName, extension } = getFileNameAndExtensionFromAddress(src);
    if ("ppm" === extension.toLowerCase()) return parsePPM(readFileSync(src));
    const finalName = `${fileName}_${Math.floor(Math.random() * 1e6)}`;
    execSync(`ffmpeg -i ${src} -pix_fmt rgba -update 1 ${finalName}.pam`);
    const imageFile = readFileSync(`${finalName}.pam`);
    const { width, height, pixels } = parsePAM(imageFile);
    unlinkSync(`${finalName}.pam`);
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
            execSync(`ffmpeg -framerate ${fps} -i ${fileName}_%d.ppm -y -c:v libx264 -crf 20 -preset medium -profile:v baseline -level 3.0 -pix_fmt yuv420p -movflags +faststart ${fileName}.${extension}`);
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
                Ray,
                Vec,
                Mesh,
                Line,
                Path,
                Vec2,
                Vec3,
                Anima,
                Color,
                Image,
                BScene,
                Canvas,
                Camera,
                KScene,
                PQueue,
                Sphere,
                Stream,
                Camera2D,
                parseSVG,
                Triangle,
                NaiveScene,
                VoxelScene,
                RandomScene,
                clamp,
                MAX_8BIT,
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

// parse P7 PAM (Portable Arbitrary Map) image file
function parsePAM(data) {
    // find ENDHDR\n efficiently using Buffer
    const endhdrStr = 'ENDHDR\n';
    const headerEnd = data.indexOf(endhdrStr);
    const headerText = data.slice(0, headerEnd).toString('ascii');
    const pixelStart = headerEnd + endhdrStr.length;
    let width, height, depth, maxval;
    for (const l of headerText.split('\n')) {
        const trimmed = l.trim();
        if (trimmed.startsWith('WIDTH')) width = parseInt(trimmed.split(/\s+/)[1]);
        else if (trimmed.startsWith('HEIGHT')) height = parseInt(trimmed.split(/\s+/)[1]);
        else if (trimmed.startsWith('DEPTH')) depth = parseInt(trimmed.split(/\s+/)[1]);
        else if (trimmed.startsWith('MAXVAL')) maxval = parseInt(trimmed.split(/\s+/)[1]);
    }
    const numPixels = width * height;
    const pixels = new Uint8Array(numPixels * CHANNELS);
    for (let i = 0; i < numPixels; i++) {
        const srcIdx = pixelStart + i * depth;
        const dstIdx = i * CHANNELS;
        pixels[dstIdx] = data[srcIdx];
        pixels[dstIdx + 1] = data[srcIdx + 1];
        pixels[dstIdx + 2] = data[srcIdx + 2];
        pixels[dstIdx + 3] = depth >= 4 ? data[srcIdx + 3] : MAX_8BIT;
    }
    return { width, height, maxColor: maxval, pixels };
}

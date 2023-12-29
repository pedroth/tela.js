import { writeFileSync, unlinkSync } from "fs";
import { execSync, spawn } from "child_process";


export function saveImageToFile(fileAddress, image) {
    const { fileName, extension } = getFileNameAndExtensionFromAddress(fileAddress);
    const ppmName = `${fileName}.ppm`;
    writeFileSync(ppmName, createPPMFromFromImage(image));
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

export function createPPMFromFromImage(image) {
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

export function saveStreamToFile(fileAddress, streamWithImages, { imageGetter = s => s.image, fps }) {
    const { fileName, extension } = getFileNameAndExtensionFromAddress(fileAddress);
    let ite = 0;
    let time = 0;
    let timeCheck = performance.now();
    return {
        until: streamStatePredicate => {
            let s = streamWithImages;
            while (streamStatePredicate(s.head)) {
                const image = imageGetter(s.head);
                writeFileSync(`${fileName}_${ite++}.ppm`, createPPMFromFromImage(image));
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

export function saveParallelToFile(fileAddress, arrayWithImageProducers, { fps }) {
    const { fileName, extension } = getFileNameAndExtensionFromAddress(fileAddress);
    const times = [];
    const promises = arrayWithImageProducers.map((imageProducers, i) => {
        const spawnFile = "IO_parallel" + i + ".js";
        writeFileSync(spawnFile, `
            import { writeFileSync, unlinkSync } from "fs";
            ${createPPMFromFromImage.toString()}
            ${imageProducers}
            images.forEach()

        `);
        return new Promise(resolve => {
            const process = spawn(`bun ${spawnFile}`)
            process.on("exit", () => {
                resolve();
            })
        });
    })
    Promise.all(promises)
        .then(groupOfImages => {
            let ite = 0;
            groupOfImages.forEach(images =>
                images.forEach(image => {
                    console.log("Image generated", ite)
                    writeFileSync(`${fileName}_${ite++}.ppm`, createPPMFromFromImage(image));
                })
            )
            if (!fps) fps = Math.floor(1 / (times.reduce((e, t) => e + t, 0) / n));
            execSync(`ffmpeg -framerate ${fps} -i ${fileName}_%d.ppm ${fileName}.${extension}`);
            for (let i = 0; i < n; i++) {
                unlinkSync(`${fileName}_${i}.ppm`);
            }
        })
}
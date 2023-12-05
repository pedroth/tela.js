import { writeFileSync, unlinkSync } from "fs";
import { execSync } from "child_process";

export function saveImageToFile(fileAddress, image) {
    const { fileName, extension } = getFileNameAndExtensionFromAddress(fileAddress);
    const ppmName = `${fileName}.ppm`;
    writeFileSync(ppmName, createPPMFromFromImage(image));
    execSync(`ffmpeg -i ${ppmName} ${fileName}.${extension}`);
    unlinkSync(ppmName)
}

function getFileNameAndExtensionFromAddress(address) {
    const lastDotIndex = address.lastIndexOf(".");
    const fileName = address.slice(0, lastDotIndex);
    const extension = address.slice(lastDotIndex + 1);
    return { fileName, extension };
}

function createPPMFromFromImage(image) {
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
            for(let i = 0; i < ite; i++) {
                unlinkSync(`${fileName}_${i}.ppm`);
            } 
        }
    }
}


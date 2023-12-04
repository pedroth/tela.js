import { writeFileSync, unlinkSync } from "fs";
import { execSync } from "child_process";

export function saveImageToFile(fileAddress, image) {
    const w = image.width;
    const h = image.height;
    const imageData = image.toArray();
    writeFileFromImageData(fileAddress, imageData, w, h);
}

export function saveVideoToFile(fileAddress, streamWithImages) {
    const w = image.width;
    const h = image.height;
    const imageData = image.toArray();
    writeFileFromImageData(fileAddress, imageData, w, h);
}

function writeFileFromImageData(address, imageData, w, h) {
    const lastDotIndex = address.lastIndexOf(".");
    const imageName = address.slice(0, lastDotIndex);
    const extension = address.slice(lastDotIndex + 1);
    const ppmName = `${imageName}.ppm`;
    const ppmData = createPPMFromImageData(imageData, w, h);
    writeFileSync(ppmName, ppmData);
    createImageFromPPM(ppmName, imageName, extension);
    unlinkSync(ppmName)
}

function createPPMFromImageData(pixelData, width, height) {
    const MAX_8_BIT = 255;
    let file = `P3\n${width} ${height}\n${MAX_8_BIT}\n`;
    for (let i = 0; i < pixelData.length; i += 4) {
        file += `${pixelData[i]} ${pixelData[i + 1]} ${pixelData[i + 2]}\n`;
    }
    return file;
}

async function createImageFromPPM(ppmName, imageName, extension) {
    const command = `ffmpeg -i ${ppmName} ${imageName}.${extension}`;
    execSync(command);
}
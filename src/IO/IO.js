import { writeFileSync, unlinkSync } from "fs";
import { execSync } from "child_process";

export function saveImageToFile(fileAddress, image) {
    const w = image.width;
    const h = image.height;
    const imageData = image.toArray();
    createPNGFromImageData(fileAddress, imageData, w, h);
}

export function saveVideoToFile(fileAddress, streamWithImages) {
    const w = image.width;
    const h = image.height;
    const imageData = image.toArray();
    createPNGFromImageData(fileAddress, imageData, w, h);
}

function createPNGFromImageData(address, imageData, w, h) {
    const imageName = address.split(".png")[0];
    const ppmName = `${imageName}.ppm`;
    const ppmData = createPPMFileFromImageData(imageData, w, h);
    writeFileSync(ppmName, ppmData);
    createPNGFromPPM(ppmName, imageName);
    unlinkSync(ppmName)
    console.log('PNG file created successfully');
}

function createPPMFileFromImageData(pixelData, width, height) {
    const MAX_8_BIT = 255;
    let file = `P3\n${width} ${height}\n${MAX_8_BIT}\n`;
    for (let i = 0; i < pixelData.length; i += 4) {
        file += `${pixelData[i]} ${pixelData[i + 1]} ${pixelData[i + 2]}\n`;
    }
    return file;
}

async function createPNGFromPPM(ppmName, imageName) {
    const command = `ffmpeg -i ${ppmName} ${imageName}.png`;
    execSync(command);
}
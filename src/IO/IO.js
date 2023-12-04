import { writeFileSync, unlinkSync } from "fs";
import { execSync } from "child_process";

export function saveImageToFile(fileAddress, image) {
    const {fileName, extension} = getFileNameAndExtensionFromAddress(fileAddress);
    const ppmName = `${fileName}.ppm`;
    writeFileSync(ppmName, createPPMFromFromImage(image));
    execSync(`ffmpeg -i ${ppmName} ${fileName}.${extension}`);
    unlinkSync(ppmName)
}

function getFileNameAndExtensionFromAddress(address) { 
    const lastDotIndex = address.lastIndexOf(".");
    const fileName = address.slice(0, lastDotIndex);
    const extension = address.slice(lastDotIndex + 1);
    return {fileName, extension};
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

// export function saveStreamToFile(fileAddress, streamWithImages, imageGetter= s => s.image) {
//     const {fileName, extension} = getFileNameAndExtensionFromAddress(fileAddress);
//     let ite = 0;
//     return {
//         until: streamStatePredicate => {
//             while(!streamStatePredicate(streamStatePredicate.head)) {
//                 const image = imageGetter(streamWithImages);
//                 saveImageToFile(`${videoName}_${ite++}.png`);
//             }
//             execSync(`ffmpeg -i ${videoName}`);
//         }
//     }
// }


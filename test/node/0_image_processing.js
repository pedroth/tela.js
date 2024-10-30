import { Color, Window, Image } from "../../src/index.node.js";

const image = Image.ofUrl("./assets/sdf_font.png")
const window = new Window(image.width, image.height).onResizeWindow(() => window.paint());
const processImage = (x, y) => {
    const alpha = image.getPxl(x, y).alpha;
    return Color.ofRGB(alpha, alpha, alpha);
}
window.map(processImage);
const processedImage = image.map(processImage);
processedImage.toFile("sdf_font.png");
processedImage.toFile("sdf_font.ppm");
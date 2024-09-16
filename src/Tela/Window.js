import { CHANNELS, MAX_8BIT } from "../Utils/Constants.js";
import { clamp } from "../Utils/Math.js";
import sdl from "@kmamal/sdl";
import Tela from "./Tela.js";
import { Buffer } from "node:buffer";


const clamp01 = clamp();

export default class Window extends Tela {

    constructor(width, height, title = "") {
        super(width, height);
        this.title = title;
        this.window = sdl.video.createWindow({ title, width, height, resizable: true });
    }

    setTitle(title) {
        this.title = title;
        this.window.setTitle(title);
        return this;
    }

    paint() {
        const buffer = Buffer.allocUnsafe(this.image.length);
        buffer.set(this.image.map(x => clamp01(x) * MAX_8BIT));
        this.window.render(this.width, this.height, this.width * CHANNELS, 'rgba32', buffer);
        return this;
    }

    close() {
        this.window.hide();
        this.window.destroy();
        return this;
    }

    onMouseDown(lambda) {
        this.window.on("mouseButtonDown", handleMouse(this, lambda));
        return this;
    }

    onMouseUp(lambda) {
        this.window.on("mouseButtonUp", handleMouse(this, lambda));
        return this;
    }

    onMouseMove(lambda) {
        this.window.on("mouseMove", handleMouse(this, lambda));
        return this;
    }

    onMouseWheel(lambda) {
        this.window.on("mouseWheel", lambda);
        return this;
    }

    onKeyDown(lambda) {
        this.window.on("keyDown", lambda);
        return this;
    }

    onKeyUp(lambda) {
        this.window.on("keyDown", lambda);
        return this;
    }

    onResizeWindow(lambda) {
        this.window.on("resize", (e) => lambda(e));
        return this;
    }

    setWindowSize(w, h) {
        this.window.setSize(w, h);
        return this;
    }

    maximize() {
        this.window.maximize();
        return this;
    }

    //========================================================================================
    /*                                                                                      *
     *                                    Static Methods                                    *
     *                                                                                      */
    //========================================================================================

    static ofUrl(url) {
        // TODO
    }

    static ofSize(width, height) {
        return new Window(width, height);
    }

    static ofImage(image) {
        const w = image.width;
        const h = image.height;
        return Window.ofSize(w, h)
            .map((x, y) => {
                return image.get(x, y);
            })
    }

    static LEFT_CLICK = 1;
    static MIDDLE_CLICK = 2;
    static RIGHT_CLICK = 3;
}

//========================================================================================
/*                                                                                      *
 *                                   Private functions                                  *
 *                                                                                      */
//========================================================================================

function handleMouse(canvas, lambda) {
    return ({ x, y }) => {
        return lambda(x, canvas.height - 1 - y);
    }
}
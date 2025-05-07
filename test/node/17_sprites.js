import {
    Vec2,
    Window,
    loop,
    Box,
    Camera2D,
    NaiveScene,
    Triangle,
    Image,
    Color,
} from "../../src/index.node.js";

import V2, { resetArena } from "../../src/Vector/VectorArena.js";

const width = 640;
const height = 640;
const window = new Window(width, height).onResizeWindow(() => window.paint());

const scene = new NaiveScene();
const camera = new Camera2D(new Box(Vec2(0), Vec2(10, 10)));


//========================================================================================
/*                                                                                      *
 *                                    MOUSE HANDLING                                    *
 *                                                                                      */
//========================================================================================

let mousedown = false;
let rightMouseDown = false;
let mouse = Vec2();
window.onMouseDown((x, y, e) => {
    mousedown = e?.button === 1;
    rightMouseDown = e?.button === 3;
    mouse = camera.toWorldCoord(Vec2(x, y), window);
});

window.onMouseUp(() => {
    mousedown = false;
    rightMouseDown = false;
    mouse = Vec2();
});

window.onMouseMove((x, y) => {
    const newMouse = camera.toWorldCoord(Vec2(x, y), window);
    if (!mousedown || newMouse.equals(mouse)) {
        mouse = newMouse;
        return;
    }
    mouse = newMouse;
});


window.onKeyDown((e) => {
    if ("w" === e.key) {
    }
    if ("s" === e.key) {
    }
    if ("a" === e.key) {
        megaman.pos = megaman.pos.add(Vec2(-0.1, 0));
    }
    if ("d" === e.key) {
        megaman.pos = megaman.pos.add(Vec2(0.1, 0));
    }
})

//========================================================================================
/*                                                                                      *
 *                                         MAIN                                         *
 *                                                                                      */
//========================================================================================
const megamanSprite = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => Image.ofUrl(`./assets/sprites/${i}.png`));

const megaman = {
    sprite: megamanSprite,
    pos: Vec2(1, 1),
    speed: Vec2(0, 0),
    box: new Box(Vec2(0), Vec2(1, 1)),
}

const background = Image.ofUrl("./assets/megaman_background.png");

function updateScene(dt, time) {
    scene.clear();
    const { pos, box, sprite } = megaman;
    const fps = 1.5;
    const cursor = Vec2(0, 0);
    let frameIndex = fps * time * sprite.length;
    frameIndex = Math.floor(frameIndex) % sprite.length;
    // console.log(`${fps * time} ${frameIndex} ${sprite.length}`);
    scene.add(
        Triangle
            .builder()
            .positions(
                pos,
                pos.add(Vec2(box.max.x)),
                pos.add(box.max)
            )
            .texCoords(
                cursor.add(Vec2(0, 0)),
                cursor.add(Vec2(1, 0)),
                cursor.add(Vec2(1, 1)),
            )
            .texture(sprite[frameIndex])
            .build(),
    );
    scene.add(
        Triangle
            .builder()
            .positions(
                pos,
                pos.add(box.max),
                pos.add(Vec2(0, box.max.y)),
            )
            .texCoords(
                cursor.add(Vec2(0, 0)),
                cursor.add(Vec2(1, 1)),
                cursor.add(Vec2(0, 1)),
            )
            .texture(sprite[frameIndex])
            .build(),
    );
}

loop(async ({ dt, time }) => {
    window.setTitle(`FPS: ${(1 / dt).toFixed(2)}`);
    updateScene(dt, time);
    window.map((x, y) => {
        // const p = Vec2(x, y)
        //     .div(Vec2(window.width, window.height))
        //     .mul(Vec2(background.width, background.height))
        //     .map(Math.floor);
        // return background.getPxl(p.x, p.y);
        return background.getPxl(Math.floor(x / window.width * background.width), Math.floor(y / window.height * background.height));
    })
    // window.fill(Color.BLACK);
    camera.raster(scene).to(window).paint();
}).play();

setInterval(() => resetArena(), 2000);

import { Vec2, Window, loop, Box, Color, Vec, imageFromString } from "../../src/index.node.js";

// TODO: add Shift key symbols.
const width = 1024;
const height = 720;
const charSizeX = 25;
const charSizeY = 25;
const margin = 3;
const rowSize = Math.floor(width / charSizeX);
let chars = []
let charsCursor = 0;
let windowCursor = 0;
let removeExplosionAnimationPositions = [];

const mod = (x, n) => ((x % n) + n) % n;
const window = new Window(width, height).onResizeWindow(() => window.paint()).maximize();
window.onKeyDown((e) => {
    const { key, shift } = e;
    const defaultAction = k => {
        const nextChar = shift ? k.toUpperCase() : k;
        if (charsCursor < chars.length) {
            chars[charsCursor] = nextChar;
        } else {
            chars.push(nextChar);
        }
        charsCursor++;
    };
    const key2action = {
        "space": () => {
            const nextChar = " ";
            if (charsCursor < chars.length) {
                chars[charsCursor] = nextChar;
            } else {
                chars.push(nextChar);
            }
            charsCursor++;
        },
        "return": () => {
            chars.push("\n")
            const delta = rowSize - mod(charsCursor, rowSize);
            charsCursor += delta;
            [...Array(delta)].forEach(() => chars.push(" "));
        },
        "shift": () => { },
        "ctrl": () => { },
        "backspace": () => {
            removeExplosionAnimationPositions.push(particlesIn(charsCursor));
            const cursorInRow = mod(charsCursor, rowSize);
            if (cursorInRow <= margin) {
                const cursorInCol = Math.floor(charsCursor / rowSize);
                if (cursorInCol > 0) {
                    [...Array(2 * margin + 1)].forEach(() => chars.pop());
                    charsCursor -= 2 * margin + 1;
                    return;
                }
            }
            if (charsCursor > margin) {
                chars.pop();
                charsCursor--;
            }
        },
        "escape": () => window.close()
    }
    if (Object.keys(key2action).includes(key)) {
        key2action[key](key);
    } else {
        defaultAction(key);
    }
});
function str2window(index) {
    const i = index % (rowSize);
    const j = Math.floor(index / (rowSize));
    return Vec2(i * charSizeX, height - charSizeY - j * charSizeY);
}

function particlesIn(index) {
    const numParticles = 100;
    const variance = 100;
    const pStart = str2window(index);
    const pEnd = str2window(index + 1);
    const box = new Box(pStart, pEnd.add(Vec2(0, charSizeY)));
    return [...Array(numParticles)].map(() => {
        return { p: box.sample(), v: Vec.RANDOM(2).map(x => 2 * x - 1).scale(variance), color: Math.random() < 0.5 ? Color.RED : Color.YELLOW };
    })
}

function updateExplosionAnimations(dt) {
    const g = Vec2(0, -98);
    const radius = 2;
    removeExplosionAnimationPositions.forEach(points => {
        for (let i = 0; i < points.length; i++) {
            window.drawCircle(points[i].p, radius, () => Color.BLACK); // clear circle, it is done in this way because we are not cleaning the whole window
            const p = points[i].p;
            const v = points[i].v;
            points[i].v = v.add(g.scale(dt));
            points[i].p = p.add(v.scale(dt));
            window.drawCircle(points[i].p, radius, () => points[i].color); // draw circle
        }
    });
    removeExplosionAnimationPositions = removeExplosionAnimationPositions
        .filter(points => !points.every(point => point.p.y < 0));
}

//main
loop(async ({ dt, time }) => {
    window.setTitle(`FPS: ${(1 / dt).toFixed(2)}`);
    if (windowCursor < charsCursor) {
        for (let i = windowCursor; i < charsCursor; i++) {
            const charBox = new Box(str2window(windowCursor), str2window(windowCursor + 1).add(Vec2(0, charSizeY)))
            const charSDF = imageFromString(chars[i]);
            window.mapBox((x, y) => {
                const px = x / charBox.diagonal.x;
                const py = y / charBox.diagonal.y;
                const distance = charSDF.getPxl(px, py);
                if (distance < 0.45 + Math.random() * 0.02) return Color.WHITE;
                const t = (distance - 0.45) / (0.6 - 0.45);
                if (distance < 0.6) return Color.BLACK.scale(t).add(Color.WHITE.scale(1 - t));
                return Color.BLACK;
            }, charBox)
        }
    } else {
        for (let i = windowCursor; i >= charsCursor; i--) {
            const charBox = new Box(str2window(i), str2window(i + 1).add(Vec2(0, charSizeY)));
            window.mapBox(() => { return Color.BLACK; }, charBox);
        }
    }

    updateExplosionAnimations(dt);

    const cursorInRow = mod(charsCursor, rowSize);
    if (cursorInRow < margin) {
        const delta = margin - cursorInRow;
        charsCursor += delta;
        [...Array(delta)].forEach(() => chars.push(" "));
    }
    if (cursorInRow === rowSize - margin) {
        charsCursor += margin;
        [...Array(margin)].forEach(() => chars.push(" "));
    }
    windowCursor = charsCursor;
    blinkCursor(time);
    window.paint();
}).play();

function blinkCursor(time) {
    const cursorSDF = imageFromString("|");
    const charBox = new Box(str2window(windowCursor), str2window(windowCursor + 1).add(Vec2(0, charSizeY)));
    const cursorBlinkThreshold = (Math.sin(5 * time) + 1) * 0.25;
    window.mapBox((x, y) => {
        const px = x / charBox.diagonal.x;
        const py = y / charBox.diagonal.y;
        const distance = cursorSDF.getPxl(px, py);
        if (distance < cursorBlinkThreshold) return Color.WHITE;
        return Color.BLACK;
    }, charBox);
}

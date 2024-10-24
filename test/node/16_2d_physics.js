import { Vec2, Window, loop, Box, Camera2D, NaiveScene, Line, Color, mod } from "../../src/index.node.js";

const width = 640;
const height = 640;
const window = new Window(width, height).onResizeWindow(() => window.paint());

const paths = [];
const speeds = [];
const pathEdgeLengths = [];
const pathAreas = [];
const scene = new NaiveScene();
const draftScene = new NaiveScene();
const camera = new Camera2D(new Box(Vec2(0), Vec2(1, 1)));

function cleanPath(path) {
    const epsilon = 1e-3;
    const cleanPath = [];
    for (let i = 0; i < path.length - 1; i++) {
        if (!cleanPath.some(x => x.sub(path[i]).length() < epsilon)) {
            cleanPath.push(path[i]);
        }
    }
    cleanPath.push(path.at(-1));
    return cleanPath;
}

//========================================================================================
/*                                                                                      *
 *                                    MOUSE HANDLING                                    *
 *                                                                                      */
//========================================================================================

let mousedown = false;
let rightMouseDown = false;
let mouse = Vec2();
let path = [];
window.onMouseDown((x, y, e) => {
    mousedown = e?.button === 1;
    rightMouseDown = e?.button === 3;
    mouse = camera.toWorldCoord(Vec2(x, y), window);
});

window.onMouseUp(() => {
    mousedown = false;
    rightMouseDown = false;
    mouse = Vec2();
    if (path.length > 0) {
        paths.push([]);
        paths.at(-1).push(...cleanPath(path));
        pathEdgeLengths.push([]);
        pathEdgeLengths.at(-1).push(...distancesFromPath(paths.at(-1)))
        pathAreas.push([]);
        pathAreas.at(-1).push(areaFromPath(paths.at(-1)));
        speeds.push([]);
        speeds.at(-1).push(...[...Array(path.length)].fill(Vec2()))
        add2Scene(paths.at(-1));
        path = [];
        draftScene.clear();
    }
});

window.onMouseMove((x, y) => {
    const newMouse = camera.toWorldCoord(Vec2(x, y), window);
    if (!mousedown || newMouse.equals(mouse)) {
        return;
    }
    path.push(mouse.clone(), newMouse.clone())
    draftScene.add(Line.builder().name(`${Math.random()}`).positions(mouse, newMouse).colors(Color.CYAN, Color.CYAN).build());
    mouse = newMouse;
});

//========================================================================================
/*                                                                                      *
 *                                         MAIN                                         *
 *                                                                                      */
//========================================================================================

function add2Scene(path) {
    const id = Math.floor(Math.random() * 1e5);
    for (let i = 0; i < path.length; i++) {
        const j = (i + 1) % path.length
        const line = Line.builder().name(`Line_${id}_${i}`).positions(path[i], path[j]).colors(Color.WHITE, Color.WHITE).build();
        scene.add(line)
    }
}

function areaFromPath(path) {
    let area = 0;
    for (let i = 0; i < path.length; i++) {
        const wedge = path[i].cross(path[mod(i + 1, path.length)]);
        area += wedge;
    }
    return 0.5 * Math.abs(area);
}

function distancesFromPath(path) {
    const n = path.length
    const distances = [];
    for (let i = 0; i < n; i++) {
        distances[i] = path[mod(i + 1, n)].sub(path[i]).length();
    }
    return distances;
}

function preserveArea(A0, path) {
    const n = path.length;
    const A = areaFromPath(path);
    const k = Math.sqrt(A0 / A);
    const average = path.reduce((e, x) => e.add(x), Vec2()).scale(1 / n);
    for (let i = 0; i < n; i++) {
        path[i] = average.add(path[i].sub(average).scale(k));
    }
}

function enforceConstraints(path, prevDistances, prevArea, dt) {
    const n = path.length;
    const delta = Math.max(1e-3, dt);
    // distance constraint
    let constraintsCost = 0;
    for (let i = 0; i < n; i++) {
        constraintsCost += path[mod(i + 1, n)].sub(path[i]).length() - prevDistances[i];
    }
    for (let i = 0; i < n; i++) {
        const prev = path[mod(i - 1, n)];
        const next = path[mod(i + 1, n)];
        const current = path[i];
        const grad = current.sub(prev).normalize().add(current.sub(next).normalize());
        path[i] = current.add(grad.scale(-delta * constraintsCost));
    }

    // volume constraint
    constraintsCost = areaFromPath(path) - prevArea;
    for (let i = 0; i < n; i++) {
        const prev = path[mod(i - 1, n)];
        const next = path[mod(i + 1, n)];
        let grad = prev.sub(next);
        grad = Vec2(-grad.y, grad.x);
        path[i] = path[i].add(grad.scale(-0.5 * delta * constraintsCost));
    }
    // above floor constraint
    for (let i = 0; i < n; i++) {
        path[i] = path[i].y < 0 ? Vec2(path[i].x, 1e-3) : path[i];
    }
}

function updateSpeed(speed, prevPath, path, dt) {
    const delta = Math.max(1e-3, dt);
    const n = path.length;
    for (let i = 0; i < n; i++) {
        speed[i] = path[i].sub(prevPath[i]).scale(1 / delta);
    }
}

function updateScene(dt) {
    scene.clear();
    const gravity = Vec2(0, -0.0);
    const subSteps = 10;
    const delta = dt / subSteps;
    const n = paths.length;
    for (let i = 0; i < n; i++) {
        const path = paths[i];
        const speed = speeds[i];
        const L = path.length;
        const edgeDistances = pathEdgeLengths[i];
        const pathArea = pathAreas[i];
        // const areaBefore = areaFromPath(path);
        for (let k = 0; k < subSteps; k++) {
            const prevPath = [...path];
            for (let j = 0; j < L; j++) {
                const laplacian = path[mod(j + 1, L)].add(path[mod(j - 1, L)]).sub(path[j].scale(2)).scale(20);
                const mouseCoord = path[j].sub(mouse);
                const mouseForce = mouseCoord.normalize().scale((rightMouseDown ? 1e-3 : 0) / mouseCoord.squareLength());
                const friction = speed[j].scale(-1);
                const acceleration = gravity.add(mouseForce).add(friction);
                speed[j] = speed[j].add(acceleration.scale(delta));
                path[j] = path[j].add(speed[j].scale(delta));
            }
            enforceConstraints(path, edgeDistances, pathArea, delta);
            updateSpeed(speed, prevPath, path, delta);
            // preserveArea(areaBefore, path);
        }
        console.log("L1-L0", Math.abs((distancesFromPath(path).reduce((e, x) => e + x, 0) - edgeDistances.reduce((e, x) => e + x, 0))))
        console.log("A1-A0", Math.abs(areaFromPath(path) - pathArea))
        add2Scene(path);
    }
}

// main
loop(async ({ dt, time }) => {
    window.setTitle(`FPS: ${(1 / dt).toFixed(2)}`);
    updateScene(dt);
    window.fill(Color.BLACK);
    camera.raster(draftScene).to(window);
    camera.raster(scene).to(window).paint();
}).play();
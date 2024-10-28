import { Vec2, Window, loop, Box, Camera2D, NaiveScene, Line, Color, mod, clamp, orthoBasisFrom, Vec } from "../../src/index.node.js";

const width = 640;
const height = 640;
const window = new Window(width, height).onResizeWindow(() => window.paint());

let paths = [];
let speeds = [];
let pathAreas = [];
let pathEdgeLengths = [];
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
    if (!cleanPath.some(x => x.sub(path.at(-1)).length() < epsilon)) {
        cleanPath.push(path.at(-1));
    }
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
        pathEdgeLengths.at(-1).push(...distancesFromPath(paths.at(-1)));
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


window.onKeyDown((e) => {
    if ("r" === e.key) {
        paths = [];
        speeds = [];
        pathAreas = [];
        pathEdgeLengths = [];
    }
})

//========================================================================================
/*                                                                                      *
 *                                         MAIN                                         *
 *                                                                                      */
//========================================================================================

function add2Scene(path, color = Color.WHITE) {
    const id = Math.floor(Math.random() * 1e5);
    for (let i = 0; i < path.length; i++) {
        const j = (i + 1) % path.length
        const line = Line.builder().name(`Line_${id}_${i}`).positions(path[i], path[j]).colors(color, color).build();
        scene.add(line)
    }
}

function addSpeed(speed, path, color = Color.WHITE) {
    const id = Math.floor(Math.random() * 1e5);
    for (let i = 0; i < path.length; i++) {
        const line = Line.builder().name(`Line_${id}_${i}`).positions(path[i], path[i].add(speed[i])).colors(color, color).build();
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


function enforceConstraints(path, edgeDistances, pathArea, dt) {
    const n = path.length;
    if (dt === 0) return;
    // length constraint
    for (let i = 0; i < n; i++) {
        const c1 = path[i].sub(path[mod(i - 1, n)]).length() - edgeDistances[mod(i - 1, n)]
        const c2 = path[mod(i + 1, n)].sub(path[i]).length() - edgeDistances[i];
        const grad1 = path[i].sub(path[mod(i - 1, n)]).normalize().scale(2 * c1);
        const grad2 = path[i].sub(path[mod(i + 1, n)]).normalize().scale(2 * c2);
        const grad = grad1.add(grad2);
        path[i] = path[i].add(grad.scale(-dt))
    }

    // area constraint
    const areaCost = areaFromPath(path) - pathArea;
    for (let i = 0; i < n; i++) {
        const prev = path[mod(i - 1, n)];
        const next = path[mod(i + 1, n)];
        let grad = prev.sub(next);
        grad = Vec2(-grad.y, grad.x);
        path[i] = path[i].add(grad.scale(- dt * 2 * areaCost));
    }
    // preserveArea(pathArea, path);

    // above floor constraint
    for (let i = 0; i < n; i++) {
        path[i] = path[i].y < 0 ? Vec2(path[i].x, 1e-3) : path[i];
        path[i] = path[i].y > 1 ? Vec2(path[i].x, 1 - 1e-3) : path[i];
        path[i] = path[i].x < 0 ? Vec2(1e-3, path[i].y) : path[i];
        path[i] = path[i].x > 1 ? Vec2(1 - 1e-3, path[i].y) : path[i];
    }
}

function updateSpeed(speed, prevPath, path, dt) {
    if (dt === 0) return;
    const n = path.length;
    for (let i = 0; i < n; i++) {
        speed[i] = path[i].sub(prevPath[i]).scale(1 / dt);
    }
}

function updateScene(dt) {
    scene.clear();
    const gravity = Vec2(0, -0.0);
    const subSteps = 20;
    const delta = dt / subSteps;
    const n = paths.length;
    for (let i = 0; i < n; i++) {
        const path = paths[i];
        const speed = speeds[i];
        const L = path.length;
        const edgeDistances = pathEdgeLengths[i];
        const pathArea = pathAreas[i];
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
        }
        addSpeed(speed, path, Color.RED);
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
import { Vec2, Window, loop, Box, Camera2D, NaiveScene, Line, Color, mod, clamp, orthoBasisFrom, Vec } from "../../src/index.node.js";

const width = 640;
const height = 640;
const window = new Window(width, height).onResizeWindow(() => window.paint());

const paths = [[Vec2(0.1, 0.1), Vec2(0.3, 0.1), Vec2(0.3, 0.3), Vec2(0.1, 0.3)]];
const speeds = [[Vec2(), Vec2(), Vec2(), Vec2()]];
const pathAreas = [[0.64]];
const pathEdgeLengths = [[0.2, 0.2, 0.2, 0.2]];
const curvatures = [[Math.PI / 2, Math.PI / 2, Math.PI / 2, Math.PI / 2]];
// const paths = [];
// const speeds = [];
// const pathAreas = [];
// const pathEdgeLengths = [];
// const curvatures = [];
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
        curvatures.push([]);
        curvatures.at(-1).push(...curvatureFromPath(paths.at(-1)));
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

function curvatureFromPath(path) {
    const n = path.length;
    const curvature = [];
    for (let i = 0; i < n; i++) {
        const next = path[mod(i + 1, n)].sub(path[i]);
        const prev = path[i].sub(path[mod(i - 1, n)]);
        let dTheta = Math.atan2(prev.cross(next), prev.dot(next)); // signed turning angle
        curvature.push(dTheta);
    }
    return curvature;
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

function enforceConstraints(path, prevDTheta, edgeDistances, dt) {
    const n = path.length;
    if (dt === 0) return;
    // path -> curvature representation
    const average = path.reduce((e, x) => e.add(x), Vec2()).scale(1 / path.length)
    for (let i = 0; i < n; i++) {
        path[i] = path[i].sub(average);
    }
    const dTheta = curvatureFromPath(path);
    // curvature constraint
    const grad = [];
    for (let i = 0; i < n; i++) {
        // grad.push(dTheta[i] - prevDTheta[i]);
        // update curvatures
        let gradient = dTheta[i] - prevDTheta[i];
        dTheta[i] += - gradient * dt
    }

    // const basis = orthoBasisFrom(Vec.ONES(n), Vec.fromArray(path.map(p => p.x)), Vec.fromArray(path.map(p => p.y)));
    // let gradVec = Vec.fromArray(grad);
    // // orthogonal grad projection from basis
    // let proj = Vec.ZERO(n)
    // for (let i = 0; i < basis.length; i++) {
    //     proj = proj.add(basis[i].scale(gradVec.dot(basis[i])))
    // }
    // gradVec = gradVec.sub(proj);
    // for (let i = 0; i < n; i++) {
    //     dTheta[i] += -gradVec.get(i) * dt;
    // }

    // curvature representation -> path
    const t0 = path[0].sub(path.at(-1));
    let theta = Math.atan2(t0.y, t0.x);
    theta = theta - 2 * Math.PI * Math.round(theta / (2 * Math.PI))
    console.log("$$$", theta);
    let p = path[0].add(Vec2(0.5, 0.5))
    for (let i = 0; i < n; i++) {
        let omega = dTheta[i];
        theta += omega;
        path[mod(i + 1, n)] = p.add(
            Vec2(Math.cos(theta), Math.sin(theta)).scale(edgeDistances[i])
        );
        p = path[mod(i + 1, n)];
    }


    // const gap = path[0].sub(path.at(-1));
    // for (let i = 0; i < n; i++) {
    //     path[i] = path[i].add(gap.scale(i / n)); // i_max = n-1 => i/n = n-1/n: this is on purpose. so that gap is not totally closed
    // }


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
    const gravity = Vec2(0, -0.1);
    const subSteps = 10;
    const delta = dt / subSteps;
    const n = paths.length;
    for (let i = 0; i < n; i++) {
        const path = paths[i];
        const speed = speeds[i];
        const L = path.length;
        const edgeDistances = pathEdgeLengths[i];
        const curvature = curvatures[i];
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
            enforceConstraints(path, curvature, edgeDistances, delta);
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
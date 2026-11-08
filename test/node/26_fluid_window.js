// AI generated fluid simulation with interactive brush
import { Color, Window, loop } from "../../src/index.node.js";

const GRID_SIZE = 100;
const VISCOSITY = 1.2;
// Unit grid spacing: explicit diffusion requires VISCOSITY * dt <= 1/4.
const MAX_DT = 0.05;
const PRESSURE_ITERATIONS = 50;
const size = GRID_SIZE * GRID_SIZE;
const ux = new Float32Array(size);
const uy = new Float32Array(size);
const density = new Float32Array(size);
const pressure = new Float32Array(size);
const divergence = new Float32Array(size);
const nextX = new Float32Array(size);
const nextY = new Float32Array(size);
const nextDensity = new Float32Array(size);
const mod = (n) => ((n % GRID_SIZE) + GRID_SIZE) % GRID_SIZE;
const index = (x, y) => mod(x) + GRID_SIZE * mod(y);

function diffuse(source, target, dt) {
    const a = VISCOSITY * dt;
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            const i = index(x, y);
            const laplacian = source[index(x - 1, y)] + source[index(x + 1, y)] +
                source[index(x, y - 1)] + source[index(x, y + 1)] - 4 * source[i];
            target[i] = source[i] + a * laplacian;
        }
    }
}

function advect(source, target, velocityX, velocityY, dt) {
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            const i = index(x, y);
            const px = x - dt * velocityX[i];
            const py = y - dt * velocityY[i];
            const x0 = Math.floor(px);
            const y0 = Math.floor(py);
            const tx = px - x0;
            const ty = py - y0;
            target[i] = (1 - ty) * ((1 - tx) * source[index(x0, y0)] + tx * source[index(x0 + 1, y0)]) +
                ty * ((1 - tx) * source[index(x0, y0 + 1)] + tx * source[index(x0 + 1, y0 + 1)]);
        }
    }
}

function project(velocityX, velocityY) {
    // Approximate incompressibility by removing the pressure gradient:
    // div(u - grad(p)) = 0, so solve Laplacian(p) = div(u).
    pressure.fill(0);
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            divergence[index(x, y)] = 0.5 * (
                velocityX[index(x + 1, y)] - velocityX[index(x - 1, y)] +
                velocityY[index(x, y + 1)] - velocityY[index(x, y - 1)]
            );
        }
    }
    // Solve Laplacian(p) = div(u) on the periodic grid. With unit spacing:
    // p[i-1,j] + p[i+1,j] + p[i,j-1] + p[i,j+1] - 4*p[i,j] = div(u)[i,j].
    // Rearranging gives p[i,j] = (sum of neighbors - div(u)[i,j]) / 4.
    // Gauss-Seidel repeats this update in place to approximate the solution.
    // The centered divergence and gradient compose to a different stencil,
    // so subtracting the pressure gradient only approximately removes divergence.
    for (let iteration = 0; iteration < PRESSURE_ITERATIONS; iteration++) {
        for (let y = 0; y < GRID_SIZE; y++) {
            for (let x = 0; x < GRID_SIZE; x++) {
                pressure[index(x, y)] = 0.25 * (
                    pressure[index(x - 1, y)] + pressure[index(x + 1, y)] +
                    pressure[index(x, y - 1)] + pressure[index(x, y + 1)] - divergence[index(x, y)]
                );
            }
        }
    }
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            const i = index(x, y);
            velocityX[i] -= 0.5 * (pressure[index(x + 1, y)] - pressure[index(x - 1, y)]);
            velocityY[i] -= 0.5 * (pressure[index(x, y + 1)] - pressure[index(x, y - 1)]);
        }
    }
}

function step(dt) {
    dt = Math.min(Math.max(dt, 0), MAX_DT);
    // Diffuse the current velocity into scratch buffers.
    diffuse(ux, nextX, dt);
    diffuse(uy, nextY, dt);
    // Read both components from the unchanged scratch buffers and write
    // the advected velocity back into the current ux and uy buffers.
    advect(nextX, ux, nextX, nextY, dt);
    advect(nextY, uy, nextX, nextY, dt);
    // Reduce divergence after advection before moving density.
    project(ux, uy);
    advect(density, nextDensity, ux, uy, dt);
    density.set(nextDensity);
}

function brush(x, y, paintDensity, dx, dy) {
    for (let j = -2; j <= 2; j++) {
        for (let i = -2; i <= 2; i++) {
            const weight = Math.max(0, 1 - (i * i + j * j) / 9);
            const k = index(Math.floor(x) + i, Math.floor(y) + j);
            if (paintDensity) density[k] = Math.min(1, density[k] + 0.4 * weight);
            ux[k] += dx * weight;
            uy[k] += dy * weight;
        }
    }
}

const width = 640;
const height = 480;
const window = new Window(width, height);
let leftDown = false;
let rightDown = false;
let lastX = 0;
let lastY = 0;
const gridX = (x) => x * GRID_SIZE / width;
const gridY = (y) => y * GRID_SIZE / height;

window.onMouseDown((x, y, e) => {
    x = gridX(x);
    y = gridY(y);
    if (e.button === Window.LEFT_CLICK) {
        leftDown = true;
        brush(x, y, true, 0, 0);
    }
    if (e.button === Window.RIGHT_CLICK) rightDown = true;
    lastX = x;
    lastY = y;
});
window.onMouseUp((x, y, e) => {
    if (e.button === Window.LEFT_CLICK) leftDown = false;
    if (e.button === Window.RIGHT_CLICK) rightDown = false;
});
window.onMouseMove((x, y) => {
    x = gridX(x);
    y = gridY(y);
    if (leftDown || rightDown) {
        const dx = x - lastX;
        const dy = y - lastY;
        const count = Math.max(1, Math.ceil(Math.hypot(dx, dy)));
        for (let k = 1; k <= count; k++) {
            brush(lastX + dx * k / count, lastY + dy * k / count,
                leftDown, rightDown ? 6 * dx / count : 0, rightDown ? 6 * dy / count : 0);
        }
    }
    lastX = x;
    lastY = y;
});

loop(({ dt }) => {
    window.setTitle(`FPS: ${Math.floor(1 / dt)} | Left: density | Right drag: velocity`);
    step(dt);
    window.map((x, y) => {
        const d = Math.max(0, Math.min(1, density[index(Math.floor(gridX(x)), Math.floor(gridY(y)))]));
        return Color.ofRGB(d, d, d);
    }).paint();
}).play();

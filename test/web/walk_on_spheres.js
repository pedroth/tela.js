// AI implementation of the Walk on Spheres algorithm
/* eslint-disable no-undef */
async (canvas, logger) => {
    canvas.resize(256, 256);

    const INNER_RADIUS = 0.5;
    const OUTER_RADIUS = 1;
    const OMEGA = 10;
    const EPSILON = 1e-4;
    const STEPS_PER_FRAME = 8;
    const BACKGROUND = Color.ofRGB(0.06, 0.07, 0.1);

    function annulusSdf(x, y) {
        const radius = Math.hypot(x, y);
        const outerCircle = radius - OUTER_RADIUS;
        const innerCircle = radius - INNER_RADIUS;
        return Math.max(outerCircle, -innerCircle);
    }

    function boundaryValue(x, y) {
        return Math.sin(OMEGA * Math.atan2(y, x));
    }

    function createWalkPass(camera, width, height) {
        const length = width * height;
        const xs = new Float64Array(length);
        const ys = new Float64Array(length);
        const values = new Float32Array(length);
        const active = new Int32Array(length);
        let remaining = 0;

        values.fill(NaN);
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const index = y * width + x;
                const point = camera.toWorldCoord(Vec2(x, y), { width, height });
                if (annulusSdf(point.x, point.y) > 0) continue;
                xs[index] = point.x;
                ys[index] = point.y;
                active[remaining++] = index;
            }
        }
        return { xs, ys, values, active, remaining };
    }

    function advanceWalkPass(pass, steps = STEPS_PER_FRAME, random = Math.random) {
        let remaining = 0;
        for (let i = 0; i < pass.remaining; i++) {
            const index = pass.active[i];
            let x = pass.xs[index];
            let y = pass.ys[index];
            let finished = false;
            for (let step = 0; step < steps; step++) {
                const distance = -annulusSdf(x, y);
                if (distance <= EPSILON) {
                    // Radial projection onto either circle preserves the angle.
                    pass.values[index] = boundaryValue(x, y);
                    finished = true;
                    break;
                }
                const angle = 2 * Math.PI * random();
                x += distance * Math.cos(angle);
                y += distance * Math.sin(angle);
            }
            if (!finished) {
                pass.xs[index] = x;
                pass.ys[index] = y;
                pass.active[remaining++] = index;
            }
        }
        pass.remaining = remaining;
        return remaining === 0;
    }

    function startWalkOnSpheres(surface, report) {
        const width = 256;
        const height = 256;
        const size = Vec2(width, height);
        const camera = new Camera2D(new Box(Vec2(-1.2, -1.2), Vec2(1.2, 1.2)));
        let exposure = surface.exposure();
        let pass;
        let samples = 0;
        let mouse = Vec2();
        let dragging = false;

        function reset() {
            exposure = surface.exposure();
            pass = createWalkPass(camera, width, height);
            samples = 0;
            surface.fill(BACKGROUND).paint();
            report(samples);
        }

        surface.onMouseDown((x, y) => {
            dragging = true;
            mouse = Vec2(x, y);
        });
        surface.onMouseUp(() => {
            dragging = false;
        });
        surface.onMouseMove((x, y) => {
            const nextMouse = Vec2(x, y);
            if (!dragging || nextMouse.equals(mouse)) return;
            const movement = nextMouse.sub(mouse).scale(-1).div(size).mul(camera.box.diagonal);
            camera.box = camera.box.move(movement);
            mouse = nextMouse;
            reset();
        });
        surface.onMouseWheel(event => {
            if (event.deltaY === 0) return;
            event.preventDefault?.();
            const scale = event.deltaY > 0 ? 1.1 : 1 / 1.1;
            const nextWidth = camera.box.diagonal.x * scale;
            if (nextWidth < 1e-3 || nextWidth > 1e3) return;
            camera.box = camera.box.scale(scale);
            reset();
        });

        reset();
        loop(() => {
            if (!advanceWalkPass(pass)) return;
            exposure.map((x, y) => {
                const value = pass.values[y * width + x];
                if (Number.isNaN(value)) return BACKGROUND;
                return Color.ofRGB(0.5 + 0.5 * value, 0.5, 0.5 - 0.5 * value);
            });
            surface.paint();
            samples++;
            report(samples);
            pass = createWalkPass(camera, width, height);
        }).play();
    }

    startWalkOnSpheres(canvas, samples => {
        logger.print(`Walk on spheres: ${samples} samples per pixel | Drag to pan, scroll to zoom`);
    });
}

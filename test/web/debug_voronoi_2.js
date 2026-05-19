/* eslint-disable no-undef */
// AI gen example
async (canvas) => {
    const width = 640 / 2;
    const height = 480 / 2;
    const size = Vec2(width, height);
    canvas.resize(width, height);

    let mousedown = false;
    let mouse = Vec2();
    let verticalBarX = width / 2;

    canvas.onMouseDown((x, y) => { mousedown = true; mouse = Vec2(x, y); });
    canvas.onMouseUp(() => { mousedown = false; mouse = Vec2(); });
    canvas.onMouseMove((x, y) => {
        const newMouse = Vec2(x, y);
        if (!mousedown || newMouse.equals(mouse)) return;
        verticalBarX = newMouse.x;
        mouse = newMouse;
    });

    const scene = new KScene();
    const nscene = new NaiveScene();
    const n = 3;

    // Generate weights first so we can use them for sphere radii
    const weights = [...Array(n * n)].map(() => Math.random() * 0.2);

    const grid = [...Array(n * n)].map((_, k) => {
        const initial = Vec2((k % n) / n, Math.floor(k / n) / n);
        const pos = initial.add(Vec.RANDOM(2)).map(x => 2 * x - 1);
        
        return Sphere.builder()
            .name(`pxl_${k}`)
            .radius(1e-2) // Small dot for the center
            .position(pos)
            .color(Color.random())
            .build();
    });

    // Create the "weight circles" (circumferences)
    // In a power diagram, d^2 - r^2 = 0 defines the circle.
    // So radius = sqrt(weight).
    const weightCircles = grid.map((p, i) => {
        return Sphere.builder()
            .name(`weight_${i}`)
            .radius(Math.sqrt(weights[i]))
            .position(p.position)
            .color(Color.WHITE)
            .build();
    });

    scene.addList(grid);
    nscene.addList(grid);
    // We don't necessarily add weightCircles to the spatial scene 
    // to avoid breaking getElementsNear, but we'll use them for rendering.

    const cameraSize = 2;

    loop(() => {
        canvas.map((x, y) => {
            const p = Vec2(x, y).div(size).map(v => cameraSize * (2 * v - 1));

            if (x === Math.floor(verticalBarX)) return Color.BLACK;

            if (x < verticalBarX) {
                return nscene.getElementsNear(p).color;
            }

            // Power Diagram Logic
            let minPowerDist = Infinity;
            let closestIndex = 0;
            for (let i = 0; i < grid.length; i++) {
                const diff = p.sub(grid[i].position);
                const d2 = Math.sqrt(diff.dot(diff)) - Math.sqrt(weights[i]);
                if (d2 < minPowerDist) {
                    minPowerDist = d2;
                    closestIndex = i;
                }
            }
            return grid[closestIndex].color;
        });

        // Render the circles and centers
        const renderSphere = (s, color) => {
            const center = s.position
                .map(v => (v / cameraSize + 1) / 2)
                .mul(size);
            const r = (s.radius / (cameraSize * 2)) * width;
            
            // Draw circumference (simple mid-point or manual circle if canvas.strokeCircle exists)
            // If tela.js doesn't have strokeCircle, we use pxl overrides:
            for(let theta = 0; theta < Math.PI * 2; theta += 0.1) {
                const cx = Math.floor(center.x + Math.cos(theta) * r);
                const cy = Math.floor(center.y + Math.sin(theta) * r);
                canvas.setPxl(cx, cy, color);
            }
        };

        weightCircles.forEach(c => renderSphere(c, Color.GRAY));
        grid.forEach(p => {
            const coords = p.position.map(v => (v / cameraSize + 1) / 2).mul(size).map(Math.floor);
            canvas.setPxl(coords.x, coords.y, Color.BLACK);
        });

        canvas.paint();
    }).play();
}
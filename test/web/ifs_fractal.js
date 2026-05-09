/* eslint-disable no-undef */
async (canvas, logger) => {
    const width = 960;
    const height = 640;
    canvas.resize(width, height);

    const scene = new NaiveScene();
    const camera = new Camera().orbit(6.5, 0.5, 0.35);

    const ifsExamples = [
        {
            name: "Sierpinski tetrahedron",
            burnIn: 20,
            iterations: 9000,
            pointRadius: 0.015,
            matrices: [
                [Vec3(0.5, 0, 0), Vec3(0, 0.5, 0), Vec3(0, 0, 0.5)],
                [Vec3(0.5, 0, 0), Vec3(0, 0.5, 0), Vec3(0, 0, 0.5)],
                [Vec3(0.5, 0, 0), Vec3(0, 0.5, 0), Vec3(0, 0, 0.5)],
                [Vec3(0.5, 0, 0), Vec3(0, 0.5, 0), Vec3(0, 0, 0.5)]
            ],
            offsets: [
                Vec3(-1, -1, -1),
                Vec3(1, -1, -1),
                Vec3(0, 1, -1),
                Vec3(0, 0, 1)
            ],
            probabilities: [0.25, 0.25, 0.25, 0.25],
            palette: [
                Color.ofRGB(0.95, 0.3, 0.3),
                Color.ofRGB(0.2, 0.85, 0.6),
                Color.ofRGB(0.2, 0.55, 0.95),
                Color.ofRGB(0.95, 0.9, 0.35)
            ]
        },
        {
            name: "3D fern",
            burnIn: 30,
            iterations: 11000,
            pointRadius: 0.011,
            matrices: [
                [Vec3(0, 0, 0), Vec3(0, 0.18, 0), Vec3(0, 0, 0)],
                [Vec3(0.82, 0.04, 0.02), Vec3(-0.04, 0.84, 0), Vec3(0.02, 0, 0.84)],
                [Vec3(0.22, -0.24, 0), Vec3(0.23, 0.22, 0.05), Vec3(0, 0.04, 0.25)],
                [Vec3(-0.16, 0.28, 0.05), Vec3(0.26, 0.24, -0.04), Vec3(0.03, 0.05, 0.22)]
            ],
            offsets: [Vec3(0, -2.1, 0), Vec3(0, 0.9, 0), Vec3(0, 0.9, 0), Vec3(0, 0.6, 0)],
            probabilities: [0.02, 0.84, 0.07, 0.07],
            palette: [
                Color.ofRGB(0.2, 0.2, 0.2),
                Color.ofRGB(0.2, 0.85, 0.45),
                Color.ofRGB(0.85, 0.55, 0.2),
                Color.ofRGB(0.25, 0.6, 0.95)
            ]
        },
        {
            name: "Crystal tower",
            burnIn: 20,
            iterations: 10000,
            pointRadius: 0.013,
            matrices: [
                [Vec3(0.5, 0, 0), Vec3(0, 0.5, 0), Vec3(0, 0, 0.5)],
                [Vec3(0.45, 0.05, 0), Vec3(-0.05, 0.45, 0), Vec3(0, 0, 0.52)],
                [Vec3(0.44, -0.05, 0), Vec3(0.05, 0.44, 0), Vec3(0, 0, 0.52)],
                [Vec3(0.38, 0.08, 0), Vec3(-0.08, 0.38, 0), Vec3(0, 0, 0.58)]
            ],
            offsets: [
                Vec3(-1.2, -1.2, -1.2),
                Vec3(1.2, -1.0, -0.2),
                Vec3(-1.0, 1.1, -0.2),
                Vec3(0, 0, 1.45)
            ],
            probabilities: [0.26, 0.28, 0.26, 0.2],
            palette: [
                Color.ofRGB(0.95, 0.35, 0.55),
                Color.ofRGB(0.35, 0.8, 0.95),
                Color.ofRGB(0.85, 0.95, 0.3),
                Color.ofRGB(0.95, 0.7, 0.25)
            ]
        }
    ];

    function transformWithMatrix(matrixRows, point, offset) {
        return Vec3(
            matrixRows[0].dot(point),
            matrixRows[1].dot(point),
            matrixRows[2].dot(point)
        ).add(offset);
    }

    function pickIndex(cumulative) {
        const u = Math.random();
        for (let i = 0; i < cumulative.length; i++) {
            if (u <= cumulative[i]) return i;
        }
        return cumulative.length - 1;
    }

    function estimateFixedPoint(matrixRows, offset, steps = 60) {
        let p = Vec3();
        for (let i = 0; i < steps; i++) {
            p = transformWithMatrix(matrixRows, p, offset);
        }
        return p;
    }

    function normalizePoints(points, fixedPoints) {
        const allPoints = points.concat(fixedPoints);
        let min = Vec3(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
        let max = Vec3(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY);

        allPoints.forEach(p => {
            min = min.op(p, Math.min);
            max = max.op(p, Math.max);
        });

        const center = min.add(max).scale(0.5);
        const diag = max.sub(min);
        const maxDiag = Math.max(diag.x, diag.y, diag.z, 1e-9);
        const scale = 3.8 / maxDiag;

        return {
            points: points.map(p => p.sub(center).scale(scale)),
            fixedPoints: fixedPoints.map(p => p.sub(center).scale(scale))
        };
    }

    function buildIFS(example) {
        const cumulative = [];
        example.probabilities.reduce((acc, x, i) => {
            const value = acc + x;
            cumulative[i] = value;
            return value;
        }, 0);

        let p = Vec3(0.001, 0.001, 0.001);
        const points = [];
        const pointColors = [];

        for (let i = 0; i < example.burnIn + example.iterations; i++) {
            const k = pickIndex(cumulative);
            p = transformWithMatrix(example.matrices[k], p, example.offsets[k]);
            if (i >= example.burnIn) {
                points.push(p);
                pointColors.push(example.palette[k % example.palette.length]);
            }
        }

        const fixedPoints = example.matrices.map((m, i) => estimateFixedPoint(m, example.offsets[i]));
        const normalized = normalizePoints(points, fixedPoints);

        const pointSpheres = normalized.points.map((point, i) =>
            Sphere.builder()
                .name(`ifs_pt_${i}`)
                .position(point)
                .radius(example.pointRadius)
                .color(pointColors[i])
                .build()
        );

        const convergenceSpheres = normalized.fixedPoints.map((point, i) =>
            Sphere.builder()
                .name(`ifs_fixed_${i}`)
                .position(point)
                .radius(example.pointRadius * 3.8)
                .color(example.palette[i % example.palette.length])
                .build()
        );

        return { pointSpheres, convergenceSpheres };
    }

    const controls = document.createElement("div");
    controls.style.cssText = [
        "left:12px",
        "top:12px",
        "background:rgba(20,20,24,0.75)",
        "color:#ffffff",
        "padding:8px 10px",
        "font-family:monospace",
        "font-size:12px",
        "border-radius:6px",
        "z-index:10"
    ].join(";");

    const label = document.createElement("label");
    label.textContent = "IFS: ";
    const select = document.createElement("select");
    ifsExamples.forEach((example, i) => {
        const option = document.createElement("option");
        option.value = String(i);
        option.textContent = example.name;
        select.appendChild(option);
    });
    label.appendChild(select);
    controls.appendChild(label);
    document.body.appendChild(controls);

    function rebuildScene(index) {
        const { pointSpheres, convergenceSpheres } = buildIFS(ifsExamples[index]);
        scene.clear();
        scene.addList(pointSpheres);
        scene.addList(convergenceSpheres);
    }

    rebuildScene(0);
    select.addEventListener("change", () => rebuildScene(Number(select.value)));

    let mousedown = false;
    let mouse = Vec2();
    canvas.onMouseDown((x, y) => {
        mousedown = true;
        mouse = Vec2(x, y);
    });
    canvas.onMouseUp(() => {
        mousedown = false;
        mouse = Vec2();
    });
    canvas.onMouseMove((x, y) => {
        const newMouse = Vec2(x, y);
        if (!mousedown || newMouse.equals(mouse)) {
            return;
        }
        const [dx, dy] = newMouse.sub(mouse).toArray();
        camera.orbit(coords =>
            coords.add(
                Vec3(
                    0,
                    -2 * Math.PI * (dx / canvas.width),
                    -2 * Math.PI * (dy / canvas.height)
                )
            )
        );
        mouse = newMouse;
    });
    canvas.onMouseWheel(({ deltaY }) => {
        camera.orbit(coords => coords.add(Vec3(deltaY * 0.001, 0, 0)));
    });

    loop(({ dt, time }) => {
        camera.orbit(coords => Vec3(coords.x, coords.y + 0.06 * dt, coords.z));
        camera.reverseShot(scene).to(canvas).paint();
        const example = ifsExamples[Number(select.value)];
        logger.print(`${example.name} | points: ${example.iterations} | fps: ${Math.floor(1 / dt)} | t: ${time.toFixed(1)}s`);
    }).play();
}

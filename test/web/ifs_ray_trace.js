/* eslint-disable no-undef */
// AI gen example
async (canvas) => {
    const width = 640/2;
    const height = 480/2;
    canvas.resize(width, height);

    const scene = new KScene();
    const camera = new Camera().orbit(6.5, 0.5, 0.35);
    let exposedCanvas = canvas.exposure();

    const lightDir = Vec3(0, 1, 1).normalize();
    const lightSharpness = 200;

    const ifsExample = {
        name: "Ray Traced IFS",
        burnIn: 20,
        iterations: 9000,
        pointRadius: 0.05,
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
    };

    function transformWithMatrix(matrixRows, point, offset) {
        return Vec3(
            matrixRows[0].dot(point),
            matrixRows[1].dot(point),
            matrixRows[2].dot(point)
        ).add(offset);
    }

    const cumulative = [];
    ifsExample.probabilities.reduce((acc, x, i) => {
        const value = acc + x;
        cumulative[i] = value;
        return value;
    }, 0);

    let p = Vec3(0.001, 0.001, 0.001);
    const points = [];
    const pointColors = [];

    for (let i = 0; i < ifsExample.burnIn + ifsExample.iterations; i++) {
        const k = cumulative.findIndex(u => Math.random() <= u);
        p = transformWithMatrix(ifsExample.matrices[k], p, ifsExample.offsets[k]);
        if (i >= ifsExample.burnIn) {
            points.push(p);
            pointColors.push(ifsExample.palette[k % ifsExample.palette.length]);
        }
    }

    points.forEach((point, i) => {
        scene.add(
            Sphere.builder()
                .name(`ifs_pt_${i}`)
                .position(point)
                .radius(ifsExample.pointRadius)
                .color(pointColors[i])
                .build()
        );
    });

    // Add a floor using triangles
    scene.add(
        Triangle.builder()
            .name("floor-1")
            .colors(Color.RED, Color.RED, Color.RED)
            .positions(Vec3(-5, -5, -5), Vec3(5, -5, -5), Vec3(5, 5, -5))
            .build(),
        Triangle.builder()
            .name("floor-2")
            .colors(Color.RED, Color.RED, Color.RED)
            .positions(Vec3(5, 5, -5), Vec3(-5, 5, -5), Vec3(-5, -5, -5))
            .build(),
        Triangle.builder()
            .name("wall-1")
            .material(Metallic(0.01))
            .colors(Color.GREY, Color.GREY, Color.GREY)
            .positions(Vec3(-5, -5, -5), Vec3(5, -5, -5), Vec3(5, -5, 5))
            .build(),
        Triangle.builder()
            .name("wall-2")
            .material(Metallic(0.01))
            .colors(Color.GREY, Color.GREY, Color.GREY)
            .positions(Vec3(5, -5, 5), Vec3(-5, -5, 5), Vec3(-5, -5, -5))
            .build()
    );

    // Add loop and camera movement with mouse
    let mousedown = false;
    let lastMouse = Vec2();
    canvas.onMouseDown((x, y) => {
        mousedown = true;
        lastMouse = Vec2(x, y);
    });
    canvas.onMouseUp(() => {
        mousedown = false;
    });
    canvas.onMouseMove((x, y) => {
        if (!mousedown) return;
        const newMouse = Vec2(x, y);
        const delta = newMouse.sub(lastMouse).scale(0.01);
        camera.orbit(
            camera._orbitCoords.x,
            camera._orbitCoords.y - delta.x,
            camera._orbitCoords.z - delta.y
        );
        lastMouse = newMouse;
        exposedCanvas = canvas.exposure();
    });
    canvas.onMouseWheel(({ deltaY }) => {
        camera.orbit(coords => coords.add(Vec3(deltaY * 0.001, 0, 0)));
        exposedCanvas = canvas.exposure();
    });

    // Add loop for continuous rendering
    loop(async ({dt}) => {
        (await camera.parallelShot(scene, {
            lightDir,
            lightSharpness,
            bounces: 5,
            skyBoxPath: "/assets/sky.jpg",
            isBiased: false,
            useCache: true
        }).to(exposedCanvas)).paint();
        logger.print(`fps: ${Math.floor(1 / dt)}`);
    }).play();
}
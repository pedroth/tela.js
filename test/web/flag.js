/* eslint-disable no-undef */
async (canvas, logger) => {
    const div = document.createElement("div");
    div.innerHTML = `
        <p>Left mouse button: move flag</p>
        <p>Right mouse button: move camera</p>
    `;
    document.body.appendChild(div);
    canvas.DOM.addEventListener("contextmenu", (e) => e.preventDefault());


    // resize incoming canvas:Canvas object.
    const width = 640;
    const height = 480;
    canvas.resize(width, height);

    // scene
    const scene = new NaiveScene();
    const camera = new Camera().orbit(5, 0, Math.PI / 6);
    const canvas2Ray = camera.rayFromImage(canvas.width, canvas.height);

    // mouse handling
    let leftMouseDown = false;
    let rightMouseDown = false;
    let mouse = Vec2();
    let intersectionPoint = null;
    canvas.onMouseDown((x, y, e) => {
        mouse = Vec2(x, y);
        if (e.button === 0) {
            leftMouseDown = true;
        } else {
            rightMouseDown = true;
        }
    });

    canvas.onMouseUp(() => {
        leftMouseDown = false;
        rightMouseDown = false;
        intersectionPoint = null;
        mouse = Vec2();
    });

    canvas.onMouseMove((x, y) => {
        const newMouse = Vec2(x, y);
        const [dx, dy] = newMouse.sub(mouse).toArray();
        if (leftMouseDown) {
            const ray = canvas2Ray(x, y);
            const normal = canvas2Ray(width / 2, height / 2).dir;
            intersectionPoint = ray.trace(-normal.dot(ray.init) / normal.dot(ray.dir));
        }
        if (rightMouseDown) {
            camera.orbit(sphereCoords =>
                sphereCoords.add(
                    Vec3(
                        0,
                        -2 * Math.PI * (dx / canvas.width),
                        -2 * Math.PI * (dy / canvas.height)
                    )
                )
            );
        }
        mouse = newMouse;
    });

    canvas.onMouseWheel(({ deltaY }) => {
        camera.orbit(sphereCoords => sphereCoords.add(Vec3(deltaY * 0.001, 0, 0)));
    });

    // scene
    function createFlag(size, texture) {
        const positions = [];
        const restPositions = [];
        const velocities = [];
        const triangles = [];
        const triangleIndices = [];
        for (let i = 0; i < size; i++) {
            positions[i] = [];
            restPositions[i] = [];
            velocities[i] = [];
            for (let j = 0; j < size; j++) {
                let y = j / (size - 1) - 0.5;
                let z = i / (size - 1) - 0.5;
                positions[i][j] = Vec3(0, 3 * y, 3 * z);
                restPositions[i][j] = positions[i][j].clone();
                velocities[i][j] = Vec3(0, 0, 0);
            }
        }
        for (let i = 0; i < size - 1; i++) {
            for (let j = 0; j < size - 1; j++) {

                triangles.push(
                    Triangle.builder()
                        .positions(positions[i][j], positions[i + 1][j], positions[i][j + 1])
                        .texCoords(
                            Vec2(j / (size - 1), i / (size - 1)),
                            Vec2(j / (size - 1), (i + 1) / (size - 1)),
                            Vec2((j + 1) / (size - 1), i / (size - 1))
                        )
                        .texture(texture)
                        .build()
                );
                triangleIndices.push([[i, j], [i + 1, j], [i, j + 1]]);
                triangles.push(
                    Triangle.builder()
                        .positions(positions[i + 1][j], positions[i + 1][j + 1], positions[i][j + 1])
                        .texCoords(
                            Vec2(j / (size - 1), (i + 1) / (size - 1)),
                            Vec2((j + 1) / (size - 1), (i + 1) / (size - 1)),
                            Vec2((j + 1) / (size - 1), i / (size - 1))
                        )
                        .texture(texture)
                        .build()
                );
                triangleIndices.push([[i + 1, j], [i + 1, j + 1], [i, j + 1]]);
            }
        }
        return { positions, restPositions, velocities, triangles, triangleIndices };
    }
    const texture = await Canvas.ofUrl("/assets/chapelle.jpg");
    const flag = createFlag(25, texture);
    scene.addList(flag.triangles);

    // physics
    function computeAcceleration(i, j) {
        const g = Vec3(0, 0, -1);
        const friction = 2;
        const stiffness = 150;
        let springForce = Vec3();
        const addTensionSpring = (neighborI, neighborJ) => {
            const displacement = flag.positions[neighborI][neighborJ].sub(flag.positions[i][j]);
            const length = displacement.length();
            const restLength = flag.restPositions[neighborI][neighborJ]
                .sub(flag.restPositions[i][j])
                .length();
            // Hooke law, F = -k * (L-L_0) * hat d; hat d = (p_i - p_j) / |p_i - p_j|
            if (length > restLength) {
                springForce = springForce.add(
                    displacement.scale(stiffness * (length - restLength) / length)
                );
            }
        };

        if (i > 0) addTensionSpring(i - 1, j);
        if (i < flag.positions.length - 1) addTensionSpring(i + 1, j);
        if (j > 0) addTensionSpring(i, j - 1);
        if (j < flag.positions[i].length - 1) addTensionSpring(i, j + 1);
        let mouseForce = Vec3();
        if (intersectionPoint) {
            const displacement = intersectionPoint.sub(flag.positions[i][j]);
            const sqLength = displacement.squareLength();
            mouseForce = mouseForce.add(
                displacement.scale(10 / sqLength)
            );
        }
        return g.add(springForce).add(mouseForce).sub(flag.velocities[i][j].scale(friction));
    }

    let simulationTime = 0;
    function flagPhysics(dt) {
        const maxStep = 1 / 240;
        const steps = Math.max(1, Math.ceil(dt / maxStep));
        const stepDt = dt / steps;
        for (let step = 0; step < steps; step++) {
            simulationTime += stepDt;
            for (let i = 0; i < flag.positions.length; i++) {
                flag.positions[i][0] = flag.restPositions[i][0];
                flag.velocities[i][0] = Vec3();
                for (let j = 1; j < flag.positions[i].length; j++) {
                    const acceleration = computeAcceleration(i, j);
                    flag.velocities[i][j] = flag.velocities[i][j].add(acceleration.scale(stepDt));
                    flag.positions[i][j] = flag.positions[i][j].add(flag.velocities[i][j].scale(stepDt));
                }
            }
        }
        // update triangle data based on positions
        for (let i = 0; i < flag.triangles.length; i++) {
            const triangle = flag.triangles[i];
            const indices = flag.triangleIndices[i];
            triangle.positions = indices.map(([row, column]) => flag.positions[row][column]);
            triangle.edges = triangle.positions.map((position, index) =>
                triangle.positions[(index + 1) % triangle.positions.length].sub(position)
            );
            triangle.tangents = [triangle.edges[0], triangle.edges.at(-1).scale(-1)];
            triangle.faceNormal = triangle.tangents[0].cross(triangle.tangents[1]).normalize();
            triangle.boundingBox = undefined;
        }
    }

    loop(({ dt }) => {
        camera
            .raster(scene, { cullBackFaces: false })
            .to(canvas)
            .paint();
        flagPhysics(dt);
        logger.print(`FPS: ${Math.floor(1 / dt)}`);
    }).play();
}

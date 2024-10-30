async (canvas, logger) => {
    const div = document.createElement("div");
    div.innerHTML = `
        <p>Left mouse button: draw</p>
        <p>Right mouse button: mouse force</p>
        <p>r: reset</p>
        <p>t: triangulate</p>
    `;
    document.body.appendChild(div);
    canvas.DOM.addEventListener("contextmenu", (e) => e.preventDefault());

    const width = 640;
    const height = 640;
    canvas.resize(width, height);

    let isFilled = false;
    let paths = [];
    let shapes = [];
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
    canvas.onMouseDown((x, y, e) => {
        mousedown = e?.buttons === 1;
        rightMouseDown = e?.buttons === 2;
        mouse = camera.toWorldCoord(Vec2(x, y), canvas);
    });

    canvas.onMouseUp(() => {
        mousedown = false;
        rightMouseDown = false;
        mouse = Vec2();
        if (path.length > 0) {
            paths.push([]);
            const cleanedPath = cleanPath(path);
            paths.at(-1).push(...cleanedPath);
            shapes.push([]);
            shapes.at(-1).push(...centeredShape(cleanedPath))
            pathEdgeLengths.push([]);
            pathEdgeLengths.at(-1).push(...distancesFromPath(cleanedPath));
            pathAreas.push([]);
            pathAreas.at(-1).push(areaFromPath(cleanedPath));
            speeds.push([]);
            speeds.at(-1).push(...[...Array(path.length)].fill(Vec2()))
            addPathLine2Scene(cleanedPath);
            path = [];
            draftScene.clear();
        }
    });

    canvas.onMouseMove((x, y) => {
        const newMouse = camera.toWorldCoord(Vec2(x, y), canvas);
        if (!mousedown || newMouse.equals(mouse)) {
            mouse = newMouse;
            return;
        }
        path.push(mouse.clone(), newMouse.clone())
        draftScene.add(Line.builder().name(`${Math.random()}`).positions(mouse, newMouse).colors(Color.CYAN, Color.CYAN).build());
        mouse = newMouse;
    });


    canvas.onKeyDown((e) => {
        if ("r" === e.key) {
            paths = [];
            shapes = [];
            speeds = [];
            pathAreas = [];
            pathEdgeLengths = [];
        }
        if ("t" === e.key) {
            isFilled = !isFilled;
        }
    })

    //========================================================================================
    /*                                                                                      *
     *                                         MAIN                                         *
     *                                                                                      */
    //========================================================================================

    function addPathLine2Scene(path, color = Color.WHITE) {
        const id = Math.floor(Math.random() * 1e5);
        for (let i = 0; i < path.length; i++) {
            const j = (i + 1) % path.length
            const line = Line.builder().name(`Line_${id}_${i}`).positions(path[i], path[j]).colors(color, color).build();
            scene.add(line)
        }
    }

    function addPathTriangles2Scene(path, color = Color.ofRGB(0.9, 0.9, 0.9)) {
        const orientation = computePathOrientation(path);
        const copiedPath = [...path];
        const triangles = triangulate([orientation > 0 ? copiedPath.reverse() : copiedPath])
        const id = Math.floor(Math.random() * 1e5);
        for (let i = 0; i < triangles.length; i++) {
            scene.add(
                Triangle
                    .builder()
                    .name(`Triangle_${id}_${i}`)
                    .positions(triangles[i][0], triangles[i][1], triangles[i][2])
                    .colors(color, color, color)
                    .build()
            )
        }
    }

    function centeredShape(path) {
        const center = path.reduce((e, x) => e.add(x), Vec2()).scale(1 / path.length);
        return path.map(p => p.sub(center));
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

    function isInside(x, path) {
        let n = path.length;
        let count = 0;
        for (let i = 0; i < n; i++) {
            const a = path[i];
            const b = path[mod(i + 1, n)];
            const v = b.sub(a);
            if (v.y === 0) continue;
            const r = x.sub(a);
            let t = - r.cross(v) / v.y;
            const s = r.y / v.y;
            count += t > 0 && s >= 0 && s <= 1 ? 1 : 0;
        }
        return count % 2 === 1;
    }

    function computePathOrientation(path) {
        const x = Vec2();
        let theta = 0;
        for (let j = 0; j < path.length - 1; j++) {
            const u = x.sub(path[j]);
            const v = x.sub(path[j + 1]);
            const uWedgeV = u.cross(v);
            theta += uWedgeV;
        }
        return Math.sign(0.5 * theta);
    }

    function enforceConstraints(path, { otherPaths, edgeDistances, pathArea, shape }, dt) {
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

        // shape matching
        const center = path.reduce((e, x) => e.add(x), Vec2()).scale(1 / n);
        const centeredPath = centeredShape(path);
        const avgAngle = centeredPath.reduce((e, x, i) => {
            let theta = Math.atan2(
                shape[i].cross(x), // ~ sin theta
                shape[i].dot(x) // ~ cos theta
            );
            theta = theta - 2 * Math.PI * Math.round(theta / (2 * Math.PI))
            return e + theta;
        }, 0) / n;
        const cos = Math.cos(avgAngle);
        const sin = Math.sin(avgAngle);
        for (let i = 0; i < n; i++) {
            const newShapeI = Vec2(
                cos * shape[i].x - sin * shape[i].y,
                sin * shape[i].x + cos * shape[i].y
            ).add(center);
            const grad = path[i].sub(newShapeI)
            path[i] = path[i].add(grad.scale(-10 * dt));
        }

        // collision handling
        const pathBox = path.reduce((e, x) => e.add(new Box(x, x)), new Box());
        // addBox(pathBox, Color.RED)
        const otherBoxes = otherPaths.map(pathI => pathI.reduce((e, x) => e.add(new Box(x, x)), new Box()));
        for (let i = 0; i < otherBoxes.length; i++) {
            const intersection = pathBox.sub(otherBoxes[i]);
            if (!intersection.isEmpty) {
                for (let j = 0; j < n; j++) {
                    if (isInside(path[j], otherPaths[i])) {
                        const index = argmin(otherPaths[i], p => path[j].sub(p).length());
                        const grad = index >= 0 ? path[j].sub(otherPaths[i][index]) : Vec2();
                        scene.add(Line.builder().name(Math.random()).positions(path[j], path[j].add(grad.scale(-dt))).colors(Color.PURPLE, Color.PURPLE).build())
                        path[j] = path[j].add(grad.scale(-10 * dt));
                    }
                }
            }
        }

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
            const pathArea = pathAreas[i];
            const shape = shapes[i];
            for (let k = 0; k < subSteps; k++) {
                const prevPath = [...path];
                for (let j = 0; j < L; j++) {
                    const mouseCoord = path[j].sub(mouse);
                    const mouseForce = mouseCoord.scale((rightMouseDown ? -1 : 0));
                    const friction = speed[j].scale(-0.5);
                    const acceleration = gravity.add(mouseForce).add(friction);
                    speed[j] = speed[j].add(acceleration.scale(delta));
                    path[j] = path[j].add(speed[j].scale(delta));
                }
                enforceConstraints(
                    path,
                    { otherPaths: paths.filter((_, l) => i !== l), edgeDistances, pathArea, shape },
                    delta
                );
                updateSpeed(speed, prevPath, path, delta);
            }
            // addSpeed(speed, path, Color.RED);
            if (rightMouseDown) scene.add(Sphere.builder().name("Mouse").radius(0.01).position(mouse).color(Color.RED).build())
            if (isFilled)
                addPathTriangles2Scene(path)
            else
                addPathLine2Scene(path);
        }
    }

    //========================================================================================
    /*                                                                                      *
     *                                         MAIN                                         *
     *                                                                                      */
    //========================================================================================

    /**
     * mouse-right: mouse force field
     * mouse-left: draw figure
     * r: reset scene
     * t: triangle mode on/off
     */
    loop(async ({ dt, time }) => {
        logger.print(`FPS: ${(1 / dt).toFixed(2)}`);
        updateScene(dt);
        canvas.fill(Color.BLACK);
        camera.raster(draftScene).to(canvas);
        camera.raster(scene).to(canvas).paint();
    }).play();
}



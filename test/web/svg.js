/* eslint-disable no-undef */
async (canvas) => {
    const svgFiles = ["cross.svg", "euler.svg", "stokes.svg", "expand.svg", "share.svg", "x.svg"];

    // DOM: svg selector
    const div = document.createElement("div");
    div.style.cssText = "padding: 8px;";
    const label = document.createElement("label");
    label.textContent = "SVG: ";
    const select = document.createElement("select");
    svgFiles.forEach((name, i) => {
        const option = document.createElement("option");
        option.value = i;
        option.textContent = name;
        select.appendChild(option);
    });
    select.value = 1;
    label.appendChild(select);
    div.appendChild(label);
    document.body.appendChild(div);

    // resize incoming canvas:Canvas object.
    const width = 640;
    const height = 480;
    canvas.resize(width, height);

    async function loadSVG(index) {
        const svg = parseSVG(await fetch(`/assets/${svgFiles[index]}`).then((x) => x.text()));

        const coordTransform = (x) => {
            const { min, max } = svg.viewBox;
            const diagonal = max.sub(min);
            let p = x.sub(min).div(diagonal);
            p = Vec2(p.x, -p.y).add(Vec2(0, 1));
            p = p.mul(Vec2(width, height)).map(Math.floor);
            return p;
        };

        const paths = svg.paths.flatMap((x) => x).map((p) => p.map(coordTransform));

        const keyPointPaths = svg.keyPointPaths
            .flatMap((x) => x)
            .map((p) => p.map(coordTransform));

        const boxes = paths.map((path) => {
            let box = new Box();
            for (let j = 0; j < path.length; j++) {
                box = box.add(new Box(path[j], path[j]));
            }
            return box;
        });

        const isInsideCurve = (x) => {
            let count = 0;
            const indices = boxes
                .map((b, i) => ({ box: b, index: i }))
                .filter((obj) => obj.box.collidesWith(x))
                .map((obj) => obj.index);
            for (let i = 0; i < indices.length; i++) {
                const path = paths[indices[i]];
                let theta = 0;
                for (let j = 0; j < path.length - 1; j++) {
                    const u = x.sub(path[j]);
                    const v = x.sub(path[j + 1]);
                    const thetaI = Math.atan2(u.y, u.x);
                    const thetaJ = Math.atan2(v.y, v.x);
                    let dTheta = thetaJ - thetaI;
                    dTheta = dTheta - 2 * Math.PI * Math.round(dTheta / (2 * Math.PI));
                    theta += dTheta;
                }
                const winding = theta / (2 * Math.PI);
                count += Math.round(winding);
            }
            return count < 0;
        };

        canvas.fill(Color.BLACK);
        for (let i = 0; i < paths.length; i++) {
            const path = paths[i];
            const keyPointPath = keyPointPaths[i];
            const box = boxes[i];
            canvas.mapBox((x, y) => {
                const p = Vec2(x + box.min.x, y + box.min.y);
                return isInsideCurve(p) ? Color.WHITE : Color.BLACK;
            }, box);
            for (let j = 0; j < keyPointPath.length - 1; j++) {
                canvas.drawLine(keyPointPath[j], keyPointPath[j + 1], () => Color.BLUE);
            }
            for (let j = 0; j < path.length - 1; j++) {
                canvas.drawLine(path[j], path[j + 1], () => Color.RED);
            }
        }
        canvas.paint();
    }

    await loadSVG(1);

    select.addEventListener("change", async () => {
        await loadSVG(Number(select.value));
    });
}
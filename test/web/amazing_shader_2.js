// Port from https://www.shadertoy.com/view/XsXXDn
(canvas, logger) => {
    // resize incoming canvas:Canvas object.
    const width = 640 / 2;
    const height = 480 / 2;
    canvas.resize(width, height);

    // util variables
    const r = Vec2(width, height);
    const mod = (x) => (n) => ((x % n) + n) % n;

    // Using loop from tela.js
    loop(({ time, dt }) => {
        logger.print(`FPS: ${(1 / dt).toFixed(2)}`);

        canvas
            .map((x, y) => {
                let z = time;
                const c = [];
                let l;

                for (let i = 0; i < 3; i++) {
                    let p = Vec2(x, y).div(r);
                    let uv = p.clone();
                    p = p.map(x => x - 0.5);
                    p = Vec2(p.x * (r.x / r.y), p.y);
                    z += 0.07;
                    l = p.length();
                    uv = uv.add(
                        p.scale(
                            ((Math.sin(z) + 1) * Math.abs(Math.sin(l * 9 - z - z)))
                        )
                        .scale(1 / l)
                    );
                    c[i] = 0.01 / uv.map(x => mod(x)(1) - 0.5).length();
                }

                return Color.ofRGB(...c).scale(1 / l);
            })
            .paint();
    }).play();
}
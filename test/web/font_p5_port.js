(canvas, logger) => {
    // AI Port https://x.com/KurtMoerman4/status/2101280203414610199
    const W = 768;
    const H = 304;

    canvas.resize(W, H);

    // Match the original string exactly.
    const text = imageFromString("tela.js");

    let t = 0;

    loop(() => {
        t++;

        // Original is essentially black.
        canvas.fill(Color.BLACK);

        for (let x = W; x > 0; x -= 8) {
            for (let y = H; y > 0; y -= 8) {

                // Map the Tela SDF onto the same screen region
                // occupied by the original p5 text.
                const px = (x - 20) / 748;
                const py = y / H;

                let distance = 1;

                if (
                    px >= 0 &&
                    px < 1 &&
                    py >= 0 &&
                    py < 1
                ) {
                    distance = text.getPxl(px, py);
                }

                // p5:
                // pixels[...] > 0 ? 8 : 3
                //
                // Tela's imageFromString() gives us an SDF,
                // so < 0.45 corresponds to the glyph.
                const l = distance < 0.55 ? 8 : 3;

                const q = l * Math.sin(x * y + t / 10);

                // IMPORTANT:
                // Do NOT discard negative q.
                // p5's circle() accepts a negative diameter
                // and renders it with its absolute size.
                const d = Math.abs(q);

                const color = Color.ofRGB(
                    (((q * 67) | 0) & 255) / 255,
                    (((q * 43) | 0) & 255) / 255,
                    (((q * 56) | 0) & 255) / 255
                );

                canvas.drawCircle(
                    Vec2(x, y),
                    d / 2,
                    () => color
                );
            }
        }

        canvas.paint();
    }).play();
}
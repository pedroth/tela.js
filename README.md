# tela.js

Experimental graphic library from scratch(software-only), with reference implementation of computer graphics algorithms.

![](/tela.png)

## Purpose

The purpose of this graphic engine is to be able to generate images in a computational way, with minimal dependencies, such that the readable graphical algorithms shine instead of opaque graphical APIs. The engine should also be capable to create videos and interactive demos or games. 

Playground usage:

[![Playground](/tela_playground.webp)](https://pedroth.github.io/tela.js)

# Table of Contents

- [Quick start](#quick-start)
- [Dependencies](#dependencies)
- [Acknowledgements](#acknowledgements)
- [TODOs](#todos)

# Quick start

## In the browser

```html
<!DOCTYPE html>
<html lang="en">
<head>
</head>
<body>
</body>
<script type="module">
    import { Canvas, Color, loop } from "https://cdn.jsdelivr.net/npm/tela.js/src/index.js";

    // You can also import from local file, e.g using `npm install tela.js`
    // import { Canvas, Color, loop } from "./node_modules/tela.js/src/index.js";

    const width = 640;
    const height = 480;
    const canvas = Canvas.ofSize(width, height);
    loop(({ time, dt }) => {
        document.title = `FPS: ${(Math.floor(1 / dt))}`;
        canvas.map((x, y) => {
            return Color.ofRGB(
                ((x * time) / width) % 1,
                ((y * time) / height) % 1
            )
        }).paint()
    }).play();
    document.body.appendChild(canvas.DOM);

</script>
</html>
```

## On the desktop
Install `tela.js` it using `npm install tela.js`.

```js
import { loop, Color, Window } from "tela.js/src/index.node.js";

const width = 640;
const height = 480;
const window = Window.ofSize(width, height);
loop(({ time, dt }) => {
    window.setTitle(`FPS: ${Math.floor(1 / dt)}`);
    window.map((x, y) => {
        return Color.ofRGB(
            ((x * time) / width) % 1,
            ((y * time) / height) % 1
        )
    }).paint();
})
.play();
```

And run it: `node index.mjs` / `bun index.js`

> Note: [Attention to running node with ES6 imports module](https://nodejs.org/api/esm.html#modules-ecmascript-modules)


## Generate images and videos

Install `tela.js` it using `npm install tela.js`.

Create a file:
```js
// index.js
import { Color, video } from "tela.js/src/index.node.js";

const width = 640;
const height = 480;
const FPS = 25;
const maxVideoTime = 10; // time in seconds

function animation({ time, image }) {
  return image.map((x, y) => {
    return Color.ofRGB(
      ((x * time) / width) % 1,
      ((y * time) / height) % 1
    );
  });
}

video(
  "hello_world.mp4",
  animation,
  { width, height, FPS }
).while(({ time }) => time < maxVideoTime);
```

And run it: `node index.mjs` / `bun index.js`


### Note on generating videos

To generate videos and images `tela.js` needs [ffmpeg][ffmpeg] in your system, in a way that it is possible to write on the console:
```bash
ffmpeg -version 

# it should output something like: fmpeg version 4.4.2-0ubuntu0.22.04.1...
# maybe with a different OS...

```

## More examples

You can find more examples of usage in:
- [Playground (for web examples)](https://pedroth.github.io/tela.js)
- [Test folder (for desktop)](/test/node/)


# Dependencies

- [`bun`][bun]/[`node`][node]
- [`ffmpeg`][ffmpeg]
- [`node-sdl`][sdl]

[Node][node] is preferred when running the demos (it is faster, [opened a bug in bun](https://github.com/oven-sh/bun/issues/9218)).


# Acknowledgements

- [Keenan's 3D Model Repository](https://www.cs.cmu.edu/~kmcrane/Projects/ModelRepository/)
- [The models resource](https://www.models-resource.com/)
- [otaviogood fonts](https://github.com/otaviogood/shader_fontgen)

# TODOs

- Serialize meshes not only triangles
- Optimize data serialization in parallel ray tracer
- Refactor geometric objects to have shader function
- Refactor parallel raytracing to parallel canvas map
- Read glb and gltf files

- Add lorentz attractors demo
- Add Iterated map fractals demo
- Add Volumetric fluid sim
- Megaman rag doll physics
- Black hole demo


[ffmpeg]: https://ffmpeg.org/
[bun]: https://bun.sh/
[node]: https://nodejs.org/en
[sdl]: https://github.com/kmamal/node-sdl


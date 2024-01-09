# tela.js

Graphic library from scratch, with reference implementation of computer graphics algorithms.

## Purpose

The propose of a graphic engine is to be able to generate images in a computational way. The engine should also be capable to create videos and interactive demos or games. In this engine I want to be able to render complex scenes with dynamic objects with realistic or cartoonish appearance.

# Table of Contents

- [Quick start](#quick-start)
- [Playground](#playground)
- [Main features](#main-features)

# Quick start

First you need to install [ffmpeg][ffmpeg] in your system, in a way that it is possible to write on the console:
```bash
ffmpeg -version 

# it should output something like: fmpeg version 4.4.2-0ubuntu0.22.04.1...
# maybe with a different OS...

```

Then just install using `npm 


# Playground

https://pedroth.github.io/tela.js/

# Main features

## Visual
- [/] Generate image (desktop /  browser)
    - Voxels (?)
    - [X] Different resolutions
    - [/] Point clouds / splatting
    - [/] Signed distance functions, implicit functions
    - [ ] Draw geometrical objects (aka [Simplices][simplex])
    - [ ] Path tracing: Shadows, Refraction, Global illumination, etc.
    - [X] Draw with shaders like code
    - [ ] Raster engine
- [/] Read Geometry formats with textures
- [X] Generate image/video (desktop /  browser)
- [X] Interactive application (browser)
- [ ] Draw svgs(which includes text/formulas)



[simplex]: https://en.wikipedia.org/wiki/Simplex

# Research

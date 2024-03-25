# tela.js

Graphic library from scratch, with reference implementation of computer graphics algorithms.

## Purpose

The purpose of this graphic engine is to be able to generate images in a computational way, with minimal dependencies, such that the readable graphical algorithms shine instead of opaque graphical APIs. The engine should also be capable to create videos and interactive demos or games. The engine should also be able to render complex scenes with dynamic objects with realistic or cartoonish appearance.

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

Then just install using `npm` or `bun`.

# Dependencies

- [`bun`][bun]/[`node`][node]
- [`ffmpeg`][ffmpeg]
- [`node-sdl`][sdl]


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
- [X] Interactive application (desktop / browser)
- [ ] Draw svgs(which includes text/formulas)

# Research


# Tela.js

- Canvas API
	- Map
	- Lines
	- setPxl, getPxl
	- Handle Mouse
	- Handle Keys (TODO)
	- Read Images

- Window API
	- Canvas API
	- Creating Executable

- Image API
	- Canvas API `-` Input handling
	- Render Video/Images
	- Render in parallel

- Raster engine
	- ZBuffer
	- Textures
	- Color interpolation
	- Lines, Triangles, Point cloud

- RayTrace
	- Ray - Sphere intersection
	- Ray - Triangle intersection
	- Naive Scene
	- Binary Bounding Box Scene
	- K-Bounding Box Scene
	- Voxel Bounding Box Scene
	- Materials / Light (TODO: Emissive, Reflecting, Lambertian, Refraction)
	- Textures (TODO)

- Signed Distance Functions
	- Generic ray marching
	- Spheres Distance
	- Box Distance
	- Triangle Distance (TODO)
	- Textures (TODO)
	- Logical Operators (TODO)
	- Smooth logic operators (TODO)
	- Material (TODO)

- Geometry Processing
	- Read `.obj` files
	- Read `svg` for text and drawing rendering (TODO)
	- Read `.stl`, `glTF`, `.ply` files (TODO)
	- Meshes, Lines, Paths, Spheres/Points / Tringles, Boxes (~)
	- Transformation hierarchy (TODO)
	- Skeletons animation (TODO)
	- Graph from mesh (TODO)
	- Computational Algebraic topology (TODO)
		- Co/Boundary operators
		- Co/Homology
	- Tensor/Vector fields in meshes (TODO) 
	- PDEs on Meshes



[simplex]: https://en.wikipedia.org/wiki/Simplex
[ffmpeg]: https://ffmpeg.org/
[bun]: https://bun.sh/
[node]: https://nodejs.org/en
[sdl]: https://github.com/kmamal/node-sdl


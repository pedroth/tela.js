# tela.js

Graphic engine from scratch in javascript, with reference implementation of computer graphics algorithms.

# What is a graphic engine?

A graphic engine, is something that enables the creation of images with a computer. An Image is in a abstract sense a function from the plane to the space of colors. Through the usage of basic primitives, such as lines and triangles the engine is capable of rendering the real world. A graphic engine is also able to generate movies by creating a sequence of images.

# Tela API

```js
class Point:
  id: String
  position: Vec2
  color: Color
  props: Map<String, Any>

class Line: (Point, Point)

class Triangle: (Point, Point, Point)

class ImageBuilder:
  width: Number => ImageBuilder
  height: Number => ImageBuilder
  build: () => Image

class Image:
  // private constructor
  image: Array<Number>
  width: Number
  height: Number
  imageTransform: Vec2 => Vec2

  // builder
  static builder: () => ImageBuilder

  // side effect functions, return mutated image
  drawLine: Line => Image
  drawTriangle: Triangle => Image
  map: ((color: Color, x: Number, y: Number) => Color) => Image
  fill: Color => Image

class CanvasBuilder:
  width: Number => CanvasBuilder
  height: Number => CanvasBuilder
  build: () => Canvas

class Canvas:
  // private constructor
  canvas: CanvasDOM
  image: Array<Number>
  width: Number
  height: Number

  // builder
  static builder: () => CanvasBuilder

  // side effect functions, return mutated image
  drawLine: Line => Canvas
  drawTriangle: Triangle => Canvas
  map: ((color: Color, x: Number, y: Number) => Color) => Canvas
  fill: Color => Canvas

```

# Features

- Basics

  - Draw lines
  - Draw triangles
  - Dynamic resolution images

- 2D Graphics

  - 2D camera
  - Alpha composing
  - Dithering
  - Textures
  - Sprites

- 3D Graphics

  - ZBuffer graphics
  - Path tracing
  - 3D camera
  - Perspective and Orthographic projection

- IO

  - Export images
  - Export videos
  - Interactive applications

- Other

  - Shaders
  - Image composition
  - Scene / Geometry manager
  - Modular architecture

# Usage

# Dependencies

- @pedroth/nabla.js

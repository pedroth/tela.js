# tela.js

Experimental graphic library from scratch, with reference implementation of computer graphics algorithms.

## Purpose

The purpose of this graphic engine is to be able to generate images in a computational way, with minimal dependencies, such that the readable graphical algorithms shine instead of opaque graphical APIs. The engine should also be capable to create videos and interactive demos or games. 

# Table of Contents

- [Quick start](#quick-start)
- [Playground](#playground)
- [Main features](#main-features)

# Quick start

## In the browser

## On the desktop

## Generate images and videos

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

[Node][node] is preferred when running the demos (it is faster), [bun][bun] is needed to build the library.

# Playground

https://pedroth.github.io/tela.js/



[ffmpeg]: https://ffmpeg.org/
[bun]: https://bun.sh/
[node]: https://nodejs.org/en
[sdl]: https://github.com/kmamal/node-sdl


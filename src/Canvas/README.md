# Canvas

Abstraction for DOM canvas element

## Details

DOM Canvas coordinates
``` 
 0                  W-1
 +-------------> y
 |
 |
 |       *
 |
 |
 v x

 H-1

```

The point $xe_1 + ye_2$ corresponds to a point in the middle of a pxl.

The canvas data is an array of length: $\text{colors}(C) * \text{width}(W) * \text{height}(H)$. Is a 3D-array.
The $\text{index}$ is a number in $\in$ $[0, C * W * H - 1]$.
Having $(x, y, z)$ where $z$ is the color axis, the formula to index the array is :

$$f(x, y, z) = C W  x + Cy + z$$

Where $x \in [0, H - 1], y \in [0, W - 1]$ and $z \in [0, C - 1]$.

Note that $f(H - 1, W - 1, C - 1) = C * W * H - 1.$
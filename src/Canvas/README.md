# Canvas

Abstraction for DOM canvas element. Canvas, can be though as a function,$\text{canvas}: \text{position} \rightarrow \text{color}$. 

- $\text{position}$ is a product of two sets: $[0, W-1] \times [0, H-1]$
- $\text{color}$ is a product of three(four) sets: $\text{red} \times \text{green} \times \text{blue}( \times \text{alpha}) = [0,1]^C$
- Where $W$ is the width, $H$ is the height and $C$ is the number of color channels.
- The canvas should not be used in `bun/node` environment it should only be used in `browsers`, for `bun/node` use [`Image.js`](../Image/Image.js)

Canvas coordinate system:

``` 
 y H-1
 ^ 
 |
 | 
 |
 |
 |               W-1
 +-------------> x
 0

```

## Details

While the Canvas API, tries to be user friendly, the reality of the DOM Canvas is different. 

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

In reality the DOM canvas stores its data in a simple 1-dimensional array of length: $ \text{width}(W) \times  \text{height}(H) \times \text{colors}(C)$. Hence, DOM canvas is more of a function $\text{index}: [0,W \times H \times C - 1] \rightarrow \text{(red | green | blue): }[0, 255]$.


Having the coordinate $\mathbf{x} = xe_1 + ye_2 + z e_3$. Where $x \in [0, H-1]$ and $y \in [0, W-1]$ represent the position and $z\in[0, C-1]$ represents the channel color, we can find its $\text{index}$, by computing the following equation:

$$\text{index}(x, y, z) = C W  x + Cy + z = C(Wx + y) + z$$

> Note that $\text{index}(H - 1, W - 1, C - 1) = C * W * H - 1$.

Code to retrieve the color from the canvas

```js
function retrieveColor(canvasDataArray, x, y) {
    const index = C * (W * x + y);
    const red =   canvasDataArray[index];
    const green = canvasDataArray[index + 1];
    const blue =  canvasDataArray[index + 2];
    const alpha = canvasDataArray[index + 3];
    return  [red, green, blue, alpha]
}
```

Code to retrieve coordinates $(x,y,z)$ based of $\text{index}$, we need to solve:

$$\text{index} = C(Wx + y) + z$$

Seems impossible to solve this because there is only one equation and we have 3 variables, but looking more closely we found the solution:

Finding $z \in [0, C-1]$:
$$\text{index} \mod C = (C(Wx+y)+z) \mod C $$
$$\text{index} \mod C = z $$

Finding $y \in [0, W-1]$

$$\lfloor \text{index} / C \rfloor = \lfloor(C(Wx+y)+z) / C \rfloor$$
$$\lfloor \text{index} / C \rfloor \mod W = Wx+y \mod W$$
$$\lfloor \text{index} / C \rfloor \mod W = y$$

Finding $x \in [0, H-1]$

$$\lfloor \text{index} / CW \rfloor = \lfloor(C(Wx+y)+z) / CW \rfloor$$

$$\lfloor \text{index} / CW \rfloor = x$$


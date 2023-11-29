# Image.js
Image is a object that represents a single image

```
 Image: Array<Color>
```
Image original coordinates:

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

The client side coordinates are:

```
^ y H-1
|
|         *
|
|
|
0-------------> x W-1
```
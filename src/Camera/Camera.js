import { Vec2, Vec3 } from "../Vector/Vector.js"
import Color from "../Color/Color.js"
import Ray from "../Ray/Ray.js";
import Point from "../Scene/Point.js";
import Line from "../Scene/Line.js";
import Triangle from "../Scene/Triangle.js";
import { lerp } from "../Utils/Math.js";

export default class Camera {
  constructor(props = {
    sphericalCoords: Vec3(2, 0, 0),
    focalPoint: Vec3(0, 0, 0),
    distanceToPlane: 1
  }) {
    const { sphericalCoords, focalPoint, distanceToPlane } = props;
    this.sphericalCoords = sphericalCoords || Vec3(2, 0, 0);
    this.focalPoint = focalPoint || Vec3(0, 0, 0);
    this.distanceToPlane = distanceToPlane || 1;
    this.orbit();
  }

  orbit() {
    const [rho, theta, phi] = this.sphericalCoords.toArray();
    const cosT = Math.cos(theta);
    const sinT = Math.sin(theta);
    const cosP = Math.cos(phi);
    const sinP = Math.sin(phi);

    this.basis = [];
    // z - axis
    this.basis[2] = Vec3(-cosP * cosT, -cosP * sinT, -sinP);
    // y - axis
    this.basis[1] = Vec3(-sinP * cosT, -sinP * sinT, cosP);
    // x -axis
    this.basis[0] = Vec3(-sinT, cosT, 0);

    const sphereCoordinates = Vec3(
      rho * cosP * cosT,
      rho * cosP * sinT,
      rho * sinP
    );
    this.eye = sphereCoordinates.add(this.focalPoint);
    return this;
  }

  rayShot(lambdaWithRays) {
    return {
      to: canvas => {
        const w = canvas.width;
        const h = canvas.height;
        return canvas.map((x, y) => {
          const dirInLocal = [
            2 * (x / w) - 1,
            2 * (y / h) - 1,
            1
          ]
          const dir = this.basis[0].scale(dirInLocal[0])
            .add(this.basis[1].scale(dirInLocal[1]))
            .add(this.basis[2].scale(dirInLocal[2]))
            .normalize()
          return lambdaWithRays(Ray(this.eye, dir));
        });
      }
    }
  }

  sceneShot(scene) {
    const lambda = ray => {
      return scene.interceptWith(ray)
        .map(([, normal]) => {
          return Color.ofRGB(
            (normal.get(0) + 1) / 2,
            (normal.get(1) + 1) / 2,
            (normal.get(2) + 1) / 2
          )
        })
        .orElse(() => {
          return Color.BLACK;
        })
    }
    return this.rayShot(lambda);
  }

  reverseShot(scene) {
    const type2render = {
      [Point.name]: rasterPoint,
      [Line.name]: rasterLine,
      [Triangle.name]: rasterTriangle,
    }
    return {
      to: canvas => {
        canvas.fill(Color.BLACK);
        const w = canvas.width;
        const h = canvas.height;
        const zBuffer = new Float64Array(w * h)
          .fill(Number.MAX_VALUE);
        scene.getElements().forEach((elem) => {
          if (elem.constructor.name in type2render) {
            type2render[elem.constructor.name]({
              canvas,
              camera: this,
              elem,
              w,
              h,
              zBuffer
            });
          }
        });
        canvas.paint();
        return canvas;
      }
    }
  }

  toCameraCoord(x) {
    let pointInCamCoord = x.sub(this.eye);
    pointInCamCoord = Vec3(
      this.basis[0].dot(pointInCamCoord),
      this.basis[1].dot(pointInCamCoord),
      this.basis[2].dot(pointInCamCoord)
    )
    return pointInCamCoord;
  }
}


//========================================================================================
/*                                                                                      *
 *                                         UTILS                                        *
 *                                                                                      */
//========================================================================================


function rasterPoint({ canvas, camera, elem, w, h, zBuffer }) {
  const point = elem;
  const { distanceToPlane } = camera;
  const { texCoord, texture, position, color, radius } = point;
  // camera coords
  let pointInCamCoord = camera.toCameraCoord(position)
  //frustum culling
  const z = pointInCamCoord.z;
  if (z < distanceToPlane) return;
  //project
  const projectedPoint = pointInCamCoord
    .scale(distanceToPlane / z);
  // shader
  let x = w / 2 + projectedPoint.x * w;
  let y = h / 2 + projectedPoint.y * h;
  x = Math.floor(x);
  y = Math.floor(y);
  if (x < 0 || x >= w || y < 0 || y >= h) return;
  const intRadius = Math.ceil((radius) * (distanceToPlane / z) * w);
  let finalColor = color;
  if (
    texture &&
    texCoord
  ) {
    const texColor = getTexColor(texCoord, texture);
    finalColor = finalColor.add(texColor).scale(1 / 2);
  }
  for (let k = -intRadius; k < intRadius; k++) {
    for (let l = -intRadius; l < intRadius; l++) {
      const xl = Math.max(0, Math.min(w - 1, x + k));
      const yl = Math.floor(y + l);
      const [i, j] = canvas.canvas2grid(xl, yl);
      const zBufferIndex = Math.floor(w * i + j);
      if (z < zBuffer[zBufferIndex]) {
        zBuffer[zBufferIndex] = z;
        canvas.setPxl(
          xl,
          yl,
          finalColor
        )
      }
    }
  }
}

function rasterLine({ canvas, camera, elem, w, h, zBuffer }) {
  const lineElem = elem;
  const { colors, positions } = lineElem;
  const { distanceToPlane } = camera;
  // camera coords
  const pointsInCamCoord = positions.map((p) => camera.toCameraCoord(p));
  //frustum culling
  let inFrustum = [];
  let outFrustum = [];
  pointsInCamCoord.forEach((p, i) => {
    const zCoord = p.z;
    if (zCoord < distanceToPlane) {
      outFrustum.push(i);
    } else {
      inFrustum.push(i);
    }
  });
  if (outFrustum.length === 2) return;
  if (outFrustum.length === 1) {
    const inVertex = inFrustum[0];
    const outVertex = outFrustum[0];
    const inter = lineCameraPlaneIntersection(
      pointsInCamCoord[outVertex],
      pointsInCamCoord[inVertex],
      camera
    );
    pointsInCamCoord[outVertex] = inter;
  }
  //project
  const projectedPoint = pointsInCamCoord
    .map(p => p.scale(distanceToPlane / p.z))
  // integer coordinates
  const intPoint = projectedPoint
    .map((p) => {
      let x = w / 2 + p.x * w;
      let y = h / 2 + p.y * h;
      x = Math.floor(x);
      y = Math.floor(y);
      return Vec2(x, y);
    })
  // shader
  const v = intPoint[1].sub(intPoint[0]);
  const vSquared = v.squareLength();
  const shader = (x, y) => {
    const p = Vec2(x, y).sub(intPoint[0]);
    const t = v.dot(p) / vSquared;
    const z = pointsInCamCoord[0].z * (1 - t) + pointsInCamCoord[1].z * t;
    const c = colors[0].scale(1 - t).add(colors[1].scale(t));
    const [i, j] = canvas.canvas2grid(x, y);
    const zBufferIndex = Math.floor(w * i + j);
    if (z < zBuffer[zBufferIndex]) {
      zBuffer[zBufferIndex] = z;
      return c;
    }
  }
  canvas.drawLine(intPoint[0], intPoint[1], shader);
}

function rasterTriangle({ canvas, camera, elem, w, h, zBuffer }) {
  const triangleElem = elem;
  const { distanceToPlane } = camera;
  const { colors, positions, texCoords, texture, } = triangleElem;
  // camera coords
  const pointsInCamCoord = positions.map((p) => camera.toCameraCoord(p));
  //frustum culling
  let inFrustum = [];
  let outFrustum = [];
  pointsInCamCoord.forEach((p, i) => {
    const zCoord = p.z;
    if (zCoord < distanceToPlane) {
      outFrustum.push(i);
    } else {
      inFrustum.push(i);
    }
  });
  if (outFrustum.length >= 1) return;
  //project
  const projectedPoint = pointsInCamCoord
    .map(p => p.scale(distanceToPlane / p.z))
  // integer coordinates
  const intPoint = projectedPoint
    .map((p) => {
      let x = w / 2 + p.x * w;
      let y = h / 2 + p.y * h;
      x = Math.floor(x);
      y = Math.floor(y);
      return Vec2(x, y);
    })
  // shader
  const u = intPoint[1].sub(intPoint[0]);
  const v = intPoint[2].sub(intPoint[0]);
  const det = u.x * v.y - u.y * v.x; // wedge product
  const shader = (x, y) => {
    const p = Vec2(x, y).sub(intPoint[0]);
    const alpha = - (v.x * p.y - v.y * p.x) / det;
    const beta = (u.x * p.y - u.y * p.x) / det;
    const gamma = 1 - alpha - beta;
    const z = pointsInCamCoord[0].z * gamma +
      pointsInCamCoord[1].z * alpha +
      pointsInCamCoord[2].z * beta;
    // compute color
    let c = colors[0].scale(gamma)
      .add(colors[1].scale(alpha))
      .add(colors[2].scale(beta));
    if (
      texture &&
      texCoords &&
      texCoords.length > 0 &&
      !texCoords.some(x => x === undefined)
    ) {
      const texUV = texCoords[0].scale(gamma)
        .add(texCoords[1].scale(alpha))
        .add(texCoords[2].scale(beta));
      const texColor = getTexColor(texUV, texture);
      c = c.add(texColor).scale(1 / 2);
    }
    const [i, j] = canvas.canvas2grid(x, y);
    const zBufferIndex = Math.floor(w * i + j);
    if (z < zBuffer[zBufferIndex]) {
      zBuffer[zBufferIndex] = z;
      return c;
    }
  }
  canvas.drawTriangle(intPoint[0], intPoint[1], intPoint[2], shader);
}

function lineCameraPlaneIntersection(vertexOut, vertexIn, camera) {
  const { distanceToPlane } = camera;
  const v = vertexIn.sub(vertexOut);
  const alpha = (distanceToPlane - vertexOut.z) / v.z;
  const p = vertexOut.add(v.scale(alpha));
  return p;
}

function getDefaultTexColor(texUV) {
  texUV = texUV.scale(16).map(x => x % 1)
  return texUV.x < 0.5 && texUV.y < 0.5 ?
    Color.BLACK :
    texUV.x > 0.5 && texUV.y > 0.5 ?
      Color.BLACK :
      Color.WHITE;
}

function getBiLinearTexColor(texUV, texture) {
  const size = Vec2(texture.width, texture.height);
  const texInt = texUV.mul(size);

  const texInt0 = texInt.map(Math.floor);
  const texInt1 = texInt0.add(Vec2(1, 0));
  const texInt2 = texInt0.add(Vec2(0, 1));
  const texInt3 = texInt0.add(Vec2(1, 1));

  const color0 = texture.getPxl(...texInt0.toArray());
  const color1 = texture.getPxl(...texInt1.toArray());
  const color2 = texture.getPxl(...texInt2.toArray());
  const color3 = texture.getPxl(...texInt3.toArray());

  const x = texInt.sub(texInt0);
  const bottomX = lerp(color0, color1)(x.x);
  const topX = lerp(color2, color3)(x.x);
  return lerp(bottomX, topX)(x.y);
}

function getTexColor(texUV, texture) {
  return texture.getPxl(texUV.x * texture.width, texUV.y * texture.height);
}
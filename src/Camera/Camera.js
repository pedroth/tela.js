import { Vec2, Vec3 } from "../Vector/Vector.js"
import Color from "../Color/Color.js"
import Ray from "../Ray/Ray.js";
import Point from "../Scene/Point.js";
import Line from "../Scene/Line.js";

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
      [Line.name]: rasterLine
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


function rasterPoint({ canvas, camera, elem, w, h, zBuffer }) {
  const { distanceToPlane } = camera;
  const point = elem;
  let pointInCamCoord = camera.toCameraCoord(point.position)

  //frustum culling
  const z = pointInCamCoord.z;
  if (z < distanceToPlane) return;

  //project
  const projectedPoint = pointInCamCoord
    .scale(distanceToPlane / z);

  // canvas coords
  let x = w / 2 + projectedPoint.x * w;
  let y = h / 2 + projectedPoint.y * h;
  x = Math.floor(x);
  y = Math.floor(y);
  if (x < 0 || x >= w || y < 0 || y >= h) return;
  const radius = Math.ceil((point.radius) * (distanceToPlane / z) * w);
  for (let k = -radius; k < radius; k++) {
    for (let l = -radius; l < radius; l++) {
      const xl = Math.max(0, Math.min(w - 1, x + k));
      const yl = Math.floor(y + l);
      const j = xl;
      const i = h - 1 - yl;
      const zBufferIndex = Math.floor(w * i + j);
      if (z < zBuffer[zBufferIndex]) {
        zBuffer[zBufferIndex] = z;
        canvas.setPxl(
          xl,
          yl,
          point.color
        )
      }
    }
  }
}

function rasterLine({ canvas, camera, elem, w, h, zBuffer }) {
  const line = elem;
  const { color } = line;
  const { distanceToPlane } = camera;

  // camera coords
  let cameraLine = [line.start, line.end].map((p) => camera.toCameraCoord(p));
  
  //frustum culling
  let inFrustum = [];
  let outFrustum = [];
  cameraLine.forEach((p, i) => {
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
    const inter = _lineCameraPlaneIntersection(
      cameraLine[outVertex],
      cameraLine[inVertex],
      camera
    );
    cameraLine[outVertex] = inter;
  }

  //project
  cameraLine.forEach((p, i) => {
    cameraLine[i] = cameraLine[i].scale(distanceToPlane / p.z);
  })
  // integer coordinates
  cameraLine = cameraLine.map((p) => {
    let x = w / 2 + p.x * w;
    let y = h / 2 + p.y * h;
    x = Math.floor(x);
    y = Math.floor(y);
    return Vec2(x, y);
  })
  canvas.drawLine(cameraLine[0], cameraLine[1], () => color);
}

function _lineCameraPlaneIntersection(vertexOut, vertexIn, camera) {
  const { distanceToPlane } = camera;
  const v = vertexIn.sub(vertexOut);
  const alpha = (distanceToPlane - vertexOut.z) / v.z;
  const p = vertexOut.add(v.scale(alpha));
  return p;
}
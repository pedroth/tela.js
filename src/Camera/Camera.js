import Scene from "./Scene.js";
import Vec from "../Vector/Vector.js";

export default class Camera {
  constructor({
    distanceToPlane = 1,
    alpha = Math.PI / 4,
    eye = Vec.of(2, 0, 0),
    param = Vec.of(2, 0, 0),
    focalPoint = Vec.of(0, 0, 0),
  }) {
    this.distanceToPlane = distanceToPlane;
    this.alpha = alpha;
    // Vec.of(rho, theta, phi)
    this.param = param;
    this.focalPoint = focalPoint;
    this.eye = eye;
    this.canvasSize = distanceToPlane * Math.tan(alpha);
  }

  orbit() {
    const [rho, theta, phi] = this.param.toArray();
    const cosT = Math.cos(theta);
    const sinT = Math.sin(theta);
    const cosP = Math.cos(phi);
    const sinP = Math.sin(phi);

    this.basis = [];
    // z - axis
    this.basis[2] = Vec.of(-cosP * cosT, -cosP * sinT, -sinP);
    // y - axis
    this.basis[1] = Vec.of(-sinP * cosT, -sinP * sinT, cosP);
    // x -axis
    this.basis[0] = Vec.of(-sinT, cosT, 0);

    const sphereCoordinates = Vec.of(
      rho * cosP * cosT,
      rho * cosP * sinT,
      rho * sinP
    );
    this.eye = sphereCoordinates.add(this.focalPoint);
    return this;
  }

  sceneShot(scene) {
    return {
      to: (canvas) => {
        const zBuffer = BUILD_VEC(canvas.width * canvas.height).fill(
          Number.MAX_VALUE
        );
        canvas.min = Vec2(1, 1).scale(-this.canvasSize);
        canvas.max = Vec2(1, 1).scale(this.canvasSize);
        scene.getElements().forEach((e) => {
          const paintMethodByType = {
            [Scene.Line.name]: drawLine,
            [Scene.Path.name]: drawPath,
            [Scene.Point.name]: drawPoint,
          };
          const type = e.constructor.name;
          if (type in paintMethodByType) {
            paintMethodByType[type](e, this, canvas, { zBuffer });
          }
        });
        canvas.paint();
        return this;
      },
    };
  }
}

function intersectImagePlaneInCameraSpace(vertexOut, vertexIn, camera) {
  const { distanceToPlane } = camera;
  const v = vertexOut.sub(vertexIn);
  const alpha = (distanceToPlane - vertexOut.get(2)) / v.get(2);
  const p = vertexOut.add(v.scale(alpha));
  return p;
}

function drawLine(line, camera, canvas, { zBuffer }) {
  const { color: rgb } = line;
  const { distanceToPlane } = camera;
  // camera coords
  const cameraLine = [line.start, line.end];
  const start = line.start.sub(camera.eye);
  const end = line.end.sub(camera.eye);
  cameraLine[0] = matrixTransposeProd(camera.basis, start);
  cameraLine[1] = matrixTransposeProd(camera.basis, end);

  //frustum culling
  let inFrustum = [];
  let outFrustum = [];
  for (let i = 0; i < cameraLine.length; i++) {
    const zCoord = cameraLine[i].get(2);
    if (zCoord < distanceToPlane) {
      outFrustum.push(i);
    } else {
      inFrustum.push(i);
    }
  }
  if (outFrustum.length == 2) {
    return;
  }
  if (outFrustum.length == 1) {
    const inVertex = inFrustum[0];
    const outVertex = outFrustum[0];
    const inter = intersectImagePlaneInCameraSpace(
      cameraLine[outVertex],
      cameraLine[inVertex],
      camera
    );
    cameraLine[outVertex] = inter;
  }

  //project
  for (let i = 0; i < cameraLine.length; i++) {
    const zCoord = cameraLine[i].get(2);
    cameraLine[i] = cameraLine[i].scale(distanceToPlane).scale(1 / zCoord);
  }
  canvas.drawLine(cameraLine[0].take(0, 2), cameraLine[1].take(0, 2), rgb);
}

function drawPoint(point, camera, canvas, { zBuffer }) {
  const { color: rgb, position, radius, shader, disableDepthBuffer } = point;
  const { distanceToPlane } = camera;
  // camera coords
  let pointInCameraCoords = position.sub(camera.eye);
  pointInCameraCoords = matrixTransposeProd(camera.basis, pointInCameraCoords);
  //frustum culling
  const zCoord = pointInCameraCoords.get(2);
  if (zCoord < distanceToPlane) {
    return;
  }
  //project
  const projectedPoint = pointInCameraCoords
    .scale(distanceToPlane)
    .scale(1 / zCoord);

  // draw
  canvas.drawPoint(projectedPoint.take(0, 2), rgb, {
    radius,
    predicate: (i, j) => {
      if (disableDepthBuffer) return true;
      const index = canvas.width * i + j;
      const isClose2Cam = zCoord < zBuffer[index];
      if (isClose2Cam) {
        zBuffer[index] = zCoord;
      }
      return isClose2Cam;
    },
    shader,
  });
}

function drawPath(path, camera, canvas, { zBuffer }) {
  const { path: lines } = path;
  for (let i = 0; i < lines.length - 1; i++) {
    const line = Scene.Line.builder()
      .name(`${path.name}_${i}`)
      .start(lines[i])
      .end(lines[i + 1])
      .color(...path.color)
      .build();
    drawLine(line, camera, canvas, { zBuffer });
  }
}

import { Vec3 } from "../Vector/Vector.js"
import Color from "../Color/Color.js"
import Ray from "../Ray/Ray.js";
export default class Camera {
  constructor(props = {
    sphericalCoords: Vec3(2, 0, 0),
    focalPoint: Vec3(0, 0, 0),
    distanceToPlane: 1
  }) {
    const {sphericalCoords, focalPoint, distanceToPlane} = props;
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
        canvas.map((x, y) => {
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
          // const zInCameraCoords = this.basis[2].dot(pos.sub(this.eye))
          // if (zInCameraCoords < this.distanceToPlane) return none();
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
    return {
      to: canvas => {
        canvas.fill(Color.BLACK);
        const w = canvas.width;
        const h = canvas.height;
        const zBuffer = new Float64Array(w * h)
          .fill(Number.MAX_VALUE);
        scene.getElements().forEach((point) => {
          let pointInCamCoord = point.position.sub(this.eye);
          pointInCamCoord = Vec3(
            this.basis[0].dot(pointInCamCoord),
            this.basis[1].dot(pointInCamCoord),
            this.basis[2].dot(pointInCamCoord)
          )
          //frustum culling
          const z = pointInCamCoord.get(2);
          if (z < this.distanceToPlane) {
            return;
          }
          //project
          const projectedPoint = pointInCamCoord
            .scale(this.distanceToPlane / z);

          // canvas coords
          const x = w / 2 + projectedPoint.get(0) * w;
          const y = h / 2 + projectedPoint.get(1) * h;
          const i = h - 1 - y;
          const j = x;
          const zBufferIndex = Math.floor(w * i + j);
          if (z < zBuffer[zBufferIndex]) {
            zBuffer[zBufferIndex] = z;
            const normal = point.normal;
            canvas.setPxl(
              Math.floor(x),
              Math.floor(y),
              Color.ofRGB(
                (normal.get(0) + 1) / 2,
                (normal.get(1) + 1) / 2,
                (normal.get(2) + 1) / 2
              ))
          }
        });
        canvas.paint();
      }
    }
  }
}

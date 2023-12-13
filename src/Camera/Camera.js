import { Vec3 } from "../Vector/Vector.js"
import Color from "../Color/Color.js"
import { Ray } from "../Ray/Ray.js";
export default class Camera {
  constructor(params = {
    param: Vec3(2, 0, 0),
    distanceToPlane: 1,
    focalPoint: Vec3(0, 0, 0),
  }) {
    const {
      distanceToPlane,
      eye,
      param,
      focalPoint
    } = params
    this.eye = eye;
    this.param = param;
    this.focalPoint = focalPoint;
    this.distanceToPlane = distanceToPlane;
    this.orbit();
  }

  orbit() {
    const [rho, theta, phi] = this.param.toArray();
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
    return {
      to: (canvas) => {
        const w = canvas.width;
        const h = canvas.height;
        const samples = w * h;
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
          return scene.interceptWith(Ray(this.eye, dir))
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
        })
      },
    };
  }
}

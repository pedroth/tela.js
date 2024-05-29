import { Vec3 } from "../Vector/Vector.js"
import Ray from "../Ray/Ray.js";
import { rayTrace } from "./raytrace.js";
import { rasterGraphics } from "./raster.js";
import { sdfTrace } from "./sdf.js";
import { normalTrace } from "./normal.js";

export default class Camera {
  constructor(props = {}) {
    const { sphericalCoords, lookAt, distanceToPlane, eye } = props;
    this.sphericalCoords = sphericalCoords ?? Vec3(2, 0, 0);
    this.lookAt = lookAt ?? Vec3(0, 0, 0);
    this.distanceToPlane = distanceToPlane ?? 1;
    this.eye = eye;
    if (!eye) this.orbit();
  }

  clone() {
    return new Camera({
      sphericalCoordinates: this.sphericalCoords,
      lookAt: this.lookAt,
      distanceToPlane: this.distanceToPlane
    })
  }

  orient() {
    const [, theta, phi] = this.sphericalCoords.toArray();
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

    return this;
  }

  orbit() {
    this.orient();

    const [rho, theta, phi] = this.sphericalCoords.toArray();
    const cosT = Math.cos(theta);
    const sinT = Math.sin(theta);
    const cosP = Math.cos(phi);
    const sinP = Math.sin(phi);

    const sphereCoordinates = Vec3(
      rho * cosP * cosT,
      rho * cosP * sinT,
      rho * sinP
    );

    this.eye = sphereCoordinates.add(this.lookAt);
    return this;
  }

  rayMap(lambdaWithRays) {
    return {
      to: canvas => {
        const w = canvas.width;
        const h = canvas.height;
        const ans = canvas.map((x, y) => {
          const dirInLocal = [
            (x / w - 0.5),
            (y / h - 0.5),
            this.distanceToPlane
          ]
          const dir = Vec3(
            this.basis[0].x * dirInLocal[0] + this.basis[1].x * dirInLocal[1] + this.basis[2].x * dirInLocal[2],
            this.basis[0].y * dirInLocal[0] + this.basis[1].y * dirInLocal[1] + this.basis[2].y * dirInLocal[2],
            this.basis[0].z * dirInLocal[0] + this.basis[1].z * dirInLocal[1] + this.basis[2].z * dirInLocal[2]
          )
            .normalize()
          const c = lambdaWithRays(Ray(this.eye, dir));
          return c;
        });
        return ans;
      }
    }
  }

  sceneShot(scene, params = {}) {
    return this.rayMap(rayTrace(scene, params));
  }

  reverseShot(scene, params = {}) {
    return {
      to: rasterGraphics(scene, this, params)
    }
  }

  sdfShot(scene) {
    return this.rayMap(sdfTrace(scene));
  }

  normalShot(scene) {
    return this.rayMap(normalTrace(scene));
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

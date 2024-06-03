import { Vec2, Vec3 } from "../Vector/Vector.js"
import Ray from "../Ray/Ray.js";
import { rayTrace } from "./raytrace.js";
import { rasterGraphics } from "./raster.js";
import { sdfTrace } from "./sdf.js";
import { normalTrace } from "./normal.js";



export default class Camera {
  constructor(props = {}) {
    const { lookAt, distanceToPlane, position } = props;
    this.lookAt = lookAt ?? Vec3(0, 0, 0);
    this.distanceToPlane = distanceToPlane ?? 1;
    this.position = position ?? Vec3(3, 0, 0);
    this._orientCoords = Vec2();
    this._orbitCoords = Vec3(this.position.length(), 0, 0);
    this.orient();
  }

  clone() {
    return new Camera({
      lookAt: this.lookAt,
      position: this.position,
      distanceToPlane: this.distanceToPlane,
    })
  }

  look(at, up = Vec3(0, 0, 1)) {
    this.lookAt = at;
    this.basis[2] = this.position.sub(at).normalize();
    // x -axis
    this.basis[0] = this.basis[2].cross(up).normalize();
    // y - axis
    this.basis[1] = this.basis[0].cross(this.basis[2]).normalize();
    return this
  }

  orient(theta = 0, phi = 0) {
    if (theta instanceof Function) {
      this._orientCoords = theta(this._orientCoords);
      theta = this._orientCoords.x;
      phi = this._orientCoords.y;
    } else {
      this._orientCoords = Vec2(theta, phi);
    }
    const cosT = Math.cos(theta);
    const sinT = Math.sin(theta);
    const cosP = Math.cos(phi);
    const sinP = Math.sin(phi);

    this.basis = [];
    // right hand coordinate system
    // z - axis
    this.basis[2] = Vec3(-cosP * cosT, -cosP * sinT, -sinP);
    // y - axis
    this.basis[1] = Vec3(-sinP * cosT, -sinP * sinT, cosP);
    // x -axis
    this.basis[0] = Vec3(-sinT, cosT, 0);

    return this;
  }

  orbit(radius, theta, phi) {
    if (radius instanceof Function) {
      this._orbitCoords = radius(this._orbitCoords);
      radius = this._orbitCoords.x;
      theta = this._orbitCoords.y;
      phi = this._orbitCoords.z;
    } else {
      this._orbitCoords = Vec3(radius, theta, phi);
    }
    this.orient(theta, phi);

    const cosT = Math.cos(theta);
    const sinT = Math.sin(theta);
    const cosP = Math.cos(phi);
    const sinP = Math.sin(phi);

    const sphereCoordinates = Vec3(
      radius * cosP * cosT,
      radius * cosP * sinT,
      radius * sinP
    );

    this.position = sphereCoordinates.add(this.lookAt);
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
          const c = lambdaWithRays(Ray(this.position, dir));
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
    let pointInCamCoord = x.sub(this.position);
    pointInCamCoord = Vec3(
      this.basis[0].dot(pointInCamCoord),
      this.basis[1].dot(pointInCamCoord),
      this.basis[2].dot(pointInCamCoord)
    )
    return pointInCamCoord;
  }

  toWorldCoord(camVec) {
    let x = Vec3();
    for (let i = 0; i < this.basis.length; i++) {
      x = x.add(this.basis[i].scale(camVec.get(i)));
    }
    return x;
  }
}

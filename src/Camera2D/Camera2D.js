import { Vec2 } from "../Vector/Vector.js"
import Ray from "../Ray/Ray.js";
import Box from "../Geometry/Box.js";
import Sphere from "../Geometry/Sphere.js";
import Line from "../Geometry/Line.js";
import Triangle from "../Geometry/Triangle.js";

export default class Camera2D {
  constructor(box = new Box(Vec2(), Vec2(1, 1))) {
    this.box = box;
  }

  map(lambda) {
    return {
      to: canvas => {
        const w = canvas.width;
        const invW = 1 / w;
        const h = canvas.height;
        const invH = 1 / h;
        const ans = canvas.map((x, y) => {
          let p = Vec2(x, y).mul(Vec2(invW, invH));
          p = p.mul(this.box.diagonal).add(this.box.min);
          return lambda(p);
        });
        return ans;
      }
    }
  }

  raster(scene) {
    const type2render = {
      [Sphere.name]: rasterCircle,
      [Line.name]: rasterLine,
      [Triangle.name]: rasterTriangle,
    }
    return {
      to: tela => {
        const elements = scene.getElements();
        for (let i = 0; i < elements.length; i++) {
          const element = elements[i];
          const type = element.type;
          const rasterizer = type2render[type];
          if (rasterizer) {
            rasterizer(element, this, tela);
          }
        }
      }
    }
  }

  serialize() {
    return {
      box: this.box.serialize(),
    }
  }

  toCanvasCoord(p) {
    return p.sub(this.box.min).div(this.box.diagonal);
  }

  static deserialize(json) {
    return new Camera2D(Box.deserialize(json.box));
  }
}


function rasterCircle(circle, camera, tela) {
  const centerInCanvas = camera.toCanvasCoord(circle.center);
  const radius = camera.toCanvasCoord(circle.center.add(Vec2(circle.radius, 0))).x - centerInCanvas.x;
  tela.drawCircle(centerInCanvas, radius, () => {
    return circle.color;
  });
}

function rasterLine(line, camera, canvas) {
  const { a, b } = line;

}

function rasterTriangle(triangle, camera, canvas) {
  const { a, b, c } = triangle;

}
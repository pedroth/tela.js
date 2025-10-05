import { Vec2 } from "../Vector/Vector.js"
import Box from "../Geometry/Box.js";
import Sphere from "../Geometry/Sphere.js";
import Line from "../Geometry/Line.js";
import Triangle from "../Geometry/Triangle.js";
import Color from "../Color/Color.js";
import { getTexColor } from "../Camera/common.js";

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

  mapBox(lambda, boxInWorld) {
    return {
      to: canvas => {
        const cameraBoxInCanvasCoords = new Box(this.toCanvasCoord(boxInWorld.min, canvas), this.toCanvasCoord(boxInWorld.max, canvas));
        return canvas.mapBox((x, y) => {
          // (x,y) \in [0,cameraBox.width] x [0, cameraBox.height]
          let p = Vec2(x, y).div(cameraBoxInCanvasCoords.diagonal).mul(boxInWorld.diagonal).add(boxInWorld.min);
          return lambda(p);
        }, cameraBoxInCanvasCoords);
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
        const elements = scene.getElementsInBox(this.box);
        for (let i = 0; i < elements.length; i++) {
          const element = elements[i];
          const rasterizer = type2render[element.constructor.name];
          if (rasterizer) {
            rasterizer(element, this, tela);
          }
        }
        return tela;
      }
    }
  }

  serialize() {
    return {
      box: this.box.serialize(),
    }
  }

  toCanvasCoord(p, canvas) {
    return p.sub(this.box.min).div(this.box.diagonal).mul(Vec2(canvas.width, canvas.height));
  }

  toWorldCoord(x, canvas) {
    const size = Vec2(canvas.width, canvas.height);
    return x.div(size).mul(this.box.diagonal)
  }

  static deserialize(json) {
    return new Camera2D(Box.deserialize(json.box));
  }
}


function rasterCircle(circle, camera, canvas) {
  const centerInCanvas = camera.toCanvasCoord(circle.position, canvas);
  const radius = camera.toCanvasCoord(circle.position.add(Vec2(circle.radius, 0)), canvas).x - centerInCanvas.x;
  return canvas.drawCircle(centerInCanvas, radius, () => {
    return circle.color;
  });
}

function rasterLine(line, camera, canvas) {
  const positionsInCanvas = line.positions.map(p => camera.toCanvasCoord(p, canvas));
  return canvas.drawLine(
    positionsInCanvas[0],
    positionsInCanvas[1],
    () => {
      return line.colors[0]
    }
  );
}

function rasterTriangle(triangle, camera, canvas) {
  const colors = triangle.colors;
  const texCoords = triangle.texCoords;
  const texture = triangle.texture;
  const intPoints = triangle
    .positions
    .map(p => camera.toCanvasCoord(p, canvas).map(Math.floor));
  const u = intPoints[1].sub(intPoints[0]);
  const v = intPoints[2].sub(intPoints[0]);
  const det = u.x * v.y - u.y * v.x; // wedge product
  if (det === 0) return;
  const invDet = 1 / det;
  const c1 = colors[0].toArray();
  const c2 = colors[1].toArray();
  const c3 = colors[2].toArray();
  const haveTextures = texCoords &&
    texCoords.length > 0 &&
    !texCoords.some(x => x === undefined);
  const shader = (x, y) => {
    const p = Vec2(x, y).sub(intPoints[0]);
    const alpha = - (v.x * p.y - v.y * p.x) * invDet;
    const beta = (u.x * p.y - u.y * p.x) * invDet;
    const gamma = 1 - alpha - beta;
  
    // compute color
    let c = Color.ofRGB(
      c1[0] * gamma + c2[0] * alpha + c3[0] * beta,
      c1[1] * gamma + c2[1] * alpha + c3[1] * beta,
      c1[2] * gamma + c2[2] * alpha + c3[2] * beta,
      c1[3] * gamma + c2[3] * alpha + c3[3] * beta,
    );
    if (haveTextures) {
      const texUV = texCoords[0].scale(gamma)
        .add(texCoords[1].scale(alpha))
        .add(texCoords[2].scale(beta));
      const texColor = texture ? getTexColor(texUV, texture) : c;
      c = texColor;
    }
    return Math.random() < c.alpha ? c : undefined;
  }

  return canvas.drawTriangle(
    intPoints[0],
    intPoints[1],
    intPoints[2],
    shader
  );

}

import { Vec3 } from "../Vector/Vector.js";
import { argmin, hashStr } from "../Utils/Utils.js";
import { smin } from "../Utils/Math.js";

export default class NaiveScene {
  constructor() {
    this.id2ElemMap = {};
    this.sceneElements = [];
    this._elementHashCache = new WeakMap();
  }

  get(id) {
    return this.id2ElemMap[id];
  }

  getHash() {
    const elements = this.getElements();
    let combinedHash = elements.length;
    const prime = 31;  // A prime number, typically used in hash functions
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      const hash = this._getElementHash(element);
      combinedHash = (combinedHash * prime) ^ hash;
    }
    return combinedHash >>> 0; // unsigned shift operator, converts combinedHash to unsigned number
  }

  _getElementHash(element) {
    const cached = this._elementHashCache.get(element);
    const material = element.material;
    const materialType = material?.type;
    const materialArgs = String(material?.args);
    const signature = {
      name: element.name,
      emissive: element.emissive,
      materialType,
      materialArgs,
      positionsRef: element.positions,
      texCoordsRef: element.texCoords,
      colorsRef: element.colors,
    };

    if (
      cached &&
      cached.name === signature.name &&
      cached.emissive === signature.emissive &&
      cached.materialType === signature.materialType &&
      cached.materialArgs === signature.materialArgs &&
      cached.positionsRef === signature.positionsRef &&
      cached.texCoordsRef === signature.texCoordsRef &&
      cached.colorsRef === signature.colorsRef
    ) {
      return cached.hash;
    }

    let hash = hashStr(String(element.name));
    if (material) {
      hash = (hash * 31) ^ hashStr(materialType + materialArgs);
    }
    if (element.emissive) {
      hash = (hash * 31) ^ 1;
    }
    if (element.positions) {
      hash = (hash * 31) ^ hashStr(element.positions.map(p => p.toArray().join(",")).join("|"));
    }
    if (element.texCoords) {
      hash = (hash * 31) ^ hashStr(element.texCoords.map(t => t.toArray().join(",")).join("|"));
    }
    if (element.colors) {
      hash = (hash * 31) ^ hashStr(element.colors.map(c => c.toArray().join(",")).join("|"));
    }

    this._elementHashCache.set(element, { ...signature, hash: hash >>> 0 });
    return hash >>> 0;
  }

  add(...elements) {
    return this.addList(elements);
  }

  addList(elements) {
    for (let i = 0; i < elements.length; i++) {
      const elem = elements[i];
      const { name } = elem;
      this.id2ElemMap[name] = elem;
      this.sceneElements.push(elem);
    }
    return this;
  }

  getElements() {
    return this.sceneElements;
  }

  clear() {
    this.id2ElemMap = {};
    this.sceneElements = [];
    this._elementHashCache = new WeakMap();
  }

  distanceToPoint(p, combineLeafs = Math.min) {
    const elements = this.sceneElements;
    let distance = Number.MAX_VALUE;
    for (let i = 0; i < elements.length; i++) {
      distance = combineLeafs(distance, elements[i].distanceToPoint(p));
    }
    return distance;
  }

  normalToPoint(p) {
    const epsilon = 1e-3;
    const k0 = Vec3( 1, -1, -1);
    const k1 = Vec3(-1, -1,  1);
    const k2 = Vec3(-1,  1, -1);
    const k3 = Vec3( 1,  1,  1);
    const f = q => this.distanceToPoint(q, smin);
    return k0.scale(f(p.add(k0.scale(epsilon))))
      .add(k1.scale(f(p.add(k1.scale(epsilon)))))
      .add(k2.scale(f(p.add(k2.scale(epsilon)))))
      .add(k3.scale(f(p.add(k3.scale(epsilon)))))
      .normalize();
  }

  interceptWithRay(ray) {
    const elements = this.sceneElements;
    let closestDistance = Number.MAX_VALUE;
    let closest;
    for (let i = 0; i < elements.length; i++) {
      const hit = elements[i].interceptWithRay(ray);
      if (hit && hit[0] < closestDistance) {
        closest = hit;
        closestDistance = hit[0];
      }
    }
    return closest;
  }

  distanceOnRay(ray, combineLeafs = Math.min) {
    return this.distanceToPoint(ray.init, combineLeafs);
  }

  getElementsNear(p) {
    return this.sceneElements[argmin(this.sceneElements, x => x.distanceToPoint(p))];
  }

  getElementsInBox(box) {
    let filteredElements = [];
    for (let i = 0; i < this.sceneElements.length; i++) {
      const elem = this.sceneElements[i];
      if (elem.getBoundingBox().collidesWith(box)) {
        filteredElements.push(elem);
      }
    }
    return filteredElements;
  }

  rebuild() {
    return this;
  }

  debug(params) {
    return params.canvas;
  }

  serialize() {
    const json = {
      params: [],
      type: NaiveScene.name,
      sceneData: this.getElements().map(x => x.serialize()),
    };

    return json;
  }
}

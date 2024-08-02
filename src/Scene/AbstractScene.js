export class AbstractScene {
    constructor() {
        this.id2ElemMap = {};
        this.sceneElements = [];
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
      }
    
      distanceToPoint(p) {
        const elements = this.sceneElements;
        let distance = Number.MAX_VALUE;
        for (let i = 0; i < elements.length; i++) {
          distance = Math.min(distance, elements[i].distanceToPoint(p));
        }
        return distance;
      }
    
      normalToPoint(p) {
        const epsilon = 1e-3;
        const n = p.dim;
        const grad = [];
        const d = this.distanceToPoint(p);
        for (let i = 0; i < n; i++) {
          grad.push(this.distanceToPoint(p.add(Vec.e(n)(i).scale(epsilon))) - d);
        }
        return Vec.fromArray(grad).scale(Math.sign(d)).normalize();
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
    
      distanceOnRay(ray) {
        return this.distanceToPoint(ray.init);
      }
    
      getElementNear(p) {
        return this.sceneElements[argmin(this.sceneElements, x => x.distanceToPoint(p))];
      }
    
      getElementInBox(box) {
        throw Error("Not Implemented");
      }
    
      rebuild() {
        return this;
      }
    
      debug(params) {
        return params.canvas;
      }
}
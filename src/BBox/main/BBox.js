import Matrix from "../../Matrix/main/Matrix";

export default class BBox {
  constructor(min, max) {
    this.isEmpty = min === undefined || max === undefined;
    if (this.isEmpty) return this;
    this.min = min.op(max, Math.min);
    this.max = max.op(min, Math.max);
    this.center = min.add(max).scale(1 / 2);
    this.diagonal = max.sub(min);
  }
  /**
   * Union of boxes
   * @param {*} box
   */
  add(box) {
    if (this === BBox.EMPTY) return box;
    const { min, max } = this;
    return new BBox(min.op(box.min, Math.min), max.op(box.max, Math.max));
  }

  union = this.add;

  /**
   * Intersection of boxes
   * @param {*} box
   */
  sub(box) {
    if (this === BBox.EMPTY) return BBox.EMPTY;
    const { min, max } = this;
    const newMin = min.op(box.min, Math.max);
    const newMax = max.op(box.max, Math.min);
    const newDiag = newMax.sub(newMin);
    const isAllPositive = newDiag.data.every((x) => x >= 0);
    return !isAllPositive ? BBox.EMPTY : new BBox(newMin, newMax);
  }

  inter = this.sub;

  move(vector) {
    return new BBox(this.min.add(vector), this.max.add(vector));
  }

  collidesWith(box) {
    const actionByTypes = [
      { type: BBox, action: () => !this.sub(box).isEmpty },
      { type: Matrix, action: () => !this.sub(new BBox(box, box)).isEmpty },
    ];
    for (let i = 0; i < actionByTypes.length; i++) {
      if (box instanceof actionByTypes[i].type) {
        return actionByTypes[i].action();
      }
    }
  }

  equals(box) {
    if (!(box instanceof BBox)) return false;
    if (this == BBox.EMPTY) return true;
    return this.min.equals(box.min) && this.max.equals(box.max);
  }

  static ofPoint(...array) {
    const point = Matrix.vec(...array);
    return new BBox(point, point);
  }
  static EMPTY = new BBox();
}

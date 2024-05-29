export default class Geometry {
    /**
     * Returns bounding box of geometry
     * () => Box
     */
    getBoundingBox() {
        throw Error("Not implemented");
    }

    /**
     * Returns distance from x to the geometry. 
     * Distances could be negative if geometry is closed. 
     * Maybe not applicable to higher dimensions n > 3
     * @param x: Vector(n)
     * @returns Number 
    */
    distanceToPoint(x) {
        throw Error("Not implemented");
    }

    /**
     * Returns normal vector to the geometry at point x
     * @param x: Vector(n)
     * @returns Vector(n), normalized 
     */
    normalToPoint(x) {
        throw Error("Not implemented");
    }

    /**
     * 
     * @param ray: Ray: (Vector(n), Vector(n) normalized)
     * @returns Vector 
    */
    interceptWithRay(ray) {
        throw Error("Not implemented");
    }
}
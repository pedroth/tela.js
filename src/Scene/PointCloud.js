class PointCloud {
    constructor({ name, pointCloud }) {
        this.name = name;
        this.pointCloud = pointCloud
    }

    interceptWith(ray) {
        // TODO;
    }

    getBoundingBox() {
        if (this.boundingBox) return this.boundingBox;
        // TODO
    }

    static builder() {
        return new PointCloudBuilder();
    }
}



class PointCloudBuilder {
    constructor() {
        this._name;
        this._pointCloud = [];
    }

    name(name) {
        this._name = name;
        return this;
    }

    objFile(objString) {
        //TODO
        return this;
    }

    build() {
        const attrs = {
            name: this._name,
            pointCloud: this._pointCloud
        }
        if (Object.values(attrs).some((x) => x === undefined)) {
            throw new Error("Point is incomplete");
        }
        return new PointCloud(attrs);
    }
}

export default PointCloud;
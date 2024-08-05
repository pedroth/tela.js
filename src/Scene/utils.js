import Sphere from "../Geometry/Sphere.js";
import Triangle from "../Geometry/Triangle.js";
import BScene from "./BScene.js";
import KScene from "./KScene.js";
import NaiveScene from "./NaiveScene.js";
import VoxelScene from "./VoxelScene.js";

const SCENE_TYPES = {
    NaiveScene: NaiveScene,
    KScene: KScene,
    BScene: BScene,
    VoxelScene: VoxelScene
}

export function deserializeScene(sceneJson) {
    const { type = KScene.name, sceneData, params = [], artifacts } = sceneJson;
    const SceneClass = SCENE_TYPES[type];
    return new SceneClass(...params)
        .addList(sceneData.map(x => {
            if (x.type === Triangle.name) return Triangle.deserialize(x, artifacts);
            if (x.type === Sphere.name) return Sphere.deserialize(x, artifacts);
        }));
}
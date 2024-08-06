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

export async function deserializeScene(sceneJson) {
    const { type = KScene.name, sceneData, params = [] } = sceneJson;
    const SceneClass = SCENE_TYPES[type];
    const artifacts = {};
    const sceneElements = [];
    for (let i = 0; i < sceneData.length; i++) {
        const serializedElement = sceneData[i];
        if (serializedElement.type === Triangle.name) sceneElements.push(await Triangle.deserialize(serializedElement, artifacts));
        if (serializedElement.type === Sphere.name) sceneElements.push(await Sphere.deserialize(serializedElement, artifacts));
    }
    return new SceneClass(...params)
        .addList(sceneElements);
}
import { IS_NODE } from "../Utils/Constants.js";
const TelaClass = await (async () => {
    return IS_NODE ?
        (await import("./Image.js")).default :
        (await import("./Canvas.js")).default
}
)();

export async function deserialize(telaJson, artifacts) {
    if (!telaJson) return;
    const { url } = telaJson;
    if (!url) return;
    if (url in artifacts) return artifacts[url];
    const tela = await TelaClass.ofUrl(url);
    artifacts[url] = tela;
    return tela;
}
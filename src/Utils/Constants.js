export const MAX_8BIT = 255;
export const CHANNELS = 4;
export const RAD2DEG = 180 / Math.PI;
export const IS_NODE = typeof process !== 'undefined' && Boolean(process.versions && process.versions.node);
export const NUMBER_OF_CORES = IS_NODE ?
    (await import("node:os")).cpus().length :
    navigator.hardwareConcurrency;

export const IS_GITHUB = typeof window !== "undefined" && (window.location.host || window.LOCATION_HOST) === "pedroth.github.io";
export const SOURCE = IS_GITHUB ? "/tela.js" : "";

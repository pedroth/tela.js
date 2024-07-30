export const MAX_8BIT = 255;
export const RAD2DEG = 180 / Math.PI;
export const IS_NODE = typeof window === "undefined";
// let os = undefined;
// if (IS_NODE) os = await import("node:os");

// export const NUMBER_OF_CORES = IS_NODE ?
//     os.cpus().length :
//     navigator.hardwareConcurrency;
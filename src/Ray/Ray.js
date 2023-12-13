export function Ray(init, dir) {
    const ans = {};
    ans.init = init;
    ans.dir = dir;
    ans.trace = t => init.add(dir.scale(t));
    return ans;
}
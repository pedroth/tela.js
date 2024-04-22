export default function Ray(init, dir) {
    const ans = {};
    ans.init = init;
    ans.dir = dir;
    ans.trace = t => init.add(dir.scale(t));
    ans.dirInv = dir.map(x => 1 / x);
    return ans;
}
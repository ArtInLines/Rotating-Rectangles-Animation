const { VectorPrimitive, Vector, Point } = require('./Vectors');

let v = new VectorPrimitive(1, 0);
let u = new VectorPrimitive(0, 1);
let w = new VectorPrimitive(1, 1, 1);

console.assert(v.dim === 2, 'v.dim should be 2 instead of ' + v.dim);
console.assert(u.dim === 2, 'u.dim should be 2 instead of ' + u.dim);
console.assert(w.dim === 3, 'w.dim should be 3 instead of ' + w.dim);
w.dim = 1;
v.dim = 5;
console.assert(v.dim === 5, 'v.dim should be 5 instead of ' + v.dim);
console.assert(w.dim === 1, 'w.dim should be 1 instead of ' + w.dim);

console.assert(v.x === 1 && v.y === 0, 'v.x or v.y is broken. Should be (1|0), but is instead ' + `(${v.x}|${v.y})`);

console.assert(u.getComponent(1) === 1, `u.getComponent(1) should be 1 instead of ${u.getComponent(1)}`);

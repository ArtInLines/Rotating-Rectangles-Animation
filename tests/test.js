const { VectorPrimitive, Vector, Point } = require('./Vectors');

let v, u, w;

///////////////////
// VectorPrimitive
///////////////////

v = new VectorPrimitive(1, 0);
u = new VectorPrimitive(0, 1);
w = new VectorPrimitive(1, 1, 1);

console.assert(v.dim === 2, 'v.dim should be 2 instead of ' + v.dim);
console.assert(u.dim === 2, 'u.dim should be 2 instead of ' + u.dim);
console.assert(w.dim === 3, 'w.dim should be 3 instead of ' + w.dim);
w.dim = 1;
v.dim = 5;
console.assert(v.dim === 5, 'v.dim should be 5 instead of ' + v.dim);
console.assert(w.dim === 1, 'w.dim should be 1 instead of ' + w.dim);

console.assert(v.x === 1 && v.y === 0, 'v.x or v.y is broken. Should be (1|0), but is instead ' + `(${v.x}|${v.y})`);

console.assert(u.getComponent(1) === 1, `u.getComponent(1) should be 1 instead of ${u.getComponent(1)}`);

console.assert(VectorPrimitive.areEqual(v, u) === false, `VectorPrimitive.areEqual(v, u) should be false, but is ${VectorPrimitive.areEqual(v, u)} instead`);

///////////////////
// Point
///////////////////

let p = new Point(5, 10);
let q = new Point(0, 0);

console.log({ p, pCopy: p.copy(), q, qCopy: q.copy() });

///////////////////
// Vector
///////////////////

v = new Vector(1, 0);
u = new Vector(1, 1);
w = new Vector(1, 2, 2);

console.assert(v.length() === 1, 'v.length() should be 1, but is instead ' + v.length());
console.assert(w.length() === 3, `w.length() should be 3, but is instead ${w.length()}`);
console.assert(u.length() === Math.SQRT2, `u.length() should be the sqrt of 2, but is instead ${u.length()} - rounding difference?`);

console.assert(v.normalize().x === 1, `v.normalize() should change nothing about the vector`);
console.assert(w.normalize().length() === 1, `The length of u should be 1 after normalization, instead it is ${u.normalize().length()}`);

console.assert(v.scale(3).x === 3, `v.scale(3) should produce (3|0), but instead produces (${v.scale(3).components.join('|')})`);

console.assert(VectorPrimitive.areEqual(u, u.copy()), `u and its copy should be equal, but they're not apparently.`);

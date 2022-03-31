class VectorPrimitive {
	/** @param {...Number} components */
	constructor(...components) {
		this.components = components;
	}

	get x() {
		return this.components.length > 0 ? this.components[0] : null;
	}
	get y() {
		return this.components.length > 1 ? this.components[1] : null;
	}
	get dim() {
		return this.components.length;
	}
	set x(val) {
		this.components[0] = val;
	}
	set y(val) {
		if (this.components.length > 1) this.components[1] = val;
		else this.components = [this.components[0] || 0, val];
	}
	set dim(val) {
		if (val <= this.components.length) this.components = this.components.slice(0, val);
		else {
			let arr = new Array(val);
			for (let i = 0; i < this.dim; i++) arr[i] = this.components[i];
			for (let i = this.dim; i < val; i++) arr[i] = 0;
			this.components = arr;
		}
	}

	stringify() {
		return '(' + this.components.join(' | ') + ')';
	}

	getComponent(num) {
		return this.components[num];
	}

	static areEqual(...vectorPrimitives) {
		for (let i = 0; i < vectorPrimitives[0].components.length; i++) {
			for (let j = 1; j < vectorPrimitives.length; j++) {
				if (vectorPrimitives[j - 1].components[i] !== vectorPrimitives[j].components[i]) return false;
			}
		}
		return true;
	}
}

class Point extends VectorPrimitive {
	/** @param {...Number} components */
	constructor(...components) {
		super(...components);
	}
	toVector() {
		return new Vector(...this.components);
	}
	copy() {
		return new Point(...this.components);
	}
}

class Vector extends VectorPrimitive {
	/** @param {...Number} components */
	constructor(...components) {
		super(...components);
	}

	toPoint() {
		let p = new Point(...this.components);
		return p;
	}

	copy() {
		let v = new Vector(...this.components);
		return v;
	}

	length() {
		let x = 0;
		this.components.forEach((component) => (x += component ** 2));
		return Math.sqrt(x);
	}

	scale(scalar) {
		this.components = this.components.map((x) => x * scalar);
		return this;
	}

	normalize() {
		return this.scale(1 / this.length());
	}

	normalizeCopy() {
		return this.copy().scale(1 / this.length());
	}

	static emptyVector(dim = 2, fillValue = 0) {
		return new Vector(...new Array(dim).fill(fillValue));
	}

	/** @param  {...Vector} vectors */
	static scalarProduct(...vectors) {
		if (vectors.length < 2) return null;

		let len = vectors.reduce((v, u) => (v.dim <= u.dim ? v : u)).dim;
		let res = new Array(len).fill(1);
		for (let i = 0; i < len; i++) {
			for (let j = 0; j < vectors.length; j++) res[i] *= vectors[j].getComponent(i);
		}

		return res.reduce((a, b) => a + b);
	}

	// TODO
	static crossProduct(...vectors) {
		return null;
	}

	/** @param {...Vector} vectors */
	static add(...vectors) {
		if (vectors.length < 2) {
			if (vectors.length < 1) return vectors[0];
			return null;
		}
		for (let i = 1; i < vectors.length; i++) {
			if (vectors[i - 1].dim !== vectors[i].dim) return null;
		}

		let res = Vector.emptyVector(vectors[0].dim, 0);
		for (let i = 0; i < res.dim; i++) {
			for (let j = 0; j < vectors.length; j++) res.components[i] += vectors[j].components[i];
		}

		return res;
	}

	/**
	 * Get the Vector between to Points (going from Point A to Point B)
	 * @param {Point} A
	 * @param {Point} B
	 * @returns {Vector}
	 */
	static PointToPoint(A, B) {
		return new Vector(...A.components.map((a, i) => a - B.components[i]));
	}
}

module.exports = { VectorPrimitive, Vector, Point };

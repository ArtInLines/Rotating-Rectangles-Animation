export class VectorPrimitive {
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

export class Point extends VectorPrimitive {
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

export class Vector extends VectorPrimitive {
	/** @param {...Number} components */
	constructor(...components) {
		super(...components);
	}

	toPoint() {
		let p = new Point(...this.components);
		return p;
	}

	copy() {
		let v = Vector.emptyVector(this.components.length);
		for (let i = 0; i < v.dim; i++) v.components[i] = this.components[i];
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

	scaleCopy(scalar) {
		return this.copy().scale(scalar);
	}

	normalize() {
		return this.scale(1 / this.length());
	}

	normalizeCopy() {
		return this.scaleCopy(1 / this.length());
	}

	add(...vectors) {
		const v = Vector.add(this, ...vectors);
		if (!v) return null;
		this.components = v.components;
		return this;
	}

	addCopy(...vectors) {
		return Vector.add(this, ...vectors);
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
	 * @param {Boolean} startFromA Indicates whether the resulting vector should be situated at A or at the null vector.
	 * @returns {Vector}
	 */
	static PointToPoint(A, B, startFromA = true) {
		const v = Vector.emptyVector(A.dim);
		for (let i = 0; i < v.dim; i++) v.components[i] = B.components[i] - A.components[i];
		if (startFromA) return Vector.add(A, v);
		else return v;
	}
}

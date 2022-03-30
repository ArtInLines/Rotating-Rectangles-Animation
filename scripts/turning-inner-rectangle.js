const rootEl = document.getElementById('input-container');
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

///////////
// Classes

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

	getComponent(num) {
		return this.components[num];
	}
}

class Point extends VectorPrimitive {
	/** @param {...Number} components */
	constructor(...components) {
		super(components);
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
		super(components);
	}

	toPoint() {
		let p = new Point(...this.components);
		console.log(...this.components);
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

///////////
// Methods

function createSlider({ label, id = label, value = 50, min = 1, max = 100, step = 1, onChange = null, parent = rootEl }) {
	const containerEl = document.createElement('div');
	const labelEl = document.createElement('label');
	const sliderEl = document.createElement('input');
	const valEl = document.createElement('input');

	labelEl.setAttribute('for', id);
	labelEl.setAttribute('name', id + '-label');
	labelEl.textContent = label;
	labelEl.classList.add('label');
	labelEl.classList.add('slider-label');

	valEl.name = id + '-text';
	valEl.type = 'text';
	valEl.value = value;
	valEl.classList.add('slider-value-text');

	sliderEl.name = id;
	sliderEl.type = 'range';
	sliderEl.min = min;
	sliderEl.max = max;
	sliderEl.step = step;
	sliderEl.value = value;
	sliderEl.classList.add('slider');

	sliderEl.addEventListener('change', () => {
		valEl.value = sliderEl.value;
		if (typeof onChange == 'function') onChange(Number(sliderEl.value), sliderEl, containerEl);
	});

	valEl.addEventListener('change', () => {
		sliderEl.value = valEl.value;
		if (typeof onChange == 'function') onChange(Number(sliderEl.value), sliderEl, containerEl);
	});

	containerEl.classList.add('slider-container');
	containerEl.insertAdjacentElement('beforeend', labelEl);
	containerEl.insertAdjacentElement('beforeend', sliderEl);
	containerEl.insertAdjacentElement('beforeend', valEl);
	parent.insertAdjacentElement('beforeend', containerEl);
}

function angleToRadians(angle) {
	return (angle * Math.PI) / 180;
}

function radiansToAngle(radians) {
	return (radians * 180) / Math.PI;
}

function f(length, radians) {
	return Math.sqrt((Math.sin(radians) ** 2 * length ** 2) / (1 - Math.sin(radians) ** 2));
}

/**
 * Returns a Point on the line between A and B based on the size of the angle
 * @param {Point} A
 * @param {Point} B
 * @param {Number} angle
 * @returns {Point}
 */
function getPointOnLine(A, B, angle, denominator = 45) {
	const AB = Vector.PointToPoint(A, B);
	console.log(A, B, AB);
	AB.scale(angle % denominator);
	return AB.toPoint();
}

/**
 * Animate a rectangle based on its points, rather than its lengths, allowing to draw rotated rectangles
 * @param {Point} A
 * @param {Point} B
 * @param {Point} C
 * @param {Point} D
 * @param {CanvasRenderingContext2D} context
 */
function drawRect(A, B, C, D, context = ctx) {
	context.beginPath();
	context.moveTo(A.x, A.y);
	context.lineTo(B.x, B.y);
	context.lineTo(C.x, C.y);
	context.lineTo(D.x, D.y);
	context.lineTo(A.x, A.y);
	context.closePath();

	context.stroke();
}

function animate({ topCorner, outerWidth, outerHeight, interval, angleIncreasePerFrame, innerRectAmount, context = ctx }) {
	let alpha = 0;
	const lastRect = { A: null, B: null, C: null, D: null };
	const currentRect = { A: null, B: null, C: null, D: null };

	return setInterval(() => {
		alpha += angleIncreasePerFrame;
		alpha = alpha % 45;

		context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clear whole canvas
		context.strokeRect(topCorner.x, topCorner.y, outerWidth, outerHeight); // Draw outer Rectangle

		lastRect.A = topCorner.copy();
		lastRect.B = new Point(topCorner.x + outerWidth, topCorner.y);
		lastRect.C = new Point(topCorner.x + outerWidth, topCorner.y + outerHeight);
		lastRect.D = new Point(topCorner.x, topCorner.y + outerHeight);

		console.log({ lastRect, topCorner });

		for (let i = 0; i < innerRectAmount; i++) {
			currentRect.A = getPointOnLine(lastRect.A, lastRect.B, alpha, 45);
			currentRect.B = getPointOnLine(lastRect.B, lastRect.C, alpha, 45);
			currentRect.C = getPointOnLine(lastRect.B, lastRect.D, alpha, 45);
			currentRect.D = getPointOnLine(lastRect.D, lastRect.A, alpha, 45);

			drawRect(currentRect.A, currentRect.B, currentRect.C, currentRect.D, context);

			lastRect.A = currentRect.A;
			lastRect.B = currentRect.B;
			lastRect.C = currentRect.C;
			lastRect.D = currentRect.D;
		}
	}, interval);
}

function intervalToFPS(ms) {
	return 1000 / ms;
}

function FPSToInterval(fps) {
	return 1000 / fps;
}

function resize({ width, height, animID, topCorner, interval, angleIncreasePerFrame, innerRectAmount, widthFactor = 1, heightFactor = 1, context = ctx }) {
	console.log('Resizing');
	if (widthFactor) {
		width = context.canvas.width * widthFactor;
		topCorner.x = context.canvas.width / 2 - width / 2;
	}
	if (heightFactor) {
		height = context.canvas.height * heightFactor;
		topCorner.y = context.canvas.height / 2 - height / 2;
	}

	if (animID) clearInterval(animID);
	return animate({
		topCorner,
		outerHeight: height,
		outerWidth: width,
		interval,
		angleIncreasePerFrame,
		innerRectAmount,
		context,
	});
}

///////////
// Global Variables & DOM Manipulation

ctx.lineWidth = 1;
ctx.strokeStyle = '#000';

const opts = { topCorner: new Point(0, 0), width: ctx.canvas.width, height: ctx.canvas.height, animID: null, interval: 10000, angleIncreasePerFrame: 0.5, innerRectAmount: 1, context: ctx };

window.addEventListener('resize', () => (animationID = resize(opts)));
animationID = resize(opts);

createSlider({ label: 'Width:', value: opts.width, min: 1, max: ctx.canvas.width, onChange: (v) => resize({ ...opts, widthFactor: v / 100 }) });
createSlider({ label: 'Height:', value: opts.height, min: 1, max: ctx.canvas.height, onChange: (v) => resize({ ...opts, heightFactor: v / 100 }) });
createSlider({ label: 'Line Width:', value: ctx.lineWidth, min: 1, max: 10, onChange: (v) => (ctx.lineWidth = v) });
createSlider({
	label: 'Angle Increase per Frame:',
	value: opts.angleIncreasePerFrame,
	min: 0.1,
	max: 10,
	step: 0.1,
	onChange: (v) => {
		opts.angleIncreasePerFrame = v;
		resize(opts);
	},
});
createSlider({
	label: 'Interval Length (ms):',
	value: opts.interval,
	min: 1,
	max: 300,
	step: 1,
	onChange: (v) => {
		opts.interval = v;
		resize(opts);
	},
});
createSlider({
	label: 'Inner Rectangles Amount',
	value: opts.innerRectAmount,
	min: 1,
	max: 15,
	onChange: (v) => {
		opts.innerRectAmount = v;
		resize(opts);
	},
});

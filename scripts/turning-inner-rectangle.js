const canvasContainer = document.getElementById('canvas-container');
const sliderContainer = document.getElementById('input-container');
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

///////////
// Methods

function createSlider({ label, id = label, value = 50, min = 1, max = 100, step = 1, onChange = null, parent = sliderContainer }) {
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
	const AB = Vector.PointToPoint(A, B, false);
	// console.log({ A: A.stringify(), B: B.stringify(), AB: AB.stringify() });
	const P = AB.scaleCopy(angle / denominator)
		.add(A)
		.toPoint();
	// console.log({ P: P.stringify() });
	return P;
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

function clearCanvas(context) {
	context.clearRect(0, 0, context.canvas.width, context.canvas.height);
}

function animate({ topCorner, outerWidth, outerHeight, interval, angleIncreasePerFrame, innerRectAmount, elForProgress, imgEl, context = ctx }) {
	// Documentation for GIF.js library:
	// https://github.com/jnordberg/gif.js
	if (!(animate.gif instanceof GIF)) {
		animate.gif = new GIF({
			repeat: 0, // repeat count, -1 = no repeat, 0 = forever
			quality: 10, // pixel sample interval, lower is better
			workers: 2, // number of web workers to spawn
			background: '#fff', // background color where source image is transparent
			width: topCorner.x + outerWidth, // output image width, null means first frame determines width
			height: topCorner.y + outerHeight, // output image height, null means first frame determines height
			workerScript: '/public/gif.js/gif.worker.js',
			dither: 'FloydSteinberg-serpentine', // dithering method. See full docs for all options
			debug: true,
			transparent: '#000',
		});
	} else {
		animate.gif.abort();
	}
	animate.rendering = false;
	imgEl.src = '';

	let alpha = 0;
	const lastRect = { A: null, B: null, C: null, D: null };
	const currentRect = { A: null, B: null, C: null, D: null };

	const id = setInterval(() => {
		alpha += angleIncreasePerFrame;
		if (!animate.rendering && alpha >= 45) {
			animate.gif.render();
			animate.rendering = true;
		}
		alpha = alpha % 45;

		clearCanvas(context);
		context.strokeRect(topCorner.x, topCorner.y, outerWidth, outerHeight); // Draw outer Rectangle

		lastRect.A = topCorner.copy();
		lastRect.B = new Point(topCorner.x + outerWidth, topCorner.y);
		lastRect.C = new Point(topCorner.x + outerWidth, topCorner.y + outerHeight);
		lastRect.D = new Point(topCorner.x, topCorner.y + outerHeight);

		// console.log({ A: lastRect.A.stringify(), B: lastRect.B.stringify(), C: lastRect.C.stringify(), D: lastRect.D.stringify() });

		for (let i = 0; i < innerRectAmount; i++) {
			currentRect.A = getPointOnLine(lastRect.A, lastRect.B, alpha, 45);
			currentRect.B = getPointOnLine(lastRect.B, lastRect.C, alpha, 45);
			currentRect.C = getPointOnLine(lastRect.C, lastRect.D, alpha, 45);
			currentRect.D = getPointOnLine(lastRect.D, lastRect.A, alpha, 45);

			// console.log({ A: currentRect.A.stringify(), B: currentRect.B.stringify(), C: currentRect.C.stringify(), D: currentRect.D.stringify() });

			drawRect(currentRect.A, currentRect.B, currentRect.C, currentRect.D, context);

			lastRect.A = currentRect.A;
			lastRect.B = currentRect.B;
			lastRect.C = currentRect.C;
			lastRect.D = currentRect.D;
		}

		animate.gif.addFrame(ctx, { copy: true, delay: interval });
	}, Math.min(interval, 100));

	animate.gif.on('abort', () => {
		elForProgress.innerText = `Gif was aborted.`;
	});

	animate.gif.on('progress', (percentage) => {
		elForProgress.innerText = `${Math.round(percentage)}% of the Gif is created!`;
	});

	animate.gif.on('finished', (blob) => {
		clearInterval(id);
		clearCanvas(context);
		elForProgress.innerText = 'Gif done!';

		let formd = new FormData();
		let fname = 'Rotating Rectangles.gif';
		formd.append('file', blob, fname);

		fetch('/save-file', {
			method: 'POST',
			body: formd,
		})
			.then((res) => res.json())
			.then((res) => {
				console.log(res);
				imgEl.src = '/img/' + fname;
				imgEl.display = 'block';
			});
	});

	return id;
}

function intervalToFPS(ms) {
	return 1000 / ms;
}

function FPSToInterval(fps) {
	return 1000 / fps;
}

function resize({ width, height, animID, topCorner, interval, angleIncreasePerFrame, innerRectAmount, widthFactor = 1, heightFactor = 1, elForProgress, imgEl, context = ctx }) {
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
		elForProgress,
		imgEl,
	});
}

///////////
// Global Variables & DOM Manipulation

const paragraphEl = document.createElement('p');
paragraphEl.classList.add('feedback-text', 'text');
sliderContainer.insertAdjacentElement('beforeend', paragraphEl);

const imageEl = document.createElement('img');
imageEl.classList.add('gif-player');
canvasContainer.insertAdjacentElement('beforeend', imageEl);

ctx.lineWidth = 1;
ctx.strokeStyle = '#000';

const opts = {
	topCorner: new Point(0, 0),
	width: ctx.canvas.width,
	height: ctx.canvas.height,
	animID: null,
	interval: 1000,
	angleIncreasePerFrame: 10,
	innerRectAmount: 1,
	elForProgress: paragraphEl,
	imgEl: imageEl,
	context: ctx,
};

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

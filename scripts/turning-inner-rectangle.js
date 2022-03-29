const rootEl = document.getElementById('input-container');
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

class Point {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
}

ctx.lineWidth = 1;
ctx.strokeStyle = '#000';

let animationOpts = { interval: 10, radiusIncreasePerFrame: 0.5 };
let animationID = null;
let height = ctx.canvas.height;
let width = ctx.canvas.height;
let topCorner = new Point(0, 0);

// function createInputEl({ label, id = label, value, onChange = null, changeInputEl = null, classPrefix = "input"}) {
// 	const containerEl = document.createElement('div');
// 	const labelEl = document.createElement('label');
// 	const sliderEl = document.createElement('input');
// 	const valEl = document.createElement('p');

// 	containerEl.classList.add('slider-container');
// 	containerEl.insertAdjacentElement('beforeend', labelEl);
// 	containerEl.insertAdjacentElement('beforeend', sliderEl);
// 	containerEl.insertAdjacentElement('beforeend', valEl);

// 	labelEl.setAttribute('for', label);
// 	labelEl.textContent = label;
// 	labelEl.classList.add('label');
// 	labelEl.classList.add('slider-label');

// 	sliderEl.name = label;
// 	sliderEl.type = 'range';
// 	sliderEl.min = min;
// 	sliderEl.max = max;
// 	sliderEl.step = step;
// 	sliderEl.classList.add('slider');

// 	sliderEl.addEventListener('change', () => {
// 		valEl.textContent = sliderEl.value;
// 		if (typeof onChange == 'function') onChange(sliderEl.value, sliderEl, containerEl);
// 	});

// 	valEl.textContent = value;
// 	valEl.classList.add('slider-val');

// 	return containerEl;
// }

function createSlider({ label, id = label, value = 50, min = 1, max = 100, step = 1, onChange = null, parent = rootEl }) {
	const containerEl = document.createElement('div');
	const labelEl = document.createElement('label');
	const sliderEl = document.createElement('input');
	const valEl = document.createElement('input');

	labelEl.setAttribute('for', label);
	labelEl.textContent = label;
	labelEl.classList.add('label');
	labelEl.classList.add('slider-label');

	valEl.name = label + '-text';
	valEl.type = 'text';
	valEl.value = value;
	valEl.classList.add('slider-value-text');

	sliderEl.name = label;
	sliderEl.type = 'range';
	sliderEl.min = min;
	sliderEl.max = max;
	sliderEl.step = step;
	sliderEl.value = value;
	sliderEl.classList.add('slider');

	sliderEl.addEventListener('change', () => {
		valEl.value = sliderEl.value;
		sliderEl.value = Number(sliderEl.value);
		if (typeof onChange == 'function') onChange(sliderEl.value, sliderEl, containerEl);
	});

	valEl.addEventListener('change', () => {
		sliderEl.value = valEl.value;
		sliderEl.value = Number(sliderEl.value);
		if (typeof onChange == 'function') onChange(sliderEl.value, sliderEl, containerEl);
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

function f(length, radians) {
	return Math.sqrt((Math.sin(radians) ** 2 * length ** 2) / (1 - Math.sin(radians) ** 2));
}

function animate({ interval = 10, radiusIncreasePerFrame = 0.5 }) {
	console.log({ interval, radiusIncreasePerFrame });
	let alpha = 0,
		alphaRadians,
		horizontalDistance,
		verticalDistance;

	return setInterval(() => {
		alpha = (alpha + radiusIncreasePerFrame) % 45;
		alphaRadians = angleToRadians(alpha);

		horizontalDistance = f(width, alphaRadians);
		verticalDistance = f(height, alphaRadians);

		// Clear Canvas & draw outer rectangle
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		ctx.strokeRect(topCorner.x, topCorner.y, width, height);

		ctx.moveTo(topCorner.x + horizontalDistance, topCorner.y);
		ctx.beginPath();
		ctx.lineTo(topCorner.x + width, topCorner.y + verticalDistance);
		ctx.lineTo(topCorner.x + width - horizontalDistance, topCorner.y + height);
		ctx.lineTo(topCorner.x, topCorner.y + height - verticalDistance);
		ctx.lineTo(topCorner.x + horizontalDistance, topCorner.y);
		ctx.closePath();
		ctx.stroke();
	}, interval);
}

function intervalToFPS(ms) {
	return 1000 / ms;
}

function FPSToInterval(fps) {
	return 1000 / fps;
}

/**
 * @param {Object} o
 * @param {Number} o.x Only decimal numbers
 * @param {Number} o.y Only decimal numbers
 */
function resize(widthFactor = null, heightFactor = null) {
	if (widthFactor) {
		width = ctx.canvas.width * widthFactor;
		topCorner.x = ctx.canvas.width / 2 - width / 2;
	}
	if (heightFactor) {
		height = ctx.canvas.height * heightFactor;
		topCorner.y = ctx.canvas.height / 2 - height / 2;
	}

	if (animationID) clearInterval(animationID);
	animationID = animate(animationOpts);
}

window.addEventListener('resize', resize);
resize(1, 1);

createSlider({ label: 'Width:', value: width, min: 1, max: ctx.canvas.width, onChange: (v) => resize(v / ctx.canvas.width) });
createSlider({ label: 'Height:', value: height, min: 1, max: ctx.canvas.height, onChange: (v) => resize(null, v / ctx.canvas.height) });
createSlider({ label: 'Line Width:', value: ctx.lineWidth, min: 1, max: 10, onChange: (v) => (ctx.lineWidth = v) });
createSlider({
	label: 'Angle Increase per Frame:',
	value: animationOpts.radiusIncreasePerFrame,
	min: 0.1,
	max: 10,
	step: 0.1,
	onChange: (v) => {
		animationOpts.radiusIncreasePerFrame = Number(v);
		resize();
	},
});
createSlider({
	label: 'Interval Length (ms):',
	value: animationOpts.interval,
	min: 1,
	max: 300,
	step: 1,
	onChange: (v) => {
		animationOpts.interval = Number(v);
		resize();
	},
});

// animationID = animate(animationOpts);

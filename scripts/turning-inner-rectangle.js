import setCanvasSize from '/public/scripts/set-canvas-size.js';
import { VectorPrimitive, Point, Vector } from '/public/scripts/vector.js';

const canvasContainer = document.getElementById('canvas-container');
const sliderContainer = document.getElementById('input-container');
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

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
	containerEl.appendChild(labelEl);
	containerEl.appendChild(sliderEl);
	containerEl.appendChild(valEl);
	parent.appendChild(containerEl);
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

function animate({ topCorner, width, height, interval, angleIncreasePerFrame, innerRectAmount, elForProgress, innerAngleFactor, makeGif, imgEl, disabledEls, context = ctx }) {
	// Documentation for GIF.js library:
	// https://github.com/jnordberg/gif.js
	if (animate.gif instanceof GIF) {
		animate.gif.abort();
		// animate.gif.freeWorkers.forEach((w) => w.terminate());
		// animate.gif.frames = [];
		delete animate.gif;
	}

	if (animate.intervalID) clearInterval(animate.intervalID);

	const defaultText = `Creating frames for Gif...`;
	disabledEls.forEach((el) => (el.disabled = true));
	context.canvas.style.display = 'block';
	imgEl.src = '';

	if (makeGif) {
		elForProgress.innerText = defaultText;
		clearCanvas(context);
		animate.gif = new GIF({
			repeat: 0, // repeat count, -1 = no repeat, 0 = forever
			quality: 10, // pixel sample interval, lower is better
			workers: 2, // number of web workers to spawn
			background: '#000', // background color where source image is transparent
			width: context.canvas.width, // output image width, null means first frame determines width
			height: context.canvas.height, // output image height, null means first frame determines height
			workerScript: '/public/gif.js/gif.worker.js',
			dither: false, // dithering method. See full docs for all options
			debug: false,
			transparent: null,
		});
	}

	let innerAngles = new Array(innerRectAmount).fill(0);
	const rectPoints = ['A', 'B', 'C', 'D'];
	const lastRect = { A: null, B: null, C: null, D: null };
	const currentRect = { A: null, B: null, C: null, D: null };

	animate.intervalID = setInterval(() => {
		clearCanvas(context);
		context.fillStyle = '#fff';
		context.fillRect(0, 0, canvas.width, canvas.height); // Fill background - see https://github.com/jnordberg/gif.js/issues/121
		context.strokeRect(topCorner.x, topCorner.y, width, height); // Draw outer Rectangle

		lastRect.A = topCorner.copy();
		lastRect.B = new Point(topCorner.x + width, topCorner.y);
		lastRect.C = new Point(topCorner.x + width, topCorner.y + height);
		lastRect.D = new Point(topCorner.x, topCorner.y + height);

		innerAngles[0] += angleIncreasePerFrame;

		if (makeGif && !animate.rendering && innerAngles[0] >= 45) {
			animate.gif.render();
			animate.rendering = true;
		}

		for (let i = 0; i < innerRectAmount; i++) {
			if (i) innerAngles[i] = (innerAngles[i - 1] + angleIncreasePerFrame) * innerAngleFactor;
			if (innerAngles[i] >= 45) {
				let tmp = currentRect[rectPoints[0]];
				for (let k = 0; k < rectPoints.length - 1; k++) currentRect[rectPoints[k]] = currentRect[rectPoints[k + 1]];
				currentRect[rectPoints[rectPoints.length]] = tmp;
			}
			innerAngles[i] %= 45;

			for (let k = 0; k < rectPoints.length; k++) {
				const point = rectPoints[k];
				// Set new values for currentRect
				currentRect[point] = getPointOnLine(lastRect[point], lastRect[rectPoints[(k + 1) % rectPoints.length]], innerAngles[i], 45);
			}

			// Draw current rect
			drawRect(currentRect.A, currentRect.B, currentRect.C, currentRect.D, context);
			// Set current rect as last Rect
			for (let k = 0; k < rectPoints.length; k++) {
				const point = rectPoints[k];
				lastRect[point] = currentRect[point];
			}
		}

		if (makeGif && !animate.rendering) animate.gif.addFrame(ctx, { copy: true, delay: Math.max(interval, 20) });
	}, interval);

	if (makeGif) {
		animate.gif.on('abort', () => {
			clearInterval(animate.intervalID);
			// elForProgress.innerText = defaultText;
			animate.rendering = false;
		});

		animate.gif.on('progress', (percentage) => {
			elForProgress.innerText = `${Math.round(percentage * 100)}% of the Gif is rendered!`;
		});

		animate.gif.on('finished', (blob) => {
			clearInterval(animate.intervalID);
			clearCanvas(context);
			elForProgress.innerText = 'Gif done!';

			let formd = new FormData();
			let fname = 'Rotating Rectangles.gif';
			formd.append('file', blob, fname);

			fetch('/save', {
				method: 'POST',
				body: formd,
			})
				.then((res) => res.json())
				.then((res) => {
					console.log(res);
					imgEl.src = res.fpath;
					disabledEls.forEach((el) => {
						el.disabled = false;
						el.setAttribute('data-gifname', res.fname);
					});
					imgEl.display = 'block';
					context.canvas.style.display = 'none';
				});
		});
	}

	return animate.intervalID;
}

function intervalToFPS(ms) {
	return 1000 / ms;
}

function FPSToInterval(fps) {
	return 1000 / fps;
}

function resize(opts) {
	console.log('Resizing');
	if (!opts.widthFactor) opts.widthFactor = 1;
	opts.width = opts.context.canvas.width * opts.widthFactor;
	opts.topCorner.x = opts.context.canvas.width / 2 - opts.width / 2;

	if (!opts.heightFactor) opts.heightFactor = 1;
	opts.height = opts.context.canvas.height * opts.heightFactor;
	opts.topCorner.y = opts.context.canvas.height / 2 - opts.height / 2;

	return animate(opts);
}

///////////
// Global Variables & DOM Manipulation

let opts;

const imageEl = document.createElement('img');
imageEl.classList.add('gif-player');

const optionsHeader = document.createElement('h3');
optionsHeader.innerText = 'Options:';
optionsHeader.classList.add('header');

const paragraphEl = document.createElement('p');
paragraphEl.classList.add('feedback-text', 'text');
const defaultTextForNoGif = 'If you want to make a Gif, check the "Make a Gif" checkbox.';
paragraphEl.innerText = defaultTextForNoGif;

const makeGifCheckboxContainer = document.createElement('div');
const makeGifCheckbox = document.createElement('input');
const makeGifCheckboxLabel = document.createElement('label');
makeGifCheckboxLabel.innerText = 'Make a Gif?';
makeGifCheckbox.type = 'checkbox';
makeGifCheckbox.checked = false;
makeGifCheckbox.addEventListener('change', () => {
	const checked = makeGifCheckbox.checked;
	if (!checked) paragraphEl.innerText = defaultTextForNoGif;
	console.log(paragraphEl.innerText);
	opts.makeGif = checked;
	animate(opts);
});
makeGifCheckboxContainer.appendChild(makeGifCheckboxLabel);
makeGifCheckboxContainer.appendChild(makeGifCheckbox);

const downloadBtn = document.createElement('button');
downloadBtn.innerText = 'Download Gif';
downloadBtn.disabled = true;
downloadBtn.classList.add('btn');
const downloadBtnAnchor = document.createElement('a');
downloadBtn.appendChild(downloadBtnAnchor);
downloadBtn.addEventListener('click', () => {
	const gifname = downloadBtn.getAttribute('data-gifname');
	downloadBtnAnchor.href = '/save/' + gifname;
	downloadBtnAnchor.download = gifname;
	downloadBtnAnchor.click();
});

const resetBtn = document.createElement('button');
resetBtn.innerText = 'Reset Options';
resetBtn.classList.add('btn');
resetBtn.addEventListener('click', resetDefaultOpts);

ctx.lineWidth = 1;
ctx.strokeStyle = '#000';
ctx.fillStyle = '#fff';

const getDefaultOpts = (context = ctx) => {
	return {
		topCorner: new Point(0, 0),
		width: context.canvas.width,
		height: context.canvas.height,
		widthFactor: 1,
		heightFactor: 1,
		animID: null,
		interval: 10,
		angleIncreasePerFrame: 0.5,
		innerAngleFactor: 1,
		innerRectAmount: 3,
		makeGif: false,
		elForProgress: paragraphEl,
		imgEl: imageEl,
		disabledEls: [downloadBtn],
		context: context,
	};
};
opts = getDefaultOpts(ctx);

function resetDefaultOpts() {
	opts = getDefaultOpts(ctx);
	animate(opts);
}

window.addEventListener('resize', () => {
	setCanvasSize();
	resize(opts);
});

canvasContainer.appendChild(imageEl);

sliderContainer.appendChild(optionsHeader);
sliderContainer.appendChild(paragraphEl);
sliderContainer.appendChild(makeGifCheckboxContainer);

// createSlider({ label: 'Width:', value: opts.width, min: 1, max: ctx.canvas.width, onChange: (v) => resize({ ...opts, widthFactor: v / 100 }) });
// createSlider({ label: 'Height:', value: opts.height, min: 1, max: ctx.canvas.height, onChange: (v) => resize({ ...opts, heightFactor: v / 100 }) });
createSlider({
	label: 'Line Width:',
	value: ctx.lineWidth,
	min: 1,
	max: 10,
	onChange: (v) => {
		ctx.lineWidth = v;
		animate(opts);
	},
	parent: sliderContainer,
});
createSlider({
	label: 'Angle Increase per Frame:',
	value: opts.angleIncreasePerFrame,
	min: 0.1,
	max: 2,
	step: 0.01,
	onChange: (v) => {
		opts.angleIncreasePerFrame = v;
		animate(opts);
	},
	parent: sliderContainer,
});
createSlider({
	label: 'Inner Angle Increase Factor:',
	value: opts.innerAngleFactor,
	min: 0.1,
	max: 2,
	step: 0.01,
	onChange: (v) => {
		opts.innerAngleFactor = v;
		animate(opts);
	},
	parent: sliderContainer,
});
createSlider({
	label: 'Interval Length (ms):',
	value: opts.interval,
	min: 10, // Gif can't play faster than this for whatever reason
	max: 100,
	onChange: (v) => {
		opts.interval = v;
		animate(opts);
	},
	parent: sliderContainer,
});
createSlider({
	label: 'Inner Rectangles Amount',
	value: opts.innerRectAmount,
	min: 1,
	max: 30,
	onChange: (v) => {
		opts.innerRectAmount = v;
		animate(opts);
	},
	parent: sliderContainer,
});

sliderContainer.appendChild(downloadBtn);
sliderContainer.appendChild(resetBtn);

animate(opts);

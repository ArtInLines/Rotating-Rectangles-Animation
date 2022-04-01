const canvases = document.querySelectorAll('canvas');

function setSize() {
	canvases.forEach((c) => {
		c.width = (window.innerWidth * 2) / 3;
		c.height = window.innerHeight - 20;
	});
}

window.addEventListener('resize', setSize);

setSize();

const canvases = document.querySelectorAll('canvas');

function setSize() {
	canvases.forEach((c) => {
		c.width = (window.innerWidth * 2) / 3;
		c.height = window.innerHeight - 20;
	});
	console.log('Set Canvas Size');
}

window.addEventListener('resize', setSize);

setSize();

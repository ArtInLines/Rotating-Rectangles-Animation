const canvases = document.querySelectorAll('canvas');

export default function setSize() {
	canvases.forEach((c) => {
		c.width = (window.innerWidth * 2) / 3;
		c.height = window.innerHeight - 20;
	});
	console.log('Set Canvas Size');
}

setSize();

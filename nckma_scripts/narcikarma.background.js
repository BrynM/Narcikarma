// background.js
if (typeof(nckma) != 'object') {
	var nckma = {};
	var nkBgScrs = [];

	nckma._bgTask = true;
} else {
	throw('background.js needs to load before narcikarma.js!!!');
}

window.open('chrome-extension://icceijjenpflpdbbdndflpomakbkpdgi/nckma_html/popup.html');
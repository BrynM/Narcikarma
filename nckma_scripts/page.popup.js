/*!
* page.popup.js
*/

var bgP = chrome.extension.getBackgroundPage();
var nckma = bgP.nckma;
var bpmv = bgP.bpmv;
var _ = bgP._;

function populate () {
	nckma.pages.populate_stats(window);
}

/*
* startup cb
*/

$(function () {
	nckma.pages.bind_btns(window);
	populate();
	nckma.ev('parse', populate);
});

$(window).on('beforeunload', function () {
	nckma.ev_kill('parse', populate);
});
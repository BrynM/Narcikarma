var bgP = chrome.extension.getBackgroundPage();

$(document).ready( function () {
	nckma.opts.init();
	nckma.opts.restore();
	$('#nckma_save').click( nckma.opts.save );
	$('#nckma_default').click( nckma.opts.defaults );
});

var bgP = chrome.extension.getBackgroundPage();

$(document).ready( function () {
	nckma.opts.init();
	nckma.opts.restore();
	$('input,select').change( nckma.opts.change );
	$('#nckma_reset').click( nckma.opts.restore );
	$('#nckma_save').click( nckma.opts.save );
	$('#nckma_default').click( nckma.opts.defaults );
	$('input[type="color"][id^="picker_opt_color_"],input[type="range"][id^="alpha_opt_color_"]').change( nckma.opts.change_color )
});

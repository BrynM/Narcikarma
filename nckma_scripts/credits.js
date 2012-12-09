var bgP = chrome.extension.getBackgroundPage();

$(document).ready( function () {
	$('.nckContent').append( nckma.credits.to_html() );
});

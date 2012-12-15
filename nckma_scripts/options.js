var bgP = chrome.extension.getBackgroundPage();

function reset_stats () {
	if ( confirm( 'Reset starting stats?\n\n(This will erase all karma gains and\nlosses until the next polling period and your history.)') ) {
		nckma.track( 'func', 'reset_stats', 'nkExec' );
		bgP.nckma.reset( true );
		window.close();
	}
}

function go_to_subreddit () {
	window.open( 'http://www.reddit.com/r/Narcikarma/' );
	nckma.track( 'func', 'go_to_subreddit', 'nkExec' );
}

function go_to_source () {
	window.open( 'https://github.com/BrynM/Narcikarma' );
	nckma.track( 'func', 'go_to_source', 'nkExec' );
}

function go_to_cws () {
	window.open( 'https://chrome.google.com/webstore/detail/narcikarma/mogaeafejjipmngijfhdjkmjomgdicdg' );
	nckma.track( 'func', 'go_to_cws', 'nkExec' );
}

$(document).ready( function () {
	nckma.opts.init();
	nckma.opts.restore();
	$('input,select').change( nckma.opts.change );
	$('#nckma_reset').click( nckma.opts.restore );
	$('#nckma_save').click( nckma.opts.save );
	$('#nckma_default').click( nckma.opts.defaults );
	$('#nck_btn_reset').click( reset_stats );
	$('input[type="color"][id^="picker_opt_color_"],input[type="range"][id^="alpha_opt_color_"]').change( nckma.opts.change_color );
	$('#nck_pop_btn_credits').click( function () { window.open( '/nckma_html/credits.html' ); } );
	$('#nck_pop_btn_subreddit').click( go_to_subreddit );
	$('#nck_pop_btn_source').click( go_to_source );
	$('#nck_pop_btn_cws').click( go_to_cws );

	/* simple tab links */
	$('.tab-contents a').click( function ( ev ) {
		var hash = ev.currentTarget.href.replace( /(^.*#|\?.*$)/, '' )
			, jE = $('#'+hash);
		if ( bpmv.obj(jE) && bpmv.num(jE.length) ) {
			jE.attr( 'checked', 'checked' );
		}
	} );

});

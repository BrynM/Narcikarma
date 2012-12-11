var last = [];
function print_the_bugger () {
	var pr = '';
	if ( bpmv.arr(last) ) {
		pr = last.shift();
		if ( bpmv.arr(pr) && ( pr.length == 3 ) ) {
			nckma.px.draw_line( pr[0], pr[1], nckma.px.color( pr[2] ) );
			setTimeout( print_the_bugger, 100 );
		}
	} else {
		$('#run_test').removeAttr( 'disabled' );
	}
}

function nk_test () {
	var tStr = []
		, lets = bpmv.keys( nckma.px.chars() )
		, set = nckma.px.color_set();
	for ( var i = 0; i < set.length; i++ ) {
		tStr = [];
		for ( var aL = 0; aL < lets.length; aL++ ) {
			tStr.push( lets[aL] );
			while ( tStr.length > 4 ) {
				tStr.shift();
			}
			last.push( [ $.extend( [], tStr ), 1, ''+set[i] ] );
			last.push( [ $.extend( [], tStr ), 2, ''+set[i] ] );
		}
	}
	$('#run_test').attr( 'disabled', 'disabled' );
	setTimeout( print_the_bugger, 100 );
}

$(document).ready( function () {
	$('#run_test').click( nk_test );
} );

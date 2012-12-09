var bgP = chrome.extension.getBackgroundPage()
	, keez = []
	, allD = false
	, roxin = false;

function roxor () {
	var jTs = $('ul:last li')
		, jH =  $('ul:last').parent().find( 'h3' )
		, jI = null
		, rocking = $('.rocking');
	if ( bpmv.obj(jTs) && bpmv.num(jTs.length) ) {
		if ( rocking.length == jTs.length ) {
			rocking.removeClass( 'rocking' );
			jH.removeClass( 'thoseWhoRock' );
			return;
		} else if ( !jH.is( '.thoseWhoRock' ) ) {
			jH.addClass( 'thoseWhoRock' );
			return;
		}
		for ( var i = 0; i < jTs.length; i++ ) {
			jI = $(jTs[i]);
			if ( !jI.is( '.rocking' ) ) {
				jI.addClass( 'rocking' );
				break;
			}

		}
	}
}

$(document).ready( function () {
	$('.nckContent').append( nckma.credits.to_html() );
	$(document).keypress( function ( ev ) {
		var extant = $('.thanksYouFolksRock')
			, vid = 'j8vPEjioirE'
			, auto = 1;
		if ( !bpmv.num(extant.length) && bpmv.obj(ev) && bpmv.num(ev.keyCode) ) {
			keez.push( String.fromCharCode( ev.keyCode ) ) ;
			while ( keez.length > 4 ) {
				keez.shift();
			}
			if ( !roxin && ( keez.join( '' ) == 'rock' ) ) {
				$('body').append( '<div class="thanksYouFolksRock"><object width="400" height="300"><param name="movie" value="https://www.youtube.com/v/'+vid+'&autoplay='+auto+'"></param><embed src="https://www.youtube.com/v/'+vid+'&autoplay='+auto+'" type="application/x-shockwave-flash" width="400" height="300"></embed></object></div>' );
				setTimeout( function() { setInterval( roxor, 2100 ) }, 2000 );
				roxin = true;
			}
		}
	} );
});


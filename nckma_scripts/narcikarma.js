// chrome.browserAction.setBadgeText(object details)

if ( typeof(nckma) != 'object' ) {
	var nckma = {};
}

(function () {

	/*
	* "Local" vars
	*/

	var nkLastPoll = null
		, nkPollInterval = 2 * 1000
		, nkIsPolling = false
		, nkDataFirst = bpmv.str(localStorage['_lastCached']) ? JSON.parse( localStorage['_lastCached'] ) : null
		, nkDataLast = null
		, nkManifest = null
		, nkTesting = false
		, nkDebug = true
		, nkSetInterval = null
		, nkUrls = {
		 	  'user'       : 'http://www.reddit.com/api/me.json'
			, 'userTest'   : 'http://narcikarma.net/test/me.php'
			, 'cakeYay'    : 'http://www.reddit.com/r/cakeday/'
			, 'cakeNuthin' : 'http://www.google.com/search?q=karma+machine&tbm=isch'
		}
		, nkDefaults = {
			  'alertCommentGain' : 50
			, 'alertLinkGain'    : 50
			, 'dateFormat'       : 'US'
			, 'interval'         : 600
			, 'row0'             : 'lKarma' // one of cKarma, lKarma, flags
			, 'row1'             : 'cKarma'
			, 'black'            : '0, 0, 0, 1'
			, 'blue'             : '0, 0, 235, 1'
			, 'gray'             : '128, 128, 128, 1'
			, 'green'            : '0, 190, 0, 1'
			, 'purple'           : '215, 0, 215, 1'
			, 'red'              : '235, 0, 0, 1'
			, 'negChange'        : '235, 0, 0, 1'
			, 'noChange'         : '0, 0, 0, 1'
			, 'posChange'        : '0, 190, 0, 1'
		}
		, nkPages = {
			  'background'   : 'nckma_html/background.html'
			, 'notification' : 'nckma_html/notification.html'
			, 'options'      : 'nckma_html/options.html'
		};

	/*
	* settings
	*/

	if ( !bpmv.obj(localStorage['conf']) ) {
		localStorage['conf'] = {};
	}

	nckma.conf = {};

	// selector cache
	nckma.conf.cache = {};

	nckma.conf.pages = {
	};

	/*
	* functions
	*/

	nckma.begin = function () {
		nckma.opts.defaults( true );
		nckma.reset();
		if ( !bpmv.num(nkSetInterval) ) {
			nkSetInterval = setInterval( nckma.poll, nkPollInterval );
		}
		nckma.track( 'func', 'nckma.begin', 'nkExec' );
	};

	nckma.debug = function () {
		if ( nkDebug ) {
			if ( bpmv.num(bpmv.count(arguments)) && bpmv.str(arguments[0]) ) {
				arguments[0] = '[Narcikarma Debug] '+arguments[0];
			}
			console.log.apply( console, arguments );
		}
	}

	nckma.defaults = function () {
		return $.extend( {}, nkDefaults );
	};

	nckma.get = function ( asJson ) {
		var opts = {}
			, full = undefined;
		for ( var aC in nkDefaults ) {
			opts[aC] = localStorage[aC];
		}
		full = { 'start' : nkDataFirst, 'current' : nkDataLast, 'options' : opts };
		if ( asJson ) {
			return JSON.stringify( full );
		}
		return full;
	};

	nckma.get_url = function ( url ) {
		if ( bpmv.str(url) && bpmv.str(nkUrls[url]) ) {
			return ''+nkUrls[url];
		}
	};

	nckma.get_text_status = function () {
		var ret = ''
			, dat = nckma.get()
			, delt = 0
			, hasCurr = false;
		if ( bpmv.obj(dat) ) {
			if ( bpmv.obj(dat.start) && bpmv.str(dat.start.name) ) {
				hasCurr = ( bpmv.obj(dat.current) && bpmv.str(dat.current.name) );
				ret += 'User: '+ dat.start.name + '\n';
				ret += 'Start Link Karma: '+ nckma.str_num( dat.start.link_karma ) + '\n';
				delt = hasCurr ? dat.current.link_karma - dat.start.link_karma : 0;
				delt = hasCurr ? ( delt > 0 ? '+' : '' ) + nckma.str_num( delt ) : '0';
				ret += 'Current Link Karma: '+ ( hasCurr ? nckma.str_num( dat.current.link_karma ) + ' (' + delt + ')' : 'unknown' ) + '\n';
				ret += 'Start Comment Karma: '+ nckma.str_num( dat.start.comment_karma ) + '\n';
				delt = hasCurr ? dat.current.comment_karma - dat.start.comment_karma : 0;
				delt = hasCurr ? ( delt > 0 ? '+' : '' ) + nckma.str_num( delt ) : '0';
				ret += 'Current Comment Karma: '+ ( hasCurr ? nckma.str_num( dat.current.comment_karma ) + ' (' + delt + ')'  : 'unknown' ) + '\n';
			}
		}
		return ret;
	};

	nckma.info = function ( asJson ) {
		var man = null;
			if ( !bpmv.obj(nkManifest) ) {
			nkManifest = $.ajax( {
				  'dataType' : 'text'
				, 'async'    : false
				, 'url'      : '/manifest.json'
			} );
			if ( bpmv.obj(nkManifest) && bpmv.str(nkManifest.responseText) ) {
				nkManifest.parsed = JSON.parse( nkManifest.responseText );
			}
		}
		if ( bpmv.obj(nkManifest) && bpmv.str(nkManifest.responseText) ) {
			nkManifest.parsed = JSON.parse( nkManifest.responseText );
			return asJson ? ''+nkManifest.responseText : $.extend( {}, nkManifest.parsed );
		} else {
			throw 'Narcikarma [nckma.info()] Cannot read manifest into nkManifest!';
		}
		// read manifest.json
	};

	nckma.parse = function ( dat, stat, ev ) {
		var d = bpmv.obj(dat) && bpmv.obj(dat.data) ? dat.data : null
			, cDelt = 0
			, lDelt = 0;
		nkIsPolling = false;
		nckma.px.draw_status( 'parse' );
		if ( stat != 'success' ) {
			nckma.px.draw_line( 'ERR', 1, nckma.px.color( 'red' ) );
			nckma.px.draw_line( 'ERR', 2, nckma.px.color( 'red' ) );
			nckma.px.draw_status( 'err' );
			return;
		}
		if ( bpmv.obj(d, true) ) {
			if ( bpmv.str(d.name) ) {
				d.nkTimeStamp = new Date().getTime();
				if ( !bpmv.obj(nkDataFirst) || ( nkDataFirst.name != d.name ) ) {
					nckma.track( 'func', 'nckma.parse reset nkDataFirst newlogin', 'nkExec' );
					nkDataFirst = d;
				}
				nkDataLast = d;
				localStorage['_lastCached'] = JSON.stringify( nkDataLast );
				cDelt = parseInt( nkDataLast.comment_karma, 10 ) - parseInt( nkDataFirst.comment_karma, 10 );
				lDelt = parseInt( nkDataLast.link_karma, 10 ) - parseInt( nkDataFirst.link_karma, 10 );
				if ( cDelt === 0 ) {
					nckma.px.draw_line( ''+cDelt, 2, nckma.px.color( 'noChange' ) );
				} else if ( cDelt > 0 ) {
					nckma.px.draw_line( ''+cDelt, 2, nckma.px.color( 'posChange' ) );
				} else {
					nckma.px.draw_line( ''+(0-cDelt), 2, nckma.px.color( 'negChange' ) );
				}
				if ( lDelt === 0 ) {
					nckma.px.draw_line( ''+lDelt, 1, nckma.px.color( 'noChange' ) );
				} else if ( lDelt > 0 ) {
					nckma.px.draw_line( ''+lDelt, 1, nckma.px.color( 'posChange' ) );
				} else {
					nckma.px.draw_line( ''+(0-lDelt), 1, nckma.px.color( 'negChange' ) );
				}
			}
			nckma.px.draw_status( 'idle' );
		} else {
			nckma.px.draw_line( 'LOG', 1, nckma.px.color( 'blue' ) );
			nckma.px.draw_line( 'IN', 2, nckma.px.color( 'blue' ) );
			nckma.px.draw_status( 'err' );
			return;
		}
		nckma.debug( 'nckma.parse()', nckma.get() );
	};

	nckma.poll = function () {
		var nckmaNow = new Date().getTime()
			, nckmaInterval = localStorage['interval'] * 1000
			, nckmaElapsed = bpmv.typeis( nkLastPoll, 'Date' ) ? (nckmaNow - nkLastPoll.getTime()) : -1;
		if ( nckmaInterval <= 0 ) {
			return;
		}
		if ( !bpmv.num(nckmaElapsed) || ( nckmaElapsed >= nckmaInterval ) ) {
			if ( !nkIsPolling ) {
				nkLastPoll = new Date();
				nkIsPolling = true;
				nckma.px.draw_status( 'poll' );
				$.ajax( {
					'beforeSend' : nckma.set_headers
					, 'dataType' : 'json'
					, 'error'    : nckma.parse
					, 'success'  : nckma.parse
					, 'url'      : nkTesting ? nkUrls.userTest + '?bust='+(new Date).getTime() : nkUrls.user
				} );
			}
		}
	};

	nckma.reset = function ( full ) {
		var dat = null;
		nckma.px.draw_status( 'load' );
		nckma.px.draw_line( '----', 1, nckma.px.color( 'blue' ) );
		nckma.px.draw_line( '----', 2, nckma.px.color( 'blue' ) );
		nkLastPoll = null;
		if ( full ) {
			nkDataFirst = null;
		}
		setTimeout( nckma.poll, 2000 );
	};

	nckma.set_headers = function ( req ) {
		var info = nckma.info()
			, user = 'user-unknown-first-poll'
			, uA = ''
			, uId = 'unknown';
		if ( bpmv.obj(req) && bpmv.func(req.setRequestHeader) ) {
			if ( bpmv.obj(nkDataFirst) && bpmv.str(nkDataFirst.name) ) {
				user = '"' + encodeURI( nkDataFirst.name ) + '"';
				uId = '' + encodeURI( nkDataFirst.id );
			}
			uA = info.name + ' v' + info.version + (nkTesting || nkDebug ? '.' : '') + (nkTesting ? 'T' : '') + (nkDebug ? 'D' : '') + ' - ' + info.description + '; User: ' + user + '(id:' + uId + ')';
			nckma.debug( 'Narcikarma [nckma.set_headers()] Setting X-User-Agent.', uA );
			// trying to set the user agent proper results in "Refused to set unsafe header 'User-Agent'" :(
			req.setRequestHeader( 'X-User-Agent', uA );
		}
	};

	nckma.str_date = function ( dObj, loc ) {
		var hours = '';
		loc = !bpmv.str(loc) ? '' : loc;
		if ( bpmv.typeis( dObj, 'Date' ) ) {
			hours = dObj.getHours();
			switch ( loc.toLowerCase() ) {
				case 'uk':
					return '' +
						dObj.getFullYear() +
						'.' + bpmv.pad( (dObj.getMonth()+1), 2 ) +
						'.' + bpmv.pad( dObj.getDate(), 2 ) +
						' ' + bpmv.pad( dObj.getHours(), 2 ) +
						':' + bpmv.pad( dObj.getMinutes(), 2 ) +
						':' + bpmv.pad( dObj.getSeconds(), 2 );
					break;
				case 'us':
				default:
					return '' +
						bpmv.pad( (dObj.getMonth()+1), 2 ) +
						'/' + bpmv.pad( dObj.getDate(), 2 ) +
						'/' + dObj.getFullYear() +
						' ' + bpmv.pad( (hours > 12 ? hours - 12 : hours), 2, '0' ) +
						':' + bpmv.pad( dObj.getMinutes(), 2 ) +
						':' + bpmv.pad( dObj.getSeconds(), 2 ) +
						' ' + (hours > 12 ? 'PM' : 'AM');
					break;

			}
		}
	};

	nckma.str_num = function ( num ) {
		var neg = ''
			, uNum = ''
			, n = null
			, nI = null
			, nD = null
			, nRx = /(\d+)(\d{3})/;
		if ( bpmv.num(num, true) && ( (''+num).length > 3 ) ) {
			uNum = ''+num;
			n = uNum.split( '.' );
			nI = n[0];
			nD = n.length > 1 ? '.'+nD : '';
			while ( nRx.test( nI ) ) {
				nI = nI.replace( nRx, '$1'+','+'$2' );
			}
			return nI+nD;
/*
			if ( num < 0 ) {
				neg = '-';
				uNum = 0 - num;
			} else {
				uNum = 0 + num;
			}
			return neg + (''+uNum).split( '' ).reverse().join( '' ).match( /.{1,3}/g ).reverse().join( ',' );
*/
		}
		return  ''+num;
	}

	nckma.testing = function ( checkDebug ) {
		if ( checkDebug ) {
			return nkDebug ? true : false;
		} else {
			return nkTesting ? true : false;
		}
	}

	nckma.track = function ( label, val, cat ) {
		var category = bpmv.str(cat) ? ''+cat : 'nkRuntime';
		if ( !bpmv.str(label) || !bpmv.obj(_gaq) ) {
			return;
		}
		if ( bpmv.obj(_gaq) || bpmv.arr(_gaq) ) {
			return _gaq.push( [ '_trackEvent', category + ( nkTesting || nkDebug ? ' -'+(nkTesting ? 'T' : '')+(nkDebug ? 'D' : '')+'-' : '' ), label, val ] );
		}
	}

	nckma.warn = function () {
		if ( nkDebug ) {
			if ( bpmv.num(bpmv.count(arguments)) && bpmv.str(arguments[0]) ) {
				arguments[0] = '[NARCIKARMA WARNING] '+arguments[0];
			}
			console.warn.apply( console, arguments );
		}
		nckma.track( 'warn', bpmv.str(arguments[0]) ? arguments[0] : '', 'nkExec' );
	}

return nckma; })() && (function () {

	nckma.opts = {};

	/*
	* vars
	*/

	nckma.opts.valid_color = function ( val ) {
		return nckma.px.color_test( val ) ? true : 'Color needs to be in the format "0-255, 0-255, 0-255, 0.0-1.0".';
	};

	nckma.opts.valid = {
		  'alertCommentGain' : function ( val ) { return parseInt(val) > 10 ? true : 'Alert Comment Karma Threshold must be greater than 10.'; }
		, 'alertLinkGain'    : function ( val ) { return parseInt(val) > 10 ? true : 'Alert Link Karma Threshold must be greater than 10.'; }
		, 'interval'         : function ( val ) { return ( parseInt(val) > ( nckma.testing() ? 14 : 119 ) ) || ( parseInt(val) === 0 ) ? true : 'Refresh Interval must be 1 minute or more.'; }
		, 'black'            : nckma.opts.valid_color
		, 'blue'             : nckma.opts.valid_color
		, 'gray'             : nckma.opts.valid_color
		, 'green'            : nckma.opts.valid_color
		, 'purple'           : nckma.opts.valid_color
		, 'red'              : nckma.opts.valid_color
		, 'negChange'        : nckma.opts.valid_color
		, 'noChange'         : nckma.opts.valid_color
		, 'posChange'        : nckma.opts.valid_color
	};

	/*
	* functions
	*/

	nckma.opts.defaults = function ( preserve ) {
		var conf = nckma.conf
			, defs = nckma.defaults()
			, statText = false;
		if ( ( bpmv.bool(preserve) && preserve ) || confirm( 'Restore default Narcikarma options?' ) ) {
			for ( var aC in defs ) {
				if ( defs.hasOwnProperty( aC ) && bpmv.str(aC) ) {
					if ( bpmv.bool(preserve) && preserve  && ( typeof(localStorage[aC]) != 'undefined' ) && ( localStorage[aC] ) != null ) {
						statText = bpmv.func(nckma.opts.valid[aC]) ? nckma.opts.valid[aC]( localStorage[aC] ) : false;
						if ( !bpmv.str(statText) ) {
							continue;
						} else {
							nckma.warn( 'Previous value of '+aC+' was invalid!', localStorage[aC] );
							localStorage[aC] = defs[aC];
						}
					} else {
						localStorage[aC] = defs[aC];
					}
				}
			}
			if ( $('body.nckOptions').is( ':visible' ) ) {
				nckma.opts.restore() && nckma.opts.save();
			}
			if ( !bpmv.bool(preserve) || !preserve ) {
				nckma.track( 'func', 'nckma.opts.restore DEFAULTS', 'nkExec' );
			}
		}
	};

	nckma.opts.init = function () {
		var ivlSel = null;
		if ( $('body.nckOptions').is( ':visible' ) ) {
			if ( nckma.testing() ) {
				ivlSel = $('#opt_interval');
				$('<h3>DEV MODE</h3>').insertAfter( '#nck_title' );
				if ( bpmv.obj(ivlSel) && bpmv.num(ivlSel.length) ) {
					ivlSel.prepend( '<option value="60">test 1 minute</option>' );
					ivlSel.prepend( '<option value="30">test 30 sec</option>' );
					ivlSel.prepend( '<option value="15">test 15 sec</option>' );
					nckma.track( 'func', 'nckma.opts.init - DEV', 'nkExec' );
				}
			}
		}
	};

	// Restores select box state to saved value from localStorage.
	nckma.opts.restore = function () {
		var conf = nckma.conf
			, defs = nckma.defaults();
		if ( bpmv.obj(conf) && bpmv.obj(defs) ) {
			for ( var aC in defs ) {
				if ( defs.hasOwnProperty( aC ) && bpmv.str(aC) ) {
					if ( !bpmv.str(localStorage[aC]) ) {
						localStorage[aC] = defs[aC];
					}
					if ( !bpmv.obj(conf.cache[aC]) || !bpmv.num(conf.cache[aC].length) ) {
						conf.cache[aC] = $('#opt_'+aC);
					}
					if ( bpmv.obj(conf.cache[aC]) && bpmv.num(conf.cache[aC].length) ) {
						conf.cache[aC].val( localStorage[aC] );
					}
				}
			}
			return true;
		}
	};

	// Saves options to localStorage.
	nckma.opts.save = function () {
		var conf = nckma.conf
			, defs = nckma.defaults()
			, statText = '';
		if ( !$('body.nckOptions').is( ':visible' ) ) {
			return;
		}
		$('.nckOptionsContainer span').hide();
		for ( var aC in defs ) {
			if ( defs.hasOwnProperty( aC ) && bpmv.str(aC) ) {
				if ( !bpmv.obj(conf.cache[aC]) || !bpmv.num(conf.cache[aC].length) ) {
					conf.cache[aC] = $('#opt_'+aC);
				}
				if ( !bpmv.obj(conf.cache[aC+'_status']) || !bpmv.num(conf.cache[aC+'_status'].length) ) {
					conf.cache[aC+'_status'] = $('#opt_'+aC+'_status');
				}
				statText = bpmv.func(nckma.opts.valid[aC]) ? nckma.opts.valid[aC]( conf.cache[aC].val() ) : false;
				if ( bpmv.obj(conf.cache[aC]) && bpmv.num(conf.cache[aC].length) ) {
					if ( bpmv.bool(statText) ) {
						localStorage[aC] = conf.cache[aC].val();
						if ( localStorage[aC] != defs[aC] ) {
							nckma.track( aC, localStorage[aC], 'nkOptionsSaved' );
						}
						if ( bpmv.obj(conf.cache[aC+'_status']) && bpmv.num(conf.cache[aC+'_status'].length) ) {
							if ( conf.cache[aC].is( 'select' ) ) {
								conf.cache[aC+'_status'].text( 'Set to ' + conf.cache[aC].find( 'option:selected' ).text() + '.' );
							} else {
								conf.cache[aC+'_status'].text( 'Set to ' + conf.cache[aC].val() + '.' );
							}
							conf.cache[aC+'_status'].stop( true ).fadeIn( 100 ).fadeOut( 1500 );
						}
					} else if ( bpmv.str(statText) ) {
						if ( bpmv.obj(conf.cache[aC+'_status']) && bpmv.num(conf.cache[aC+'_status'].length) ) {
							conf.cache[aC+'_status'].html( '<span class="nckOptionsError">Error: '+ statText + '</sapn>');
							conf.cache[aC+'_status'].stop( true ).fadeIn( 100 );
						}
					}
				}
			}
		}
		nckma.track( 'func', 'nckma.opts.save', 'nkExec' );
		nckma.track( 'saved', '', 'nkOptions' );
	};

return nckma.opts; })() && (function () {

	/*
	* "Local" vars
	*/

	var nkCanvas = null
		, nkCx = null;

	/*
	* create
	*/

	nckma.px = {};

	/*
	* vars
	*/

	nckma.px.chars = {
		/* each char is a 4x6 grid of on/off */
		 'p0' : '010110100101101001011010' // test pattern
		,'p1' : '111111011011110110111111' // test pattern
		,'p2' : '010111110101111101011111' // test pattern
		,'f0' : '111010100000000010101110' // flag off
		,'f1' : '111011101110111011101110' // flag on
		, ' ' : '000000000000000000000000'
		, '1' : '010001000100010001000100'
		, '2' : '010010100010010010001110'
		, '3' : '110000100100001000101100'
		, '4' : '001010101110001000100010'
		, '5' : '111010001100001000101110'
		, '6' : '011010001100101010100100'
		, '7' : '111000100010010010001000'
		, '8' : '010010100100101010100100'
		, '9' : '010010100110001000101100'
		, '0' : '010010101010101010100100'
		, '+' : '000001001110010000000000'
		, '-' : '000000001110000000000000'
		, '>' : '100001000010001001001000'
		, 'k' : '100010101100101010011001'
		, 'A' : '010010101010111010101010'
		, 'B' : '111010101100101010101110'
		, 'C' : '111010001000100010001110'
		, 'D' : '110010101010101010101100'
		, 'E' : '111010001100100010001110'
		, 'F' : '111010001100100010001000'
		, 'G' : '111010001000101010101110'
		, 'H' : '101010101010111010101010'
		, 'I' : '111001000100010001001110'
		, 'J' : '001000100010001010100100'
		, 'K' : '101010101100101010101010'
		, 'L' : '100010001000100010001110'
		, 'M' : '101011101010101010101010'
		, 'N' : '101010101110111010101010'
		, 'O' : '111010101010101010101110'
		, 'P' : '111010101110100010001000'
		, 'Q' : '111010101010101011101110'
		, 'R' : '110010101100110010101010'
		, 'S' : '111010000100001000101110'
		, 'T' : '111001000100010001000100'
		, 'U' : '101010101010101010100100'
		, 'V' : '101010101010101001000100'
		, 'W' : '101010101010101011101010'
		, 'X' : '101010101110111010101010'
		, 'Y' : '101010100100010001000100'
		, 'Z' : '111000100100100010001110'
	};

	nckma.px.fallbackColors = {
		  'black'     : [   0,   0,   0,   1 ]
		, 'blue'      : [   0,   0, 235,   1 ]
		, 'gray'      : [ 128, 128, 128,   1 ]
		, 'green'     : [   0, 190,   0,   1 ]
		, 'purple'    : [ 215,   0, 215,   1 ]
		, 'red'       : [ 235,   0,   0,   1 ]
		, 'negChange' : [ 235,   0,   0,   1 ]
		, 'noChange'  : [   0,   0,   0,   1 ]
		, 'posChange' : [   0, 190,   0,   1 ]
	};

	/*
	* functions
	*/

	nckma.px.color_test = function ( cArr ) {
		var tC = null
			, cA = null
			, ret = true;
		if ( bpmv.str(cArr) ) {
			if ( /^\s*[0-9]{1,3}\s*,\s*[0-9]{1,3}\s*,\s*[0-9]{1,3}\s*,\s*[0-9\.]+/.test( cArr ) ) {
				cA = cArr.split( /\s*,\s*/ );
			}
		} else {
			ret = false;
		}
		if ( ret && bpmv.arr(cA) && ( cA.length === 4 ) ) {
			for ( var aI = 0; aI < 4; aI++ ) {
				cA[aI] = aI < 3 ? parseInt(cA[aI]) : parseFloat(cA[aI]);
				if ( !bpmv.num(cA[aI], true) || ( cA[aI] < 0 ) || ( cA[aI] > ( aI < 3 ? 255 : 1 ) ) ) {
					ret = false;
				}
			}
		} else {
			ret = false;
		}
		return ret;
	}

	nckma.px.color = function ( color ) {
		var cA = null
			, cont = true;
		nckma.opts.defaults( true );
		if ( bpmv.str(color) && bpmv.str(localStorage[color]) && /^\s*[0-9]{1,3}\s*,\s*[0-9]{1,3}\s*,\s*[0-9]{1,3}\s*,\s*[0-9\.]+/.test( localStorage[color] ) ) {
			cA = localStorage[color].split( /\s*,\s*/ );
			for ( var aI = 0; aI < 4; aI++ ) {
				cA[aI] = aI < 3 ? parseInt(cA[aI]) : parseFloat(cA[aI]);
				if ( !bpmv.num(cA[aI], true) || ( cA[aI] < 0 ) || ( cA[aI] > ( aI < 3 ? 255 : 1 ) ) ) {
					nckma.warn( 'Bad color!', { 'color' : color, 'val' : localStorage[color] } );
					cont = false;
				}
			}
		} else {
			cont = false;
		}
		if ( cont && bpmv.arr(cA) && ( cA.length === 4 ) ) {
			return cA;
		} else if ( bpmv.arr(nckma.px.fallbackColors[color]) ) {
			nckma.warn( 'Used fallback color!', { 'color' : color, 'val' : nckma.px.fallbackColors[color] } );
			return nckma.px.fallbackColors[color];
		} else {
			nckma.warn( 'Used fallback black!', { 'color' : color, 'val' : [ 0, 0, 0, 1 ] } );
			return [ 0, 0, 0, 1 ];
		}
	}

	nckma.px.cx = function () {
		if ( !bpmv.obj(nkCanvas) || !bpmv.num(nkCanvas.length) || !bpmv.obj(nkCx) ) {
			nkCanvas = $('#nck_canvas_icon_16');
			if ( bpmv.obj(nkCanvas) && bpmv.num(nkCanvas.length) ) {
				nkCx = nkCanvas.get( 0 ).getContext( '2d' );
				if ( !bpmv.obj(nkCx) ) {
					throw 'Narcikarma: Could not get incon canvas!';
				}
			}
		}
		return nkCx;
	};

	nckma.px.draw_char = function ( ch, x, y, color ) {
		var cx = nckma.px.cx()
			, st = ''
			, rc = 0
			, phil = ''
			, posX = 0
			, posY = 0
			, draw = false
			, comp = null
			, cChar = '';
		if ( bpmv.obj(cx) && bpmv.str(ch, true) ) {
			cChar = cChar.length === 1 ? ''+ch.toUpperCase() : ''+ch;
			comp = cx.globalCompositeOperation;
			if ( bpmv.str(nckma.px.chars[cChar]) ) {
				x = parseInt( x, 10 );
				y = parseInt( y, 10 );
				if ( !bpmv.num(x, true) || ( x < 0 ) || ( x > 15 ) ) {
					nckma.warn( 'X is not an integer between 0 and 15!', x );
				} else if ( !bpmv.num(y, true) || ( y < 0 ) || ( y > 15 ) ) {
					nckma.warn( 'Y is not an integer between 0 and 15!', y );
				} else {
					st += nckma.px.chars[cChar];
					if ( !bpmv.arr(color) || ( color.length != 4 ) ) {
						nckma.debug( 'Substituting color for black.', color );
						phil = 'rgba( 0, 0, 0, 1 )';
					} else {
						phil = 'rgba( '+color[0]+', '+color[1]+', '+color[2]+', '+color[3]+' )';
					}
					posX = 0 + x;
					posY = 0 + y;
					for ( var aC = 0; aC < st.length; aC++ ) {
						draw = false;
						cx.globalCompositeOperation = comp;
						if ( st[aC] === '1' ) {
							cx.fillStyle = phil;
							draw = true;
						} else if ( st[aC] === '0' ) {
							cx.globalCompositeOperation = 'destination-out';
							cx.fillStyle = 'rgba( 0, 0, 0, 1 )';
							draw = true;
						} else {
							nckma.warn( 'Current character is not a flag!',  { 'char' : cChar, 'set' : nckma.px.chars, 'val' : st[aC] } );
						}
						if ( draw ) {
							cx.fillRect( posX, posY, 1, 1 );
							rc++;
							if ( rc > 3 ) {
								rc = 0;
								posX = 0 + x;
								posY++;
							} else {
								posX++;
							}
						}
					}
				}
				cx.globalCompositeOperation = comp;
			} else {
				nckma.warn( 'Character is not in set!', { 'char' : cChar, 'set' : nckma.px.chars } );
			}
		} else {
			nckma.warn( 'Context failed!', cx );
		}
	};

	nckma.px.draw_flag = function ( flag, row, onOff ) {
	}

	nckma.px.draw_line = function ( str, line, color ) {
		var cL = parseInt( line, 10 )
			, dL = false
			, dX = 12
			, dY = 0
			, dS = ''; // last char first
		if ( typeof(line) === 'undefined' ) {
			line = 1;
		}
		if ( line === 1 ) {
			dL = true;
		} else if ( line === 2 ) {
			dL = true;
			dY = 9;
		} else {
			nckma.warn( 'Line must be wither 1 or 2!', line );
		}
		if ( dL ) {
			if ( bpmv.arr(str) ) {
				dS = $.extend( [], str );
				dS.reverse();
			} else {
				dS = ''+str;
				while ( dS.length < 4 ) {
					dS = ' '+dS;
				}
				dS = dS.split( '' ).reverse();
			}
			for ( var aC = 0; aC < dS.length; aC++ ) {
				if ( dX >= 0 ) {
					nckma.px.draw_char( dS[aC], dX, dY, color );
					dX -= 4;
				} else {
					continue;
				}
			}
			if ( nckma._bgTask ) {
				nckma.px.read();
			}
		}
	}

	nckma.px.draw_status = function ( stat ) {
		var cl = ''
			, cx = nckma.px.cx()
			, comp = null
			, noFill = false;
		switch ( stat ) {
			case 'err':
				cl = nckma.px.color( 'red' );
				break;
			case 'load':
				cl = nckma.px.color( 'blue' );
				break;
			case 'poll':
				cl = nckma.px.color( 'purple' );
				break;
			case 'parse':
				cl = nckma.px.color( 'green' );
				break;
			case 'idle':
			default:
				cl = nckma.px.color( 'gray' );
				noFill = true;
				break;
		}
		if ( bpmv.arr(cl) && ( cl.length === 4 ) ) {
			comp = cx.globalCompositeOperation;
			cx.globalCompositeOperation = 'destination-out';
			cx.fillStyle = 'rgba( 0, 0, 0, 1 )';
			cx.fillRect( 0, 7, 15, 1 );
			if ( !noFill ) {
				cx.globalCompositeOperation = 'source-over';
				cx.fillStyle = 'rgba( '+cl[0]+', '+cl[1]+', '+cl[2]+', '+(cl[3]/2)+' )';
				cx.fillRect( 0, 7, 15, 1 );
			}
			cx.globalCompositeOperation = comp;
			nckma.px.read();
		}
	};

	nckma.px.read = function () {
		var cx = nckma.px.cx()
			, dat = null
			, bP = chrome.extension.getBackgroundPage()
			, tT = '';
		if ( bpmv.obj(cx) ) {
			dat = cx.getImageData( 0, 0, nkCanvas.width(), nkCanvas.height() );
			chrome.browserAction.setIcon( { imageData : dat } );
			if ( bpmv.obj(bP) ) {
				tT += 'Narcikarma\n';
				tT += bP.nckma.get_text_status();
				chrome.browserAction.setTitle( { title : tT } );
			}
			return dat;
		}
	};

return nckma.px; })() && (function () {

	if ( nckma._bgTask ) {
		nckma.debug( 'running background task' );
		nckma.debug( 'storage interval', localStorage['interval'] );
		$(document).ready( nckma.begin );
	}

})();
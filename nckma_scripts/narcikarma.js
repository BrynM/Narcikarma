// chrome.browserAction.setBadgeText(object details)

if ( typeof(nckma) != 'object' ) {
	var nckma = {};
}

(function () {

	/*
	********************************************************************************
	********************************************************************************
	* CORE
	********************************************************************************
	********************************************************************************
	*/

	// http://www.reddit.com/r/Narcikarma/about.json
	// http://www.reddit.com/reddits/mine.json
	// http://www.reddit.com/reddits/mine/subscriber.json
	//http://www.reddit.com/reddits/mine/moderator.json


	/*
	* "Local" vars
	*/

	var nkColorRgxHex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i
		, nkDebugLvl = 3
		, nkFlags = {
			  'debug'   : true
			, 'ga'      : true
			, 'testing' : true
			, 'aConfFB' : false // read configuration fallbacks...
		}
		, nkLastPoll = null
		, nkMaxHistReal = 1500 // aslo see nkMaxHist in the options section
		, nkPollInterval = 2 * 1000
		, nkIsPolling = false
		, nkDataFirst = bpmv.str(localStorage['_lastCached']) ? JSON.parse( localStorage['_lastCached'] ) : null
		, nkDataLast = null
		, nkDataSet = bpmv.str(localStorage['_dataSet']) ? JSON.parse( localStorage['_dataSet'] ) : []
		, nkManifest = null
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
			, 'alternateTime'    : 2 // in seconds
			, 'color_black'      : '0, 0, 0, 1'
			, 'color_blue'       : '0, 0, 235, 1'
			, 'color_gold'       : '176, 176, 21, 1'
			, 'color_gray'       : '128, 128, 128, 1'
			, 'color_green'      : '0, 190, 0, 1'
			, 'color_purple'     : '215, 0, 215, 1'
			, 'color_negChange'  : '235, 0, 0, 1'
			, 'color_noChange'   : '0, 0, 0, 1'
			, 'color_posChange'  : '0, 190, 0, 1'
			, 'color_red'        : '235, 0, 0, 1'
			, 'cumulativeKarma'  : true
			, 'dateFormat'       : 'US'
			, 'flag0'            : 'has_mail'
			, 'flag1'            : 'is_mod'
			, 'flag2'            : 'has_mod_mail'
			, 'flag3'            : 'is_gold'
			, 'interval'         : 600 // in seconds
			, 'row0'             : 'lKarma' // one of cKarma, lKarma, flags
			, 'row1'             : 'cKarma'
			, 'savedRefreshes'   : '500'
		}
		, nkPages = {
			  'background'   : 'nckma_html/background.html'
			, 'notification' : 'nckma_html/notification.html'
			, 'options'      : 'nckma_html/options.html'
		};

	/*
	* load GA
	*/
	if ( nkFlags['ga'] && bpmv.func(load_nckma_ga) ) {
		nkFlags['debug'] && console.log( '[Narcikarma Debug] loading GA' );
		load_nckma_ga();
	}

	/*
	* settings
	*/

	// this is still unused...
	nckma.conf = function ( vr, vl ) {
		var pre = 'conf_option_';
		if ( bpmv.str(vr) && bpmv.str(nkDefaults[vr]) ) {
			if ( nkFlags['aConfFB'] ) {
				if ( !bpmv.str(localStorage[pre+vr]) && bpmv.str(localStorage[vr]) ) {
					localStorage[pre+vr] = ''+localStorage[vr];
					localStorage.removeItem( vr );
					nckma.debug( 0, 'migrated alpha option '+vr, localStorage[pre+vr] );
				}
			}
			if ( bpmv.str(vl) ) {
				localStorage[pre+vr] = ''+vl;
				nckma.debug( 5, 'set option '+vr, localStorage[pre+vr] );
			}
			return localStorage[pre+vr];
		}
	};

	// selector cache
	nckma.conf.cache = {};

	/*
	* functions
	*/

	nckma.begin = function () {
		nckma.debug( 0, 'Narcikarma v'+nckma.version().str );
		nckma.debug( 0, 'running background task' );
		nckma.opts.defaults( true );
		if ( !bpmv.str(localStorage['nkCurrentVer']) ) {

		}
		nckma.debug( 0, 'active flags', nkFlags );
		if ( nkFlags['debug'] ) {
			nckma.debug( 0, 'debug level', nkDebugLvl );
		}
		nckma.debug( 0, 'storage interval', localStorage['interval'] );
		nckma.reset();
		if ( !bpmv.num(nkSetInterval) ) {
			nkSetInterval = setInterval( nckma.poll, nkPollInterval );
		}
		nckma.track( 'func', 'nckma.begin', 'nkExec' );
	};

	nckma.debug = function ( lvl, msg, etc ) {
		var args = $.extend( [], arguments );
		if ( nkFlags['debug'] ) {
			nkDebugLvl = parseInt(nkDebugLvl, 10);
			if ( !(/^[0-9]+$/).test( ''+lvl ) || ( parseInt(lvl, 10) > parseInt(nkDebugLvl, 10) ) ) {
				nckma.warn( 'nkma.debug() requires the first parameter to be the debug level', arguments );
				console.trace();
				return;
			}
			args.shift();
			if ( bpmv.num(bpmv.count(args)) && bpmv.str(args[0]) ) {
				args[0] = '[Narcikarma Debug] '+args[0];
				console.log.apply( console, args );
			} else {
				nckma.warn( 'nkma.debug() does not have enough arguments', arguments );
				console.trace();
			}
		}
	}

	nckma.d = function () {
		if ( nkFlags['debug'] ) {
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
		full = { 'start' : nkDataFirst, 'current' : nkDataLast, 'options' : opts, 'history' : nkDataSet };
		if ( asJson ) {
			return JSON.stringify( full );
		}
		return full;
	};

	nckma.get_defaults = function () {
		return $.extend( {}, nkDefaults );
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
				ret += 'User: '+ dat.start.name + ( dat.current.has_mail ? ' (MAIL)' : '' ) + ( dat.current.has_mod_mail ? ' (MOD MAIL)' : '' ) + '\n';
				delt = hasCurr ? dat.current.link_karma - dat.start.link_karma : 0;
				delt = hasCurr ? ( delt > 0 ? '+' : '' ) + nckma.str_num( delt ) : '0';
				ret += 'Link Karma: '+ nckma.str_num( dat.start.link_karma ) + ' to ' + ( hasCurr ? nckma.str_num( dat.current.link_karma ) + ' (' + delt + ')' : 'unknown' ) + '\n';
				delt = hasCurr ? dat.current.comment_karma - dat.start.comment_karma : 0;
				delt = hasCurr ? ( delt > 0 ? '+' : '' ) + nckma.str_num( delt ) : '0';
				ret += 'Comment Karma: '+ nckma.str_num( dat.start.comment_karma ) + ' to ' + ( hasCurr ? nckma.str_num( dat.current.comment_karma ) + ' (' + delt + ')' : 'unknown' ) + '\n';
				ret += 'Last Check: '+ ( hasCurr ? nckma.str_date( new Date( dat.current.nkTimeStamp ), localStorage['dateFormat'] ) : 'unknown' ) + '\n';
				if ( ( localStorage['row0'] == 'flags' ) || ( localStorage['row1'] == 'flags' ) || ( localStorage['row0'] == 'flagsAndC' ) || ( localStorage['row1'] == 'flagsAndC' ) || ( localStorage['row0'] == 'flagsAndL' ) || ( localStorage['row1'] == 'flagsAndL' ) ) {
					ret += 'Flags: ';
					for ( var f = 0; f < 4; f++ ) {
						switch( localStorage['flag'+f] ) {
							case 'has_mail':
								ret += 'Mail';
								break;
							case 'has_mod_mail':
								ret += 'Mod Mail';
								break;
							case 'is_gold':
								ret += 'Gold';
								break;
							case 'is_mod':
								ret += 'Mod';
								break;
							case 'has_mail_both':
								ret += 'Mail/Mod Mail';
								break;
							default:
								ret += '(blank)';
								break;
						}
						if ( f < 3 ) {
							ret += ', ';
						}
					}
					ret += '\n';
				}
			}
		}
		return ret;
	};

	nckma.hex2rgb = function ( hex ) {
		var res = null;
		if ( bpmv.str(hex) && nkColorRgxHex.test( hex ) ) {
			res = hex.match( nkColorRgxHex );
			if ( bpmv.arr(res, 4) ) {
				return [
					  parseInt( res[1], 16 )
					, parseInt( res[2], 16 )
					, parseInt( res[3], 16 )
				];
			}
		}
	}

	nckma.rgb2hex = function ( rgb ) {
		var tC = bpmv.str(rgb) ? rgb.split( /\s?,\s?/ ) : rgb;
		if ( bpmv.arr(tC, true) && ( ( tC.length === 3 ) || ( tC.length === 4 ) ) ) {
			return '' + ( (1 << 24) + ( parseInt(tC[0]) << 16 ) + ( parseInt(tC[1]) << 8 ) + parseInt(tC[2]) ).toString(16).slice(1);
		}
	}

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
			nckma.px.draw_line( 'CON', 1, nckma.px.color( 'red' ) );
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
				nkDataSet.push( {
					  'c' : d.comment_karma
					, 'l' : d.link_karma
					, 't' : d.nkTimeStamp
				} );
				while ( ( nkDataSet.length > nkMaxHistReal ) || ( nkDataSet.length > parseInt( localStorage['savedRefreshes'], 10 ) ) ) {
					nckma.debug( 2, 'trimming history', nkDataSet.length )
					nkDataSet.shift()
				}
				localStorage['_dataSet'] = JSON.stringify( nkDataSet );
				nkDataLast = d;
				localStorage['_lastCached'] = JSON.stringify( nkDataLast );
				switch ( localStorage['row0'] ) {
					case 'flags':
						nckma.px.draw_change_flags( 1 );
						break
					case 'cKarma':
						nckma.px.draw_change_comment( 1 );
						break
					case 'lKarma':
					default:
						nckma.px.draw_change_link( 1 );
						break
				}
				switch ( localStorage['row1'] ) {
					case 'flags':
						nckma.px.draw_change_flags( 2 );
						break
					case 'cKarma':
						nckma.px.draw_change_comment( 2 );
						break
					case 'lKarma':
					default:
						nckma.px.draw_change_link( 2 );
						break
				}
			}
			nckma.px.draw_status( 'idle' );
			chrome.browserAction.setTitle( { 'title' : 'Narcikarma\n' + nckma.get_text_status() } );
		} else {
			nckma.px.draw_line( 'LOG', 1, nckma.px.color( 'blue' ) );
			nckma.px.draw_line( 'IN', 2, nckma.px.color( 'blue' ) );
			nckma.px.draw_status( 'err' );
			return;
		}
		nckma.debug( 2, 'nckma.parse()', nckma.get() );
		if ( nckma.testing() ) {
			nckma.debug( 2, 'History Length', nkDataSet.length );
			nckma.debug( 2, 'History Max Option', localStorage['savedRefreshes'] );
			nckma.debug( 2, 'localStorage Remaining in MB', Math.round( ( ( (1024 * 1024 * 5) - unescape( encodeURIComponent( JSON.stringify( localStorage ) ) ).length ) / 1024 / 1024 ) * 100000) / 100000 );
		}
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
					, 'url'      : nkFlags['testing'] ? nkUrls.userTest + '?bust='+(new Date).getTime() : nkUrls.user
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
			localStorage['_dataSet'] = '';
			nkDataSet = [];
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
			uA = info.name + ' v' + nckma.version().str + ' - ' + info.description + '; User: ' + user + '(id:' + uId + ')';
			nckma.debug( 2, 'Narcikarma [nckma.set_headers()] Setting X-User-Agent.', uA );
			// trying to set the user agent proper results in "Refused to set unsafe header 'User-Agent'" :(
			req.setRequestHeader( 'X-User-Agent', uA );
		}
	};

	nckma.str_date = function ( dObj, loc ) {
		var hours = ''
			, mins = ''
			, secs = ''
			, dFmt = !bpmv.str(loc) ? ''+localStorage['dateFormat'] : ''+loc;
		if ( bpmv.typeis( dObj, 'Date' ) ) {
			hours = dObj.getHours();
			mins = bpmv.pad( dObj.getMinutes(), 2 );
			secs = bpmv.pad( dObj.getSeconds(), 2 );
			switch ( dFmt.toLowerCase() ) {
				case 'uk':
					return '' +
						dObj.getFullYear() +
						'.' + bpmv.pad( (dObj.getMonth()+1), 2 ) +
						'.' + bpmv.pad( dObj.getDate(), 2 ) +
						' ' + bpmv.pad( hours, 2 ) +
						':' + ( bpmv.str(mins) ? mins : '00') +
						':' + ( bpmv.str(secs) ? secs : '00');
					break;
				case 'us':
				default:
					return '' +
						bpmv.pad( (dObj.getMonth()+1), 2 ) +
						'/' + bpmv.pad( dObj.getDate(), 2 ) +
						'/' + dObj.getFullYear() +
						' ' + bpmv.pad( (hours > 12 ? hours - 12 : hours), 2, '0' ) +
						':' + ( bpmv.str(mins) ? mins : '00') +
						':' + ( bpmv.str(secs) ? secs : '00') +
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
		}
		return  ''+num;
	}

	nckma.testing = function ( checkDebug ) {
		if ( checkDebug ) {
			return nkFlags['debug'] ? true : false;
		} else {
			return nkFlags['testing'] ? true : false;
		}
	}

	nckma.track = function ( label, val, cat ) {
		var category = bpmv.str(cat) ? ''+cat : 'nkRuntime';
		if ( !bpmv.str(label) ) {
			return;
		}
		if ( typeof(_gaq) === 'undefined' || !bpmv.obj(_gaq) ) {
			window._gaq = [];
		}
		if ( bpmv.obj(_gaq) || bpmv.arr(_gaq) ) {
			return _gaq.push( [ '_trackEvent', category + ' v' + nckma.version().str, label, val ] );
		}
	}

	nckma.version = function () {
		var inf = null
			, ret = { 'num' : null, 'str' : null };
		if ( bpmv.obj(nckma.conf.cache.version) ) {
			return nckma.conf.cache.version;
		}
		inf = nckma.info();
		if ( bpmv.str(inf.version) ) {
			ret = {
				  'num' : inf.version.replace( /[^0-9|^\.]+/g, '' ).split( '.' )
				, 'str' : ''+inf.version + (nkFlags['testing'] || nkFlags['debug'] || nkFlags['ga'] ? '.' : '') + (nkFlags['testing'] ? 'T' : '') + (nkFlags['debug'] ? 'D' : '')
			};
			if ( bpmv.arr(ret.num) ) {
				ret.num = ( ret.num.length < 2 ) ? ''+ret.num[0] : ret.num.shift()+'.'+ret.num.join( '' );
				ret.num = parseFloat( ret.num );
			} else {
				ret.num = null;
			}
			nckma.conf.cache.version = ret;
		}
		return ret;
	}

	nckma.warn = function () {
		if ( nkFlags['debug'] ) {
			if ( bpmv.num(bpmv.count(arguments)) && bpmv.str(arguments[0]) ) {
				arguments[0] = '[NARCIKARMA WARNING] '+arguments[0];
			}
			console.warn.apply( console, arguments );
		}
		nckma.track( 'warn', bpmv.str(arguments[0]) ? arguments[0] : '', 'nkExec' );
	}

return nckma; })() && (function () {

	/*
	********************************************************************************
	********************************************************************************
	* OPTIONS
	********************************************************************************
	********************************************************************************
	*/

	nckma.opts = {};

	var nckmaNeedsSave = false
		, nkMaxHist = 1500
		, nkOptionNames = {
			  'alertCommentGain' : 'Alert After Comment Karma Threshold'
			, 'alertLinkGain'    : 'Alert After Link Karma Threshold'
			, 'alternateTime'    : 'Flag Alternate Time'
			, 'color_black'      : 'Black Color'
			, 'color_blue'       : 'Blue Color'
			, 'color_gold'       : 'Gold Color'
			, 'color_gray'       : 'Gray Color'
			, 'color_green'      : 'Green Color'
			, 'color_purple'     : 'Purple Color'
			, 'color_negChange'  : 'Negative Change Color'
			, 'color_noChange'   : 'No Change Color'
			, 'color_posChange'  : 'Positive Change Color'
			, 'color_red'        : 'Red Color'
			, 'cumulativeKarma'  : 'Show Cumulative Karma'
			, 'dateFormat'       : 'Date Format'
			, 'flag0'            : 'First Flag'
			, 'flag1'            : 'Second Flag'
			, 'flag2'            : 'Third Flag'
			, 'flag3'            : 'Fourth Flag'
			, 'interval'         : 'Refresh Interval'
			, 'row0'             : 'First Row Contents'
			, 'row1'             : 'Second Row Contents'
			, 'savedRefreshes'   : 'Number of Saved Refreshes'
		};

	/*
	* vars
	*/

	// here because it's needed for the next var
	nckma.opts.valid_color = function ( val ) {
		return nckma.px.color_test( val ) ? true : 'Color needs to be in the format "0-255, 0-255, 0-255, 0.0-1.0".';
	};

	nckma.opts.valid = {
		  'alertCommentGain' : function ( val ) { return parseInt(val) > 10 ? true : nkOptionNames['alertCommentGain'] + ' must be greater than 10.'; }
		, 'alertLinkGain'    : function ( val ) { return parseInt(val) > 10 ? true : nkOptionNames['alertLinkGain'] + ' must be greater than 10.'; }
		, 'color_black'      : nckma.opts.valid_color
		, 'color_blue'       : nckma.opts.valid_color
		, 'color_gold'       : nckma.opts.valid_color
		, 'color_gray'       : nckma.opts.valid_color
		, 'color_green'      : nckma.opts.valid_color
		, 'color_purple'     : nckma.opts.valid_color
		, 'color_red'        : nckma.opts.valid_color
		, 'color_negChange'  : nckma.opts.valid_color
		, 'color_noChange'   : nckma.opts.valid_color
		, 'color_posChange'  : nckma.opts.valid_color
		, 'interval'         : function ( val ) { return ( parseInt(val) > ( nckma.testing() ? 14 : 119 ) ) || ( parseInt(val) === 0 ) ? true : nkOptionNames['interval'] + ' must be 1 minute or more.'; }		
		, 'savedRefreshes'   : function ( val ) { val = parseInt( val, 10 ); return ( ( val >= 0 ) && ( val <= nkMaxHist ) ? true : nkOptionNames['savedRefreshes'] + ' must be a number between 0 and '+nkMaxHist+'.' ); }
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
				$('<h3>DEV MODE <span class="nkNote"><a href="_test_canvas.html" target="_blank">canvas test</a></span></h3>').insertAfter( '#nck_title' );
				if ( bpmv.obj(ivlSel) && bpmv.num(ivlSel.length) ) {
					ivlSel.prepend( '<option value="60">test 1 minute</option>' );
					ivlSel.prepend( '<option value="30">test 30 sec</option>' );
					ivlSel.prepend( '<option value="15">test 15 sec</option>' );
					nckma.track( 'func', 'nckma.opts.init - DEV', 'nkExec' );
				}
			}
		}
	};

	// Detect changes in the options page elements
	nckma.opts.change = function ( ev, noList ) {
		var tJ = null
			, defs = nckma.defaults()
			, ego = null
			, changed = 0
			, jT = $(this)
			, jL = $('#changed_options_list')
			, newVal = null;
		if ( (/^(alpha|picker)_opt_color_/).test( jT.attr( 'id' ) ) ) {
			return;
		}
		if ( bpmv.obj(jL) && bpmv.num(jL.length) && !noList ) {
			jL.empty();
		}
		for ( var aC in defs ) {
			tJ = $('#opt_'+aC);
			if ( defs.hasOwnProperty( aC ) && bpmv.str(aC) && bpmv.obj(tJ) && bpmv.num(tJ.length) ) {
				newVal = ''+tJ.val();
				if ( tJ.is( 'input[type="checkbox"]' ) ) {
					newVal = ''+tJ.is(':checked');
					if ( bpmv.trueish( localStorage[aC] ) != bpmv.trueish( newVal ) ) {
						changed++;
						if ( !noList ) {
							jL.append( '<li>'+nkOptionNames[aC]+' changed from &quot;'+localStorage[aC]+'&quot; to &quot;'+newVal+'&quot;</li>' );
						}
					}
				} else if ( newVal != localStorage[aC] ) {
					changed++;
					if ( !noList ) {
						jL.append( '<li>'+nkOptionNames[aC]+' changed from &quot;'+localStorage[aC]+'&quot; to &quot;'+newVal+'&quot;</li>' );
					}
				}
			}
		}
		if ( changed > 0 ) {
			nckmaNeedsSave = true;
			$('.optSaveToggle').removeAttr( 'disabled' );
		} else {
			nckmaNeedsSave = false;
			$('.optSaveToggle').attr( 'disabled', 'disabled' );
		}
	}

	// converts the options page UI values to a proper localStorage RGBA
	nckma.opts.change_color = function () {
		var ego = $(this).attr( 'id' )
			, cN = ego.replace( /^[^_]+_opt_color_/, '' )
			, tA = $('#alpha_opt_color_'+cN)
			, tJ = $('#opt_color_'+cN)
			, tP = $('#picker_opt_color_'+cN)
			, opa = 1;
		if ( (/^alpha_opt_color_/).test( ego ) || (/^picker_opt_color_/).test( ego ) ) {
			opa = ($('#alpha_opt_color_'+cN).val()/1000);
			$('#picker_opt_color_'+cN).css( { 'opacity' : opa } );
			tJ.val( nckma.hex2rgb( $('#picker_opt_color_'+cN).val() ).join( ', ' ) + ', ' + opa );
			tJ.change();
		}
	}

	// Restores select box state to saved value from localStorage.
	nckma.opts.restore = function () {
		var cache = nckma.conf.cache
			, defs = nckma.defaults()
			, tColor = null;
		if ( bpmv.obj(cache) && bpmv.obj(defs) ) {
			for ( var aC in defs ) {
				if ( defs.hasOwnProperty( aC ) && bpmv.str(aC) ) {
					if ( !bpmv.str(localStorage[aC]) ) {
						localStorage[aC] = defs[aC];
					}
					if ( !bpmv.obj(cache[aC]) || !bpmv.num(cache[aC].length) ) {
						cache[aC] = $('#opt_'+aC);
					}
					if ( bpmv.obj(cache[aC]) && bpmv.num(cache[aC].length) ) {
						if ( cache[aC].is( 'input[type="checkbox"]' ) ) {
							if ( bpmv.trueish( localStorage[aC] ) ) {
								cache[aC].attr( 'checked', 'checked' );
							} else {
								cache[aC].removeAttr( 'checked' );
							}
						} else {
							cache[aC].val( localStorage[aC] );
						}
						if ( cache[aC].is( 'input[id^="opt_color_"]' ) ) {
							tColor = localStorage[aC].split( /\s?,\s?/ );
							$('#picker_opt_'+aC).val( '#'+nckma.rgb2hex( localStorage[aC] ) );
							if ( tColor.length === 4 ) {
								$('#picker_opt_'+aC).css( { 'opacity' : tColor[3] } );
								$('#alpha_opt_'+aC).val( parseFloat(tColor[3]) * 1000 );
							} else {
								$('#alpha_opt_'+aC).val( 1000 );
							}
						}
					}
				}
			}
			nckma.opts.change();
			return true;
		}
	};

	// Saves options to localStorage.
	nckma.opts.save = function () {
		var cache = nckma.conf.cache
			, defs = nckma.defaults()
			, jL = $('#changed_options_list')
			, jlGood = false
			, statText = ''
			, newTxt = '';
		if ( !$('body.nckOptions').is( ':visible' ) ) {
			return;
		}
		$('.nckOptionsContainer span').hide();
		if ( nckma.testing() && bpmv.obj(jL) && bpmv.num(jL.length) ) {
			jL.empty();
			jlGood = true;
		}
		for ( var aC in defs ) {
			if ( defs.hasOwnProperty( aC ) && bpmv.str(aC) ) {
				if ( !bpmv.obj(cache[aC]) || !bpmv.num(cache[aC].length) ) {
					cache[aC] = $('#opt_'+aC);
				}
				if ( !bpmv.obj(cache[aC+'_status']) || !bpmv.num(cache[aC+'_status'].length) ) {
					cache[aC+'_status'] = $('#opt_'+aC+'_status');
				}
				statText = bpmv.func(nckma.opts.valid[aC]) ? nckma.opts.valid[aC]( cache[aC].val() ) : false;
				if ( bpmv.obj(cache[aC]) && bpmv.num(cache[aC].length) ) {
					if ( bpmv.bool(statText) ) {
						localStorage[aC] = cache[aC].val();
						if ( localStorage[aC] != defs[aC] ) {
							nckma.track( aC, localStorage[aC], 'nkOptionsSaved' );
						}
						if ( cache[aC].is( 'select' ) ) {
							newTxt =  cache[aC].find( 'option:selected' ).text();
						} else if ( cache[aC].is( 'input[type="checkbox"]' ) ) {
							localStorage[aC] = ''+cache[aC].is( ':checked' );
							newTxt = localStorage[aC];
						} else {
							newTxt = cache[aC].val();
						}
						nckma.opts.flash_status( aC, nkOptionNames[aC]+'set to ' + newTxt + '.' );
						if ( jlGood ) {
							jL.append( '<li style="color: rgba( ' + localStorage['color_green'] + ' );">'+nkOptionNames[aC]+' set to &quot;'+newTxt+'&quot;</li>' );
						}
					} else if ( bpmv.str(statText) ) {
						nckma.opts.flash_status( aC, 'Failed saving &quot;'+nkOptionNames[aC]+'&quot;. ' + statText + '.', true );
						if ( jlGood ) {
							jL.append( '<li style="color: rgba( ' + localStorage['color_red'] + ' );">'+nkOptionNames[aC]+' failed to save. '+statText+'</li>' );
						}
					}
				}
			}
		}
		if ( jlGood ) {
			setTimeout( function () {
				jL.stop().show().fadeOut( 5000, function () {
					jL.empty();
					jL.show();
				} );
			}, 8000 );
		}
		nckma.opts.change( null, true );
		nckma.track( 'func', 'nckma.opts.save', 'nkExec' );
		nckma.track( 'saved', '', 'nkOptions' );
	};

	nckma.opts.flash_status = function ( optName, txt, isErr ) {
		var jEle    = null
			, fadeIn  = 100
			, fadeOut = 8000;
		if ( bpmv.str(optName) && bpmv.str(txt) ) {
			isErr = isErr ? true : false;
			if ( !bpmv.obj(nckma.conf.cache[optName+'_status']) || !bpmv.num(nckma.conf.cache[optName+'_status'].length) ) {
				nckma.conf.cache[optName+'_status'] = $('#opt_'+optName+'_status');
				if ( !nckma.conf.cache[optName+'_status'] ) {
					return;
				}
			}
			jEle = nckma.conf.cache[optName+'_status'];
			if ( isErr ) {
				jEle.html( '<span class="nckOptionsError" style="color: rgba( ' + localStorage['color_red'] + ' );">Error: '+ txt + '</sapn>').stop( true ).fadeIn( fadeIn );
			} else {
				jEle.html( '<span class="" style="color: rgba( ' + localStorage['color_green'] + ' );">'+ txt + '</sapn>').stop( true ).fadeIn( fadeIn, function () {
					jEle.stop( true ).show().fadeOut( fadeOut, function () {
						jEle.empty();
						jEle.show();
					} );
				} );
			}
		}
	};

return nckma.opts; })() && (function () {

	/*
	********************************************************************************
	********************************************************************************
	* PIXEL/CANVAS
	********************************************************************************
	********************************************************************************
	*/

	/*
	* "Local" vars
	*/

	var nkCanvas = {
			  'icon'  : null
		}
		, nkCx = null
		, line0y = 0
		, line1y = 9
		, nkChars = {
			/* each char is a 4x6 grid of on/off */
			 'p0' : '010110100101101001011010' // test pattern
			,'p1' : '111111011011110110111111' // test pattern
			,'p2' : '010111110101111101011111' // test pattern
			,'f0' : '000000001100110000000000' // flag off
			,'f1' : '110011001110111011001100' // flag on
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
			, 'm' : '000000000000111111111001'
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
		}
		, nkFallbackColors = {
			  'black'     : [   0,   0,   0,   1 ]
			, 'blue'      : [   0,   0, 235,   1 ]
			, 'gold'      : [ 176, 176,  21,   1 ]
			, 'gray'      : [ 128, 128, 128,   1 ]
			, 'green'     : [   0, 190,   0,   1 ]
			, 'purple'    : [ 215,   0, 215,   1 ]
			, 'red'       : [ 235,   0,   0,   1 ]
			, 'negChange' : [ 235,   0,   0,   1 ]
			, 'noChange'  : [   0,   0,   0,   1 ]
			, 'posChange' : [   0, 190,   0,   1 ]
		};

	/*
	* create
	*/

	nckma.px = {};

	/*
	* functions
	*/

	nckma.px.chars = function () {
		return $.extend( {}, nkChars );
	};

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

	// get an RGBA array for a given color name
	nckma.px.color = function ( color ) {
		var cA = null
			, cont = true
			, locColor = 'color_' + color;
		nckma.opts.defaults( true );
		if ( bpmv.str(color) && bpmv.str(localStorage[locColor]) && /^\s*[0-9]{1,3}\s*,\s*[0-9]{1,3}\s*,\s*[0-9]{1,3}\s*,\s*[0-9\.]+/.test( localStorage[locColor] ) ) {
			cA = localStorage[locColor].split( /\s*,\s*/ );
			for ( var aI = 0; aI < 4; aI++ ) {
				cA[aI] = aI < 3 ? parseInt(cA[aI]) : parseFloat(cA[aI]);
				if ( !bpmv.num(cA[aI], true) || ( cA[aI] < 0 ) || ( cA[aI] > ( aI < 3 ? 255 : 1 ) ) ) {
					nckma.warn( 'Bad color!', { 'color' : color, 'val' : localStorage[locColor] } );
					cont = false;
				}
			}
		} else {
			cont = false;
		}
		if ( cont && bpmv.arr(cA) && ( cA.length === 4 ) ) {
			return cA;
		} else if ( bpmv.arr(nkFallbackColors[color]) ) {
			nckma.warn( 'Used fallback color!', { 'color' : color, 'val' : nkFallbackColors[color] } );
			return nkFallbackColors[color];
		} else {
			nckma.warn( 'Used fallback black!', { 'color' : color, 'val' : [ 0, 0, 0, 1 ] } );
			return [ 0, 0, 0, 1 ];
		}
	}

	// get an Array containing the set of color names for all known colors
	nckma.px.color_set = function () {
		var ret = []
			, optRx = /^color_/
			, defs = nckma.get_defaults();
		for ( var aO in defs ) {
			if ( defs.hasOwnProperty( aO ) && optRx.test( aO ) ) {
				ret.push( (''+aO).replace( optRx, '' ) );
			}
		}
		return ret;
	}

	nckma.px.cx = function ( type ) {
		if ( !bpmv.obj(nkCanvas.icon) || !bpmv.num(nkCanvas.icon.length) || !bpmv.obj(nkCx) ) {
			nkCanvas.icon = $('#nck_canvas_icon_16');
			if ( bpmv.obj(nkCanvas.icon) && bpmv.num(nkCanvas.icon.length) ) {
				nkCx = nkCanvas.icon.get( 0 ).getContext( '2d' );
				if ( !bpmv.obj(nkCx) ) {
					throw 'Narcikarma: Could not get incon canvas!';
				}
			}
		}
		return nkCx;
	};

	nckma.px.draw_change_comment = function ( line ) {
		var dat = null
			, delt = 0
			, col = 'noChange';
		if ( ( line != 1 ) && ( line != 2 ) ) {
			nckma.warn( 'Bad line for nckma.px.draw_change_comment()', line );
			return;
		}
		dat = nckma.get();
		if ( bpmv.obj(dat, true) && bpmv.obj(dat.start, true) && bpmv.obj(dat.current, true) ) {
			if ( bpmv.num(dat.start.comment_karma, true) && bpmv.num(dat.current.comment_karma, true) ) {
				delt = parseInt( dat.current.comment_karma, 10 ) - parseInt( dat.start.comment_karma, 10 );
				if ( delt < -999999 ) {
					delt = Math.round( (0 - delt) / 1000000 ) + 'm';
					col = 'negChange';
				} else if ( delt < -9999 ) {
					delt = Math.round( (0 - delt) / 1000 ) + 'k';
					col = 'negChange';
				} else if ( delt < 0 ) {
					delt = (0 - delt);
					col = 'negChange';
				} else if ( delt > 999999 ) {
					delt = Math.round( delt / 1000000 ) + 'm';
					col = 'posChange';
				} else if ( delt > 9999 ) {
					delt = Math.round( delt / 1000 ) + 'k';
					col = 'posChange';
				} else if ( delt > 0 ) {
					col = 'posChange';
				}
				nckma.px.draw_line( ''+delt, line, nckma.px.color( col ) );
			}

		}
	};

	nckma.px.draw_change_flags = function ( line ) {
		var dat = null
			, flag = 0
			, ch = ''
			, x = 0
			, y = line > 1 ? line1y : line0y;
		if ( ( line != 1 ) && ( line != 2 ) ) {
			nckma.warn( 'Bad line for nckma.px.draw_change_link()', line );
			return;
		}
		dat = nckma.get();
		if ( bpmv.obj(dat, true) && bpmv.obj(dat.current, true) ) {
			while ( flag < 4 ) {
				switch ( localStorage['flag'+flag] ) {
					case 'has_mail_both':
						if ( dat.current.has_mail || dat.current.has_mod_mail ) {
							nckma.px.draw_char( 'f1', x, y, nckma.px.color( 'red' ) );
						} else {
							nckma.px.draw_char( 'f0', x, y, nckma.px.color( 'red' ) );
						}
						break;
					case 'has_mail':
						if ( dat.current.has_mail ) {
							nckma.px.draw_char( 'f1', x, y, nckma.px.color( 'red' ) );
						} else {
							nckma.px.draw_char( 'f0', x, y, nckma.px.color( 'red' ) );
						}
						break;
					case 'has_mod_mail':
						if ( dat.current.has_mail ) {
							nckma.px.draw_char( 'f1', x, y, nckma.px.color( 'blue' ) );
						} else {
							nckma.px.draw_char( 'f0', x, y, nckma.px.color( 'blue' ) );
						}
						break;
					case 'is_mod':
						if ( dat.current.is_gold ) {
							nckma.px.draw_char( 'f1', x, y, nckma.px.color( 'purple' ) );
						} else {
							nckma.px.draw_char( 'f0', x, y, nckma.px.color( 'purple' ) );
						}
						break;
					case 'is_gold':
						if ( dat.current.is_gold ) {
							nckma.px.draw_char( 'f1', x, y, nckma.px.color( 'gold' ) );
						} else {
							nckma.px.draw_char( 'f0', x, y, nckma.px.color( 'gold' ) );
						}
						break;
					default:
						nckma.px.draw_char( ' ', x, y, nckma.px.color( 'black' ) );
						break;
				}
				x += 4;
				flag++;
			}
			nckma.px.read();
		}
	};

	nckma.px.draw_change_link = function ( line ) {
		var dat = null
			, delt = 0
			, col = 'noChange';
		if ( ( line != 1 ) && ( line != 2 ) ) {
			nckma.warn( 'Bad line for nckma.px.draw_change_link()', line );
			return;
		}
		dat = nckma.get();
		if ( bpmv.obj(dat, true) && bpmv.obj(dat.start, true) && bpmv.obj(dat.current, true) ) {
			if ( bpmv.num(dat.start.link_karma, true) && bpmv.num(dat.current.link_karma, true) ) {
				delt = parseInt( dat.current.link_karma, 10 ) - parseInt( dat.start.link_karma, 10 );
				if ( delt < -999999 ) {
					delt = Math.round( (0 - delt) / 1000000 ) + 'm';
					col = 'negChange';
				} else if ( delt < -9999 ) {
					delt = Math.round( (0 - delt) / 1000 ) + 'k';
					col = 'negChange';
				} else if ( delt < 0 ) {
					delt = (0 - delt);
					col = 'negChange';
				} else if ( delt > 999999 ) {
					delt = Math.round( delt / 1000000 ) + 'm';
					col = 'posChange';
				} else if ( delt > 9999 ) {
					delt = Math.round( delt / 1000 ) + 'k';
					col = 'posChange';
				} else if ( delt > 0 ) {
					col = 'posChange';
				}
				nckma.px.draw_line( ''+delt, line, nckma.px.color( col ) );
			}

		}
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
			if ( bpmv.str(nkChars[cChar]) ) {
				x = parseInt( x, 10 );
				y = parseInt( y, 10 );
				if ( !bpmv.num(x, true) || ( x < 0 ) || ( x > 15 ) ) {
					nckma.warn( 'X is not an integer between 0 and 15!', x );
				} else if ( !bpmv.num(y, true) || ( y < 0 ) || ( y > 15 ) ) {
					nckma.warn( 'Y is not an integer between 0 and 15!', y );
				} else {
					st += nkChars[cChar];
					if ( bpmv.str(color) ) {
						var color = nckma.px.color( color );
					}
					if ( !bpmv.arr(color) || ( color.length != 4 ) ) {
						nckma.debug( 4, 'Substituting color for black.', color );
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
						} else if ( ( st[aC] === '0' ) || ( ch === ' ' ) ) {
							cx.globalCompositeOperation = 'destination-out';
							cx.fillStyle = 'rgba( 0, 0, 0, 1 )';
							draw = true;
						} else {
							nckma.warn( 'Current character is not a flag! ('+cChar+')',  { 'char' : cChar, 'set' : nkChars, 'val' : st[aC] } );
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
				nckma.warn( 'Character is not in set! ('+cChar+')', { 'char' : cChar, 'set' : nkChars } );
			}
		} else {
			nckma.warn( 'Context failed!', cx );
		}
	};

	nckma.px.draw_line = function ( str, line, color ) {
		var cL = parseInt( line, 10 )
			, dL = false
			, dX = 12
			, dY = line0y
			, dS = ''; // last char first
		if ( typeof(line) === 'undefined' ) {
			line = 1;
		}
		if ( line === 1 ) {
			dL = true;
		} else if ( line === 2 ) {
			dL = true;
			dY = line1y;
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
			, tT = '';
		if ( bpmv.obj(cx) ) {
			dat = cx.getImageData( 0, 0, nkCanvas.icon.width(), nkCanvas.icon.height() );
			chrome.browserAction.setIcon( { imageData : dat } );
			return dat;
		}
	};

return nckma.px; })() && (function () {

	/*
	********************************************************************************
	********************************************************************************
	* SPARKLINES - CODE ADAPTED FROM JSPARK ORIGINAL BY JOHN RESIG
	* http://ejohn.org/projects/jspark/
	********************************************************************************
	********************************************************************************
	*/

	var nkSkCan = {};

	function nk_sk_cx () {

	}

	// sparkline generator
	nckma.sk = {};

return nckma.sk; })() && (function () {

	/*
	********************************************************************************
	********************************************************************************
	* CREDITS
	********************************************************************************
	********************************************************************************
	*/

	var nkCredits = { // the order here controls appearance order
		'creator' : [
			{ 'name' : 'badmonkey0001', 'link' : 'http://www.reddit.com/u/badmonkey0001' }
		]
		, 'tools' : [
			  { 'name' : 'bpmv',             'link' : 'https://github.com/BrynM/bpmv' }
			, { 'name' : 'Google Chrome',    'link' : 'http://www.google.com/chrome' }
			, { 'name' : 'jQuery',           'link' : 'http://jquery.com' }
			, { 'name' : 'Reddit',           'link' : 'http://www.reddit.com/' }
			, { 'name' : 'Sublime Text 2',   'link' : 'http://www.sublimetext.com/2' }
			, { 'name' : 'Simple Fireworks', 'link' : 'http://rainbow.arch.scriptmania.com/scripts/fireworks.html' }
		]
		, 'developers' : [
			{ 'name' : 'badmonkey0001', 'link' : 'http://www.reddit.com/u/badmonkey0001' }
		]
		, 'alpha testers' : [
			  { 'name' : 'evilmarc',        'link' : '' }
			, { 'name' : 'jengo',           'link' : '' }
			, { 'name' : 'jnickers',        'link' : '' }
			, { 'name' : 'KerrickLong',     'link' : '' }
			, { 'name' : 'lenoat702',       'link' : '' }
			, { 'name' : 'MobsterMonkey21', 'link' : '' }
			, { 'name' : 'The_Boudzter',    'link' : '' }
			, { 'name' : 'tomswartz07',     'link' : '' }
			, { 'name' : 'Zagorath',        'link' : '' }
		]
	};

	nckma.credits = {};

	nckma.credits.to_html = function () {
		var ret = ''
			, retT = ''
			, majNum = 0
			, minNum = 0;
		for ( var cred in nkCredits ) {
			retT = '';
			minNum = 0;
			if ( nkCredits.hasOwnProperty( cred ) && bpmv.str(cred) && bpmv.obj(nkCredits[cred], true) ) {
				for ( var aCred in nkCredits[cred] ) {
					if ( nkCredits[cred].hasOwnProperty( aCred ) && bpmv.str(aCred) && bpmv.obj(nkCredits[cred][aCred], true) && bpmv.str(nkCredits[cred][aCred].name) ) {
						if ( bpmv.str(nkCredits[cred][aCred].link) ) {
							retT += '<li><a href="'+nkCredits[cred][aCred].link+'" target="_blank">'+nkCredits[cred][aCred].name+'</a></li>\n';
						} else {
							retT += '<li>'+nkCredits[cred][aCred].name+'</li>\n';
						}
						minNum++;
					}
				}
				if ( ( minNum > 0 ) && bpmv.str(retT) ) {
					ret += '<li>\n<h3 style="text-transform: capitalize;" >'+cred+'</h3>\n<ul>\n'+retT+'\n</ul>\n</li>\n';
					majNum++;
				}
			}
		}
		if ( bpmv.str(ret) ) {
			ret = '<div class="nckCredits">\n<h1>Narcikarma Credits</h1>\n<ul>\n'+ret+'\n</ul>\n</div>';
		}
		return ret;
	};

	nckma.credits.to_markdown = function () {
		var ret = ''
			, retT = ''
			, majNum = 0
			, minNum = 0;
		for ( var cred in nkCredits ) {
			retT = '';
			minNum = 0;
			if ( nkCredits.hasOwnProperty( cred ) && bpmv.str(cred) && bpmv.obj(nkCredits[cred], true) ) {
				for ( var aCred in nkCredits[cred] ) {
					if ( nkCredits[cred].hasOwnProperty( aCred ) && bpmv.str(aCred) && bpmv.obj(nkCredits[cred][aCred], true) && bpmv.str(nkCredits[cred][aCred].name) ) {
						if ( bpmv.str(nkCredits[cred][aCred].link) ) {
							retT += '* ['+nkCredits[cred][aCred].name+']('+nkCredits[cred][aCred].link+')\n';
						} else {
							retT += '* '+nkCredits[cred][aCred].name+'\n';
						}
						minNum++;
					}
				}
				if ( ( minNum > 0 ) && bpmv.str(retT) ) {
					ret += '## '+cred.replace( /(^|\s)([a-z])/g , function(m,p1,p2){ return p1+p2.toUpperCase(); } )+'\n'+retT+'\n';
					majNum++;
				}
			}
		}
		if ( bpmv.str(ret) ) {
			ret = '# Narcikarma Credits\n'+bpmv.trim( ret )+'\n';
		}
		return ret;
	};

	nckma.credits.to_text = function () {
		var ret = ''
			, retT = ''
			, majNum = 0
			, minNum = 0;
		for ( var cred in nkCredits ) {
			retT = '';
			minNum = 0;
			if ( nkCredits.hasOwnProperty( cred ) && bpmv.str(cred) && bpmv.obj(nkCredits[cred], true) ) {
				for ( var aCred in nkCredits[cred] ) {
					if ( nkCredits[cred].hasOwnProperty( aCred ) && bpmv.str(aCred) && bpmv.obj(nkCredits[cred][aCred], true) && bpmv.str(nkCredits[cred][aCred].name) ) {
						if ( bpmv.str(nkCredits[cred][aCred].link) ) {
							retT += '    - '+nkCredits[cred][aCred].name+' ('+nkCredits[cred][aCred].link+')\n';
						} else {
							retT += '    - '+nkCredits[cred][aCred].name+'\n';
						}
						minNum++;
					}
				}
				if ( ( minNum > 0 ) && bpmv.str(retT) ) {
					ret += '  * '+cred.replace( /(^|\s)([a-z])/g , function(m,p1,p2){ return p1+p2.toUpperCase(); } )+'\n'+retT+'\n';
					majNum++;
				}
			}
		}
		if ( bpmv.str(ret) ) {
			ret = 'Narcikarma Credits\n'+bpmv.trim( ret )+'\n';
		}
		return ret;
	};

return nckma.credits; })() && (function () {

	/*
	********************************************************************************
	********************************************************************************
	* RUNTIME
	********************************************************************************
	********************************************************************************
	*/

	if ( nckma._bgTask ) {
		$(document).ready( nckma.begin );
	}


})();
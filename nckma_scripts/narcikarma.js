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
	// http://www.reddit.com/reddits/mine/moderator.json

	/*
	* "Local" vars
	*/

	var nkColorRgxHex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i
		, nkDebugLvl = 15
		, nkEvs = {}
		, nkFlags = {
			  'debug'   : true
			, 'ga'      : true
			, 'testing' : true
			, 'aConfFB' : false // read configuration fallbacks...
		}
		, nkLastPoll = null
		, nkMaxHistReal = 8000 // aslo see nkMaxHist in the options section
		, nkPollInterval = 1000
		, nkIsPolling = false
		, nkDataFirst = bpmv.str(localStorage['_lastCached']) ? JSON.parse( localStorage['_lastCached'] ) : null
		, nkDataLast = null
		// , nkDataSet = bpmv.str(localStorage['_dataSet']) ? JSON.parse( localStorage['_dataSet'] ) : []
		, nkManifest = null
		, nkQuietEvents = [
			'beat'
		]
		, nkSetInterval = null
		, nkStartCbs = []
		, nkStarted = false
		, nkUrls = {
		 	  'user'       : 'http://www.reddit.com/api/me.json'
			, 'userTest'   : 'http://narcikarma.net/test/me.php?d=1.25'
			, 'cakeYay'    : 'http://www.reddit.com/r/cakeday/'
			, 'cakeNuthin' : 'http://www.google.com/search?q=karma+machine&tbm=isch'
		}
		, nkUserData = {}
		, nkDefaults = {
			  'alertCommentGain' : '50'
			, 'alertLinkGain'    : '50'
			, 'alternateTime'    : '2' // in seconds
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
			, 'cumulativeKarma'  : 'true'
			, 'dateFormat'       : 'US'
			, 'flag0'            : 'has_mail'
			, 'flag1'            : 'is_mod'
			, 'flag2'            : 'has_mod_mail'
			, 'flag3'            : 'is_gold'
			, 'interval'         : '600' // in seconds
			, 'row0'             : 'lKarma' // one of cKarma, lKarma, flags
			, 'row1'             : 'cKarma'
			, 'savedRefreshes'   : '1000'
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
	* props
	*/

	// selector cache
	nckma._cache = {};

	// debug levels
	nckma._dL = {
		  'all'      : 0
		, 'any'      : 0
		, 'begin'    : 0
		, 'db'       : 20
		, 'dbDetail' : 28
		, 'dbOps'    : 23
		, 'dbSql'    : 25
		, 'ev'       : 10
		, 'evQuiet'  : 18
		, 'opts'     : 5
		, 'poll'     : 2
		, 'px'       : 30
	};

	/*
	* functions
	*/

	nckma.begin = function ( cb ) {
		var ver = nckma.version()
			, plug = '[BEGIN] ';
		if ( nckma._bgTask ) {
			nckma.debug( nckma._dL.begin, plug+'Narcikarma v'+nckma.version().str );
			nckma.opts.defaults_set( true );
			if ( !bpmv.str(localStorage['nkCurrentVer']) ) {
				nckma.ev( 'upgrade', { 'old' : localStorage['nkCurrentVer'], 'new' : ver } )
				localStorage['nkCurrentVer'] = ver;
			}
			nckma.debug( nckma._dL.begin, plug+'active flags', nkFlags );
			if ( nkFlags['debug'] ) {
				nckma.debug( nckma._dL.begin, plug+'debug level', nkDebugLvl );
			}
			if ( nkFlags['testing'] ) {
				nckma.debug( nckma._dL.begin, plug+'test mode enabled' );
			}
			nckma.debug( nckma._dL.begin, plug+'storage interval', localStorage['interval'] );
			nckma.reset();
			if ( !bpmv.num(nkSetInterval) ) {
				nckma.debug( nckma._dL.begin, plug+'running background task - starting heartbeat' );
				nkSetInterval = setInterval( nckma.heartbeat, nkPollInterval );
				// nkSetInterval = setInterval( nckma.poll, nkPollInterval );
			}
			nckma.track( 'func', 'nckma.begin', 'nkExec' );
		}
	};

	nckma.debug = function ( lvl, msg, etc ) {
		var args = null;
		if ( nkFlags['debug'] ) {
			if ( !(/^[0-9]+$/).test( ''+lvl ) ) {
				nckma.warn( 'nkma.debug() requires the first parameter to be the intiger debug level', arguments );
				console.trace();
				return;
			}
			nkDebugLvl = parseInt(nkDebugLvl, 10);
			if ( parseInt(lvl, 10) > nkDebugLvl ) {
				return;
			}
			args = $.extend( [], arguments );
			args.shift();
			if ( bpmv.num(bpmv.count(args)) && bpmv.str(args[0]) ) {
				args[0] = '[Narcikarma Debug '+lvl+','+nkDebugLvl+'] '+args[0];
				console.log.apply( console, args );
			} else {
				nckma.warn( 'nkma.debug() does not have enough arguments', arguments );
				console.trace();
			}
		}
	}

	nckma.err = function ( msg, etc ) {
		if ( bpmv.num(bpmv.count(arguments)) && bpmv.str(arguments[0]) ) {
			arguments[0] = '[Narcikarma] ERROR: '+arguments[0];
		}
		console.error.apply( console, arguments );
	}

	// we set this up in the core as well
	nckma.ev = function ( evName, cbOrData ) {
		var iter = 0
			, cbRes
			, bulkRet = {}
			, plug = '[EVENT] ';
		if ( bpmv.arr(evName) ) { // group of events
			for ( iter = 0; iter < evName.length; iter++ ) {
				if ( bpmv.str(evName[iter]) ) {
					nckma.ev( evName[iter], cbOrData );
					bulkRet[evName[iter]] = nkEvs[evName[iter]];
				}
			}
			return bulkRet;
		} else if ( bpmv.str(evName) ) {
			if ( !bpmv.obj(nkEvs[evName]) ) {
				nkEvs[evName] = [];
			}
			if ( bpmv.func(cbOrData) ) {
				nkEvs[evName].push( cbOrData );
				nckma.debug( nckma._dL.ev, plug+'callback added', [ evName, cbOrData, nkEvs[evName] ] );
				bulkRet[evName] = nkEvs[evName];
				return bulkRet;
			} else {
				if ( bpmv.arr(nkEvs[evName]) ) {
					for ( iter = 0; iter < nkEvs[evName].length; iter++ ) {
						if ( bpmv.func(nkEvs[evName][iter]) ) {
							cbRes = nkEvs[evName][iter].apply( nckma, arguments );
						}
						if ( cbRes === false ) {
							break;
						}
					}
				}
				if ( !bpmv.num(bpmv.find( evName, nkQuietEvents ), true) ) {
					nckma.debug( nckma._dL.ev, plug+'fired', [ evName, cbRes, cbOrData, nkEvs[evName] ] );
				} else {
					nckma.debug( nckma._dL.evQuiet, plug+'fired', [ evName, cbRes, cbOrData, nkEvs[evName] ] );
				}
				bulkRet[evName] = nkEvs[evName];
				return bulkRet;
			}
		}
		nckma.debug( nckma._dL.ev, plug+'FAILED', [ arguments ] );
	};

	// kill an event bind or entire event
	nckma.ev_kill = function ( evName, cb ) {
		var iter
			, cbS = ''
			, ret = {};
		if ( bpmv.str(evName) && bpmv.arr(nkEvs[evName]) && bpmv.func(cb) ) {
			cbS = cb.toString();
			for ( iter in nkEvs[evName] ) {
				if ( nkEvs[evName].hasOwnProperty( iter ) && bpmv.func(nkEvs[evName][iter]) && ( cbS === nkEvs[evName][iter].toString() ) ) {
					nkEvs[evName].splice ( iter, 1 );
				}
			}
		} else if ( bpmv.func(cb) ) {
			for ( iter in nkEvs ) {
				if ( nkEvs.hasOwnProperty( iter ) && bpmv.str(iter) ) {
					ret[iter] = nckma.ev_kill( iter, cb );
				}
			}
		}
		return $.extend( {}, nkEvs );
	};

	nckma.get = function ( asJson ) {
		var opts = {}
			, full = undefined;
		full = { 'start' : $.extend( {}, nkDataFirst ), 'current' : $.extend( {}, nkDataLast ), 'options' : nckma.opts.get() };
		// full = { 'start' : $.extend( {}, nkDataFirst ), 'current' : $.extend( {}, nkDataLast ), 'options' : nckma.opts.get(), 'history' : $.extend( [], nkDataSet ) };
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

	nckma.heartbeat = function () {
		nckma.ev( 'beat' );
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
			, lDelt = 0
			, nkDsLast = null
			, dbg = nckma.testing( true );
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
				nckma.db.user_table( d.name, function () {
					nckma.db.user_insert( d.name, {
						  'c' : d.comment_karma
						, 'd' : bpmv.num(nkDsLast) ? d.nkTimeStamp - nkDsLast : 0 // time delta since last
						, 'l' : d.link_karma
						, 't' : d.nkTimeStamp
					} );
				} );

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
		nckma.ev( 'parse', [ dat, stat, ev ] );
		if ( dbg ) {
			nckma.debug( nckma._dL.poll, 'nckma.parse()', nckma.get() );
		}
	};

	nckma.poll = function () {
		var nckmaNow = new Date().getTime()
			, nckmaInterval = localStorage['interval'] * 1000
			, nckmaElapsed = bpmv.typeis( nkLastPoll, 'Date' ) ? (nckmaNow - nkLastPoll.getTime()) : -1
			, jax = {};
		if ( nckmaInterval > 0 ) {
			if ( !bpmv.num(nckmaElapsed) || ( nckmaElapsed >= nckmaInterval ) ) {
				if ( !nkIsPolling ) {
					nkLastPoll = new Date();
					nkIsPolling = true;
					nckma.px.draw_status( 'poll' );
					jax['beforeSend'] = nckma.set_headers;
					jax['dataType'] = 'json';
					jax['error'] = nckma.parse;
					jax['success'] = nckma.parse;
					if ( nkFlags['testing'] ) {
						jax['url'] = nkUrls.userTest+( (''+nkUrls.userTest).indexOf( '?' ) > -1 ? '&' : '?' )+'bust='+(new Date).getTime();
					} else {
						jax['url'] = nkUrls.user;
					}
					$.ajax( jax );
					nckma.debug( nckma._dL.poll, 'poll queued', jax );
					nckma.ev( 'poll', jax );
				}
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
			nckma.db.user_clear( true );
			//localStorage['_dataSet'] = '';
			// nkDataSet = [];
		}
		setTimeout( nckma.poll, 1000 );
	};

	nckma.rgb2hex = function ( rgb ) {
		var tC = bpmv.str(rgb) ? rgb.split( /\s?,\s?/ ) : rgb;
		if ( bpmv.arr(tC, true) && ( ( tC.length === 3 ) || ( tC.length === 4 ) ) ) {
			return '' + ( (1 << 24) + ( parseInt(tC[0]) << 16 ) + ( parseInt(tC[1]) << 8 ) + parseInt(tC[2]) ).toString(16).slice(1);
		}
	}

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
			nckma.debug( nckma._dL.poll, 'Narcikarma [nckma.set_headers()] Setting X-User-Agent.', uA );
			// trying to set the user agent proper results in "Refused to set unsafe header 'User-Agent'" :(
			req.setRequestHeader( 'X-User-Agent', uA );
		}
	};

	nckma.start = function ( cb ) {
		var cbR = null
			, cbArgs = $.extend( [], arguments );
		if ( bpmv.bool(cb) && ( cb === true ) ) {
			nckma.debug( 0, 'Narcikamra startup', [ cbArgs, nkStartCbs.length ] );
			nkStarted = true;
			while ( nkStartCbs.length ) {
				cbR = nkStartCbs.shift();
				cbR.apply( window, cbArgs );
			}
			nckma.ev( 'start', cbArgs );
			nckma.debug( 0, 'Narcikamra startup complete.' );
		} else if ( bpmv.func(cb) ) {
			if ( nkStarted ) {
				cbR.apply( window, cbArgs );
				nckma.debug( nckma._dL.ev, 'nckma.start() run cb (already started)', [ cb, cbArgs ] );
			} else {
				nkStartCbs.push( cb );
				nckma.debug( nckma._dL.ev, 'nckma.start() cb added', [ cb, cbArgs ] );
			}
		}
	};

	/* nckma.stor_size() is very loose and is really only meant to be a guestimate of localStorage usage */
	nckma.stor_size = function ( inMB ) {
		if ( inMB ) {
			return Math.round( ( ( unescape( encodeURIComponent( JSON.stringify( localStorage ) ) ).length ) / 1024 / 1024 ) * 100000) / 100000;
		}
		return ( unescape( encodeURIComponent( JSON.stringify( localStorage ) ) ).length );
	};

	/* nckma.stor_key_size() is very loose and is really only meant to be a guestimate of localStorage usage */
	nckma.stor_key_size = function ( key, inMB ) {
		if ( !bpmv.str(localStorage[key]) ) {
			return 0;
		}
		if ( inMB ) {
			return Math.round( ( ( unescape( encodeURIComponent( localStorage[key] ) ).length ) / 1024 / 1024 ) * 100000 ) / 100000;
		}
		return ( unescape( encodeURIComponent( localStorage[key] ) ).length );
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
		if ( bpmv.obj(nckma._cache.version) ) {
			return nckma._cache.version;
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
			nckma._cache.version = ret;
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

	/*
	* startup cb
	*/

	nckma.start( function () {
		nckma.version();
		if ( nckma._bgTask ) {
			nckma.ev( 'beat', nckma.poll );
			nckma.begin();
		}
	});

return nckma; })() && (function () {

	/*
	********************************************************************************
	********************************************************************************
	* DATABASE
	********************************************************************************
	********************************************************************************
	*/

	nckma.db = {};

	// unlimitedStorage permission overrides size I think
	var nkDataDb = openDatabase( 'nkDataDb', '2.0', 'Narcikarma Data', 20 * 1024 * 1024 )
		nkUserTableRx = /^user\_.*\_data$/;

	function handle_user_clear( arr, tx, res ) {
		var dbg = nckma.testing( true )
			, iter
			, len = 0
			, tn;
		if ( bpmv.arr(arr) ) {
			len = arr.length;
			for ( iter = 0; iter < len; iter++ ) {
				if ( bpmv.obj(arr[iter]) && bpmv.str(arr[iter].name) ) {
					tn = nckma.db.sane_name( arr[iter].name );
					if ( bpmv.str(tn) && (nkUserTableRx).test( tn ) ) {
						if ( dbg ) {
							nckma.debug( nckma._dL.db, 'Attempting to remove user table...', tn );
						}
						nckma.db.sql( 'DROP TABLE '+tn+';', function ( subTx ) {
							if ( dbg ) {
								nckma.debug( nckma._dL.db, 'User table '+tn+' removal result:', arguments );
							}
						} );
					}
				}
			}
		}
	}

	function proc_result ( res ) {
		var iter
			, len
			, ret
			, dbg = nckma.testing( true );
		if ( bpmv.obj(res) && bpmv.typeis( res, 'SQLResultSet' ) ) {
			if ( ( res.rowsAffected === 1) && bpmv.num(res.insertId, true) ) {
				if ( dbg ) {
					nckma.debug( nckma._dL.dbDetail, '[nckma.db] proc single insert', [ res.insertId, arguments ] );
				}
				return res.insertId;
			} else if ( bpmv.obj(res.rows) && bpmv.num(res.rows.length) ) {
				len = res.rows.length;
				ret = [];
				for ( iter = 0; iter < len; iter++){
					ret.push( res.rows.item( iter ) );
				}
				if ( dbg ) {
					nckma.debug( nckma._dL.dbDetail, '[nckma.db] proc result', [ ret, arguments ] );
				}
				return ret;
			} else {
				if ( dbg ) {
					nckma.debug( nckma._dL.dbDetail, '[nckma.db] proc null', arguments );
				}
			}
		}
	}

	nckma.db.error = function ( tx, err ) {
		if ( bpmv.obj(tx) ) {
			if ( bpmv.func(tx._nckmaCb) ) {
				tx._nckmaCb.apply( window, arguments );
			}
		}
		nckma.err( '[nckma.db] Database transaction error!!!', tx );
		return;
	};

	nckma.db.op = function ( tx, res ) {
		var ret
			, args
			, dbg
			, txt = false;
		if ( bpmv.obj(tx) ) {
			dbg = nckma.testing( true );
			args = $.extend( [], arguments );
			switch ( bpmv.whatis(tx) ) {
				case 'SQLTransaction':
					ret = proc_result( res );
					args.unshift( ret );
					if ( dbg ) {
						nckma.debug( nckma._dL.dbOps, '[nckma.db] Op SQLTransaction', arguments );
					}
					break;
				default:
					args.unshift( ret ); // undefined
					if ( dbg ) {
						nckma.debug( nckma._dL.dbOps, '[nckma.db] Op '+bpmv.whatis(tx), arguments );
					}
					break;
			}
			if ( bpmv.func(tx._nckmaCb) ) {
				tx._nckmaCb.apply( window, args );
			}
		}
		return ret;
	};

	nckma.db.sane = function ( val, noQuotes ) {
		switch ( bpmv.whatis(val).toLowerCase() ) {
			case 'string':
				if ( noQuotes ) {
					return encodeURIComponent( val );
				} else {
					return '"'+encodeURIComponent( val )+'"';
				}
				break;
			case 'number':
				return val;
				break;
			case 'nan':
			case 'null':
			case 'undefined':
				return "";
				break;
		}
		if ( bpmv.obj() || bpmv.arr() ) {
			if ( noQuotes ) {
				return encodeURIComponent( JSON.stringify( val ) );
			} else {
				return '"'+encodeURIComponent( JSON.stringify( val ) )+'"';
			}
		}
	};

	nckma.db.sane_name = function ( val ) {
		var iter
			, len
			, ret = ''
			, tRet
			, rex = /[a-z0-9\_]/i;
		if ( bpmv.str(val) ) {
			tRet = (''+val).replace( /\_\s\S\n\r/g, '_' );
			len = tRet.length;
			for ( iter = 0; iter < len; iter++ ) {
				if ( rex.test( tRet[iter] ) ) {
					ret += tRet[iter];
				}
			}
			ret = ret.replace( /(^[0-9\_]+|[\_]+$)/, '' );
			if ( ret.length ) {
				return ret;
			}
		}
	};

	nckma.db.sql = function ( sql, cb ) {
		if ( bpmv.str(sql) ) {
			try {
				nckma.debug( nckma._dL.dbSql, 'running SQL', { 'sql' : sql, 'cb' : cb } );
				return nkDataDb.transaction( function ( tx ) {
					tx._nckmaCb = cb;
					tx._nckmaSql = sql;
					tx.executeSql( sql, [], nckma.db.op, nckma.db.error );
				});
			} catch ( err ) {
				nckma.err( 'SQL Error.', { 'e' : err, 'args' : arguments } );
			}
		}
	};

	nckma.db.user_clear = function ( user ) {
		var un;
		if ( bpmv.str(user) ) {
			un = nckma.db.sane_name( user );
			if ( bpmv.str(un) && !(nkUserTableRx).test( un ) ) {
				un = 'user_'+un+'_data';
			}
			if ( bpmv.str(un) ) {
				return nckma.db.sql( 'SELECT name FROM sqlite_master WHERE type=\'table\' AND name=\''+un+'\' ORDER BY name LIMIT 1;', handle_user_clear );
			}
		} else if ( ( typeof(user) === 'boolean' ) && user ) { // must pass boolean true for all
			return nckma.db.sql( 'SELECT name FROM sqlite_master WHERE type=\'table\' ORDER BY name;', handle_user_clear );
		}
	};

	nckma.db.user_insert = function ( user, data, iCb ) {
		var ins = {}
			, iter = null
			, un = nckma.db.sane_name( user );
		if ( bpmv.str(un) && bpmv.obj(data, true) ) {
			for ( iter in data ) {
				if ( bpmv.str(iter) && data.hasOwnProperty(iter) && bpmv.num(data[iter], true) ) {
					switch ( iter.toLowerCase() ) {
						case 'comment_karma':
						case 'ckarma':
						case 'c':
							ins.cKarma = parseInt( data[iter], 10 );
							break;
						case 'delta':
						case 'd':
							ins.delta = parseInt( data[iter], 10 );
							break;
						case 'link_karma':
						case 'lkarma':
						case 'l':
							ins.lKarma = parseInt( data[iter], 10 );
							break;
						case 'timestamp':
						case 'epoch':
						case 't':
							ins.epoch = parseInt( data[iter], 10 );
							break;
						default:
							break;
					}
				}
			}
			if ( bpmv.obj(ins, true) ) {
				var sql = '';
				if ( !bpmv.num(ins.epoch) ) {
					ins.epoch = new Date().getTime();
				}
				sql += 'INSERT INTO';
				sql += ' user_'+un+'_data';
				sql += ' ( '+bpmv.keys( ins ).join( ', ' )+' )';
				sql += ' VALUES';
				sql += ' ( "'+bpmv.values( ins ).join( '", "' )+'" )';
				sql += ';';
				nckma.db.sql( sql, function ( id ) {
					if ( bpmv.num(id, true) ) {
						nckma.ev( 'dbUserInsert', $.extend( [], arguments ) );
					}
					if ( bpmv.func(iCb) ) {
						iCb.apply( window, arguments );
					}
				});
			}
		} else {
			nckma.warn( 'Could not insert into user table. User name or data object invalid.', { 'args' : arguments, 'use' : un } );
		}
	};

	nckma.db.user_table = function ( user, tCb ) {
		var sql = ''
			, un = nckma.db.sane_name( user );
		if ( bpmv.str( un ) ) {
			nckma.db.sql( 'SELECT name FROM sqlite_master WHERE type=\'table\' AND name=\'user_'+un+'_data\' ORDER BY name LIMIT 1;', function ( res ) {
				if ( !bpmv.arr(res) ) {
					sql += 'CREATE TABLE IF NOT EXISTS';
					sql += ' user_'+un+'_data(';
					sql += ' id INTEGER PRIMARY KEY AUTOINCREMENT,';
					sql += ' epoch INTEGER NOT NULL DEFAULT 0,';
					sql += ' delta INTEGER NOT NULL DEFAULT 0,';
					sql += ' cKarma INTEGER NOT NULL DEFAULT 0,';
					sql += ' lKarma INTEGER NOT NULL DEFAULT 0';
					sql += ');';
					nckma.db.sql( sql, function () {
						var args = $.extend( [], arguments );
						args.unshift( user );
						nckma.ev( 'dbUserTableCreated', args );
						if ( bpmv.func(tCb) ) {
							tCb.apply( window, args );
						}
					});
				} else {
					if ( bpmv.func(tCb) ) {
						tCb.apply( window, [] );
					}
				}
			});
		} else {
			nckma.warn( 'Could not check/create user table. User name invalid.', { 'orig' : user, 'use' : un } );
		}
	};

return nckma.db; })() && (function () {

	/*
	********************************************************************************
	********************************************************************************
	* OPTIONS
	********************************************************************************
	********************************************************************************
	*/

	nckma.opts = {};

	/*
	* vars
	*/

	var nckmaNeedsSave = false
		, nkMaxHist = 8000
		, nkSettings = {}
		, nkSettingsKeys = []
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
		}
		, nckFlagEnum = [
			  {
			    'v' : 'blank'
			  , 'n' : 'blank'
			}
			, {
				  'v' : 'has_mail_both'
				, 'n' : 'Messages or Mod Mail'
			}
			, {
				  'v' : 'has_mail'
				, 'n' : 'Messages/User Mail'
			}
			, {
				  'v' : 'has_mod_mail'
				, 'n' : 'Mod Mail'
			}
			, {
				  'v' : 'is_mod'
				, 'n' : 'Moderator'
			}
			, {
				  'v' : 'is_gold'
				, 'n' : 'Reddit Gold'
			}
		]
		, nckRowEnum = [
			  {
			    'v' : 'cKarma'
			  , 'n' : 'Comment Karma'
			}
			, {
				  'v' : 'flagsAndC'
				, 'n' : 'Alternate Status Flags and Comment Karma'
			}
			, {
				  'v' : 'flagsAndL'
				, 'n' : 'Alternate Status Flags and Link Karma'
			}
			, {
				  'v' : 'lKarma'
				, 'n' : 'Link Karma'
			}
			, {
				  'v' : 'flags'
				, 'n' : 'Status Flags'
			}
		];

	nkSettings['alertCommentGain'] = {
		  'def'   : '50'
		, 'type'  : 'int'
		, 'title' : 'Alert After Comment Karma Threshold'
		, 'desc'  : 'When your comment karma has increased by this amount, an alert will be shown.'
		, 'min'   : 10
		, 'kill0' : true
	};
	nkSettings['alertLinkGain'] = {
		  'def'   : '50'
		, 'type'  : 'int'
		, 'title' : 'Alert After Link Karma Threshold'
		, 'desc'  : 'When your link karma has increased by this amount, an alert will be shown.'
		, 'min'   : 10
		, 'kill0' : true
	};
	nkSettings['alternateTime'] = {
		  'def'   : '2'
		, 'type'  : 'int'
		, 'title' : 'Flag Alternate Time'
		, 'desc'  : 'The time for a row to alternate between flags and other information, if used.'
		, 'min'   : 1
	};
	nkSettings['color_black'] = {
		  'def'   : '0, 0, 0, 1'
		, 'type'  : 'color'
		, 'title' : 'Black Color'
		, 'desc'  : 'Black Color.'
	};
	nkSettings['color_blue'] = {
		  'def'   : '0, 0, 235, 1'
		, 'type'  : 'color'
		, 'title' : 'Blue Color'
		, 'desc'  : 'Blue Color.'
	};
	nkSettings['color_gold'] = {
		  'def'   : '176, 176, 21, 1'
		, 'type'  : 'color'
		, 'title' : 'Gold Color'
		, 'desc'  : 'Gold Color.'
	};
	nkSettings['color_gray'] = {
		  'def'   : '128, 128, 128, 1'
		, 'type'  : 'color'
		, 'title' : 'Grey Color'
		, 'desc'  : 'Grey Color.'
	};
	nkSettings['color_green'] = {
		  'def'   : '0, 190, 0, 1'
		, 'type'  : 'color'
		, 'title' : 'Green Color'
		, 'desc'  : 'Green Color.'
	};
	nkSettings['color_purple'] = {
		  'def'   : '215, 0, 215, 1'
		, 'type'  : 'color'
		, 'title' : 'Purple Color'
		, 'desc'  : 'Purple Color.'
	};
	nkSettings['color_negChange'] = {
		  'def'   : '235, 0, 0, 1'
		, 'type'  : 'color'
		, 'title' : 'Negative Change Color'
		, 'desc'  : 'Color for a "Negative" change in karma.'
	};
	nkSettings['color_noChange'] = {
		  'def'   : '0, 0, 0, 1'
		, 'type'  : 'color'
		, 'title' : 'No Change Color'
		, 'desc'  : 'Color for no change in karma.'
	};
	nkSettings['color_posChange'] = {
		  'def'   : '0, 190, 0, 1'
		, 'type'  : 'color'
		, 'title' : 'Positive Change Color'
		, 'desc'  : 'Color for a "Positive" change in karma.'
	};
	nkSettings['color_red'] = {
		  'def'   : '235, 0, 0, 1'
		, 'type'  : 'color'
		, 'title' : 'Red Color'
		, 'desc'  : 'Red Color.'
	};
	nkSettings['cumulativeKarma'] = {
		  'def'   : 'true'
		, 'type'  : 'bool'
		, 'title' : 'Show Cumulative Karma'
		, 'desc'  : 'Show the karma change for all of the history, not just this browser session.'
	};
	nkSettings['dateFormat'] = {
		  'def'   : 'US'
		, 'type'  : 'enum'
		, 'title' : 'Date Format'
		, 'desc'  : 'Format for dates.'
		, 'enum'  : [
			  { 'v' : 'UK', 'n' : 'UK' }
			, { 'v' : 'US', 'n' : 'US' }
		]
	};
	nkSettings['flag0'] = {
		  'def'   : 'has_mail'
		, 'type'  : 'enum'
		, 'title' : 'First Flag'
		, 'desc'  : 'First flag shown on a flag row.'
		, 'enum'  : $.extend( [], nckFlagEnum )
	};
	nkSettings['flag1'] = {
		  'def'   : 'is_mod'
		, 'type'  : 'enum'
		, 'title' : 'Second Flag'
		, 'desc'  : 'Second flag shown on a flag row.'
		, 'enum'  : $.extend( [], nckFlagEnum )
	};
	nkSettings['flag2'] = {
		  'def'   : 'has_mod_mail'
		, 'type'  : 'enum'
		, 'title' : 'Third Flag'
		, 'desc'  : 'Third flag shown on a flag row.'
		, 'enum'  : $.extend( [], nckFlagEnum )
	};
	nkSettings['flag3'] = {
		  'def'   : 'is_gold'
		, 'type'  : 'enum'
		, 'title' : 'Last Flag'
		, 'desc'  : 'Last flag shown on a flag row.'
		, 'enum'  : $.extend( [], nckFlagEnum )
	};
	nkSettings['interval'] = {
		  'def'   : '600'
		, 'type'  : 'int'
		, 'title' : 'Refresh Interval'
		, 'desc'  : 'Interval that your karma stats will be checked.'
		, 'min'   : nckma.testing() ? 4 : 59
		, 'kill0' : true
	};
	nkSettings['row0'] = {
		  'def'   : 'lKarma'
		, 'type'  : 'enum'
		, 'title' : 'Top Icon Row Contents'
		, 'desc'  : 'Contents of top icon row.'
		, 'enum'  : $.extend( [], nckRowEnum )
	};
	nkSettings['row1'] = {
		  'def'   : 'cKarma'
		, 'type'  : 'enum'
		, 'title' : 'Bottom Icon Row Contents'
		, 'desc'  : 'Contents of bottom icon row.'
		, 'enum'  : $.extend( [], nckRowEnum )
	};
	nkSettings['savedRefreshes'] = {
		  'def'   : '5000'
		, 'type'  : 'int'
		, 'title' : 'Saved History Items'
		, 'desc'  : 'Size of the karma gain/loss history.'
		, 'min'   : 5
		, 'max'   : 8000
		, 'kill0' : true
	};

	nkSettingsKeys = bpmv.keys( nkSettings, true );

	nckma.opts.valid_color = function ( val, setting ) {
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
		, 'interval'         : function ( val ) { return ( parseInt(val) > ( nckma.testing() ? 4 : 119 ) ) || ( parseInt(val) === 0 ) ? true : nkOptionNames['interval'] + ' must be 1 minute or more.'; }		
		, 'savedRefreshes'   : function ( val ) { val = parseInt( val, 10 ); return ( ( val >= 0 ) && ( val <= nkMaxHist ) ? true : nkOptionNames['savedRefreshes'] + ' must be a number between 0 and '+nkMaxHist+'.' ); }
	};

	/*
	* functions
	*/

	nckma.opts.bad_setting = function ( type, setting, args ) {
		nckma.err( 'nckma.opts.valid_'+type+'(): Setting "'+setting+'" is invalid in source. Please report a bug.', { 'args' : args } );
		return 'Setting "'+setting+'" is invalid in source. Please report a bug. Type: "'+type+'"; Arguments: '+( bpmv.obj(args) || bpmv.arr(args) ? JSON.stringify( args ) : args )+';';
	}

	/*
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
	*/

	nckma.opts.defaults_get = function ( extended ) {
		var ret = null
			, iter = null;
		if ( extended ) {
			ret = $.extend( {}, nkSettings );
		} else {
			ret = {};
			for ( iter in nkSettings ) {
				if ( nkSettings.hasOwnProperty( iter ) && bpmv.obj(nkSettings[iter], true) ) {
					ret[iter] = ''+nkSettings[iter].def;
				}
			}
			if ( !bpmv.obj(ret, true) ) {
				ret = null;
			}
		}
		return ret;
	}

	nckma.opts.defaults_set = function ( preserve ) {
		var defs = nckma.opts.defaults_get()
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
				nckma.opts.ui_restore() && nckma.opts.save();
			}
			if ( !bpmv.bool(preserve) || !preserve ) {
				nckma.track( 'func', 'nckma.opts.ui_restore DEFAULTS', 'nkExec' );
			}
		}
	};

	nckma.opts.get = function ( asJson ) {
		var opts = {}
			, defs = nckma.opts.defaults_get();
		for ( var aC in defs ) {
			if ( defs.hasOwnProperty( aC ) ) {
				opts[aC] = localStorage[aC];
			}
		}
		if ( asJson ) {
			return JSON.stringify( opts );
		}
		return opts;
	};

	// Saves options to localStorage.
	nckma.opts.save = function () {
		var cache = nckma._cache
			, defs = nckma.opts.defaults_get()
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
						nckma.opts.ui_status( aC, nkOptionNames[aC]+'set to ' + newTxt + '.' );
						if ( jlGood ) {
							jL.append( '<li style="color: rgba( ' + localStorage['color_green'] + ' );">'+nkOptionNames[aC]+' set to &quot;'+newTxt+'&quot;</li>' );
						}
					} else if ( bpmv.str(statText) ) {
						nckma.opts.ui_status( aC, 'Failed saving &quot;'+nkOptionNames[aC]+'&quot;. ' + statText + '.', true );
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
		nckma.opts.ui_change( null, true );
		nckma.track( 'func', 'nckma.opts.save', 'nkExec' );
		nckma.track( 'saved', '', 'nkOptions' );
	};

	// Detect changes in the options page elements
	nckma.opts.ui_change = function ( ev, noList ) {
		var tJ = null
			, defs = nckma.opts.defaults_get()
			, ego = null
			, changed = 0
			, jT = $(this)
			, jL = $('#changed_options_list')
			, newVal = null
			, addClass = false;
		if ( (/^(alpha|picker)_opt_color_/).test( jT.attr( 'id' ) ) ) {
			return;
		}
		$( '.tab-single' ).removeClass( 'nckTabChanged' );
		if ( bpmv.obj(jL) && bpmv.num(jL.length) && !noList ) {
			jL.empty();
		}
		for ( var aC in defs ) {
			addClass = false;
			tJ = $('#opt_'+aC);
			if ( defs.hasOwnProperty( aC ) && bpmv.str(aC) && bpmv.obj(tJ) && bpmv.num(tJ.length) ) {
				newVal = ''+tJ.val();
				if ( tJ.is( 'input[type="checkbox"]' ) ) {
					newVal = ''+tJ.is(':checked');
					if ( bpmv.trueish( localStorage[aC] ) != bpmv.trueish( newVal ) ) {
						changed++;
						addClass = true;
						if ( !noList ) {
							jL.append( '<li>'+nkOptionNames[aC]+' changed from &quot;'+localStorage[aC]+'&quot; to &quot;'+newVal+'&quot;</li>' );
						}
					}
				} else if ( newVal != localStorage[aC] ) {
					changed++;
					addClass = true;
					if ( !noList ) {
						jL.append( '<li>'+nkOptionNames[aC]+' changed from &quot;'+localStorage[aC]+'&quot; to &quot;'+newVal+'&quot;</li>' );
					}
				}
				if ( addClass ) {
					tJ.parentsUntil( '.tab-single' ).parent().addClass( 'nckTabChanged' );
					tJ.parent().addClass( 'nckOptionChanged' );
				} else {
					tJ.parent().removeClass( 'nckOptionChanged' );
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
	nckma.opts.ui_change_color = function () {
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

	nckma.opts.ui_init = function () {
		var ivlSel = null
			, tStr = null
			, bgP = chrome.extension.getBackgroundPage();
		if ( $('body.nckOptions').is( ':visible' ) ) {
			if ( nckma.testing() ) {
				ivlSel = $('#opt_interval');
				$('<h3>DEV MODE <span class="nkNote"><a href="_test_canvas.html" target="_blank">canvas test</a></span></h3>').insertAfter( '#nck_title' );
				// add dev time options
				if ( bpmv.obj(ivlSel) && bpmv.num(ivlSel.length) ) {
					ivlSel.prepend( '<option value="30" style="color: #fff; background: #900">test 30 sec</option>' );
					ivlSel.prepend( '<option value="15" style="color: #fff; background: #900">test 15 sec</option>' );
					ivlSel.prepend( '<option value="10" style="color: #fff; background: #900">test 10 sec</option>' );
					ivlSel.prepend( '<option value="5" style="color: #fff; background: #900">test 5 sec</option>' );
				}
				// add dev kill data tool
				tStr = '';
				tStr += '<div class="nckOptionsContainer" title="KILL ALL THE DATA!">\n';
				tStr += '<button id="nck_btn_kill_all" class="nckDangerButton">Kill All Data</button>\n';
				tStr += '<label for="nck_btn_kill_all" class="label-right">Dev only! Kill all localStorage and DB storage.</label>\n';
				tStr += '&nbsp;<span id="opt_nck_btn_kill_all_status"></span>\n';
				tStr += '</div>\n';
				$('#tools_tab .tab-contents').append( tStr ).find('#nck_btn_kill_all').click( function ( ev ) {
					if ( confirm( 'This will erase all localStorage and DB storage. May have detrimental effects!') ) {
						localStorage.clear();
						nckma.opts.ui_restore();
						bgP.nckma.reset( true );
						nckma.track( 'func', 'nck_btn_kill_all - DEV', 'nkExec' );
					}
				});
				// log use of dev
				nckma.track( 'func', 'nckma.opts.ui_init - DEV', 'nkExec' );
			}
		}
	};

	// Restores select box state to saved value from localStorage.
	nckma.opts.ui_restore = function () {
		var cache = nckma._cache
			, defs = nckma.opts.defaults_get()
			, lJ = null
			, set = null
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
						set = bpmv.obj(nkSettings[aC]) ? nkSettings[aC] : null;
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
						if ( bpmv.obj(set) ) {
							if ( bpmv.str(set.title) ) {
								if ( cache[aC].is( 'input[id^="opt_color_"]' ) ) {
									$('label[for="picker_opt_'+aC+'"]').text( set.title.replace( /\scolor$/i, '' ) );
								} else {
									$('label[for="opt_'+aC+'"]').text( set.title );
								}
							}
							if ( bpmv.str(set.type) && ( set.type == 'enum' ) && bpmv.arr(set.enum) && bpmv.num(set.enum.length) ) {
								cache[aC].empty();
								for ( var en = 0; en < set.enum.length; en++ ) {
									cache[aC].append( '<option value="'+set.enum[en].v+'" '+(localStorage[aC] == set.enum[en].v ? ' selected="selected"' : '')+'>'+set.enum[en].n+'</option' );
								}
							}
							if ( bpmv.str(set.desc) ) {
									cache[aC].prevUntil( '.nckOptionsContainer' ).parent().attr( 'title', set.desc )
							}
						}
					}
				}
			}
			nckma.opts.ui_change();
			return true;
		}
	};

		// Saves options to localStorage.
	nckma.opts.ui_save = function () {
		var cache = nckma._cache
			, defs = nckma.opts.defaults_get()
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
						nckma.opts.ui_status( aC, nkOptionNames[aC]+'set to ' + newTxt + '.' );
						if ( jlGood ) {
							jL.append( '<li style="color: rgba( ' + localStorage['color_green'] + ' );">'+nkOptionNames[aC]+' set to &quot;'+newTxt+'&quot;</li>' );
						}
					} else if ( bpmv.str(statText) ) {
						nckma.opts.ui_status( aC, 'Failed saving &quot;'+nkOptionNames[aC]+'&quot;. ' + statText + '.', true );
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
		nckma.opts.ui_change( null, true );
		nckma.track( 'func', 'nckma.opts.save', 'nkExec' );
		nckma.track( 'saved', '', 'nkOptions' );
	};

	nckma.opts.ui_status = function ( optName, txt, isErr ) {
		var jEle    = null
			, fadeIn  = 100
			, fadeOut = 8000;
		if ( bpmv.str(optName) && bpmv.str(txt) ) {
			isErr = isErr ? true : false;
			if ( !bpmv.obj(nckma._cache[optName+'_status']) || !bpmv.num(nckma._cache[optName+'_status'].length) ) {
				nckma._cache[optName+'_status'] = $('#opt_'+optName+'_status');
				if ( !nckma._cache[optName+'_status'] ) {
					return;
				}
			}
			jEle = nckma._cache[optName+'_status'];
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

	nckma.opts.valid_bool = function ( val, setting ) {
		var set = bpmv.str(setting) ? nkSettings[setting] : null
			, setTit = '';
		if ( bpmv.obj(set, true) && ( set.type === 'bool' ) ) {
			setTit = bpmv.str(set.title) ? set.title : setting;
			return /^(true|false|on|off|checked)$/i.test( ''+val ) ? true : 'Setting "'+setTit+'" must be true or false.';
		}
		return nckma.opts.bad_setting( 'bool', setting, arguments );
	};

	nckma.opts.valid_color = function ( val, setting ) {
		var set = bpmv.str(setting) ? nkSettings[setting] : null
			, setTit = '';
		if ( bpmv.obj(set, true) && ( set.type === 'color' ) ) {
			setTit = bpmv.str(set.title) ? set.title : setting;
			return nckma.px.color_test( val ) ? true : 'Setting "'+setTit+'" must to be in the format "0-255, 0-255, 0-255, 0.0-1.0".';
		}
		return nckma.opts.bad_setting( 'bool', setting, arguments );
	};

	nckma.opts.valid_enum = function ( val, setting ) {
		var set = bpmv.str(setting) ? nkSettings[setting] : null
			, v = parseInt( val, 10 )
			, i = 0
			, oneOf = ''
			, setTit = '';
		if ( bpmv.obj(set, true) && ( set.type === 'enum' ) && bpmv.arr(set.enum) ) {
			setTit = bpmv.str(set.title) ? set.title : setting;
			for ( i = 0; i < set.enum.length; i++ ) {
				if ( bpmv.str(set.enum[i].v) ) {
					if ( set.enum[i].v == val ) {
						return true;
					}
					if ( bpmv.str(set.enum[i].n) ) {
						oneOf += '"'+set.enum[i].n+'"';
					} else {
						oneOf += '"'+set.enum[i].v+'"';
					}
					oneOf += ( i == set.enum.length - 1 ) ? '' : ( ( i < set.enum.length - 2 ) ? ', ' : ', or ' );
				}
			}
			if ( bpmv.str( oneOf ) ) {
				return 'Setting "'+setTit+'" must be one of '+oneOf+'.';
			}
		}
		return nckma.opts.bad_setting( 'enum', setting, arguments );
	};

	nckma.opts.valid_int = function ( val, setting ) {
		var set = bpmv.str(setting) ? nkSettings[setting] : null
			, v = parseInt( val, 10 )
			, ret = ''
			, setTit = '';
		if ( bpmv.obj(set, true) && ( set.type === 'int' ) ) {
			setTit = bpmv.str(set.title) ? set.title : setting;
			ret += 'Setting "'+setTit+'" must be a number';
			ret += (bpmv.num(set.min, true) ? ' higher than '+set.min : '');
			ret += (bpmv.num(set.min, true) && bpmv.num(set.max) ? (set.kill0 ? ',' : ' and') : '');
			ret += (bpmv.num(set.max) ? ' lower than '+set.max : '');
			ret += ((bpmv.num(set.min, true) || bpmv.num(set.max)) && set.kill0 ? ',' : '');
			ret += (set.kill0 ? ' or 0 to disable' : '');
			ret += '.';
			if ( bpmv.num(v, true) ) {
				if ( bpmv.num(set.min, true) && ( v < set.min ) ) {
					if ( !( set.kill0 && ( v === 0 ) ) || !set.kill0 ) {
						return ret;
					}
				}
				if ( bpmv.num(set.max) && ( v > set.max ) ) {
					return ret;
				}
				return true;
			} else {
				return ret;
			}
		}
		return nckma.opts.bad_setting( 'int', setting, arguments );
	};

	/*
	* startup cb
	*/

	nckma.start( function () {
		console.log( 'nkSettings', { 'curr_len' : bpmv.count( nkSettings ) } );
		console.log( 'nkSettingsKeys', nkSettingsKeys );
	});

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
		nckma.opts.defaults_set( true );
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
						nckma.debug( nckma._dL.px, 'Substituting color for black.', color );
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

	nckma.sk.data = function () {
		var hist = nckma.get().history;
	}

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
			  { 'name' : 'base64.js',        'link' : 'https://code.google.com/p/javascriptbase64/' }
			, { 'name' : 'bpmv',             'link' : 'https://github.com/BrynM/bpmv' }
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

	$(document).ready( function () {
		nckma.start( true, arguments );
	});

})();
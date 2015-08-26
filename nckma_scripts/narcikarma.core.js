// chrome.browserAction.setBadgeText(object details)

if (typeof(nckma) != 'object') {
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

	var nkColorRgxHex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;
	var nkDebugLvl = 15;
	var nkEvs = {};
	var nkFlags = {
		'debug': true,
		'ga': true,
		'testing': true,
		// read configuration fallbacks...
		'aConfFB': false
	};
	var nkLastPoll = null;
	// aslo see nkMaxHist in the options section
	var nkMaxHistReal = 8000;
	var nkPollInterval = 1000;
	var nkIsPolling = false;
	var nkDataFirst = bpmv.str(localStorage['_lastCached']) ? JSON.parse(localStorage['_lastCached']) : null;
	var nkDataLast = null;
	//var nkDataSet = bpmv.str(localStorage['_dataSet']) ? JSON.parse(localStorage['_dataSet']) : [];
	var nkManifest = null;
	var nkQuietEvents = [
		'beat'
	];
	var nkSetInterval = null;
	var nkStartCbs = [];
	var nkStarted = false;
	var nkUrls = {
		'cakeNuthin': 'http://www.google.com/search?q=karma+machine&tbm=isch',
		'cakeYay': 'https://www.reddit.com/r/cakeday/',
		'credits': '/nckma_html/credits.html',
		'getGoldCredits': 'https://www.reddit.com/gold?goldtype=creddits&num_creddits=12&edit=true',
		'giveGold': 'https://www.reddit.com/gold?goldtype=gift&months=1',
		'gold': 'http://www.reddit.com/gold',
		'graphs': '/nckma_html/graphs.html',
		'inbox': 'https://www.reddit.com/message/inbox/',
		'lounge': 'https://www.reddit.com/r/lounge',
		'modmail': 'http://www.reddit.com/message/moderator/',
		'modqueue': 'https://www.reddit.com/r/mod/about/modqueue',
		'options': '/nckma_html/options.html',
		'source': 'https://github.com/BrynM/Narcikarma',
		'subreddit': 'https://www.reddit.com/r/Narcikarma/',
		'user': 'https://www.reddit.com/api/me.json',
		'userBase': 'https://www.reddit.com/user/',
		//'userTest': 'chrome-extension://icceijjenpflpdbbdndflpomakbkpdgi/nckma_scripts/me.json'
		//'userTest': 'http://narcikarma.net/test/me.php?d=1.25'
		//'userTest': 'https://www.reddit.com/api/me.json',
		'userTest': 'http://narcikarma.net/nckma_scripts/me.json',
		'webstore': 'https://chrome.google.com/webstore/detail/narcikarma/mogaeafejjipmngijfhdjkmjomgdicdg'
	};
	var nkUserData = {};
	var nkDefaults = {
		'alertCommentGain': '50',
		'alertLinkGain': '50',
		// in seconds,
		'alternateTime': '2',
		'color_black': '0, 0, 0, 1',
		'color_blue': '0, 0, 235, 1',
		'color_gold': '176, 176, 21, 1',
		'color_gray': '128, 128, 128, 1',
		'color_green': '0, 190, 0, 1',
		'color_purple': '215, 0, 215, 1',
		'color_negChange': '235, 0, 0, 1',
		'color_noChange': '0, 0, 0, 1',
		'color_posChange': '0, 190, 0, 1',
		'color_red': '235, 0, 0, 1',
		'cumulativeKarma': 'true',
		'dateFormat': 'US',
		'flag0': 'has_mail',
		'flag1': 'is_mod',
		'flag2': 'has_mod_mail',
		'flag3': 'is_gold',
		// in seconds
		'interval': '600',
		// one of cKarma, lKarma, flags
		'row0': 'lKarma',
		'row1': 'cKarma',
		'savedRefreshes': '1000'
	};
	var nkPages = {
		'background': 'nckma_html/background.html',
		'notification': 'nckma_html/notification.html',
		'options': 'nckma_html/options.html'
	};

	/*
	* load GA
	*/
	if (nkFlags['ga'] && bpmv.func(load_nckma_ga)) {
		nkFlags['debug'] && console.log('[Narcikarma Debug] loading GA');
		load_nckma_ga();
	}

	/*
	* props
	*/

	// selector cache
	nckma._cache = {};

	// debug levels
	nckma._dL = {
		'all': 0,
		'any': 0,
		'begin': 0,
		'db': 20,
		'dbDetail': 28,
		'dbOps': 23,
		'dbSql': 25,
		'ev': 10,
		'evQuiet': 18,
		'opts': 5,
		'poll': 2,
		'px': 30
	};

	/*
	* functions
	*/

	nckma.begin = function (cb) {
		var ver = nckma.version();
		var plug = '[BEGIN] ';

		if (nckma._bgTask) {
			nckma.debug(nckma._dL.begin, plug+'Narcikarma v'+nckma.version().str);
			nckma.opts.defaults_set(true);

			if (!bpmv.str(localStorage['nkCurrentVer'])) {
				nckma.ev('upgrade', {
					'old': localStorage['nkCurrentVer'],
					'new': ver
				});

				localStorage['nkCurrentVer'] = ver;
			}

			nckma.debug(nckma._dL.begin, plug+'active flags', nkFlags);

			if (nkFlags['debug']) {
				nckma.debug(nckma._dL.begin, plug+'debug level', nkDebugLvl);
			}

			if (nkFlags['testing']) {
				nckma.debug(nckma._dL.begin, plug+'test mode enabled');
			}

			nckma.debug(nckma._dL.begin, plug+'storage interval', localStorage['interval']);
			nckma.reset();

			if (!bpmv.num(nkSetInterval)) {
				nckma.debug(nckma._dL.begin, plug+'running background task - starting heartbeat');
				nkSetInterval = setInterval(nckma.heartbeat, nkPollInterval);
				// nkSetInterval = setInterval(nckma.poll, nkPollInterval);
			}

			nckma.track('func', 'nckma.begin', 'nkExec');
		}
	};

	nckma.debug = function (lvl, msg, etc) {
		var args = null;

		if (nkFlags['debug']) {
			if (!(/^[0-9]+$/).test(''+lvl)) {
				nckma.warn('nkma.debug() requires the first parameter to be the intiger debug level', arguments);
				console.trace();
				return;
			}

			nkDebugLvl = parseInt(nkDebugLvl, 10);

			if (parseInt(lvl, 10) > nkDebugLvl) {
				return;
			}

			args = $.extend([], arguments);
			args.shift();

			if (bpmv.num(bpmv.count(args)) && bpmv.str(args[0])) {
				args[0] = '[Narcikarma Debug '+lvl+','+nkDebugLvl+'] '+args[0];
				console.log.apply(console, args);
			} else {
				nckma.warn('nkma.debug() does not have enough arguments', arguments);
				console.trace();
			}
		}
	};

	nckma.err = function (msg, etc) {
		if (bpmv.num(bpmv.count(arguments)) && bpmv.str(arguments[0])) {
			arguments[0] = '[Narcikarma] ERROR: '+arguments[0];
		}

		console.error.apply(console, arguments);
	};

	nckma.ev = function (evName, cbOrData) {
		var iter = 0;
		var cbRes;
		var bulkRet = {};
		var plug = '[EVENT] ';
		var quietEvent = true;

		if (bpmv.arr(evName)) { // group of events
			for (iter = 0; iter < evName.length; iter++) {
				if (bpmv.str(evName[iter])) {
					nckma.ev(evName[iter], cbOrData);
					bulkRet[evName[iter]] = nkEvs[evName[iter]];
				}
			}

			return bulkRet;
		} else if (bpmv.str(evName)) {
			if (!bpmv.obj(nkEvs[evName])) {
				nkEvs[evName] = [];
			}

			if (bpmv.func(cbOrData)) {
				nkEvs[evName].push(cbOrData);
				nckma.debug(nckma._dL.ev, plug+'callback added '+evName, [cbOrData, nkEvs[evName]]);
				bulkRet[evName] = nkEvs[evName];

				return bulkRet;
			} else {
				quietEvent = bpmv.num(bpmv.find(evName, nkQuietEvents), true);

				if(!quietEvent) {
					nckma.debug(nckma._dL.ev, plug+'firing '+evName, [cbOrData, nkEvs[evName]]);
				} else {
					nckma.debug(nckma._dL.evQuiet, plug+'firing '+evName, [cbOrData, nkEvs[evName]]);
				}

				if (bpmv.arr(nkEvs[evName])) {
					for (iter = 0; iter < nkEvs[evName].length; iter++) {
						if (bpmv.func(nkEvs[evName][iter])) {
							cbRes = nkEvs[evName][iter].apply(nckma, arguments);
						}

						if (cbRes === false) {
							break;
						}
					}
				}

				bulkRet[evName] = nkEvs[evName];

				nckma.debug(nckma._dL.evQuiet, plug+'fired '+evName, cbRes);

				return bulkRet;
			}	
		}
		nckma.debug(nckma._dL.ev, plug+'FAILED', [arguments]);
	};

	// kill a cb event bind or for all events
	nckma.ev_kill = function (evName, cb) {
		var iter;
		var cbS = '';
		var ret = {};

		if (bpmv.str(evName) && bpmv.arr(nkEvs[evName]) && bpmv.func(cb)) {
			cbS = cb.toString();

			for (iter in nkEvs[evName]) {
				if (nkEvs[evName].hasOwnProperty(iter) && bpmv.func(nkEvs[evName][iter]) && (cbS === nkEvs[evName][iter].toString())) {
					nkEvs[evName].splice (iter, 1);
				}
			}
		} else if (bpmv.func(cb)) {
			for (iter in nkEvs) {
				if (nkEvs.hasOwnProperty(iter) && bpmv.str(iter)) {
					ret[iter] = nckma.ev_kill(iter, cb);
				}
			}
		}

		return $.extend({}, nkEvs);
	};

	nckma.get = function (asJson) {
		var opts = {};
		var full;

		full = {
			'start': $.extend({}, nkDataFirst ),
			'current': bpmv.obj(nkDataLast, true) ? $.extend({}, nkDataLast) : $.extend({}, nkDataFirst ),
			'options': nckma.opts.get()
		};

		if (asJson) {
			return JSON.stringify(full);
		}

		return full;
	};

	nckma.get_defaults = function () {
		return $.extend({}, nkDefaults);
	};

	nckma.get_url = function (url) {
		if (bpmv.str(url) && bpmv.str(nkUrls[url])) {
			return ''+nkUrls[url];
		}
	};

	nckma.get_text_status = function () {
		var ret = nckma.pages.tpl('ext_name_full')+'\n';

		ret += 'Last Check: '+nckma.pages.tpl('current_timestamp')+'\n';
		ret += 'Flags: ';

		for (var f = 0; f < 4; f++) {
			if(!bpmv.str(localStorage['flag'+f])) {
				continue;
			}

			switch(localStorage['flag'+f]) {
				case 'has_mail':
					ret += '[Mail]';
					break;
				case 'has_mod_mail':
					ret += '[Modmail]';
					break;
				case 'is_gold':
					ret += '[Gold]';
					break;
				case 'is_mod':
					ret += '[Mod]';
					break;
				case 'has_mail_both':
					ret += '[Mail/Modmail]';
					break;
				default:
					ret += '[blank]';
					break;
			}

			if (f < 3) {
				ret += ' ';
			}
		}

		ret += '\n\n';

		ret += 'User: '+nckma.pages.tpl('name')+'\n';

		ret += 'Total Karma: '+nckma.pages.tpl('start_total_karma')+' to ';
		ret += nckma.pages.tpl('total_karma')+'\n';

		ret += 'Link Karma: '+nckma.pages.tpl('start_link_karma')+' to ';
		ret += nckma.pages.tpl('current_link_karma')+'\n';

		ret += 'Comment Karma: '+nckma.pages.tpl('start_comment_karma')+' to ';
		ret += nckma.pages.tpl('current_comment_karma')+'\n';

		ret += 'Mail: '+nckma.pages.tpl('has_mail')+'\n';
		ret += 'Modmail: '+nckma.pages.tpl('has_mod_mail')+'\n';

		return ret;
	};

	nckma.heartbeat = function () {
		nckma.ev('beat');
	};

	nckma.hex2rgb = function (hex) {
		var res = null;

		if (bpmv.str(hex) && nkColorRgxHex.test(hex)) {
			res = hex.match(nkColorRgxHex);

			if (bpmv.arr(res, 4)) {
				return [
					parseInt(res[1], 16),
					parseInt(res[2], 16),
					parseInt(res[3], 16)
				];
			}
		}
	};

	nckma.info = function (asJson) {
		var man = null;

		if (!bpmv.obj(nkManifest)) {
			nkManifest = $.ajax( {
				'dataType': 'text',
				'async': false,
				'url': '/manifest.json'
			});

			if (bpmv.obj(nkManifest) && bpmv.str(nkManifest.responseText)) {
				nkManifest.parsed = JSON.parse(nkManifest.responseText);
			}
		}
		if (bpmv.obj(nkManifest) && bpmv.str(nkManifest.responseText)) {
			nkManifest.parsed = JSON.parse(nkManifest.responseText);

			return asJson ? ''+nkManifest.responseText : $.extend({}, nkManifest.parsed);
		} else {
			throw 'Narcikarma [nckma.info()] Cannot read manifest into nkManifest!';
		}
	};

	nckma.parse = function (dat, stat, ev) {
		var d = bpmv.obj(dat) && bpmv.obj(dat.data) ? dat.data : null;
		var cDelt = 0;
		var lDelt = 0;
		var nkDsLast = null;
		var dbg = nckma.testing(true);

		nkIsPolling = false;
		nckma.px.draw_status('parse');

		if (stat != 'success') {
			nckma.px.draw_line('CON', 1, nckma.px.color('red'));
			nckma.px.draw_line('ERR', 2, nckma.px.color('red'));
			nckma.px.draw_status('err');

			return;
		}

		if (bpmv.obj(d, true)) {
			if (bpmv.str(d.name)) {
				d.nkTimeStamp = new Date().getTime();

				if (!bpmv.obj(nkDataFirst) || (nkDataFirst.name != d.name)) {
					nckma.track('func', 'nckma.parse reset nkDataFirst newlogin', 'nkExec');
					nkDataFirst = d;
				}

				nckma.db.user_table(d.name, function () {
					nckma.db.user_insert( d.name, {
						'c': d.comment_karma,
						// time delta since last
						'd': bpmv.num(nkDsLast) ? d.nkTimeStamp - nkDsLast : 0,
						'l': d.link_karma,
						't': d.nkTimeStamp
					});
				});

				nkDataLast = d;
				localStorage['_lastCached'] = JSON.stringify(nkDataLast);

				switch (localStorage['row0']) {
					case 'flags':
						nckma.px.draw_change_flags(1);
						break
					case 'cKarma':
						nckma.px.draw_change_comment(1);
						break
					case 'lKarma':
					default:
						nckma.px.draw_change_link(1);
						break
				}

				switch (localStorage['row1']) {
					case 'flags':
						nckma.px.draw_change_flags(2);
						break
					case 'cKarma':
						nckma.px.draw_change_comment(2);
						break
					case 'lKarma':
					default:
						nckma.px.draw_change_link(2);
						break
				}
			}

			nckma.px.draw_status('idle');
			chrome.browserAction.setTitle({
				'title': nckma.get_text_status()
			});
		} else {
			nckma.px.draw_line('LOG', 1, nckma.px.color('blue'));
			nckma.px.draw_line('IN', 2, nckma.px.color('blue'));
			nckma.px.draw_status('err');

			return;
		}

		nckma.ev('parse', [dat, stat, ev]);

		if (dbg) {
			nckma.debug(nckma._dL.poll, 'nckma.parse()', nckma.get());
		}
	};

	nckma.poll = function () {
		var nckmaNow = new Date().getTime();
		var nckmaInterval = localStorage['interval'] * 1000;
		var nckmaElapsed = bpmv.typeis(nkLastPoll, 'Date') ? (nckmaNow - nkLastPoll.getTime()) : -1;
		var jax = {};

		if (nckmaInterval > 0) {
			if (!bpmv.num(nckmaElapsed) || (nckmaElapsed >= nckmaInterval)) {
				if (!nkIsPolling) {

					nkLastPoll = new Date();
					nkIsPolling = true;
					nckma.px.draw_status('poll');

					jax['beforeSend'] = nckma.set_headers;
					jax['dataType'] = 'json';
					jax['error'] = nckma.parse;
					jax['success'] = nckma.parse;
					jax['async'] = true;

					if (nkFlags['testing']) {
						jax['url'] = nkUrls.userTest+((''+nkUrls.userTest).indexOf('?') > -1 ? '&' : '?')+'bust='+(new Date).getTime();
					} else {
						jax['url'] = nkUrls.user;
					}

					$.ajax(jax);

					nckma.debug(nckma._dL.poll, 'poll queued', jax);
					nckma.ev('poll', jax);
				}
			}
		}
	};

	nckma.reset = function (full) {
		var dat = null;

		nckma.px.draw_status('load');
		nckma.px.draw_line('----', 1, nckma.px.color('blue'));
		nckma.px.draw_line('----', 2, nckma.px.color('blue'));

		nkLastPoll = null;

		if (full) {
			nkDataFirst = null;
			nckma.db.user_clear(true);
			//localStorage['_dataSet'] = '';
			// nkDataSet = [];
		}

		setTimeout(nckma.poll, 1000);
	};

	nckma.rgb2hex = function (rgb) {
		var tC = bpmv.str(rgb) ? rgb.split(/\s?,\s?/) : rgb;

		if (bpmv.arr(tC, true) && ((tC.length === 3 ) || (tC.length === 4))) {
			return '' + ((1 << 24) + (parseInt(tC[0]) << 16 ) + (parseInt(tC[1]) << 8) + parseInt(tC[2])).toString(16).slice(1);
		}
	};

	nckma.set_headers = function (req) {
		var info = nckma.info();
		var user = 'user-unknown-first-poll';
		var uA = '';
		var uId = 'unknown';

		if (bpmv.obj(req) && bpmv.func(req.setRequestHeader)) {
			if (bpmv.obj(nkDataFirst) && bpmv.str(nkDataFirst.name)) {
				user = '"' + encodeURI(nkDataFirst.name) + '"';
				uId = '' + encodeURI(nkDataFirst.id);
			}

			uA = info.name + ' v' + nckma.version().str + ' - ' + info.description + '; User: ' + user + '(id:' + uId + ')';

			nckma.debug(nckma._dL.poll, 'Narcikarma [nckma.set_headers()] Setting X-User-Agent.', uA);

			// trying to set the user agent proper results in "Refused to set unsafe header 'User-Agent'" :(
			req.setRequestHeader('X-User-Agent', uA);
		}
	};

	nckma.start = function (cb) {
		var cbR = null;
		var cbArgs = $.extend([], arguments);

		if (bpmv.bool(cb) && (cb === true)) {
			nckma.debug(0, 'Narcikamra startup', [cbArgs, nkStartCbs.length]);
			nckma.ev('start', cbArgs);

			nkStarted = true;

			while (nkStartCbs.length) {
				cbR = nkStartCbs.shift();
				cbR.apply(window, cbArgs);
			}

			nckma.debug(0, 'Narcikamra startup complete.');
		} else if (bpmv.func(cb)) {
			if (nkStarted) {
				cb.apply(window, cbArgs);
				nckma.debug(nckma._dL.ev, 'nckma.start() run cb (already started)', [cb, cbArgs]);
			} else {
				nkStartCbs.push(cb);
				nckma.debug(nckma._dL.ev, 'nckma.start() cb added', [cb, cbArgs]);
			}
		}
	};

	/* nckma.stor_size() is very loose and is really only meant to be a guestimate of localStorage usage */
	nckma.stor_size = function (inMB) {
		if (inMB) {
			return Math.round(((unescape(encodeURIComponent(JSON.stringify(localStorage))).length) / 1024 / 1024) * 100000) / 100000;
		}

		return (unescape(encodeURIComponent(JSON.stringify(localStorage))).length);
	};

	/* nckma.stor_key_size() is very loose and is really only meant to be a guestimate of localStorage usage */
	nckma.stor_key_size = function (key, inMB) {
		if (!bpmv.str(localStorage[key])) {
			return 0;
		}

		if (inMB) {
			return Math.round(((unescape(encodeURIComponent(localStorage[key])).length) / 1024 / 1024) * 100000) / 100000;
		}

		return (unescape(encodeURIComponent(localStorage[key])).length);
	};

	nckma.str_date = function (da, loc) {
		var hours = '';
		var mins = '';
		var secs = '';
		var dFmt = !bpmv.str(loc) ? ''+localStorage['dateFormat'] : ''+loc;
		dObj = bpmv.typeis(da, 'Date') ? da : new Date(da);

		if (bpmv.typeis(dObj, 'Date')) {
			hours = dObj.getHours();
			mins = bpmv.pad(dObj.getMinutes(), 2);
			secs = bpmv.pad(dObj.getSeconds(), 2);

			switch (dFmt.toLowerCase()) {
				case 'uk':
					return '' +
						dObj.getFullYear() +
						'.' + bpmv.pad((dObj.getMonth()+1), 2) +
						'.' + bpmv.pad(dObj.getDate(), 2) +
						' ' + bpmv.pad(hours, 2) +
						':' + (bpmv.str(mins) ? mins : '00') +
						':' + (bpmv.str(secs) ? secs : '00');
					break;
				case 'us':
				default:
					return '' +
						bpmv.pad((dObj.getMonth()+1), 2) +
						'/' + bpmv.pad(dObj.getDate(), 2) +
						'/' + dObj.getFullYear() +
						' ' + bpmv.pad((hours > 12 ? hours - 12 : hours), 2, '0') +
						':' + (bpmv.str(mins) ? mins : '00') +
						':' + (bpmv.str(secs) ? secs : '00') +
						' ' + (hours > 12 ? 'PM' : 'AM');
					break;

			}
		}
	};

	nckma.str_num = function (num) {
		var neg = '';
		var uNum = '';
		var n = null;
		var nI = null;
		var nD = null;
		var nRx = /(\d+)(\d{3})/;

		if (bpmv.num(num, true) && ((''+num).length > 3)) {
			uNum = ''+num;
			n = uNum.split('.');
			nI = n[0];
			nD = n.length > 1 ? '.'+nD : '';

			while (nRx.test(nI)) {
				nI = nI.replace(nRx, '$1'+','+'$2');
			}

			return nI+nD;
		}

		return  ''+num;
	};

	nckma.testing = function (checkDebug) {
		if (checkDebug) {
			return nkFlags['debug'] ? true : false;
		} else {
			return nkFlags['testing'] ? true : false;
		}
	};

	nckma.track = function (label, val, cat) {
		var category = bpmv.str(cat) ? ''+cat : 'nkRuntime';

		if (!bpmv.str(label)) {
			return;
		}

		if (typeof(_gaq) === 'undefined' || !bpmv.obj(_gaq)) {
			window._gaq = [];
		}

		if (bpmv.obj(_gaq) || bpmv.arr(_gaq)) {
			return _gaq.push(['_trackEvent', category + ' v' + nckma.version().str, label, val]);
		}
	};

	nckma.version = function () {
		var inf = null;
		var ret = { 'num': null, 'str': null };

		if (bpmv.obj(nckma._cache.version)) {
			return nckma._cache.version;
		}
		
		inf = nckma.info();
		
		if (bpmv.str(inf.version)) {
			ret = {
				'num': inf.version.replace(/[^0-9|^\.]+/g, '' ).split('.'),
				'str': ''+inf.version + (nkFlags['testing'] || nkFlags['debug'] || nkFlags['ga'] ? '.' : '') + (nkFlags['testing'] ? 'T' : '') + (nkFlags['debug'] ? 'D' : '')
			};

			if (bpmv.arr(ret.num)) {
				ret.num = (ret.num.length < 2) ? ''+ret.num[0] : ret.num.shift()+'.'+ret.num.join('');
				ret.num = parseFloat(ret.num);
			} else {
				ret.num = null;
			}

			nckma._cache.version = ret;
		}

		return ret;
	};

	nckma.warn = function () {
		if (nkFlags['debug']) {
			if (bpmv.num(bpmv.count(arguments)) && bpmv.str(arguments[0])) {
				arguments[0] = '[NARCIKARMA WARNING] '+arguments[0];
			}

			console.warn.apply(console, arguments);
		}

		nckma.track('warn', bpmv.str(arguments[0]) ? arguments[0] : '', 'nkExec');
	};

	/*
	* startup cb
	*/

	nckma.start(function () {
		nckma.version();

		if (nckma._bgTask) {
			nckma.ev('beat', nckma.poll);
			nckma.begin();
		}
	});
})();
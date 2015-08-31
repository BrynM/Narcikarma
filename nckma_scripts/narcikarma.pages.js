/*!
* narcikarma.pages.js
*/

(function () {

	/*
	********************************************************************************
	********************************************************************************
	* Support for UI pages
	********************************************************************************
	********************************************************************************
	*/

	nckma.pages = {};

	var bindings;
	var rgx = {
		'colorPre': /^color_/,
		'hashes': /\#+/g,
		'tplVars': /\#\#[^\#]+\#\#/g,
		// very lightwieght validation
		'url': /^(http|https)\:\/\//
	};
	var buttons = {};
	var sel = {
		'htmlStats': '.nck-html-stat',
		'textStats': '.nck-text-stat',
		'zeroDisableInput': '.zeroDisableInput'
	};
	var status = nckma.get(true);
	var statFakes = {};
	var statFormatters = {};
	var templates = {
		'html': {
			'start_comment_karma': '##start.comment_karma##',
			'start_link_karma': '##start.link_karma##',
		},
		'text': {
			'current_comment_karma': '##current.comment_karma## (##comment_delta##)',
			'current_link_karma': '##current.link_karma## (##link_delta##)',
			'start_comment_karma': '##start.comment_karma##',
			'start_link_karma': '##start.link_karma##',
			'total_karma': '##total_karma## (##total_delta##)',
			'start_total_karma': '##start.total_karma##',
			'user_link': nckma.get_url('userBase')+'##name##'
		}
	};

	function $_from_event (ev) {
		if(!bpmv.obj(ev)) {
			return;
		}

		if(!bpmv.obj(ev.target) || !bpmv.obj(ev.target.ownerDocument) || !bpmv.obj(ev.target.ownerDocument.defaultView)) {
			return;
		}

		if(bpmv.func(ev.target.ownerDocument.defaultView.$)) {
			return ev.target.ownerDocument.defaultView.$;
		}
	}

	function format_html_delta (delt, type) {
		var opts = nckma.opts.get();
		var deltInt = parseInt(delt, 10);
		var chType = bpmv.str(type, 2) ? type[0].toUpperCase()+type.slice(1) : '';
		var pClass = bpmv.str(opts['color_no'+chType+'Change']) ? opts['color_no'+chType+'Change'] : opts['color_noChange'];

		if (deltInt > 0) { // positive
			pClass = bpmv.str(opts['color_pos'+chType+'Change']) ? opts['color_pos'+chType+'Change'] : opts['color_posChange'];
		}

		if (deltInt < 0) { // negative
			pClass = bpmv.str(opts['color_neg'+chType+'Change']) ? opts['color_neg'+chType+'Change'] : opts['color_negChange'];
		}

		return '<span style="color: rgba('+pClass+');">('+nckma.str_num(delt)+')</span>';
	}

	function format_stat (stat, val) {
		if (bpmv.func(statFormatters[stat])) {
			return statFormatters[stat](val);
		}

		if (bpmv.typeis(val, 'Boolean')) {
			// just alias the rest
			return statFormatters['is_mod'](val);
		}

		if (bpmv.typeis(val, 'Number')) {
			// just alias the rest
			return statFormatters['comment_karma'](val);
		}

		return val;
	}

	function handle_close_win(ev) {
		if(!bpmv.obj(ev) || !bpmv.typeis(ev.view, 'Window')) {
			return;
		}

		return ev.view.close();
	}

	function handle_zero_disable_input (ev) {
		var $el;
		var jQ = $_from_event(ev);

		if(!bpmv.obj(ev) || !bpmv.func(jQ)) {
			return;
		}

		$el = jQ(ev.target);

		$zero_disable($el);
	}

	function $zero_disable($el) {
		var className = 'zeroIsDisabled';

		if(!bpmv.obj($el) || !bpmv.func($el.addClass)) {
			return;
		}

		if(parseInt($el.val(), 10) === 0) {
			$el.addClass(className);
		} else {
			$el.removeClass(className);
		}
	}

	function open_url(url) {
		return window.open(url);
	}

	function open_credits () {
		nckma.track('func', 'open_credits', 'nkExec');
		open_url(nckma.get_url('credits'));
	}

	function open_current_user (ev) {
		status = nckma.get();

		if (bpmv.obj(status)) {
			if (bpmv.obj(status.start, true) && bpmv.str(status.start.name)) {
				open_url('http://www.reddit.com/user/'+status.start.name+'/');
				nckma.track('func', 'open_current_user', 'nkExec');
			}
		}
	}

	function open_userSaved (ev) {
		status = nckma.get();

		if (bpmv.obj(status)) {
			if (bpmv.obj(status.start, true) && bpmv.str(status.start.name)) {
				open_url('http://www.reddit.com/user/'+status.start.name+'/saved');
				nckma.track('func', 'open_userSaved', 'nkExec');
			}
		}
	}

	function open_graphs () {
		nckma.track('func', 'open_graphs', 'nkExec');
		open_url(nckma.get_url('graphs'));
	}

	function open_options (hash) {
		var withHash = '';

		if (bpmv.str(hash)) {
			withHash += '#'+hash;

			if (withHash.indexOf('_tab_radio') < 0) {
				withHash += '_tab_radio';
			}
		}

		nckma.track('func', 'open_options', 'nkExec');
		open_url(nckma.get_url('options')+withHash);
	}

	function open_source () {
		nckma.track('func', 'open_source', 'nkExec');
		open_url(nckma.get_url('source'));
	}

	function open_subreddit () {
		nckma.track('func', 'open_subreddit', 'nkExec');
		open_url(nckma.get_url('subreddit'));
	}

	function open_webstore () {
		nckma.track('func', 'open_webstore', 'nkExec');
		open_url(nckma.get_url('webstore'));
	}

	function populate_stats (win, html) {
		var statsToFill;
		var len;
		var iter;

		if(!bpmv.obj(win) || !bpmv.func(win.$)) {
			return;
		}

		statsToFill = html ? win.$(sel.htmlStats) : win.$(sel.textStats);
		len = statsToFill.length;

		if (len < 1) {
			return;
		}

		for (iter = 0; iter < len; iter++) {
			try {
				if (html) {
					statsToFill[iter].innerHTML = nckma.pages.tpl(statsToFill[iter].getAttribute('data-stat'), true);
				} else {
					statsToFill[iter].innerText = nckma.pages.tpl(statsToFill[iter].getAttribute('data-stat'), false);
				}
			} catch (e) {}
		}
	};

	/*
	* button bindings
	*/

	buttons['closePopup'] = {
		'sel': '.nck-btn-close',
		'title': 'Close',
		'cb': handle_close_win
	};
	buttons['closeX'] = {
		'sel': '.nck-close-x',
		'title': 'X',
		'cb': handle_close_win
	};
	buttons['graphs'] = {
		'sel': '.nck-btn-graphs',
		'title': 'Graphs',
		'cb': open_graphs
	};
	buttons['options'] = {
		'sel': '.nck-btn-options',
		'title': 'Options',
		'cb': open_options
	};
	buttons['user'] = {
		'sel': '.nck-btn-user',
		'title': 'Open User',
		'cb': open_current_user
	};
	buttons['credits'] = {
		'sel': '.nck-btn-credits',
		'title': 'Credits',
		'cb': open_credits
	};
	buttons['source'] = {
		'sel': '.nck-btn-source',
		'title': 'Source Code',
		'cb': open_source
	};
	buttons['subreddit'] = {
		'sel': '.nck-btn-subreddit',
		'title': '/r/Narcikarma',
		'cb': open_subreddit
	};
	buttons['userSaved'] = {
		'sel': '.nck-btn-userSaved',
		'title': 'Saved Items',
		'cb': open_userSaved
	};
	buttons['webstore'] = {
		'sel': '.nck-btn-webstore',
		'title': 'Extension Page',
		'cb': open_webstore
	};

	/*
	* faked stats not returned in me.json
	*/

	statFakes.cake_day = function (dataSet) {
		var data = nckma.get();

		return data.start.created_utc;
	};

	statFakes.gold_expiration = function (dataSet) {
		var data = nckma.get();

		return data.start.gold_expiration;
	};

	statFakes.comment_delta = function (dataSet) {
		var data = nckma.get();
		var delt = parseInt(data.current.comment_karma, 10) - parseInt(data.start.comment_karma, 10);

		return parseInt(delt, 10);
	};

	statFakes.link_delta = function (dataSet) {
		var data = nckma.get();
		var delt = parseInt(data.current.link_karma, 10) - parseInt(data.start.link_karma, 10);

		return parseInt(delt, 10);
	};

	statFakes.total_delta = function (dataSet) {
		var data = nckma.get();
		var curr = parseInt(data.current.link_karma, 10) + parseInt(data.current.comment_karma, 10);
		var start = parseInt(data.start.link_karma, 10) + parseInt(data.start.comment_karma, 10);
		var delt = parseInt(curr, 10) - parseInt(start, 10);

		return parseInt(delt, 10);
	};

	statFakes.total_karma = function (dataSet) {
		return nckma.str_num(parseInt(dataSet.link_karma, 10) + parseInt(dataSet.comment_karma, 10));
	};

	/*
	* stat formatters (raw data)
	*/

	statFormatters.cake_day = function (val) {
		var opts = nckma.opts.get();
		var cDay = new Date(0);

		cDay.setUTCSeconds(val);

		return nckma.str_date(cDay, opts['dateFormat']);
	};

	statFormatters.gold_expiration = statFormatters.cake_day;

	statFormatters.comment_karma = function (val) {
		return bpmv.num(val, true) ? val : 'unknown';
	};

	// aliased to catch other booleans as well
	statFormatters.is_mod = function (val) {
		return val ? 'Yes' : 'No';
	};

	/*
	* special text templates as functions
	* (must go before html for aliasing)
	*/

	templates.text.comment_delta = function (stats) {
		var delt = nckma.pages.get_stat('comment_delta');

		return (delt > 0 ? '+' : '')+nckma.str_num(delt);
	};

	templates.text.link_delta = function (stats) {
		var delt = nckma.pages.get_stat('link_delta');

		return (delt > 0 ? '+' : '')+nckma.str_num(delt);
	};

	templates.text.total_delta = function (stats) {
		var delt = nckma.pages.get_stat('total_delta');

		return (delt > 0 ? '+' : '')+nckma.str_num(delt);
	};

	templates.text.current_timestamp = function (stats) {
		var opts = nckma.opts.get();

		return nckma.str_date(stats.current.nkTimeStamp, opts['dateFormat']);
	};

	templates.text.has_mail = function (stats) {
		return (stats.current.has_mail ? 'Yes ('+stats.current.inbox_count+')' : 'No');
	};

	templates.text.name = function (stats) {
		return stats.current.name+(stats.current.has_verified_email ? '' : '(unverified)');
	};

	templates.text.start_timestamp = function (stats) {
		var opts = nckma.opts.get();

		return nckma.str_date(stats.start.nkTimeStamp, opts['dateFormat']);
	};

	templates.text.ext_description = function (stats) {
		var info = nckma.info(true);

		if (bpmv.str(info)) {
			var inf = JSON.parse(info);
			return ''+inf.description;
		}
	};

	templates.text.ext_name = function (stats) {
		var info = nckma.info(true);

		if (bpmv.str(info)) {
			var inf = JSON.parse(info);
			return ''+inf.name;
		}
	};

	templates.text.ext_name_full = function (stats) {
		var info = nckma.info(true);

		if (bpmv.str(info)) {
			var inf = JSON.parse(info);
			return ''+inf.name+' v'+nckma.version().str;
		}
	};

	/*
	* special html templates as functions
	*/

	templates.html.current_comment_karma = function (stats) {
		var opts;
		var delt;

		if(!bpmv.obj(stats) || !bpmv.num(bpmv.dive(stats, 'current.comment_karma'), true)) {
			return 'unknown';
		}

		opts = nckma.opts.get();
		delt = nckma.pages.get_stat('comment_delta');

		return nckma.str_num(nckma.pages.get_stat('comment_karma'))+' '+format_html_delta(delt, 'comment');
	};

	templates.html.current_link_karma = function (stats) {
		var opts;
		var delt;

		if(!bpmv.obj(stats) || !bpmv.num(bpmv.dive(stats, 'current.link_karma'), true)) {
			return 'unknown';
		}

		opts = nckma.opts.get();
		delt = nckma.pages.get_stat('link_delta');

		return nckma.str_num(nckma.pages.get_stat('link_karma'))+' '+format_html_delta(delt, 'link');
	};

	templates.html.gold_creddits = function (stats) {
		var opts = nckma.opts.get();

		if (stats.current.gold_creddits > 0) {
			return '<a href="'+nckma.get_url('giveGold')+'" target="_blank" style="color: rgba( ' + opts['color_gold'] + ' );" title="Give gold">'+nckma.str_num(stats.current.gold_creddits)+'</a>';
		}

		return '<a href="'+nckma.get_url('getGoldCredits')+'" target="_blank" title="Get gold credits">None</a>';
	};

	templates.html.gold_expiration = function (stats) {
		var opts = nckma.opts.get();
		var exp = nckma.pages.get_stat('gold_expiration');
		var has = nckma.get().current.is_gold;

		if (has) {
			return '<span style="color: rgba( ' + opts['color_gold'] + ' );">'+exp+'</span>';
		}

		return 'pleb';
	};

	templates.html.has_mail = function (stats) {
		var opts = nckma.opts.get();
		var html = '';

		html += '<a href="'+nckma.get_url('inbox')+'" target="_blank" ';
		html += 'title="Open your inbox" ';

		if (stats.current.has_mail) {
			html +='style="color: rgba(' + opts['color_hasMail'] + ');"';
		} else {
			html +='style="color: rgba(' + opts['color_noMail'] + ');"';
		}

		html += '>';
		html += stats.current.has_mail ? '<strong>Yes</strong> (<em>'+nckma.str_num(stats.current.inbox_count)+'</em>)' : 'No';
		html += '</a>';

		return html;
	};

	templates.html.has_mod_mail = function (stats) {
		var opts = nckma.opts.get();
		var html = '';

		html += '<a href="'+nckma.get_url('modmail')+'" target="_blank" ';
		html += 'title="Open your modmail" ';

		if (stats.current.has_mod_mail) {
			html +='style="color: rgba(' + opts['color_hasModMail'] + ');"';
		} else {
			html +='style="color: rgba(' + opts['color_noModMail'] + ');"';
		}

		html += '>';
		html += stats.current.has_mod_mail ? '<strong>Yes</strong>' : 'No';
		html += '</a>';

		return html;
	};

	templates.html.is_gold = function (stats) {
		var opts = nckma.opts.get();

		if (stats.current.is_gold) {
			return '<a href="'+nckma.get_url('lounge')+'" target="_blank" style="color: rgba(' + opts['color_gold'] + ');" title="Retire to the lounge...">Like a Sir</a>';
		}

		return '<a href="'+nckma.get_url('gold')+'" target="_blank" title="Get gold!">Not yet</a>';
	};

	templates.html.is_mod = function (stats) {
		var opts = nckma.opts.get();

		if (stats.current.is_mod) {
			return '<a href="'+nckma.get_url('modqueue')+'" target="_blank" title="Open your modqueue">Yes</a>';
		}

		return 'No';
	};

	templates.html.name = function (stats) {
		var html = '';
		var url = nckma.get_url('userBase')+stats.current.name;

		html += '<a href="'+url+'" target="_blank" onclick="nckma.track(\'link\', \'templates.html.name\', \'nkExec\');" title="Open /u/'+stats.current.name+'\'s profile">';
		html += '<strong>'+stats.current.name+'</strong>';
		html += '</a>';
		html += stats.current.has_verified_email ? '' : ' <span style="color: red;">(<em>unverified email</em>)</span>';

		return html;
	};

	templates.html.total_karma = function (stats) {
		var opts;
		var delt;

		if (!bpmv.obj(stats) || !bpmv.num(bpmv.dive(stats, 'current.link_karma'), true)) {
			return 'unknown';
		}

		opts = nckma.opts.get();
		delt = nckma.pages.get_stat('total_delta');

		return nckma.str_num(nckma.pages.get_stat('total_karma'))+' '+format_html_delta(delt, 'total');
	};

	/*
	* nckma.pages
	*/

	nckma.pages.bind_btns = function (win) {
		var iter;

		if(!bpmv.obj(win) || !bpmv.func(win.$)) {
			return;
		}

		for (iter in buttons) {
			if(bpmv.obj(buttons[iter]) && bpmv.str(buttons[iter].sel) && bpmv.func(buttons[iter].cb)) {
				win.$(buttons[iter].sel).text(buttons[iter].title).off('click', buttons[iter].cb).on('click', buttons[iter].cb);
			}
		}
	};

	nckma.pages.bind_zero_disable = function (win) {
		var $el;
		var len;
		var iter;
		var $single;

		if (!bpmv.obj(win) || !bpmv.func(win.$)) {
			return;
		}

		$el = win.$(sel.zeroDisableInput);
		len = $el.length;

		for (iter = 0; iter < len; iter++) {
			$single = win.$($el[iter]);

			$single.off('change focusout focus', handle_zero_disable_input).on('change focusout focus', handle_zero_disable_input).change();
			$zero_disable($single);
		}
	};

	nckma.pages.color = function (colorName) {

		var color = rgx['colorPre'].test(colorName) ? colorName : 'color_'+colorName;

		if (bpmv.str(localStorage[color])) {
			return ''+localStorage[color];
		}

		color = color.replace(rgx['colorPre'], '');

		// fall back to built-in colors
		return nckma.px.color(color);
	};

	nckma.pages.get_stat = function (stat, starting) {
		var stats;
		var data = nckma.get();

		if(!bpmv.str(stat)) {
			return;
		}

		if (starting) {
			stats = $.extend({}, data.start);
		} else {
			stats = $.extend({}, data.current);
		}

		if(!bpmv.obj(stats) || typeof stats[stat] === 'undefined') {
			if(bpmv.func(statFakes[stat])) {
				try {
					return format_stat(stat, statFakes[stat](stats));
				} catch (e) {}
			}

			return;
		}

		return format_stat(stat, stats[stat]);
	};

	nckma.pages.go_to_options = function (hash) {
		return open_options(hash);
	};

	nckma.pages.go_to_user = function () {
		return open_current_user();
	};

	nckma.pages.go_to_url = function (loc) {
		if(!rgx.url.test(loc)) {
			return;
		}

		nckma.track('func', 'pages.go_to_url', 'nkExec');
		open_url(loc);
	};

	nckma.pages.open = function(urlKey) {
		var url = nckma.get_url(urlKey);

		if (bpmv.str(url)) {
			open_url(url);
		}

		nckma.track('func', 'pages.open', 'nkExec');
	};

	nckma.pages.populate_stats = function (win) {
		populate_stats(win, false);
		populate_stats(win, true);
	};

	nckma.pages.tpl = function (tplName, html) {
		var data = {};
		var iter;
		var htmlFlag = (html && bpmv.bool(html)) || html === 'html' ? 'html' : 'text';
		var stats = nckma.get();
		var tpl;
		var tpls = templates[htmlFlag];
		var varName;
		var vars;
		var varSplit;

		if (bpmv.func(tpls[tplName])) {
			// special function (for complex templates)
			return tpls[tplName](stats);
		}

		if (!bpmv.str(tpls[tplName])) {
			if (bpmv.func(templates['text'][tplName])) {
				// if there's a text func version fall back to it...
				return templates['text'][tplName](stats);
			}

			// return the value if possible
			return nckma.pages.get_stat(tplName);
		}

		tpl = ''+tpls[tplName];

		vars = tpl.match(rgx.tplVars);

		if (!bpmv.arr(vars)) {
			// nothing to parse
			return tpl;
		}

		for (iter = 0; iter < vars.length; iter++) {
			if (!bpmv.str(vars[iter])) {
				continue;
			}

			varName = vars[iter].replace(rgx.hashes, '');

			if(varName.indexOf('.') > -1) {
				varSplit = varName.split('.');

				if (varSplit.length === 2) {
					data[varName] = nckma.pages.get_stat(varSplit[1], varSplit[0] === 'start');

					if (bpmv.num(data[varName], true)) {
						data[varName] = nckma.str_num(data[varName]);
					}

					continue;
				}

				// fall back to direct?
				data[varName] = bpmv.dive(stats, varName);
			} else {
				data[varName] = nckma.pages.get_stat(varName);
			}

			if (bpmv.num(data[varName], true)) {
				data[varName] = nckma.str_num(data[varName]);
			}
		}

		return bpmv.toke(tpl, data);
	};

})();


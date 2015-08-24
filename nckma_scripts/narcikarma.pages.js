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
	var sel = {
		'btn' : {
			'closePopup': '.nck-btn-close',
			'closeX': '.nck-close-x',
			'graphs': '.nck-btn-graphs',
			'options': '.nck-btn-options',
			'user': '.nck-btn-user',
			'credits': '.nck-btn-credits'
		}
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
			'total_karma': '##total_karma## (##total_delta##)'
		}
	};

	function format_html_delta (delt) {
		var opts = nckma.opts.get();
		var deltInt = parseInt(delt, 10);
		var pClass = 'color: rgba(' + opts['color_noChange'] + ');';

		if (deltInt > 0) { // positive
			pClass = 'color: rgba(' + opts['color_posChange'] + ');';
		}

		if (deltInt < 0) { // negative
			pClass = 'color: rgba(' + opts['color_negChange'] + ');';
		}
		return '(<span style="'+pClass+'">'+nckma.str_num(delt)+'</span>)';
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

	function open_url(url) {
		return window.open(url);
	}

	function open_credits () {
		nckma.track('func', 'open_credits', 'nkExec');
		open_url(nckma.get_url('credits'));
	}

	function open_current_user (ev) {
		status = nckma.get();

		if (bpmv.str(status)) {
			if (bpmv.obj(status.start, true) && bpmv.str(status.start.name)) {
				open_url('http://www.reddit.com/user/'+status.start.name+'/');
				nckma.track('func', 'open_current_user', 'nkExec');
			}
		}
	}

	function open_graphs () {
		nckma.track('func', 'open_graphs', 'nkExec');
		open_url(nckma.get_url('graphs'));
	}

	function open_options () {
		nckma.track('func', 'open_options', 'nkExec');
		open_url(nckma.get_url('options'));
	}

	/*
	* faked stats not returned in me.json
	*/

	statFakes.comment_delta = function (dataSet) {
		var data = nckma.get();
		var delt = parseInt(data.current.comment_karma, 10) - parseInt(data.start.comment_karma, 10);

		return (delt > 0 ? '+' : '')+delt;
	};

	statFakes.link_delta = function (dataSet) {
		var data = nckma.get();
		var delt = parseInt(data.current.link_karma, 10) - parseInt(data.start.link_karma, 10);

		return (delt > 0 ? '+' : '')+delt;
	};

	statFakes.total_delta = function (dataSet) {
		var data = nckma.get();
		var curr = parseInt(data.current.link_karma, 10) + parseInt(data.current.comment_karma, 10);
		var start = parseInt(data.start.link_karma, 10) + parseInt(data.start.comment_karma, 10);
		var delt = parseInt(curr, 10) - parseInt(start, 10);

		return (delt > 0 ? '+' : '')+delt;
	};

	statFakes.total_karma = function (dataSet) {
		return parseInt(dataSet.link_karma, 10) + parseInt(dataSet.comment_karma, 10);
	};

	/*
	* stat formatters (raw data)
	*/

	statFormatters.comment_karma = function (val) {
		return bpmv.num(val, true) ? nckma.str_num(val) : 'unknown';
	};

	// aliased to catch other booleans as well
	statFormatters.is_mod = function (val) {
		return val ? 'Yes' : 'No';
	};

	/*
	* special text templates as functions
	*/

	templates.text.has_mail = function (stats) {
		return (stats.current.has_mail ? 'Yes ('+stats.current.inbox_count+')' : 'No');
	};

	templates.text.name = function (stats) {
		return stats.current.name+(stats.current.has_verified_email ? '' : '(unverified)');
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

		return nckma.str_num(nckma.pages.get_stat('comment_karma'))+' '+format_html_delta(delt);
	};

	templates.html.current_link_karma = function (stats) {
		var opts;
		var delt;

		if(!bpmv.obj(stats) || !bpmv.num(bpmv.dive(stats, 'current.link_karma'), true)) {
			return 'unknown';
		}

		opts = nckma.opts.get();
		delt = nckma.pages.get_stat('link_delta');

		return nckma.str_num(nckma.pages.get_stat('link_karma'))+' '+format_html_delta(delt);
	};

	templates.html.gold_creddits = function (stats) {
		var opts = nckma.opts.get();

		if (stats.current.gold_creddits > 0) {
			return '<a href="'+nckma.get_url('giveGold')+'" target="_blank" style="color: rgba( ' + opts['color_gold'] + ' );" title="Give gold">'+nckma.str_num(stats.current.gold_creddits)+'</a>';
		}

		return '<a href="'+nckma.get_url('getGoldCredits')+'" target="_blank" title="Get gold credits">None</a>';
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

		html += '<a href="'+nckma.get_url('inbox')+'" target="_blank" ';
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

		if(!bpmv.obj(stats) || !bpmv.num(bpmv.dive(stats, 'current.link_karma'), true)) {
			return 'unknown';
		}

		opts = nckma.opts.get();
		delt = nckma.pages.get_stat('total_delta');

		return nckma.str_num(nckma.pages.get_stat('total_karma'))+' '+format_html_delta(delt);
	};

	/*
	* nckma.pages
	*/

	nckma.pages.bind_btns = function (win) {
		if(!bpmv.obj(win) || !bpmv.func(win.$)) {
			return;
		}

		win.$(sel.btn.closePopup).click(handle_close_win);
		win.$(sel.btn.closeX).click(handle_close_win);
		win.$(sel.btn.credits).click(open_credits);
		win.$(sel.btn.graphs).click(open_graphs);
		win.$(sel.btn.options).click(open_options);
		win.$(sel.btn.user).click(open_current_user);
	};

	nckma.pages.color = function (colorName) {

		var color = rgx['colorPre'].test(colorName) ? colorName : 'color_'+colorName;

		if(bpmv.str(localStorage[color])) {
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
			stats = $.extend({}, data.current);
		} else {
			stats = $.extend({}, data.start);
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

	nckma.pages.go_to_url = function (loc) {
		if(!rgx.url.test(loc)) {
			return;
		}

		nckma.track('func', 'pages.go_to_url', 'nkExec');
		open_url(loc);
	};

	nckma.pages.go_to_user = function () {
		return open_current_user();
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
					continue;
				}

				// fall back to direct?
				data[varName] = bpmv.dive(stats, varName);
			} else {
				data[varName] = nckma.pages.get_stat(varName);
			}
		}

		return bpmv.toke(tpl, data);
	};

})();


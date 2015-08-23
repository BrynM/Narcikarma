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
	var statFormatters = {
		comment_karma: function (val) {
			return bpmv.num(val, true) ? nckma.str_num(val) : 'unknown';
		},
	};

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
		status = nckma.get(true);

		if (bpmv.str(status)) {
			var sD = JSON.parse(status);

			if (bpmv.obj(sD.start, true) && bpmv.str(sD.start.name)) {
				open_url('http://www.reddit.com/user/'+sD.start.name+'/');
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

	function format_stat (stat, val) {
		if (bpmv.func(statFormatters[stat])) {
			return statFormatters[stat](val);
		}

		return val;
	};

	nckma.pages.get_stat = function (stat, starting) {
		var stats;
		var data = JSON.parse(nckma.get(true));

		if(!bpmv.str(stat)) {
			return;
		}

		if (starting) {
			stats = $.extend({}, data.current);
		} else {
			stats = $.extend({}, data.start);
		}
console.log(stat, data)
		if(!bpmv.obj(stats) || !stats[stat]) {
			return;
		}

		return format_stat(stat, stats[stat], false);
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
})();


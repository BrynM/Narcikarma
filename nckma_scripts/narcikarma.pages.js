(function () {

	/*
	********************************************************************************
	********************************************************************************
	* Support for UI pages
	********************************************************************************
	********************************************************************************
	*/

	nckma.pages = {};

	var status = nckma.get(true);



	var selectors = {
		'btn' : {
			'closePopup': '#nck_pop_btn_close',
			'closeX': '#nck_close_x',
			'graphs': '#nck_btn_graphs',
			'options': '#nck_btn_options',
			'user': '#nck_btn_user',
			'credits': '#nck_btn_credits'
		}
	};

	var bindings;

	var rgx = {
		'colorPre': /^color_/,
		'url': /^(http|https)/
	};

	nckma.pages.bind_btns = function (doc) {
		if(!bpmv.obj(doc) || !bpmv.func(doc.$)) {
			return;
		}

	$('#nck_close_x').click( function () { window.close(); } );
	$('#nck_btn_graphs').click( function () { window.open('/nckma_html/graphs.html'); } );
	$('#nck_btn_options').click( function () { window.open('/nckma_html/options.html'); } );
	$('#nck_btn_close').click( function () { window.close(); } );
	$('#nck_btn_user').click(go_to_user);
	$('#nck_btn_credits').click( function () { window.open('/nckma_html/credits.html'); } );

	};

	nckma.pages.color = function (colorName) {

		var color = rgx['colorPre'].test(colorName) ? colorName : 'color_'+colorName;

		if(bpmv.str(localStorage[color])) {
			return ''+localStorage[color];
		}

		color = color.replace(rgx['colorPre'], '');

		return nckma.px.color(color);
	};

	nckma.pages.go_to_url = function (url) {
		if(!rgx.url.test(url)) {
			return;

		}
	};

	nckma.pages.go_to_user = function () {
		status = bgP.nckma.get(true);

		if (bpmv.str(status)) {
			var sD = JSON.parse(status);

			if (bpmv.obj(sD.start, true) && bpmv.str(sD.start.name)) {
				window.open('http://www.reddit.com/user/'+sD.start.name+'/');
				nckma.track('func', 'go_to_user', 'nkExec');
			}
		}
	};
})();


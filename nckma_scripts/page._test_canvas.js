/*!
* page._test_canvas.js
*/

var last = [];
var letrs = nckma.px.chars();
var charOut = $('#character_listing code').first();

function print_the_bugger() {
	var pr = '';

	if (bpmv.arr(last)) {
		pr = last.shift();

		if (bpmv.arr(pr) && (pr.length == 3)) {
			nckma.px.draw_line(pr[0], pr[1], nckma.px.color(pr[2]));
			setTimeout(print_the_bugger, 100);
		}
	} else {
		$('#run_test').removeAttr('disabled');
	}
}

function nk_test () {
	var tStr = [];
	var lets = bpmv.keys(letrs);
	var set = nckma.px.color_options();

	for (var i = 0; i < set.length; i++) {
		tStr = [];
		for (var aL = 0; aL < lets.length; aL++) {
			tStr.push(lets[aL]);
			while (tStr.length > 4) {
				tStr.shift();
			}
			last.push([$.extend([], tStr), 1, ''+set[i]]);
			last.push([$.extend([], tStr), 2, ''+set[i]]);
		}
	}

	$('#run_test').attr('disabled', 'disabled');
	setTimeout(print_the_bugger, 100);
}

function print_chars () {
	var txt = '';
	var btz = null;
	var bC = 0;

	charOut.empty();

	for (var aC in letrs) {
		txt += '### '+aC+'\n\n';
		btz = (''+letrs[aC]).split('');

		while (btz.length > 0) {
			txt += btz.shift();
			bC++;

			if (bC > 3) {
				bC = 0;
				txt += '\n';
			}
		}

		txt += '\n' + letrs[aC] + '\n\n';
	}

	charOut.text(txt);
}

function print_colors () {
	var cols = nckma.px.color_list();
	var iter;
	var len = cols.length;
	var html = '<h3>Click a color to change the background of the color area.</h3>\n';

	html += '<div>\n';
	html += '\t<span class="test_color_swatch">*none*';
	html += '&nbsp;<span style="background-color: transparent;">';
	html += '</span></span>\n';

	for (iter = 0; iter < len; iter++) {
		html += '\t<span class="test_color_swatch">'+cols[iter];
		html += '&nbsp;<span style="background-color: '+nckma.px.color_to_str(cols[iter])+';">';
		html += '</span></span>\n';
	}

	html += '\t<div style="clear: both;"></div>\n';
	html += '</div>\n';

	$('#color_listing').html(html);
}

$(document).ready(function () {
	var $colors = $('#color_listing');

	$('#run_test').on('click', nk_test);

	$colors.on('click', '.test_color_swatch', function (ev) {
		var $sw = $(ev.currentTarget).find('span');

		$colors.css('background-color', $sw.css('background-color'));
	});

	print_colors();
	print_chars();
});


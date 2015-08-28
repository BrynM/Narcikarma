/*!
* page.options.js
*/

jQuery.event.props.push('dataTransfer');

var bgP = chrome.extension.getBackgroundPage();
var _ = bgP._;

var rgx = {
	'colorPre': /^color_/,
};

function reset_stats () {
	if (confirm('Reset collected stats?\n\n(This will erase all karma gains, karma losses,\nand your history until the next polling period .)')) {
		nckma.track('func', 'reset_stats', 'nkExec');
		bgP.nckma.reset(true);
	}
}

function export_settings () {
	window.open('data:application/octet-stream;base64;charset=utf-8,' + Base64.encode(JSON.stringify(nckma.opts.get())));
}

function import_settings (ev) {
	var fi = null;
	var rd = null;

	if (bpmv.obj(ev)) {
		ev.preventDefault();
		ev.stopPropagation();

		if (bpmv.obj(ev.originalEvent) && bpmv.obj(ev.originalEvent.dataTransfer) && bpmv.obj(ev.originalEvent.dataTransfer.files, true)) {
			fi = ev.originalEvent.dataTransfer.files[0];

			if (bpmv.num(fi.size)) {
				rd = new FileReader();

				rd.onload = function (le) {
					var nOpt = null;
					var errTxt = '';
					var imNum = 0;
					var jT = null;
					var iter = null;

					if (bpmv.obj(le) && bpmv.obj(le.target) && bpmv.str(le.target.result)) {
						try {
							nOpt = JSON.parse(le.target.result);

							if ( bpmv.obj(nOpt, true) ) {
								for ( iter in nOpt ) {
									if (nOpt.hasOwnProperty(iter) && bpmv.str(nOpt[iter])) {
										jT = $('#opt_'+iter);

										if (bpmv.obj(jT) && bpmv.num(jT.length)) {
											jT.val(nOpt[iter]);
											jT.change();

											imNum++;
										}
									}
								}

								if (!bpmv.num(imNum)) {
									errTxt = 'Import failed.\n\nFile "'+fi.name+'" is not a valid Saved Options file.\n\n(no valid options to import)';
								}
							} else {
								errTxt = 'Import failed.\n\nFile "'+fi.name+'" is not a valid Saved Options file.\n\n(file constains no object)';
							}
						} catch (err) {
							errTxt = 'Import failed.\n\nFile "'+fi.name+'" is not a valid Saved Options file.\n\n(JSON Parse Result: '+err+')';
						}

						if (bpmv.str(errTxt)) {
							nckma.notify.err(errTxt);
						} else {
							if ($('#nckma_save').attr('disabled')) {
								nckma.notify.note('No changes were made. The imported options were already active.');
							} else {
								nckma.notify.warn('Please review any changes made and hit the "Save Options" button.');
							}
						}
					}
				};

	     		rd.readAsText(fi);
			}
		}
	}
	return false;
}

function populate_colors() {
	var opts = nckma.opts.get_default_details();
	var iter;
	var colorName;
	var html = '';

	for (iter in opts) {
		if(bpmv.str(iter) && rgx.colorPre.test(iter)) {
			colorName = iter.replace(rgx.colorPre, '');
			html += '<div class="nckOptionsContainer nckOptionsColor" title="'+opts[iter].title+'">';
			html += '<label for="picker_opt_color_'+colorName+'">'+opts[iter].title+'</label>';
			html += '<input id="opt_color_'+colorName+'" type="text" class="nckHidden" />';
			html += '<input type="color" id="picker_opt_color_'+colorName+'" title="Pick a &quot;'+opts[iter].title+'&quot; color" />';
			html += '<input type="range" min="0" max="1000" value="1" class="" id="alpha_opt_color_'+colorName+'" title="Change &quot;'+opts[iter].title+'&quot; color tranparency (alpha)" />';
			html += '&nbsp;<span id="opt_color_'+colorName+'_status"></span>';
			html += '</div>';
		}
	}

	$('#color_selector_options').html(html);
}

function kill_event (ev) {
	if (bpmv.obj(ev)) {
		if (bpmv.func(ev.preventDefault)) {
			ev.preventDefault();
		}

		if (bpmv.func(ev.stopPropagation)) {
			ev.stopPropagation();
		}
	}

	return false;
}

/*
* startup cb
*/

nckma.start(function () {
	nckma.pages.populate_stats(window);
	nckma.pages.bind_btns(window);
	nckma.pages.bind_zero_disable(window);
	populate_colors();
	nckma.opts.ui_init();
	nckma.opts.ui_restore();

	$('input,select').change(nckma.opts.ui_change);
	$('#nck_btn_reset').click(reset_stats);
	$('#nckma_reset').click(nckma.opts.ui_restore);
	$('#nckma_save').click(nckma.opts.save);
	$('input[type="color"][id^="picker_opt_color_"],input[type="range"][id^="alpha_opt_color_"]').change(nckma.opts.ui_change_color);
	$('#nckma_default').click(function() {
		nckma.opts.defaults_set(false);
	});

	$('body').on('dragover', kill_event);
	$('body').on('dragenter', kill_event);
	$('body').on('drop', import_settings);

	// how to deal with changing tab heights?
/*
	$('.tab-radio').on('change', function(ev) {
		var $targ = $(ev.target);
		var $par = $($targ.parent());
		var $label = $($par.find('.tab-label'));
		var $conts = $($par.find('.tab-contents'));
		var newHeight = parseInt($label.outerHeight(true), 10) + parseInt($conts.outerHeight(true), 10);

console.log('$par', $par[0]);
console.log('$label', $label[0]);
console.log('$conts', $conts[0]);
console.log('newHeight', newHeight);
console.log('label', parseInt($label.outerHeight(true), 10));
console.log('conts', parseInt($conts.outerHeight(true), 10));
		$par.css('height', newHeight+'px');
	});
*/

	/* simple tab links */
	$('.tab-contents a').click(function (ev) {
		var hash = ev.currentTarget.href.replace( /(^.*#|\?.*$)/, '' );
		var jE = $('#'+hash);

		if (bpmv.obj(jE) && bpmv.num(jE.length)) {
			jE.attr( 'checked', 'checked' );
		}
	});
});

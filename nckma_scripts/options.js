jQuery.event.props.push('dataTransfer');

var bgP = chrome.extension.getBackgroundPage();

function reset_stats () {
	if ( confirm( 'Reset collected stats?\n\n(This will erase all karma gains, karma losses,\nand your history until the next polling period .)')) {
		nckma.track( 'func', 'reset_stats', 'nkExec' );
		bgP.nckma.reset(true);
	}
}

function go_to_subreddit () {
	window.open('http://www.reddit.com/r/Narcikarma/');
	nckma.track( 'func', 'go_to_subreddit', 'nkExec' );
}

function go_to_source () {
	window.open('https://github.com/BrynM/Narcikarma');
	nckma.track( 'func', 'go_to_source', 'nkExec' );
}

function go_to_cws () {
	window.open('https://chrome.google.com/webstore/detail/narcikarma/mogaeafejjipmngijfhdjkmjomgdicdg');
	nckma.track( 'func', 'go_to_cws', 'nkExec' );
}

function export_settings () {
	window.open( 'data:application/octet-stream;base64;charset=utf-8,' + Base64.encode(JSON.stringify(nckma.opts.get())));
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
							alert(errTxt);
						} else {
							if ($('#nckma_save').attr('disabled')) {
								alert( 'No changes were made. The importated options were already active.' );
							} else {
								alert( 'Please review any changes made and hit the "Save Options" button.' );
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

nckma.start( function () {
	nckma.opts.ui_init();
	nckma.opts.ui_restore();

	$('input,select').change(nckma.opts.ui_change);
	$('#nck_btn_reset').click(reset_stats);
	$('#nckma_reset').click(nckma.opts.ui_restore);
	$('#nckma_save').click(nckma.opts.save);
	$('input[type="color"][id^="picker_opt_color_"],input[type="range"][id^="alpha_opt_color_"]').change(nckma.opts.ui_change_color);
	$('#nck_btn_graphs').click( function () { window.open('/nckma_html/graphs.html'); } );
	$('#nck_btn_credits').click( function () { window.open('/nckma_html/credits.html'); } );
	$('#nck_btn_subreddit').click(go_to_subreddit);
	$('#nck_btn_source').click(go_to_source);
	$('#nck_btn_cws').click(go_to_cws);
	$('#nck_btn_export').click(export_settings);
	$('#nckma_default').click(nckma.opts.defaults_set);

	$('body').on( 'dragover', kill_event );
	$('body').on( 'dragenter', kill_event );
	$('body').on( 'drop', import_settings );

	/* simple tab links */
	$('.tab-contents a').click( function (ev) {
		var hash = ev.currentTarget.href.replace( /(^.*#|\?.*$)/, '' );
		var jE = $('#'+hash);

		if (bpmv.obj(jE) && bpmv.num(jE.length)) {
			jE.attr( 'checked', 'checked' );
		}
	} );
});

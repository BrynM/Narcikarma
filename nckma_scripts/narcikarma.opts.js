(function () {

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

	var nckmaNeedsSave = false;
	var nkMaxHist = 8000;
	var nkSettings = {};
	var nkSettingsKeys = [];
	var nkOptionNames = {
		'alertCommentGain': 'Alert After Comment Karma Threshold',
		'alertLinkGain': 'Alert After Link Karma Threshold',
		'alternateTime': 'Flag Alternate Time',
		'color_black': 'Black Color',
		'color_blue': 'Blue Color',
		'color_gold': 'Gold Color',
		'color_gray': 'Gray Color',
		'color_green': 'Green Color',
		'color_purple': 'Purple Color',
		'color_negChange': 'Negative Change Color',
		'color_noChange': 'No Change Color',
		'color_posChange': 'Positive Change Color',
		'color_red': 'Red Color',
		'cumulativeKarma': 'Show Cumulative Karma',
		'dateFormat': 'Date Format',
		'flag0': 'First Flag',
		'flag1': 'Second Flag',
		'flag2': 'Third Flag',
		'flag3': 'Fourth Flag',
		'interval': 'Refresh Interval',
		'row0': 'First Row Contents',
		'row1': 'Second Row Contents',
		'savedRefreshes': 'Number of Saved Refreshes'
	};
	var nckFlagEnum = [
		{
			'v': 'blank',
			'n': 'blank'
		},
		{
			'v': 'has_mail_both',
			'n': 'Messages or Mod Mail'
		},
		{
			'v': 'has_mail',
			'n': 'Messages/User Mail'
		},
		{
			'v': 'has_mod_mail',
			'n': 'Mod Mail'
		},
		{
			'v': 'is_mod',
			'n': 'Moderator'
		},
		{
			'v': 'is_gold',
			'n': 'Reddit Gold'
		}
	];
	var nckRowEnum = [
		{
			'v': 'cKarma',
			'n': 'Comment Karma'
		},
		{
			'v': 'flagsAndC',
			'n': 'Alternate Status Flags and Comment Karma'
		},
		{
			'v': 'flagsAndL',
			'n': 'Alternate Status Flags and Link Karma'
		},
		{
			'v': 'lKarma',
			'n': 'Link Karma'
		},
		{
			'v': 'flags',
			'n': 'Status Flags'
		}
	];

	nkSettings['alertCommentGain'] = {
		'def': '50',
		'type': 'int',
		'title': 'Alert After Comment Karma Threshold',
		'desc': 'When your comment karma has increased by this amount, an alert will be shown.',
		'min': 10,
		'kill0': true
	};

	nkSettings['alertLinkGain'] = {
		'def': '50',
		'type': 'int',
		'title': 'Alert After Link Karma Threshold',
		'desc': 'When your link karma has increased by this amount, an alert will be shown.',
		'min': 10,
		'kill0': true
	};

	nkSettings['alternateTime'] = {
		'def': '2',
		'type': 'int',
		'title': 'Flag Alternate Time',
		'desc': 'The time for a row to alternate between flags and other information, if used.',
		'min': 1
	};

	nkSettings['color_black'] = {
		'def': '0, 0, 0, 1',
		'type': 'color',
		'title': 'Black Color',
		'desc': 'Black Color.'
	};

	nkSettings['color_blue'] = {
		'def': '0, 0, 235, 1',
		'type': 'color',
		'title': 'Blue Color',
		'desc': 'Blue Color.'
	};

	nkSettings['color_gold'] = {
		'def': '176, 176, 21, 1',
		'type': 'color',
		'title': 'Gold Color',
		'desc': 'Gold Color.'
	};

	nkSettings['color_gray'] = {
		'def': '128, 128, 128, 1',
		'type': 'color',
		'title': 'Grey Color',
		'desc': 'Grey Color.'
	};

	nkSettings['color_green'] = {
		'def': '0, 190, 0, 1',
		'type': 'color',
		'title': 'Green Color',
		'desc': 'Green Color.'
	};

	nkSettings['color_purple'] = {
		'def': '215, 0, 215, 1',
		'type': 'color',
		'title': 'Purple Color',
		'desc': 'Purple Color.'
	};

	nkSettings['color_negChange'] = {
		'def': '235, 0, 0, 1',
		'type': 'color',
		'title': 'Negative Change Color',
		'desc': 'Color for a "Negative" change in karma.'
	};

	nkSettings['color_noChange'] = {
		'def': '0, 0, 0, 1',
		'type': 'color',
		'title': 'No Change Color',
		'desc': 'Color for no change in karma.'
	};

	nkSettings['color_posChange'] = {
		'def': '0, 190, 0, 1',
		'type': 'color',
		'title': 'Positive Change Color',
		'desc': 'Color for a "Positive" change in karma.'
	};

	nkSettings['color_red'] = {
		'def': '235, 0, 0, 1',
		'type': 'color',
		'title': 'Red Color',
		'desc': 'Red Color.'
	};

	nkSettings['cumulativeKarma'] = {
		'def': 'true',
		'type': 'bool',
		'title': 'Show Cumulative Karma',
		'desc': 'Show the karma change for all of the history, not just this browser session.'
	};

	nkSettings['dateFormat'] = {
		'def': 'US',
		'type': 'enum',
		'title': 'Date Format',
		'desc': 'Format for dates.',
		'enum': [
			{
				'v': 'UK',
				'n': 'UK'
			},
			{
				'v': 'US',
				'n': 'US'
			},
		]
	};

	nkSettings['flag0'] = {
		'def': 'has_mail',
		'type': 'enum',
		'title': 'First Flag',
		'desc': 'First flag shown on a flag row.',
		'enum': $.extend([], nckFlagEnum)
	};

	nkSettings['flag1'] = {
		'def': 'is_mod',
		'type': 'enum',
		'title': 'Second Flag',
		'desc': 'Second flag shown on a flag row.',
		'enum': $.extend([], nckFlagEnum)
	};

	nkSettings['flag2'] = {
		'def': 'has_mod_mail',
		'type': 'enum',
		'title': 'Third Flag',
		'desc': 'Third flag shown on a flag row.',
		'enum': $.extend([], nckFlagEnum)
	};

	nkSettings['flag3'] = {
		'def': 'is_gold',
		'type': 'enum',
		'title': 'Last Flag',
		'desc': 'Last flag shown on a flag row.',
		'enum': $.extend([], nckFlagEnum)
	};

	nkSettings['interval'] = {
		'def': '600',
		'type': 'int',
		'title': 'Refresh Interval',
		'desc': 'Interval that your karma stats will be checked.',
		'min': nckma.testing() ? 4 : 59,
		'kill0': true
	};

	nkSettings['row0'] = {
		'def': 'lKarma',
		'type': 'enum',
		'title': 'Top Icon Row Contents',
		'desc': 'Contents of top icon row.',
		'enum': $.extend([], nckRowEnum)
	};

	nkSettings['row1'] = {
		'def': 'cKarma',
		'type': 'enum',
		'title': 'Bottom Icon Row Contents',
		'desc': 'Contents of bottom icon row.',
		'enum': $.extend([], nckRowEnum)
	};

	nkSettings['savedRefreshes'] = {
		'def': '5000',
		'type': 'int',
		'title': 'Saved History Items',
		'desc': 'Size of the karma gain/loss history.',
		'min': 5,
		'max': 8000,
		'kill0': true
	};

	nkSettingsKeys = bpmv.keys(nkSettings, true);

	nckma.opts.valid_color = function (val, setting) {
		return nckma.px.color_test(val) ? true : 'Color needs to be in the format "0-255, 0-255, 0-255, 0.0-1.0".';
	};

	nckma.opts.valid = {
		'alertCommentGain': function (val) {
			return parseInt(val) > 10 ? true : nkOptionNames['alertCommentGain'] + ' must be greater than 10.';
		},
		'alertLinkGain': function (val) {
			return parseInt(val) > 10 ? true : nkOptionNames['alertLinkGain'] + ' must be greater than 10.';
		},
		'color_black': nckma.opts.valid_color,
		'color_blue': nckma.opts.valid_color,
		'color_gold': nckma.opts.valid_color,
		'color_gray': nckma.opts.valid_color,
		'color_green': nckma.opts.valid_color,
		'color_purple': nckma.opts.valid_color,
		'color_red': nckma.opts.valid_color,
		'color_negChange': nckma.opts.valid_color,
		'color_noChange': nckma.opts.valid_color,
		'color_posChange': nckma.opts.valid_color,
		'interval': function (val) {
			return (parseInt(val) > (nckma.testing() ? 4 : 119)) || (parseInt(val) === 0) ? true : nkOptionNames['interval'] + ' must be 1 minute or more.';
		},
		'savedRefreshes': function (val) {
			val = parseInt(val, 10);

			return (( val >= 0) && ( val <= nkMaxHist) ? true : nkOptionNames['savedRefreshes'] + ' must be a number between 0 and '+nkMaxHist+'.');
		}
	};

	/*
	* functions
	*/

	nckma.opts.bad_setting = function (type, setting, args) {
		nckma.err('nckma.opts.valid_'+type+'(): Setting "'+setting+'" is invalid in source. Please report a bug.', {
			'args': args
		});

		return 'Setting "'+setting+'" is invalid in source. Please report a bug. Type: "'+type+'"; Arguments: '+(bpmv.obj(args) || bpmv.arr(args) ? JSON.stringify(args) : args)+';';
	};

	/*
	// this is still unused...
	nckma.conf = function (vr, vl) {
		var pre = 'conf_option_';

		if (bpmv.str(vr) && bpmv.str(nkDefaults[vr])) {
			if (nkFlags['aConfFB']) {
				if (!bpmv.str(localStorage[pre+vr]) && bpmv.str(localStorage[vr])) {
					localStorage[pre+vr] = ''+localStorage[vr];
					localStorage.removeItem(vr);

					nckma.debug(0, 'migrated alpha option '+vr, localStorage[pre+vr]);
				}
			}

			if (bpmv.str(vl)) {
				localStorage[pre+vr] = ''+vl;

				nckma.debug(5, 'set option '+vr, localStorage[pre+vr]);
			}

			return localStorage[pre+vr];
		}
	};
	*/

	nckma.opts.defaults_get = function (extended) {
		var ret = null;
		var iter = null;

		if (extended) {
			ret = $.extend({}, nkSettings);
		} else {
			ret = {};

			for (iter in nkSettings) {
				if (nkSettings.hasOwnProperty(iter) && bpmv.obj(nkSettings[iter], true)) {
					ret[iter] = ''+nkSettings[iter].def;
				}
			}

			if (!bpmv.obj(ret, true)) {
				ret = null;
			}
		}

		return ret;
	};

	nckma.opts.defaults_set = function (preserve) {
		var defs = nckma.opts.defaults_get();
		var statText = false;

		if ((bpmv.bool(preserve) && preserve ) || confirm('Restore default Narcikarma options?')) {
			for (var aC in defs) {
				if (defs.hasOwnProperty(aC) && bpmv.str(aC)) {
					if (bpmv.bool(preserve) && preserve  && (typeof(localStorage[aC]) != 'undefined' ) && (localStorage[aC]) != null) {
						statText = bpmv.func(nckma.opts.valid[aC]) ? nckma.opts.valid[aC](localStorage[aC]) : false;

						if (!bpmv.str(statText)) {
							continue;
						} else {
							nckma.warn('Previous value of '+aC+' was invalid!', localStorage[aC]);

							localStorage[aC] = defs[aC];
						}
					} else {
						localStorage[aC] = defs[aC];
					}
				}
			}

			if ($('body.nckOptions').is(':visible')) {
				nckma.opts.ui_restore() && nckma.opts.save();
			}

			if (!bpmv.bool(preserve) || !preserve) {
				nckma.track('func', 'nckma.opts.ui_restore DEFAULTS', 'nkExec');
			}
		}
	};

	nckma.opts.get = function (asJson) {
		var opts = {};
		var defs = nckma.opts.defaults_get();

		for (var aC in defs) {
			if (defs.hasOwnProperty(aC)) {
				opts[aC] = localStorage[aC];
			}
		}

		if (asJson) {
			return JSON.stringify(opts);
		}

		return opts;
	};

	// Saves options to localStorage.
	nckma.opts.save = function () {
		var cache = nckma._cache;
		var defs = nckma.opts.defaults_get();
		var jL = $('#changed_options_list');
		var jlGood = false;
		var statText = '';
		var newTxt = '';

		if (!$('body.nckOptions').is(':visible')) {
			return;
		}

		$('.nckOptionsContainer span').hide();

		if (nckma.testing() && bpmv.obj(jL) && bpmv.num(jL.length)) {
			jL.empty();
			jlGood = true;
		}

		for (var aC in defs) {
			if (defs.hasOwnProperty(aC) && bpmv.str(aC)) {
				if (!bpmv.obj(cache[aC]) || !bpmv.num(cache[aC].length)) {
					cache[aC] = $('#opt_'+aC);
				}

				if (!bpmv.obj(cache[aC+'_status']) || !bpmv.num(cache[aC+'_status'].length)) {
					cache[aC+'_status'] = $('#opt_'+aC+'_status');
				}

				statText = bpmv.func(nckma.opts.valid[aC]) ? nckma.opts.valid[aC](cache[aC].val()) : false;

				if (bpmv.obj(cache[aC]) && bpmv.num(cache[aC].length)) {
					if (bpmv.bool(statText)) {
						localStorage[aC] = cache[aC].val();

						if (localStorage[aC] != defs[aC]) {
							nckma.track(aC, localStorage[aC], 'nkOptionsSaved');
						}

						if (cache[aC].is('select')) {
							newTxt =  cache[aC].find('option:selected').text();
						} else if (cache[aC].is('input[type="checkbox"]')) {
							localStorage[aC] = ''+cache[aC].is(':checked');
							newTxt = localStorage[aC];
						} else {
							newTxt = cache[aC].val();
						}

						nckma.opts.ui_status(aC, nkOptionNames[aC]+' set to ' + newTxt + '.');

						if (jlGood) {
							jL.append('<li style="color: rgba( ' + localStorage['color_green'] + ');">'+nkOptionNames[aC]+' set to &quot;'+newTxt+'&quot;</li>');
						}
					} else if (bpmv.str(statText)) {
						nckma.opts.ui_status(aC, 'Failed saving &quot;'+nkOptionNames[aC]+'&quot;. ' + statText + '.', true);

						if (jlGood) {
							jL.append('<li style="color: rgba( ' + localStorage['color_red'] + ');">'+nkOptionNames[aC]+' failed to save. '+statText+'</li>');
						}
					}
				}
			}
		}
		if (jlGood) {
			setTimeout(function () {
				jL.stop().show().fadeOut(5000, function () {
					jL.empty();
					jL.show();
				});
			}, 8000);
		}

		nckma.opts.ui_change(null, true);

		nckma.track('func', 'nckma.opts.save', 'nkExec');
		nckma.track('saved', '', 'nkOptions');
	};

	// Detect changes in the options page elements
	nckma.opts.ui_change = function (ev, noList) {
		var tJ = null;
		var defs = nckma.opts.defaults_get();
		var ego = null;
		var changed = 0;
		var jT = $(this);
		var jL = $('#changed_options_list');
		var newVal = null;
		var addClass = false;

		if ((/^(alpha|picker)_opt_color_/).test(jT.attr('id'))) {
			return;
		}

		$('.tab-single').removeClass('nckTabChanged');

		if (bpmv.obj(jL) && bpmv.num(jL.length) && !noList) {
			jL.empty();
		}

		for (var aC in defs) {
			addClass = false;
			tJ = $('#opt_'+aC);

			if (defs.hasOwnProperty(aC) && bpmv.str(aC) && bpmv.obj(tJ) && bpmv.num(tJ.length)) {
				newVal = ''+tJ.val();

				if (tJ.is('input[type="checkbox"]')) {
					newVal = ''+tJ.is(':checked');

					if (bpmv.trueish(localStorage[aC] ) != bpmv.trueish(newVal)) {
						changed++;
						addClass = true;

						if (!noList) {
							jL.append('<li>'+nkOptionNames[aC]+' changed from &quot;'+localStorage[aC]+'&quot; to &quot;'+newVal+'&quot;</li>');
						}
					}
				} else if (newVal != localStorage[aC]) {
					changed++;
					addClass = true;

					if (!noList) {
						jL.append('<li>'+nkOptionNames[aC]+' changed from &quot;'+localStorage[aC]+'&quot; to &quot;'+newVal+'&quot;</li>');
					}
				}

				if (addClass) {
					tJ.parentsUntil('.tab-single').parent().addClass('nckTabChanged');
					tJ.parent().addClass('nckOptionChanged');
				} else {
					tJ.parent().removeClass('nckOptionChanged');
				}
			}
		}

		if (changed > 0) {
			nckmaNeedsSave = true;

			$('.optSaveToggle').removeAttr('disabled');
		} else {
			nckmaNeedsSave = false;

			$('.optSaveToggle').attr('disabled', 'disabled');
		}
	};

	// converts the options page UI values to a proper localStorage RGBA
	nckma.opts.ui_change_color = function () {
		var ego = $(this).attr('id');
		var cN = ego.replace(/^[^_]+_opt_color_/, '');
		var tA = $('#alpha_opt_color_'+cN);
		var tJ = $('#opt_color_'+cN);
		var tP = $('#picker_opt_color_'+cN);
		var opa = 1;

		if ((/^alpha_opt_color_/).test(ego ) || (/^picker_opt_color_/).test(ego)) {
			opa = ($('#alpha_opt_color_'+cN).val()/1000);

			$('#picker_opt_color_'+cN).css({ 'opacity': opa });

			tJ.val(nckma.hex2rgb($('#picker_opt_color_'+cN).val()).join(', ') + ', ' + opa);
			tJ.change();
		}
	};

	nckma.opts.ui_init = function () {
		var ivlSel = null;
		var tStr = null;
		var bgP = chrome.extension.getBackgroundPage();

		if ($('body.nckOptions').is(':visible')) {
			if (nckma.testing()) {
				ivlSel = $('#opt_interval');

				$('<h3>DEV MODE <span class="nkNote"><a href="_test_canvas.html" target="_blank">canvas test</a></span></h3>').insertAfter('#nck_title');

				// add dev time options
				if (bpmv.obj(ivlSel) && bpmv.num(ivlSel.length)) {
					ivlSel.prepend('<option value="30" style="color: #fff; background: #900">test 30 sec</option>');
					ivlSel.prepend('<option value="15" style="color: #fff; background: #900">test 15 sec</option>');
					ivlSel.prepend('<option value="10" style="color: #fff; background: #900">test 10 sec</option>');
					ivlSel.prepend('<option value="5" style="color: #fff; background: #900">test 5 sec</option>');
				}

				// add dev kill data tool
				tStr = '';
				tStr += '<div class="nckOptionsContainer" title="KILL ALL THE DATA!">\n';
				tStr += '<button id="nck_btn_kill_all" class="nckDangerButton">Kill All Data</button>\n';
				tStr += '<label for="nck_btn_kill_all" class="label-right">Dev only! Kill all localStorage and DB storage.</label>\n';
				tStr += '&nbsp;<span id="opt_nck_btn_kill_all_status"></span>\n';
				tStr += '</div>\n';

				$('#tools_tab .tab-contents').append(tStr ).find('#nck_btn_kill_all').click(function ( ev) {
					if (confirm('This will erase all localStorage and DB storage. May have detrimental effects!')) {
						localStorage.clear();
						nckma.opts.ui_restore();
						bgP.nckma.reset(true);
						nckma.track('func', 'nck_btn_kill_all - DEV', 'nkExec');
					}
				});

				// log use of dev
				nckma.track('func', 'nckma.opts.ui_init - DEV', 'nkExec');
			}
		}
	};

	// Restores select box state to saved value from localStorage.
	nckma.opts.ui_restore = function () {
		var cache = nckma._cache;
		var defs = nckma.opts.defaults_get();
		var lJ = null;
		var set = null;
		var tColor = null;

		if (bpmv.obj(cache) && bpmv.obj(defs)) {
			for (var aC in defs) {
				if (defs.hasOwnProperty(aC) && bpmv.str(aC)) {
					if (!bpmv.str(localStorage[aC])) {
						localStorage[aC] = defs[aC];
					}

					if (!bpmv.obj(cache[aC]) || !bpmv.num(cache[aC].length)) {
						cache[aC] = $('#opt_'+aC);
					}

					if (bpmv.obj(cache[aC]) && bpmv.num(cache[aC].length)) {
						set = bpmv.obj(nkSettings[aC]) ? nkSettings[aC] : null;

						if (cache[aC].is('input[type="checkbox"]')) {
							if (bpmv.trueish(localStorage[aC])) {
								cache[aC].attr('checked', 'checked');
							} else {
								cache[aC].removeAttr('checked');
							}
						} else {
							cache[aC].val(localStorage[aC]);
						}

						if (cache[aC].is('input[id^="opt_color_"]')) {
							tColor = localStorage[aC].split(/\s?,\s?/);
							$('#picker_opt_'+aC).val('#'+nckma.rgb2hex(localStorage[aC]));

							if (tColor.length === 4) {
								$('#picker_opt_'+aC).css({ 'opacity': tColor[3] });
								$('#alpha_opt_'+aC).val(parseFloat(tColor[3]) * 1000);
							} else {
								$('#alpha_opt_'+aC).val(1000);
							}
						}

						if (bpmv.obj(set)) {
							if (bpmv.str(set.title)) {
								if (cache[aC].is('input[id^="opt_color_"]')) {
									$('label[for="picker_opt_'+aC+'"]').text(set.title.replace(/\scolor$/i, ''));
								} else {
									$('label[for="opt_'+aC+'"]').text(set.title);
								}
							}

							if (bpmv.str(set.type) && (set.type == 'enum') && bpmv.arr(set.enum) && bpmv.num(set.enum.length)) {
								cache[aC].empty();
								for (var en = 0; en < set.enum.length; en++) {
									cache[aC].append('<option value="'+set.enum[en].v+'" '+(localStorage[aC] == set.enum[en].v ? ' selected="selected"': '')+'>'+set.enum[en].n+'</option');
								}
							}

							if (bpmv.str(set.desc)) {
									cache[aC].prevUntil('.nckOptionsContainer' ).parent().attr('title', set.desc)
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
		var cache = nckma._cache;
		var defs = nckma.opts.defaults_get();
		var jL = $('#changed_options_list');
		var jlGood = false;
		var statText = '';
		var newTxt = '';

		if (!$('body.nckOptions').is(':visible')) {
			return;
		}

		$('.nckOptionsContainer span').hide();

		if (nckma.testing() && bpmv.obj(jL) && bpmv.num(jL.length)) {
			jL.empty();
			jlGood = true;
		}

		for (var aC in defs) {
			if (defs.hasOwnProperty(aC) && bpmv.str(aC)) {
				if (!bpmv.obj(cache[aC]) || !bpmv.num(cache[aC].length)) {
					cache[aC] = $('#opt_'+aC);
				}

				if (!bpmv.obj(cache[aC+'_status']) || !bpmv.num(cache[aC+'_status'].length)) {
					cache[aC+'_status'] = $('#opt_'+aC+'_status');
				}

				statText = bpmv.func(nckma.opts.valid[aC]) ? nckma.opts.valid[aC](cache[aC].val()) : false;

				if (bpmv.obj(cache[aC]) && bpmv.num(cache[aC].length)) {
					if (bpmv.bool(statText)) {
						localStorage[aC] = cache[aC].val();

						if (localStorage[aC] != defs[aC]) {
							nckma.track(aC, localStorage[aC], 'nkOptionsSaved');
						}

						if (cache[aC].is('select')) {
							newTxt =  cache[aC].find('option:selected').text();
						} else if (cache[aC].is('input[type="checkbox"]')) {
							localStorage[aC] = ''+cache[aC].is(':checked');
							newTxt = localStorage[aC];
						} else {
							newTxt = cache[aC].val();
						}

						nckma.opts.ui_status(aC, nkOptionNames[aC]+'set to ' + newTxt + '.');

						if (jlGood) {
							jL.append('<li style="color: rgba( ' + localStorage['color_green'] + ');">'+nkOptionNames[aC]+' set to &quot;'+newTxt+'&quot;</li>');
						}
					} else if (bpmv.str(statText)) {
						nckma.opts.ui_status(aC, 'Failed saving &quot;'+nkOptionNames[aC]+'&quot;. ' + statText + '.', true);

						if (jlGood) {
							jL.append('<li style="color: rgba( ' + localStorage['color_red'] + ');">'+nkOptionNames[aC]+' failed to save. '+statText+'</li>');
						}
					}
				}
			}
		}

		if (jlGood) {
			setTimeout(function () {
				jL.stop().show().fadeOut(5000, function () {
					jL.empty();
					jL.show();
				});
			}, 8000);
		}

		nckma.opts.ui_change(null, true);

		nckma.track('func', 'nckma.opts.save', 'nkExec');
		nckma.track('saved', '', 'nkOptions');
	};

	nckma.opts.ui_status = function (optName, txt, isErr) {
		var jEle    = null;
		var fadeIn  = 100;
		var fadeOut = 8000;

		if (bpmv.str(optName) && bpmv.str(txt)) {
			isErr = isErr ? true : false;

			if (!bpmv.obj(nckma._cache[optName+'_status']) || !bpmv.num(nckma._cache[optName+'_status'].length)) {
				nckma._cache[optName+'_status'] = $('#opt_'+optName+'_status');

				if (!nckma._cache[optName+'_status']) {
					return;
				}
			}

			jEle = nckma._cache[optName+'_status'];

			if (isErr) {
				jEle.html('<span class="nckOptionsError" style="color: rgba(' + localStorage['color_red'] + ');">Error: '+ txt + '</sapn>').stop( true).fadeIn( fadeIn);
			} else {
				jEle.html('<span class="" style="color: rgba(' + localStorage['color_green'] + ');">'+ txt + '</sapn>').stop( true).fadeIn( fadeIn, function () {
					jEle.stop(true).show().fadeOut(fadeOut, function () {
						jEle.empty();
						jEle.show();
					});
				});
			}
		}
	};

	nckma.opts.valid_bool = function (val, setting) {
		var set = bpmv.str(setting) ? nkSettings[setting] : null;
		var setTit = '';

		if (bpmv.obj(set, true) && (set.type === 'bool')) {
			setTit = bpmv.str(set.title) ? set.title : setting;

			return /^(true|false|on|off|checked)$/i.test(''+val) ? true : 'Setting "'+setTit+'" must be true or false.';
		}

		return nckma.opts.bad_setting('bool', setting, arguments);
	};

	nckma.opts.valid_color = function (val, setting) {
		var set = bpmv.str(setting) ? nkSettings[setting] : null;
		var setTit = '';

		if (bpmv.obj(set, true) && (set.type === 'color')) {
			setTit = bpmv.str(set.title) ? set.title : setting;

			return nckma.px.color_test(val) ? true : 'Setting "'+setTit+'" must to be in the format "0-255, 0-255, 0-255, 0.0-1.0".';
		}

		return nckma.opts.bad_setting('bool', setting, arguments);
	};

	nckma.opts.valid_enum = function (val, setting) {
		var set = bpmv.str(setting) ? nkSettings[setting] : null;
		var v = parseInt(val, 10);
		var i = 0;
		var oneOf = '';
		var setTit = '';

		if (bpmv.obj(set, true) && (set.type === 'enum') && bpmv.arr(set.enum)) {
			setTit = bpmv.str(set.title) ? set.title : setting;

			for (i = 0; i < set.enum.length; i++) {
				if (bpmv.str(set.enum[i].v)) {
					if (set.enum[i].v == val) {
						return true;
					}

					if (bpmv.str(set.enum[i].n)) {
						oneOf += '"'+set.enum[i].n+'"';
					} else {
						oneOf += '"'+set.enum[i].v+'"';
					}

					oneOf += (i == set.enum.length - 1 ) ? '' : (( i < set.enum.length - 2) ? ', ' : ', or ');
				}
			}

			if (bpmv.str(oneOf)) {
				return 'Setting "'+setTit+'" must be one of '+oneOf+'.';
			}
		}

		return nckma.opts.bad_setting('enum', setting, arguments);
	};

	nckma.opts.valid_int = function (val, setting) {
		var set = bpmv.str(setting) ? nkSettings[setting] : null;
		var v = parseInt(val, 10);
		var ret = '';
		var setTit = '';

		if (bpmv.obj(set, true) && (set.type === 'int')) {
			setTit = bpmv.str(set.title) ? set.title : setting;
			ret += 'Setting "'+setTit+'" must be a number';
			ret += (bpmv.num(set.min, true) ? ' higher than '+set.min : '');
			ret += (bpmv.num(set.min, true) && bpmv.num(set.max) ? (set.kill0 ? ',' : ' and') : '');
			ret += (bpmv.num(set.max) ? ' lower than '+set.max : '');
			ret += ((bpmv.num(set.min, true) || bpmv.num(set.max)) && set.kill0 ? ',' : '');
			ret += (set.kill0 ? ' or 0 to disable' : '');
			ret += '.';

			if (bpmv.num(v, true)) {
				if (bpmv.num(set.min, true) && (v < set.min)) {
					if (!(set.kill0 && (v === 0)) || !set.kill0) {
						return ret;
					}
				}

				if (bpmv.num(set.max) && (v > set.max)) {
					return ret;
				}

				return true;
			} else {
				return ret;
			}
		}

		return nckma.opts.bad_setting('int', setting, arguments);
	};

	/*
	* startup cb
	*/

	nckma.start(function () {
		console.log('nkSettings', { 'curr_len': bpmv.count(nkSettings) });
		console.log('nkSettingsKeys', nkSettingsKeys);
	});

})();
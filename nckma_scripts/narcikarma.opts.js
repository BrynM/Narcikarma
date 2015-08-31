/*!
* narcikarma.opts.js
*/

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

	var nckResetVersions = [
		'0.5013',
		'0.5013.D',
	];

	var nkDebugLevel = 5; // opts
	var nckmaNeedsSave = false;
	var nkMaxHist = 8000;
	var nkOptions = {};
	var nkOptionsKeys = [];
	var nkFlagsList = {};
	var nkFlagsList = {
		'blank': {
			'v': 'blank',
			'n': 'blank'
		},
		'has_mail_both': {
			'v': 'has_mail_both',
			'n': 'Inbox or Mod Mail'
		},
		'has_mail': {
			'v': 'has_mail',
			'n': 'Inbox'
		},
		'has_mod_mail': {
			'v': 'has_mod_mail',
			'n': 'Mod Mail'
		},
		'is_mod': {
			'v': 'is_mod',
			'n': 'Moderator'
		},
		'is_gold': {
			'v': 'is_gold',
			'n': 'Reddit Gold'
		},
	};
	var nckFlagEnum = [
		nkFlagsList['blank'],
		nkFlagsList['has_mail_both'],
		nkFlagsList['has_mail'],
		nkFlagsList['has_mod_mail'],
		nkFlagsList['is_mod'],
		nkFlagsList['is_gold'],
	];
	var nckRowList = {
		'cKarma': {
			'v': 'cKarma',
			'n': 'Comment Karma Delta'
		},
		'flagsAndC': {
			'v': 'flagsAndC',
			'n': 'Alternate Status Flags and Comment Karma Delta'
		},
		'flagsAndL': {
			'v': 'flagsAndL',
			'n': 'Alternate Status Flags and Link Karma Delta'
		},
		'flagsAndL': {
			'v': 'flagsAndT',
			'n': 'Alternate Status Flags and Total Karma Delta'
		},
		'lKarma': {
			'v': 'lKarma',
			'n': 'Link Karma Delta'
		},
		'tKarma': {
			'v': 'tKarma',
			'n': 'Total Karma Delta'
		},
		'flags': {
			'v': 'flags',
			'n': 'Status Flags'
		},
	};
	var nckRowEnum = [
		nckRowList['tKarma'],
		nckRowList['cKarma'],
		nckRowList['lKarma'],
		nckRowList['flags'],
		//nckRowList['flagsAndC'],
		//nckRowList['flagsAndL'],
		//nckRowList['flagsAndT'],
	];

	nkOptions['privacyOk'] = {
		'def': 'true',
		'type': 'bool',
		'title': 'Allow anonymous usage collection',
		'desc': 'Allow anonoymous technical data collection.'
	};
	nkOptions['alertMail'] = {
		'def': 'true',
		'type': 'bool',
		'title': 'New User Mail Message',
		'desc': 'When you recieve a message, reply, or a PM, an alert will be shown.'
	};
	nkOptions['alertModMail'] = {
		'def': 'true',
		'type': 'bool',
		'title': 'New Moderator Mail Message',
		'desc': 'When you recieve a moderator mail message, an alert will be shown.'
	};
	nkOptions['alertCommentGain'] = {
		'def': 0,
		'type': 'int',
		'title': 'Comment Karma Gain Threshold',
		'desc': 'When your comment karma has increased by this amount, an alert will be shown. Zero will disable these alerts.',
		'min': 5,
		'kill0': true
	};
	nkOptions['alertCommentLoss'] = {
		'def': 0,
		'type': 'int',
		'title': 'Comment Karma Loss Threshold',
		'desc': 'When your comment karma has fallen by this amount, an alert will be shown. Zero will disable these alerts.',
		'min': 5,
		'kill0': true
	};
	nkOptions['alertLinkGain'] = {
		'def': 0,
		'type': 'int',
		'title': 'Link Karma Gain Threshold',
		'desc': 'When your link karma has increased by this amount, an alert will be shown. Zero will disable these alerts.',
		'min': 5,
		'kill0': true
	};
	nkOptions['alertLinkLoss'] = {
		'def': 0,
		'type': 'int',
		'title': 'Link Karma Loss Threshold',
		'desc': 'When your link karma has fallen by this amount, an alert will be shown. Zero will disable these alerts.',
		'min': 5,
		'kill0': true
	};
	nkOptions['alertTotalGain'] = {
		'def': 50,
		'type': 'int',
		'title': 'Total Karma Gain Threshold',
		'desc': 'When your total Karma has increased by this amount, an alert will be shown. Zero will disable these alerts.',
		'min': 5,
		'kill0': true
	};
	nkOptions['alertTotalLoss'] = {
		'def': 50,
		'type': 'int',
		'title': 'Total Karma Loss Threshold',
		'desc': 'When your total karma has fallen by this amount, an alert will be shown. Zero will disable these alerts.',
		'min': 5,
		'kill0': true
	};
	nkOptions['alternateTime'] = {
		'def': '2',
		'type': 'int',
		'title': 'Flag Alternate Time',
		'desc': 'The time for a row to alternate between flags and other information, if used.',
		'min': 1
	};
	nkOptions['color_negChange'] = {
		'def': '235, 0, 0, 1',
		'type': 'color',
		'title': 'Negative Change Color',
		'desc': 'Color for a "Negative" change in karma.'
	};
	nkOptions['color_noChange'] = {
		'def': '0, 0, 0, 0.65',
		'type': 'color',
		'title': 'No Change Color',
		'desc': 'Color for no change in karma.'
	};
	nkOptions['color_posChange'] = {
		'def': '0, 190, 0, 1',
		'type': 'color',
		'title': 'Positive Change Color',
		'desc': 'Color for a "Positive" change in karma.'
	};
	nkOptions['color_negCommentChange'] = {
		'def': '235, 0, 0, 0.8',
		'type': 'color',
		'title': 'Negative Comment Change Color',
		'desc': 'Color for a "Negative" change in Comment Karma.'
	};
	nkOptions['color_noCommentChange'] = {
		'def': '0, 0, 0, 0.5',
		'type': 'color',
		'title': 'No Change Comment Color',
		'desc': 'Color for no change in Comment Karma.'
	};
	nkOptions['color_posCommentChange'] = {
		'def': '0, 190, 0, 0.8',
		'type': 'color',
		'title': 'Positive Comment Change Color',
		'desc': 'Color for a "Positive" change in Comment Karma.'
	};
	nkOptions['color_negLinkChange'] = {
		'def': '235, 0, 0, 0.8',
		'type': 'color',
		'title': 'Negative Comment Change Color',
		'desc': 'Color for a "Negative" change in Comment Karma.'
	};
	nkOptions['color_noLinkChange'] = {
		'def': '0, 0, 0, 0.5',
		'type': 'color',
		'title': 'No Change Comment Color',
		'desc': 'Color for no change in Comment Karma.'
	};
	nkOptions['color_posLinkChange'] = {
		'def': '0, 190, 0, 0.8',
		'type': 'color',
		'title': 'Positive Comment Change Color',
		'desc': 'Color for a "Positive" change in Comment Karma.'
	};
	nkOptions['color_hasMail'] = {
		'def': '0, 128, 255, 1',
		'type': 'color',
		'title': 'Has mail color',
		'desc': 'Has mail color.'
	};
	nkOptions['color_noMail'] = {
		'def': '160, 160, 160, 0.5',
		'type': 'color',
		'title': 'No mail color',
		'desc': 'Empty mail inbox color.'
	};
	nkOptions['color_hasModMail'] = {
		'def': '189, 132, 202, 1',
		'type': 'color',
		'title': 'Has modmail color',
		'desc': 'Has modmail color.'
	};
	nkOptions['color_noModMail'] = {
		'def': '160, 160, 160, 0.5',
		'type': 'color',
		'title': 'No modmail color',
		'desc': 'Empty modmail inbox color.'
	};
	nkOptions['color_black'] = {
		'def': '0, 0, 0, 1',
		'type': 'color',
		'title': 'Black Color',
		'desc': 'Black Color.'
	};
	nkOptions['color_blue'] = {
		'def': '0, 0, 235, 1',
		'type': 'color',
		'title': 'Blue Color',
		'desc': 'Blue Color.'
	};
	nkOptions['color_gold'] = {
		'def': '176, 176, 21, 1',
		'type': 'color',
		'title': 'Gold Color',
		'desc': 'Gold Color.'
	};
	nkOptions['color_gray'] = {
		'def': '128, 128, 128, 1',
		'type': 'color',
		'title': 'Grey Color',
		'desc': 'Grey Color.'
	};
	nkOptions['color_green'] = {
		'def': '0, 190, 0, 1',
		'type': 'color',
		'title': 'Green Color',
		'desc': 'Green Color.'
	};
	nkOptions['color_purple'] = {
		'def': '215, 0, 215, 1',
		'type': 'color',
		'title': 'Purple Color',
		'desc': 'Purple Color.'
	};
	nkOptions['color_red'] = {
		'def': '235, 0, 0, 1',
		'type': 'color',
		'title': 'Red Color',
		'desc': 'Red Color.'
	};
	nkOptions['cumulativeKarma'] = {
		'def': 'true',
		'type': 'bool',
		'title': 'Show Cumulative Karma',
		'desc': 'Show the karma change for all of the history, not just this browser session.'
	};
	nkOptions['dateFormat'] = {
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
	nkOptions['flag0'] = {
		'def': 'has_mail',
		'type': 'enum',
		'title': 'First Flag',
		'desc': 'First flag shown on a flag row.',
		'enum': $.extend([], nckFlagEnum)
	};
	nkOptions['flag1'] = {
		'def': 'blank',
		'type': 'enum',
		'title': 'Second Flag',
		'desc': 'Second flag shown on a flag row.',
		'enum': $.extend([], nckFlagEnum)
	};
	nkOptions['flag2'] = {
		'def': 'blank',
		'type': 'enum',
		'title': 'Third Flag',
		'desc': 'Third flag shown on a flag row.',
		'enum': $.extend([], nckFlagEnum)
	};
	nkOptions['flag3'] = {
		'def': 'has_mod_mail',
		'type': 'enum',
		'title': 'Last Flag',
		'desc': 'Last flag shown on a flag row.',
		'enum': $.extend([], nckFlagEnum)
	};
	nkOptions['interval'] = {
		'def': '120',
		'type': 'int',
		'title': 'Refresh Interval',
		'desc': 'Interval that your karma stats will be checked. Zero will disable checks.',
		'min': nckma.dev() ? 4 : 59,
		'kill0': true
	};
	nkOptions['row0'] = {
		'def': 'flags',
		'type': 'enum',
		'title': 'Top Icon Row Contents',
		'desc': 'Contents of top icon row.',
		'enum': $.extend([], nckRowEnum)
	};
	nkOptions['row1'] = {
		'def': 'tKarma',
		'type': 'enum',
		'title': 'Bottom Icon Row Contents',
		'desc': 'Contents of bottom icon row.',
		'enum': $.extend([], nckRowEnum)
	};
	nkOptions['savedRefreshes'] = {
		'def': '5000',
		'type': 'int',
		'title': 'Saved History Items',
		'desc': 'Size of the karma gain/loss history.',
		'min': 5,
		'max': 8000,
		'kill0': true
	};

	nkOptionsKeys = bpmv.keys(nkOptions, true);

	nkValidators = {
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
			return (parseInt(val) > (nckma.dev() ? 4 : 59)) || (parseInt(val) === 0) ? true : nkOptions['interval'].title + ' must be 1 minute or more.';
		},
		'savedRefreshes': function (val) {
			val = parseInt(val, 10);

			return (( val >= 0) && ( val <= nkMaxHist) ? true : nkOptions['savedRefreshes'].title + ' must be a number between 0 and '+nkMaxHist+'.');
		}
	};

	/*
	* functions
	*/

	function check_privacy() {
		if (typeof localStorage['privacyOk'] !== 'undefined') {
			return;
		}

		nckma.track('func', 'check_privacy', 'nkExec');
		localStorage['privacyOk'] = true;

		nckma.notify.confirm(
			'Allow collection of anonymous technical usage data?',
			'Narcikarma collects some anonymous data which is explained and can be turned off in the Privacy Options.',
			function(){
				nckma.pages.go_to_options('privacy');
			},
			undefined,
			{
				buttons: [
					{'title': 'View and/or change the Privacy Options.'},
					{'title': 'I\'m okay with that data collection.'}
				]
			}
		);
	}

	function local_obj (key, val) {
		if(!bpmv.str(key)) {
			return 
		}

		if(bpmv.obj(val)) {
			localStorage[key] = JSON.stringify(val);
		}

		return localStorage[key] ? JSON.parse(localStorage[key]) : undefined;
	}

	/*
	* nckma.opts functions
	*/

	nckma.opts.bad_setting = function (type, setting, args) {
		nckma.err('nckma.opts.valid_'+type+'(): Setting "'+setting+'" is invalid in source. Please report a bug.', {
			'args': args
		});

		return 'Setting "'+setting+'" is invalid in source. Please report a bug. Type: "'+type+'"; Arguments: '+(bpmv.obj(args) || bpmv.arr(args) ? JSON.stringify(args) : args)+';';
	};

	nckma.opts.check_reset_version = function () {
		var ver = nckma.version().str;
		var loc = local_obj('nckResetVersions');

		nckma.debug(nkDebugLevel, 'opts.check_reset_version', nckResetVersions);

		if(nckResetVersions.indexOf(ver) > -1 && (!bpmv.arr(loc) || loc.indexOf(ver) < 0)) {
			local_obj('nckResetVersions', nckResetVersions);

			nckma.notify.confirm(
				'Recommended options reset?',
				'It is strongly recommended that you reset your options when first running this version of Narcikarma. Would you like to reset the Narcikarma options now?',
				function(){
					nckma.opts.defaults_set(false);
				}
			);

			nckma.track('func', 'nckma.opts.check_reset_version', 'nkExec');
		}

	};

	nckma.opts.defaults_get = function (extended) {
		var ret = null;
		var iter = null;

		if (extended) {
			ret = $.extend({}, nkOptions);
		} else {
			ret = {};

			for (iter in nkOptions) {
				if (nkOptions.hasOwnProperty(iter) && bpmv.obj(nkOptions[iter], true)) {
					ret[iter] = ''+nkOptions[iter].def;
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

		if(bpmv.trueish(preserve)) {
			check_privacy();

			for (var aC in defs) {
				if (defs.hasOwnProperty(aC) && bpmv.str(aC)) {
					if (typeof localStorage[aC] !== 'undefined' && localStorage[aC] !== null) {

						if (!bpmv.str(nckma.opts.valid(localStorage[aC], aC))) {
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

			nckma.track('func', 'nckma.opts.defaults_set (preserved)', 'nkExec');

			return;
		}

		nckma.notify.confirm('Restore default Narcikarma options?', '', function() {
			for (var aC in defs) {
				localStorage[aC] = defs[aC];
			}

			if ($('body.nckOptions').is(':visible')) {
				nckma.opts.ui_restore() && nckma.opts.save();
			}

			nckma.track('func', 'nckma.opts.defaults_set (clean)', 'nkExec');
		});
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

	nckma.opts.get_default_details = function (asJson) {
		return $.extend({}, nkOptions);
	};

	nckma.opts.get_flag_names = function (asJson) {
		ret = [];

		for (var f = 0; f < 4; f++) {
			if(!bpmv.str(localStorage['flag'+f])) {
				continue;
			}

			ret.push(''+nkFlagsList[localStorage['flag'+f]].n);
		}

		return asJson ? JSON.stringify(ret) : ret;
	};

	nckma.opts.get_row_0_name = function (asJson) {
		var ret = ''+nckRowList[localStorage['row0']].n;

		return asJson ? JSON.stringify(ret) : ret;
	};

	nckma.opts.get_row_1_name = function (asJson) {
		var ret = ''+nckRowList[localStorage['row1']].n;

		return asJson ? JSON.stringify(ret) : ret;
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

		if (nckma.dev() && bpmv.obj(jL) && bpmv.num(jL.length)) {
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

				statText = nckma.opts.valid(cache[aC].val(), aC);

				if (bpmv.obj(cache[aC]) && bpmv.num(cache[aC].length)) {
					if (bpmv.bool(statText)) {
						localStorage[aC] = cache[aC].val();

						if (localStorage[aC] != defs[aC]) {
							nckma.track(aC, localStorage[aC], 'option-'+aC);
						}

						if (cache[aC].is('select')) {
							newTxt =  cache[aC].find('option:selected').text();
						} else if (cache[aC].is('input[type="checkbox"]')) {
							localStorage[aC] = ''+cache[aC].is(':checked');
							newTxt = localStorage[aC];
						} else {
							newTxt = cache[aC].val();
						}

						nckma.opts.ui_status(aC, nkOptions[aC].title+' set to ' + newTxt + '.');

						if (jlGood) {
							jL.append('<li style="color: rgba( ' + localStorage['color_green'] + ');">'+nkOptions[aC].title+' set to &quot;'+newTxt+'&quot;</li>');
						}
					} else if (bpmv.str(statText)) {
						nckma.opts.ui_status(aC, 'Failed saving &quot;'+nkOptions[aC].title+'&quot;. ' + statText + '.', true);

						if (jlGood) {
							jL.append('<li style="color: rgba( ' + localStorage['color_red'] + ');">'+nkOptions[aC].title+' failed to save. '+statText+'</li>');
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
							jL.append('<li>'+nkOptions[aC].title+' changed from &quot;'+localStorage[aC]+'&quot; to &quot;'+newVal+'&quot;</li>');
						}
					}
				} else if (newVal != localStorage[aC]) {
					changed++;
					addClass = true;

					if (!noList) {
						jL.append('<li>'+nkOptions[aC].title+' changed from &quot;'+localStorage[aC]+'&quot; to &quot;'+newVal+'&quot;</li>');
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
			if (nckma.dev()) {
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

				$('#tools_tab .tab-contents').append(tStr ).find('#nck_btn_kill_all').click(function (ev) {
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
						set = bpmv.obj(nkOptions[aC]) ? nkOptions[aC] : null;

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

		if (nckma.dev() && bpmv.obj(jL) && bpmv.num(jL.length)) {
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

				statText = bpmv.func(nkValidators[aC]) ? nkValidators[aC](cache[aC].val()) : false;

				if (bpmv.obj(cache[aC]) && bpmv.num(cache[aC].length)) {
					if (bpmv.bool(statText)) {
						localStorage[aC] = cache[aC].val();

						if (localStorage[aC] != defs[aC]) {
							nckma.track(aC, localStorage[aC], 'option-'+aC);
						}

						if (cache[aC].is('select')) {
							newTxt =  cache[aC].find('option:selected').text();
						} else if (cache[aC].is('input[type="checkbox"]')) {
							localStorage[aC] = ''+cache[aC].is(':checked');
							newTxt = localStorage[aC];
						} else {
							newTxt = cache[aC].val();
						}

						nckma.opts.ui_status(aC, nkOptions[aC].title+'set to ' + newTxt + '.');

						if (jlGood) {
							jL.append('<li style="color: rgba( ' + localStorage['color_green'] + ');">'+nkOptions[aC].title+' set to &quot;'+newTxt+'&quot;</li>');
						}
					} else if (bpmv.str(statText)) {
						nckma.opts.ui_status(aC, 'Failed saving &quot;'+nkOptions[aC].title+'&quot;. ' + statText + '.', true);

						if (jlGood) {
							jL.append('<li style="color: rgba( ' + localStorage['color_red'] + ');">'+nkOptions[aC].title+' failed to save. '+statText+'</li>');
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

	nckma.opts.valid = function(val, setting) {
		var tester;
		var setup;

		if(bpmv.func(nkValidators[setting])) {
			return nkValidators[setting](val);
		}

		setup = nkOptions[setting];

		if(bpmv.obj(setup) && bpmv.str(setup.type)) {
			if(bpmv.func(nckma.opts['valid_'+setup.type])) {
				return nckma.opts['valid_'+setup.type](val, setting);
			}
		}

		return 'Setting '+setting+' does not exist.';
	};

	nckma.opts.valid_bool = function (val, setting) {
		var set = bpmv.str(setting) ? nkOptions[setting] : null;
		var setTit = '';

		if (bpmv.obj(set, true) && (set.type === 'bool')) {
			setTit = bpmv.str(set.title) ? set.title : setting;

			return /^(true|false|on|off|checked)$/i.test(''+val) ? true : 'Setting "'+setTit+'" must be true or false.';
		}

		return nckma.opts.bad_setting('bool', setting, arguments);
	};

	nckma.opts.valid_color = function (val, setting) {
		var set = bpmv.str(setting) ? nkOptions[setting] : null;
		var setTit = '';

		if (bpmv.obj(set, true) && (set.type === 'color')) {
			setTit = bpmv.str(set.title) ? set.title : setting;

			return nckma.px.color_test(val) ? true : 'Setting "'+setTit+'" must to be in the format "0-255, 0-255, 0-255, 0.0-1.0".';
		}

		return nckma.opts.bad_setting('bool', setting, arguments);
	};

	nckma.opts.valid_enum = function (val, setting) {
		var set = bpmv.str(setting) ? nkOptions[setting] : null;
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
		var set = bpmv.str(setting) ? nkOptions[setting] : null;
		var v = parseInt(val, 10);
		var ret = '';
		var setTit = '';

		if (bpmv.obj(set, true) && (set.type === 'int')) {
			if(bpmv.trueish(set.kill0) && v === 0) {
				// allow separate min from 0 to disable
				return true;
			}

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
		check_privacy();

		nckma.debug(nkDebugLevel, 'Base Settings', nkOptions);
		nckma.opts.check_reset_version();
	});

})();
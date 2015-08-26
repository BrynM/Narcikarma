(function () {

	/*
	********************************************************************************
	********************************************************************************
	* Alerts
	********************************************************************************
	********************************************************************************
	*/

	nckma.alerts = {};

	var activeAlerts = {

	};
	var alertHandlers = {};
	var alertClickHandlers = {};
	var rgxAlertConf = /^alert[A-Z]/;
	var lastAlertCommentKarma = 0;
	var lastAlertLinkKarma = 0;

	alertHandlers['alertMail'] = function(stats) {
		if(stats.current.has_mail) {
			if(bpmv.str(activeAlerts['alertMail'])) {
				return;
			}

			activeAlerts['alertMail'] = nckma.notify.important('You have '+nckma.str_num(stats.current.inbox_count)+' message'+(stats.current.inbox_count > 1 ? 's' : '')+'. Click to open your Reddit inbox!', {
				'title': 'Reddit Mail',
				'iconUrl': '../nckma_assets/img/iconMail64.png',
				'priority': 2
			});
		} else {
			activeAlerts['alertMail'] = null;
		}
	};

	alertClickHandlers['alertMail'] = function () {
		nckma.pages.open('inbox');
	};

	alertHandlers['alertModMail'] = function(stats) {
		if(stats.current.has_mod_mail) {
			if(bpmv.str(activeAlerts['alertModMail'])) {
				return;
			}

			activeAlerts['alertModMail'] = nckma.notify.important('You have modmail messages! Click to open modmail.', {
				'title': 'Reddit Modail',
				'iconUrl': '../nckma_assets/img/iconModMail64.png',
				'priority': 2
			});
		} else {
			activeAlerts['alertModMail'] = null;
		}
	};

	alertClickHandlers['alertModMail'] = function () {
		nckma.pages.open('modmail');
	};

	alertHandlers['alertCommentGain'] = function(stats) {
		var cDelt = parseInt(nckma.pages.get_stat('comment_delta'), 10) - lastAlertCommentKarma;
		var gainz = parseInt(nckma.opts.get().alertCommentGain, 10);
		var niceDelt;

		if(gainz > 0 && cDelt >= gainz) {
			if(bpmv.str(activeAlerts['alertCommentGain'])) {
				return;
			}

			lastAlertCommentKarma = cDelt;
			niceDelt = nckma.str_num(cDelt);

			activeAlerts['alertCommentGain'] = nckma.notify.important('You\'ve gained '+niceDelt+' Comment Karma on Reddit! Click to open your user page. You will be alerted every '+gainz+' points.', {
				'title': niceDelt+' Comment Karma!',
				'iconUrl': '../nckma_assets/img/icon64.png',
				'priority': 1
			});
		} else {
			activeAlerts['alertCommentGain'] = null;
		}
	};

	alertClickHandlers['alertCommentGain'] = function () {
		activeAlerts['alertCommentGain'] = null;
		nckma.pages.go_to_user();
	};

	alertHandlers['alertLinkGain'] = function(stats) {
		var lDelt = parseInt(nckma.pages.get_stat('link_delta'), 10) - lastAlertLinkKarma;
		var gainz = parseInt(nckma.opts.get().alertLinkGain, 10);
		var niceDelt;

		if(gainz > 0 && lDelt >= gainz) {
			if(bpmv.str(activeAlerts['alertLinkGain'])) {
				return;
			}

			lastAlertLinkKarma = lDelt;
			niceDelt = nckma.str_num(lDelt);

			activeAlerts['alertLinkGain'] = nckma.notify.important('You\'ve gained '+niceDelt+' Link Karma on Reddit! Click to open your user page. You will be alerted every '+gainz+' points.', {
				'title': niceDelt+' Link Karma!',
				'iconUrl': '../nckma_assets/img/icon64.png',
				'priority': 1
			});
		} else {
			activeAlerts['alertLinkGain'] = null;
		}
	};

	alertClickHandlers['alertLinkGain'] = function () {
		activeAlerts['alertLinkGain'] = null;
		nckma.pages.go_to_user();
	};

	alertHandlers['alertTotalGain'] = function(stats) {
		var lDelt = parseInt(nckma.pages.get_stat('link_delta'), 10) - lastAlertLinkKarma;
		var gainz = parseInt(nckma.opts.get().alertTotalGain, 10);
		var niceDelt;

		if(gainz > 0 && lDelt >= gainz) {
			if(bpmv.str(activeAlerts['alertTotalGain'])) {
				return;
			}

			lastAlertLinkKarma = lDelt;
			niceDelt = nckma.str_num(lDelt);

			activeAlerts['alertTotalGain'] = nckma.notify.important('You\'ve gained '+niceDelt+' total Karma on Reddit! Click to open your user page. You will be alerted every '+gainz+' points.', {
				'title': niceDelt+' more precious Karma!',
				'iconUrl': '../nckma_assets/img/icon64.png',
				'priority': 1
			});
		} else {
			activeAlerts['alertTotalGain'] = null;
		}
	};

	alertClickHandlers['alertTotalGain'] = function () {
		activeAlerts['alertTotalGain'] = null;
		nckma.pages.go_to_user();
	};

	function handle_alert_clicked (evName, noteId) {
		var iter;

		for (iter in activeAlerts) {
			if (!bpmv.str(activeAlerts[iter]) || noteId !== activeAlerts[iter]) {
				continue;
			}

			if (bpmv.func(alertClickHandlers[iter])) {
				alertClickHandlers[iter]();
			}
		}
	}

	function handle_parse () {
		var opts = nckma.opts.get();
		var stats = nckma.get();
		var iter;

		for (iter in opts) {
			if (rgxAlertConf.test(iter) && bpmv.func(alertHandlers[iter])) {
				alertHandlers[iter](stats);
			}
		}
	}

	nckma.alerts.test = function () {
		alertHandlers['alertCommentGain'](nckma.get());
	};

	nckma.ev('parse', handle_parse);
	nckma.ev('notifyClicked', handle_alert_clicked);
})();

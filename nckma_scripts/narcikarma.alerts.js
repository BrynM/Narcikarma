/*!
* narcikarma.alerts.js
*/

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
	var lastAlertCommentGain = 0;
	var lastAlertCommentLoss = 0;
	var lastAlertLinkGain = 0;
	var lastAlertLinkLoss = 0;
	var lastAlertTotalGain = 0;
	var lastAlertTotalLoss = 0;

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
		var cDelt = parseInt(nckma.pages.get_stat('comment_delta'), 10) - lastAlertCommentGain;
		var gainz = parseInt(nckma.opts.get().alertCommentGain, 10);
		var niceDelt;

		if(gainz > 0 && cDelt >= gainz) {
			if(bpmv.str(activeAlerts['alertCommentGain'])) {
				return;
			}

			lastAlertCommentGain = cDelt;
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

	alertHandlers['alertCommentLoss'] = function(stats) {
		var cDelt = parseInt(nckma.pages.get_stat('comment_delta'), 10) - lastAlertCommentLoss;
		var gainz = 0 - parseInt(nckma.opts.get().alertCommentLoss, 10);
		var niceDelt;

		if(gainz < 0 && cDelt <= gainz) {
			if(bpmv.str(activeAlerts['alertCommentLoss'])) {
				return;
			}

			lastAlertCommentLoss = cDelt;
			niceDelt = nckma.str_num(cDelt);

			activeAlerts['alertCommentLoss'] = nckma.notify.important('You\'ve lost '+niceDelt+' Comment Karma on Reddit! Click to open your user page. You will be alerted every '+gainz+' lost points.', {
				'title': niceDelt+' Comment Karma lost!',
				'iconUrl': '../nckma_assets/img/iconWarn64.png',
				'priority': 1
			});
		} else {
			activeAlerts['alertCommentLoss'] = null;
		}
	};
	alertClickHandlers['alertCommentLoss'] = function () {
		activeAlerts['alertCommentLoss'] = null;
		nckma.pages.go_to_user();
	};

	alertHandlers['alertLinkGain'] = function(stats) {
		var lDelt = parseInt(nckma.pages.get_stat('link_delta'), 10) - lastAlertLinkGain;
		var gainz = parseInt(nckma.opts.get().alertLinkGain, 10);
		var niceDelt;

		if(gainz > 0 && lDelt >= gainz) {
			if(bpmv.str(activeAlerts['alertLinkGain'])) {
				return;
			}

			lastAlertLinkGain = lDelt;
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

	alertHandlers['alertLinkLoss'] = function(stats) {
		var cDelt = parseInt(nckma.pages.get_stat('comment_delta'), 10) - lastAlertLinkLoss;
		var gainz = 0 - parseInt(nckma.opts.get().alertLinkLoss, 10);
		var niceDelt;

		if(gainz < 0 && cDelt <= gainz) {
			if(bpmv.str(activeAlerts['alertLinkLoss'])) {
				return;
			}

			lastAlertLinkLoss = cDelt;
			niceDelt = nckma.str_num(cDelt);

			activeAlerts['alertLinkLoss'] = nckma.notify.important('You\'ve lost '+niceDelt+' Link Karma on Reddit! Click to open your user page. You will be alerted every '+gainz+' lost points.', {
				'title': niceDelt+' Link Karma lost!',
				'iconUrl': '../nckma_assets/img/iconWarn64.png',
				'priority': 1
			});
		} else {
			activeAlerts['alertLinkLoss'] = null;
		}
	};
	alertClickHandlers['alertLinkLoss'] = function () {
		activeAlerts['alertLinkLoss'] = null;
		nckma.pages.go_to_user();
	};

	alertHandlers['alertTotalGain'] = function(stats) {
		var lDelt = parseInt(nckma.pages.get_stat('link_delta'), 10) - lastAlertTotalGain;
		var gainz = parseInt(nckma.opts.get().alertTotalGain, 10);
		var niceDelt;

		if(gainz > 0 && lDelt >= gainz) {
			if(bpmv.str(activeAlerts['alertTotalGain'])) {
				return;
			}

			lastAlertTotalGain = lDelt;
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

	alertHandlers['alertTotalLoss'] = function(stats) {
		var cDelt = parseInt(nckma.pages.get_stat('comment_delta'), 10) - lastAlertTotalLoss;
		var gainz = 0 - parseInt(nckma.opts.get().alertTotalLoss, 10);
		var niceDelt;

		if(gainz < 0 && cDelt <= gainz) {
			if(bpmv.str(activeAlerts['alertTotalLoss'])) {
				return;
			}

			lastAlertTotalLoss = cDelt;
			niceDelt = nckma.str_num(cDelt);

			activeAlerts['alertTotalLoss'] = nckma.notify.important('You\'ve lost '+niceDelt+' total Karma on Reddit! Click to open your user page. You will be alerted every '+gainz+' lost points.', {
				'title': niceDelt+' total Karma lost!',
				'iconUrl': '../nckma_assets/img/iconWarn64.png',
				'priority': 1
			});
		} else {
			activeAlerts['alertTotalLoss'] = null;
		}
	};
	alertClickHandlers['alertTotalLoss'] = function () {
		activeAlerts['alertTotalLoss'] = null;
		nckma.pages.go_to_user();
	};

	function handle_alert_clicked (ev) {
		var iter;

		if(!bpmv.obj(ev) || !bpmv.str(ev.data)) {
			return;
		}

		for (iter in activeAlerts) {
			if (!bpmv.str(activeAlerts[iter]) || ev.data !== activeAlerts[iter]) {
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

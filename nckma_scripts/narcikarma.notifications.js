(function () {

	/*
	********************************************************************************
	********************************************************************************
	* Support for UI pages
	* https://developer.chrome.com/apps/notifications#type-NotificationOptions
	********************************************************************************
	********************************************************************************
	*/

	nckma.notify = {};

	var presets = {
		'error': {
			'type': 'basic',
			'title': 'Note',
			'message': 'Narcikarma unknown error!!!',
			'iconUrl': '../nckma_assets/img/iconWarn.png',
			'isClickable': true,
			'contextMessage': 'Narcikarma '+nckma.version().str
		},
		'note': {
			'type': 'basic',
			'title': 'Note',
			'message': 'Narcikarma unknown notification!',
			'iconUrl': '../nckma_assets/img/icon.png',
			'isClickable': true,
			'contextMessage': 'Narcikarma '+nckma.version().str
		},
		'warning': {
			'type': 'basic',
			'title': 'Warning!',
			'message': 'Narcikarma unknown warning!',
			'iconUrl': '../nckma_assets/img/iconWarn.png',
			'isClickable': true,
			'contextMessage': 'Narcikarma '+nckma.version().str
		}
	};
	var titles = {
		'warning': 'Warning!',
	};
	var waitNote = 5000;
	var waitWarning = 10000;

	function handle_clicked (noteId) {
		chrome.notifications.clear(noteId);
	}

	function notify (config, cb) {
		var id = bpmv.ego();

		chrome.notifications.create(id, config, cb);
	}

	function notify_group (arr, config, cb) {
		var iter;
		var len;
		var items = [];
		var id;

		if(bpmv.str(arr)) {
			config.message = arr;
			return notify(config);
		}

		if(!bpmv.arr(arr)) {
			return;
		}

		len = arr.length;

		for(iter = 0; iter < len; iter++) {
			if(bpmv.str(arr[iter])) {
				items.push({
					'title': arr[iter],
					'message': ''
				});
			}
		}

		if(bpmv.arr(items)) {
			config.items = items;
			config.type = 'list';

			notify(config, cb);
		}
	}

	nckma.notify.note = function(note) {
		var cfg = $.extend({}, presets['note']);

		cfg.message = ''+note;

		notify(cfg, function() {
			setTimeout(function() {
				chrome.notifications.clear(id);
			}, waitNote);
		});
		nckma.track('func', 'notify.note', 'nkExec');
	};

	nckma.notify.warn_group = function (warnArr) {
		var cfg = $.extend({}, presets['warning']);

		cfg.title = titles.warning;

		notify_group(warnArr, cfg, function() {
			setTimeout(function() {
				chrome.notifications.clear(id);
			}, waitWarning);
		});
		nckma.track('func', 'notify.warn_group', 'nkExec');
	};

	nckma.notify.warn = function(warning) {
		var cfg = $.extend({}, presets['warning']);

		cfg.message = ''+warning;

		notify(cfg, function() {
			setTimeout(function() {
				chrome.notifications.clear(id);
			}, waitWarning);
		});
		nckma.track('func', 'notify.warn', 'nkExec');
	};

	chrome.notifications.onClicked.addListener(handle_clicked)
})();


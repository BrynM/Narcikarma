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
			'title': 'ERROR!!!',
			'message': 'Narcikarma unknown error!!!',
			'iconUrl': '../nckma_assets/img/iconErr64.png',
			'isClickable': true,
			'priority': 2,
			'contextMessage': 'Narcikarma '+nckma.version().str
		},
		'note': {
			'type': 'basic',
			'title': 'Note',
			'message': 'Narcikarma unknown notification!',
			'iconUrl': '../nckma_assets/img/icon64.png',
			'isClickable': true,
			'priority': 0,
			'contextMessage': 'Narcikarma '+nckma.version().str
		},
		'warning': {
			'type': 'basic',
			'title': 'Warning!',
			'message': 'Narcikarma unknown warning!',
			'iconUrl': '../nckma_assets/img/iconWarn64.png',
			'isClickable': true,
			'priority': 1,
			'contextMessage': 'Narcikarma '+nckma.version().str
		}
	};
	var titles = {
		'note': 'Info',
		'error': 'ERROR!!!',
		'warning': 'Warning!',
	};
	var waitNote = 5000;
	var waitError = 0;
	var waitWarning = 10000;

	function handle_clicked (noteId) {
		chrome.notifications.clear(noteId);
	}

	function notify (config, wait) {
		var id = bpmv.ego();
		var cb = parseInt(wait, 10) < 1 ? null : function() {
			setTimeout(function() {
				try {
					chrome.notifications.clear(id);
				} catch(e) {}
			}, wait);
		};

		chrome.notifications.create(id, config, cb);
	}

	function notify_group (arr, config, wait) {
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

			notify(config, wait);
		}
	}

	nckma.notify.err = function(error) {
		var cfg = $.extend({}, presets['error']);

		cfg.message = ''+error;

		notify(cfg, waitError);
		nckma.track('func', 'notify.error', 'nkExec');
	};

	nckma.notify.err_group = function (errArr) {
		var cfg = $.extend({}, presets['error']);

		notify_group(errArr, cfg, waitError);
		nckma.track('func', 'notify.err_group', 'nkExec');
	};

	nckma.notify.note = function(note) {
		var cfg = $.extend({}, presets['note']);

		cfg.message = ''+note;

		notify(cfg, waitNote);
		nckma.track('func', 'notify.note', 'nkExec');
	};

	nckma.notify.note_group = function (noteArr) {
		var cfg = $.extend({}, presets['note']);

		notify_group(noteArr, cfg, waitNote);
		nckma.track('func', 'notify.note_group', 'nkExec');
	};

	nckma.notify.warn = function(warning) {
		var cfg = $.extend({}, presets['warning']);

		cfg.message = ''+warning;

		notify(cfg, waitWarning);
		nckma.track('func', 'notify.warn', 'nkExec');
	};

	nckma.notify.warn_group = function (warnArr) {
		var cfg = $.extend({}, presets['warning']);

		notify_group(warnArr, cfg, waitWarning);
		nckma.track('func', 'notify.warn_group', 'nkExec');
	};

	chrome.notifications.onClicked.addListener(handle_clicked)
})();


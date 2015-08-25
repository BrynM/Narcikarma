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
		'confirm': {
			'type': 'basic',
			'title': 'Confirmation',
			'message': 'Narcikarma unknown error!!!',
			'iconUrl': '../nckma_assets/img/iconErr64.png',
			'isClickable': false,
			'priority': 2,
			'buttons': [
				{'title': 'Yes'},
				{'title': 'No'}
			],
			'contextMessage': 'Narcikarma '+nckma.version().str
		},
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
	var confirmCallbacks = {};

	function handle_clicked (noteId) {
		chrome.notifications.clear(noteId);
	}

	function handle_button (noteId, buttonIdx) {
		if (bpmv.obj(confirmCallbacks[noteId])) {
			if (bpmv.func(confirmCallbacks[noteId][buttonIdx])) {
				confirmCallbacks[noteId][buttonIdx](noteId, buttonIdx);
			}
			delete(confirmCallbacks[noteId]);
		}
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

		return id;
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

			return notify(config, wait);
		}
	}

	nckma.notify.confirm = function(title, msg, cbA, cbB) {
		var cfg = $.extend({}, presets['confirm']);
		var id;

		cfg.message = ''+msg;
		cfg.title = ''+title;

		id = notify(cfg, waitError);
		confirmCallbacks[id] = [cbA, cbB];

		nckma.track('func', 'notify.confirm', 'nkExec');
	};

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

	chrome.notifications.onButtonClicked.addListener(handle_button);
	chrome.notifications.onClicked.addListener(handle_clicked);
})();


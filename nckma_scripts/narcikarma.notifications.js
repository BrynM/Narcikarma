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
			'contextMessage': 'Narcikarma'
		},
		'error': {
			'type': 'basic',
			'title': 'ERROR!!!',
			'message': 'Narcikarma unknown error!!!',
			'iconUrl': '../nckma_assets/img/iconErr64.png',
			'isClickable': true,
			'priority': 2,
			'contextMessage': 'Narcikarma'
		},
		'note': {
			'type': 'basic',
			'title': 'Note',
			'message': 'Narcikarma unknown notification!',
			'iconUrl': '../nckma_assets/img/icon64.png',
			'isClickable': true,
			'priority': 0,
			'contextMessage': 'Narcikarma'
		},
		'warning': {
			'type': 'basic',
			'title': 'Warning!',
			'message': 'Narcikarma unknown warning!',
			'iconUrl': '../nckma_assets/img/iconWarn64.png',
			'isClickable': true,
			'priority': 1,
			'contextMessage': 'Narcikarma'
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
		nckma.ev('notifyClicked', noteId);
	}

	function handle_closed (noteId, byUser) {
		nckma.ev('notifyClosed', arguments);
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

		if(bpmv.str(config.contextMessage)) {
			config.contextMessage = config.contextMessage+'\n('+nckma.pages.tpl('ext_name_full')+')';
		} else {
			config.contextMessage = '('+nckma.pages.tpl('ext_name_full')+')';
		}

		chrome.notifications.create(id, config, cb);
		nckma.ev('notify', [id, config, wait]);

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

	nckma.notify.confirm = function(title, msg, cbA, cbB, conf) {
		var cfg = $.extend({}, presets['confirm']);
		var id;

		if(bpmv.obj(conf)) {
			$.extend(cfg, conf);
		}

		cfg.message = ''+msg;
		cfg.title = ''+title;

		id = notify(cfg, 0);
		confirmCallbacks[id] = [cbA, cbB];

		nckma.track('func', 'notify.confirm', 'nkExec');

		return id;
	};


	nckma.notify.important = function(txt, conf) {
		var cfg = $.extend({}, presets['error']);

		if(bpmv.obj(conf)) {
			$.extend(cfg, conf);
		}

		cfg.message = ''+txt;

		nckma.track('func', 'notify.important', 'nkExec');

		return notify(cfg, 0);
	};

	nckma.notify.err = function(error, conf) {
		var cfg = $.extend({}, presets['error']);

		if(bpmv.obj(conf)) {
			$.extend(cfg, conf);
		}

		cfg.message = ''+error;

		nckma.track('func', 'notify.error', 'nkExec');

		return notify(cfg, waitError);
	};

	nckma.notify.err_group = function (errArr, conf) {
		var cfg = $.extend({}, presets['error']);

		if(bpmv.obj(conf)) {
			$.extend(cfg, conf);
		}

		nckma.track('func', 'notify.err_group', 'nkExec');

		return notify_group(errArr, cfg, waitError);
	};

	nckma.notify.note = function(note, conf) {
		var cfg = $.extend({}, presets['note']);

		cfg.message = ''+note;

		if(bpmv.obj(conf)) {
			$.extend(cfg, conf);
		}

		nckma.track('func', 'notify.note', 'nkExec');

		return notify(cfg, waitNote);
	};

	nckma.notify.note_group = function (noteArr, conf) {
		var cfg = $.extend({}, presets['note']);

		if(bpmv.obj(conf)) {
			$.extend(cfg, conf);
		}

		nckma.track('func', 'notify.note_group', 'nkExec');

		return notify_group(noteArr, cfg, waitNote);
	};

	nckma.notify.warn = function(warning, conf) {
		var cfg = $.extend({}, presets['warning']);

		if(bpmv.obj(conf)) {
			$.extend(cfg, conf);
		}

		cfg.message = ''+warning;

		nckma.track('func', 'notify.warn', 'nkExec');

		return notify(cfg, waitWarning);
	};

	nckma.notify.warn_group = function (warnArr, conf) {
		var cfg = $.extend({}, presets['warning']);

		if(bpmv.obj(conf)) {
			$.extend(cfg, conf);
		}

		nckma.track('func', 'notify.warn_group', 'nkExec');

		return notify_group(warnArr, cfg, waitWarning);
	};

	chrome.notifications.onButtonClicked.addListener(handle_button);
	chrome.notifications.onClicked.addListener(handle_clicked);
	chrome.notifications.onClosed.addListener(handle_closed);

})();


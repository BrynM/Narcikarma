/*!
* narcikarma.db.js
*/

(function () {

	/*
	********************************************************************************
	********************************************************************************
	* DATABASE
	https://developer.mozilla.org/en-US/docs/Web/API/IDBDatabase
	https://developer.mozilla.org/fr/docs/IndexedDB/Using_IndexedDB
	http://staypositive.ru/sklad/
	********************************************************************************
	********************************************************************************
	*/

	//
	// EXPERIMENTAL
	//
	if (!nckma.dev()) {
		return;
	}

	nckma.db = {};

	var nkDb;
	var nkDbCreatedStore;
	var nkDbOpen;
	var nkDbName = (nckma.testing() ? 'test_' : '')+'nckma_history';
	var nkDbNamesDeprecated = [
		'nckma',
	];
	var nkDbVersion = 1;
	var nkDbCols = {
		'name': ['name', {unique: false}],
		'comment_karma': ['comment_karma', {unique: false}],
		'comment_delta': ['comment_delta', {unique: false}],
		'link_karma': ['link_karma', {unique: false}],
		'link_delta': ['link_delta', {unique: false}],
		'total_karma': ['total_karma', {unique: false}],
		'total_delta': ['total_delta', {unique: false}],
		'timestamp': ['timestamp', {unique: false}],
	};
	var nkDbIndexes = {
		'name': ['name', {unique: false}],
		'name_timestamp': [['name', 'timestamp'], {unique: true}],
	};
	var dnkDbIsPruning = false;
	var nkDbColsDeprecated = [
		'id',
	];
	var nkDbTrack = false;
	var nkUserStore;
	var nkUserStoreName = 'nk_user_stats';
	var nkSaneNameRgxs = {
		replace: /([^a-z^0-9^_^-]+|[\s\r\n]+)/ig,
		dupes: /__+/g,
		trim: /(^_+|_+$)/g,
	};

	function call_cb (cB, args, thisObj) {
		var pargs;
		var that;

		if (!bpmv.func(cB)) {
			return;
		}

		pargs = bpmv.arr(args, true) ? args : [args];
		that = typeof thisObj !== 'undefined' ? thisObj : this;

		return cB.apply(that, pargs);
	}

	function db_close (cB) {
		if (!nkDbOpen) {
			call_cb(cB, nkDbOpen, this);

			return nkDb;
		}

		try {
			nkDbOpen.close();
			nkDbOpen = false;

			call_cb(cB, nkDbOpen, this);
		} catch (e) {
			nckma.err(e);
		}

		return nkDbOpen;
	}

	function db_open (cB) {
		if (nkDb) {
			call_cb(cB, nkDb, this);

			return nkDb;
		}

		try {
			nkDb = indexedDB.open(nkDbName, nkDbVersion);
			nkDb.onerror = handle_db_err;
			nkDb.onupgradeneeded = handle_db_upgrade;
			nkDb.onsuccess = function () {
				var args = _.extend([cB], arguments);

				call_cb(handle_db_success, args, this);
			};
		} catch (e) {
			nckma.err(e);
		}

		return nkDb;
	}

	function db_create_store (cB) {
		var iter;
		var db = get_db();

		if (!db) {
			return;
		}

		if (nkDbCreatedStore) {
			return nkDbCreatedStore;
		}

		nkDbCreatedStore = db.createObjectStore(nkUserStoreName, {
			autoIncrement: true,
			keyPath: 'id'
		});

		nckma.debug('db', 'db_create_store', [nkDbCreatedStore, arguments]);

		if (!nkDbCreatedStore) {
			nckma.err('Could not open user db store!', nkDbCreatedStore);
		}

		for (iter in nkDbIndexes) {
			if (bpmv.arr(nkDbIndexes[iter])) {
				nkDbCreatedStore.createIndex.apply(nkDbCreatedStore, [iter, nkDbIndexes[iter][0], nkDbIndexes[iter][1]]);
				nckma.debug('db', 'db_create_store created index', iter);
			}
		}

		for (iter = 0; iter < nkDbColsDeprecated.length; iter++) {
			if (_.indexOf(nkDbCreatedStore.indexNames) > -1) {
				nkDbCreatedStore.deleteIndex(nkDbColsDeprecated[iter]);
				nckma.debug('db', 'db_create_store deleted index', iter);
			}
		}
	}

	function delete_deprecated_dbs () {
		var iter;
		var len = nkDbNamesDeprecated.length;
		var req;
		
		for(iter = 0; iter < len; iter++) {
			if(bpmv.str(nkDbNamesDeprecated[iter])) {
				req = indexedDB.deleteDatabase(nkDbNamesDeprecated[iter]);
				req.onsuccess = handle_db_delete;
				req.error = handle_db_delete;
			}
		}
	}

	function get_db () {
		if(nkDbOpen && bpmv.func(nkDbOpen.createObjectStore)) {
			return nkDbOpen;
		}
	}

	function get_store (rwOrTx, cB, tx) {
		var stats;
		var store;
		var rw;
		var txn;

		switch ((''+bpmv.whatis(rwOrTx)).toLowerCase()) {
			case 'boolean':
			case 'undefined':
				txn = get_tx(rwOrTx);
				break;

			case 'string':
				txn = get_tx(rwOrTx.toLowerCase() === 'rw');
				break;

			case 'object':
				if (bpmv.func(rwOrTx.objectStore)) {
					txn = get_tx(rwOrTx);
				}
				break;
		}

		if (!txn) {
			nckma.err('Could not get db transaction for object store!', [txn, arguments]);
			return;
		}

		txn.onerror = function () {
			var args = _.extend([cB], arguments);

			call_cb(handle_tx_error, args, this);
		};
		txn.onabort = function () {
			var args = _.extend([cB], arguments);

			call_cb(handle_tx_abort, args, this);
		};
		txn.oncomplete = function () {
			var args = _.extend([cB], arguments);

			call_cb(handle_tx_complete, args, this);
		};


		return txn.objectStore(nkUserStoreName);
	}

	function get_tx (rw) {
		var db = get_db();

		if (!db) {
			nckma.err('Could not get db for transaction!', db);
			return;
		}

		return db.transaction(nkUserStoreName, (rw ? 'readwrite' : 'readonly'));
	}

	function handle_db_abort (ev) {
		track('func', 'handle_db_abort', 'nkExec');
		nckma.debug('db', 'handle_db_abort', arguments);
	}

	function handle_db_delete(ev) {
		if (!bpmv.obj(ev)) {
			return;
		}

		if (ev.type === 'success') {
			track('func', 'handle_db_delete success', 'nkExec');
			nckma.debug('db', 'Deleted DB', ev);

			return;
		}

		track('func', 'handle_db_delete fail', 'nkExec');
		nckma.debug('db', 'Deleted DB FAIL', ev);

		return;
	}

	function handle_db_err (ev) {
		nckma.err('Database error!', arguments);

		track('func', 'handle_db_err', 'nkExec');
		nckma.debug('db', 'handle_db_err', arguments);
	}

	function handle_db_create_store () {
		track('func', 'handle_db_create_store', 'nkExec');
		nckma.debug('db', 'handle_db_create_store', arguments);
	}

	function handle_db_success (cB, ev) {
		if(!nkDbOpen && nkDb && nkDb.result) {
			nkDbOpen = nkDb.result;
		}

		if(bpmv.func(cB)) {
			call_cb(cB, [nkDb, ev], this);
		}

		track('func', 'handle_db_success', 'nkExec');
		nckma.debug('db', 'Opened DB "'+nkDbName+'".', nkDbOpen);
		nckma.ev('openDb', nkDb);
	}

	function handle_parse (ev) {
		stats_save_current();
	}

	function handle_db_upgrade (ev) {
		if(!nkDbOpen) {
			nkDbOpen = ev.target.result;
		}

		delete_deprecated_dbs();
		db_create_store(handle_db_create_store);

		track('func', 'handle_db_upgrade '+nkDbVersion, 'nkExec');
		nckma.debug('db', 'handle_db_upgrade', [nkDbCreatedStore, arguments]);
	}

	function handle_tx_abort (cB, ev) {
		if(bpmv.func(cB)) {
			call_cb(cB, ev, this);
		}

		track('func', 'handle_tx_error', 'nkExec');
		nckma.debug('db', 'handle_tx_error', arguments);
	}

	function handle_tx_complete (cB, ev) {
		if(bpmv.func(cB)) {
			call_cb(cB, ev, this);
		}

		track('func', 'handle_tx_complete', 'nkExec');
		nckma.debug('db', 'handle_tx_complete', arguments);
	}

	function handle_tx_error (cB, ev) {
		if(bpmv.func(cB)) {
			call_cb(cB, ev, this);
		}

		track('func', 'handle_tx_error', 'nkExec');
		nckma.debug('db', 'handle_tx_error', arguments);
	}

	function stats_save_current (cB) {
		var iter;
		var res;
		var stats;
		var saveStats = {};
		var store;

		stats = nckma.get();

		if (!stats || !bpmv.obj(stats.current, true)) {
			nckma.warn('No stats found to save!', stats);
			return;
		}

		store = get_store(true, function (ev) {
			if(bpmv.func(cB)) {
				call_cb(cB, [ev, stats], this);
			}

			nckma.ev('dbSavedStats', [ev, stats]);
		});

		if (!store) {
			nckma.err('Could not get store for saving!', store);
			return;
		}

		for (iter in nkDbCols) {
			if (bpmv.arr(nkDbCols[iter]) && iter in stats.current) {
				saveStats[iter] = stats.current[iter];
			}
		}

		if(!bpmv.obj(saveStats, true)) {
			nckma.warn('No stats parsed to save!', stats);
			return;
		}

		saveStats.timestamp = new Date().valueOf();

		res = store.add(saveStats);

		return [res, store, saveStats];
	}

	function stats_get_user (userName, opts) {
		var index;
		var req;
		var stamp
		var store = get_store();
		var defOpts = {
			'each': null,
			'err': null,
			'finish': null,
			'max': null,
			'timeBegin': 0,
			'timeEnd': new Date().valueOf(),
		};

		if (!bpmv.str(userName)) {
			nckma.err('stats_get_user Invalid user name to retreive stats!', userName);
		}

		if (!store) {
			nckma.err('stats_get_user Could not get store to retreive stats!', store);
		}

		index = store.index('name_timestamp');

		var results = [];
		var lowerBound = [userName, defOpts.timeBegin];
		var upperBound = [userName, defOpts.timeEnd];
		var range = IDBKeyRange.bound(lowerBound, upperBound);
		var req = index.openCursor(range, 'prev');
		var maxRecords = nckma.opts.get().savedRecords;
		var deletedRecords = 0;

		req.onsuccess = function(ev) {
			var cursor = ev.target.result;

			if (cursor && results.length < maxRecords) {
				results.push(cursor.value);
				cursor.continue();
			} else {
				nckma.debug('db', 'stats_get_user result ('+results.length+')', results, deletedRecords, cursor, req, ev);
			}

		};
	}

	function stats_prune_user (userName, eachCb, finalCb) {
		var deletedRecords = 0;
		var finalRes;
		var index;
		var maxRecords = nckma.opts.get().savedRecords;
		var req;
		var results = [];
		var store = get_store('rw');

		if (dnkDbIsPruning) {
			nckma.err('stats_prune_user Already pruning.', userName);
		}

		if (!bpmv.str(userName)) {
			nckma.err('stats_prune_user Invalid user name to retreive stats!', userName);
		}

		dnkDbIsPruning = ''+userName;

		if (!store) {
			nckma.err('stats_prune_user Could not get store to retreive stats!', store);
		}

		index = store.index('name');
		req = index.openCursor(null, 'prev');

		req.onsuccess = function(ev) {
			var cursor = ev.target.result;

			if (cursor) {
				if (results.length < maxRecords) {
					results.push(cursor.value);
				} else {
					if (cursor.value) {
						cursor.delete();
						deletedRecords++;
					}
				}

				cursor.continue();
			} else {
				finalRes = {
					'ev': ev,
					'userName': userName,
					'pruned': deletedRecords,
					'remain': results,
				};

				dnkDbIsPruning = false;

				nckma.ev('dbPruned', finalRes);
				nckma.debug('db', 'stats_prune_user pruned: '+deletedRecords+' remain: '+results.length, finalRes);
			}
		};
	}

	function track() {
		if (!nkDbTrack) {
			return;
		}

		return nckma.track.apply(this, arguments);
	}

	nckma.db.list_stores = function() {
		if(nkDbOpen) {
			return _.extend([], nkDbOpen.objectStoreNames);
		}

		return [];
	};

	nckma.db.close = function () {
		return db_close();
	};

	nckma.db.stats_get_user = function(userName, cB) {
		return stats_get_user(userName, cB);
	};

	nckma.db.stats_prune_user = function(userName, cB) {
		return stats_prune_user(userName, cB);
	};

	nckma.db.kill = function () {
		db_close();

		return indexedDB.deleteDatabase(nkDbName);
	};

	nckma.start(function() {
		db_open();
	});

	nckma.ev('parse', handle_parse);

})();
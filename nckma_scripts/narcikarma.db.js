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

/*

	function StoredStat (data) {
		var useData = bpmv.obj(data);
		var iter;
		var currVal;
		var callBack;

		for (iter in storeDefs) {
			currVal = null;

			if(!storeDefs.hasOwnProperty(iter)) {
				continue;
			}

			this[iter] = storeDefs[iter];

			if(useData && data.hasOwnProperty(iter)) {
				switch (iter) {
					case 'userName':
						if(!bpmv.str(data[iter])) {
							continue;
						}

						this[iter] = ''+data[iter];

					case 'callBack':
						if(!bpmv.func(data[iter])) {
							continue;
						}

						callBack = data[iter];
						break;

					case 'created':
						if(!bpmv.num(data[iter])) {
							continue;
						}

						this[iter] = parseInt(data[iter], 10);
						break;

					case 'cDelta':
					case 'lDelta':
					case 'tDelta':
					case 'cKarma':
					case 'lKarma':
					case 'tKarma':
						if(!bpmv.num(data[iter], true)) {
							continue;
						}

						this[iter] = parseInt(data[iter], 10);
						break;

					default:
						this[iter] = data[iter];
						break;
				}
			}
		}

		if(bpmv.func(callBack)) {
			call_cb(callBack, this, this);
		}
	}

	function db_open_store (storeName, cB) {
		if (!nkDbOpen) {
			return;
		}

		console.log('makey', nkDbOpen.createObjectStore(storeName, {
			autoIncrement: true,
			keyPath: 'id'
		}));
	}

	function db_close () {
		var db = db_open();

		if(db) {
			db.close();
		}
	}

	nckma.db.get_user_tx = function(userName, cB) {
		var tx = nkDbOpen.transaction(nkUserStoreName, 'readonly');
		return true;
	};

	nckma.db.open = function(cB) {
		nckma.track('func', 'nckma.db.open', 'nkExec');
		nckma.debug('db', 'nckma.db.open', arguments);
		return db_open(cB);
	};

	nckma.db.sane_name = function (val, killDupes) {
		var ret;

		if (bpmv.str(val) || bpmv.num(val, true)) {
			ret = (''+val).trim();

			if(!nkSaneNameRgxs.replace.test(val) && !killDupes) {
				return ''+val;
			}

			ret = (''+val)
				.replace(nkSaneNameRgxs.replace, '_')
				.replace(nkSaneNameRgxs.trim, '');

			if (killDupes) {
				ret = ret.replace(nkSaneNameRgxs.dupes, '_');
			}

			if (bpmv.str(ret)) {
				// checked for length
				return ret;
			}
		}
	};

	nckma.db.store_current_stats = function (cB) {
		var objCfg;
		var sObj;

		sObj = new StoredStat({
			callBack: cB,
			cDelta: nckma.pages.get_stat('comment_delta'),
			lDelta: nckma.pages.get_stat('link_delta'),
			tDelta: nckma.pages.get_stat('total_delta'),
			cKarma: nckma.pages.get_stat('comment_karma'),
			lKarma: nckma.pages.get_stat('link_karma'),
			tKarma: nckma.pages.get_stat('total_karma'),
			userName: nckma.pages.get_stat('name'),
			created: new Date().valueOf(),
		});

		return sObj;
	};

	nckma.start(function() {
		db_open();
	});

	nckma.ev('parse', function() {
		var stats = nckma.get();

		if(bpmv.obj(stats) && bpmv.obj(stats.current)) {
			nckma.db.get_user_tx(stats.current.name, function () {
				console.log('got user store '+stats.current.name, arguments);
			});
		}
	});

*/
/* example from https://developer.mozilla.org/fr/docs/IndexedDB/Using_IndexedDB

// This is what our customer data looks like.
const customerData = [
	{ ssn: "444-44-4444", name: "Bill", age: 35, email: "bill@company.com" },
	{ ssn: "555-55-5555", name: "Donna", age: 32, email: "donna@home.org" }
];
const dbName = "the_name";

var request = indexedDB.open(dbName, 2);

request.onerror = function(event) {
	// Handle errors.
};
request.onupgradeneeded = function(event) {
	var db = event.target.result;

	// Create an objectStore to hold information about our customers. We're
	// going to use "ssn" as our key path because it's guaranteed to be
	// unique.
	var objectStore = db.createObjectStore("customers", { keyPath: "ssn" });

	// Create an index to search customers by name. We may have duplicates
	// so we can't use a unique index.
	objectStore.createIndex("name", "name", { unique: false });

	// Create an index to search customers by email. We want to ensure that
	// no two customers have the same email, so use a unique index.
	objectStore.createIndex("email", "email", { unique: true });

	// Store values in the newly created objectStore.
	for (var i in customerData) {
		objectStore.add(customerData[i]);
	}
};

*/
/*
examples from http://www.w3.org/TR/IndexedDB/

var tx = db.transaction("books", "readonly");
var store = tx.objectStore("books");
var index = store.index("by_title");

var request = index.get("Bedrock Nights");
request.onsuccess = function() {
  var matching = request.result;
  if (matching !== undefined) {
    // A match was found.
    report(matching.isbn, matching.title, matching.author);
  } else {
    // No match was found.
    report(null);
  }
};


var tx = db.transaction("books", "readonly");
var store = tx.objectStore("books");
var index = store.index("by_author");

var request = index.openCursor(IDBKeyRange.only("Fred"));
request.onsuccess = function() {
  var cursor = request.result;
  if (cursor) {
    // Called for each matching record.
    report(cursor.value.isbn, cursor.value.title, cursor.value.author);
    cursor.continue();
  } else {
    // No more matching records.
    report(null);
  }
};

db.close();
*/

/*
indexedDB.deleteDatabase('DB NAME')
*/


//	// unlimitedStorage permission overrides size I think
//	var nkDataDb = openDatabase('nkDataDb', '2.0', 'Narcikarma Data', 20 * 1024 * 1024);
//	var nkUserTableRx = /^user\_.*\_data$/;
//	var nkUserTableRepl = /(^user\_|\_data$)/;
//
//	function handle_user_clear(arr, tx, res) {
//		var dbg = nckma.testing(true);
//		var iter;
//		var len = 0;
//		var tn;
//
//		if (bpmv.arr(arr)) {
//
//			len = arr.length;
//
//			for (iter = 0; iter < len; iter++) {
//				if (bpmv.obj(arr[iter]) && bpmv.str(arr[iter].name)) {
//					tn = nckma.db.sane_name(arr[iter].name);
//
//					if (bpmv.str(tn) && (nkUserTableRx).test(tn)) {
//						if (dbg) {
//							nckma.debug('db', 'Attempting to remove user table...', tn);
//						}
//
//						nckma.db.sql('DROP TABLE '+tn+';', function (subTx) {
//							if (dbg) {
//								nckma.debug('db', 'User table '+tn+' removal result:', arguments);
//							}
//						});
//					}
//				}
//			}
//		}
//	};
//
//	function proc_result (res) {
//		var iter;
//		var len;
//		var ret;
//		var dbg = nckma.testing(true);
//
//		if (bpmv.obj(res) && bpmv.typeis(res, 'SQLResultSet')) {
//			if ((res.rowsAffected === 1) && bpmv.num(res.insertId, true)) {
//				if (dbg) {
//					nckma.debug('dbDetail', '[nckma.db] proc single insert', [res.insertId, arguments]);
//				}
//
//				return res.insertId;
//			} else if (bpmv.obj(res.rows) && bpmv.num(res.rows.length)) {
//				len = res.rows.length;
//				ret = [];
//
//				for (iter = 0; iter < len; iter++){
//					ret.push(res.rows.item(iter));
//				}
//
//				if (dbg) {
//					nckma.debug('dbDetail', '[nckma.db] proc result', [ret, arguments]);
//				}
//
//				return ret;
//			} else if (dbg) {
//				nckma.debug('dbDetail', '[nckma.db] proc null', arguments);
//			}
//		}
//	};
//
//	nckma.db.describe = function (table, dCb) {
//		var sql;
//		var tn = nckma.db.sane_name(table);
//
//		if (bpmv.str(table) && bpmv.func(dCb)) {
//
//			sql = 'SELECT sql FROM sqlite_master WHERE name = "'+tn+'" LIMIT 1;'
//
//			nckma.db.sql(sql, function (res) {
//				var args;
//				var ret = [];
//				var retArr;
//
//				if (bpmv.obj(res) && bpmv.obj(res[0]) && bpmv.str(res[0].sql)) {
//					retArr = res[0].sql.match(/\([^)]+\)/);
//
//					if (bpmv.arr(retArr) && bpmv.str(retArr[0])) {
//						retArr = retArr[0].replace(/(\s*[()]\s*)/g, ' ' ).replace(/\s+/g, ' ').split( /\s*,\s*/);
//
//						if (bpmv.arr(retArr)) {
//							for (var it = 0; it < retArr.length; it++) {
//								retArr[it] = retArr[it].match(/^\s*([^\s]+)\s+([^\s]+)\s+(.*)$/);
//
//								if (bpmv.arr(retArr[it])) {
//									retArr[it].shift();
//									if (retArr.length > 0) {
//										ret.push(retArr[it]);
//									}
//								}
//							}
//
//							if (bpmv.arr(ret) && bpmv.arr(ret)) {
//								args = $.extend([], arguments);
//								args.shift();
//								args.unshift(ret);
//								dCb.apply(window, args);
//
//								return;
//							}
//						}
//					}
//				}
//
//				// we should have rearly-returned already if we had success
//				if (bpmv.func(dCb)) {
//					args = $.extend([], arguments);
//					args.unshift(null);
//					dCb.apply(window, args);
//				}
//			});
//		} else if (bpmv.func(dCb)) {
//			args = $.extend([], arguments).unshift(null);
//			dCb.apply(window, args);
//		}
//	};
//
//	nckma.db.error = function (tx, err) {
//		if (bpmv.obj(tx)) {
//			if (bpmv.func(tx._nckmaCb)) {
//				tx._nckmaCb.apply(window, arguments);
//			}
//		}
//
//		nckma.err('[nckma.db] Database transaction error!!!', tx);
//
//		return;
//	};
//
//	nckma.db.op = function (tx, res) {
//		var ret;
//		var args;
//		var dbg;
//		var txt = false;
//
//		if (bpmv.obj(tx)) {
//			dbg = nckma.testing(true);
//			args = $.extend([], arguments);
//
//			switch (bpmv.whatis(tx)) {
//				case 'SQLTransaction':
//					ret = proc_result(res);
//
//					args.unshift(ret);
//
//					if (dbg) {
//						nckma.debug('dbOps', '[nckma.db] Op SQLTransaction', arguments);
//					}
//
//					break;
//				default:
//					args.unshift(ret); // undefined
//
//					if (dbg) {
//						nckma.debug('dbOps', '[nckma.db] Op '+bpmv.whatis(tx), arguments);
//					}
//
//					break;
//			}
//
//			if (bpmv.func(tx._nckmaCb)) {
//				tx._nckmaCb.apply(window, args);
//			}
//		}
//
//		return ret;
//	};
//
//	nckma.db.sane = function (val, noQuotes) {
//		switch (bpmv.whatis(val).toLowerCase()) {
//			case 'string':
//				if (noQuotes) {
//					return encodeURIComponent(val);
//				} else {
//					return '"'+encodeURIComponent(val)+'"';
//				}
//
//				break;
//			case 'number':
//				return val;
//
//				break;
//			case 'nan':
//			case 'null':
//			case 'undefined':
//				return "";
//
//				break;
//		}
//
//		if (bpmv.obj() || bpmv.arr()) {
//			if (noQuotes) {
//				return encodeURIComponent(JSON.stringify(val));
//			} else {
//				return '"'+encodeURIComponent(JSON.stringify(val))+'"';
//			}
//		}
//	};
//
//	nckma.db.sane_name = function (val) {
//		var iter;
//		var len;
//		var ret = '';
//		var rex = /[a-z0-9\_]/i;
//
//		if (bpmv.str(val)) {
//			ret = (''+val).replace(/\s/g, '_' ).replace(/([^a-z0-9_-]+|__+)/g, '_').replace( /(^_+|_+$)/g, '');
//
//			if (bpmv.str(ret)) {
//				return ret;
//			}
//		}
//	};
//
//	nckma.db.sane_table = function (val) {
//		var ret = nckma.db.sane_name(val);
//
//		if (bpmv.str(ret)) {
//			return nkUserTableRx.test(ret) ? ret : 'user_'+ret+'_data' ;
//		}
//	};
//
//	nckma.db.sql = function (sql, cb) {
//		if (bpmv.str(sql)) {
//			try {
//				nckma.debug('dbSql', 'running SQL', { 'sql': sql, 'cb': cb });
//
//				return nkDataDb.transaction(function (tx) {
//					tx._nckmaCb = cb;
//					tx._nckmaSql = sql;
//					tx.executeSql(sql, [], nckma.db.op, nckma.db.error);
//				});
//			} catch (err) {
//				nckma.err('SQL Error.', { 'e': err, 'args': arguments });
//			}
//		}
//	};
//
//	nckma.db.user_clear = function (user) {
//		var ut;
//
//		if (bpmv.str(user)) {
//			ut = nckma.db.sane_table(user);
//
//			if (bpmv.str(ut)) {
//				return nckma.db.sql('SELECT name FROM sqlite_master WHERE type=\'table\' AND name=\''+ut+'\' ORDER BY name LIMIT 1;', handle_user_clear);
//			}
//		} else if ((typeof(user) === 'boolean') && user) { // must pass boolean true for all
//			return nckma.db.sql('SELECT name FROM sqlite_master WHERE type=\'table\' ORDER BY name;', handle_user_clear);
//		}
//	};
//
//	nckma.db.user_get = function (user, whereOrCb, cbOrWhere) {
//		var wh = bpmv.str(cbOrWhere) ? ''+cbOrWhere : null;
//		var gCb = bpmv.func(cbOrWhere) ? cbOrWhere: null;
//		var sql = '';
//		var ut = nckma.db.sane_table(user);
//
//		if (bpmv.str(ut)) {
//			if (bpmv.str(whereOrCb)) {
//				wh = ''+whereOrCb;
//			}
//
//			if (bpmv.func(whereOrCb)) {
//				gCb = whereOrCb;
//			}
//
//			sql = 'SELECT '
//		}
//	};
//
//	nckma.db.user_insert = function (user, data, iCb) {
//		var ins = {};
//		var iter = null;
//		var ut = nckma.db.sane_table(user);
//
//		if (bpmv.str(ut) && bpmv.obj(data, true)) {
//			for (iter in data) {
//				if (bpmv.str(iter) && data.hasOwnProperty(iter) && bpmv.num(data[iter], true)) {
//					switch (iter.toLowerCase()) {
//						case 'comment_karma':
//						case 'ckarma':
//						case 'c':
//							ins.cKarma = parseInt(data[iter], 10);
//							break;
//						case 'delta':
//						case 'd':
//							ins.delta = parseInt(data[iter], 10);
//							break;
//						case 'link_karma':
//						case 'lkarma':
//						case 'l':
//							ins.lKarma = parseInt(data[iter], 10);
//							break;
//						case 'timestamp':
//						case 'epoch':
//						case 't':
//							ins.epoch = parseInt(data[iter], 10);
//							break;
//						default:
//							break;
//					}
//				}
//			}
//
//			if (bpmv.obj(ins, true)) {
//				var sql = '';
//
//				if (!bpmv.num(ins.epoch)) {
//					ins.epoch = new Date().getTime();
//				}
//
//				sql += 'INSERT INTO';
//				sql += ' '+ut+'';
//				sql += ' ('+bpmv.keys(ins ).join(', ')+')';
//				sql += ' VALUES';
//				sql += ' ("'+bpmv.values(ins ).join('", "')+'")';
//				sql += ';';
//
//				nckma.db.sql(sql, function (id) {
//					if (bpmv.num(id, true)) {
//						nckma.ev('dbUserInsert', $.extend([], arguments));
//					}
//					if (bpmv.func(iCb)) {
//						iCb.apply(window, arguments);
//					}
//				});
//			}
//		} else {
//			nckma.warn('Could not insert into user table. User name or data object invalid.', { 'args': arguments, 'ut': ut });
//		}
//	};
//
//	nckma.db.user_table = function (user, tCb) {
//		var sql = '';
//		var ut = nckma.db.sane_table(user);
//
//		if (bpmv.str(ut)) {
//			nckma.db.sql('SELECT name FROM sqlite_master WHERE type=\'table\' AND name=\'user_'+ut+'_data\' ORDER BY name LIMIT 1;', function (res) {
//				if (!bpmv.arr(res)) {
//					sql = [
//						'CREATE TABLE IF NOT EXISTS',
//						' '+ut+'(',
//						' id INTEGER PRIMARY KEY AUTOINCREMENT,',
//						' epoch INTEGER NOT NULL DEFAULT 0,',
//						' delta INTEGER NOT NULL DEFAULT 0,',
//						' cKarma INTEGER NOT NULL DEFAULT 0,',
//						' lKarma INTEGER NOT NULL DEFAULT 0',
//						');'
//					];
//
//					nckma.db.sql(sql.join(''), function () {
//						var args = $.extend([], arguments);
//
//						args.unshift(user);
//						nckma.ev('dbUserTableCreated', args);
//
//						if (bpmv.func(tCb)) {
//							tCb.apply(window, args);
//						}
//					});
//				} else {
//					if (bpmv.func(tCb)) {
//						tCb.apply(window, []);
//					}
//				}
//			});
//		} else {
//			nckma.warn('Could not check/create user table. User name invalid.', { 'orig': user, 'ut': ut });
//		}
//	};
//
//	nckma.db.user_table_list = function (tCb) {
//		nckma.db.sql('SHOW TABLES like "user_%";', function () {
//			var args = $.extend([], arguments);
//
//			nckma.ev('dbUserTablesListed', args);
//
//			if (bpmv.func(tCb)) {
//				tCb.apply(window, args);
//			}
//		});
//	};		

})();
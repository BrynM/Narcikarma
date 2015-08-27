/*!
* narcikarma.db.js
*/

(function () {

	/*
	********************************************************************************
	********************************************************************************
	* DATABASE
	********************************************************************************
	********************************************************************************
	*/

	nckma.db = {};

/*
indexedDB.deleteDatabase('DB NAME')
*/

	// unlimitedStorage permission overrides size I think
	var nkDataDb = openDatabase('nkDataDb', '2.0', 'Narcikarma Data', 20 * 1024 * 1024);
	var nkUserTableRx = /^user\_.*\_data$/;
	var nkUserTableRepl = /(^user\_|\_data$)/;

	function handle_user_clear(arr, tx, res) {
		var dbg = nckma.testing(true);
		var iter;
		var len = 0;
		var tn;

		if (bpmv.arr(arr)) {

			len = arr.length;

			for (iter = 0; iter < len; iter++) {
				if (bpmv.obj(arr[iter]) && bpmv.str(arr[iter].name)) {
					tn = nckma.db.sane_name(arr[iter].name);

					if (bpmv.str(tn) && (nkUserTableRx).test(tn)) {
						if (dbg) {
							nckma.debug(nckma._dL.db, 'Attempting to remove user table...', tn);
						}

						nckma.db.sql('DROP TABLE '+tn+';', function (subTx) {
							if (dbg) {
								nckma.debug(nckma._dL.db, 'User table '+tn+' removal result:', arguments);
							}
						});
					}
				}
			}
		}
	};

	function proc_result (res) {
		var iter;
		var len;
		var ret;
		var dbg = nckma.testing(true);

		if (bpmv.obj(res) && bpmv.typeis(res, 'SQLResultSet')) {
			if ((res.rowsAffected === 1) && bpmv.num(res.insertId, true)) {
				if (dbg) {
					nckma.debug(nckma._dL.dbDetail, '[nckma.db] proc single insert', [res.insertId, arguments]);
				}

				return res.insertId;
			} else if (bpmv.obj(res.rows) && bpmv.num(res.rows.length)) {
				len = res.rows.length;
				ret = [];

				for (iter = 0; iter < len; iter++){
					ret.push(res.rows.item(iter));
				}

				if (dbg) {
					nckma.debug(nckma._dL.dbDetail, '[nckma.db] proc result', [ret, arguments]);
				}

				return ret;
			} else if (dbg) {
				nckma.debug(nckma._dL.dbDetail, '[nckma.db] proc null', arguments);
			}
		}
	};

	nckma.db.describe = function (table, dCb) {
		var sql;
		var tn = nckma.db.sane_name(table);

		if (bpmv.str(table) && bpmv.func(dCb)) {

			sql = 'SELECT sql FROM sqlite_master WHERE name = "'+tn+'" LIMIT 1;'

			nckma.db.sql(sql, function (res) {
				var args;
				var ret = [];
				var retArr;

				if (bpmv.obj(res) && bpmv.obj(res[0]) && bpmv.str(res[0].sql)) {
					retArr = res[0].sql.match(/\([^)]+\)/);

					if (bpmv.arr(retArr) && bpmv.str(retArr[0])) {
						retArr = retArr[0].replace(/(\s*[()]\s*)/g, ' ' ).replace(/\s+/g, ' ').split( /\s*,\s*/);

						if (bpmv.arr(retArr)) {
							for (var it = 0; it < retArr.length; it++) {
								retArr[it] = retArr[it].match(/^\s*([^\s]+)\s+([^\s]+)\s+(.*)$/);

								if (bpmv.arr(retArr[it])) {
									retArr[it].shift();
									if (retArr.length > 0) {
										ret.push(retArr[it]);
									}
								}
							}

							if (bpmv.arr(ret) && bpmv.arr(ret)) {
								args = $.extend([], arguments);
								args.shift();
								args.unshift(ret);
								dCb.apply(window, args);

								return;
							}
						}
					}
				}

				// we should have rearly-returned already if we had success
				if (bpmv.func(dCb)) {
					args = $.extend([], arguments);
					args.unshift(null);
					dCb.apply(window, args);
				}
			});
		} else if (bpmv.func(dCb)) {
			args = $.extend([], arguments).unshift(null);
			dCb.apply(window, args);
		}
	};

	nckma.db.error = function (tx, err) {
		if (bpmv.obj(tx)) {
			if (bpmv.func(tx._nckmaCb)) {
				tx._nckmaCb.apply(window, arguments);
			}
		}

		nckma.err('[nckma.db] Database transaction error!!!', tx);

		return;
	};

	nckma.db.op = function (tx, res) {
		var ret;
		var args;
		var dbg;
		var txt = false;

		if (bpmv.obj(tx)) {
			dbg = nckma.testing(true);
			args = $.extend([], arguments);

			switch (bpmv.whatis(tx)) {
				case 'SQLTransaction':
					ret = proc_result(res);

					args.unshift(ret);

					if (dbg) {
						nckma.debug(nckma._dL.dbOps, '[nckma.db] Op SQLTransaction', arguments);
					}

					break;
				default:
					args.unshift(ret); // undefined

					if (dbg) {
						nckma.debug(nckma._dL.dbOps, '[nckma.db] Op '+bpmv.whatis(tx), arguments);
					}

					break;
			}

			if (bpmv.func(tx._nckmaCb)) {
				tx._nckmaCb.apply(window, args);
			}
		}

		return ret;
	};

	nckma.db.sane = function (val, noQuotes) {
		switch (bpmv.whatis(val).toLowerCase()) {
			case 'string':
				if (noQuotes) {
					return encodeURIComponent(val);
				} else {
					return '"'+encodeURIComponent(val)+'"';
				}

				break;
			case 'number':
				return val;

				break;
			case 'nan':
			case 'null':
			case 'undefined':
				return "";

				break;
		}

		if (bpmv.obj() || bpmv.arr()) {
			if (noQuotes) {
				return encodeURIComponent(JSON.stringify(val));
			} else {
				return '"'+encodeURIComponent(JSON.stringify(val))+'"';
			}
		}
	};

	nckma.db.sane_name = function (val) {
		var iter;
		var len;
		var ret = '';
		var rex = /[a-z0-9\_]/i;

		if (bpmv.str(val)) {
			ret = (''+val).replace(/\s/g, '_' ).replace(/([^a-z0-9_-]+|__+)/g, '_').replace( /(^_+|_+$)/g, '');

			if (bpmv.str(ret)) {
				return ret;
			}
		}
	};

	nckma.db.sane_table = function (val) {
		var ret = nckma.db.sane_name(val);

		if (bpmv.str(ret)) {
			return nkUserTableRx.test(ret) ? ret : 'user_'+ret+'_data' ;
		}
	};

	nckma.db.sql = function (sql, cb) {
		if (bpmv.str(sql)) {
			try {
				nckma.debug(nckma._dL.dbSql, 'running SQL', { 'sql': sql, 'cb': cb });

				return nkDataDb.transaction(function (tx) {
					tx._nckmaCb = cb;
					tx._nckmaSql = sql;
					tx.executeSql(sql, [], nckma.db.op, nckma.db.error);
				});
			} catch (err) {
				nckma.err('SQL Error.', { 'e': err, 'args': arguments });
			}
		}
	};

	nckma.db.user_clear = function (user) {
		var ut;

		if (bpmv.str(user)) {
			ut = nckma.db.sane_table(user);

			if (bpmv.str(ut)) {
				return nckma.db.sql('SELECT name FROM sqlite_master WHERE type=\'table\' AND name=\''+ut+'\' ORDER BY name LIMIT 1;', handle_user_clear);
			}
		} else if ((typeof(user) === 'boolean') && user) { // must pass boolean true for all
			return nckma.db.sql('SELECT name FROM sqlite_master WHERE type=\'table\' ORDER BY name;', handle_user_clear);
		}
	};

	nckma.db.user_get = function (user, whereOrCb, cbOrWhere) {
		var wh = bpmv.str(cbOrWhere) ? ''+cbOrWhere : null;
		var gCb = bpmv.func(cbOrWhere) ? cbOrWhere: null;
		var sql = '';
		var ut = nckma.db.sane_table(user);

		if (bpmv.str(ut)) {
			if (bpmv.str(whereOrCb)) {
				wh = ''+whereOrCb;
			}

			if (bpmv.func(whereOrCb)) {
				gCb = whereOrCb;
			}

			sql = 'SELECT '
		}
	};

	nckma.db.user_insert = function (user, data, iCb) {
		var ins = {};
		var iter = null;
		var ut = nckma.db.sane_table(user);

		if (bpmv.str(ut) && bpmv.obj(data, true)) {
			for (iter in data) {
				if (bpmv.str(iter) && data.hasOwnProperty(iter) && bpmv.num(data[iter], true)) {
					switch (iter.toLowerCase()) {
						case 'comment_karma':
						case 'ckarma':
						case 'c':
							ins.cKarma = parseInt(data[iter], 10);
							break;
						case 'delta':
						case 'd':
							ins.delta = parseInt(data[iter], 10);
							break;
						case 'link_karma':
						case 'lkarma':
						case 'l':
							ins.lKarma = parseInt(data[iter], 10);
							break;
						case 'timestamp':
						case 'epoch':
						case 't':
							ins.epoch = parseInt(data[iter], 10);
							break;
						default:
							break;
					}
				}
			}

			if (bpmv.obj(ins, true)) {
				var sql = '';

				if (!bpmv.num(ins.epoch)) {
					ins.epoch = new Date().getTime();
				}

				sql += 'INSERT INTO';
				sql += ' '+ut+'';
				sql += ' ('+bpmv.keys(ins ).join(', ')+')';
				sql += ' VALUES';
				sql += ' ("'+bpmv.values(ins ).join('", "')+'")';
				sql += ';';

				nckma.db.sql(sql, function (id) {
					if (bpmv.num(id, true)) {
						nckma.ev('dbUserInsert', $.extend([], arguments));
					}
					if (bpmv.func(iCb)) {
						iCb.apply(window, arguments);
					}
				});
			}
		} else {
			nckma.warn('Could not insert into user table. User name or data object invalid.', { 'args': arguments, 'ut': ut });
		}
	};

	nckma.db.user_table = function (user, tCb) {
		var sql = '';
		var ut = nckma.db.sane_table(user);

		if (bpmv.str(ut)) {
			nckma.db.sql('SELECT name FROM sqlite_master WHERE type=\'table\' AND name=\'user_'+ut+'_data\' ORDER BY name LIMIT 1;', function (res) {
				if (!bpmv.arr(res)) {
					sql = [
						'CREATE TABLE IF NOT EXISTS',
						' '+ut+'(',
						' id INTEGER PRIMARY KEY AUTOINCREMENT,',
						' epoch INTEGER NOT NULL DEFAULT 0,',
						' delta INTEGER NOT NULL DEFAULT 0,',
						' cKarma INTEGER NOT NULL DEFAULT 0,',
						' lKarma INTEGER NOT NULL DEFAULT 0',
						');'
					];

					nckma.db.sql(sql.join(''), function () {
						var args = $.extend([], arguments);

						args.unshift(user);
						nckma.ev('dbUserTableCreated', args);

						if (bpmv.func(tCb)) {
							tCb.apply(window, args);
						}
					});
				} else {
					if (bpmv.func(tCb)) {
						tCb.apply(window, []);
					}
				}
			});
		} else {
			nckma.warn('Could not check/create user table. User name invalid.', { 'orig': user, 'ut': ut });
		}
	};

	nckma.db.user_table_list = function (tCb) {
		nckma.db.sql('SHOW TABLES like "user_%";', function () {
			var args = $.extend([], arguments);

			nckma.ev('dbUserTablesListed', args);

			if (bpmv.func(tCb)) {
				tCb.apply(window, args);
			}
		});
	};		

})();
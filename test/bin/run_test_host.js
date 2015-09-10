(function() {
	// adapted from http://stackoverflow.com/a/13635318/3250939

	var http = require('http');
	var url = require('url');
	var path = require('path');
	var fs = require('fs');
	var bpmv = require(__dirname+'/../../lib/bpmv.js').bpmv;
	var _ = require(__dirname+'/../../lib/underscore-min.js');

	var contentTypesByExtension = {
		'.html': 'text/html',
		'.css': 'text/css',
		'.js': 'text/javascript',
		'.json': 'application/json',
		'.ico': 'image/x-icon',
	};
	var port = 8023;
	var rgxCustomMe = /^\/me\/([^\/]+)\/me\.json$/;

	var meBase = {
		kind: "t2",
		data: {
			comment_karma: 0,
			created: 0,
			created_utc: 0,
			gold_creddits: 0,
			gold_expiration: 0,
			has_mail: false,
			has_mod_mail: false,
			has_verified_email: false,
			hide_from_robots: false,
			id: '',
			inbox_count: 0,
			is_friend: false,
			is_gold: false,
			is_mod: false,
			link_karma: 0,
			modhash: '',
			name: '',
			over_18: false,
		}
	};

	var meCache = {};
	var meFakedFuncs = {};
	var meNk = 'nkAltered';
	var rgxStrToSecs = /^([\+\-]?[0-9]+)\s*([a-z]+)$/i;
	var verbSet = {};
	var logging = true;
	var logFile = path.join(__dirname, '/../data/'+path.basename(__filename).replace(/\.[^.]+$/, '')+'.log');
	var time = {
		'sec': 1,
		'min': 60,
		'hour': (60 * 60 * 60),
		'day': (60 * 60 * 60 * 24),
		'week': (60 * 60 * 60 * 24 * 7),
		'year': (60 * 60 * 60 * 24 * 365),
	}

	function Verb (verbName, opts) {
		var iter;
		var resultCache = {};
		var defKeys = {
			sign: null,
			verb: null,
		};
		var defs = {
			isRand: false,
			change: null,
			high: null,
			keys: null,
			len: null,
			low: null,
			proc: null,
			rgx: null,
			rgxString: null,
			sign: null,
			verb: verbName,
		}

		if (!bpmv.str(verbName)) {
			return;
		}

		for (iter in defs) {
			if (defs.hasOwnProperty(iter)) {
				this[iter] = defs[iter];
			}
		}

		if (bpmv.obj(opts)) {
			for (iter in opts) {
				if (opts.hasOwnProperty(iter)) {
					this[iter] = opts[iter];
				}
			}
		}

		this.verb = verbName;

		if (bpmv.obj(opts) && bpmv.obj(opts.keys)) {
			this.keys = _.extend({}, opts.keys);
		}

		if (bpmv.typeis(this.rgx, 'RegExp')) {
			this.rgxString = this.rgx.toString();
		}

		this.test = function () {
			console.log('#### '+this.verb+' '+this.change, this.result);
			console.log(this.verb+'.to_bool()', this.to_bool());
			console.log(this.verb+'.to_int()', this.to_int());
			console.log(this.verb+'.to_pct()', this.to_pct());
			console.log(this.verb+'.to_str()', this.to_str());
			console.log(' ');
		};

		this.to_bool = function (def) {
			var cKey = 'to_bool';
			var ret;

			if (typeof this.result === 'undefined' || this.result === null) {
				return false;
			}

			if (typeof resultCache[cKey] !== 'undefined') {
				return true && resultCache[cKey];
			}

			ret = true && bpmv.trueish(def);

			if (bpmv.str(this.verb)) {
				switch(this.verb) {
					case 'rand':
					case 'chance':
						ret = true && this.result;
						break;

					case 'dateUs':
					case 'dateUk':
						ret = bpmv.typeis(this.result, 'Date') ? this.result.valueOf() >= new Date().valueOf() : false;
						break;

					case 'randPct':
					case 'randPctUpTo':
					case 'randPctRange':
						ret = this.result <= 50;
						//ret = (Math.random() * 100) < this.result;
						break;

					case 'randInt':
						ret = this.result <= (this.v1 / 2);
						break;

					case 'randRange':
						ret = this.result <= ((this.v2 - this.v1) / 2);
						break;

					case 'relTime':
						ret = this.result > 0;
						break;
				}
			}

			resultCache[cKey] = ret;

			return resultCache[cKey];
		};
	
		this.to_int = function (def) {
			var cKey = 'to_int';
			var ret;

			if (typeof this.result === 'undefined' || this.result === null) {
				return NaN;
			}

			if (typeof resultCache[cKey] !== 'undefined') {
				return true && resultCache[cKey];
			}

			ret = bpmv.num(def, true) ? parseInt(def, 10) : NaN;

			if (bpmv.str(this.verb)) {
				switch(this.verb) {
					case 'chance':
					case 'rand':
					case 'randPct':
						ret = this.result ? 1 : 0;
						break;

					case 'dateUs':
					case 'dateUk':
						ret = bpmv.typeis(this.result, 'Date') ? Math.floor(this.result.valueOf() / 1000) : NaN;
						break;

					case 'randInt':
					case 'randPctRange':
					case 'randPctUpTo':
					case 'randRange':
					case 'relTime':
						ret = parseInt(this.result, 10);
						break;
				}
			}

			resultCache[cKey] = ret;

			return resultCache[cKey];
		};
	
		this.to_pct = function () {
			var cKey = 'to_pct';
			var ret = 0;

			if (typeof this.result === 'undefined' || this.result === null) {
				return 0;
			}

			if (typeof resultCache[cKey] !== 'undefined') {
				return parseInt(resultCache[cKey], 10);
			}

			if (bpmv.str(this.verb)) {
				switch(this.verb) {
					case 'chance':
					case 'rand':
						ret = this.result ? 100 : 0;
						break;

					case 'randPct':
					case 'randPctUpTo':
					case 'randPctRange':
						ret = bpmv.num(this.result, true) ? 0 + this.result : 0;
						break;

					case 'randInt':
						ret = Math.floor((this.result / this.v1) * 100);
						break;

					case 'randRange':
						ret = Math.floor(((this.result - this.v1) / (this.v2 - this.v1)) * 100);
						break;

					case 'relTime':
						if (this.result > 100) {
							ret = 100;
						} else if (this.result < -100) {
							ret = -100;
						} else {
							ret = 0 - this.result;
						}
						break;
				}
			}

			if (ret < -100) {
				ret = -100;
			}

			if (ret > 100) {
				ret = 100;
			}

			resultCache[cKey] = ret;

			return resultCache[cKey];
		};
	
		this.to_str = function (def) {
			var cKey = 'to_str';
			var ret = bpmv.str(def, true) ? def : '';

			if (typeof resultCache[cKey] !== 'undefined') {
				return true && resultCache[cKey];
			}

			if (typeof this.result === 'undefined' || this.result === null) {
				return ret;
			}

			switch (this.verb) {
				case 'relTime':
					ret = this.v1+''+this.v2;
					break;

				case 'dateUs':
				case 'dateUk':
					ret = bpmv.typeis(this.result, 'Date') ? this.result.toUTCString() : '';
					break;
			}

			if (!bpmv.str(ret) && bpmv.func(this.result.toString)) {
				ret = this.result.toString();
			}

			if (!bpmv.str(ret) && bpmv.func(this.result.valueOf)) {
				ret = ''+this.result.valueOf();
			}

			if (!bpmv.str(ret)) {
				try {
					ret = JSON.stringify(this.result); // last ditch
				} catch (e) {
					ret = bpmv.str(def, true) ? def : '';
				}
			}

			resultCache[cKey] = ret;

			return resultCache[cKey];
		};

		this.interpret = function (change) {
			var iter;
			var vSet;
			var vKey;

			if (!bpmv.str(change)) {
				return false;
			}

			this.matches = change.match(this.rgx);
			this.len = this.matches ? this.matches.length : 0;

			if (bpmv.num(this.len) && bpmv.arr(this.matches) && this.matches.length >= this.len) {
				if (!bpmv.str(this.verb)) {
					// no verb
					return false;
				}

				this.change = ''+change;

				if (bpmv.num(this.keys.sign, true)) {
					this.sign = this.matches[this.keys.sign];
				}

				for (iter = 0; iter < 10; iter++) {
					vKey = 'v'+(iter + 1);

					if (this.keys[vKey] && this.matches[this.keys[vKey]]) {
						if (bpmv.num(this.matches[this.keys[vKey]], true)) {
							this[vKey] = parseInt(this.matches[this.keys[vKey]], 10);
							continue;
						}

						this[vKey] = this.matches[this.keys[vKey]];
					}
				}

				if (bpmv.func(this.proc)) {
					this.result = this.proc.apply(this);
				}
			}

			return this;
		};

		return this;
	}

	function handle_req (request, response) {
		var uri = url.parse(request.url).pathname;
		var filename = path.join(__dirname+'/../data', uri);

		request.nkId = bpmv.ego();

		if (respond_me_faked(request, response)) {
			return;
		}

		if (uri === '/favicon.ico') {
			filename = path.join(__dirname, '/../../nckma_assets/narcikarma.ico');
		}

		fs.exists(filename, function(exists) {
			if (!exists) {
				spit(request, '404 not found '+url.parse(request.url).path+' as '+filename);
				response.writeHead(404, {'Content-Type': 'text/plain'});
				response.write('404 Not Found\n');
				response.end();

				return;
			}

			if (fs.statSync(filename).isDirectory()) {
				spit(request, '403 Directory listing denied '+url.parse(request.url).path+' as '+filename);
				response.writeHead(403, {'Content-Type': 'text/plain'});
				response.write('403 Directory listing denied.\n');
				response.end();

				return;
			}

			fs.readFile(filename, 'binary', function(err, file) {
				var headers = {
					'X-Narcikarma-Test': 'true'
				};
				var contentType;

				if(err) {        
					spit(request, '500 '+err+' '+url.parse(request.url).path+' as '+filename);
					response.writeHead(500, {'Content-Type': 'text/plain'});
					response.write('500 '+err + '\n');
					response.end();

					return;
				}

				contentType = contentTypesByExtension[path.extname(filename)];

				if(!contentType) {        
					spit(request, '403 Forbidden type "'+path.extname(filename)+'" '+url.parse(request.url).path+' as '+filename);
					response.writeHead(403, {'Content-Type': 'text/plain'});
					response.write('403 Forbidden type.\n');
					response.end();

					return;
				}

				headers['Content-Type'] = contentType;

				spit(request, '200 '+contentType+' '+url.parse(request.url).path+' as '+filename);
				response.writeHead(200, headers);
				response.write(file, 'binary');
				response.end();
			});
		});
	}

	function interpret_verb (request, parm, change) {
		var matches;
		var iter;
		var ret = {};
		var vSet;
		var vKey;
		var newVerb;
		var newOpts;

		if (!bpmv.str(change)) {
			return false;
		}

		for (iter in verbSet) {
			if(bpmv.obj(verbSet[iter]) && bpmv.typeis(verbSet[iter].rgx, 'RegExp') && verbSet[iter].rgx.test(change)) {
				newOpts = _.extend({}, verbSet[iter]);
				newOpts.parameter = parm;

				newVerb = new Verb(iter, newOpts);
				newVerb.interpret(change);
				//newVerb.test();

				spit(request, 'Interpreted verb "'+parm+'".', newVerb);

				break;
			}
		}

		if (!newVerb) {
			newVerb = new Verb('undefined', newOpts);
			newVerb.interpret(change);
		}

		return newVerb;
	}

	function me_set(parm, me, verb, newVal) {
		var old;

		old = me.data[parm];

		me.data[parm] = newVal === null || newVal === 'undefined' ? '' : newVal;
		me[meNk][parm] = {
			'change': verb.change,
			'verb': verb.verb,
			'result': verb.result,
			'old': old,
			'new': me.data[parm],
		};

		if (bpmv.typeis(old, 'Number') && bpmv.typeis(me.data[parm], 'Number')) {
			me[meNk][parm].delta = me.data[parm] - old;
		}

		return me;
	}

	function me_fake_parm (request, parm, me, change) {
		var verb = interpret_verb(request, parm, change);

		if (!bpmv.str(parm) || !meFakedFuncs.hasOwnProperty(parm) || !bpmv.func(meFakedFuncs[parm])) {
			return me;
		}

		return meFakedFuncs[parm](request, me, verb);
	}

	function me_from_base(name) {
		var me = _.extend({}, meBase);

		me.data.created = Math.floor(new Date().valueOf() / 1000);
		me.data.created_utc = 0 + me.data.created;
		me.data.name = name;
		me.data.id = new Buffer(name+(_.range(5).join(''))).toString('base64').slice(0, 5);
		me.data.modhash = new Buffer(name+(_.range(40).join(''))).toString('base64').slice(0, 40);
		me[meNk] = {};

		return me;
	}

	function me_gen_path(name) {
		if (!bpmv.str(name)) {
			return;
		}

		return path.join(__dirname, '/../data/me/'+name+'.json');
	}

	function me_from_disk (request, name) {
		var fn = me_gen_path(name);
		var me;

		if (!bpmv.str(fn)) {
			return;
		}

		try {
			if (!fs.existsSync(fn)) {
				fs.writeFileSync(fn, JSON.stringify(me, null, 4));
				return me_from_base(name);
			}

			me = JSON.parse(fs.readFileSync(fn));

			me.data.id = new Buffer(me.data.name+(_.range(5).join(''))).toString('base64').slice(0, 5);
			me.data.modhash = new Buffer(me.data.name+(_.range(40).join(''))).toString('base64').slice(0, 40);
			me[meNk] = {};
		} catch (e) {
			spit(request, 'Error parsing me.json file "'+name+'" - recreating from base. '+e, fn);
			me = me_from_base(name);
		}

		return me;
	}

	function me_to_disk (me) {
		var mine;
		var fn;

		if (!bpmv.obj(me) || !bpmv.obj(me.data) || !bpmv.str(me.data.name)) {
			return me;
		}

		var mine = _.extend(me_from_base(me.data.name), me);

		mine[meNk] = {};
		mine.nkSrc = 'file';

		fn = path.join(__dirname, '/../data/me/'+me.data.name+'.json');

		fs.writeFileSync(fn, JSON.stringify(mine, null, 4));

		return mine;
	}

	// http://narcikarma.test:8023/me/Narcikarma/me.json?inbox_count=5&comment_karma=rise&link_karma=rand&cakeday=2mins
	// http://narcikarma.test:8023/me/Bob/me.json?is_mod=chance,50&over_18=rand&comment_karma=rand,1000&link_karma=rand,10,1000&has_mod_mail=pct&has_verified_email=pct,50&is_gold=pct,20,70
	function respond_me_faked (request, response) {
		var stamp = new Date().valueOf();
		var stampAfter;
		var location = url.parse(request.url, true);
		var rgxResult = bpmv.str(location.pathname) ? location.pathname.match(rgxCustomMe) : false;
		var iter;
		var me;
		var src = 'cache';

		if (!rgxResult) {
			// pass along
			return false;
		}

		if (!bpmv.arr(rgxResult, 2) || !bpmv.str(rgxResult[1])) {
			spit(request, '400 Invalid me.json request.', location);
			response.writeHead(400, {'Content-Type': 'text/plain'});
			response.write('Invalid me.json request\n');
			response.end();

			// responded
			return true;
		}

		if (!meCache[rgxResult[1]]) {
			src = 'file';

			me = me_from_disk(request, rgxResult[1]);

			if (me) {
				meCache[rgxResult[1]] = _.extend({}, me);
			}
		}

		me = meCache[rgxResult[1]];
		me[meNk] = {};

		if (bpmv.obj(location.query, true)) {
			src = 'generated '+src;

			for (iter in location.query) {
				me = me_fake_parm(request, iter, me, location.query[iter]);
			}

			meCache[rgxResult[1]] = _.extend({}, me);

			me_to_disk(meCache[rgxResult[1]]);
		}

		me.nkSrc = src;

		stampAfter = new Date().valueOf();

		spit(request, '200 application/json '+me.nkSrc+' faked in '+((stampAfter - stamp) / 1000)+'sec '+url.parse(request.url).path+' as '+me_gen_path(rgxResult[1]), me[meNk]);
		response.writeHead(200, {
			'Content-Type': 'application/json',
		});
		response.write(JSON.stringify(me), 'binary');
		response.end();

		return true;
	}

	function spit (request) {
		var args = _.extend([], arguments);
		var txt = '';
		var req = bpmv.obj(args[0]) ? args.shift() : null;
		var log = [];
		var startIter = 0;
		var iter;

		if (bpmv.str(args[0])) {
			txt += new Date().toISOString();
			txt += (req ? ' - '+req.nkId : '');
			txt += ' # '+args[0];

			startIter++;
		}

		for (iter = startIter; iter < args.length; iter++) {
			switch (bpmv.whatis(args[iter]).toLowerCase()) {
				case 'function':
				case 'number':
				case 'string':
					log.push(args[iter]);
					break;

				case 'regexp':
					log.push(args[iter].toString());
					break;

				case 'undefined':
					log.push(undefined);
					break;

				default:
					log.push(JSON.stringify(args[iter]));
					break;
			}
		}

		txt += bpmv.arr(log) ? ' '+log.join(', ') : '';

		if (logging) {
			fs.closeSync(fs.openSync(logFile, 'a+'));

			if (fs.existsSync(logFile)) {
				fs.appendFileSync(logFile, txt+'\n', {
					encoding: 'utf8',
					flag: 'a+',
				});
			}
		}

		console.log(txt);
	}

	/*
	* FAKED VALUE HANDLERS
	*/

	//"comment_karma": 0,

	meFakedFuncs['cakeday'] = function (request, me, verb) {
		var val;
		var now;
		var newNow;

		val = verb.to_int();

		if (!bpmv.num(val)) {
			val = 0;
		}

		now = Math.floor(new Date().valueOf() / 1000);
		newNow = parseInt(now + val, 10);

		me = me_set('created', me, verb, newNow);
		me = me_set('created_utc', me, verb, newNow);

		return me;
	};
	meFakedFuncs['created'] = meFakedFuncs['cakeday'];
	meFakedFuncs['created_utc'] = meFakedFuncs['cakeday'];

	meFakedFuncs['gold_creddits'] = function (request, me, verb) {
		return me_set('gold_creddits', me, verb, verb.to_int());
	};

	meFakedFuncs['gold_expiration'] = function (request, me, verb) {
		var now = Math.floor(new Date().valueOf() / 1000);
		var newNow = parseInt(now + verb.to_int(), 10);

		me = me_set('gold_expiration', me, verb, newNow);
		me = me_set('has_gold', me, verb, (newNow > now));

		return me;
	};

	meFakedFuncs['has_mail'] = function (request, me, verb) {
		/*
		* no mail...
		*   ?has_mail=[no|false|0|off]
		* get a new mail...
		*   ?has_mail
		*   ?has_mail=[yes|true|1|on]
		*   ?has_mail={N}
		* {%} chance to get new mail...
		*   ?has_mail=rand,{%}
		*   ?has_mail=rand,{%},{N}
		*/
		var box = parseInt(me.data.inbox_count, 10);
		var num = box > 0 ? box : 0;
		var mail = num > 0;
		var vType = bpmv.whatis(verb.result).toLowerCase();

		if (!bpmv.num(box)) {
			box = 0;
		}

		switch (vType) {
			case 'undefined':
				mail = true;
				num = box + 1;
				break;

			case 'boolean':
				mail = verb.result;
				num = mail ? box + 1 : 0;
				break;

			case 'number':
				if (verb.isPct) {
					num = verb.to_bool() ? box + 1 : 0
				} else if (bpmv.str(this.sign)) {
					num = box + parseInt(verb.result, 10);
				} else {
					num = parseInt(verb.result, 10);
				}

				if (num < 0) {
					num = 0;
				}

				mail = num > 0;

				break;

			case 'string':
				mail = bpmv.trueish(verb.result);
				num = mail ? box + 1 : 0;
				break;
		}

		me = me_set('has_mail', me, verb, mail);
		me = me_set('inbox_count', me, verb, Math.round(num));

		return me;
	};

	meFakedFuncs['has_mod_mail'] = function (request, me, verb) {
		var ret = verb.to_bool();

		if (ret) {
			me = me_set('is_mod', me, verb, true);
		}
		
		return me_set('has_mod_mail', me, verb, ret);
	};

	meFakedFuncs['has_verified_email'] = function (request, me, verb) {
		return me_set('has_verified_email', me, verb, verb.to_bool());
	};

	meFakedFuncs['hide_from_robots'] = function (request, me, verb) {
		return me_set('hide_from_robots', me, verb, verb.to_bool());
	};

	meFakedFuncs['inbox_count'] = function (request, me, verb) {
		/*
		* no mail...
		*   ?inbox_count=[no|false|0|off]
		*   ?inbox_count
		* get a new mail...
		*   ?inbox_count=[yes|true|1|on]
		*   ?inbox_count={N}
		* {%} chance to get new mail...
		*   ?inbox_count=rand,{%}
		*   ?inbox_count=rand,{%},{N}
		*/
		var box = parseInt(me.data.inbox_count, 10);
		var num = box > 0 ? box : 0;
		var mail = num > 0;
		var vType = bpmv.whatis(verb.result).toLowerCase();

		if (!bpmv.num(box)) {
			box = 0;
		}

		switch (vType) {
			case 'undefined':
				mail = false;
				num = 0;
				break;

			case 'boolean':
				mail = verb.result;
				num = mail ? box + 1 : 0;
				break;

			case 'number':
				if (verb.isPct) {
					num = verb.to_bool() ? box + 1 : 0
				} else if (bpmv.str(verb.sign)) {
					num = box + parseInt(verb.result, 10);
				} else {
					num = parseInt(verb.result, 10);
				}

				if (num < 0) {
					num = 0;
				}

				mail = num > 0;

				break;

			case 'string':
				mail = bpmv.trueish(verb.result);
				num = mail ? box + 1 : 0;
				break;
		}

		me = me_set('has_mail', me, verb, mail);
		me = me_set('inbox_count', me, verb, Math.round(num));

		return me;
	};

	meFakedFuncs['is_friend'] = function (request, me, verb) {
		return me_set('is_friend', me, verb, verb.to_bool());
	};

	meFakedFuncs['is_gold'] = function (request, me, verb) {
		var gold = verb.to_bool();
		var now = Math.floor(new Date().valueOf() / 1000);
		var exp = parseInt(me.data.gold_expiration);

		if (gold) {
			exp = exp > now ? exp : now + time.day;
		} else {
			exp = exp < now ? exp : now - time.day;
		}

		me = me_set('is_gold', me, verb, gold);
		me = me_set('gold_expiration', me, verb, exp);

		return me;
	};

	meFakedFuncs['is_mod'] = function (request, me, verb) {
		return me_set('is_mod', me, verb, verb.to_bool());
	};

	//"link_karma": 0,

	meFakedFuncs['over_18'] = function (request, me, verb) {
		return me_set('over_18', me, verb, verb.to_bool());
	};

	/*
	* VERB DEFINITIONS
	*/

	verbSet['dateUk'] = {
		rgx: new RegExp([
			'^',
			'\\s*(',
			'((19|2\\d)\\d\\d)',
			'[-/.]',
			'([1-9]|0[1-9]|1[012])',
			'[-/.]',
			'([1-9]|0[1-9]|[12]\\d|3[01])',
			'(\\s+([0-9]|(0|1)\\d|2[0-3])\\:([0-9]|[0-5]\\d)\\:([0-9]|[0-5]\\d))?',
			')\\s*',
			'$',
		].join('')),
		len: 11,
		keys: {v1: 2, v2: 4, v3: 5, v4: 7, v5: 9, v6: 10},
		proc: function () {
			var d;

			if (this.v4) {
				d = new Date(''+this.v1+'-'+bpmv.pad(this.v2, 2)+'-'+bpmv.pad(this.v3, 2)+' '+bpmv.pad(this.v4, 2)+'-'+bpmv.pad(this.v5, 2)+'-'+bpmv.pad(this.v6, 2)+'');
			} else {
				d = new Date(''+this.v1+'-'+bpmv.pad(this.v2, 2)+'-'+bpmv.pad(this.v3, 2)+' 00:00:00');
			}

			return d;
		},
	};

	verbSet['dateUs'] = {
		rgx: new RegExp([
			'^',
			'\\s*(',
			'([1-9]|0[1-9]|1[012])',
			'[-/.]',
			'([1-9]|0[1-9]|[12]\\d|3[01])',
			'[-/.]',
			'((19|2\\d)\\d\\d)',
			'(\\s+([0-9]|(0|1)\\d|2[0-3])\\:([0-9]|[0-5]\\d)\\:([0-9]|[0-5]\\d))?',
			')\\s*',
			'$',
		].join('')),
		len: 11,
		keys: {v1: 2, v2: 4, v3: 5, v4: 7, v5: 9, v6: 10},
		proc: function () {
			var d;

			if (this.v4) {
				d = new Date(''+this.v1+'-'+bpmv.pad(this.v2, 2)+'-'+bpmv.pad(this.v3, 2)+' '+bpmv.pad(this.v4, 2)+'-'+bpmv.pad(this.v5, 2)+'-'+bpmv.pad(this.v6, 2)+'');
			} else {
				d = new Date(''+this.v1+'-'+bpmv.pad(this.v2, 2)+'-'+bpmv.pad(this.v3, 2)+' 00:00:00');
			}

			return d;
		},
	};

	verbSet['boolean'] = {
		rgx: /^\s*(on|off|true|false|yes|no|yar|nay|checked|unchecked|selected|disabled)\s*$/i,
		len: 2,
		keys: {v1: 1},
		proc: function () {
			return bpmv.trueish(this.v1);
		},
	};

	verbSet['chance'] = {
		rgx: /^\s*([\+\-])?chance,\s*([\+\-]?[0-9]+)\s*$/i,
		len: 3,
		keys: {sign: 1, v1: 2},
		isRand: true,
		proc: function () {
			if (bpmv.num(this.v1)) {
				return ((Math.random() * (this.v1 * 1000)) / 1000) <= this.v1;
			}

			return false;
		},
	};

	verbSet['number'] = {
		rgx: /^\s*(([\-\+]?)[0-9]+(\.[0-9]+)?)\s*$/,
		len: 3,
		keys: {sign: 2, v1: 1},
		proc: function () {
			if ((''+this.v1).indexOf('.') > -1) {
				this.result = parseFloat(this.v1);
			}

			this.result = parseInt(this.v1, 10);

			return this.result;
		},
	};

	verbSet['rand'] = {
		rgx: /^\s*([\+\-])?rand\s*$/i,
		len: 2,
		keys: {sign: 1},
		isRand: true,
		proc: function () {
			return (Math.random() * 1000) >= 500;
		},
	};

	verbSet['randStr'] = {
		rgx: /^\s*rand(str)?,(\s*([\,\sa-z0-9\-\_]+))\s*$/i,
		rgxSplit: /\s*,\s*/,
		len: 4,
		keys: {v1: 2},
		isRand: true,
		proc: function () {
			var str;
			var set;
			var key;

			if (bpmv.str(this.v1)) {
				str = ''+this.v1;
				set = str.split(this.rgxSplit);

				if (set && set.length > 0) {
					var key = Math.floor((Math.random() * (set.length * 1000)) / 1000);

					this.result = set[key];
				}
			}

			return this.result;
		},
	};

	verbSet['randPct'] = {
		rgx: /^\s*([\+\-])?pct\s*$/i,
		len: 2,
		keys: {sign: 1},
		isRand: true,
		isPct: true,
		proc: function () {
			var ret = 0;

			if (bpmv.str(this.verb)) {
				ret = Math.round((Math.random() * 10000) / 100);

				if (this.sign === '-') {
					ret = 0 - ret;
				}

				if (ret < 0) {
					ret = 0;
				}
			}

			return ret;
		},
	};

	verbSet['randPctUpTo'] = {
		rgx: /^\s*([\+\-])?pct,\s*([\+\-]?[0-9]+)\s*$/i,
		len: 3,
		keys: {sign: 1, v1: 2},
		isRand: true,
		isPct: true,
		proc: function () {
			var ret = 0;

			if (bpmv.num(this.v1, true)) {
				ret = verbSet['randInt'].proc.apply(this, []);

				if (ret < 0) {
					ret = 0;
				}
			}

			return ret;
		},
	};

	verbSet['randPctRange'] = {
		rgx: /^\s*([\+\-])?pct,\s*([\+\-]?[0-9]+),\s*([\+\-]?[0-9]+)\s*$/i,
		len: 4,
		keys: {sign: 1, v1: 2, v2: 3},
		isRand: true,
		isPct: true,
		proc: function () {
			var ret = 0;

			if (bpmv.num(this.v1, true) && bpmv.num(this.v2, true)) {
				ret = verbSet['randRange'].proc.apply(this, []);

				if (ret < 0) {
					ret = 0;
				}
			}

			return ret;
		},
	};

	verbSet['randInt'] = {
		rgx: /^\s*([\+\-])?rand,\s*([\+\-]?[0-9]+)\s*$/i,
		len: 3,
		keys: {sign: 1, v1: 2},
		isRand: true,
		proc: function () {
			if (bpmv.num(this.v1)) {
				if (this.sign === '-') {
					return 0 - Math.round((Math.random() * (parseInt(this.v1, 10) * 100)) / 100);
				}

				return Math.round((Math.random() * (parseInt(this.v1, 10) * 100)) / 100);
			}

			return 0;
		},
	};

	verbSet['randRange'] = {
		rgx: /^\s*([\+\-])?rand,\s*([\+\-]?[0-9]+),\s*([\+\-]?[0-9]+)\s*$/i,
		len: 4,
		keys: {sign: 1, v1: 2, v2: 3},
		isRand: true,
		proc: function () {
			var ret = 0;
			var b, e;

			if (!bpmv.num(this.v1, true) || !bpmv.num(this.v2, true)) {
				return ret;
			}

			this.low = parseInt(this.v1, 10);
			this.high = parseInt(this.v2, 10);

			if (this.low > this.high) {
				this.low = parseInt(this.v2, 10);
				this.high = parseInt(this.v1, 10);
			}

			ret = Math.round((Math.random() * ((this.high - this.low) * 10000)) / 10000) + this.low;

			if (this.sign === '-') {
				ret = 0 - ret;
			}

			return ret;
		},
	};

	verbSet['relTime'] = {
		rgx: /^\s*\+?(\-?[0-9]+)(s(ecs?)?|m(ins?)?|h(r|ours?)?|d(ays?)?|w(k|eeks?)?|y(r|ears?)?)\s*$/i,
		len: 9,
		keys: {v1: 1, v2: 2},
		proc: function () {
			if (!bpmv.num(this.v1, true) || !bpmv.str(this.v2)) {
				return 0;
			}

			switch (this.v2) {
				case 's':
				case 'sec':
				case 'secs':
					this.v2 = 's';
					this.result = time.sec * this.v1;
					break;

				case 'm':
				case 'min':
				case 'mins':
					this.v2 = 'm';
					this.result = time.min * this.v1;
					break;

				case 'h':
				case 'hr':
				case 'hour':
				case 'hours':
					this.v2 = 'h';
					this.result = time.hour * this.v1;
					break;

				case 'd':
				case 'dy':
				case 'day':
				case 'days':
					this.v2 = 'd';
					this.result = time.day * this.v1;
					break;

				case 'w':
				case 'wk':
				case 'week':
				case 'weeks':
					this.v2 = 'w';
					this.result = time.week * this.v1;
					break;

				case 'y':
				case 'yr':
				case 'year':
				case 'years':
					this.v2 = 'y';
					// not a real calendar year
					this.result = time.year * this.v1;
					break;
			}

			return this.result;
		},
	};

	verbSet['rise'] = {
		rgx: /^\s*([\+\-])?rise\s*$/i,
		len: 2,
		keys: {sign: 1},
		proc: function () {
			return 1;
		},
	};

	/*
	* DO THAT SHIT
	*/

	http.createServer(handle_req).listen(port);

	spit('Narcikarma '+path.basename(__filename)+' (Use CTRL + C to shutdown) base: http://localhost:'+port+'/ log: '+logFile+' verbs: ('+bpmv.count(verbSet)+')', bpmv.keys(verbSet));
})();
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
	var rgxVerbs = {
//		'fall': {
//			rgx: /^([\+\-])?(fall)(,\s*([0-9]+)(,\s*([0-9]+))?)?$/,
//			len: 
//			keys: {verb: 1, sign: 0, },
//		},
//		'inc': /^([\+\-])?(inc)(,\s*([0-9]+)(,\s*([0-9]+))?)?$/,
		'rand': {
			rgx: /^([\+\-])?(rand)(,\s*([0-9]+)(,\s*([0-9]+))?)?$/,
			len: 7,
			keys: {verb: 2, sign: 1, v1: 4, v2: 6},
		},
		'rise': {
			rgx: /^(rise)(,\s*([0-9]+)(,\s*([0-9]+))?)?$/,
			len: 7,
			keys: {verb: 2, sign: 1, v1: 4, v2: 6},
		},
//		'rise': /^([\+\-])?(rise)(,\s*([0-9]+)(,\s*([0-9]+))?)?$/,
	}

	meFakedFuncs['cakeday'] = function (me, change) {
		/*
		* &cakeday=2mins
		* &cakeday=2days
		* &cakeday=-2hours
		* &cakeday=-2h
		*/
		var now = Math.floor(new Date().valueOf() / 1000);
		var newNow = parseInt(now + str_to_secs(change), 10);

		me = me_set('created', me, change, newNow);
		me = me_set('created_utc', me, change, newNow);

		return me;
	};

	meFakedFuncs['gold_expiration'] = function (me, change) {
		var now = Math.floor(new Date().valueOf() / 1000);
		var newNow = parseInt(now + str_to_secs(change), 10);

		me = me_set('gold_expiration', me, change, newNow);
		me = me_set('has_gold', me, change, (me.data.gold_expiration > now));

		return me;
	};

	meFakedFuncs['has_mail'] = function (me, change) {
		/*
		* no mail...
		*     ?has_mail=[no|false|0|off]
		* get a new mail...
		*     ?has_mail
		*     ?has_mail=[yes|true|1|on]
		* get {N} new mail...
		*     ?has_mail={N}
		* {%} chance to get new mail...
		*     ?has_mail=rand,{%}
		* {%} chance to get {N} new mail...
		*     ?has_mail=rand,{%},{N}
		*/
		var rand = is_rand(change);
		var num = 0;
		var mail;

		if (bpmv.arr(rand, 4) && bpmv.num(rand[3])) {
			mail = str_to_bool(change, true);

			if (mail) {
				if (rand[1] === '-') {
					num = me.data.inbox_count - rand[3];
				} else {
					num = me.data.inbox_count + rand[3];
				}

				if (!bpmv.num(num)) {
					num = 0;
					mail = false;
				}
			}
		}

		if (!bpmv.str(change)) {
			num = 1;
			mail = true;
			change = 'implied';
		}

		if (bpmv.num(change)) {
			num = me.data.inbox_count + parseInt(change, 10);
			mail = num > 0;
			change = 'number';
		}

		if (typeof mail === 'undefined') {
			mail = str_to_bool(change, true);
			num = mail ? me.data.inbox_count + 1 : 0;
		}

		me = me_set('has_mail', me, change, mail);
		me = me_set('inbox_count', me, change, num);

		return me;
	};

	meFakedFuncs['has_mod_mail'] = function (me, change) {
		return me_set('has_mod_mail', me, change, str_to_bool(change))
	};

	meFakedFuncs['has_verified_email'] = function (me, change) {
		return me_set('has_verified_email', me, change, str_to_bool(change))
	};

	meFakedFuncs['hide_from_robots'] = function (me, change) {
		return me_set('hide_from_robots', me, change, str_to_bool(change))
	};

	meFakedFuncs['inbox_count'] = function (me, change) {
		var num = parseInt(change, 10);

		if (num < 0) {
			num = 0;
		}

		me_set('inbox_count', me, change, num);
		me_set('has_mail', me, change, (me.data.inbox_count > 0));

		return me;
	};

	meFakedFuncs['is_friend'] = function (me, change) {
		return me_set('is_friend', me, change, str_to_bool(change))
	};

	meFakedFuncs['is_mod'] = function (me, change) {
		return me_set('is_mod', me, change, str_to_bool(change))
	};

	meFakedFuncs['over_18'] = function (me, change) {
		return me_set('over_18', me, change, str_to_bool(change))
	};

	// returns [verb, +/-, N, N]
	function interpret_verb (verb) {
		var matches;
		var iter;
		var ret = [];
		var vSet;
		var vKey;

		if (!bpmv.str(verb)) {
			return false;
		}

		for (iter in rgxVerbs) {
			if(bpmv.obj(rgxVerbs[iter]) && bpmv.typeis(rgxVerbs[iter].rgx, 'RegExp') && rgxVerbs[iter].rgx.test(verb)) {
				vSet = rgxVerbs[iter];
				matches = verb.match(vSet.rgx);

				break;
			}
		}

		if (!vSet) {
			return false;
		}

		if (bpmv.arr(matches, vSet.len)) {
			if (!matches[vSet.keys.verb]) {
				// no verb
				return false;
			}

			ret[0] = matches[vSet.keys.verb];

			if (bpmv.num(vSet.keys.sign, true)) {
				ret[1] = matches[vSet.keys.sign];
			}

			for (iter = 0; iter < 5; iter++) {
				vKey = 'v'+(iter + 1);

				if (vSet.keys[vKey] && matches[vSet.keys[vKey]]) {
					if (bpmv.num(matches[vSet.keys[vKey]], true)) {
						ret[2 + iter] = parseInt(matches[vSet.keys[vKey]], 10);
						continue;
					}

					ret[2 + iter] = matches[vSet.keys[vKey]];
				}
			}

			return ret;
		}

		return false;
	}

	function is_rand (change) {
		var verb = interpret_verb(change);

		if (bpmv.arr(verb) && verb[0] === 'rand') {
			return verb;
		}

		return false;
	}

	function is_increment (change) {
		var verb = interpret_verb(change);

		if (bpmv.arr(verb) && verb[0] === 'inc') {
			return verb;
		}

		return false;
	}

	function me_set(parm, me, change, newVal) {
		var old;

		if (parm in me.data) {
			old = me.data[parm];

			me.data[parm] = newVal;
			me[meNk][parm] = {
				'change': change,
				'old': old,
				'new': me.data[parm]
			};
		}

		return me;
	}

	function me_fake_parm (parm, me, change) {
		if (!bpmv.str(parm) || !meFakedFuncs.hasOwnProperty(parm) || !bpmv.func(meFakedFuncs[parm])) {
			return me;
		}

		return meFakedFuncs[parm](me, change);
	}

	function me_from_base(name) {
		var me = _.extend({}, meBase);

		me.data.name = name;
		me.data.id = new Buffer(name+(_.range(5).join(''))).toString('base64').slice(0, 5);
		me.data.modhash = new Buffer(name+(_.range(40).join(''))).toString('base64').slice(0, 40);
		me[meNk] = {};

		return me;
	}

	function me_from_disk (name) {
		var fn;
		var me;

		if (!bpmv.str(name)) {
			return;
		}

		fn = path.join(__dirname, '/../data/me/'+name+'.json');

		if (!fs.existsSync(fn)) {
			me = me_from_base(name);

			fs.writeFileSync(fn, JSON.stringify(me, null, 4));
		}

		me = JSON.parse(fs.readFileSync(fn));

		me.data.id = new Buffer(me.data.name+(_.range(5).join(''))).toString('base64').slice(0, 5);
		me.data.modhash = new Buffer(me.data.name+(_.range(40).join(''))).toString('base64').slice(0, 40);
		me[meNk] = {};

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

		fn = path.join(__dirname, '/../data/me/'+me.data.name+'.json');

		fs.writeFileSync(fn, JSON.stringify(mine, null, 4));

		return mine;
	}

	function handle_req (request, response) {
		var uri = url.parse(request.url).pathname;
		var filename = path.join(__dirname+'/../data', uri);

		request.nkId = bpmv.ego();

		spit(request, 'Handling request for '+filename+' '+url.parse(request.url).path);

		if (respond_me_faked(request, response)) {
			return;
		}

		if (uri === '/favicon.ico') {
			filename = path.join(__dirname, '/../../nckma_assets/narcikarma.ico');
			spit(request, 'Reading alternate favicon.', filename);
		}

		fs.exists(filename, function(exists) {
			if (!exists) {
				response.writeHead(404, {'Content-Type': 'text/plain'});
				response.write('404 Not Found\n');
				response.end();

				return;
			}

			if (fs.statSync(filename).isDirectory()) {
				response.writeHead(403, {'Content-Type': 'text/plain'});
				response.write('Directory listing denied.\n');
				response.end();

				return;
			}

			fs.readFile(filename, 'binary', function(err, file) {
				var headers = {
					'X-Narcikarma-Test': 'true'
				};
				var contentType;

				if(err) {        
					response.writeHead(500, {'Content-Type': 'text/plain'});
					response.write(err + '\n');
					response.end();

					return;
				}

				contentType = contentTypesByExtension[path.extname(filename)];

				if(!contentType) {        
					response.writeHead(403, {'Content-Type': 'text/plain'});
					response.write('Forbidden type.\n');
					response.end();

					return;
				}

				headers['Content-Type'] = contentType;

				response.writeHead(200, headers);
				response.write(file, 'binary');
				response.end();
			});
		});
	}

	// http://narcikarma.test:8023/me/Narcikarma/me.json?inbox_count=5&comment_karma=rise&link_karma=rand&cakeday=2mins
	function respond_me_faked (request, response) {
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
			spit(request, 'Invalid me request.', location);

			response.writeHead(400, {'Content-Type': 'text/plain'});
			response.write('Invalid me request\n');
			response.end();

			// responded
			return true;
		}

		if (!meCache[rgxResult[1]]) {
			src = 'file';

			me = me_from_disk(rgxResult[1]);
			meCache[rgxResult[1]] = _.extend({}, me);
		}

		me = meCache[rgxResult[1]];
		me[meNk] = {};

		if (bpmv.obj(location.query, true)) {
			src = 'generated '+src;

			for (iter in location.query) {
				me = me_fake_parm(iter, me, location.query[iter]);
			}

			meCache[rgxResult[1]] = _.extend({}, me);

			me_to_disk(meCache[rgxResult[1]]);
		}

		me[meNk].src = src;

		spit(request, 'Served '+src+' me.json for "'+rgxResult[1]+'".', JSON.stringify(me[meNk]));

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

		if (bpmv.str(args[0])) {
			txt += '# '+(req ? req.nkId : 'unknown');
			txt += ' # '+(new Date().toISOString());
			txt += ' # '+args[0];

			args[0] = ''+txt;
		}

		console.log.apply(console, args);
	}

	function str_to_bool (str, undef) {
		var rand = is_rand(str);

		if (!bpmv.str(str) && !bpmv.bool(str)) {
			return true && undef;
		}

		if (bpmv.arr(rand) && rand.length > 2 && bpmv.num(rand[2])) {
			// percentage chance
			return (Math.random() * 100) < rand[2];
		}

		if (rand) {
			return (Math.random() * 1000) > 500;
		}

		return bpmv.trueish(str);
	}

	function str_to_secs (str) {
		var match = str.match(rgxStrToSecs);
		var num;
		var type;

		if (!bpmv.arr(match, 3)) {
			return 0;
		}

		num = parseInt(match[1], 10);
		type = match[2];

		switch (type) {
			case 'd':
			case 'day':
			case 'days':
				return (60 * 60 * 60 * 24) * num;
				break;

			case 'h':
			case 'hr':
			case 'hour':
			case 'hours':
				return (60 * 60 * 60) * num;
				break;

			case 'm':
			case 'min':
			case 'mins':
				return (60) * num;
				break;

			case 's':
			case 'sec':
			case 'secs':
				return num;
				break;

			case 'w':
			case 'wk':
			case 'week':
			case 'weeks':
				return (60 * 60 * 60 * 24 * 7) * num;
				break;

			case 'y':
			case 'yr':
			case 'year':
			case 'years':
				// not a real calendar year
				return (60 * 60 * 60 * 24 * 365) * num;
				break;
		}

		return 0;
	}

	http.createServer(handle_req).listen(port);

	console.log('# Narcikarma test data server at http://localhost:'+port+'/\n# Use CTRL + C to shutdown.');

})();
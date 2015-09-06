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
	var meNk = 'nkProcessed';
	var rgxStrToSecs = /^([\+\-]?[0-9]+)\s*([a-z]+)$/i;

	meFakedFuncs['cakeday'] = function (me, change) {
		var now = Math.floor(new Date().valueOf() / 1000);
		var newNow = parseInt(now + str_to_secs(change), 10);

		me_set('created', me, change, newNow);
		me_set('created_utc', me, change, newNow);

		return me;
	};

	meFakedFuncs['gold_expiration'] = function (me, change) {
		var now = Math.floor(new Date().valueOf() / 1000);
		var newNow = parseInt(now + str_to_secs(change), 10);

		me_set('gold_expiration', me, change, newNow);
		me_set('has_gold', me, change, (me.data.gold_expiration > now));

		return me;
	};

	meFakedFuncs['has_mail'] = function (me, change) {
		var num = parseInt(change, 10);

		if (num < 0) {
			num = 0;
		}

		me_set('has_mail', me, change, str_to_bool(change));
		me_set('inbox_count', me, change, (me.data.has_mail ? 1 : 0));

		return me;
	};

	meFakedFuncs['has_mod_mail'] = function (me, change) {
		return faked_bool('has_mod_mail', me, change);
	};

	meFakedFuncs['has_verified_email'] = function (me, change) {
		return faked_bool('has_verified_email', me, change);
	};

	meFakedFuncs['hide_from_robots'] = function (me, change) {
		return faked_bool('hide_from_robots', me, change);
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
		return faked_bool('is_friend', me, change);
	};

	meFakedFuncs['is_mod'] = function (me, change) {
		return faked_bool('is_mod', me, change);
	};

	meFakedFuncs['over_18'] = function (me, change) {
		return faked_bool('over_18', me, change);
	};

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

	function faked_bool (parm, me, change) {
		var old = true && me.data[parm];
		var ret = str_to_bool(change, true);

		me.data[parm] = true && ret;
		me[meNk][parm] = [change, old, ret];

		return me;
	}

	function me_fake_parm (parm, me, change) {
		if (!bpmv.str(parm) || !meFakedFuncs.hasOwnProperty(parm) || !bpmv.func(meFakedFuncs[parm])) {
			return me;
		}

		return meFakedFuncs[parm](me, change);
	}

	// http://narcikarma.test:8023/me/Narcikarma/me.json?inbox_count=5&comment_karma=rise&link_karma=rand&cakeday=2mins
	function me_faked (rgxResult, request, response) {
		var me;
		var location = url.parse(request.url, true);
		var iter;

		if (!bpmv.arr(rgxResult, 2) || !bpmv.str(rgxResult[1])) {
			response.writeHead(400, {'Content-Type': 'text/plain'});
			response.write('Invalid me request\n');
			response.end();

			return false;
		}

		if (!meCache[rgxResult[1]]) {
			me = me_from_disk(rgxResult[1]);
			meCache[rgxResult[1]] = _.extend({}, me);
		}

		me = meCache[rgxResult[1]];
		me[meNk] = {};

		if (bpmv.obj(location.query, true)) {
			for (iter in location.query) {
				me = me_fake_parm(iter, me, location.query[iter]);
			}
		}

		me_to_disk(me);
		meCache[rgxResult[1]] = _.extend({}, me);

		response.writeHead(200, {
			'Content-Type': 'application/json',
		});
		response.write(JSON.stringify(me), 'binary');
		response.end();

		return true;
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
		var wantCustMe = uri.match(rgxCustomMe)

		request.nkId = bpmv.ego();

		spit(request, 'Handling request for '+filename+' '+url.parse(request.url).path);

		if (wantCustMe && me_faked(wantCustMe, request, response)) {
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

		if (!bpmv.str(str)) {
			return true && undef;
		}

		if (str !== 'rand' && str !== 'random') {
			return bpmv.trueish(str);
		}

		return ((Math.random() * 1000) > 500);
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
			case 'm':
			case 'min':
			case 'mins':
				return num * 60;
				break;

			case 'd':
			case 'day':
			case 'days':
				return num * 60 * 60 * 60 * 24;
				break;

			case 's':
			case 'sec':
			case 'secs':
				return num;
				break;

			case 'h':
			case 'hr':
			case 'hour':
			case 'hours':
				return num * 60 * 60 * 60;
				break;
		}

		return 0;
	}

	http.createServer(handle_req).listen(port);

	console.log('# Narcikarma test data server at http://localhost:'+port+'/\n# Use CTRL + C to shutdown.');

})();
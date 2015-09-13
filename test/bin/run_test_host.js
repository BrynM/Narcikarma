/*
* Yes, there is synchronous things. This
* is merely menat to run as a local test
* server for Narcikarma development.
*/
(function() {
})();

(function() {
	var http = require('http');
	var url = require('url');
	var path = require('path');
	var fs = require('fs');
	var bpmv = require(__dirname+'/../../lib/bpmv.js').bpmv;
	var _ = require(__dirname+'/../../lib/underscore-min.js');

	var coreId = 'CORE-'+bpmv.ego().substring(5);
	var coreAddress = '127.0.0.1';
	var helpCached;
	var logEmptyField = '';
	var logFile = path.join(__dirname, '/../data/'+path.basename(__filename).replace(/\.[^.]+$/, '')+'.log');
	var logging = true;
	var manifested;
	var meCache = {};
	var meFakedFuncs = {};
	var meNk = 'nkAltered';
	var hostPort = 8023;
	var rgxCustomMe = /^\/me\/([^\/]+)\/me\.json$/i;
	var rgxDirAssets = new RegExp('^/assets/.*\.(css|gif|ico|jpg|png|ttf|wof)$', 'i');
	var rgxDirAssetsReplace = new RegExp('^/assets/', 'i');
	var rgxDirLib = new RegExp('^/lib/.*\.js$');
	var rgxHelpPayload = /\<script[^\>]*\>\/\*payload\*\/\<\/script\>/i;
	var rgxStrToSecs = /^([\+\-]?[0-9]+)\s*([a-z]+)$/i;
	var rgxTraversal = new RegExp('(/\\.\\.+/?|\\.\\.+/)', 'g');
	var verbSet = {};

	var contentTypesByExtension = {
		'.html': 'text/html',
		'.css': 'text/css',
		'.gif': 'image/gif',
		'jpg': 'image/jpeg',
		'.js': 'text/javascript',
		'.json': 'application/json',
		'.ico': 'image/x-icon',
		'.png': 'image/png',
	};
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
	var time = {
		'sec': 1,
		'min': 60,
		'hour': (60 * 60 * 60),
		'day': (60 * 60 * 60 * 24),
		'week': (60 * 60 * 60 * 24 * 7),
		'year': (60 * 60 * 60 * 24 * 365),
	}
	var statusCodes = {
		101: 'Switching Protocols',
		102: 'Processing (WebDAV; RFC 2518)',
		200: 'OK',
		201: 'Created',
		202: 'Accepted',
		203: 'Non-Authoritative Information (since HTTP/1.1)',
		204: 'No Content',
		205: 'Reset Content',
		206: 'Partial Content (RFC 7233)',
		207: 'Multi-Status (WebDAV; RFC 4918)',
		208: 'Already Reported (WebDAV; RFC 5842)',
		226: 'IM Used (RFC 3229)',
		300: 'Multiple Choices',
		301: 'Moved Permanently',
		302: 'Found',
		303: 'See Other (since HTTP/1.1)',
		304: 'Not Modified (RFC 7232)',
		305: 'Use Proxy (since HTTP/1.1)',
		306: 'Switch Proxy',
		307: 'Temporary Redirect (since HTTP/1.1)',
		308: 'Permanent Redirect (RFC 7538)',
		308: 'Resume Incomplete (Google)',
		400: 'Bad Request',
		401: 'Unauthorized (RFC 7235)',
		402: 'Payment Required',
		403: 'Forbidden',
		404: 'Not Found',
		405: 'Method Not Allowed',
		406: 'Not Acceptable',
		407: 'Proxy Authentication Required (RFC 7235)',
		408: 'Request Timeout',
		409: 'Conflict',
		410: 'Gone',
		411: 'Length Required',
		412: 'Precondition Failed (RFC 7232)',
		413: 'Payload Too Large (RFC 7231)',
		414: 'Request-URI Too Long',
		415: 'Unsupported Media Type',
		416: 'Requested Range Not Satisfiable (RFC 7233)',
		417: 'Expectation Failed',
		418: 'I\'m a teapot (RFC 2324)',
		419: 'Authentication Timeout (not in RFC 2616)',
		420: 'Method Failure (Spring Framework)',
		420: 'Enhance Your Calm (Twitter)',
		421: 'Misdirected Request (HTTP/2)',
		422: 'Unprocessable Entity (WebDAV; RFC 4918)',
		423: 'Locked (WebDAV; RFC 4918)',
		424: 'Failed Dependency (WebDAV; RFC 4918)',
		426: 'Upgrade Required',
		428: 'Precondition Required (RFC 6585)',
		429: 'Too Many Requests (RFC 6585)',
		431: 'Request Header Fields Too Large (RFC 6585)',
		440: 'Login Timeout (Microsoft)',
		444: 'No Response (Nginx)',
		449: 'Retry With (Microsoft)',
		450: 'Blocked by Windows Parental Controls (Microsoft)',
		451: 'Unavailable For Legal Reasons (Internet draft)',
		451: 'Redirect (Microsoft)',
		494: 'Request Header Too Large (Nginx)',
		495: 'Cert Error (Nginx)',
		496: 'No Cert (Nginx)',
		497: 'HTTP to HTTPS (Nginx)',
		498: 'Token expired/invalid (Esri)',
		499: 'Client Closed Request (Nginx)',
		499: 'Token required (Esri)',
		500: 'Internal Server Error',
		501: 'Not Implemented',
		502: 'Bad Gateway',
		503: 'Service Unavailable',
		504: 'Gateway Timeout',
		505: 'HTTP Version Not Supported',
		506: 'Variant Also Negotiates (RFC 2295)',
		507: 'Insufficient Storage (WebDAV; RFC 4918)',
		508: 'Loop Detected (WebDAV; RFC 5842)',
		509: 'Bandwidth Limit Exceeded (Apache bw/limited extension)[31]',
		510: 'Not Extended (RFC 2774)',
		511: 'Network Authentication Required (RFC 6585)',
		520: 'Unknown Error',
		522: 'Origin Connection Time-out',
		598: 'Network read timeout error (Unknown)',
		599: 'Network connect timeout error (Unknown)',
	};

	function Verb (verbName, change, opts) {
		if (!bpmv.str(verbName)) {
			return;
		}

		var iter;
		var resultCache = {};
		var defKeys = {
			sign: null,
			verb: null,
		};
		var defs = {
			change: change,
			isRand: false,
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

		function init () {
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

			this.interpret(this.change);
			this.test();
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
					case 'fall':
					case 'fallInt':
					case 'rise':
					case 'riseInt':
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
					case 'fall':
					case 'fallInt':
					case 'randInt':
					case 'randPctRange':
					case 'randPctUpTo':
					case 'randRange':
					case 'relTime':
					case 'rise':
					case 'riseInt':
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

					case 'fall':
					case 'fallInt':
					case 'relTime':
					case 'rise':
					case 'riseInt':
						ret = parseInt(this.result, 10);
						break;
				}
			}

			ret = Math.min(this.result, 100);
			ret = Math.max(this.result, -100);

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

		init.apply(this, []);

		return this;
	}

	function get_manifest (key) {
		if (!manifested) {
			try {
				manifested = JSON.parse(fs.readFileSync(__dirname+'/../../manifest.json'));
			} catch (e) {
				manifested = null;
				spit('Could not open manifest!', e);
			}
		}

		if (bpmv.str(key)) {
			return bpmv.dive(manifested, key);
		}

		return manifested;
	}

	function headers (headOrType) {
		var headers = {
			'X-NCKMA': get_manifest('name')+' '+get_manifest('version'),
			'Content-Type': 'text/plain',
		};

		if (bpmv.obj(headOrType)) {
			return _.extend(headers, headOrType);
		}

		if (bpmv.str(headOrType)) {
			headers['Content-Type'] = headOrType;
		}

		return headers
	}

	function help (request, response) {
		var verb;
		var verbOut = {};
		var html = '';
		var iter;
		var verbList = bpmv.keys(verbSet);
		var uri = url.parse(request.url).pathname.replace(rgxTraversal, '/');
		var fn = path.join(__dirname, 'run_test_host_help.tpl');
		var tplData = {
			'logPath': logFile,
			'logFormat': '"[client-ip]","[request-id]","[username]","[timestamp]","[domain:port]","[request]",[status-code],[bytes],"[mime-type]"(,"[etc]","[etc]","[etc]"...)',
			'project': get_manifest('name'),
			'utilName': path.basename(__filename),
			'version': get_manifest('version'),
			'utilPath': __filename,
			'nkPath': path.join(__dirname, '/../../'),
			'prompt': (/^win/i).test(process.platform) ? 'C:\\>' : '$'
		};

		helpCached = false; // disabled for now
		if (!helpCached) {
			if (!bpmv.str(fn) || !fs.existsSync(fn)) {
				return http_error(request, response, 404, 'Help not found ('+fn+').');
			}

			html = fs.readFileSync(fn, 'utf8');

			if (!bpmv.str(html)) {
				return http_error(request, response, 500, 'There was an error generating help from disk ('+fn+').');
			}

			verbKeys = [];

			for (iter = 0; iter < verbList.length; iter++) {
				if (!bpmv.obj(verbSet[verbList[iter]], true)) {
					continue;
				}

				verbOut[verbList[iter]] = {};
				verbOut[verbList[iter]].rgx = verbSet[verbList[iter]].rgx.toString();
				verbOut[verbList[iter]].len = verbSet[verbList[iter]].len;
				verbOut[verbList[iter]].keys = verbSet[verbList[iter]].keys;
				verbOut[verbList[iter]].desc = verbSet[verbList[iter]].desc;
				verbOut[verbList[iter]].samples = verbSet[verbList[iter]].samples;
			}

			tplData.runningWindows = [
				tplData.prompt+' node '+tplData.utilPath+'\n',
				'"127.0.0.1","CORE-17XSFVN_1442112022415","'+tplData.project+' '+tplData.version+'",'+
					'"2015-01-01 00:00:00.000 GMT","127.0.0.1:8023",0,"CORE '+tplData.utilName+'",'+
					'"--startup--","'+tplData.logPath.replace(/\\/g, '\\\\')+'","19 verbs: '+
					verbList.join(', ')+'"',
			].join('');
			tplData['/*payload*/'] = '\n\t\tvar verbList = '+JSON.stringify(verbOut, null, '\t').replace(/\n\t/g, '\n\t\t\t')+'\n\t\t';

			for(iter in tplData) {
				if (bpmv.str(tplData[iter]) && !(/^\/\*[^\*]+\*\/$/).test(iter)) {
					tplData[iter] = bpmv.txt2html(tplData[iter]);
				}
				
			}

			html = bpmv.toke(html, tplData, false, {l:'{{', r:'}}'});

			helpCached = ''+html;
		}

		return http_respond(request, response, 200, headers('text/html'), helpCached, 'Help as '+fn);
	}

	function http_error (request, response, code, message, data, head) {
		var rCode = parseInt(code, 10);
		var rStat;
		var rHead = bpmv.obj(head) ? head : headers();
		var resp = '';

		if (bpmv.arr(code, 2) && bpmv.num(code[0])) {
			rCode = parseInt(code[0], 10);
			rStat = ''+code[1];
		}

		if(!bpmv.num(rCode)) {
			rCode = 500;
			resp = 'Fallback to ';
		}

		if (rStat) {
			resp += rCode+' '+(rCode in statusCodes ? statusCodes[rCode]+' ' : '')+rStat;
		} else {
			resp += rCode+' '+(rCode in statusCodes ? statusCodes[rCode] : 'Unknown error!');
		}

		response.nkErr = true;

		return http_respond(request, response, rCode, rHead, resp, (bpmv.str(message) ? message : resp), data);
	}

	function http_handle_request (request, response) {
		var uri = url.parse(request.url).pathname.replace(rgxTraversal, '/');
		var filename = path.join(__dirname+'/../data', uri);

		request.nkId = bpmv.ego();

		if (http_respond_me_faked(request, response)) {
			return;
		}

		if (uri === '/favicon.ico') {
			filename = path.join(__dirname, '/../../nckma_assets/iconConfirm.ico');
		}

		if (uri === '/help') {
			return help(request, response);
		}

		if(rgxDirLib.test(uri)) {
			filename = path.join(__dirname+'/../../', uri);
		}

		if(rgxDirAssets.test(uri)) {
			filename = path.join(__dirname+'/../../', uri.replace(rgxDirAssetsReplace, '/nckma_assets/'));
		}

		fs.exists(filename, function(exists) {
			if (!exists) {
				return http_error(request, response, 404, 'Not found '+url.parse(request.url).path+' as '+filename);
			}

			if (fs.statSync(filename).isDirectory()) {
				return http_error(request, response, 403, 'Directory listing denied '+url.parse(request.url).path+' as '+filename);
			}

			fs.readFile(filename, 'binary', function(err, file) {
				var contentType;

				if(err) {        
					return http_error(request, response, 500, err+' '+url.parse(request.url).path+' as '+filename);
				}

				contentType = contentTypesByExtension[path.extname(filename)];

				if(!contentType) {        
					return http_error(request, response, 403, 'Forbidden type "'+path.extname(filename)+'" as '+filename);
				}

				return http_respond(request, response, 200, headers(contentType), file, 'Static as '+filename);
			});
		});
	}

	function http_respond (request, response, code, head, data, message, msgData) {
		var cType = bpmv.obj(head) && bpmv.str(head['Content-Type']) ? head['Content-Type'] : logEmptyField;
		request.nkReturnLength = (''+data).length;

		if (bpmv.str(message)) {
			spit(request, code, cType, message, msgData);
		}

		response.writeHead(code, head);
		response.write(data, 'binary');

		return response.end();
	}

	function http_respond_me_faked (request, response) {
		var stamp = new Date().valueOf();
		var stampAfter;
		var location = url.parse(request.url, true);
		var rgxResult = bpmv.str(location.pathname) ? location.pathname.match(rgxCustomMe) : false;
		var iter;
		var me;
		var message;
		var src = 'cache';

		if (!rgxResult) {
			// pass along
			return false;
		}

		if (!bpmv.arr(rgxResult, 2) || !bpmv.str(rgxResult[1])) {
			return http_error(request, response, [400, 'Invalid me.json request.'], location);

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

		request.fakedMe = rgxResult[1];
		me.nkSrc = src;
		stampAfter = new Date().valueOf();
		message = me.nkSrc+' faked in '+((stampAfter - stamp) / 1000)+'sec as '+me_gen_path(rgxResult[1]);

		return http_respond(request, response, 200, headers('application/json'), JSON.stringify(me), message, bpmv.obj(me[meNk], true) ? me[meNk] : 'No changes to data.');
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

				newVerb = new Verb(iter, change, newOpts);

				spit(request, 'Identified verb "'+parm+'".', newVerb);

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
			if (!bpmv.arr(me[meNk][''], true)) {
				me[meNk]['missed_parms'] = [];
			}

			me[meNk]['missed_parms'].push(parm);

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

	function spit (request) {
		var args = _.extend([], arguments);
		var argBegin = 0;
		var txt = '';
		var req;
		var log = [];
		var iter;
		var hasHeaders;

		if (bpmv.obj(args[argBegin]) && bpmv.str(args[argBegin].nkId)) {
			req = args.shift();
		}

		hasHeaders = bpmv.obj(req) && bpmv.obj(req.headers);

		log.push(bpmv.obj(req) && bpmv.obj(req.connection) ? req.connection.remoteAddress : coreAddress);
		log.push(req && bpmv.str(req.nkId) ? req.nkId : coreId);
		log.push(req && bpmv.str(req.fakedMe) ? req.fakedMe : logEmptyField);
		log.push(new Date().toISOString().replace(/[A-Z]/g, ' ')+'GMT')
		log.push(hasHeaders ? req.headers.host : logEmptyField);
		log.push(hasHeaders ? req.method+' '+req.url+(req.httpVersion ? ' HTTP/'+req.httpVersion : '') : logEmptyField);
		// response code?
		log.push(bpmv.num(args[argBegin], true) ? args.shift() : logEmptyField);
		log.push(bpmv.num(req.nkReturnLength, true) ? req.nkReturnLength : 0);


		for (iter = argBegin; iter < args.length; iter++) {
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
					//log.push(undefined);
					break;

				default:
					log.push(JSON.stringify(args[iter]));
					break;
			}
		}

		txt = JSON.stringify(log).replace(/(^\[|\]$)/g, '');

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

	(function () {
		meFakedFuncs['cakeday'] = function (request, me, verb) {
			var val;
			var now;
			var newNow;

			val = verb.to_int();

			if (!bpmv.num(val)) {
				val = 0;
			}

			now = Math.floor(new Date().valueOf() / 1000);
			newNow = parseInt(val, 10);

			me = me_set('created', me, verb, newNow);
			me = me_set('created_utc', me, verb, newNow);

			return me;
		};
		meFakedFuncs['created'] = meFakedFuncs['cakeday'];
		meFakedFuncs['created_utc'] = meFakedFuncs['cakeday'];

		meFakedFuncs['comment_karma'] = function (request, me, verb) {
			var karma = parseInt(me.data.comment_karma, 10);
			var num = bpmv.num(karma, true) ? karma : 0;
			var vType = bpmv.whatis(verb.result).toLowerCase();

			if (!bpmv.num(karma, true)) {
				karma = 0;
			}

			switch (vType) {
				case 'undefined':
					num = 0;
					break;

				case 'boolean':
					num = verb.to_bool() ? karma + 1 : 0;
					break;

				case 'number':
					if (verb.isPct) {
						num = verb.to_bool() ? karma + 1 : 0
					} else if (bpmv.str(verb.sign)) {
						num = karma + parseInt(verb.result, 10);
					} else {
						num = parseInt(verb.result, 10);
					}
					break;

				case 'string':
					num = bpmv.trueish(verb.result) ? karma + 1 : 0;
					break;
			}

			me = me_set('comment_karma', me, verb, Math.round(num));

			return me;
		};

		meFakedFuncs['gold_creddits'] = function (request, me, verb) {
			return me_set('gold_creddits', me, verb, verb.to_int());
		};

		meFakedFuncs['gold_expiration'] = function (request, me, verb) {
			var now = Math.floor(new Date().valueOf() / 1000);
			var newNow = verb.to_int();

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

		meFakedFuncs['link_karma'] = function (request, me, verb) {
			var karma = parseInt(me.data.link_karma, 10);
			var num = bpmv.num(karma, true) ? karma : 0;
			var vType = bpmv.whatis(verb.result).toLowerCase();

			if (!bpmv.num(karma, true)) {
				karma = 0;
			}

			switch (vType) {
				case 'undefined':
					num = 0;
					break;

				case 'boolean':
					num = verb.to_bool() ? karma + 1 : 0;
					break;

				case 'number':
					if (verb.isPct) {
						num = verb.to_bool() ? karma + 1 : 0
					} else if (bpmv.str(verb.sign)) {
						num = karma + parseInt(verb.result, 10);
					} else {
						num = parseInt(verb.result, 10);
					}
					break;

				case 'string':
					num = bpmv.trueish(verb.result) ? karma + 1 : 0;
					break;
			}

			me = me_set('link_karma', me, verb, Math.round(num));

			return me;
		};

		meFakedFuncs['over_18'] = function (request, me, verb) {
			return me_set('over_18', me, verb, verb.to_bool());
		};
	})();

	/*
	* VERB DEFINITIONS
	*/

	(function () {
		verbSet['boolean'] = {
			rgx: /^\s*(on|off|true|false|yes|no|yar|nay|checked|unchecked|selected|disabled)\s*$/i,
			len: 2,
			keys: {v1: 1},
			proc: function () {
				return bpmv.trueish(this.v1);
			},
			desc: [
				'Provides a boolean decision.'
			],
			samples: [
				'# Set is_gold for the user "Narcikarma" to true (also increases gold expiration date)'+
					'\n    http://localhost:'+hostPort+'/me/Narcikarma/me.json?is_gold=on',
				'# Set is_gold for the user "Narcikarma" to true'+
					'\n    http://localhost:'+hostPort+'/me/Narcikarma/me.json?is_gold=true',
				'# Set is_gold for the user "Narcikarma" to true'+
					'\n    http://localhost:'+hostPort+'/me/Narcikarma/me.json?is_gold=yes',
				'# Set is_gold for the user "Narcikarma" to false (also decreases gold expiration date)'+
					'\n    http://localhost:'+hostPort+'/me/Narcikarma/me.json?is_gold=off',
				'# Set is_gold for the user "Narcikarma" to false'+
					'\n    http://localhost:'+hostPort+'/me/Narcikarma/me.json?is_gold=false',
				'# Set is_gold for the user "Narcikarma" to false'+
					'\n    http://localhost:'+hostPort+'/me/Narcikarma/me.json?is_gold=no',
			],
		};

		verbSet['chance'] = {
			rgx: /^\s*([\+\-])?chance,?\s*([\+\-]?[0-9]+)\s*$/i,
			len: 3,
			keys: {sign: 1, v1: 2},
			isRand: true,
			proc: function () {
				if (bpmv.num(this.v1)) {
					return ((Math.random() * (this.v1 * 1000)) / 1000) <= this.v1;
				}

				return false;
			},
			desc: [
				'A percentage chance for a boolean result.'+
					' Can be a range of -100 to 100.',
			],
			samples: [
				'# Set is_mod for the user "Narcikarma" to true with an 80% chance.'+
					'\n    http://localhost:'+hostPort+'/me/Narcikarma/me.json?is_mod=chance80',
			],
		};

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
					d = new Date(''+this.v1+'-'+bpmv.pad(this.v2, 2)+'-'+bpmv.pad(this.v3, 2)+' '+bpmv.pad(this.v4, 2)+'-'+bpmv.pad(this.v5, 2)+'-'+bpmv.pad(this.v6, 2)+'').valueOf();
				} else {
					d = new Date(''+this.v1+'-'+bpmv.pad(this.v2, 2)+'-'+bpmv.pad(this.v3, 2)+' 00:00:00').valueOf();
				}

				return d;
			},
			desc: [
				'Sepcify a date in &quot;UK&quot; format (YYYY-MM-DD) with an optional time.'+
					' The choice of delimiter for the month day and year can be any one of &quot;-&quot;, &quot;/&quot;, or &quot;.&quot;.'+
					' If time is provided, it must be in 24 hour format as HH:MM:SS.',
			],
			samples: [
				'# Set gold_expiration for the user "Narcikarma" to January 1, 2015.'+
					'\n# If in the past, is_gold will be revoked.'+
					'\n    http://localhost:'+hostPort+'/me/Narcikarma/me.json?gold_expiration=2015-01-01',
				'# Set gold_expiration for the user "Narcikarma" to July 1, 2000.'+
					'\n    http://localhost:'+hostPort+'/me/Narcikarma/me.json?gold_expiration=2000.07.01',
				'# Set gold_expiration for the user "Narcikarma" to Juune 1, 2005.'+
					'\n    http://localhost:'+hostPort+'/me/Narcikarma/me.json?gold_expiration=2000/06/01',
				'# Set gold_expiration for the user "Narcikarma" to January 1, 2025 at midnight.'+
					'\n# If in the future, is_gold will be granted.'+
					'\n# Remember also that &quot;+&quot; is a space (&quot; &quot;) in HTML.'+
					'\n    http://localhost:'+hostPort+'/me/Narcikarma/me.json?gold_expiration=2015-01-01+00:00:00',
			],
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
					d = new Date(''+this.v1+'-'+bpmv.pad(this.v2, 2)+'-'+bpmv.pad(this.v3, 2)+' '+bpmv.pad(this.v4, 2)+'-'+bpmv.pad(this.v5, 2)+'-'+bpmv.pad(this.v6, 2)+'').valueOf() / 1000;
				} else {
					d = new Date(''+this.v1+'-'+bpmv.pad(this.v2, 2)+'-'+bpmv.pad(this.v3, 2)+' 00:00:00').valueOf() / 1000;
				}

				return d;
			},
			desc: [
				'Sepcify a date in &quot;US&quot; format (MM-DD-YYYY) with an optional time.'+
					' The choice of delimiter for the month day and year can be any one of &quot;-&quot;, &quot;/&quot;, or &quot;.&quot;.'+
					' If time is provided, it must be in 24 hour format as HH:MM:SS.',
			],
			samples: [
				'# Set gold_expiration for the user "Narcikarma" to January 1, 2015.'+
					'\n# If in the past, is_gold will be revoked.'+
					'\n    http://localhost:'+hostPort+'/me/Narcikarma/me.json?gold_expiration=01-01-2015',
				'# Set gold_expiration for the user "Narcikarma" to July 1, 2000.'+
					'\n    http://localhost:'+hostPort+'/me/Narcikarma/me.json?gold_expiration=07.01.2000',
				'# Set gold_expiration for the user "Narcikarma" to Juune 1, 2005.'+
					'\n    http://localhost:'+hostPort+'/me/Narcikarma/me.json?gold_expiration=06/01/2000',
				'# Set gold_expiration for the user "Narcikarma" to January 1, 2025 at midnight.'+
					'\n# If in the future, is_gold will be granted.'+
					'\n# Remember also that &quot;+&quot; is a space (&quot; &quot;) in HTML.'+
					'\n    http://localhost:'+hostPort+'/me/Narcikarma/me.json?gold_expiration=01-01-2025+00:00:00',
			],
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
			desc: [
			],
			samples: [
			],
		};

		verbSet['rand'] = {
			rgx: /^\s*([\+\-])?rand\s*$/i,
			len: 2,
			keys: {sign: 1},
			isRand: true,
			proc: function () {
				return (Math.random() * 1000) >= 500;
			},
			desc: [
			],
			samples: [
			],
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
			desc: [
			],
			samples: [
			],
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
			desc: [
			],
			samples: [
			],
		};

		verbSet['randPctUpTo'] = {
			rgx: /^\s*([\+\-])?pct,?\s*([\+\-]?[0-9]+)\s*$/i,
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
			desc: [
			],
			samples: [
			],
		};

		verbSet['randPctRange'] = {
			rgx: /^\s*([\+\-])?pct,?\s*([\+\-]?[0-9]+),\s*([\+\-]?[0-9]+)\s*$/i,
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
			desc: [
			],
			samples: [
			],
		};

		verbSet['randInt'] = {
			rgx: /^\s*([\+\-])?rand,?\s*([\+\-]?[0-9]+)\s*$/i,
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
			desc: [
			],
			samples: [
			],
		};

		verbSet['randRange'] = {
			rgx: /^\s*([\+\-])?rand,?\s*([\+\-]?[0-9]+),\s*([\+\-]?[0-9]+)\s*$/i,
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
			desc: [
			],
			samples: [
			],
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
			desc: [
			],
			samples: [
			],
		};

		verbSet['rise'] = {
			rgx: /^\s*([\+\-])?rise\s*$/i,
			len: 2,
			keys: {sign: 1},
			proc: function () {
				if (this.sign !== '-') {
					this.sign = '+';
				}

				return this.sign === '-' ? -1 : 1;
			},
			desc: [
			],
			samples: [
			],
		};

		verbSet['fall'] = {
			rgx: /^\s*([\+\-])?fall\s*$/i,
			len: 2,
			keys: {sign: 1},
			proc: function () {
				return parseInt(0 - verbSet['rise'].proc.apply(this, []), 10)
			},
			desc: [
			],
			samples: [
			],
		};

		verbSet['riseInt'] = {
			rgx: /^\s*([\+\-])?rise,?\s*([\+\-]?[0-9]+)\s*$/i,
			len: 3,
			keys: {sign: 1, v1: 2},
			proc: function () {
				if (bpmv.num(this.v1, true)) {
					if (this.sign === '-') {
						return 0 - parseInt(this.v1, 10);
					} else {
						this.sign = '+';
					}

					return parseInt(this.v1, 10);
				}

				return 0;
			},
			desc: [
			],
			samples: [
			],
		};

		verbSet['fallInt'] = {
			rgx: /^\s*([\+\-])?fall,?\s*([\+\-]?[0-9]+)\s*$/i,
			len: 3,
			keys: {sign: 1, v1: 2},
			proc: function () {
				return parseInt(0 - verbSet['riseInt'].proc.apply(this, []), 10)
			},
			desc: [
			],
			samples: [
			],
		};

		verbSet['riseRange'] = {
			rgx: /^\s*([\+\-])?rise,?\s*([\+\-]?[0-9]+),\s*([\+\-]?[0-9]+)\s*$/i,
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
				} else {
					this.sign = '+';
				}

				return ret;
			},
			desc: [
			],
			samples: [
			],
		};

		verbSet['fallRange'] = {
			rgx: /^\s*([\+\-])?fall,?\s*([\+\-]?[0-9]+),\s*([\+\-]?[0-9]+)\s*$/i,
			len: 4,
			keys: {sign: 1, v1: 2, v2: 3},
			isRand: true,
			proc: function () {
				return parseInt(0 - verbSet['riseRange'].proc.apply(this, []), 10)
			},
			desc: [
			],
			samples: [
			],
		};
	})();

	/*
	* DO THAT SHIT
	*/

	http.createServer(http_handle_request).listen(hostPort);

	spit(
		{
			nkId: coreId,
			connection: {
				remoteAddress: coreAddress,
			},
			fakedMe: get_manifest('name')+' '+get_manifest('version'),
			headers: {
				host: coreAddress+':'+hostPort,
			},
			method: 'CORE',
			url: path.basename(__filename),
		},
		0,
		'--startup--',
		logFile,
		bpmv.count(verbSet)+' verbs: '+bpmv.keys(verbSet).join(', ')
	);
})();
(function () {

	/*
	********************************************************************************
	********************************************************************************
	* CREDITS
	********************************************************************************
	********************************************************************************
	*/

	var nkCredits = { // the order here controls appearance order
		'creator': [
			{
				'name': 'badmonkey0001',
				'link': 'http://www.reddit.com/u/badmonkey0001'
			}
		],
		'tools': [
			{
				'name': 'base64.js',        
				'link': 'https://code.google.com/p/javascriptbase64/'
			},
			{
				'name': 'bpmv',             
				'link': 'https://github.com/BrynM/bpmv'
			},
			{
				'name': 'Google Chrome',    
				'link': 'http://www.google.com/chrome'
			},
			{
				'name': 'jQuery',           
				'link': 'http://jquery.com'
			},
			{
				'name': 'Reddit',           
				'link': 'http://www.reddit.com/'
			},
			{
				'name': 'Sublime Text 2',   
				'link': 'http://www.sublimetext.com/2'
			},
			{
				'name': 'Simple Fireworks', 
				'link': 'http://rainbow.arch.scriptmania.com/scripts/fireworks.html'
			}
		],
		'developers': [
			{
				'name': 'badmonkey0001',
				'link': 'http://www.reddit.com/u/badmonkey0001'
			}
		],
		'alpha testers': [
			{
				'name': 'evilmarc',        
				'link': ''
			},
			{
				'name': 'jengo',           
				'link': ''
			},
			{
				'name': 'jnickers',        
				'link': ''
			},
			{
				'name': 'KerrickLong',     
				'link': ''
			},
			{
				'name': 'lenoat702',       
				'link': ''
			},
			{
				'name': 'MobsterMonkey21', 
				'link': ''
			},
			{
				'name': 'The_Boudzter',    
				'link': ''
			},
			{
				'name': 'tomswartz07',     
				'link': ''
			},
			{
				'name': 'Zagorath',       
				 'link': ''
			}
		]
	};

	nckma.credits = {};

	nckma.credits.to_html = function () {
		var ret = '';
		var retT = '';
		var majNum = 0;
		var minNum = 0;

		for (var cred in nkCredits) {
			retT = '';
			minNum = 0;

			if (nkCredits.hasOwnProperty(cred) && bpmv.str(cred) && bpmv.obj(nkCredits[cred], true)) {
				for (var aCred in nkCredits[cred]) {
					if (nkCredits[cred].hasOwnProperty(aCred) && bpmv.str(aCred) && bpmv.obj(nkCredits[cred][aCred], true) && bpmv.str(nkCredits[cred][aCred].name)) {
						if (bpmv.str(nkCredits[cred][aCred].link)) {
							retT += '<li><a href="'+nkCredits[cred][aCred].link+'" target="_blank">'+nkCredits[cred][aCred].name+'</a></li>\n';
						} else {
							retT += '<li>'+nkCredits[cred][aCred].name+'</li>\n';
						}

						minNum++;
					}
				}

				if ((minNum > 0) && bpmv.str(retT)) {
					ret += '<li>\n<h3 style="text-transform: capitalize;" >'+cred+'</h3>\n<ul>\n'+retT+'\n</ul>\n</li>\n';
					majNum++;
				}
			}
		}

		if (bpmv.str(ret)) {
			ret = '<div class="nckCredits">\n<h1>Narcikarma Credits</h1>\n<ul>\n'+ret+'\n</ul>\n</div>';
		}

		return ret;
	};

	nckma.credits.to_markdown = function () {
		var ret = '';
		var retT = '';
		var majNum = 0;
		var minNum = 0;

		for (var cred in nkCredits) {
			retT = '';
			minNum = 0;

			if (nkCredits.hasOwnProperty(cred) && bpmv.str(cred) && bpmv.obj(nkCredits[cred], true)) {
				for (var aCred in nkCredits[cred]) {
					if (nkCredits[cred].hasOwnProperty(aCred) && bpmv.str(aCred) && bpmv.obj(nkCredits[cred][aCred], true) && bpmv.str(nkCredits[cred][aCred].name)) {
						if (bpmv.str(nkCredits[cred][aCred].link)) {
							retT += '* ['+nkCredits[cred][aCred].name+']('+nkCredits[cred][aCred].link+')\n';
						} else {
							retT += '* '+nkCredits[cred][aCred].name+'\n';
						}

						minNum++;
					}
				}

				if ((minNum > 0) && bpmv.str(retT)) {
					ret += '## '+cred.replace(/(^|\s)([a-z])/g , function(m,p1,p2){ return p1+p2.toUpperCase(); })+'\n'+retT+'\n';
					majNum++;
				}
			}
		}

		if (bpmv.str(ret)) {
			ret = '# Narcikarma Credits\n'+bpmv.trim(ret)+'\n';
		}

		return ret;
	};

	nckma.credits.to_text = function () {
		var ret = '';
		var retT = '';
		var majNum = 0;
		var minNum = 0;

		for (var cred in nkCredits) {
			retT = '';
			minNum = 0;

			if (nkCredits.hasOwnProperty(cred) && bpmv.str(cred) && bpmv.obj(nkCredits[cred], true)) {
				for (var aCred in nkCredits[cred]) {
					if (nkCredits[cred].hasOwnProperty(aCred) && bpmv.str(aCred) && bpmv.obj(nkCredits[cred][aCred], true) && bpmv.str(nkCredits[cred][aCred].name)) {
						if (bpmv.str(nkCredits[cred][aCred].link)) {
							retT += '    - '+nkCredits[cred][aCred].name+' ('+nkCredits[cred][aCred].link+')\n';
						} else {
							retT += '    - '+nkCredits[cred][aCred].name+'\n';
						}

						minNum++;
					}
				}

				if ((minNum > 0) && bpmv.str(retT)) {
					ret += '  * '+cred.replace(/(^|\s)([a-z])/g , function(m,p1,p2){ return p1+p2.toUpperCase(); })+'\n'+retT+'\n';
					majNum++;
				}
			}
		}

		if (bpmv.str(ret)) {
			ret = 'Narcikarma Credits\n'+bpmv.trim(ret)+'\n';
		}

		return ret;
	};

})();
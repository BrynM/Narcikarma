var path = require("path");
var sys = require('util');
var execSync = require('child_process').execSync;
var os = require('os');
var fs = require('fs');
var _ = require('underscore')



module.exports = function(grunt) {

	//
	// timestamp
	//

	var dateObj = new Date();
	var timestamp = Math.floor(dateObj.valueOf()/1000);

	//
	// project manifest and external if any
	//

	var manifest = grunt.file.readJSON('manifest.json');

	//
	// paths
	//

	var rgxPathReplaceWin = /\\+/g;
	var rgxPathReplaceNix = /\/+/g;
	var paths = {};

	paths.base = path_2_nix(path.dirname(__filename)+'/');
	paths.tmp = path_2_nix(paths.base+'build/tmp/');
	paths.build = path_2_nix(paths.tmp+manifest.version+'/');
	paths.zip = path_2_nix(paths.base+'build/package/'+manifest.name+'-'+manifest.version+'.zip');

	//
	// git info
	//

	var revision = execSync('git rev-parse HEAD', [], {
		cwd: paths.base
	}).toString('utf8').trim();

	var branch = execSync('git rev-parse --abbrev-ref HEAD', [], {
		cwd: paths.base
	}).toString('utf8').trim();

	var gitUser = execSync('git config --get user.name', [], {
		cwd: paths.base
	}).toString('utf8').trim();

	var repo = execSync('git config --get remote.origin.url', [], {
		cwd: paths.base
	}).toString('utf8').trim();

	//
	// replace regexes
	//

	var rgxReplaceScripts = /\<\!\-\- nckmaJS [.\s\S]* nckmaJS end \-\-\>/im;
	var rgxReplaceCss = /\/narcikarma\.css/;

	//
	// base script sets
	//

	var jsGa = [
		paths.base+'lib/google-analytics-bundle.js',
	];
	var jsJquery = [
		paths.base+'lib/jquery-1.11.3.js',
	];
	var jsPrereqs = [
		paths.base+'lib/jquery-1.11.3.js',
		paths.base+'lib/underscore-min.js',
		paths.base+'lib/base64.js',
		paths.base+'lib/bpmv.js'
	];
	var jsNarcikarma = [
		paths.base+'nckma_scripts/narcikarma.core.js',
		paths.base+'nckma_scripts/narcikarma.notifications.js',
		paths.base+'nckma_scripts/narcikarma.alerts.js',
		paths.base+'nckma_scripts/narcikarma.db.js',
		paths.base+'nckma_scripts/narcikarma.idb.js',
		paths.base+'nckma_scripts/narcikarma.opts.js',
		paths.base+'nckma_scripts/narcikarma.px.js',
		paths.base+'nckma_scripts/narcikarma.spark.js',
		paths.base+'nckma_scripts/narcikarma.credits.js',
		paths.base+'nckma_scripts/narcikarma.pages.js',
		paths.base+'nckma_scripts/narcikarma.startup.js'
	];
	var jsFullset = _.extend([], jsGa).concat(jsPrereqs).concat(jsNarcikarma);

	//
	// bare grunt
	//

	var gruntCfg = {}
	var uglifyDefaults = {
		mangle: true,
		compress: false,
		preserveComments: 'some',
		quoteStyle: 3,
		report: 'min'
	};

	//
	// internally scoped funcs
	//

	function path_2_nix(fp) {
		if (typeof fp === 'string') {
			return (''+fp).replace(rgxPathReplaceWin, '/');
		}
	}

	function path_2_win(fp) {
		if (typeof fp === 'string') {
			return (''+fp).replace(rgxPathReplaceNix, '\\');
		}
	}

	function tpl_banner(fileName) {
		var txt;
		var pre = [
			'/*!',
		];

		if (typeof fileName === 'string') {
			pre.push('* '+fileName);
			pre.push('*');
		} else if (typeof fileName === 'object') {
			for (var i in fileName) {
				if (fileName.hasOwnProperty(i) && typeof fileName[i] === 'string') {
					pre.push('* path '+i+': '+fileName[i]);
				}
			}
			pre.push('*');
		}

		txt = [
			'* '+manifest.name+' '+manifest.version,
			'* https://reddit.com/r/Narcikamra',
			'*',
			'* '+manifest.description,
			'*',
			'* Copyright '+dateObj.getFullYear()+' Bryn Mosher (/u/badmonkey0001)',
			'* License: GPLv3'+(fileName ? 'unless otherwise noted' : ''),
			'*',
			'* Build:',
			'*   '+gitUser+' on '+os.hostname(),
			'*   '+repo,
			'*   '+manifest.version+'-'+timestamp,
			'*   '+branch+' '+revision,
			'*   '+dateObj.toUTCString(),
			'*   '+dateObj.toLocaleString(),
			'*',
			'*/\n',
		];

		return pre.join('\n')+'\n'+txt.join('\n');
	}

	//
	// project configuration
	//

	gruntCfg.pkg = {
		'name': manifest.name,
		'version': manifest.version,
		'devDependencies': {
			'grunt': '>=0.4.5',
			'grunt-chrome-compile': '>=0.2.2',
			'grunt-contrib-copy': '>=0.8.1',
			'grunt-contrib-cssmin': '>=0.13.0',
			'grunt-contrib-htmlmin': '>=0.4.0',
			'grunt-contrib-jshint': '>=0.10.0',
			'grunt-contrib-nodeunit': '>=0.4.1',
			'grunt-contrib-uglify': '>=0.5.0',
			'grunt-text-replace': '>=0.4.0',
			'grunt-exec': '>=0.4.6',
			'maxmin': '>=1.1.0',
			'underscore': '>=1.8.3',
		},
	};

	gruntCfg.concat = {
		options: {
			separator: ';\n\n'
		},
		background: {
			src: _.extend([], jsGa).concat(jsPrereqs).concat([paths.base+'nckma_scripts/narcikarma.background.js']).concat(jsNarcikarma),
			dest: paths.build+'nckma_scripts/background.min.js'
		},
		credits: {
			src: _.extend([], jsJquery).concat(['nckma_scripts/page.credits.js']),
			dest: paths.build+'nckma_scripts/credits.min.js'
		},
		graphs: {
			src: _.extend([], jsFullset).concat(['nckma_scripts/page.graphs.js']),
			dest: paths.build+'nckma_scripts/graphs.min.js'
		},
		optionsconcat: {
			src: _.extend([], jsFullset).concat(['nckma_scripts/page.options.js']),
			dest: paths.build+'nckma_scripts/options.min.js'
		},
		popup: {
			src: _.extend([], jsJquery).concat(['nckma_scripts/page.popup.js']),
			dest: paths.build+'nckma_scripts/popup.min.js'
		},
	};

	gruntCfg.copy = {
		main: {
			files:[
				{
					src: [
						paths.base+'manifest.json',
						paths.base+'gplv3.txt',
						paths.base+'readme.md',
					],
					dest: paths.build,
					expand: true,
					flatten: true,
					filter: 'isFile',
				},
				{
					src: [
						paths.base+'nckma_assets/*.png',
						paths.base+'nckma_assets/*.jpg',
						paths.base+'nckma_assets/*.ico',
					],
					dest: paths.build+'nckma_assets/',
					expand: true,
					flatten: true,
					filter: 'isFile',
				},
				{
					src: [
						paths.base+'nckma_assets/img/*.png',
						paths.base+'nckma_assets/img/*.jpg',
						paths.base+'nckma_assets/img/*.ico',
					],
					dest: paths.build+'nckma_assets/img/',
					expand: true,
					flatten: true,
					filter: 'isFile',
				},
			],
		},
	};

	gruntCfg.exec = {
		zipify: {
			cmd: function() {
				var thingy = path_2_win(paths.build);

				if (fs.existsSync(paths.zip)) {
					console.log('Removing old zip', paths.zip);
					fs.unlinkSync(paths.zip);
				}

				return '7z a -bd -tzip -mpass -y '+path_2_win(paths.zip)+' '+path_2_win(paths.build)+'*';
			}
		}
	};

	gruntCfg.htmlmin = {};
	gruntCfg.htmlmin.main = {};
	gruntCfg.htmlmin.main.options = {
		removeComments: true,
		collapseWhitespace: true
	};
	gruntCfg.htmlmin.main.files = {};
	// dest: src
	gruntCfg.htmlmin.main.files[paths.build+'nckma_html/background.html'] = paths.build+'nckma_html/background.html';
	gruntCfg.htmlmin.main.files[paths.build+'nckma_html/credits.html'] = paths.build+'nckma_html/credits.html';
	gruntCfg.htmlmin.main.files[paths.build+'nckma_html/graphs.html'] = paths.build+'nckma_html/graphs.html';
	gruntCfg.htmlmin.main.files[paths.build+'nckma_html/options.html'] = paths.build+'nckma_html/options.html';
	gruntCfg.htmlmin.main.files[paths.build+'nckma_html/popup.html'] = paths.build+'nckma_html/popup.html';

	gruntCfg.replace = {
		background: {
			src: ['nckma_html/background.html'],
			dest: paths.build+'nckma_html/',
			replacements: [
				{
					from: rgxReplaceScripts,
					to: '<script src="../nckma_scripts/background.min.js"></script>'
				},
				{
					from: rgxReplaceCss,
					to: '/narcikarma.min.css'
				},
			],
		},
		credits: {
			src: ['nckma_html/credits.html'],
			dest: paths.build+'nckma_html/',
			replacements: [
				{
					from: rgxReplaceScripts,
					to: '<script src="../nckma_scripts/credits.min.js"></script>'
				},
				{
					from: rgxReplaceCss,
					to: '/narcikarma.min.css'
				},
			],
		},
		graphs: {
			src: ['nckma_html/graphs.html'],
			dest: paths.build+'nckma_html/',
			replacements: [
				{
					from: rgxReplaceScripts,
					to: '<script src="../nckma_scripts/graphs.min.js"></script>'
				},
				{
					from: rgxReplaceCss,
					to: '/narcikarma.min.css'
				},
			],
		},
		optionsreplace: {
			src: ['nckma_html/options.html'],
			dest: paths.build+'nckma_html/',
			replacements: [
				{
					from: rgxReplaceScripts,
					to: '<script src="../nckma_scripts/options.min.js"></script>'
				},
				{
					from: rgxReplaceCss,
					to: '/narcikarma.min.css'
				},
			],
		},
		popup: {
			src: ['nckma_html/popup.html'],
			dest: paths.build+'nckma_html/',
			replacements: [
				{
					from: rgxReplaceScripts,
					to: '<script src="../nckma_scripts/popup.min.js"></script>'
				},
				{
					from: rgxReplaceCss,
					to: '/narcikarma.min.css'
				},
			],
		},
	};

	gruntCfg.uglify = {};

	gruntCfg.uglify.background = {};
	gruntCfg.uglify.background.options = _.extend({}, uglifyDefaults, {banner: tpl_banner('background.min.js')});
	gruntCfg.uglify.background.files = {};
	gruntCfg.uglify.background.files[paths.build+'nckma_scripts/background.min.js'] = paths.build+'nckma_scripts/background.min.js';

	gruntCfg.uglify.credits = {};
	gruntCfg.uglify.credits.options = _.extend({banner: tpl_banner('credits.min.js')}, uglifyDefaults);
	gruntCfg.uglify.credits.files = {};
	gruntCfg.uglify.credits.files[paths.build+'nckma_scripts/credits.min.js'] = paths.build+'nckma_scripts/credits.min.js';

	gruntCfg.uglify.graphs = {};
	gruntCfg.uglify.graphs.options = _.extend({banner: tpl_banner('graphs.min.js')}, uglifyDefaults);
	gruntCfg.uglify.graphs.files = {};
	gruntCfg.uglify.graphs.files[paths.build+'nckma_scripts/graphs.min.js'] = paths.build+'nckma_scripts/graphs.min.js';

	gruntCfg.uglify.optionsugly = {};
	gruntCfg.uglify.optionsugly.options = _.extend({banner: tpl_banner('options.min.js')}, uglifyDefaults);
	gruntCfg.uglify.optionsugly.files = {};
	gruntCfg.uglify.optionsugly.files[paths.build+'nckma_scripts/options.min.js'] = paths.build+'nckma_scripts/options.min.js';

	gruntCfg.uglify.popup = {};
	gruntCfg.uglify.popup.options = _.extend({banner: tpl_banner('popup.min.js')}, uglifyDefaults);
	gruntCfg.uglify.popup.files = {};
	gruntCfg.uglify.popup.files[paths.build+'nckma_scripts/popup.min.js'] = paths.build+'nckma_scripts/popup.min.js';

	gruntCfg.cssmin = {};
	gruntCfg.cssmin.main = {}
	gruntCfg.cssmin.main.options = {};
	gruntCfg.cssmin.main.options.banner = tpl_banner('narcikarma.min.css');
	gruntCfg.cssmin.main.options.report = 'min';
	gruntCfg.cssmin.main.files = {};
	gruntCfg.cssmin.main.files[paths.build+'nckma_assets/narcikarma.min.css'] = [paths.base+'nckma_assets/narcikarma.css'];

	//
	// run all the things!
	//

	console.log(tpl_banner(paths));

	// set config
	grunt.initConfig(gruntCfg);

	// Load tasks
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-htmlmin');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-exec');
	grunt.loadNpmTasks('grunt-text-replace');

	// Default task(s).
	grunt.registerTask('default', [
		'concat',
		'uglify',
		'cssmin',
		'replace',
		'htmlmin',
		'copy',
		'exec:zipify',
	]);

};
var path = require("path");
var sys = require('util');
var execSync = require('child_process').execSync;
var os = require('os');
var _ = require('underscore')

module.exports = function(grunt) {

	function tpl_banner(fileName) {
		var txt;
		var pre = [
			'/*!',
		];

		if (fileName) {
			pre.push('* '+fileName);
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

	var dateObj = new Date();
	var timestamp = Math.floor(dateObj.valueOf()/1000);

	var basepath = path.dirname(__filename);

	var revision = execSync('git rev-parse HEAD', [], {
		cwd: basepath
	}).toString('utf8').trim();

	var branch = execSync('git rev-parse --abbrev-ref HEAD', [], {
		cwd: basepath
	}).toString('utf8').trim();

	var gitUser = execSync('git config --get user.name', [], {
		cwd: basepath
	}).toString('utf8').trim();

	var repo = execSync('git config --get remote.origin.url', [], {
		cwd: basepath
	}).toString('utf8').trim();

	var rgxReplaceScripts = /\<\!\-\- nckmaJS [.\s\S]* nckmaJS end \-\-\>/im;
	var rgxReplaceCss = /\/narcikarma\.css/;

	var replaceCss = {
		from: rgxReplaceCss,
		to: '/narcikarma.min.css'
	}

	var manifest = grunt.file.readJSON('manifest.json');

	var jsPrereqs = [
		//'lib/jquery-1.11.3',
		'lib/jquery-1.8.2.min.js',
		'lib/underscore-min.js',
		'lib/base64.js',
		'lib/bpmv.js'
	];
	var jsNarcikarma = [
		'nckma_scripts/narcikarma.background.js',
		'nckma_scripts/narcikarma.core.js',
		'nckma_scripts/narcikarma.notifications.js',
		'nckma_scripts/narcikarma.alerts.js',
		'nckma_scripts/narcikarma.db.js',
		'nckma_scripts/narcikarma.idb.js',
		'nckma_scripts/narcikarma.opts.js',
		'nckma_scripts/narcikarma.px.js',
		'nckma_scripts/narcikarma.spark.js',
		'nckma_scripts/narcikarma.credits.js',
		'nckma_scripts/narcikarma.pages.js',
		'nckma_scripts/narcikarma.startup.js'
	];

	var uglifyDefaults = {
		mangle: true,
		compress: false,
		preserveComments: 'some',
		quoteStyle: 3,
		report: 'min'
	};

	// Project configuration.
	var gruntCfg = {
		pkg: {
			'name': manifest.name,
			'version': manifest.version,
			'devDependencies': {
				'grunt': '>=0.4.5',
				'underscore': '>=1.8.3',
				'grunt-contrib-jshint': '>=0.10.0',
				'grunt-contrib-nodeunit': '>=0.4.1',
				'grunt-contrib-uglify': '>=0.5.0',
				'grunt-chrome-compile': '>=0.2.2',
				'grunt-text-replace': '>=0.4.0',
				'grunt-contrib-cssmin': '>=0.13.0',
				'grunt-contrib-htmlmin': '>=0.4.0',
				'maxmin': '>=1.1.0'
			},
		},
		concat: {
			options: {
				separator: ';\n\n'
			},
			background: {
				src: _.extend([], jsPrereqs).concat(jsNarcikarma),
				dest: 'build/tmp/nckma_scripts/background.min.js'
			},
			credits: {
				src: ['lib/jquery-1.8.2.min.js', 'nckma_scripts/page.credits.js'],
				dest: 'build/tmp/nckma_scripts/credits.min.js'
			},
			ga: {
				src: ['nckma_scripts/ga.js'],
				dest: 'build/tmp/nckma_scripts/ga.js'
			},
			graphs: {
				src: _.extend([], jsPrereqs).concat(['lib/jquery.sparkline.min.js']).concat(jsNarcikarma).concat(['nckma_scripts/page.graphs.js']),
				dest: 'build/tmp/nckma_scripts/graphs.min.js'
			},
			optionsconcat: {
				src: _.extend([], jsPrereqs).concat(jsNarcikarma).concat(['nckma_scripts/page.options.js']),
				dest: 'build/tmp/nckma_scripts/options.min.js'
			},
			popup: {
				src: _.extend([], jsPrereqs).concat(jsNarcikarma).concat(['nckma_scripts/page.popup.js']),
				dest: 'build/tmp/nckma_scripts/popup.min.js'
			},
		},
		uglify: {
			background: {
				options: _.extend({}, uglifyDefaults, {banner: tpl_banner('background.min.js')}),
				files: {
					'build/tmp/nckma_scripts/background.min.js': 'build/tmp/nckma_scripts/background.min.js'
				},
			},
			credits: {
				options: _.extend({banner: tpl_banner('credits.min.js')}, uglifyDefaults),
				files: {
					'build/tmp/nckma_scripts/credits.min.js': 'build/tmp/nckma_scripts/credits.min.js'
				},
			},
			graphs: {
				options: _.extend({banner: tpl_banner('graphs.min.js')}, uglifyDefaults),
				files: {
					'build/tmp/nckma_scripts/graphs.min.js': 'build/tmp/nckma_scripts/graphs.min.js'
				},
			},
			optionsugly: {
				options: _.extend({banner: tpl_banner('options.min.js')}, uglifyDefaults),
				files: {
					'build/tmp/nckma_scripts/options.min.js': 'build/tmp/nckma_scripts/options.min.js'
				},
			},
			popup: {
				options: _.extend({banner: tpl_banner('popup.min.js')}, uglifyDefaults),
				files: {
					'build/tmp/nckma_scripts/popup.min.js': 'build/tmp/nckma_scripts/popup.min.js'
				},
			},
		},
		cssmin: {
			dist: {
				options: {
					banner: tpl_banner('narcikarma.min.css'),
					report: 'min',
				},
				files: {
					'build/tmp/nckma_assets/narcikarma.min.css': ['nckma_assets/narcikarma.css'],
				},
			},
		},
		htmlmin: {
			main: {
				options: {
					removeComments: true,
					collapseWhitespace: true
				},
				files: {
					// dest: src
					'build/tmp/nckma_html/background.html': 'build/tmp/nckma_html/background.html',
					'build/tmp/nckma_html/credits.html': 'build/tmp/nckma_html/credits.html',
					'build/tmp/nckma_html/graphs.html': 'build/tmp/nckma_html/graphs.html',
					'build/tmp/nckma_html/options.html': 'build/tmp/nckma_html/options.html',
					'build/tmp/nckma_html/popup.html': 'build/tmp/nckma_html/popup.html',
				},
			},
		},
		replace: {
			background: {
				src: ['nckma_html/background.html'],
				dest: 'build/tmp/nckma_html/',
				replacements: [{
					from: rgxReplaceScripts,
					to: '<script src="../nckma_scripts/background.min.js"></script>'
				}, replaceCss],
			},
			credits: {
				src: ['nckma_html/credits.html'],
				dest: 'build/tmp/nckma_html/',
				replacements: [{
					from: rgxReplaceScripts,
					to: '<script src="../nckma_scripts/credits.min.js"></script>'
				}, replaceCss],
			},
			graphs: {
				src: ['nckma_html/graphs.html'],
				dest: 'build/tmp/nckma_html/',
				replacements: [{
					from: rgxReplaceScripts,
					to: '<script src="../nckma_scripts/graphs.min.js"></script>'
				}, replaceCss],
			},
			optionsreplace: {
				src: ['nckma_html/options.html'],
				dest: 'build/tmp/nckma_html/',
				replacements: [{
					from: rgxReplaceScripts,
					to: '<script src="../nckma_scripts/options.min.js"></script>'
				}, replaceCss],
			},
			popup: {
				src: ['nckma_html/popup.html'],
				dest: 'build/tmp/nckma_html/',
				replacements: [{
					from: rgxReplaceScripts,
					to: '<script src="../nckma_scripts/popup.min.js"></script>'
				}, replaceCss],
			},
		},
		compress: {
			main: {
				options: {
					mode: 'zip',
					archive: 'build/'+manifest.name+'-'+manifest.version+'.zip',
					level: 9,
					pretty: true,
				},
				files: [
					{
						src: ['manifest.json', 'gplv3.txt', 'readme.md'],
						dest: '',
						filter: 'isFile',
					},
					{
						src: ['nckma_assets/*.ico'],
						dest: '',
						filter: 'isFile',
					},
					{
						expand:true,
						src: ['**/*.png', '**/*.jpg', '**/*.gif'],
						cwd: 'nckma_assets/img/',
						dest: 'nckma_assets/img/',
						filter: 'isFile',
					},
					{
						expand:true,
						src: ['**/*.css'],
						cwd: 'build/tmp/nckma_assets/',
						dest: 'nckma_assets/',
						filter: 'isFile',
					},
					{
						expand:true,
						src: ['**/*'],
						cwd: 'build/tmp/nckma_html/',
						dest: 'nckma_html/',
						filter: 'isFile',
					},
					{
						expand:true,
						src: ['**/*'],
						cwd: 'build/tmp/nckma_scripts/',
						dest: 'nckma_scripts/',
						filter: 'isFile',
					},
				],
			},
		},
	};

	console.log(tpl_banner());

	// set config
	grunt.initConfig(gruntCfg);

	// Load tasks
	grunt.loadNpmTasks('grunt-contrib-compress');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-htmlmin');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-text-replace');

	// Default task(s).
	grunt.registerTask('default', [
		'concat',
		'uglify',
		'cssmin',
		'replace',
		'htmlmin',
		'compress'
	]);

};
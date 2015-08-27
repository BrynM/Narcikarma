var path = require("path");
var sys = require('util');
var execSync = require('child_process').execSync;
var _ = require('underscore')

module.exports = function(grunt) {

	function tpl_banner(fileName) {
		var txt = [
			'/*!',
			'* <%= pkg.name %> <%= pkg.version %>',
			'* https://reddit.com/r/Narcikamra',
			'*',
			'* '+manifest.description,
			'*',
			'* Copyright Bryn Mosher (/u/badmonkey0001) <%= grunt.template.today("yyyy-mm-dd") %>',
			'* License: GPLv3 unless otherwise noted',
			'* Git: '+branch+' '+revision,
			'*/\n'
		];

		return txt.join('\n');
	}

	var basepath = path.dirname(__filename);

	var revision = execSync('git rev-parse HEAD', [], {
		cwd: basepath
	}).toString('utf8').trim();

	var branch = execSync('git rev-parse --abbrev-ref HEAD', [], {
		cwd: basepath
	}).toString('utf8').trim();

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
		mangle: false,
		compress: true,
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
				'grunt-contrib-htmlmin': '>=0.4.0'
			}
		},
		uglify: {
			background: {
				options: _.extend({
					banner: tpl_banner('background.min.js'),
				}, uglifyDefaults),
				files: {
					'build/tmp/nckma_scripts/background.min.js': _.extend([], jsPrereqs).concat(jsNarcikarma)
				}
			},
			credits: {
				options: _.extend({
					banner: tpl_banner('credits.min.js'),
				}, uglifyDefaults),
				files: {
					'build/tmp/nckma_scripts/credits.min.js': ['lib/jquery-1.8.2.min.js', 'nckma_scripts/page.credits.js']
				}
			}
		},
		cssmin: {
			dist: {
				options: {
					banner: tpl_banner('narcikarma.min.css'),
					report: 'min'
				},
				files: {
					'build/tmp/nckma_assets/narcikarma.min.css': ['nckma_assets/narcikarma.css']
				}
			}
		},
		htmlmin: {
			main: {
				options: {
					removeComments: true,
					collapseWhitespace: true
				},
				files: {
					// dest: src
//					'build/tmp/nckma_html/background.html': 'nckma_html/background.html'
					'build/tmp/nckma_html/background.html': 'build/tmp/nckma_html/background.html'
				}
			}
		},
		replace: {
			background: {
				src: ['nckma_html/background.html'],
				dest: 'build/tmp/nckma_html/',
				replacements: [{
					from: /\<\!\-\- nckmaJS [.\s\S]* nckmaJS end \-\-\>/im,
					to: '<script src="../nckma_scripts/background.min.js"></script>'
				}]
			},
			background: {
				src: ['nckma_html/credits.html'],
				dest: 'build/tmp/nckma_html/',
				replacements: [{
					from: /\<\!\-\- nckmaJS [.\s\S]* nckmaJS end \-\-\>/im,
					to: '<script src="../nckma_scripts/credits.min.js"></script>'
				}]
			}
		},
		compress: {
			main: {
				options: {
					mode: 'zip',
					archive: 'build/'+manifest.name+'.'+manifest.version+'.crx',
					level: 9,
					pretty: true
				},
				files: [
					{
						src: ['manifest.json', 'gplv3.txt', 'readme.md'],
						dest: '',
						filter: 'isFile'
					},
					{
						src: ['nckma_assets/*.ico'],
						dest: '',
						filter: 'isFile'
					},
					{
						expand:true,
						src: ['**/*.png', '**/*.jpg', '**/*.gif'],
						cwd: 'nckma_assets/img/',
						dest: 'nckma_assets/img/',
						filter: 'isFile'
					},
					{
						expand:true,
						src: ['**/*.css'],
						cwd: 'build/tmp/nckma_assets/',
						dest: 'nckma_assets/',
						filter: 'isFile'
					},
					{
						expand:true,
						src: ['**/*'],
						cwd: 'build/tmp/nckma_html/',
						dest: 'nckma_html/',
						filter: 'isFile'
					},
					{
						expand:true,
						src: ['**/*'],
						cwd: 'build/tmp/nckma_scripts/',
						dest: 'nckma_scripts/',
						filter: 'isFile'
					}
				]
			}
	    }
	};

	// set config
	grunt.initConfig(gruntCfg);

	// Load tasks
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-text-replace');
	grunt.loadNpmTasks('grunt-contrib-htmlmin');
	grunt.loadNpmTasks('grunt-contrib-compress');

	// Default task(s).
	grunt.registerTask('default', [
		'uglify',
		'cssmin',
		'replace',
		'htmlmin',
		'compress'
	]);

};
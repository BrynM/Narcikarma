	module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> <%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
				mangle: false,
				compress: true
			},
			background: {
				files: {
					'build/tmp/nckma_scripts/background.js': [
						'lib/jquery-1.8.2.min.js',
						'lib/underscore-min.js',
						'lib/bpmv.js'
					],
					'build/tmp/nckma_scripts/narcikarma.min.js': [
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
					]
				}
			}
		}
	});

	// Load the plugin that provides the "uglify" task.
	grunt.loadNpmTasks('grunt-contrib-uglify');

	// Default task(s).
	grunt.registerTask('default', ['uglify']);

};
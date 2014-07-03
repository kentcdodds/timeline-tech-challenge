module.exports = function (grunt) {
	require('load-grunt-tasks')(grunt);

	grunt.initConfig({
		jshint: {
			all: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js']
		},

		watch: {
			test: {
				files: ['src/**/*.js', 'test/**/*.js'],
				tasks: ['test']
			}
		}
	});

	grunt.registerTask('test', ['jshint']);
};

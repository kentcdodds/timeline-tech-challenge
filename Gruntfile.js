module.exports = function (grunt) {
	require('load-grunt-tasks')(grunt);

	grunt.initConfig({
		jshint: {
			all: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js']
		},

		karma: {
			options: {
				configFile: 'karma.conf.js'
			},
			single: {
				singleRun: true
			},
			continuous: {
				singleRun: false
			}
		},

		watch: {
			test: {
				files: ['src/**/*.js', 'test/**/*.js'],
				tasks: ['test']
			}
		},

		uglify: {
			dist: {
				files: {
					'dist/timeline.min.js': ['src/timeline.js']
				}
			}
		}
	});

	grunt.registerTask('test', ['jshint', 'karma:single']);
	grunt.registerTask('build', ['uglify']);
};

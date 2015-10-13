module.exports = function(grunt){

	// Project configuration.
	grunt.initConfig({
		jasmine:{
			src: ['vendor/js/d3.min.js', 'vendor/js/jquery.min.js', 'build/js/d2b.min.js'],
			options:{
				specs: 'spec/d2b/**/*.js'
			}
		},
	  sass: {
	    dist: {
	      files: {
	        'build/css/d2b.css': 'build/css/d2b.scss',
	      }
	    }
	  },
	  uglify: {
	    dest: {
		    options: {
		      stripBanners: true,
		      banner: '/* Copyright © 2013-<%= grunt.template.today("yyyy") %> Academic Dashboards, All Rights Reserved. */',
		      mangle: true
		    },
	      files: {
	        'build/js/d2b.min.js': ['build/js/d2b.js']
	      }
	    }
	  },
		cssmin: {
		  target: {
		    files: [{
		      expand: true,
		      cwd: 'build/css',
		      src: ['d2b.css'],
		      dest: 'build/css',
		      ext: '.min.css'
		    }]
		  }
		},
	  concat: {
	    vendor: {
	      src: ['vendor/js/d3.min.js', 'vendor/js/jquery.min.js'],
	      dest: 'vendor/js/vendor.js',
	    },
	    js: {
	      src: ['src/js/init.js',
							'src/js/constants.js',
							'src/js/**/*.js'],
	      dest: 'build/js/d2b.js',
	    },
	    css: {
	      src: ['src/css/init.scss',
							'src/css/utils.scss',
							'src/css/**/*.scss'],
	      dest: 'build/css/d2b.scss',
	    },
	  },
		watch: {
			livereload:{
				options:{
					livereload: 1337
				},
				files: []
			},
		  vendor: {
		    files: ['vendor/**/*.js'],
		    tasks: ['concat:vendor'],
		    options: {
		      spawn: false,
		    },
		  },
		  js: {
		    files: ['src/js/**/*.js'],
		    tasks: ['concat:css','sass','concat:js','uglify', 'cssmin', 'jasmine'],
		    options: {
		      spawn: false,
		    },
		  },
		  css: {
		    files: ['src/css/**/*.scss'],
		    tasks: ['concat:css','sass','concat:js','uglify', 'cssmin', 'jasmine'],
		    options: {
		      spawn: false,
		    },
		  },
			spec: {
				files: ['spec/d2b/**/*.js'],
				tasks: ['jasmine']
			}
		},
		connect: {
			server: {
				options: {
					livereload:1337,
					port: 9000,
					base: '.',
					open: {
						target: 'http://localhost:9000/'
					}
				}
			}
		},
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-jasmine');
	grunt.registerTask('default',['concat','sass','uglify', 'cssmin','connect', 'jasmine', 'watch']);
};

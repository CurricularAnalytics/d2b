module.exports = function(grunt){

	// Project configuration.
	grunt.initConfig({
	  sass: {                              // Task
	    dist: {                            // Target
	      // options: {                       // Target options
	      //   style: 'expanded'
	      // },
	      files: {                         // Dictionary of files
	        'build/css/ad.css': 'build/css/ad.scss',       // 'destination': 'source'
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
	        'build/js/ad.min.js': ['build/js/ad.js']
	      }
	    }
	  },
	  concat: {
	    vendor: {
	      src: ['bower_components/d3/d3.min.js'],
	      dest: 'vendor/js/vendor.js',
	    },
	    js: {
	      src: ['js/init.js','js/constants.js',
							'js/utils/chart-adapter.js',
							'js/utils/chart-page.js',
							'js/utils/controls.js',
							'js/utils/general.js',
							'js/utils/legends.js',
							'js/utils/breadcrumbs.js',
							'js/charts/sunburst-chart.js',
							'js/charts/axis-chart.js',
							'js/charts/sankey-chart.js',
							'js/charts/pie-chart.js',
							'js/charts/interactive-bar-chart.js',
							'js/charts/iframe-chart.js',
							'js/dashboards/dashboard.js',
							'js/d3_extensions/sankey.js'],
	      dest: 'build/js/ad.js',
	    },
	    css: {
	      src: ['css/init.scss','css/utils.scss',
							'css/charts/axis-chart.scss',
							'css/charts/sankey-chart.scss',
							'css/charts/pie-chart.scss',
							'css/charts/interactive-bar-chart.scss',
							'css/charts/iframe-chart.scss',
							'css/charts/sunburst-chart.scss',
							'css/charts/general.scss',
							'css/dashboards/dashboard.scss'],
	      dest: 'build/css/ad.scss',
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
		    files: ['js/**/*.js'],
		    tasks: ['concat:css','sass','concat:js','uglify'],
		    options: {
		      spawn: false,
		    },
		  },
		  css: {
		    files: ['css/**/*.scss'],
		    tasks: ['concat:css','sass','concat:js','uglify'],
		    options: {
		      spawn: false,
		    },
		  },
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
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.registerTask('default',['concat','sass','uglify','connect','watch']);
};

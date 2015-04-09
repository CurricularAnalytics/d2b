module.exports = function(grunt){

	// Project configuration.
	grunt.initConfig({
	  sass: {                              // Task
	    dist: {                            // Target
	      // options: {                       // Target options
	      //   style: 'expanded'
	      // },
	      files: {                         // Dictionary of files
	        'build/css/d2b.css': 'build/css/d2b.scss',       // 'destination': 'source'
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
	      src: ['bower_components/d3/d3.min.js'],
	      dest: 'vendor/js/vendor.js',
	    },
	    js: {
	      src: ['js/init.js',
							'js/constants.js',
							'js/utils/chart-adapters.js',
							'js/utils/chart-page.js',
							'js/utils/chart-layout.js',
							'js/utils/dashboard-category.js',
							'js/utils/controls.js',
							'js/utils/general.js',
							'js/utils/legends.js',
							'js/utils/breadcrumbs.js',
							'js/utils/chart-members.js',
							'js/utils/chart-helpers.js',
							'js/charts/sunburst-chart.js',
							'js/charts/bubble-chart.js',
							'js/charts/axis-chart.js',
							'js/charts/sankey-chart.js',
							'js/charts/pie-chart.js',
							'js/charts/interactive-bar-chart.js',
							'js/charts/guage-chart.js',
							'js/charts/iframe-chart.js',
							'js/charts/multi-chart.js',
							'js/charts/template-chart.js',
							'js/utils/axis-chart/scatter.js',
							'js/utils/axis-chart/bar.js',
							'js/utils/axis-chart/line.js',
							'js/utils/axis-chart/area.js',
							'js/utils/axis-chart/histogram.js',
							'js/utils/axis-chart/bubble-pack.js',
							'js/utils/axis-chart/template.js',
							'js/dashboards/dashboard.js',
							'js/d3_extensions/sankey.js',
							'js/d3_extensions/colorbrewer.js'],
	      dest: 'build/js/d2b.js',
	    },
	    css: {
	      src: ['css/init.scss','css/utils.scss',
							'css/charts/axis-chart.scss',
							'css/charts/sankey-chart.scss',
							'css/charts/pie-chart.scss',
							'css/charts/interactive-bar-chart.scss',
							'css/charts/guage-chart.scss',
							'css/charts/iframe-chart.scss',
							'css/charts/multi-chart.scss',
							'css/charts/sunburst-chart.scss',
							'css/charts/bubble-chart.scss',
							'css/charts/general.scss',
							'css/dashboards/dashboard.scss',
							'css/utils/dashboard-category.scss',
							'css/utils/chart-page.scss',
							'css/utils/legend.scss'],
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
		    files: ['js/**/*.js'],
		    tasks: ['concat:css','sass','concat:js','uglify', 'cssmin'],
		    options: {
		      spawn: false,
		    },
		  },
		  css: {
		    files: ['css/**/*.scss'],
		    tasks: ['concat:css','sass','concat:js','uglify', 'cssmin'],
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
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.registerTask('default',['concat','sass','uglify', 'cssmin','connect','watch']);
};

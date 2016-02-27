const gulp = require('gulp');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const sass = require('gulp-sass');
const babel = require('gulp-babel');
const order = require('gulp-order');
const rename = require('gulp-rename');
const connect = require('gulp-connect');

gulp.task('scripts', () => {
  gulp
    // source files
    .src([
      'wrap/start.js',
      'src/js/**/*.js',
      'wrap/end.js'
    ])
    // concat source files
    .pipe(concat('d2b.js'))
    // babelify concatenation
    .pipe(babel({
			presets: ['es2015']
		}))
    // write to d2b.js
    .pipe(gulp.dest('build/js'))
    // uglify es5 build
    .pipe(uglify())
    // write to d2b.min.js
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('build/js'));
});

gulp.task('vendor', () => {
  gulp
    .src([
      'bower_components/d3/d3.min.js',
      'bower_components/jquery/dist/jquery.min.js'
    ])
    // concat source files
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest('vendor/js'));
});

gulp.task('connect', () => {
  connect.server({
    port: 9000
  });
});

gulp.task('watch', () => {
  gulp.watch([
    'wrap/start.js',
    'src/js/**/*.js',
    'wrap/end.js'
  ], ['scripts']);
});

gulp.task('default', ['watch', 'scripts', 'connect']);

const gulp = require('gulp');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');
const order = require('gulp-order');
const rename = require('gulp-rename');
const connect = require('gulp-connect');
const sass = require('gulp-sass');
const cleanCSS = require('gulp-clean-css');

gulp.task('scripts', function () {
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
      compact: false,
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

gulp.task('styles', function () {
  gulp
    // source files
    .src([
      'src/css/init.scss',
      'src/css/**/*.scss'
    ])
    // concat source files
    .pipe(concat('d2b.scss'))
    .pipe(gulp.dest('build/css'))
    // sass compile
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('build/css'))
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(gulp.dest('build/css'))
    // write to d2b.css.js
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('build/css'));
});

gulp.task('vendor', function () {
  gulp
    .src([
      'bower_components/d3/d3.min.js',
      'bower_components/jquery/dist/jquery.min.js'
    ])
    // concat source files
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest('vendor/js'));
});

gulp.task('connect', function () {
  connect.server({
    port: 9000
  });
});

gulp.task('watch', function () {
  gulp.watch([
    'wrap/$$.js',
    'src/js/**/*.js'
  ], ['scripts']);
  gulp.watch([
    'src/css/**/*.scss'
  ], ['styles']);
});

gulp.task('default', ['watch', 'scripts', 'styles', 'connect']);

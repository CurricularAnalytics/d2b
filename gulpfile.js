const gulp = require('gulp');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const connect = require('gulp-connect');
const sass = require('gulp-sass');
const cleanCSS = require('gulp-clean-css');
// const babel = require('gulp-babel'); // instead of babel run node script
// const rollup = require('gulp-rollup'); // instead of rollup run node script
const exec = require('child_process').exec;

gulp.task('scripts', function () {

  // rollup all es6 and bablify code first
  exec('node bin/rollup', function (error, stdout, stderr) {
    console.error(stderr);

    // then uglify
    gulp
      .src('build/d2b.js')
      .pipe(uglify())
      .pipe(rename({
        suffix: '.min'
      }))
      .pipe(gulp.dest('build'));
  });

});

gulp.task('styles', function () {
  gulp
    .src('index.scss')
    .pipe(sass())
    .pipe(rename({
      basename: 'd2b'
    }))
    .pipe(gulp.dest('build'))
    .pipe(cleanCSS())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('build'));
});

gulp.task('connect', function () {
  connect.server({
    port: 9000
  });
});

gulp.task('watch', function () {
  gulp.watch(['index.js', 'src/js/**/*.js'], ['scripts']);
  gulp.watch(['index.scss', 'src/css/**/*.scss'], ['styles']);
});

gulp.task('default', ['watch', 'scripts', 'styles', 'connect']);

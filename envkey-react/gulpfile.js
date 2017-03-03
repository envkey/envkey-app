var gulp = require('gulp'),
    preprocess = require('gulp-preprocess'),
    runSequence = require('run-sequence'),
    refresh = require('gulp-refresh'),
    del = require('del'),
    babel = require('gulp-babel'),
    sourcemaps = require('gulp-sourcemaps'),
    webpack = require('webpack-stream'),
    webpackConfig = require('./webpack.config.js'),
    dotenv = require('dotenv'),
    jasmine = require('gulp-jasmine'),
    reporters = require('jasmine-reporters');

if(process.env.NODE_ENV == "development")dotenv.config(); // pull in env vars

var buildDir = process.env.NODE_ENV == "production" ? "build" : "build_dev";

// SERVER

gulp.task('dev', function(cb){
  spawn = require( 'child_process' ).spawnSync;
  runSequence(
    'webpack',
    'watch',
    cb
  );
});

gulp.task('prod', function(cb){
  runSequence(
    'build',
    cb
  );
});


// Common babel settings for dev/prod builds
var babelSrc = 'src/**/*.js',
    babelConfig = {presets: ['es2015', 'react']},
    babelDest = buildDir + "/app";


gulp.task('build', function(cb){
  return runSequence(
    'clean-build',
    (process.env.NODE_ENV == 'production' ? 'babel-compile-prod' : 'babel-compile-dev'),
    cb
  );
});

gulp.task('babel-compile-dev', function(){
  var stream =  gulp.src(babelSrc)
                     .pipe(babel(babelConfig))
                     .pipe(gulp.dest(babelDest));
  return stream
});

gulp.task('babel-compile-prod', function(){
  //No source maps for prod
  return gulp.src(babelSrc)
             .pipe(babel(babelConfig))
             .pipe(gulp.dest(babelDest));
});

gulp.task('clean-build', function(){
  del.sync([buildDir + '/app']);
});


// FRONT END

gulp.task('webpack-and-copy-js', function(){
  return runSequence('webpack', 'copy-js');
})

gulp.task('webpack', function() {
  return gulp.src(['src/**/*.js'])
             .pipe(webpack(webpackConfig))
             .pipe(gulp.dest(buildDir + '/public/'));
});

gulp.task('copy-js', function(){
  return gulp.src([buildDir + "/public/*"])
             .pipe(gulp.dest("../public/"));
});

// WATCH

gulp.task('watch', function(){
  gulp.watch(['src/**/*'], ['build', 'webpack']);
});


// SPECS

gulp.task('build-specs', function(cb){
  runSequence(
    'clean-specs',
    'babel-compile-specs',
    cb
  )
});

gulp.task('clean-specs', function(){
  del.sync([buildDir + '/specs']);
})

gulp.task('babel-compile-specs', ['babel-compile-dev'], function(){
  return gulp.src('spec/**/*.js')
             .pipe(sourcemaps.init())
             .pipe(babel(babelConfig))
             .pipe(sourcemaps.write())
             .pipe(gulp.dest(buildDir + "/spec"));
});

gulp.task('spec-verbose', ['copy-jade-views', 'build-specs'], function() {
  return gulp.src([buildDir + '/app/app_path.js',
                   buildDir + '/spec/**/*.js'])
             .pipe(preprocess({context: {NODE_ENV: "test"}}))
             .pipe(jasmine({
                reporter: new reporters.TerminalReporter({
                    color: true,
                    includeStackTrace: true,
                    verbosity: 10
                })
              }));
});

gulp.task('spec', ['build-specs'], function() {
  return gulp.src([buildDir + '/app/app_path.js',
                   buildDir + '/spec/**/*.js'])
             .pipe(preprocess({context: {NODE_ENV: "test"}}))
             .pipe(jasmine({
                reporter: new reporters.TerminalReporter({
                    color: true,
                    includeStackTrace: true,
                    verbosity: 1
                })
              }));
});



var gulp = require('gulp'),
    runSequence = require('run-sequence'),
    webpack = require('webpack-stream'),
    webpackConfig = require('./webpack.config.build.js')

// FRONT END

gulp.task('webpack', function() {
  return webpack(webpackConfig).pipe(gulp.dest('build/'))
})



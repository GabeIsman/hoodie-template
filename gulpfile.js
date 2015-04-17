var gulp = require('gulp');

var rename = require('gulp-rename');
var jshint = require('gulp-jshint');
var compass = require('gulp-compass');
var jade = require('gulp-jade');
var source = require('vinyl-source-stream');
var watchify = require('watchify');
var browserify = require('browserify');
var _ = require('underscore');
var notify = require('gulp-notify');


var DEST = 'www/';
var APP = 'src/';
var ASSETS = DEST + 'assets/';


gulp.task('lint', function() {
  gulp.src([APP + '/**/*.js', 'gulpfile.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});


// Monitor js files and rebuild dependency trees on change
gulp.task('bundlejs', function() {
  var bundler = watchify(browserify('./' + APP + 'js/main.js', watchify.args));

  bundler.on('update', rebundle);

  function rebundle() {
    return bundler.bundle()
      .on('error', notify.onError("JS error: <%= error.message %>"))
      .pipe(source('main.js'))
      .pipe(gulp.dest(ASSETS + 'js/'));
  }

  return rebundle();
});

// Monitor less and main jade template for changes
gulp.task('watch', ['bundlejs'], function() {
  gulp.watch(APP + '/css/**', ['styles']);
  gulp.watch(APP + '/templates/*.jade', ['html']);
});

// Render jade template to html
gulp.task('html', function() {
  gulp.src(APP + '/templates/index.jade')
    .pipe(jade({
      pretty: true
    }))
    .pipe(gulp.dest(DEST))
    .on("error", notify.onError("Html error: <%= error.message %>"));
});

// Watch less files for changes and compile to css
gulp.task('styles', function() {
  gulp.src(APP + '/css/**/*.scss')
    .pipe(compass({
      sass: APP + 'css/',
      css: ASSETS + 'css/',
      image: ASSETS + 'images/',
      font: ASSETS + 'fonts/'
    }))
    .pipe(gulp.dest(ASSETS + 'css/'))
    .on("error", notify.onError("Styles error: <%= error.message %>"));
});

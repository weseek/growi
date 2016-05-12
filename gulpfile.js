'use strict';

var gulp   = require('gulp');
var sass   = require('gulp-sass');
var cssmin = require('gulp-cssmin');
var mocha  = require('gulp-spawn-mocha');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var jshint = require('gulp-jshint');
var source = require('vinyl-source-stream');
var webpack = require('webpack-stream');

var del     = require('del');
var stylish = require('jshint-stylish');

var pkg = require('./package.json');


var dirs = {
  cssSrc: './resource/css',
  cssDist: './public/css',
  jsSrc: './resource/js',
  jsDist: './public/js',
};

var tests = {
  watch: ['test/**/*.test.js'],
}

var css = {
  src: dirs.cssSrc + '/' + pkg.name + '.scss',
  main: dirs.cssDist + '/crowi-main.css',
  dist: dirs.cssDist + '/crowi.css',
  revealSrc: dirs.cssSrc + '/' + pkg.name + '-reveal.scss',
  revealDist: dirs.cssDist + '/crowi-reveal.css',
  watch: ['resource/css/*.scss'],
};

var js = {
  bundledSrc: [
    'node_modules/jquery/dist/jquery.js',
    'node_modules/bootstrap-sass/assets/javascripts/bootstrap.js',
    'node_modules/inline-attachment/src/inline-attachment.js',
    'node_modules/jquery.cookie/jquery.cookie.js',
    'resource/thirdparty-js/jquery.selection.js',
  ],
  src:          dirs.jsSrc  + '/app.js',

  bundled:      dirs.jsDist + '/bundled.js',
  dist:         dirs.jsDist + '/crowi.js',
  admin:        dirs.jsDist + '/admin.js',
  form:         dirs.jsDist + '/form.js',
  presentation: dirs.jsDist + '/presentation.js',
  app:          dirs.jsDist + '/app.js',

  clientWatch: ['resource/js/**/*.js'],
  watch: ['test/**/*.test.js', 'app.js', 'lib/**/*.js'],
  lint: ['app.js', 'lib/**/*.js'],
  tests: tests.watch,
};

var cssIncludePaths = [
  'node_modules/bootstrap-sass/assets/stylesheets',
  'node_modules/font-awesome/scss',
  'node_modules/reveal.js/css'
];

gulp.task('js:del', function() {
  var fileList = [
    js.dist,
    js.bundled,
    js.admin,
    js.form,
    js.presentation,
    js.app,
  ];
  fileList = fileList.concat(fileList.map(function(fn){ return fn.replace(/\.js/, '.min.js');}));
  return del(fileList);
});

gulp.task('js:concat', ['js:del'], function() {
  return gulp.src(js.bundledSrc)
    .pipe(concat('bundled.js')) // jQuery
    .pipe(gulp.dest(dirs.jsDist));
});

// move task for css and js to webpack over time.
gulp.task('webpack', ['js:concat'], function() {
  return gulp.src(js.src)
    .pipe(webpack(require('./webpack.config.js')))
    .pipe(gulp.dest(dirs.jsDist));
});

gulp.task('js:min', ['webpack'], function() {
  var fileList = [
    js.dist,
    js.bundled,
    js.admin,
    js.form,
    js.presentation,
    js.app,
  ];

  fileList.forEach(function(jsfile) {
    gulp.src(jsfile)
      .pipe(uglify())
      .pipe(rename({suffix: '.min'}))
      .pipe(gulp.dest(dirs.jsDist));
  });
});

gulp.task('jshint', function() {
  return gulp.src(js.lint)
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
});

gulp.task('test', function() {
  return gulp.src(js.tests)
    .pipe(mocha({
      r: 'test/bootstrap.js',
      globals: ['chai'],
      R: 'dot',
    }));
});

gulp.task('css:sass', function() {
  gulp.src(css.revealSrc) // reveal
    .pipe(sass({
        outputStyle: 'nesed',
        sourceComments: 'map',
        includePaths: cssIncludePaths
    }).on('error', sass.logError))
    .pipe(gulp.dest(dirs.cssDist));

  return gulp.src(css.src)
    .pipe(sass({
        outputStyle: 'nesed',
        sourceComments: 'map',
        includePaths: cssIncludePaths
    }).on('error', sass.logError))
    .pipe(rename({suffix: '-main'})) // create -main.css to prepare concating with highlight.js's css
    .pipe(gulp.dest(dirs.cssDist));
});

gulp.task('css:concat', ['css:sass'], function() {
  return gulp.src([css.main, 'node_modules/highlight.js/styles/tomorrow-night.css'])
    .pipe(concat('crowi.css'))
    .pipe(gulp.dest(dirs.cssDist))
});

gulp.task('css:min', ['css:concat'], function() {
  gulp.src(css.revealDist)
    .pipe(cssmin())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest(dirs.cssDist));

  return gulp.src(css.dist)
    .pipe(cssmin())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest(dirs.cssDist));
});

gulp.task('watch', function() {
  var watchLogger = function(event) {
    console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
  };

  var cssWatcher = gulp.watch(css.watch, ['css:concat']);
  cssWatcher.on('change', watchLogger);
  var jsWatcher = gulp.watch(js.clientWatch, ['webpack']);
  jsWatcher.on('change', watchLogger);
  var testWatcher = gulp.watch(js.watch, ['test']);
  testWatcher.on('change', watchLogger);
});

gulp.task('css', ['css:sass', 'css:concat',]);
gulp.task('default', ['css:min', 'js:min',]);
gulp.task('dev', ['css:concat', 'webpack', 'jshint', 'test']);

var gulp = require('gulp');
var less = require('gulp-less');
var path = require('path');
var uglify = require('gulp-uglify');
var fs = require("fs");
var replace = require("gulp-replace");
var htmlmin = require('gulp-htmlmin');
var cssmin = require('gulp-cssmin');

var source = "./src";
var target = "./target";

var code = "text";

gulp.task('default', ['dev']);

gulp.task('dev', ['itask-pre'], function() {
  var src = source+"/"+code;
  var trg = target+"/"+code;
  var layout = fs.readFileSync(trg+"/layout.html");
  var style = fs.readFileSync(trg+"/style.css");
  return gulp.src(src+'/script.js')
      .pipe(replace(/prototype\.layout(.*)###layout/g, 'prototype.layout = \'<style>'+style+'</style>'+layout+'\';//###layout'))
      .pipe(gulp.dest(src));
});

gulp.task('prod', ['itask-pre'], function() {
  var src = source+"/"+code;
  var trg = target+"/"+code;
  var layout = fs.readFileSync(trg+"/layout.html");
  var style = fs.readFileSync(trg+"/style.css");
  return gulp.src(src+'/script.js')
      .pipe(replace(/prototype\.layout(.*)###layout/g, 'prototype.layout = \'<style>'+style+'</style>'+layout+'\';//###layout'))
      .pipe(replace(/\/\/#!/g, 'if(!window.location.hostname.endsWith("ipo.spb.ru")){return;}'))
      .pipe(uglify())
      .pipe(gulp.dest(trg));
});


gulp.task('itask-pre', ['layout', 'style']);

gulp.task('style', function() {
  var src = source+"/"+code;
  var trg = target+"/"+code;
  return gulp.src(src+"/style.less")
      .pipe(less({
        paths: [ path.join(__dirname, 'less', 'includes') ]
      }))
      .pipe(cssmin())
      .pipe(gulp.dest(trg));
});

gulp.task('layout', function() {
  var src = source+"/"+code;
  var trg = target+"/"+code;
  return gulp.src(src+"/layout.html")
      .pipe(htmlmin({collapseWhitespace: true}))
      .pipe(gulp.dest(trg));
});



gulp.task('common', ['core-js', 'index-html']);

gulp.task('core-js', ['taskManager', 'guiUtils']);

gulp.task('taskManager', function() {
  return gulp.src(source+'/core/taskManager.js')
      .pipe(uglify())
      .pipe(gulp.dest(target+'/core'));
});

gulp.task('guiUtils', function() {
  return gulp.src(source+'/core/guiUtils.js')
      .pipe(uglify())
      .pipe(gulp.dest(target+'/core'));
});

gulp.task('index-html', function() {
  return gulp.src(source+'/index.html')
      .pipe(gulp.dest(target));
});
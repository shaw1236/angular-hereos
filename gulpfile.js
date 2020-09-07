'use strict';

/**
 * Module dependencies.
 */
const gulp = require('gulp');
const path = require("path");

const connect = require('gulp-connect-pm2');
const exec    = require('child_process').exec;

gulp.task('server:ts', function(cb) {
  exec('ts-node api/server.ts', function(err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
})

gulp.task('server:js', function(cb) {
  exec('node api/serverApi.js', function(err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
})

gulp.task('server:go:local', function(cb) {
  exec('api\\server.exe', function(err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
})

gulp.task('server:go', function(cb) {
  exec('api/server', function(err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
})

gulp.task('server:py', function(cb) {
  exec('python api/server.py', function(err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
})

gulp.task('mongo.js', function(cb) {
  exec('node api/mongo.js', function(err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
})

gulp.task('connect', function(done) {
  connect.server({
		port: 8080
  });
  done();
});
 
gulp.task('stop', function(cb) {
  exec('sudo pm2 stop all', function(err, stdout, stderr) {});
  console.log(stdout);
  console.log(stderr);
  cb(err);
});

// Run the project in development mode with node debugger enabled
gulp.task('default', gulp.series('server:ts', 'connect'));

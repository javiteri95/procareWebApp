var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var browserSync = require('browser-sync').create();
const babel = require('gulp-babel');
var browserify = require('gulp-browserify');
var runSequence = require('run-sequence');

gulp.task('default', ['browser-sync'], function(){

});

gulp.task('browser-sync', ['nodemon'], function(){
	browserSync.init(null, {
		proxy: "http://localhost",
    files: ["public/**/*.*"],
    browser: "default",
    port: 3001,
	});
});

gulp.task('nodemon', function(cb){
	var started = false;

	return nodemon({
		script: './bin/www'
	})
	.on('start', function(){
		if(!started){
			cb();
			started = true;
		}
	})
});

gulp.task('babel', function(){
	console.log('Convirtiendo a es5');
	var dist = './public/dist/';
	return gulp.src('./public/js/*/*')
				.pipe(babel({
					presets: ['es2015']
				}))
				.pipe(gulp.dest(dist));
});

gulp.task('vueify', function(){
	console.log('Vueify');
	//var src = './public/js/grupo/crearGrupoScript.js'
	//var build = './build/grupo/bundle.js'
	var src = './public/dist/**/*.js'
	var build = './public/build/'
	gulp.src(src, { read: false })
			.pipe(browserify({
				//debug: false,
				transform: ['vueify'],
			}))
			.pipe(gulp.dest(build));
});

gulp.task('build', function(){
	runSequence('babel', 'vueify');
});
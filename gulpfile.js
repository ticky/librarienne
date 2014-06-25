(function() {

	'use strict';

	var gulp = require('gulp'),
		clean = require('gulp-clean'),
		sass = require('gulp-ruby-sass'),
		zip = require('gulp-zip'),
		theme = require('./package');

	function buildTheme(name) {

		if (typeof name !== 'string') {
			name = 'Classic';
		}

		[
			gulp.src([
				'./readme.md',
				'./copyright.txt',
				'./src/scripts.js'
			]),
			gulp.src('./src/scss/design.scss')
				.pipe(sass({
					loadPath: ['./src/themes/' + name + '/scss/']
				}))
		].forEach(function(item) {
			item.pipe(gulp.dest('./build/' + theme.title + ' (' + name + ')/'));
		});

		gulp.src([
			'./src/Data/**/*',
			'./src/themes/' + name + '/Data/**/*'
		]).pipe(gulp.dest('./build/' + theme.title + ' (' + name + ')/Data/'));

	}

	gulp.task('clean', function() {
		gulp.src('./build/**/*', {read: false})
			.pipe(clean())
	});

	gulp.task('classic', function() {
		buildTheme('Classic');
	});

	gulp.task('nox', function() {
		buildTheme('Nox');
	});

	gulp.task('default', function() {
		gulp.start('classic', 'nox');
	});

	gulp.task('zip', ['classic', 'nox'], function() {
		gulp.src('./build/**/*')
			.pipe(zip(theme.title + ' ' + theme.version + '.zip'))
			.pipe(gulp.dest('./dist/'))
	});

}());

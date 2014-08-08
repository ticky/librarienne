(function() {

	'use strict';

	var gulp = require('gulp'),
		clean = require('gulp-clean'),
		minify = require('gulp-minify-html'),
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
					loadPath: ['./src/themes/' + name + '/scss/'],
					style: 'compressed'
				}))
		].forEach(function(item) {
			item.pipe(gulp.dest('./build/' + theme.title + ' (' + name + ')/'));
		});

		gulp.src([
			'./src/Data/Settings/*',
			'./src/themes/' + name + '/Data/Settings/*'
		]).pipe(gulp.dest('./build/' + theme.title + ' (' + name + ')/Data/Settings/'));

		gulp.src([
			'./src/Data/Templates/**/*.mustache',
			'./src/themes/' + name + '/Data/Templates/**/*.mustache'
		])
		.pipe(minify({
			quotes: true // disable removing quotes
		}))
		.pipe(gulp.dest('./build/' + theme.title + ' (' + name + ')/Data/Templates/'));

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

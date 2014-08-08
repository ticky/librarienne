(function() {

	'use strict';

	var gulp = require('gulp'),
		clean = require('gulp-clean'),
		glob = require('glob'),
		minify = require('gulp-minify-html'),
		path = require('path'),
		sass = require('gulp-ruby-sass'),
		zip = require('gulp-zip'),
		theme = require('./package');

	gulp.task('default', function() {
	
		glob.sync('./src/variants/*')
		.forEach(function(dir) {

			var variant = path.basename(dir);

			[
				gulp.src([
					'./readme.md',
					'./copyright.txt',
					'./src/scripts.js'
				]),
				gulp.src('./src/scss/design.scss')
				.pipe(
					sass({
						loadPath: ['./src/variants/' + variant + '/scss/'],
						style: 'compressed'
					})
				)
			]
			.forEach(function(item) {
				item.pipe(
					gulp.dest('./build/' + theme.title + ' (' + variant + ')/')
				);
			});

			gulp.src([
				'./src/Data/Settings/*',
				'./src/variants/' + variant + '/Data/Settings/*'
			])
			.pipe(
				gulp.dest('./build/' + theme.title + ' (' + variant + ')/Data/Settings/')
			);

			gulp.src([
				'./src/Data/Templates/**/*.mustache',
				'./src/variants/' + variant + '/Data/Templates/**/*.mustache'
			])
			.pipe(
				minify({
					quotes: true // disable removing quotes
				})
			)
			.pipe(
				gulp.dest('./build/' + theme.title + ' (' + variant + ')/Data/Templates/')
			);

		});

	});

	gulp.task('clean', function() {
		gulp.src('./build/**/*', {read: false})
		.pipe(clean())
	});

	gulp.task('zip', ['default'], function() {

		gulp.src('./build/**/*')
		.pipe(
			zip(theme.title + ' ' + theme.version + '.zip')
		)
		.pipe(
			gulp.dest('./dist/')
		)

	});

}());

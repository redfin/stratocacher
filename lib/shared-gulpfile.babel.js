const babel = require('gulp-babel');
const del = require('del');
const gulp = require('gulp');
const nsp = require('gulp-nsp');
const path = require('path');
const eslint = require('gulp-eslint');
const jasmine = require('gulp-jasmine');
const meow = require('meow');

const cli = meow(`
	Usage
	  $ gulp (compile|clean|test|jasmine|eslint)

	Options
	  -v, --verbose  More output
`, {
	alias: {
		v: 'verbose',
	},
});

gulp.task('nsp', (cb) => nsp({package: path.resolve('package.json')}, cb));

gulp.task('compile', () => {
	gulp.src(["src/**/*.js"])
		.pipe(babel())
		.pipe(gulp.dest("./lib"));
});

gulp.task('clean', () => {
	del(["lib/**/*.js", "lib"]).then(paths => {
		console.log('Deleted files and folders:\n\t'+paths.join('\n\t'))
	})
});

gulp.task('eslint', [], function() {
	return gulp.src("src/**/*.js")
		.pipe(eslint())
		.pipe(eslint.format())
		.pipe(eslint.failAfterError());
});

gulp.task('jasmine', ['compile'], () => {

	const opts = cli.flags.verbose ? {
		verbose           : true,
		includeStackTrace : true,
	} : {}

	return gulp.src("test/**/*.js")
		.pipe(jasmine(opts));
});

gulp.task('prepublish', ['nsp', 'compile']);
gulp.task('test', ['eslint', 'jasmine']);

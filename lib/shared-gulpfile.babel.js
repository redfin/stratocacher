const babel = require('gulp-babel');
const del = require('del');
const gulp = require('gulp');
const path = require('path');
const eslint = require('gulp-eslint');
const jasmine = require('gulp-jasmine');
const matcha = require('gulp-matcha');
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

gulp.task('compile', () => gulp.src(["src/**/*.js"])
	.pipe(babel())
	.pipe(gulp.dest("./lib"))
);

gulp.task('clean', () => {
	del(["lib/**/*.js", "lib"]).then(paths => {
		console.log('Deleted files and folders:\n\t'+paths.join('\n\t'))
	})
});

gulp.task('eslint', [], () =>  gulp.src("src/**/*.js")
	.pipe(eslint())
	.pipe(eslint.format())
	.pipe(eslint.failAfterError())
);

gulp.task('jasmine', ['compile'], () => {

	const opts = cli.flags.verbose ? {
		verbose           : true,
		includeStackTrace : true,
	} : {}

	return gulp.src("test/**/*.js")
		.pipe(jasmine(opts));
});

gulp.task('bench', ['compile'], () => gulp.src("bench/**/*.js", {read:false})
	.pipe(matcha())
);

gulp.task('prepublish', ['compile']);
gulp.task('test', ['eslint', 'jasmine']);

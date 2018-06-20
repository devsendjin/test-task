'use strict';

const gulp = require('gulp');
const del = require('del');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const cleanCss = require('gulp-clean-css');
const notify = require('gulp-notify');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync').create();
const spritesmith = require('gulp.spritesmith');
const magicImporter = require('node-sass-magic-importer');

//---------------Remove build path---------------//
gulp.task('clean', () => {
    return del([
        'build/'
    ]);
});

//---------------Delete only img path---------------//
gulp.task('clean:img', () => {
    return del([
        'build/img'
    ]);
});

//---------------Convert to css---------------//
gulp.task('scss', () => {
    return gulp.src('source/scss/style.scss')
        .on('error', notify.onError(error => {
            return {
                title: 'Style',
                message: error.message
            }
        }))
        .pipe(sourcemaps.init())
        .pipe(sass({
            outputStyle: 'expanded',
            importer: magicImporter()
        }).on('error', sass.logError))
        .pipe(cleanCss({level: {1: {specialComments: 0}}}))
        .pipe(autoprefixer({
            browsers: [
                'last 1 version'
            ]
        }))
        .pipe(rename('style.min.css'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('build/css'))
});

//---------------Copy img to build path---------------//
gulp.task('copy:img', () => {
    return gulp.src('source/img/**/*')
        .pipe(gulp.dest('build/img'))
});

/* ------------ Copy fonts ------------- */
gulp.task('copy:fonts', function () {
    return gulp.src('source/fonts/**/*.*')
        .pipe(gulp.dest('build/fonts'));
});

//---------------Browsersync init---------------//
gulp.task('serve', () => {
    browserSync.init({
        server: {
            baseDir: "build"
        },
        notify: false,
        open: true
    });
    browserSync.watch('build', browserSync.reload);
});

//---------------Copy html template to build path---------------//
gulp.task('html', () => {
    return gulp.src('source/*.html')
        .on('error', notify.onError(error => {
            return {
                title: 'html',
                message: error.message
            }
        }))
        .pipe(gulp.dest('build'));
});

//---------------Sprite---------------//
gulp.task('sprite', function () {
    const spriteData = gulp.src('source/img/icons/*.png').pipe(spritesmith({
        imgName: 'sprite.png',
        imgPath: '../img/sprite.png',
        padding: 15,
        cssName: '_sprite.scss'
    }));
    return spriteData.img.pipe(gulp.dest('source/img/')),
        spriteData.css.pipe(gulp.dest('source/scss/'));
});

//---------------Watchers---------------//
gulp.task('watch', () => {
    gulp.watch('source/scss/**/*.scss', gulp.series('scss'));
    gulp.watch('source/*.html', gulp.series('html'));
    gulp.watch('source/img/*', gulp.series('clean:img', 'copy:img'));
});

//---------------Gulp default---------------//
gulp.task('default', gulp.series(
    'clean',
    gulp.parallel(
        'sprite',
        'html',
        'scss',
        'copy:fonts',
        'copy:img'
    ),
    gulp.parallel(
        'watch',
        'serve'
    )
));

gulp.task('build', gulp.series(
    'clean',
    gulp.parallel(
        'sprite',
        'html',
        'scss',
        'copy:fonts',
        'copy:img'
    )
));
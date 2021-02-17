// plugins
const gulp = require('gulp');
const del = require('del');
const htmlmin = require('gulp-htmlmin');
const minifyCss = require('gulp-clean-css');
const plumber = require('gulp-plumber');
const autoprefixer = require('gulp-autoprefixer');
const sass = require('gulp-sass');
sass.compiler = require('node-sass');
const concatCss = require('gulp-concat-css');
const jsmin = require('gulp-jsmin');


const paths = {
    css: {
      src: './src/css/**/*.css',
      dev: 'style.css',
      destDev: './src/css/',
      dest: './dist/css/',
    },
    js: {
      src: './src/js/**/*.js',
      dest: './dist/js/',
    },
    scss: {
      src: './src/css/style.scss',
      dest: './dist/css/style.scss',
      watch: './src/css/*.scss',
    },
    html: {
      src: './src/**/*.html',
      dest: './dist/',
    },
    img: {
      src: './src/img/**/*',
      dest: './dist/img/',
    },
    manifest: {
        src: './src/manifest.json',
        dest: './dist/',
    }
};

//DEV

function scssDev() {
    return (
      gulp
        .src(paths.scss.src)
        .pipe(plumber())
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(concatCss(paths.css.dev))
        .pipe(minifyCss())
        .pipe(gulp.dest(paths.css.destDev))
    )
}


function watchDev() {
    gulp.watch(paths.scss.watch, scssDev);
}

//Build

// clean dist
function clear() {
    return del(['./dist/']);
}

function html() {
    return (
      gulp
        .src(paths.html.src, { since: gulp.lastRun(html) })
        .pipe(plumber())
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest(paths.html.dest))
    );
}

function js() {
    return (
      gulp
        .src(paths.js.src, { since: gulp.lastRun(js) })
        .pipe(plumber())
        .pipe(jsmin())
        .pipe(gulp.dest(paths.js.dest))
    );
}

function css() {
    return (
      gulp
        .src(paths.scss.src, { since: gulp.lastRun(scssDev) })
        .pipe(plumber())
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(concatCss(paths.css.dev))
        .pipe(minifyCss())
        .pipe(gulp.dest(paths.css.dest))
    )
}
  
function images() {
    return (
      gulp
        .src(paths.img.src)
        .pipe(gulp.dest(paths.img.dest))
    );
}

function manifest() {
    return (
      gulp
        .src(paths.manifest.src)
        .pipe(gulp.dest(paths.manifest.dest))
    );
}

const build = gulp.series(clear, html, js, css, images, manifest);
const dev = gulp.series(watchDev);

exports.clear = clear;
exports.build = build;
exports.dev = dev;
exports.default = dev;
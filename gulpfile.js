/**
 * Frontend build.
 */

var gulp        = require('gulp');
var $           = require('gulp-load-plugins')();
var cp          = require('child_process');
var del         = require('del');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var reload      = browserSync.reload;

// Lint JavaScript
gulp.task('jshint', function () {
    return gulp.src(['js/**/*.js', '!js/vendor/*.js', '!js/plugins/*.js',  '!js/**/*.min.js'])
        .pipe(reload({stream: true, once: true}))
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish'))
        .pipe($.if(!browserSync.active, $.jshint.reporter('fail')))
});

// JavaScript
gulp.task('scripts', function () {
    return gulp.src(['js/**/*.js', '!js/vendor/*.js', '!js/main.min.js'])
        // Concatenate And Minify Scripts
        .pipe($.concat('main.js'))
        .pipe($.rename({suffix: '.min'}))
        .pipe($.uglify())
        .pipe(gulp.dest('_site/js'))
        .pipe(gulp.dest('js'))
        .pipe($.size({title: 'scripts'}));
});

// Optimize Images
gulp.task('images', function () {
    return gulp.src('img/**/*')
        .pipe($.imagemin({
            progressive: true,
            interlaced: true
        }))
        .pipe(gulp.dest('_site/img'))
        .pipe($.size({title: 'images'}));
});

// Compile and prefix Stylesheets.
gulp.task('styles', function () {

    var AUTOPREFIXER_BROWSERS = [
        '> 1%',
        'last 2 versions',
        'ie 9',
        'Firefox ESR',
        'Opera 12.1'
    ];

    return gulp.src('css/*.scss')
        .pipe($.changed('sass', {extension: '.scss'}))
        .pipe($.sass({
            precision: 10,
            onError: console.error.bind(console, 'Sass error:')
        }))
        .pipe($.autoprefixer({browsers: AUTOPREFIXER_BROWSERS}))
        .pipe(gulp.dest('_site/css'))
        .pipe(gulp.dest('css'))
        // Minify Styles
        .pipe($.if('*.css', $.csso()))
        .pipe($.rename({suffix: '.min'}))
        .pipe(gulp.dest('_site/css'))
        .pipe(gulp.dest('css'))
        .pipe($.size({title: 'styles'}));
});

// Jekyll Build.
gulp.task('jekyll', function (done) {

    var messages = {
        jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build'
    };

    browserSync.notify(messages.jekyllBuild);
    return cp.spawn('jekyll', ['build'], {stdio: 'inherit'})
        .on('close', done);
});

// Jekyll Re-Build
gulp.task('jekyll-rebuild', ['jekyll'], function () {
    reload();
});

// Jekyll Server
gulp.task('serve', ['jshint', 'jekyll', 'styles', 'scripts'], function() {
    browserSync({
        notify: false,
        browser: 'google chrome canary',
        server: ['_site']
    });

    // Watch Files For Changes & Reload
    gulp.watch(['_includes/*.html', '_layouts/*.html'], ['jekyll-rebuild']);
    gulp.watch(['*.{html,md}', '_posts/*'], ['jekyll-rebuild']);
    gulp.watch('css/**/*.scss', ['styles', reload]);
    gulp.watch('js/**/*.js', ['jshint', reload]);
    gulp.watch('js/**/*.js', ['scripts', reload]);
    gulp.watch('img/**/*', ['images', reload]);
});

// Clean Output Directory
gulp.task('clean', function (done) {
    require('del')(['_site', '.sass-cache'], done);
});

// Build Files
gulp.task('default', function (done) {
    runSequence('clean', ['jshint', 'jekyll', 'styles', 'scripts', 'images'], done);
});

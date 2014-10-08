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

var AUTOPREFIXER_BROWSERS = [
    'last 2 versions',
    'ie >= 8',
    'Firefox ESR',
    'Opera 12.1',
    'ff >= 30',
    'Chrome >= 34'
];

var messages = {
    jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build'
};

// JavaScript
gulp.task('js', function () {
    return gulp.src(['js/**/*.js', '!js/vendor/*.js', '!js/**/*.min.js'])
        .pipe(reload({stream: true, once: true}))
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish'))
        .pipe($.if(!browserSync.active, $.jshint.reporter('fail')))
        // Concatenate And Minify Scripts
        .pipe($.concat('app.js'))
        .pipe($.rename({suffix: '.min'}))
        .pipe($.uglify())
        .pipe(gulp.dest('_site/js'))
        .pipe(gulp.dest('js'))
        .pipe($.size({title: 'js'}));
});

// Compile Sass and prefix Styles
gulp.task('sass', function () {
    return gulp.src('_sass/*.scss')
        .pipe($.rubySass({
            style: 'expanded',
            precision: 10,
            'sourcemap=none': true
        }))
        .on('error', console.error.bind(console))
        .pipe($.autoprefixer({browsers: AUTOPREFIXER_BROWSERS}))
        .pipe(gulp.dest('_site/css'))
        .pipe(gulp.dest('css'))
        // Minify Styles
        .pipe($.if('*.css', $.csso()))
        .pipe($.rename({suffix: '.min'}))
        .pipe(gulp.dest('_site/css'))
        .pipe(gulp.dest('css'))
        .pipe($.size({title: 'css'}))
        .pipe(reload({stream:true}));
});

// Optimize Images
gulp.task('imgs', function () {
    return gulp.src('img/**/*')
        .pipe($.imagemin({
            progressive: true,
            interlaced: true
        }))
        .pipe(gulp.dest('_site/img'))
        .pipe(gulp.dest('img'))
        .pipe($.size({title: 'imgs'}));
});

// Jekyll Build.
gulp.task('jekyll', function (done) {
    browserSync.notify(messages.jekyllBuild);
    return cp.spawn('jekyll', ['build'], {stdio: 'inherit'})
        .on('close', done);
});

// Jekyll Re-Build
gulp.task('jekyll-rebuild', ['jekyll'], function () {
    reload();
});

// Jekyll Server
gulp.task('serve', ['js', 'sass', 'jekyll'], function() {
    browserSync({
        notify: false,
        server: ['_site']
    });

    // Watch Files For Changes & Reload
    gulp.watch('_sass/**/*.scss', ['sass']);
    gulp.watch('img/**/*', ['imgs', reload]);
    gulp.watch(['*.{html,md}', '_posts/*'], ['jekyll-rebuild']);
    gulp.watch(['_includes/*.html', '_layouts/*.html'], ['jekyll-rebuild']);
});

// Clean Output Directory
gulp.task('clean', function (done) {
    require('del')([
        '_site',
        '.sass-cache'
    ], done);
});

// Build Files & Serve, the Default Task
gulp.task('default', ['serve']);

// Build Files
gulp.task('build', function (done) {
    runSequence(
        'clean',
        ['js', 'sass', 'imgs'],
        'jekyll',
    done);
});

var gulp        = require('gulp');
var browserSync = require('browser-sync');
var sass        = require('gulp-sass');
var prefix      = require('gulp-autoprefixer');
var cp          = require('child_process');
var sourcemaps = require('gulp-sourcemaps');
var ngAnnotate = require('gulp-ng-annotate');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');


var historyApiFallback = require('connect-history-api-fallback');


var jekyll   = process.platform === 'win32' ? 'jekyll.bat' : 'jekyll';
var messages = {
    jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build'
};

/**
 * Build the Jekyll Site
 */
gulp.task('jekyll-build', function (done) {
    // browserSync.notify(messages.jekyllBuild);
    return cp.spawn( jekyll , ['build'], {stdio: 'inherit'})
        .on('close', done);
});

/**
 * Rebuild Jekyll & do page reload
 */
gulp.task('jekyll-rebuild', ['jekyll-build'], function () {
    browserSync.reload();
});

/**
 * Wait for jekyll-build, then launch the Server
 */
gulp.task('browser-sync', ['sass', 'jekyll-build'], function() {
    browserSync({
        server: {
            baseDir: '_site',
            middleware: [ historyApiFallback() ]
        },
        // port: 8081,
        notify: false
    });
});



/**
 * js tasks
*/

// gulp.task('js', function () {
//   gulp.src([
//     'application/app.js',
//     'application/controllers/*.js'
//   ])
//     .pipe(concat('application/application.js'))
//     .pipe(uglify())
//     .pipe(gulp.dest('.'));
//
// })

// gulp.task('js', function() {
//     var source = [
//       'application/app.js',
//       'application/config.js',
//       'application/services/*.js',
//       'application/controllers/*.js'
//     ];
//     return gulp.src(source)
//         .pipe(sourcemaps.init())
//         .pipe(concat('application/application.js', {newLine: ';'}))
//         // Annotate before uglify so the code get's min'd properly.
//         .pipe(ngAnnotate({
//             // true helps add where @ngInject is not used. It infers.
//             // Doesn't work with resolve, so we must be explicit there
//             add: true
//         }))
//         .pipe(uglify({mangle: true}))
//         .pipe(sourcemaps.write('./'))
//         .pipe(gulp.dest('.'));
// });


/**
 * Compile files from _scss into both _site/css (for live injecting) and site (for future jekyll builds)
 */
gulp.task('sass', function () {
    return gulp.src('assets/_scss/main.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({
            includePaths: ['scss'],
            onError: browserSync.notify
        }))
        .pipe(prefix(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('_site/assets/css'))
        .pipe(browserSync.reload({stream:true}))
        .pipe(gulp.dest('assets/css'));
});

/**
 * Watch scss files for changes & recompile
 * Watch html/md files, run jekyll & reload BrowserSync
 */
gulp.task('watch', function () {
    gulp.watch('assets/_scss/**/*.*', ['sass']);
});

/**
 * Default task, running just `gulp` will compile the sass,
 * compile the jekyll site, launch BrowserSync & watch files.
 */
gulp.task('default', ['watch']);

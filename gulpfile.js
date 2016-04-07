var gulp = require('gulp'),
    browserSync = require('browser-sync');

var reload = browserSync.reload;

// watch files for changes and reload
gulp.task('serve', function() {
    browserSync({
        server: {
            baseDir: './'
        }
    });

    gulp.watch(['index.html', 'css/**/*.css', 'js/**/*.js', 'csv/*.csv'], {cwd: './'}, reload);
});

gulp.task('default', function() {
    // place code for your default task here
});

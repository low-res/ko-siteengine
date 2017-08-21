var gulp        = require('gulp');
var browserSync = require('browser-sync').create();

// Static server
gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: "./"
        },
        startPath: "/example/index.html"
    });

    gulp.watch(["src/**/*.html", "src/**/*.js"]).on('change', browserSync.reload);
});

gulp.task('default', ['browser-sync']);
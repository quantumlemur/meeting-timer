var gulp = require('gulp'),
    qunit = require('gulp-qunit');

gulp.task('default', function() {
    return gulp.src('./qunit.html')
        .pipe(qunit());
});
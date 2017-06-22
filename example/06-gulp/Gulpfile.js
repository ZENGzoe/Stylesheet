var gulp = require('gulp'),
    spritesmith = require('gulp.spritesmith');

gulp.task('default',function(){
    return gulp.src("src/img/*.png")
        .pipe(spritesmith({
            imgName : 'img/sprite.png',
            cssName : 'css/style.css',
            padding : 5 ,
            algorithm : 'binary-tree',
            cssTemplate : 'src/css/style.css'
        }))
        .pipe(gulp.dest('dist/'))
})
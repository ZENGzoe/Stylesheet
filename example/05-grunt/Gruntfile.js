module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        // 自动雪碧图
        sprite: {
            options: {
                // sprite背景图源文件夹
                imagepath: 'src/img/',
                // 映射CSS中背景路径
                imagepath_map: null,
                // 雪碧图输出目录
                spritedest: 'build/img/',
                // 替换后的背景路径
                spritepath: '../img/',
                // 图片间间距
                padding: 2,
                // 是否使用 image-set 作为2x图片实现
                useimageset: false,
                // 是否以时间戳为文件名生成新的雪碧图文件
                newsprite: false,
                // 给雪碧图追加时间戳
                spritestamp: true,
                // 在CSS文件末尾追加时间戳
                cssstamp: true,
                // 默认使用二叉树最优排列算法
                algorithm: 'binary-tree',
                // 默认使用`pngsmith`图像处理引擎
                engine: 'pngsmith'
            },
            autoSprite: {
                files: [{
                    // 启用动态扩展
                    expand: true,
                    // css文件源的文件夹
                    cwd: 'src/css/',
                    // 匹配规则
                    src: '*.css',
                    // 导出css和sprite的路径地址
                    dest: 'build/css/',
                    // 导出的css名
                    ext: '.sprite.css'
                }]
            }
        }
    });

    // 加载指定插件任务
    grunt.loadNpmTasks('grunt-css-sprite');

    // 默认执行的任务
    grunt.registerTask('default', ['sprite']);
};
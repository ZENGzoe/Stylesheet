
---
## 前言

在项目中，有时候需要用到很多小的图片，那么页面访问过程中就需要一次一次地向服务器很多的这样小的图片，严重影响到页面的性能。我们可以将多个小的图片合成一张图片，这样的话页面会只请求一次，从而优化我们的性能。这样的图片叫做CSS Sprite,也叫雪碧图。
![](2017-05-25-sprite雪碧图生成方法/01.png)

## 实现

要合成雪碧图的方法很多，从总体上可按照生成的环境分为项目外生成和项目中生成，项目外生成即使用其他工具合并生成，比如线上工具[CSS Sprite Generator](http://spritegen.website-performance.org/)、Animation CC等，除了生成雪碧图外，还可以导出雪碧图中包含各个子图的尺寸和偏移量的文本。具体实现方法可自行搜索，在这篇文章中，主要是介绍项目中生成的方法，即在项目开发过程中，可配置相关代码自动生成雪碧图。与项目外生成方法相比，这个比较大的优点是不用手动添加各个子图的尺寸和背景位置，能够减少较大的时间成本，有利于项目的快速开发。

### 方法一：Postcss

`PostCss`是一种可以用Javascript代码来处理CSS的工具，可对CSS进行模块化转换，将CSS代码解析成抽象语法树结构，再由插件来进行处理。因此在项目中，可使用其`postcss-sprites`插件将图片生成雪碧图图。同时，使用Webpack模块加载器来处理CSS和图片。具体实现方法如下：

** 1.安装加载器与插件 **

```
npm install -save-dev style-loader css-loader postcss-loader file-loader postcss-sprites extract-text-webpack-plugin html-webpack-plugin
```

使用postcss，需要用到样式加载器、css加载器、postcss加载器三种加载器来处理css。
`postcss-sprite` ：用来合并雪碧图。
`file-loader` ：用来处理图片。
`extract-text-webpack-plugin` ： 用来从出口文件中提取文本到一个单独的文件中。
`html-webpack-plugin` ： 创建HTML文件

** 2.配置webpack.config.js **

``` javascript
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    devtool : "inline-source-map",          
    entry : "./src/js/index.js",
    output : {
        path : __dirname + "/dist/js",
        filename : "bundle.js"
    },
    devServer : {
        compress : false,
        contentBase : __dirname,
        publicPath : '/',
        port : 8081
    },
    module : {
        loaders : [
            { 
                test : /\.js|.jsx?$/, 
                loader : 'babel-loader',
                exclude : /node_modules/
            }
        ],
        rules : [
            {
                test : /\.css$/,
                exclude : /dist/,
                use : ExtractTextPlugin.extract({
                    fallback : 'style-loader',
                    use : ['css-loader?module&localIdentName=[local]','postcss-loader']
                })
            },
            {
                test : /\.(jpg|png)$/,
                use : 'file-loader?name=../img/[name].[ext]'
            }
        ]
    },
    plugins : [
        new ExtractTextPlugin("../css/global.css"),
        new HtmlWebpackPlugin({
            title : "postcss生成雪碧图",
            filename : "../index.html",
            template : 'src/index.html'
        })
    ]
}
```

入口文件为`src/js/index.js`，`ExtractTextPlugin`将出口文件`bundle.js`中的css分离出成为一个独立`global.css`文件。

** 3.配置postcss **
在根目录下，创建文件`postcss.config.js`，配置如下：

``` javascript
    let opts = {
        stylesheetPath : './src/img',
        spritePath : './dist/img/'
    };
    module.exports = {
        plugins : [
            require('postcss-sprites')(opts)
        ]
    }
```

`stylesheetPath`为源图片路径，`spritePath`为生成雪碧图地址。

** 4.运行 **

```
webpack-dev-server
```

到这里就可以生成想要的雪碧图：

** Before: **

图片：

![](2017-05-25-sprite雪碧图生成方法/02.png)

CSS：

![](2017-05-25-sprite雪碧图生成方法/03.png)

** After: **

图片：

![](2017-05-25-sprite雪碧图生成方法/04.png)

CSS：

![](2017-05-25-sprite雪碧图生成方法/05.png)

** 5.添加分组 **

如果图片太多，可将图片合成多个雪碧图，这时需要根据分组修改图片名称。
比如，当我需要将以上的11张图片合成两张雪碧图`sprite1.png`和`sprite2.png`，则需要将图片名称改为包含sprite1或sprite2的新名称，包含sprite1或sprite2名称的图片合并到`sprite1.png`或`sprite2.png`。如下：
![](2017-05-25-sprite雪碧图生成方法/06.png)

并修改`postcss.config.js`如下：
```
let opts = {
    stylesheetPath : './src/img',
    spritePath : './dist/img/',
    groupBy : [
        function(image) {
            if (image.url.indexOf('sprite1') === -1) {
                return Promise.reject();
            }
            return Promise.resolve('sprite1');
        },
        function(image) {
            if (image.url.indexOf('sprite2') === -1) {
                return Promise.reject();
            }
            return Promise.resolve('sprite2');
        }
    ]
};
module.exports = {
    plugins : [
        require('postcss-sprites')(opts)
    ]
}
```
使用`groupBy`来配置我们的分组。

最终图片合成如下：
![](2017-05-25-sprite雪碧图生成方法/07.png)

** 6.修改图片单位 **

在项目中，我们可能会使用REM布局，需要将图片的单位改为`rem`。直接修改`postcss.config.js`如下：
```
let psdSize = 750;      //设计稿宽度
let RemRatio = 16;      //REM 换算比值
let postcss = require('postcss');
let opts = {
    stylesheetPath : './src/img',
    spritePath : './dist/img/',
    hooks : {
        onUpdateRule : function(rule,token,image){
            let backgroundSizeX = image.spriteWidth/(psdSize/RemRatio/1),
                backgroundSizeY = image.spriteHeight/(psdSize/RemRatio/1),
                backgroundPositionX = image.coords.x/(psdSize/RemRatio/1),
                backgroundPositionY = image.coords.y/(psdSize/RemRatio/1);


            backgroundSizeX = isNaN(backgroundSizeX) ? 0 : backgroundSizeX.toFixed(3);
            backgroundSizeY = isNaN(backgroundSizeY) ? 0 : backgroundSizeY.toFixed(3);
            backgroundPositionX = isNaN(backgroundPositionX) ? 0 : backgroundPositionX.toFixed(3);
            backgroundPositionY = isNaN(backgroundPositionY) ? 0 : backgroundPositionY.toFixed(3);

            let backgroundImage = postcss.decl({
                prop : 'background-image',
                value : 'url(' + image.spriteUrl + ')'
            })

            let backgroundSize = postcss.decl({
                prop : 'background-size',
                value : backgroundSizeX + 'rem ' + backgroundSizeY + 'rem'
            })

            let backgroundPosition = postcss.decl({
                prop : 'background-position',
                value : backgroundPositionX + 'rem ' + backgroundPositionY + 'rem'
            })

            rule.insertAfter(token,backgroundImage);
            rule.insertAfter(backgroundImage,backgroundPosition);
            rule.insertAfter(backgroundPosition,backgroundSize);
        }
    }
};
module.exports = {
    plugins : [
        require('postcss-sprites')(opts)
    ]
}
```
使用`hooks.onUpdateRule`来重写输出的图片样式。换算公式可根据自己的需求修改。
最终CSS结果如下：
![](2017-05-25-sprite雪碧图生成方法/08.png)

### 方法二：Composs+Sass

Sass是一种CSS预处理器，通过搭配Compass,可以更好的实现合并生成雪碧图。

** 1.声明雪碧图 **

Compass中有多种包装好的模块，使用其中的雪碧地图(Sprite maps)来实现雪碧图的合成。声明雪碧图如下：

```
$sprite1 : sprite-map("sprite1/*.png",$spacing : 10px , $layout : 'vertical');
$sprite2 : sprite-map("sprite2/*.png",$spacing : 10px , $layout : 'vertical');
```
声明两个雪碧图分别为`$sprite1`和`$sprite2`,`sprite-map`第一个参数为`config.rb`配置文件中`images_dir`下雪碧图集的地址，$spacing为图片间隔，默认为0。`$layout`为图片的排列方式。有四种排列方式：`vertical`、`horizontal`、`diagonal`、`smart`。主要分别如下：
![](2017-05-25-sprite雪碧图生成方法/09.jpg)

** 2.完成style.scss **

根据需求，配置样式如下：

`style.scss`:
```
$sprite1 : sprite-map("sprite1/*.png",$spacing : 10px , $layout : 'vertical');
$sprite2 : sprite-map("sprite2/*.png",$spacing : 10px , $layout : 'vertical');

@function pxToRem ($value){
    $value : $value / ($value * 0 + 1);  //去单位px
    @return $value/(750px/16px/1rem);
}
@mixin spritesMixin($name,$sprites){
    $iconPath:sprite-file($sprites,$name);
    $iconWidth:image-width($iconPath);
    $iconHeight:image-height($iconPath);
    $iconPosX : nth(sprite-position($sprites,$name),1);
    $iconPosY : nth(sprite-position($sprites,$name),2);
    background-repeat:no-repeat;
    background-image:sprite-url($sprites);
    width:pxToRem($iconWidth);
    height: pxToRem($iconHeight);
    background:pxToRem($iconPosX) pxToRem($iconPosY);
}

.a{
    @include spritesMixin(a,$sprite1);
}

.b{
    @include spritesMixin(b,$sprite1);
}
```
`pxToRem` : 将px转化为rem。
`spritesMixin` : 声明需要引用雪碧图的代码块。
`sprite-file` : 用于在雪碧图上找到需要的图片。
`image-width`、`image-height` : 获取该图片的长度和宽度。
`sprite-position` : 获取该图片在雪碧图上的位置。
`nth` : 取值。

在每个需要雪碧图的位置上直接引入`@include spritesMixin($name,$sprites)`即可，`$name`为该图片的名称，`$sprites`为声明的雪碧图。

转化后的`style.css`:
![](2017-05-25-sprite雪碧图生成方法/10.png)

如果想要更简单的自动生成，只需要改为简单的几行：
```
@import "compass/utilities/sprites";       //导入sprites模块
@import "sprite1/*.png";                   //导入sprite1的图片
@import "sprite2/*.png";                   //导入sprite2的图片
@include all-sprite1-sprites;              //自动根据文件名生成类
@include all-sprite2-sprites;              //自动根据文件名生成类
```
这样转化后的样式中就能根据文件名来生成类，所以我们在使用之前能够根据文件名来定义我们的类并且加入到我们的结构中，这样不用在每一个需要的地方重新加入相应的样式。

### 方法三：Grunt

如果使用了工具Grunt,那么就可以使用`grunt-css-sprite`插件来实现雪碧图的生成。

** 1.安装插件 **

```
npm install grunt-css-sprite --save-dev
```

** 2.配置Gruntfile.js **

```
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
```
`grunt-css-sprite`插件会根据样式文件中引用的图片来进行雪碧图的合并。

`algorithm`配置图片的排列方式，有五个选项，分别为`top-down`(从上至下)、`left-right`(从左至右)、`diagonal`(从左上至右下)、`alt-diagonal`(从左下至右上)、`binary-tree`(二叉树排列)，可根据自己的爱好进行配置。

但由于其配置参数的限制，不能满足较特殊的项目需求，比如不能对图片分组合并等。

### 方法四：Gulp

如果使用了工具Gulp，可使用插件`grunt.spritesmith`来合成雪碧图。

** 1.安装插件 **

```
npm install gulp.spritesmith --save-dev
```

** 2.配置Gulpfile.js **

```
var gulp = require('gulp'),
    spritesmith = require('gulp.spritesmith');

gulp.task('default',function(){
    return gulp.src("src/img/*.png")
        .pipe(spritesmith({
            imgName : 'img/sprite.png',
            cssName : 'css/style.css',
            padding : 5 ,
            algorithm : 'binary-tree',
            cssTemplate : 'src/css/spriteTemplate.css'
        }))
        .pipe(gulp.dest('dist/'))
})
```

`Gulpfile.js`的配置相对简单，`grunt.spritesmith`插件则会根据`src/img/*.png`目录中配置的图片进行合并雪碧图。
`algorithm`配置图片的排列方式，同`grunt-css-sprite`中`algorithm`的配置。
`cssTemplate`为生成雪碧图样式的模版文件，可以是字符串也可以是函数。如果是字符串，则为模版的地址，则在样式文件中的配置请看3.配置css模版。如果是函数，则可以配置为：

```
...
cssTemplate: function (data) {
    var arr=[];
    data.sprites.forEach(function (sprite) {
        arr.push(".icon-"+sprite.name+
        "{" +
        "background-image: url('"+sprite.escaped_image+"');"+
        "background-position: "+sprite.px.offset_x+"px "+sprite.px.offset_y+"px;"+
        "width:"+sprite.px.width+";"+
        "height:"+sprite.px.height+";"+
        "}\n");
    });
    return arr.join("");
}
...
```


** 3.配置css模版 **

在`Gulpfile.js`中，

```
{{#sprites}}   //模版开始
.icon-{{name}}{
    background-image: url("{{escaped_image}}");                
    background-position: {{px.offset_x}} {{px.offset_y}};
    width: {{px.width}};
    height: {{px.height}};
}
{{/sprites}}   //模版开始
```
`name`：图片名。
`escaped_image`：图片的地址。
`px`：图片在雪碧图的数据对象，offset_x为x偏移单位，offset_y为y偏移单位，width为宽度，height为高度。


## 总结

上面主要是总结了四种方法，各有各的优势，可根据自己的需求进行配置。磨刀不误砍柴工，配置好了，才能更好地节省时间完成项目开发。

DEMO源码地址：[源码](https://github.com/ZENGzoe/Stylesheet)
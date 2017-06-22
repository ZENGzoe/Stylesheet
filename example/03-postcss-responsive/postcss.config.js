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
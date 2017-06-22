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
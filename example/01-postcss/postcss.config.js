let opts = {
    stylesheetPath : './src/img',
    spritePath : './dist/img/'
};
module.exports = {
    plugins : [
        require('postcss-sprites')(opts)
    ]
}
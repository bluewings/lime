var fs = require('fs'),
    gm = require('gm');

var testFile = './test/sample3.jpg';

var gmImg = gm(testFile);
var THUMB_HEIGHT = 150;

gmImg.size(function(err, src) {

    src.ratio = src.width / src.height;
    var dst = {
        thumbWidth: parseInt(THUMB_HEIGHT * src.width / src.height, 10),
        thumbHeight: THUMB_HEIGHT
    };

    if (dst.thumbWidth / dst.thumbHeight < 4 / 6) {
        dst.thumbWidth = parseInt(4 / 6 * dst.thumbHeight, 10);
    } else if (dst.thumbWidth / dst.thumbHeight > 6 / 4) {
        dst.thumbWidth = parseInt(6 / 4 * dst.thumbHeight, 10);
    }

    dst.thumbRatio = dst.thumbWidth / dst.thumbHeight;

    var crp = {};

    if (dst.thumbRatio < src.ratio) {
        console.log('case 1');
        crp.height = src.height;
        crp.width = parseInt(crp.height * dst.thumbRatio, 10);
        crp.x = parseInt((src.width - crp.width) / 2, 10);
        crp.y = 0;
    } else {
        crp.width = src.width;
        crp.height = parseInt(crp.width / dst.thumbRatio, 10);
        crp.x = 0;
        crp.y = parseInt((src.height - crp.height) / 2, 10);
    }





    gmImg.autoOrient()
        .crop(crp.width, crp.height, crp.x, crp.y)
        .thumb(dst.thumbWidth, dst.thumbHeight, './test/sample_test.jpg', 70, function() {});

});
/*.resize(20, 20)
.write('./test/sample_test.jpg', function(err) {
	if (!err) {
	console.log('done');
}
});*/
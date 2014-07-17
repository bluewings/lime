var fs = require('fs'),
    gm = require('gm');

generateImage('./test/sample.jpg');

function generateImage(imgPath, callback) {

    var gmInst = gm(imgPath).autoOrient();

    var THUMB_HEIGHT = 150,
        RESCALED_WIDTH = 360;

    gmInst.size(function(err, source) {

        var rescaled, cropped, thumb;

        source.ratio = source.width / source.height;

        rescaled = {
            path: imgPath.replace(/(.*)\.(.*)$/, '$1_rescaled.$2'),
            width: RESCALED_WIDTH,
            height: parseInt(RESCALED_WIDTH / source.ratio, 10)
        };

        cropped = {
            width: source.width,
            height: source.height,
            x: 0,
            y: 0
        };

        thumb = {
            path: imgPath.replace(/(.*)\.(.*)$/, '$1_thumb.$2'),
            ratio: null,
            width: parseInt(THUMB_HEIGHT * source.ratio, 10),
            height: THUMB_HEIGHT
        };

        if (thumb.width / thumb.height < 4 / 6) {
            thumb.width = parseInt(4 / 6 * thumb.height, 10);
        } else if (thumb.width / thumb.height > 6 / 4) {
            thumb.width = parseInt(6 / 4 * thumb.height, 10);
        }
        thumb.ratio = thumb.width / thumb.height;

        if (thumb.ratio < source.ratio) {
            cropped.width = parseInt(cropped.height * thumb.ratio, 10);
            cropped.x = parseInt((source.width - cropped.width) / 2, 10);
        } else {
            cropped.height = parseInt(cropped.width / thumb.ratio, 10);
            cropped.y = parseInt((source.height - cropped.height) / 2, 10);
        }

        gm(imgPath).autoOrient().thumb(rescaled.width, rescaled.height, rescaled.path, 70, function() {});
        gmInst.crop(cropped.width, cropped.height, cropped.x, cropped.y)
            .thumb(thumb.width, thumb.height, thumb.path, 70, function() {});


        if (callback) {
            callback({
                rescaled: rescaled,
                thumb: thumb
            });
        }
    });
}
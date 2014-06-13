/*jslint browser: true, regexp: true, unparam: true, indent: 4 */
/*global jQuery: true */
var express = require('express'),
    router = express.Router(),
    path = require('path');

var SUCCESS = 200,
    ERROR = 500;

function uid() {

    return (parseInt(Math.random() * 900000000 + 100000000, 10)).toString(36).substr(0, 5);
}

router.get('/notes/:shareId', function (req, res) {

    var fs = require("fs"),
        path = require('path'),
        filepath = path.join(__dirname, '..', 'data', 'share', 'share-' + req.params.shareId + '.json');

    fs.readFile(filepath, 'utf8', function (err, data) {
        if (err) {
            res.jsonp({
                code: ERROR,
                message: err
            });
        } else {
            try {
                data = JSON.parse(data);
            } catch (err) {
                data = [];
            }            
            res.jsonp({
                code: SUCCESS,
                message: 'ok',
                result: {
                    owner: data.owner,
                    title: data.title,
                    notes: data.notes
                }
            });
        }
    });
});



router.post('/notes', function (req, res) {

    var fs = require("fs"),
        path = require('path'),
        shareId,
        filename;

    if (req.body && req.body.owner && req.body.notes) {

        shareId = req.body.owner + '-' + uid();

        filename = path.join(__dirname, '..', 'data', 'share', 'share-' + shareId + '.json');

        fs.writeFile(filename, JSON.stringify({
            owner: req.body.owner,
            title: req.body.title,
            notes: req.body.notes
        }), function (err) {

            if (err) {
                res.jsonp({
                    code: ERROR,
                    message: err
                });
            } else {
                res.jsonp({
                    code: SUCCESS,
                    message: 'ok',
                    result: {
                        id: shareId
                    }
                });
            }
        });
    } else {
        res.jsonp({
            code: ERROR,
            message: 'notes were not found.'
        });
    }
});


module.exports = router;
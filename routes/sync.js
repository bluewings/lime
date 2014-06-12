/*jslint browser: true, regexp: true, unparam: true, indent: 4 */
/*global jQuery: true */
var express = require('express'),
    router = express.Router(),
    path = require('path');

var SUCCESS = 200,
    ERROR = 500;

router.get('/notes/:myId', function (req, res) {

    var fs = require("fs"),
        path = require('path'),
        filepath = path.join(__dirname, '..', 'data', 'sync', 'notes.' + req.params.myId + '.json');

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
                    notes: data
                }
            });
        }
    });
});

router.post('/notes/:myId', function (req, res) {

    var fs = require("fs"),
        path = require('path'),
        filename;

    if (req.body && req.body.notes) {

        filename = path.join(__dirname, '..', 'data', 'sync', 'notes.' + req.params.myId + '.json');

        fs.writeFile(filename, JSON.stringify(req.body.notes), function (err) {

            if (err) {
                res.jsonp({
                    code: ERROR,
                    message: err
                });
            } else {
                res.jsonp({
                    code: SUCCESS,
                    message: 'ok',
                    result: {}
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
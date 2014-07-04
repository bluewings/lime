/*jslint browser: true, regexp: true, unparam: true, indent: 4 */
/*global jQuery: true */
var express = require('express'),
    fs = require('fs'),
    path = require('path'),
    sizeOf = require('image-size'),
    model = require('./model'),
    router = express.Router();

var User = model.User,
    Note = model.Note,
    Share = model.Share;

var SUCCESS = 'success',
    ERROR = 'error';

function uid() {

    return (parseInt(Math.random() * 900000000 + 100000000, 10)).toString(36).substr(0, 6);
}

router.post('/', function (req, res) {

    req.body.shareId = uid();

    Share.create(req.body, function (err, data) {


        User.update({
            userId: data.createdBy,
            'shared.shareId': {
                '$ne': data.shareId
            }
        }, {
            '$push': {
                shared: {
                    shareId: data.shareId
                }
            }
        }, function() {
            res.jsonp({
                status: SUCCESS,
                data: data
            });
        });    
    });
});


router.post('/:shareId/note', function (req, res) {

    console.log(req.body);

    Share.update({
        shareId: req.params.shareId
    }, {
        $push: {
            notes: req.body
        }
    }, function (err, data) {
        res.jsonp({
            code: 200,
            message: 'ok',
            result: {
                data: data
            }
        });
    });
});

router.put('/:shareId/note/:_id', function (req, res) {

    var set = {};
    for (var field in req.body) {
        if (req.body.hasOwnProperty(field)) {
            set ['notes.$.' + field] = req.body[field];
        }

    }

    delete set ['notes.$.created'];
    set ['notes.$.updated'] = new Date();



    Share.update({
        shareId: req.params.shareId,
        'notes._id': req.params._id
    }, {
        $set: set
        /*{
            'notes.$.title': 'updated'
        }*/
    }, function (err, data) {

        res.jsonp({
            code: 200,
            message: 'ok',
            result: {
                data: data
            }
        });
    });
});

router.delete('/:shareId', function (req, res) {

    Share.remove({
        shareId: req.params.shareId
    }, function (err, data) {
        res.jsonp({
            status: SUCCESS,
            data: data
        });
    });
});


router.delete('/:shareId/note/:_id', function (req, res) {

    Share.findOneAndUpdate({
        shareId: req.params.shareId,
    }, {
        $pull: {
            notes: {
                _id: req.params._id
            }
        }
    }, function (err, data) {

        res.jsonp({
            code: 200,
            message: 'ok',
            result: {
                data: data
            }
        });
    });
});


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
/*jslint browser: true, regexp: true, unparam: true, indent: 4 */
/*global jQuery: true */
var express = require('express'),
    router = express.Router(),
    model = require('./model');

var User = model.User,
    Note = model.Note,
    Board = model.Board;

var SUCCESS = 'success',
    ERROR = 'error';

function uid() {
    return (parseInt(Math.random() * 900000000 + 100000000, 10)).toString(36).substr(0, 6);
}

// get boards
router.get('/', function (req, res) {

    Board.find({}, function (err, data) {

        if (err) {

            res.jsonp({
                status: ERROR,
                message: err
            });
        } else {

            res.jsonp({
                status: SUCCESS,
                data: data
            });
        }
    });
});

// get board
router.get('/:boardId', function (req, res) {

    Board.find({
        boardId: req.params.boardId
    }, function (err, boards) {

        if (err) {

            res.jsonp({
                status: ERROR,
                message: err
            });
        } else if (boards.length === 0) {

            res.jsonp({
                status: ERROR,
                message: 'board not found.'
            });
        } else {

            res.jsonp({
                status: SUCCESS,
                data: boards[0]
            });
        }
    });
});

// create board
router.post('/', function (req, res) {

    req.body.boardId = uid();

    if (!req.body.createdBy) {

        res.jsonp({
            status: ERROR,
            message: 'createdBy is required.'
        });
    } else if (!req.body.title) {

        res.jsonp({
            status: ERROR,
            message: 'title is required.'
        });
    } else {

        Board.create(req.body, function (err, board) {

            if (err) {

                res.jsonp({
                    status: ERROR,
                    message: err
                });
            } else {

                User.update({
                    userId: board.createdBy,
                    'boards.boardId': {
                        '$ne': board.boardId
                    }
                }, {
                    '$push': {
                        boards: {
                            boardId: board.boardId
                        }
                    }
                }, function (err, data) {

                    res.jsonp({
                        status: SUCCESS,
                        data: board
                    });
                });
            }
        });
    }
});

router.put('/:boardId', function (req, res) {

    var field, set = {};

    for (field in req.body) {
        if (req.body.hasOwnProperty(field)) {
            set [field] = req.body[field];
        }
    }
    set.updated = new Date();
    delete set.createdBy;
    delete set.created;

    Board.update({
        boardId: req.params.boardId
    }, {
        $set: set
    }, function (err, data) {

        if (err) {

            res.jsonp({
                status: ERROR,
                message: err
            });
        } else {

            res.jsonp({
                status: SUCCESS,
                data: data
            });
        }
    });
});

// create note
router.post('/:boardId/note', function (req, res) {

    Board.update({
        boardId: req.params.boardId
    }, {
        $push: {
            notes: req.body
        }
    }, function (err, data) {

        if (err) {

            res.jsonp({
                status: ERROR,
                message: err
            });
        } else {

            res.jsonp({
                status: SUCCESS,
                data: data
            });
        }
    });
});

// get note
router.get('/:boardId/note/:_id', function (req, res) {

    Board.find({
        boardId: req.params.boardId
    }, {
        notes: {
            '$elemMatch': {
                _id: req.params._id
            }
        }
    }, function (err, boards) {

        if (err) {

            res.jsonp({
                status: ERROR,
                message: err
            });
        } else if (boards.length === 0 && (!boards[0].notes || boards[0].notes.length === 0)) {

            res.jsonp({
                status: ERROR,
                message: 'note not found.'
            });
        } else {

            res.jsonp({
                status: SUCCESS,
                data: boards[0].notes[0]
            });
        }
    });
});

// modify note
router.put('/:boardId/note/:_id', function (req, res) {

    var set = {}, field;

    for (field in req.body) {
        if (req.body.hasOwnProperty(field)) {
            set ['notes.$.' + field] = req.body[field];
        }
    }

    delete set ['notes.$.created'];
    set ['notes.$.updated'] = new Date();

    Board.update({
        boardId: req.params.boardId,
        'notes._id': req.params._id
    }, {
        $set: set
    }, function (err, data) {

        if (err) {

            res.jsonp({
                status: ERROR,
                message: err
            });
        } else {

            res.jsonp({
                status: SUCCESS,
                data: data
            });
        }
    });
});

router.delete('/:boardId', function (req, res) {

    Board.remove({
        boardId: req.params.boardId
    }, function (err, data) {

        if (err) {

            res.jsonp({
                status: ERROR,
                message: err
            });
        } else {

            res.jsonp({
                status: SUCCESS,
                data: data
            });
        }
    });
});

router.delete('/:boardId/note/:_id', function (req, res) {

    Board.findOneAndUpdate({
        boardId: req.params.boardId,
    }, {
        $pull: {
            notes: {
                _id: req.params._id
            }
        }
    }, function (err, data) {

        if (err) {

            res.jsonp({
                status: ERROR,
                message: err
            });
        } else {

            res.jsonp({
                status: SUCCESS,
                data: data
            });
        }
    });
});

module.exports = router;
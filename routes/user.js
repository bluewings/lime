/*jslint browser: true, regexp: true, unparam: true, indent: 4 */
/*global jQuery: true */
var express = require('express'),
    router = express.Router(),
    model = require('./model'),
    fs = require('fs'),
    path = require('path'),
    sizeOf = require('image-size'),
    gm = require('gm');

var User = model.User,
    Note = model.Note,
    Board = model.Board;

var SUCCESS = 'success',
    ERROR = 'error';

var THUMB_HEIGHT = 150;

function uid() {
    return (parseInt(Math.random() * 900000000 + 100000000, 10)).toString(36).substr(0, 6);
}

// get users
router.get('/', function(req, res) {

    User.find({}, function(err, data) {

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

// get user
router.get('/:userId', function(req, res) {

    User.update({
        userId: req.params.userId,
        'userAgents': {
            '$ne': req.headers['user-agent']
        }
    }, {
        '$push': {
            'userAgents': req.headers['user-agent']
        }
    });

    User.find({
        userId: req.params.userId
    }).lean().exec(function(err, users) {

        var i, j, boardIds = [];

        if (err) {

            res.jsonp({
                status: ERROR,
                message: err
            });
        } else if (users.length === 0) {

            res.jsonp({
                status: ERROR,
                message: 'user not found.'
            });
        } else {

            if (users[0].boards) {
                for (i = 0; i < users[0].boards.length; i++) {
                    boardIds.push(users[0].boards[i].boardId);
                }
            }

            Board.find({
                boardId: {
                    $in: boardIds
                }
            }).lean().exec(function(err, boards) {

                if (err) {

                    res.jsonp({
                        status: ERROR,
                        message: err
                    });
                } else {

                    for (i = 0; i < boards.length; i++) {
                        for (j = 0; j < boards[i].notes.length; j++) {
                            boards[i].notes[j].boardId = boards[i].boardId;
                        }
                    }
                    users[0].boards = boards;
                    res.jsonp({
                        status: SUCCESS,
                        data: users[0]
                    });
                }
            });
        }
    });
});

// create user
router.post('/', function(req, res) {

    var userId = uid();

    User.create({
        userId: userId
    }, function(err, data) {

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

// delete user
router.delete('/:userId', function(req, res) {

    User.remove({
        userId: req.params.userId
    }, function(err, data) {

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

function generateImage(imgPath, callback) {

    var gmInst = gm(imgPath).autoOrient();

    var THUMB_HEIGHT = 150,
        RESCALED_WIDTH = 720;

    gmInst.size(function(err, source) {

        var rescaled, cropped, thumb;

        source.ratio = source.width / source.height;

        rescaled = {
            path: imgPath.replace(/(.*)\.(.*)$/, '$1_rescaled.$2'),
            width: RESCALED_WIDTH,
            height: parseInt(RESCALED_WIDTH / source.ratio, 10)
        };

        if (source.width < rescaled.width) {
            rescaled.width = source.width;
            rescaled.height = source.height;
        }

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

        gmInst.crop(cropped.width, cropped.height, cropped.x, cropped.y)
            .thumb(thumb.width, thumb.height, thumb.path, 70, function() {


                gm(imgPath).autoOrient().thumb(rescaled.width, rescaled.height, rescaled.path, 70, function() {

                    if (callback) {
                        callback({
                            rescaled: rescaled,
                            thumb: thumb
                        });
                    }
                });


            });



    });
}

// upload file
router.post('/:userId/upload', function(req, res, next) {

    var source, dest, sourceFolder, destFolder, sourcePath, destPath;

    if (!req.files || !req.files.file) {

        res.jsonp({
            status: ERROR,
            message: 'file not found.'
        });
    } else if (!req.files.file.mimetype || req.files.file.mimetype.search(/^image/) === -1) {

        res.jsonp({
            status: ERROR,
            message: 'not a image file'
        });
    } else {

        sizeOf(req.files.file.path, function(err, dimensions) {

            if (err) {

                res.jsonp({
                    status: ERROR,
                    message: err.code
                });
            } else {

                sourceFolder = path.join(__dirname, '..', 'uploads');
                destFolder = path.join(__dirname, '..', 'public', 'uploads', req.params.userId);
                sourcePath = path.join(sourceFolder, req.files.file.name);
                destPath = path.join(destFolder, req.files.file.name);
                destThumbPath = path.join(destFolder, 'thumb_' + req.files.file.name);


                fs.mkdir(destFolder, function(err) {

                    source = fs.createReadStream(sourcePath);
                    dest = fs.createWriteStream(destPath);
                    source.pipe(dest);
                    source.on('end', function() {

                        generateImage(destPath, function(ret) {


                            res.jsonp({
                                status: SUCCESS,
                                data: {
                                    name: req.files.file.name,
                                    path: ret.rescaled.path.replace(/^.*(\/uploads\/)/, '$1'),
                                    mimetype: req.files.file.mimetype,
                                    size: req.files.file.size,
                                    width: ret.rescaled.width,
                                    height: ret.rescaled.height,
                                    thumbPath: ret.thumb.path,
                                    thumbPath: ret.thumb.path.replace(/^.*(\/uploads\/)/, '$1'),
                                    thumbWidth: ret.thumb.width,
                                    thumbHeight: ret.thumb.height
                                }
                            });
                            fs.unlink(sourcePath, function() {

                                // do nothing for async
                            });


                        });

                        /*

                        var thumbPath = '/uploads/' + req.params.userId + '/thumb_' + req.files.file.name,
                            thumbWidth, thumbHeight = THUMB_HEIGHT;

                        thumbWidth = parseInt(thumbHeight * dimensions.width / dimensions.height, 10);

                        if (thumbWidth / thumbHeight < 4 / 6) {
                            thumbWidth = parseInt(4 / 6 * thumbHeight, 10);
                        } else if (thumbWidth / thumbHeight > 6 / 4) {
                            thumbWidth = parseInt(6 / 4 * thumbHeight, 10);
                        }

                        easyimg.thumbnail({
                            src: destPath,
                            dst: destThumbPath,
                            //width: dimensions.width,
                            //height: dimensions.height,
                            width: thumbWidth,
                            height: thumbHeight,
                            x: 0,
                            y: 0
                        }).then(function (image) {


                            res.jsonp({
                                status: SUCCESS,
                                data: {
                                    name: req.files.file.name,
                                    path: '/uploads/' + req.params.userId + '/' + req.files.file.name,
                                    mimetype: req.files.file.mimetype,
                                    size: req.files.file.size,
                                    width: dimensions.width,
                                    height: dimensions.height,
                                    thumbPath: thumbPath,
                                    thumbWidth: thumbWidth,
                                    thumbHeight: thumbHeight
                                }
                            });
                            fs.unlink(sourcePath, function () {

                                // do nothing for async
                            });

                        }, function (err) {

                            res.jsonp({
                                status: ERROR,
                                message: err.code
                            });
                        })
*/

                    });
                    source.on('error', function(err) {

                        res.jsonp({
                            status: ERROR,
                            message: err
                        });
                    });
                });
            }
        });
    }
});

// append shared boardId
router.post('/:userId/boards/:boardId', function(req, res) {

    User.update({
        userId: req.params.userId,
        'boards.boardId': {
            '$ne': req.params.boardId
        }
    }, {
        '$push': {
            boards: {
                boardId: req.params.boardId
            }
        }
    }, function(err, data) {

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

// append shared boardId
router.delete('/:userId/boards/:boardId', function(req, res) {

    User.findOneAndUpdate({
        userId: req.params.userId
    }, {
        '$pull': {
            boards: {
                boardId: req.params.boardId
            }
        }
    }, function(err, data) {

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



////// 아래는 필요없어진 것들... 체크하고 삭제할것...

/*router.post('/:userId/note', function (req, res) {

    console.log(req.body);

    User.update({
        userId: req.params.userId
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


router.put('/:userId/note/:_id', function (req, res) {

    var set = {};
    for (var field in req.body) {
        if (req.body.hasOwnProperty(field)) {
            set ['notes.$.' + field] = req.body[field];
        }

    }

    delete set ['notes.$.created'];
    set ['notes.$.updated'] = new Date();



    User.update({
        userId: req.params.userId,
        'notes._id': req.params._id
    }, {
        $set: set
        {
            'notes.$.title': 'updated'
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


router.delete('/:userId/note/:_id', function (req, res) {

    User.findOneAndUpdate({
        userId: req.params.userId,
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

router.get('/addNote', function (req, res) {

    var id = "0.2318615757394582";

    User.update({
        userId: id
    }, {
        $push: {
            notes: {
                title: 'wow_' + (new Date())
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

router.get('/note', function (req, res) {

    Note.find({}, function (err, data) {

        res.jsonp({
            code: 200,
            message: 'ok',
            result: {
                data: data
            }
        });
    });
});

router.get('/note_save', function (req, res) {

    var note = new Note({
        title: 'title_save',
        title1: 'title_save',
    });
    note.save(function (err) {
        res.jsonp({
            code: 200,
            message: 'ok',
            result: {

            }
        });
    });

});

router.get('/note_create', function (req, res) {

    Note.create({
        title: 'title_create',
        title1: 'title_create',
    }, function (err) {
        res.jsonp({
            code: 200,
            message: 'ok',
            result: {

            }
        });
    });

});
router.get('/note2', function (req, res) {

    Note.remove({}, function (err, affectedRows) {

        res.jsonp({
            code: 200,
            message: 'ok',
            result: {
                affectedRows: affectedRows
            }
        });
    });
});

router.post('/', function (req, res) {

    User.find({}, function (err, data) {

        res.jsonp({
            code: 200,
            message: 'ok',
            result: {
                data: data
            }
        });
    });
});*/


module.exports = router;
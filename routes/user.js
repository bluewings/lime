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



router.get('/', function (req, res) {

    User.find({}, function (err, data) {
        res.jsonp({
            status: SUCCESS,
            data: data
        });
    });
});

router.get('/:userId', function (req, res) {

    User.find({
        userId: req.params.userId
    }).lean().exec(function (err, data) {

        var inx, shareIds = [];
        if (data.length > 0) {

            if (data[0].notes) {

                for (inx = 0; inx < data[0].notes.length; inx++) {
                    data[0].notes[inx].userId = data[0].userId;
                }
            }
            if (data[0].shared) {
                for (inx = 0; inx < data[0].shared.length; inx++) {
                    shareIds.push(data[0].shared[inx].shareId);
                }
            }


            Share.find({
                shareId: {
                    $in: shareIds
                }
            }).lean().exec(function (err, shared) {

                var inx, jnx;

                for (inx = 0; inx < shared.length; inx++) {
                    for (jnx = 0; jnx < shared[inx].notes.length; jnx++) {
                        shared[inx].notes[jnx].shareId = shared[inx].shareId;
                    }
                }

                data[0].shared = shared;



                console.log(shared);



                res.jsonp({
                    status: SUCCESS,
                    data: data[0]
                });

            });

            console.log(shareIds);

            //.console.log(data[0].shared);

        } else {
            User.create({
                userId: req.params.userId
            }, function (err, data) {
                res.jsonp({
                    status: SUCCESS,
                    data: data
                });
            });
        }
    });
});


router.post('/', function (req, res) {

    var userId = uid();

    //console.log('>>>>> '  + userId);

    User.create({
        userId: userId
    }, function (err, data) {
        console.log(err);
        if (err) {
            res.jsonp({
                status: ERROR,
                message: 'err ?'
            });
        } else {
            res.jsonp({
                status: SUCCESS,
                data: data
            });
        }
        //console.log(data);

    });
});

router.put('/:userId', function (req, res) {

    User.remove({
        userId: req.params.userId
    }, function (err, data) {
        res.jsonp({
            status: SUCCESS,
            data: data
        });
    });
});

router.delete('/:userId', function (req, res) {

    User.remove({
        userId: req.params.userId
    }, function (err, data) {
        res.jsonp({
            status: SUCCESS,
            data: data
        });
    });
});

router.post('/:userId/upload', function (req, res, next) {

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

        sizeOf(req.files.file.path, function (err, dimensions) {

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

                fs.mkdir(destFolder, function (err) {

                    source = fs.createReadStream(sourcePath);
                    dest = fs.createWriteStream(destPath);
                    source.pipe(dest);
                    source.on('end', function () {

                        res.jsonp({
                            status: SUCCESS,
                            data: {
                                name: req.files.file.name,
                                path: '/uploads/' + req.params.userId + '/' + req.files.file.name,
                                mimetype: req.files.file.mimetype,
                                size: req.files.file.size,
                                width: dimensions.width,
                                height: dimensions.height
                            }
                        });
                        fs.unlink(sourcePath, function () {

                            // do nothing for async
                        });
                    });
                    source.on('error', function (err) {

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


router.post('/:userId/note', function (req, res) {

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
});


module.exports = router;
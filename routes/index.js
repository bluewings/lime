var express = require('express'),
	router = express.Router(),
	childProcess = require('child_process'),
	phantomjs = require('phantomjs'),
	path = require('path');

var SUCCESS = 200,
	ERROR = 500;

function render(req, res) {

	res.render('index', {
		title: 'Express',
		stylesheets: [
			//'/stylesheets/keep.css',
			'/stylesheets/lime.css'
		],
		javascripts: [
			'http://cdnjs.cloudflare.com/ajax/libs/masonry/2.1.08/jquery.masonry.min.js',
			//'/javascripts/modules/jindo.desktop.min.js',
			//'/javascripts/modules/jindo.mobile.component.min.js',

			'/javascripts/modules/jindo.mobile.min.js',
			'/javascripts/modules/jindo.mobile.component.js',

			'/javascripts/globalStorage.js',
			'/javascripts/lime.js',
			'/javascripts/lime-header.js',
			'/javascripts/lime-content.js',
			'/javascripts/lime-content-notes.js',
			'/javascripts/lime-modal.js',
			'/javascripts/lime-resource.js',
			'/javascripts/lime-resource-notes.js'
		]
	});
}

/* GET home page. */
router.get('/', function (req, res) {
	render(req, res);
});
router.get('/home', function (req, res) {
	render(req, res);
});

router.get('/home/:id', function (req, res) {
	render(req, res);
});

router.get('/background', function(req, res) {

var fs = require("fs"),
    path = require("path");

var p = path.join(__dirname , '..', 'public', 'images', 'background');
fs.readdir(p, function (err, files) {
    if (err) {
        throw err;
    }

    res.jsonp({
    	files: files});

    //console.log(files);

    /*files.map(function (file) {
        return path.join(p, file);
    }).filter(function (file) {
        return fs.statSync(file).isFile();
    }).forEach(function (file) {
        console.log("%s (%s)", file, path.extname(file));
    });*/
});

});

router.get('/about', function (req, res) {
	render(req, res);
});
router.get('/share/:id', function (req, res) {
	render(req, res);
});


router.get('/link/:url', function (req, res) {


	// phantom
	//router.get('/misc/capture/:url', function (req, res) {

	var childArgs, paths, key, output = new Date().getTime() + '_' + parseInt(Math.random() * 9999, 10) + '.jpg';

	paths = {
		capturejs: path.join(__dirname, './../sbin/capture.js'),
		tmpImg: path.join(__dirname, './../public/_tmp/' + output)
	};
	childArgs = [paths.capturejs];
	childArgs.push('url=' + req.params.url);
	childArgs.push('output=' + paths.tmpImg);
	for (key in req.query) {
		if (req.query.hasOwnProperty(key)) {
			childArgs.push(key + '=' + req.query[key] + '');
		}
	}

	childProcess.execFile(phantomjs.path, childArgs, function (err, stdout, stderr) {

		var result = {};

		try {
			stdout = JSON.parse(stdout);
			result = {
				url: req.params.url,
				title: stdout.title,
				note: stdout.desc,
				image: stdout.thumb

			};
		} catch (ignore) {



		}



		res.jsonp({
			code: err ? ERROR : SUCCESS,
			message: err ? stderr : 'ok',
			result: result

			/* {
					url: '/_tmp/' + output,
					done: childArgs,
					err: err,
					stdout: stdout,
					stderr: stderr
				}*/
		});
	});
	//});
});


router.get('/_share/notes/:id', function (req, res) {

	var fs = require("fs"),
		path = require('path'),
		filepath = path.join(__dirname, '..', 'public', 'shares', 'notes.' + req.params.id + '.json');

	fs.readFile(filepath, 'utf8', function (err, data) {
		if (err) {
			res.jsonp({
				code: 500,
				message: err
			});
		} else {
			res.jsonp({
				code: 200,
				message: 'ok',
				result: {
					notes: JSON.parse(data)
				}
			});
		}
	});
});

router.post('/_share/notes', function (req, res) {

	var fs = require("fs"),
		path = require('path'),
		id = (parseInt(Math.random() * 900000000 + 100000000, 10)).toString(36).substr(0, 5),
		filename, jsonData;

	if (req.body && req.body.notes) {

		filename = path.join(__dirname, '..', 'public', 'shares', 'notes.' + id + '.json');

		fs.writeFile(filename, JSON.stringify(req.body.notes), function (err) {

			if (err) {
				res.jsonp({
					code: 500,
					message: err
				});
			} else {
				res.jsonp({
					code: 200,
					message: 'ok',
					result: {
						id: id
					}
				});
			}
		});
	} else {
		res.jsonp({
			code: 500,
			message: 'notes were not found.'
		});
	}
});




module.exports = router;
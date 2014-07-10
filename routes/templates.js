var express = require('express');
var router = express.Router(),
	fs = require('fs'),
	path = require('path'),
	jade = require('jade');

/* GET users listing. */
router.get('/:id', function (req, res) {

	if (req.query && req.query.type == 'json') {

		fs.readFile(path.join(__dirname, '..', 'views', 'templates', req.params.id + '.jade'), 'utf8', function (err, data) {

			if (data) {
				res.jsonp({
					status: 'success',
					data: {
						template: jade.compile(data, {
							pretty: false
						})({})
					}
				});
			} else {
				res.jsonp({
					status: 'error',
					message: 'template not found'
				});
			}
		});

	} else {
		res.render('templates/' + req.params.id);
	}

	//res.send('respond with a resource');
});

module.exports = router;
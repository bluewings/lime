/*jslint browser: true, regexp: true, unparam: true, indent: 4 */
/*global jQuery: true */
var express = require('express'),
    router = express.Router();

function render(req, res) {

    res.render('benzema', {
        title: 'Express',
        stylesheets: [
            '/stylesheets/benzema.css'
        ],
        javascripts: [
            '/javascripts/benzema.js',
            '/javascripts/lime-resource.js',
            '/javascripts/lime-resource-notes.js'
        ]
    });
}

router.get('/', function (req, res) {

    render(req, res);
});

router.get('/view', function (req, res) {

    render(req, res);
});

router.get('/view/:id', function (req, res) {

    render(req, res);
});

router.get('/edit/:entity', function (req, res) {

    render(req, res);
});

module.exports = router;
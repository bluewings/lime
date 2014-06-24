/*jslint browser: true, regexp: true, unparam: true, indent: 4 */
/*global jQuery: true */
var express = require('express'),
    router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {

    res.render('admin', {
        title: 'Express',
        stylesheets: [
            '/stylesheets/lime.css'
        ],
        javascripts: [
            '/javascripts/admin.js',
            '/javascripts/lime-content.js',
            '/javascripts/lime-content-notes.js',
            '/javascripts/lime-constant.js',
            '/javascripts/lime-resource.js',
            '/javascripts/lime-modal.js'
        ]
    });
});

module.exports = router;
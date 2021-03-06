var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var multer  = require('multer');

var routes = require('./routes/index');
var templates = require('./routes/templates');
var users = require('./routes/users');
var upload = require('./routes/upload');
var sync = require('./routes/sync');
//var share = require('./routes/share');
//var board = require('./routes/board');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
//app.set('view options', { pretty: true });
//app.locals.pretty = true;

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/components', express.static(__dirname + '/bower_components'));
app.use(multer({ dest: './uploads/'}));


app.use('/templates', templates);
app.use('/admin', require('./routes/admin'));
app.use('/user', require('./routes/user'));
app.use('/board', require('./routes/board'));
app.use('/benzema', require('./routes/benzema'));
app.use('/', routes);

app.use('/users', users);
app.use('/upload', upload);
app.use('/sync', sync);
//app.use('/share', share);


/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;

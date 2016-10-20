var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var storeSession = require('connect-mongo')(session);

var routes = require('./routes/index');
var search = require('./routes/search');
var user = require('./routes/user');
var guide = require('./routes/guide');

// connect to database
mongoose.connect('mongodb://localhost/tongYou');
var db = mongoose.connection;
// database connection
db.on('error', console.error);


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'))); // this is separate from res.sendFile()
app.use(session({
  secret: 'Tong You Wang',
  resave: false,
  saveUninitialized: false,
  store: new storeSession({
    mongooseConnection: db
  })
  //store: MemoryStore  \This will save sessions in the server memory. OK for dev, but NOT for production, you need store session info into db
}));

// middleware to make user ID available in all templates
app.use(function (req, res, next) {
  res.locals.currentUser = req.session.userid;
  next();
});

// use routes
app.use('/', routes);
app.use('/user', user);
app.use('/guide', guide);
app.use('/search', search);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

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

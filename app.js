var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');


// Routes
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var ticketsRouter = require('./routes/tickets');
var models = require('./routes/index');

// Models
var mongoose = require('./models/connection');

// Express Session
var session = require("express-session")
var app = express();
app.use(
  session({
    secret: 'a4f8071f-c873-4447-8ee2',
    resave: false,
    saveUninitialized: false,
  })
);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Add routes
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/tickets', ticketsRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


// Formatage date
app.locals.dateFormat = function (UTCdate) {
  var date = new Date(UTCdate);
  var day = date.getDate();
  var month = date.getMonth() + 1;
  var year = date.getFullYear();
  return day + "/" + month + "/" + year;
};

module.exports = app;

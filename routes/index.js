var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var journeyModel = require('../models/journeys');

/* GET home page. */
router.get('/', async function (req, res, next) {
  res.render('home/index');
});

router.get('/homepage', function (req, res, next) {
  req.session.user = req.session.user;
  res.render('home/homepage');
});

module.exports = router;


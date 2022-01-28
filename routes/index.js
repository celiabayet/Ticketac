var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var journeyModel = require('../models/journeys');

/* GET home page. */
router.get('/', async function (req, res, next) {
  let user = null;
  let email = null;
  let alreadyExists = false;
  let fill = true;
  res.render('home/index', { user, email, alreadyExists, fill });
});

router.get('/homepage', function (req, res, next) {
  req.session.user = req.session.user;
  res.render('home/homepage');
});

module.exports = router;
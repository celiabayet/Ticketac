var express = require('express');
var router = express.Router();

var userModel = require('../models/users');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

// sign-up
router.post('/sign-up', async function (req, res, next) {
  var searchUser = await userModel.findOne({
    email: req.body.email
  })

  if (!searchUser) {
    var newUser = new userModel({
      last_name: req.body.last_name,
      first_name: req.body.first_name,
      email: req.body.email,
      password: req.body.password
    })

    var newUserSave = await newUser.save();
    req.session.user = {
      email: newUserSave.email,
      id: newUserSave._id,
    }
    res.redirect('/homepage');
  } else {
    res.redirect('/');
  }
});

// sign-in
router.post('/sign-in', async function (req, res, next) {
  var searchUser = await userModel.findOne({
    email: req.body.email,
    password: req.body.password
  })

  if (searchUser != null) {
    req.session.user = {
      email: searchUser.email,
      id: searchUser._id
    }
    res.redirect('/homepage')
  } else {
    res.render('home/index', {user : req.session.user});
  }
  console.log(req.session.user)
});

// Log out
router.get('/logout', function (req, res, next) {
  req.session.user = null;
  res.redirect('/')
});

module.exports = router;
var express = require('express');
var router = express.Router();

var userModel = require('../models/users');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

// sign-up
router.post('/sign-up', async function (req, res, next) {
  if (req.body.last_name != "" && req.body.first_name != "" && req.body.email != "" && req.body.password != "") {
    var searchUser = await userModel.findOne({
      email: req.body.email
    })

    if (searchUser == null) {
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
      let alreadyExists = true;
      let user = null;
      let email = null;
      let fill = true;
      res.render('home/index', { user, email, alreadyExists, fill });
    }
  } else {
    let fill = false;
    let alreadyExists = false;
    let user = null;
    let email = null;
    res.render('home/index', { user, email, alreadyExists, fill });
  }

});

// sign-in
router.post('/sign-in', async function (req, res, next) {
  var emailUser = await userModel.findOne({ email: req.body.email })
  if (emailUser == null) {
    res.render('home/index', { email: "incorrect", user: emailUser })
  } else {
    var searchUser = await userModel.findOne({
      email: req.body.email,
      password: req.body.password
    })
    if (searchUser == null) {
      res.render('home/index', { email: emailUser.email, user: "incorrect" })
    } else {
      req.session.user = {
        email: searchUser.email,
        id: searchUser._id
      }
      res.redirect('/homepage')
    }
  }
});

// Log out
router.get('/logout', function (req, res, next) {
  req.session.user = null;
  res.redirect('/')
});

module.exports = router;
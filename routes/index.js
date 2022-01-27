var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var city = ["Paris", "Marseille", "Nantes", "Lyon", "Rennes", "Melun", "Bordeaux", "Lille"]
var date = ["2018-11-20", "2018-11-21", "2018-11-22", "2018-11-23", "2018-11-24"]

var journeyModel = require('../models/journeys');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/homepage', function (req, res, next) {
  res.render('homepage', { title: 'Express' });
});

router.post('/tickets_available', async function (req, res, next) {
  var departure = req.body.departure;
  var arrival = req.body.arrival;
  console.log(req.body.date);
  var date = new Date(req.body.date).toUTCString();

  var journeysAvailable = await journeyModel.find({departure : departure, arrival: arrival, date: date});

  res.render('tickets_available', {journeysAvailable})
})


// Cette route est juste une verification du Save.
// Vous pouvez choisir de la garder ou la supprimer.
router.get('/result', function (req, res, next) {

  // Permet de savoir combien de trajets il y a par ville en base
  for (i = 0; i < city.length; i++) {

    journeyModel.find(
      { departure: city[i] }, //filtre

      function (err, journey) {

        console.log(`Nombre de trajets au départ de ${journey[0].departure} : `, journey.length);
      }
    )

  }


  res.render('index', { title: 'Express' });
});

module.exports = router;

var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var journeyModel = require('../models/journeys');

var city = ["Paris", "Marseille", "Nantes", "Lyon", "Rennes", "Melun", "Bordeaux", "Lille", "Toulouse", "Reims", "Strasbourg", "Caen"]
var date = ["2022-02-01", "2022-02-02", "2022-02-03", "2022-02-04", "2022-02-05", "2022-02-06", "2022-02-07", "2022-02-08", "2022-02-09", "2022-02-10", "2022-02-11", "2022-02-12", "2022-02-13", "2022-02-14", "2022-02-15", "2022-02-16", "2022-02-17", "2022-02-18", "2022-02-19", "2022-02-20", "2022-02-21", "2022-02-22", "2022-02-23", "2022-02-24", "2022-02-25", "2022-02-26", "2022-02-27", "2022-02-28"]

/* GET home page. */
router.get('/', async function (req, res, next) {
  res.render('index');
});

router.get('/save', async function (req, res, next) {
  // How many journeys we want
  var count = 1000
  // Save  ---------------------------------------------------
  for (var i = 0; i < count; i++) {
    departureCity = city[Math.floor(Math.random() * Math.floor(city.length))]
    arrivalCity = city[Math.floor(Math.random() * Math.floor(city.length))]
    if (departureCity != arrivalCity) {
      var newUser = new journeyModel({
        departure: departureCity,
        arrival: arrivalCity,
        date: date[Math.floor(Math.random() * Math.floor(date.length))],
        departureTime: Math.floor(Math.random() * Math.floor(23)) + ":00",
        price: Math.floor(Math.random() * Math.floor(125)) + 25,
      });
      await newUser.save();
    }
  }
  res.render('index');
});

router.get('/homepage', function (req, res, next) {
  res.render('homepage');
});

router.get('/mytickets', function (req, res, next) {
  if (req.session.mytickets == undefined) {
    req.session.mytickets = [];
  }

  var alreadyExist = false;
  for (var i = 0; i < req.session.mytickets.length; i++) {
    if (req.session.mytickets[i].date == req.query.date && req.session.mytickets[i].departure == req.query.departure && req.session.mytickets[i].arrival == req.query.arrival) {
      alreadyExist = true;
    }
  }

  if (alreadyExist == false) {
    req.session.mytickets.push({
      departure: req.query.departure,
      arrival: req.query.arrival,
      date: req.query.date,
      departureTime: req.query.departureTime,
      price: req.query.price
    })
  }

  res.render('mytickets', { mytickets: req.session.mytickets });
})

router.get('/delete-ticket', function (req, res, next) {

  req.session.mytickets.splice(req.query.position, 1)

  res.render('mytickets', { mytickets: req.session.mytickets })
})

const Stripe = require('stripe');
const stripe = Stripe('sk_test_51KHl6lGSUGrIkzadDuDUf4E8C8bAPElR90tqYxseeWi9BeBP8AhlubaIHpCi04Jhw8f2Ohyi8G24d1oXUDsSrmpv00ucFAALMp');

router.post('/create-checkout-session', async (req, res) => {
  if (req.session.mytickets == undefined) {
    req.session.mytickets = []
  }

  let line_items = [];

  for (let ticket of req.session.mytickets) {
    line_items.push({
      price_data: {
        currency: 'eur',
        product_data: {
          name: `${ticket.departure} / ${ticket.arrival}`,
        },
        unit_amount: ticket.price * 100,
      },
      quantity: 1,
    });
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items,
    mode: 'payment',
    success_url: 'http://localhost:3000/success',
    cancel_url: 'http://localhost:3000/cancel',
  });

  res.redirect(303, session.url);
});

router.get('/success', (req, res) => {
  res.render('success');
});

router.get('/cancel', (req, res) => {
  res.redirect('mytickets');
});

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

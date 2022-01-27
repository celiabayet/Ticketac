var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var journeyModel = require('../models/journeys');

/* GET home page. */
router.get('/', async function (req, res, next) {
  res.render('index');
});

router.get('/homepage', function (req, res, next) {
  res.render('homepage', { title: 'Express' });
});

router.post('/tickets_available', async function (req, res, next) {
  var departure = req.body.departure;
  var arrival = req.body.arrival;
  console.log(req.body.date);
  var date = new Date(req.body.date).toUTCString();

  var journeysAvailable = await journeyModel.find({ departure: departure, arrival: arrival, date: date });

  res.render('tickets_available', { journeysAvailable })
})

router.get('/homepage', function (req, res, next) {
  res.render('homepage');
});

router.get('/mytickets', function (req, res, next) {
  if (req.session.mytickets == undefined) {
    req.session.mytickets = [];
  }

  var alreadyExist = false;
  for (var i = 0; i < req.session.mytickets.length; i++) {
    if (req.session.mytickets[i].date == req.query.date 
      && req.session.mytickets[i].departure == req.query.departure 
      && req.session.mytickets[i].arrival == req.query.arrival) {
      alreadyExist = true;
    }
  }

  if (alreadyExist == false) {
    req.session.mytickets.push({
      departure: req.query.departure,
      arrival: req.query.arrival,
      date: req.query.date,
      departureTime: req.query.departureTime,
      price: req.query.price,
      id: req.query.id
    })
  }

  res.render('mytickets', { mytickets: req.session.mytickets });
})

router.get('/delete-ticket', function (req, res, next) {

  req.session.mytickets.splice(req.query.position, 1)

  res.render('mytickets', { mytickets: req.session.mytickets })
})


// Stripe
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

//Success
router.get('/success', async function(req, res, next) {
  for (let i=0; i<req.session.mytickets; i++){
    await journeyModel.updateOne(
      { _id: req.session.mytickets[i].id },
      { $push: { users: req.session.user.id } }
     );
  };

  req.session.mytickets = [];

  res.render('success');
});

router.get('/cancel', (req, res) => {
  res.redirect('mytickets');
});

router.get('/last_trips', async function(req, res, next) {
  var trips = await journeyModel.find({user : req.session.user.id});
  console.log(trips)

  res.render('last_trips', {trips});
});


module.exports = router;

var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var journeyModel = require('../models/journeys');
var userModel = require('../models/users');

// Tickets Available
router.post('/tickets_available', async function (req, res, next) {
    req.session.user = req.session.user;

    var departure = req.body.departure; 
    departure = departure[0].toUpperCase()+departure.splice(1).toLowerCase();
    var arrival = req.body.arrival;
    arrival = arrival[0].toUpperCase()+arrival.splice(1).toLowerCase();
    var date = new Date(req.body.date).toUTCString();
  
    var journeysAvailable = await journeyModel.find({ departure: departure, arrival: arrival, date: date });
  
    res.render('tickets/tickets_available', { journeysAvailable })
  });

// My tickets
  router.get('/mytickets', function (req, res, next) {
    console.log(req.session.user);
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
  
    res.render('tickets/mytickets', { mytickets: req.session.mytickets });
  })
  
  // Delete tickets
  router.get('/delete-ticket', function (req, res, next) {
  
    req.session.mytickets.splice(req.query.position, 1)
  
    res.render('tickets/mytickets', { mytickets: req.session.mytickets })
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
      success_url: 'http://localhost:3000/tickets/success',
      cancel_url: 'http://localhost:3000/tickets/cancel',
    });
  
    res.redirect(303, session.url);
  });
  
  //Success
  router.get('/success', async function (req, res, next) {
    var user = await userModel.findOne({ _id: req.session.user.id });
    for (let i = 0; i < req.session.mytickets.length; i++) {
      await userModel.updateOne(
        { _id: req.session.user.id },
        { $push: { journeys: req.session.mytickets[i].id } }
      )
    }
    req.session.mytickets = [];
  
    res.render('tickets/success');
  });

  // Failure
  router.get('/cancel', (req, res) => {
    res.redirect('/mytickets');
  });
  
  // Last Trips
  router.get('/last_trips', async function (req, res, next) {
    console.log(req.session.user.id)
    var trips = await userModel.findById(req.session.user.id).populate('journeys');
    console.log(trips);
    trips = trips.journeys;
    console.log(trips);
    res.render('tickets/last_trips', { trips });
  });
  
  module.exports = router;
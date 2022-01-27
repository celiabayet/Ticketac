var mongoose = require('mongoose');

var journeySchema = mongoose.Schema({
    departure: String,
    arrival: String,
    date: Date,
    departureTime: String,
    price: Number,
    users: [{type: mongoose.Schema.Types.ObjectId, ref: 'users'}]
});

var journeyModel = mongoose.model('journeys', journeySchema);

module.exports = journeyModel;
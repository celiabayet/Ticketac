var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
    last_name: String,
    first_name: String,
    email: String,
    password: String,
    journeys: [{ type: mongoose.Schema.Types.ObjectId, ref: 'journeys' }]
});

var userModel = mongoose.model('users', userSchema);

module.exports = userModel;
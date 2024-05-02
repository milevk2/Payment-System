const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({

    cardholder: String,
    card_number: Number,
    expiration: Date,

})

const card = mongoose.model('Card', cardSchema);

module.exports = card;
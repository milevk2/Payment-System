const mongoose = require('mongoose');

const CardSchema = new mongoose.Schema({

    owner_id: String,
    cardholder: String,
    card_number: Number,
    expiration: String,
    card_balance: Number
})

const Card = mongoose.model('Card', CardSchema);

module.exports = {Card, CardSchema};
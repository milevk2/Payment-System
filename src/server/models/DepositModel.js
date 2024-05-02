const mongoose = require('mongoose');

const depositSchema = new mongoose.Schema({

    amount: Number,
    card_number: Number,
    deposit_date: Date,

})

const deposit = mongoose.model('Deposit', depositSchema);

module.exports = deposit;
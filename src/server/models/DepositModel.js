const mongoose = require('mongoose');

const DepositSchema = new mongoose.Schema({

    amount: Number,
    card_number: Number,
    deposit_date: Date,

})

const Deposit = mongoose.model('Deposit', DepositSchema);

module.exports = Deposit;
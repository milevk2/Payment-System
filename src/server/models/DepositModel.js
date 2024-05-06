const mongoose = require('mongoose');

const DepositSchema = new mongoose.Schema({

    userId: String,
    amount: Number,
    card_number: String,
    card_id: String,
    deposit_date: Date,

})

const Deposit = mongoose.model('Deposit', DepositSchema);

module.exports = Deposit;
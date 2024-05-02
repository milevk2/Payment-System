const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({

    tid: String,
    sender: String,
    receiver: String,
    amount: Number,
    date: Date,

})

const transaction = mongoose.model('Transaction', transactionSchema);

module.exports = transaction;
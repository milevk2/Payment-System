const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({

    tid: String,
    date: String,
    merchantID: String,
})

const transaction = mongoose.model('Transaction', transactionSchema);

module.exports = transaction;
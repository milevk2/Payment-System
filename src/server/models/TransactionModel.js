const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({

    tid: String,
    sender: String,
    receiver: String,
    amount: Number,
    transaction_date: Date,

})

const Transaction = mongoose.model('Transaction', TransactionSchema);

module.exports = Transaction;
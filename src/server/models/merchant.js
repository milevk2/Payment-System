const mongoose = require('mongoose');

const merchantSchema = new mongoose.Schema({

    name: String,
    MID: String,
    DOB: String,
    TPV: String,
    last_payout: String,
    comments: [String]
})

const merchant = mongoose.model('Merchant', merchantSchema);

module.exports = merchant;
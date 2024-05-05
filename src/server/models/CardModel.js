const mongoose = require('mongoose');


const CardSchema = new mongoose.Schema({

    owner_id: String,
    cardholder: String,
    card_number: String,
    expiration: String,
})

CardSchema.pre("save", maskCard);

function maskCard() {

    const masked = this.card_number.slice(0, 6)
        .concat('******')
        .concat(this.card_number
            .slice(-4));

    this.card_number = masked;
}

const Card = mongoose.model('Card', CardSchema);
module.exports = { Card, CardSchema };
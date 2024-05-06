const { Card } = require('../models/CardModel.js');
const mongoose = require('mongoose');
const { MongooseError } = require('mongoose');
const User = require('../models/UserModel.js');

//create credit card
exports.createCard = async (userId, schemaProvider, cardholder) => {

    const cardNumber = generateCardNumber(schemaProvider);
    const expDate = createExpirationDate();

    return await Card.create({

        owner_id: userId,
        cardholder: cardholder,
        card_number: cardNumber,
        expiration: expDate
    });
}


//delete credit card
exports.deleteCard = async (userId, cardId) => {

    // const session = await mongoose.startSession();

    // session.startTransaction()

    const result = await Card.deleteOne({ _id: cardId, owner_id: userId });

    if (result.deletedCount == 0) {

        throw new MongooseError('You are not allowed to delete this card!');
    }

    await User.findByIdAndUpdate({ _id: userId }, { $pull: { cards: { _id: cardId } } });
    // await session.commitTransaction();
}
    



//list all cards per user
exports.getUserCards = (userId) => {


    return Card.find({ owner_id: userId }).lean();
}

function generateCardNumber(schemaProvider) {

    let cardNumber = `${schemaProvider}`;

    for (let i = 1; i <= 15; i++) {

        let digit = Math.floor(Math.random() * 10);
        cardNumber = cardNumber.concat(digit);
    }
    return Number(cardNumber);
}

function createExpirationDate() {

    const today = new Date(Date.now());
    const expYear = today.getFullYear() + 1;
    const expMonth = today.getMonth();

    return `${String(expMonth).padStart(2, '0')}/${expYear}`;
}

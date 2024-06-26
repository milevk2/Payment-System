const { Card } = require('../models/CardModel.js');
const { MongooseError } = require('mongoose');
const User = require('../models/UserModel.js');

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

exports.deleteCard = async (userId, cardId) => {

    //TODO: configure the mongodb in order to be able to process transactions and write the below code as a DB transaction:
    // const session = await mongoose.startSession();
    // session.startTransaction()

    const result = await Card.deleteOne({ _id: cardId, owner_id: userId });

    if (result.deletedCount == 0) {

        throw new MongooseError('You are not allowed to delete this card!');
    }

    await User.findByIdAndUpdate({ _id: userId }, { $pull: { cards: { _id: cardId } } });
    return result;
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

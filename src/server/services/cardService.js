const { Card } = require('../models/CardModel.js');
const mongoose = require('mongoose');
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

    const session = await mongoose.startSession();

    session.startTransaction();

    try {

        await Card.deleteOne({ _id: cardId }).session(session);
        await User.findByIdAndUpdate({ _id: userId }, { $pull: { cards: {_id: cardId} } }).session(session);
        await session.commitTransaction();
        
    }
    catch (err) {

        console.log(err.message);
        await session.abortTransaction();
    }
    finally{
    
        session.endSession();
    }
}


//list all cards per user
exports.getUserCards = (userId) => {


    return Card.find({ owner_id: userId }).lean();


}

function generateCardNumber(schemaProvider) {

    let cardNumber = `${schemaProvider}`;
    const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

    for (let i = 1; i <= 15; i++) {

        let randIndex = Math.floor(Math.random() * digits.length);
        const digit = digits[randIndex];

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

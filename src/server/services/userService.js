const User = require('../models/UserModel.js');
const bcrypt = require('bcrypt');
const jwtSecret = require('../keys/jwtSecret.js')
const jwt = require('../lib/promisifiedJwt.js')
const { createCard } = require('./cardService.js');
const { MongooseError } = require('mongoose');

exports.createUser = async (data) => {

    return await User.create(data);
}

exports.getUserData = async (userId) => {

    return await User.findOne({_id: userId}).lean();
}


exports.login = async (email, password) => {


    const user = await User.findOne({ email });

    if (!user) {
        throw new MongooseError('User not found!');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        throw new MongooseError('Invalid password');
    }

    const token = await jwt.sign({ userId: user._id, first_name: user.first_name, last_name: user.last_name }, jwtSecret, { expiresIn: '1h' });

    return token;
}

exports.addCard = async (userId, schemaProvider, cardholder) => {
    
    const user = await User.findOne({ _id: userId });

    if (user.cards.length >= 5) {
        throw new MongooseError('The card limit of 5 has been reached!');
    }

    const card = await createCard(userId, schemaProvider, cardholder);
    user.cards.push(card);
    await user.save();
}
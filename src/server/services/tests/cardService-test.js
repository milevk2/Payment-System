const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const cardService = require('../cardService');
const userService = require('../userService');
const mongoose = require('mongoose');
const { MongooseError } = require('mongoose');
chai.use(chaiAsPromised);
const expect = chai.expect;

// Connect to the test database

before(async () => {
    await mongoose.connect('mongodb://localhost:27018/test');
    await mongoose.connection.db.dropDatabase();
});

// Disconnect from the database after tests
after(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect();
});

let user;
let userId;
let cardholder;

before(async () => {

    
    user = await userService.createUser({

        first_name: "John",
        last_name: "Doe",
        email: "john.doe@example.com",
        password: "password",
        address: "123 Main St",
        phone: "123-456-7890",
        DOB: new Date('1990-01-01'),
    })

    userId = user._id.toString();
    cardholder = `${user.first_name} ${user.last_name}`
})


describe('createCard', async () => {

    it('result to exist', async () => {

        const result = await cardService.createCard(userId, '3', cardholder);
        expect(result).to.exist;
    });

    it('result to be an object', async () => {

        const result = await cardService.createCard(userId, '3', cardholder);
        expect(result).to.be.an('object');
    });

    it('Saved owner_id to be equal to userId passed as argument', async () => {

        const result = await cardService.createCard(userId, '3', cardholder);
        expect(result.owner_id).to.equal(userId);
    });

    it('Saved cardholder to be what has been passed as argument', async () => {

        const result = await cardService.createCard(userId, '3', cardholder);
        expect(result.cardholder).to.equal(cardholder);
    });

    it('Saved cardnumber to be a string', async () => {

        const result = await cardService.createCard(userId, '3', cardholder);
        expect(result.card_number).to.be.a('string');
    });

    it('Saved cardnumber to be masked', async () => {

        const result = await cardService.createCard(userId, '3', cardholder);
        const regex = /^\d{6}(?:\*{6})\d{4}$/;
        expect(regex.test(result.card_number)).to.be.true;
    });
});

describe('deleteCard', async () => {

    it('should delete the card from the cards database and from user`s card array', async () => {

        const cardId = await userService.addCard(userId, '3', cardholder);
        const deleted = await cardService.deleteCard(userId, cardId);
        expect(deleted.deletedCount).to.equal(1);
        expect(user.cards.length).to.equal(0);
    });

    it('should throw an error if the user tries to delete a card which is not owned', async () => {

        const cardId = await userService.addCard(userId, '3', cardholder);

        try {
            expect(async function () { await cardService.deleteCard('1234', cardId) });
        }
        catch (err) {

            expect(err).to.be.a(MongooseError);
            expect(err.message).to.be('You are not allowed to delete this card!');
        }
    });
});

describe('getUserCards', async () => {

    it('Should return an array with the correct length (for this test - 3)', async () => {

        /*added due to email: required: true 
            This way the test is more isolated.
        */
        const mockUser = await userService.createUser({

            first_name: "Mark",
            last_name: "Doe",
            email: "mark.doe@example.com",
            password: "password",
            address: "123 Main St",
            phone: "123-456-7890",
            DOB: new Date('1990-01-01'),
        })

        await userService.addCard(mockUser._id, '3', `${mockUser.first_name} ${mockUser.last_name}`);
        await userService.addCard(mockUser._id, '4',  `${mockUser.first_name} ${mockUser.last_name}`);
        await userService.addCard(mockUser._id, '5',  `${mockUser.first_name} ${mockUser.last_name}`);

        const resultArr = await cardService.getUserCards(mockUser._id);
        expect(resultArr).to.be.an.instanceof(Array);
        expect(resultArr.length).to.equal(3);
    });
});




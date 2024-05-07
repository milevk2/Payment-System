const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const userService = require('../userService');
const cardService = require('../cardService');
const mongoose = require('mongoose');
const { MongooseError } = require('mongoose');
const chaiJWT = require('chai-jwt');
const secret = require('../../keys/jwtSecret.js')

chai.use(chaiAsPromised);
chai.use(chaiJWT);
const expect = chai.expect;

let userDoc;
let userPass = '123'

before(async () => {

    await mongoose.connect('mongodb://localhost:27018/test');

    const userData = {

        first_name: "John",
        last_name: "Doe",
        email: "neo@matrix.com",
        password: '123',
        address: "123 Main St",
        phone: "123-456-7890",
        DOB: new Date('1990-01-01'),
    }
    userDoc = await userService.createUser(userData);
});

// Disconnect from the database after tests
after(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect();
});


describe('createUser', async () => {

    it('should create a new user', async () => {

        expect(userDoc).to.exist;
    });

    it('result should exist', async () => {

        expect(userDoc).to.exist;
    });

    it('result should be an object', async () => {

        expect(userDoc).to.be.an('object');
    });

    it('the password string should be different(password hashed)', async () => {

        expect(userDoc.password).to.not.include("password");
    });

    it('customerId must exist', async () => {

        expect(userDoc.customerId).to.exist;
    });

    it('customerId must start witch C0', async () => {

        expect(userDoc.customerId.slice(0, 2)).to.include('C0');
    });

    it('initial balance must be 0', async () => {

        expect(userDoc.balance).to.equal(0);
    });
});

describe('getUserData', async () => {

    let foundUserDoc;

    before(async () => {
        foundUserDoc = await userService.getUserData(userDoc._id.toString());
    })

    it('Should return user details', async () => {
        expect(foundUserDoc).to.exist;
    });

    it('The first name matches', async () => {
        expect(foundUserDoc.first_name).to.equal(userDoc.first_name);
    });

    it('The last name matches', async () => {
        expect(foundUserDoc.last_name).to.equal(userDoc.last_name);
    });

    it('The email matches', async () => {
        expect(foundUserDoc.email).to.equal(userDoc.email);
    });

    it('The address matches', async () => {
        expect(foundUserDoc.address).to.equal(userDoc.address);
    });

    it('The DOB matches', async () => {
        expect(foundUserDoc.DOB).to.deep.equal(userDoc.DOB);
    });

    it('The cards arrays match', async () => {
        expect(foundUserDoc.cards).to.deep.equal(userDoc.cards);
    });

    it('The phone matches', async () => {
        expect(foundUserDoc.phone).to.equal(userDoc.phone);
    });

    it('The customer id matches', async () => {
        expect(foundUserDoc.customerId).to.equal(userDoc.customerId);
    });
});


describe('login', async () => {

    it('Throws an error if user is not found by email', async () => {

        try {
            expect(async function () { await userService.login('fakeEmail@gmail.com', '123') });

        }
        catch (err) {

            expect(err).to.be.a(MongooseError);
            expect(err.message).to.be('User not found!');
        }
    });

    it('Throws an error if user provides an incorrect password', async () => {

        try {
            expect(async function () { await userService.login(userDoc.email, 'incorrect') });

        }
        catch (err) {

            expect(err).to.be.a(MongooseError);
            expect(err.message).to.be('Invalid password');
        }
    });

    it('Returns a signed json web token if all is correct', async () => {

        const token = await userService.login(userDoc.email, userPass);
        expect(token).to.be.signedWith(secret);
    });
});


describe('addCard', async () => {

    it('Should add 5 cards to the user`s card array', async () => {

        const userId = userDoc._id.toString();
        const cardholder = `${userDoc.first_name} ${userDoc.last_name}`

        await userService.addCard(userId, '3', cardholder);
        await userService.addCard(userId, '4', cardholder);
        await userService.addCard(userId, '5', cardholder);
        await userService.addCard(userId, '5', cardholder);
        await userService.addCard(userId, '5', cardholder);

        const resultArr = await cardService.getUserCards(userId);

        expect(resultArr).to.be.an.instanceof(Array);
        expect(resultArr.length).to.equal(5);
    });

    it('Should throw an error if we try to add another card (more than 5)', async () => {

        const userId = userDoc._id.toString();
        const cardholder = `${userDoc.first_name} ${userDoc.last_name}`;
        try {
            expect(async function () { await userService.addCard(userId, '3', cardholder) });
        }
        catch (err) {

            expect(err).to.be.a(MongooseError);
            expect(err.message).to.be('The card limit of 5 has been reached!');
        }
    });
});
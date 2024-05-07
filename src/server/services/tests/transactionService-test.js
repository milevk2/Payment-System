const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const userService = require('../userService');
const cardService = require('../cardService');
const transactionService = require('../transactionService');
const mongoose = require('mongoose');
const { MongooseError } = require('mongoose');
chai.use(chaiAsPromised);
const expect = chai.expect;


before(async () => {
    await mongoose.connect('mongodb://localhost:27018/test');
});

// Drop and disconnect from the database after tests
after(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect();

});

let userOne;
let userOne_ID;
let cardholderOne;
let cardNumberOne
let cardIdOne

let userTwo;
let userTwo_ID;
let cardholderTwo;
let cardNumberTwo;
let cardIdTwo;


before(async () => {

    userOne = await userService.createUser({

        first_name: "Stefan",
        last_name: "Todorov",
        email: "stefan.todorov@example.com",
        password: "password",
        address: "123 Main St",
        phone: "123-456-7890",
        DOB: new Date('1990-01-01'),
    })

    userTwo = await userService.createUser({

        first_name: "Georgi",
        last_name: "Ivanov",
        email: "georgi.ivanov@example.com",
        password: "password",
        address: "123 Main St",
        phone: "123-456-7890",
        DOB: new Date('1990-01-01'),
    })

    userOne_ID = userOne._id.toString();
    cardholderOne = `${userOne.first_name} ${userOne.last_name}`;

    userTwo_ID = userTwo._id.toString();
    cardholderTwo = `${userTwo.first_name} ${userTwo.last_name}`;

    const user1 = await cardService.createCard(userOne_ID, '3', cardholderOne);
    const user2 = await cardService.createCard(cardholderTwo, '5', cardholderTwo);

    cardNumberOne = user1.card_number;
    cardNumberTwo = user2.card_number;

    cardIdOne = user1._id;
    cardIdTwo = user2._id;
})


describe('depositFunds', async () => {

    it('result to exist and balance to be 10', async () => {

        const result = await transactionService.depositFunds(userOne_ID, '10', cardNumberOne, cardIdOne);
        expect(result).to.exist;

    });

    it('Deposit amount to be equal to what has been passed as an argument and balance to be 20', async () => {

        const result = await transactionService.depositFunds(userOne_ID, '10', cardNumberOne, cardIdOne);
        expect(result.amount).to.equal(10);

    });

    it('Deposit amount to be equal to what has been passed as an argument and balance to be 30', async () => {

        const result = await transactionService.depositFunds(userOne_ID, '10', cardNumberOne, cardIdOne);
        expect(result.amount).to.equal(10);

    });

    it('Checks if balance of userOne is 30, if it is the previous tests have passed successfully', async () => {

        userOne = await userService.getUserData(userOne_ID);

        expect(userOne.balance).to.equal(30);

    });

    it('Throws an error if deposit is 0', async () => {

        try {
            expect(async () => { await transactionService.depositFunds(userOne_ID, '0', cardNumberOne, cardIdOne) });
        }
        catch (err) {

            expect(err).to.be.a(Error);
            expect(err.message).to.be('You can not deposit negative or zero amounts!');
        }
    });

    it('Throws an error if deposit amount is less than 0', async () => {

        try {
            expect(async () => { await transactionService.depositFunds(userOne_ID, '-10', cardNumberOne, cardIdOne) });
        }
        catch (err) {

            expect(err).to.be.a(Error);
            expect(err.message).to.be('You can not deposit negative or zero amounts!');
        }
    });
});


describe('getDeposits', async () => {

    it('Checks if the deposits exist after being created. Currently they should be 3', async () => {

        const deposits = await transactionService.getDeposits(userOne_ID);
        expect(deposits.length).to.equal(3);

    });

    it('Checks if the deposit amounts are equal to user`s balance', async () => {

        const deposits = await transactionService.getDeposits(userOne_ID);
        userOne = await userService.getUserData(userOne_ID);

        const depositsSum = deposits.reduce((acc, curr) => {
            acc += curr.amount;
            return acc;
        }, 0)

        expect(depositsSum).to.equal(userOne.balance);
    });
});

describe('transferFunds', async () => {

    it('Transfers 10 from user1 to user2', async () => {

        const transaction = await transactionService.transferFunds(userOne.customerId, userTwo.customerId, 10);
        expect(transaction.amount).to.equal(10);
    });


    it('Expect user2 balance to be 10 (previously 0)', async () => {

        userTwo = await userService.getUserData(userTwo_ID);
        expect(userTwo.balance).to.equal(10);
    });


    it('Expect user1 balance to be 20 (previously 30)', async () => {

        userOne = await userService.getUserData(userOne_ID);
        expect(userOne.balance).to.equal(20);
    });


    it('Transfers 5 from user2 to user1', async () => {
        const transaction = await transactionService.transferFunds(userTwo.customerId, userOne.customerId, 5);
        expect(transaction.amount).to.equal(5);
    });


    it('Expect user2 balance to be 5 (previously 10)', async () => {

        userTwo = await userService.getUserData(userTwo_ID);
        expect(userTwo.balance).to.equal(5);
    });


    it('Expect user1 balance to be 25 (previously 20)', async () => {

        userOne = await userService.getUserData(userOne_ID);
        expect(userOne.balance).to.equal(25);
    });


    it('Throws an error if we transfer 0', async () => {

        try {
            expect(async () => { await transactionService.transferFunds(userOne.customerId, userTwo.customerId, 0) });
        }
        catch (err) {

            expect(err).to.be.a(MongooseError);
            expect(err.message).to.be('You can not transfer zero or negative amounts!');
        }
    });


    it('Throws an error if we transfer negative amount (-10)', async () => {

        try {
            expect(async () => { await transactionService.transferFunds(userOne.customerId, userTwo.customerId, -10) });
        }
        catch (err) {

            expect(err).to.be.a(MongooseError);
            expect(err.message).to.be('You can not transfer zero or negative amounts!');
        }
    });


    it('Throws an error if receiver do not exist', async () => {

        try {
            expect(async () => { await transactionService.transferFunds(userOne.customerId, 'ID_NOT_EXIST', 10) });
        }
        catch (err) {

            expect(err).to.be.a(MongooseError);
            expect(err.message).to.be('Receiver with customer ID ID_NOT_EXIST not found!');
        }
    });


    it('Throws an error if sender and receiver are the same person', async () => {

        try {
            expect(async () => { await transactionService.transferFunds(userOne.customerId, userOne.customerId, 10) });
        }
        catch (err) {

            expect(err).to.be.a(MongooseError);
            expect(err.message).to.be('You can not transfer funds to yourself!');
        }
    });


    it('Throws an error if the balance is less than transaction amount', async () => {

        try {
            expect(async () => { await transactionService.transferFunds(userOne.customerId, userTwo.customerId, 100) });
        }
        catch (err) {

            expect(err).to.be.a(MongooseError);
            expect(err.message).to.be('You can not transfer amounts larger than your account balance! Please deposit more funds from the dashboard!');
        }
    });
});

describe('getUserTransactions', async () => {

    it('Expect that user1 has sent 1 transaction and has received 1 transaction', async () => {

        const { sent, received } = await transactionService.getUserTransactions(userOne.customerId);
        expect(sent.length).to.equal(1);
        expect(received.length).to.equal(1);
    });

    it('Expect that user2 has sent 1 transaction and has received 1 transaction', async () => {

        const { sent, received } = await transactionService.getUserTransactions(userTwo.customerId);
        expect(sent.length).to.equal(1);
        expect(received.length).to.equal(1);
    });

    it('User 1 now sending 2 transactions x 10 to user 2', async () => {

        await transactionService.transferFunds(userOne.customerId, userTwo.customerId, 10);
        await transactionService.transferFunds(userOne.customerId, userTwo.customerId, 10);

    });

    it('User 1 now must have sent 3 transactions and received 1', async () => {

        const { sent, received } = await transactionService.getUserTransactions(userOne.customerId);
        expect(sent.length).to.equal(3);
        expect(received.length).to.equal(1);
    });

    it('User 2 now must have sent 1 transaction and received 3', async () => {

        const { sent, received } = await transactionService.getUserTransactions(userTwo.customerId);
        expect(sent.length).to.equal(1);
        expect(received.length).to.equal(3);
    });
});


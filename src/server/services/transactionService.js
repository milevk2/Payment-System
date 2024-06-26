const Deposit = require('../models/DepositModel.js');
const User = require('../models/UserModel.js');
const Transaction = require('../models/TransactionModel.js');
const generateId = require('../lib/generateId.js');
const { MongooseError } = require('mongoose');

//Deposit funds into a user’s account using a credit card.
exports.depositFunds = async (userId, amount, card_number, card_id) => {

    if (amount <= 0) {

        throw new Error('You can not deposit negative or zero amounts!')
    }

    const deposit_date = new Date(Date.now());

    const user = await User.findOne({ _id: userId });

    //TODO: the below must be configured as a DB transaction:
    user.balance = user.balance + Number(amount);

    await user.save();
    return await Deposit.create({ userId, amount, card_number, card_id, deposit_date });
}

exports.getDeposits = async (userId) => {

    return await Deposit.find({ userId: userId });

}

//Transfer funds to another user account.
exports.transferFunds = async (sender, receiver, amount) => {

    if (amount <= 0) {

        throw new MongooseError('You can not transfer zero or negative amounts!');
    }

    const tid = generateId('T');
    const transaction_date = new Date(Date.now());
    amount = Number(amount);

    //TODO: the below must be configured as a DB transaction:
    const senderDoc = await User.findOne({ customerId: sender });
    const receiverDoc = await User.findOne({ customerId: receiver });

    if (!receiverDoc) {

        throw new MongooseError(`Receiver with customer ID ${receiver} not found!`);
    }

    if (sender == receiver) {

        throw new MongooseError('You can not transfer funds to yourself!')
    }

    if (senderDoc.balance < amount) {

        throw new MongooseError('You can not transfer amounts larger than your account balance! Please deposit more funds from the dashboard!')
    }

    senderDoc.balance = Number(senderDoc.balance) - amount;
    receiverDoc.balance = Number(receiverDoc.balance) + amount;

    await senderDoc.save();
    await receiverDoc.save();
    return await Transaction.create({ tid, sender, receiver, amount, transaction_date });

}
//List all transactions per user.
exports.getUserTransactions = async (customerId) => {

    return {
        sent: (await Transaction.find({ sender: customerId }).lean()).map(formatDate),
        received: (await Transaction.find({ receiver: customerId }).lean()).map(formatDate)
    };

}

function formatDate(transaction) {

    const date = transaction.transaction_date;
    transaction.transaction_date = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth()).padStart(2, '0')}/${date.getFullYear()}`
    return transaction;

}

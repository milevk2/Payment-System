const Deposit = require('../models/DepositModel.js');
const User = require('../models/UserModel.js');
const Transaction = require('../models/TransactionModel.js');
const generateId = require('../lib/generateId.js');
const { MongooseError } = require('mongoose');

//Deposit funds into a user’s account using a credit card.
exports.depositFunds = async (userId, amount, card_number, card_id) => {

    const deposit_date = new Date(Date.now());

    const user = await User.findOne({ _id: userId });
    user.balance = user.balance + Number(amount);

    //TODO: the below must be configured as a DB transaction:
    await user.save();
    await Deposit.create({ userId, amount, card_number, card_id, deposit_date });
}

//Transfer funds to another user account.
exports.transferFunds = async (sender, receiver, amount) => {

    const tid = generateId('T');
    const transaction_date = new Date(Date.now());

    //TODO: the below must be configured as a DB transaction:
    const senderDoc = await User.findOne({ customerId: sender });
    const receiverDoc = await User.findOne({ customerId: receiver });

    if (!receiverDoc) {

        throw new MongooseError(`Receiver with customer ID ${receiver} not found!`);
    }

    senderDoc.balance = Number(senderDoc.balance) - Number(amount);
    receiverDoc.balance = Number(receiverDoc.balance) + Number(amount);

    await senderDoc.save();
    await receiverDoc.save();
    await Transaction.create({ tid, sender, receiver, amount, transaction_date });

}
//List all transactions per user.
exports.getUserTransactions = async (customerId) => {
  

    return await Transaction.find({$or: [{sender: customerId}, {receiver: customerId}]}).lean();

}



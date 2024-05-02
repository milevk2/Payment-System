// const transaction = require("../models/TransactionModel.js");
// const merchant = require("../models/U.js")

exports.getAllTransactions = async () => {

    const data = await transaction.find().lean();
    return data;
}

exports.getMerchantDetails = async (id) => {


    const merchantDetails = await merchant.findOne({ MID: id }).lean();

    return merchantDetails;

}

exports.addComment = async (mid, comment) => {

    const updatedMerchant = await merchant.findOneAndUpdate(
        { MID: mid },
        { $push: { comments: comment } },
        { new: true }
    );

    if (!updatedMerchant) throw new Error('Merchant not found or not updated!')

    return updatedMerchant.toObject();

}
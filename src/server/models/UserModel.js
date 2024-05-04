const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { CardSchema } = require('./CardModel.js');

const UserSchema = new mongoose.Schema({

    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    
    address: String,
    phone: String,
    DOB: Date,

    cards: {
        type: [CardSchema],
        validate: [cardArrayLimit, '{PATH} exceeds the limit of 5']
    },    
    balance: Number
})

function cardArrayLimit(arr) {

    return arr.length <=5 ;
}

UserSchema.virtual("rePassword").set(function (value) {

    if (value != this.password) {
        throw new mongoose.MongooseError("Password missmatch!");
    }
});


UserSchema.pre("save", async function () {

    if (this.__v !==  undefined) return;  //if we do not do this, each modification of the document will trigger this function, which is not expected behaviour;

    const hash = await bcrypt.hash(this.password, 10);  
    this.password = hash;
    this.balance = 0;

});

const User = mongoose.model('User', UserSchema);
module.exports = User;
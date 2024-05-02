const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({

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
    balance: Number
})

userSchema.virtual("rePassword").set(function (value) {

    if (value != this.password) {
        throw new mongoose.MongooseError("Password missmatch!");
    }
});


userSchema.pre("save", async function () {

    const hash = await bcrypt.hash(String(this.password), 10);
    this.password = hash;
    this.balance = 0;

});

const User = mongoose.model('User', userSchema);
module.exports = User;
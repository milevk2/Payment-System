const User = require('../models/UserModel.js');
const bcrypt = require('bcrypt');
const jwtSecret = require('../keys/jwtSecret.js')
const jwt = require('jsonwebtoken');

exports.createUser = async (data) => {
    
    return await User.create(data);
}

exports.autenticateUser = () => {


}

exports.login = async (email, password) => {

  
    const user = await User.findOne({ email });

    if (!user) {
        throw new Error('User not found!')
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
       throw new Error('Invalid password');
    }

    const token = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: '1h' });

    console.log(token);
    return token;

}

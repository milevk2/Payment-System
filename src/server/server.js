const express = require('express');
const dbConnect = require('./configurations/dbConfig.js');
const serverConfig = require('./configurations/serverConfig.js');
const userService = require('./services/userService.js');
const cardService = require('./services/cardService.js');
const transactionService = require('./services/transactionService.js');

const app = express();
serverConfig(app);

(async function () {
    try {
        await dbConnect();
        console.log('Successfully connected to the DB!');
    }
    catch (err) {

        console.log(err);
    }
})()

app.get('/', (req, res) => {

    const isToken = !req.isToken;
    res.render('home', { isToken });

})

app.get('/login', (req, res) => {

    const isToken = !req.isToken;
    res.render('login', { isToken });

})

app.post('/login', async (req, res) => {

    const { email, password } = req.body;
    const isToken = !req.isToken;

    try {

        const jwtToken = await userService.login(email, password);
        res.cookie('jwtToken', jwtToken, { httpOnly: true, maxAge: 3600000 });
        res.redirect('/dashboard');
    }
    catch (error) {
        console.log(error);
        const err = { message: 'Invalid username or password!' }
        res.render('error', { err, isToken });

    }
})

app.get('/dashboard', async (req, res) => {

    const isToken = !req.isToken;

    if (!req.userData) {

        res.send('You are not authorized!');
        return;
    }
    const { cards, balance } = await userService.getUserData(req.userData.userId);

    res.render('dashboard', { cards, balance, isToken });

})

app.post('/createCard', async (req, res) => {

    const { schemaProvider } = req.body;

    if (!req.userData) {

        res.send('You are not authorized!');
        return;
    }

    const { userId, first_name, last_name } = req.userData;

    try {

        await userService.addCard(userId, schemaProvider, `${first_name} ${last_name}`);
        res.redirect('/dashboard');
    }
    catch (err) {

        res.render('error', { err })
        console.log(err.message);
    }
})

app.get('/deleteCard/:id', async (req, res) => {

    const cardId = req.params.id;
    const { userId } = req.userData;

    if (!req.userData) {

        res.send('You are not authorized!');
        return;
    }

    try {
        await cardService.deleteCard(userId, cardId);
        res.redirect('/dashboard');
    }
    catch (err) {

        res.render('error', { err });
    }
})

app.get('/register', (req, res) => {

    const isToken = !req.isToken;

    res.render('register', { isToken });
})

app.post('/register', async (req, res) => {

    const isToken = !req.isToken;

    try {
        await userService.createUser(req.body);
        const successMessage = { message: 'You have been successfully registered!' }
        res.render('login', { successMessage, isToken });
    }
    catch (err) {

        res.render('register', { err });
    }
})

app.post('/depositFunds', async (req, res) => {


    const { card_id, card_number, amount } = req.body;
    const userId = req.userData.userId;

    try {
        await transactionService.depositFunds(userId, amount, card_number, card_id);
        res.redirect('/dashboard');
    }
    catch (err) {
        
        console.log(err);
        res.render('error', {err})
    }
})

app.post('/transfer', async(req, res)=> {

    const sender = req.userData.customerId;
    const receiver = req.body.customerId;
    const amount = req.body.amount;

    try{
        await transactionService.transferFunds(sender, receiver, amount);
        res.redirect('/dashboard');
    }
    catch(err){
        console.log(err);
        res.render('error', {err})
    }
})

app.get('/transactions', async(req, res) => {

    const customerId = req.userData.customerId;

    const userTransactions  = await transactionService.getUserTransactions(customerId);

    res.render('transactions', {userTransactions});

})

app.get('/logout', (req, res) => {

    res.clearCookie('jwtToken');
    res.redirect('/');
})


app.listen(3000, () => console.log('The server is listening on port 3000!'))
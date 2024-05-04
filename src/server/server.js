const express = require('express');
const dbConnect = require('./configurations/dbConfig.js');
const serverConfig = require('./configurations/serverConfig.js');
const userService = require('./services/userService.js');
const cardService = require('./services/cardService.js');

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

    res.render('home', { title: 'Welcome' });

})

app.get('/login', (req, res) => {

    res.render('login');

})

app.post('/login', async (req, res) => {

    const { email, password } = req.body;

    try {

        const jwtToken = await userService.login(email, password);
        res.cookie('jwtToken', jwtToken, { httpOnly: true, maxAge: 3600000 })
        res.redirect('/dashboard');
    }
    catch (err) {
        console.log(err);
        res.send('User name or password do not match!');
    }
})

app.get('/dashboard', async (req, res) => {

    if (!req.userData) {

        res.send('You are not authorized!')
        return;
    }
    const cards = await cardService.getUserCards(req.userData.userId)

    res.render('cards', { cards })

})

app.post('/createCard', async (req, res) => {

    const { schemaProvider } = req.body;

    if (!req.userData) {

        res.send('You are not authorized!')
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

    await cardService.deleteCard(userId, cardId);
    res.redirect('/dashboard');

})

app.get('/register', (req, res) => {

    res.render('register');
})

app.post('/register', async (req, res) => {

    try {
        await userService.createUser(req.body);
        const successMessage = { message: 'You have been successfully registered!' }
        res.render('login', { successMessage });
    }
    catch (err) {

        res.render('register', { err });
    }
})



app.listen(3000, () => console.log('The server is listening on port 3000!'))
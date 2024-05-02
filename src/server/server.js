const express = require('express');
const dbConnect = require('./configurations/dbConfig.js');
const serverConfig = require('./configurations/serverConfig.js');
const userService = require('./services/userService.js');

const app = express();
serverConfig(app);

try {
    dbConnect();
    console.log('Successfully connected to the DB!');
}
catch (err) {

    console.log(err);
}

app.get('/', (req, res) => {

    res.render('home', { title: 'Welcome' });

})

app.get('/login', (req, res) => {

    res.render('login');

})

app.post('/login', async (req, res) => {

    const { email, password } = req.body;

    try {

       const jwtToken =  await userService.login(email, password);
       res.cookie('jwtToken', jwtToken, { httpOnly: true, maxAge: 3600000 })
       res.send('Login successful!');

    }
    catch (err) {
        console.log(err);
        res.send('User name or password do not match!');
    }

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


app.get('/getMerchant', async (req, res) => {

    try {
        const merchantDetails = await getMerchantDetails(req.query.MID);

        if (merchantDetails.length == 0) throw new Error('The resource was not found!');
        res.render('merchantProfile.hbs', { ...merchantDetails });
    }
    catch (err) {

        res.status(404).render('404.hbs');

    }
})

app.post('/addComment', async (req, res) => {

    const { MID, comment } = req.body;

    try {
        const merchantDetails = await addComment(MID, comment);

        console.log(merchantDetails);
        res.render('merchantProfile.hbs', { ...merchantDetails })
    }
    catch (err) {

        console.log(err);
        res.render('404.hbs')

    }


})

app.listen(3000, () => console.log('The server is listening on port 3000!'))
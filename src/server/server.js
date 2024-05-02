const express = require('express');
const handlebarsConfig = require('./configurations/handlebarsConfig.js');
const dbConnect = require('./configurations/dbConfig.js');
const { getAllTransactions, getTransaction, getMerchantDetails, addComment } = require('./services/dataSearch.js');

const app = express();
handlebarsConfig(app);
app.use(express.urlencoded({ extended: true }));

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
        res.render('merchantProfile.hbs', {...merchantDetails})
    }
    catch (err) {

        console.log(err);
        res.render('404.hbs')

    }


})

app.listen(3000, () => console.log('The server is listening on port 3000!'))
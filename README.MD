# **Payments System**

A payments system where users can register, add(generate) cards, deposit funds from cards to their user/client accounts and transfer funds between each other.

By default the `server` is listening on port `3000`, while the `database` is on port `27018`. Adjust them as per your needs from `server.js` and `dbConfig.js `respectively.

- [Key Features](#key-features)
- [Dependencies](#dependencies)
- [Getting Started](#getting-started)
- [Services](#services)
    - [Card Service](#card-service)
    - [Transaction Service](#transaction-service)
    - [User Service](#user-service)
- [Models](#models)
    - [Card Model](#card-model)
    - [Deposit Model](#deposit-model)
    - [Transaction Model](#transaction-model)
    - [User Model](#user-model)
- [Helper Functions](#helper-functions)
- [Middlewares](#Middlewares)
    - [Authorization Middleware](#authorization-middleware)
    - [Route Guard Middleware](#route-guard-middleware)
    - [Server Logger Middleware](#server-logger-middleware)
- [Unit Tests](#unit-tests)
- [Swagger](#swagger)

# **Key Features**

1. Guests do not have access to services.
2. Registered users have their own unique customerId generated with which they can transact with other users.
  - the customerId is in the following format: `C0C6Z6M1V8H1` and the server provides it after successful user registration ;
3. Registered users can add cards (it is a mocking service, not a real credit card) - they are being automatically generated.
4. Users can delete their cards.
5. Assuming the cards are real and always with positive balances - users can deposit funds to their user/customer accounts.
6. If user has enough balance on the account, they could transfer funds to other user/customer accounts.
7. User can view all related transactions separated in two tables:
    - received transactions;
    - sent transactions;
8. Users can not transfer zero or negative amounts - both for deposits and transactions.
9. User authentication through json web token (jwt) which is being signed and sent after user login;

# Getting Started
To get started with this project, follow these steps:

1. Clone the repository.
2. Install dependencies with npm install.
3. Open the terminal in src/server directory.
4. Type npm run start in the terminal and hit enter.
5. Visit `http://localhost:3000/`.

# Dependencies


| Dependency            | Version   |
|-----------------------|-----------|
| [bcrypt](https://www.npmjs.com/package/bcrypt)                | ^5.1.1    |
| [cookie-parser](https://www.npmjs.com/package/cookie-parser)         | ^1.4.6    |
| [express](https://www.npmjs.com/package/express)               | ^4.18.2   |
| [express-handlebars](https://www.npmjs.com/package/express-handlebars)    | ^7.1.2    |
| [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)          | ^9.0.2    |
| [mongoose](https://www.npmjs.com/package/mongoose)              | ^8.1.1    |

### DevDependencies:

| Dependency            | Version   |
|-----------------------|-----------|
| [chai](https://www.npmjs.com/package/chai)                  | ^4.4.1    |
| [chai-as-promised](https://www.npmjs.com/package/chai-as-promised)      | ^7.1.1    |
| [chai-jwt](https://www.npmjs.com/package/chai-jwt)              | ^2.0.0    |
| [mocha](https://www.npmjs.com/package/mocha)                 | ^10.4.0   |
| [nodemon](https://www.npmjs.com/package/nodemon)               | ^3.1.0    |

*language model helped me with generation of this table;

JSON format to copy:

```json

 {
  "dependencies": {
    "bcrypt": "^5.1.1",
    "cookie-parser": "^1.4.6",
    "express": "^4.18.2",
    "express-handlebars": "^7.1.2",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.1.1"
  },
  "devDependencies": {
    "chai": "^4.4.1",
    "chai-as-promised": "^7.1.1",
    "chai-jwt": "^2.0.0",
    "mocha": "^10.4.0",
    "nodemon": "^3.1.0"
  }
}

```


# Services

**N.B! Most services must be implemented as a DB transactions in order to achieve atomicity , but I failed to configure the mongoDB to work with transactions! If working with an actual DB this would have been solved with couple of lines of code.**


There are 3 main services with their own functionalities:

## Card Service 

`cardService.js` responsible for:
- card creation; - [Create Card](#create-card);
- card deletion - [Delete Card](#delete-card);
- getting all cards related to certain user - [Get User Cards](#get-user-cards);

cardService utilizes 2 private functions:

`generateCardNumber` - creating a random card number for the currently created card;
`createExpirationDate` - creating an expiration date for the currently created card;

### Create Card

It is an async function which accepts 3 parameters:

```javascript
    createCard(userId, schemaProvider, cardholder);
```

They are being supplied by the front-end's form.

The function creates a DB document and returns it: 
    
```javascript

    return await Card.create({

        owner_id: userId,
        cardholder: cardholder,
        card_number: cardNumber,
        expiration: expDate
    });
```
`card_number` and `expiration` properties are being generated by `generateCardNumber` and `createExpirationDate`;

### Delete Card

It is an async function which accepts 2 parameters:

```javascript
 deleteCard(userId, cardId)
```

If database fails to find card which is matching both filters it throws an error:

```javascript

const result = await Card.deleteOne({ _id: cardId, owner_id: userId });

    if (result.deletedCount == 0) {

        throw new MongooseError('You are not allowed to delete this card!');
    }
```
Therefore this is a database guard ensuring that only cards belonging to their users will be deleted.

After deleting the card from the Cards database, we have to delete it from User.cards[] array:

```javascript

await User.findByIdAndUpdate({ _id: userId }, { $pull: { cards: { _id: cardId } } });

```


### Get User Cards

It is a function which returns an array of card documents:

```javascript

exports.getUserCards = (userId) => {

    return Card.find({ owner_id: userId }).lean();
}
```

## Transaction Service 

 `transactionService.js` responsible for:
- Depositing funds- [Deposit Funds](#deposit-funds);
- Getting all deposits by userId - [Get Deposits](#get-deposits);
- Transfering funds between customer accounts - [Funds Transfer](#funds-transfer);
- Getting user transactions - [Get Transactions](#get-transactions);
    
`transactionService` utilizes 1 private function:

`formatDate` - formating card's expiration date for the frontend.


### Deposit Funds

This fnction accepts 4 parameters:

```javascript

  depositFunds (userId, amount, card_number, card_id);

```
 
 It throws an error if the deposited amount is less or equal to zero.


### Get Deposits

Getting all deposits related to cerain userId:

```javascript
    
    exports.getDeposits = async (userId) => {

    return await Deposit.find({ userId: userId });
    }

```

### Funds Transfer

Responsible for transfering the funds between user's accounts:

```javascript
exports.transferFunds = async (sender, receiver, amount) => {

    //...
}
```
- It throws an error if amount is zero or negative;
- It throws an error if the receiver customerId is not found;
- It throws an error if the user is sending funds to themselves, thus sender == receiver;
- It throws an error if the transfer amount is larger than user's available account balance;

After all conditional checks have been passed, we get get both documents - sender and receiver from the database and update their account balances respectively.
Then a transaction document is being created/saved to the database:

```javascript

     return await Transaction.create({ tid, sender, receiver, amount, transaction_date });

```

### Get Transactions

It is a function that returns an object with two arrays: One for the `sent` transactions and one for the `received` transactions:

```javascript

exports.getUserTransactions = async (customerId) => {

    return {
        sent: (await Transaction.find({ sender: customerId }).lean()).map(formatDate),
        received: (await Transaction.find({ receiver: customerId }).lean()).map(formatDate)
    };
}
```

## User Service
**`userService.js` responsible for:**
- Creating new user- [Create User](#create-user);
- Getting user data/details - [Get User Data](#get-user-data);
- Login - [Login](#login);
- Adding cards to User's array - [Add Card](#add-card);
    
### Create User 

It is a function that accepts one parameter - it is a formData object generated by the user registration form on the frontend:

```javascript

    exports.createUser = async (data) => {

    const email = await User.findOne({email: data.email})

    if (email) {

        throw new MongooseError('User with this email already exists!');
    }

    return await User.create(data);
    
    }

```
 
 If the email is taken, a new mongoose error is being thrown.

### Get User Data

This service accepts a userId and returns an object with User's detail as a js object:

```javascript

    exports.getUserData = async (userId) => {

    return await User.findOne({_id: userId}).lean();

    }
```

### Login

This service is responsible for logging in - it accepts an email and password:

```javascript

    exports.login = async (email, password) => {

        //...
    }
```
- It validates if user exists;
- It validates if user has provided a valid password;
- If all conditional checks are passed the function signs a json web token and returns it:

```javascript

    const token = await jwt.sign({ userId: user._id, first_name: user.first_name, last_name: user.last_name, customerId: user.customerId }, jwtSecret, { expiresIn: '1h' });

    return token;

```

### Add Card

This service validates if user has less than 5 cards and if they don't - a `createCard` service is being called, which creates a new card.
Then this card is being pushed to User's cards array:

```javascript

exports.addCard = async (userId, schemaProvider, cardholder) => {
    
    const user = await User.findOne({ _id: userId });

    if (user.cards.length >= 5) {
        throw new MongooseError('The card limit of 5 has been reached!');
    }

    const card = await createCard(userId, schemaProvider, cardholder);
    user.cards.push(card);
    await user.save();
    return card._id;
}

```

# Models

## Card Model

```javascript

const CardSchema = new mongoose.Schema({

    owner_id: String,
    cardholder: String,
    card_number: String,
    expiration: String,
})

```

Prior to saving the db record of the card, there is a pre middleware function called:


```javascript

//this function is used to mask the card number:

CardSchema.pre("save", maskCard);

function maskCard() {

    const masked = this.card_number.slice(0, 6)
        .concat('******')
        .concat(this.card_number
            .slice(-4));

    this.card_number = masked;
}

```

## Deposit Model

```javascript

const DepositSchema = new mongoose.Schema({

    userId: String,
    amount: Number,
    card_number: String,
    card_id: String,
    deposit_date: Date,

})

```


## Transaction Model

```javascript

const TransactionSchema = new mongoose.Schema({

    tid: String,
    sender: String,
    receiver: String,
    amount: Number,
    transaction_date: Date,

})

```


## User Model

User Model Schema:

```javascript

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
        unique: true,
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
    balance: Number,
    customerId: String
})

```

Before creating and modifying the user there is a virtual function which checks whether user's password and rePassword match:

```javascript

UserSchema.virtual("rePassword").set(function (value) {

    if (value != this.password) {
        throw new mongoose.MongooseError("Password missmatch!");
    }
});

```

Also there is a pre save middleware which encrypts the password and generates user's customerId by using util function `generateId` , then sets the user's account balance to 0:


```javascript


UserSchema.pre("save", async function () {

    if (this.__v !==  undefined) return;  //only generate customerId, password hash and set balance to 0 if document does not exist; 

    this.customerId = generateId('C0');
    this.password = await bcrypt.hash(this.password, 10);
    this.balance = 0;
});

```

# Helper Functions

1. `generateId` - it is used to generate random ID's. It accepts id_type (string) as an argument, which is the substring the ID starts with:

- 'C0' - for customerId's;
- 'T' - for transaction ID's (tid);

```javascript

function generateId(id_type) {

    let id = id_type;
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

    for (let i = 1; i <= 10; i++) {

        let character = '';

        if (i % 2 == 0) {

            character = Math.floor(Math.random() * 10);
            id = id.concat(character);
            continue;
        }

        character = letters[Math.floor(Math.random() * letters.length)];
        id = id.concat(character);
    }
    return id;
}


```
2. `promisifiedJwt` dictionary:

This has been created in order to ease the work with jwt token.

```javascript

const jsonwebtoken = require('jsonwebtoken');
const { promisify } = require('util');

const jwt = {

    sign: promisify(jsonwebtoken.sign),
    verify: promisify(jsonwebtoken.verify)
}

module.exports = jwt;


```

# Middlewares
- [Authorization Middleware](#authorization-middleware)
- [Route Guard Middleware](#route-guard-middleware)
- [Server Logger Middleware](#server-logger-middleware)


## Authorization Middleware
`authMiddleWare` takes the jwtToken from the request's cookies, verifies, then saves the decodedToken in request's userData property and sets request's isToken property to true.

```javascript
const decodedToken = await jwt.verify(token, secret);
req.userData = decodedToken;
req.isToken = true;

```

if an error occurs, it clears the client's jwt token and redirects to login page.


## Route Guard Middleware

`routeGuardMiddleware` - checks whether the user has the needed token in order to access guarded endpoints, accessible only by logged in users:

1. /dashboard
2. /createCard
3. /deleteCard
4. /depositFunds
5. /transfer
6. /transactions

If user do not have token, a status `403` is being sent and then rendering message `Not authorized or your session has expired!`

## Server Logger Middleware

For each request it is logging the requested path and it's date and time in the following format:

```bash
<DD/MM/YYYY:HH:MM:SS>: /

<09/05/2024:11:33:04>: /
```

# Unit Tests

In order to test services, open the /services/tests dir with your terminal.

Here are the commands for testing each service:

1. `userService` 

```bash 
mocha userService-test.js
``` 

2. `cardService` 

```bash 
mocha cardService-test.js
``` 

3. `transactionService` 

```bash 
mocha transactionService-test.js
``` 

# Swagger

Don't rely too much on it as it was generated by language model, it needs to be reviewed and fixed, but this will happen in the future. 

```yaml
openapi: 3.0.0
info:
  title: Express Banking Application Endpoints
  description: Documentation for the endpoints of a banking application built with Express
  version: 1.0.0
servers:
  - url: http://localhost:3000
paths:
  /:
    get:
      summary: Get Home Page
      description: Retrieve the home page of the application.
      responses:
        '200':
          description: OK
          content:
            text/html:
              schema:
                type: string
  /login:
    get:
      summary: Get Login Page
      description: Retrieve the login page of the application.
      responses:
        '200':
          description: OK
          content:
            text/html:
              schema:
                type: string
    post:
      summary: Authenticate User
      description: Authenticate a user and create a session.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email:
                  type: string
                password:
                  type: string
              required:
                - email
                - password
      responses:
        '302':
          description: Redirect to Dashboard
        '400':
          description: Bad Request
        '500':
          description: Internal Server Error
  /dashboard:
    get:
      summary: Get User Dashboard
      description: Retrieve the user's dashboard.
      responses:
        '200':
          description: OK
          content:
            text/html:
              schema:
                type: string
        '401':
          description: Unauthorized
  /createCard:
    post:
      summary: Create a Card
      description: Create a new card for the user.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                schemaProvider:
                  type: string
              required:
                - schemaProvider
      responses:
        '302':
          description: Redirect to Dashboard
        '401':
          description: Unauthorized
        '500':
          description: Internal Server Error
  /deleteCard/{id}:
    get:
      summary: Delete a Card
      description: Delete a card belonging to the user.
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: string
      responses:
        '302':
          description: Redirect to Dashboard
        '401':
          description: Unauthorized
        '500':
          description: Internal Server Error
  /register:
    get:
      summary: Get Registration Page
      description: Retrieve the registration page of the application.
      responses:
        '200':
          description: OK
          content:
            text/html:
              schema:
                type: string
    post:
      summary: Register User
      description: Register a new user.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                // Define properties for user registration
              required:
                - // Specify required fields for registration
      responses:
        '302':
          description: Redirect to Login Page
        '400':
          description: Bad Request
        '500':
          description: Internal Server Error
  /depositFunds:
    post:
      summary: Deposit Funds
      description: Deposit funds to a user's account.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                // Define properties for depositing funds
              required:
                - // Specify required fields for depositing funds
      responses:
        '302':
          description: Redirect to Dashboard
        '400':
          description: Bad Request
        '401':
          description: Unauthorized
        '500':
          description: Internal Server Error
  /transfer:
    post:
      summary: Transfer Funds
      description: Transfer funds between user accounts.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                // Define properties for transferring funds
              required:
                - // Specify required fields for transferring funds
      responses:
        '302':
          description: Redirect to Dashboard
        '400':
          description: Bad Request
        '401':
          description: Unauthorized
        '500':
          description: Internal Server Error
  /transactions:
    get:
      summary: Get User Transactions
      description: Retrieve the transactions of the authenticated user.
      responses:
        '200':
          description: OK
          content:
            text/html:
              schema:
                type: string
        '401':
          description: Unauthorized
        '500':
          description: Internal Server Error
  /logout:
    get:
      summary: Logout
      description: Clear user session and log out.
      responses:
        '302':
          description: Redirect to Home Page
        '500':
          description: Internal Server Error


```
*language model helped me with generation of swagger documentation, it needs to be reviewed, but I do not have the time right now;

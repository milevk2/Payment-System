const mongoose = require('mongoose');

// localhost = 127.0.0.1
const connectionString = "mongodb://127.0.0.1:27017/transactions";

async function dbConnect() {
  await mongoose.connect(connectionString);
}

module.exports = dbConnect;

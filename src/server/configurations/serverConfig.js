const { urlencoded } = require('body-parser');
const serverLogger = require('../middlewares/serverLogger.js');
const handlebarsConfig = require('./handlebarsConfig.js');

function serverConfig(app) {

    app.use(urlencoded({ extended: true }));
    app.use(serverLogger);
    handlebarsConfig(app);
}

module.exports = serverConfig;
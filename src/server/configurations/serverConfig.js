const { urlencoded } = require('body-parser');
const serverLogger = require('../middlewares/serverLogger.js');
const authMiddleWare = require('../middlewares/authMiddleware.js');
const handlebarsConfig = require('./handlebarsConfig.js');
const cookieParser = require('cookie-parser');


function serverConfig(app) {

    app.use(urlencoded({ extended: true }));
    app.use(cookieParser());
    app.use(serverLogger);
    app.use(authMiddleWare);
    handlebarsConfig(app);
}

module.exports = serverConfig;
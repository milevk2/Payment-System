const { urlencoded } = require('body-parser');
const serverLogger = require('../middlewares/serverLogger.js');
const authMiddleWare = require('../middlewares/authMiddleware.js');
const handlebarsConfig = require('./handlebarsConfig.js');
const cookieParser = require('cookie-parser');
const routeGuardMiddleware = require('../middlewares/routeGuardMiddleware.js');

function serverConfig(app) {

    app.use(urlencoded({ extended: true }));
    app.use(cookieParser());
    app.use(serverLogger);
    app.use(authMiddleWare);
    app.use(routeGuardMiddleware);
    handlebarsConfig(app);
}

module.exports = serverConfig;

const secret = require('../keys/jwtSecret.js')
const jwt = require('../lib/promisifiedJwt.js')


async function authMiddleWare(req, res, next) {

    const token = req.cookies["jwtToken"];
  
    if (token) {
  
      try {
        const decodedToken = await jwt.verify(token, secret);
        req.userData = decodedToken;
  
      }
      catch (err) {
        res.clearCookie("jwtToken");
        res.redirect('/login')
      }
    }
  
    next();
  }

  module.exports = authMiddleWare;
function isToken(req, res, next) {

    const isToken = !!req.isToken;
  
     
    if (req.path == '/dashboard' || req.path == '/createCard' || req.path == '/deleteCard' || req.path == '/depositFunds' || req.path == '/transfer' || req.path == '/transactions') {
     
        if (!isToken) {
            res.status(403);
            const err = {message: 'Not authorized or your session has expired!'};
            res.render('error', {err});
            return;
        }
    }
    
    next();
}

module.exports = isToken;
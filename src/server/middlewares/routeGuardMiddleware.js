function routeGuardMiddleware(req, res, next) {

    const token = !!req.isToken;
       
    if (req.path == '/dashboard' || req.path == '/createCard' || req.path == '/deleteCard' || req.path == '/depositFunds' || req.path == '/transfer' || req.path == '/transactions') {
     
        if (!token) {
            res.status(403);
            const err = {message: 'Not authorized or your session has expired!'};
            const isToken = !token;
            res.render('error', {err, isToken});
            return;
        }
    }
    
    next();
}

module.exports = routeGuardMiddleware;
const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function(req, res, next) {
    const token = req.header('x-auth-token');
    if (!token) {
        return res.status(400).send('JSON WEB TOKEN HASN"T BEEN SEND YET');
    }
    try {
        const result = jwt.verify(token, config.get('jsonPrivateKey'));
        req.user = result;
        next();
    } catch (err) {
        res.status(400).send('Access Denied!');
    }
}
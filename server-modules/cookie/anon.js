const crypto = require('crypto');

const secret = () => { return crypto.randomBytes(4096).toString(); };

module.exports = {
    secret: secret(),
    cookie: {
        maxAge: 86400000, // 24 hours
        httpOnly: true, 
        secure: false, // Requires https connection
    }, 
    resave: false, 
    saveUninitialized: true
};
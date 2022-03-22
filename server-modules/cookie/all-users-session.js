const crypto = require('crypto');
const session = require('express-session');

const secret = crypto.randomBytes(4096).toString();

module.exports = session({
    secret: secret,
    cookie: {
        maxAge: 3600000, // 1 hour
        httpOnly: true,
        secure: false, // Requires https connection
    },
    resave: false,
    saveUninitialized: true
});
const crypto = require('crypto');
const fs = require('fs');

class User {
    constructor(name, email, password) {
        this.id = this.getNextUserID(),
        this.active = true,
        this.name = name,
        this.email = email,
        this.points = 0,
        this.salt = crypto.randomBytes(512).toString('hex'),
        this.hash = crypto.pbkdf2Sync(password, this.salt, 2048, 128, `sha512`).toString(`hex`);
    }

    getNextUserID() { //increases user ID one by one
        let file = fs.readFileSync('./database/users.json');
        let dataBase = JSON.parse(file);
        return  dataBase.length;
    }
}

module.exports = User;
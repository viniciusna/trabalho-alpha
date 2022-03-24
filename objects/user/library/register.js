const fs = require('fs');

const User = require('../user.js');

const storeUsr = require('./db-writer.js');

function usrReg(data, res) {
    
    let db = JSON.parse(fs.readFileSync('./database/users.json'));
    let lowName = data.name.toLowerCase();
    let lowEmail = data.email.toLowerCase();
    
    let unavailable = db.some( el => { //checks if users and email are available
        
        if (el.name.toLowerCase() === lowName) {
            res.send("Nickname não disponível");
            return true;
        }
        
        else if (el.email.toLowerCase() === lowEmail) {
            res.send("Email não disponível");
            return true;
        }
        
        else
            return false;

    });

    if (!unavailable) { //if yes, register new user
        storeUsr(new User(data.name, data.email, data.password), true);
        res.send("Conta registrada, bem vindo "+data.name+" !");
        return true;
    }
    else 
        return false;

}

module.exports = usrReg;
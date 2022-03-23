const fs = require('fs');

const User = require('../user.js');

const storeUsr = require('./db-writer.js');

function usrReg(data, res) {
    
    let pData;
    try {
        pData = JSON.parse(data);
    } catch (err){
        console.log(err);
        res.send("error");
        return;
    }
    
    let db = JSON.parse(fs.readFileSync('./pDatabase/users.json'));
    let lowName = pData.name.toLowerCase();
    let lowEmail = pData.email.toLowerCase();
    
    let unavailable = db.some( el => {
        
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

    if (!unavailable) {
        storeUsr(new User(pData.name, pData.email, pData.password), true);
        res.send("Conta registrada, bem vindo "+pData.name+" !");
        return true;
    }
    else 
        return false;

}

module.exports = usrReg;
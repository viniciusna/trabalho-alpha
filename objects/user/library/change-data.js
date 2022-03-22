const crypto = require('crypto');
const fs = require('fs');

const dbChanger = require('./db-writer.js');

function userChange(data, res, isDelete = false) {

    let uFile = fs.readFileSync('./database/users.json');
    let pFile = JSON.parse(uFile);

    let userIndex = pFile.findIndex(user => {
        return (data.id === user.name || data.id === user.email);
    });

    if (userIndex === -1) {  //usuario nao encontrado
        res.send("Usuário e/ou senha invalida");
        return false;
    }

    else {
        let hash = crypto.pbkdf2Sync(data.password, pFile[userIndex].salt, 2048, 128, `sha512`).toString(`hex`);

        if (pFile[userIndex].hash === hash) {

            let newSalt = crypto.randomBytes(512).toString('hex'); //gen another salt for safety
            
            dbChanger({
                id: pFile[userIndex].id,
                active: !isDelete, //if isDelete variable is true, set user to disabled status
                email: data.newEmail,
                salt: newSalt, //use new SALT
                hash: crypto.pbkdf2Sync(data.newPassword, newSalt, 2048, 128, `sha512`).toString(`hex`)
            }, false);

            if (isDelete)
                res.send("Sua conta foi desativada, sentiremos sua falta " + pFile[userIndex].name);
            else
                res.send("Dados Alterados");
        
        }
        else //senha errada
            res.send("Usuário e/ou senha invalida");
    }

}

module.exports = userChange;
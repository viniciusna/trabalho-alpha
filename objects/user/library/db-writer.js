//+------------------------------------------------------------------+
//|                     STORES USER ON DATABASE                      |
//+------------------------------------------------------------------+
const fs = require('fs');


module.exports = function (User, isNewUser) { 
    
    fs.readFile('./database/users.json', (err, readData) => { 
        if (err) { console.log("ERROR: User ID: " + User.id + "on reading database: "); throw console.log(err); }
        
        let dataBase = JSON.parse(readData);
        
        if (isNewUser)
            dataBase.push(User);
        else    
            dataBase[Number(User.id)] = User
        
        let toWrite = JSON.stringify(dataBase);
        
        fs.writeFile('./database/users.json', toWrite, (err, out) => {
            if (err) { console.log("ERROR: User ID: " + User.id + "on writing database: "); throw console.log(err) };
        });
    
    });

}
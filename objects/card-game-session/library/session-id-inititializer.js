//+------------------------------------------------------------------+
//|         GET FIRST AVAILABLE MATCH ID ON SERVER INIT              |
//+------------------------------------------------------------------+
const fs = require('fs');

function getNextSessionID() {
    let file = fs.readFileSync('./database/game-sessions.json');
    let dataBase = JSON.parse(file);
    return  dataBase.length;
}

module.exports = getNextSessionID;
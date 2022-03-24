const Active = require('./ws-message.js');

function wsClose(ws) { //connection was closed
    
    let wsIndex = Active.gameArr.indexOf(ws);
    Active.gameArr.splice(wsIndex);  //remove ws of game socket array

    ws.isAlive = false;
    ws.terminate(); //safety
    
}

module.exports = {
    close: wsClose
}
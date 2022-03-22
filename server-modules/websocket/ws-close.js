const Active = require('./ws-message.js');

const reconKeyArr = [];  //store disconnected players keys

function wsClose(ws) { //connection was closed
    console.log("wsClose: ws address: " + ws._socket.remoteAddress + " closed");

    if (ws.aID) //if socket belongs to a match
        reconKeyArr.push(ws.reconKey); //store reconnection key for player reconnection

    let wsIndex = Active.gameArr.indexOf(ws);
    Active.gameArr.splice(wsIndex);  //remove wk on game socket array

    ws.isAlive = false;
    ws.terminate(); //safety
}

module.exports = {
    close: wsClose
}
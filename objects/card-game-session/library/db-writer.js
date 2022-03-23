//+------------------------------------------------------------------+
//|                    STORES MATCH ON DATABASE                      |
//+------------------------------------------------------------------+
const fs = require('fs');

//function stores session on database and sends message to players who have an OPEN socket

module.exports = function (Session, winner, isDc = false) { //IMPORTANT, ONLY ACCEPTS 'draw', 'p1' OR 'p2' STRING TYPES, LOWERCASE
    
    if (Session.player1.ws.readyState === 1) 
        Session.player1.ws.send(JSON.stringify(Session.gameState));
    
    if (Session.player2.ws.readyState === 1) 
        Session.player2.ws.send(JSON.stringify(Session.gameState));
    
    if (winner === 'p1') {  
        if (Session.player1.ws.readyState === 1)    
            Session.player1.ws.send("Voce ganhou!");
        if (isDc)
            Session.player1.ws.close(4001, "O seu oponente desconectou");
        else if (Session.player2.ws.readyState === 1)
            Session.player2.ws.send("Voce perdeu");
        //TODO: check account and give points
    } 
    
    else if (winner === 'p2') {
        if (Session.player1.ws.readyState === 1)
            Session.player1.ws.send("Voce perdeu");
        if (isDc)
            Session.player2.ws.close(4001, "O seu oponente desconectou");
        else if (Session.player2.ws.readyState === 1)
            Session.player2.ws.send("Voce ganhou!");
        //TODO: check account and give points
    }
    
    else if (winner === 'draw') {
        if (Session.player1.ws.readyState === 1) 
            Session.player1.ws.send("Empate!");
        if (Session.player2.ws.readyState === 1)
            Session.player2.ws.send("Empate!");
    }


    
    if (Session.player1.ws.readyState === 1 || Session.player1.ws.readyState === 0) {
       Session.player1.ws.close(1000, 'match has finished'); //close socket and warn front that everything is fine  
       Session.player1.ws.terminate(); //safety
    } 
    if (Session.player2.ws.readyState === 1 || Session.player2.ws.readyState === 0) {
        Session.player2.ws.close(1000, 'match has finished');
        Session.player2.ws.terminate(); //safety
    } 

    Session.player1.reconKey = null; //clear reconnection keys
    Session.player2.reconKey = null;
    
    
    fs.readFile('./database/game-sessions.json', (err, readData) => { //save match data on database
        if (err) { console.log("ERROR: SessionNum:" + Session.sID + "on reading database: "); throw console.log(err); }
        let dataBase = JSON.parse(readData);
        dataBase.push({
            sessionID: Session.sID,
            winner: winner,
            player1: {
                score: Session.gameState.scoreP1,
                name: Session.player1.name,
                account: Session.player1.account,
            },
            player2: {
                score: Session.gameState.scoreP2,
                name: Session.player2.name,
                account: Session.player2.account,
            },
            turnNum: Session.gameState.turnNum,
            disconnec: Session.serverSide.isDc,
            hasGivenUp: Session.serverSide.hasGivenUp,
            hasCheated: Session.serverSide.hasCheated
        });
        let toWrite = JSON.stringify(dataBase);
        fs.writeFile('./database/game-sessions.json', toWrite, (err, out) => {
            if (err) { console.log("ERROR: SessionNum:" + Session.sID + "on writing database: "); throw console.log(err) };
        });
        Session = null; //nullify session for it to be replaced on the active game sessions array
    });

}
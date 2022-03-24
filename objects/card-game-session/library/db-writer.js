//+------------------------------------------------------------------+
//|                    STORES MATCH ON DATABASE                      |
//+------------------------------------------------------------------+
const fs = require('fs');

//function stores session on database and sends message to players who have an OPEN socket

module.exports = function (Session, winner, isDc = false) { //IMPORTANT, ONLY ACCEPTS 'draw', 'p1' OR 'p2' STRING TYPES, LOWERCASE
    
    if (Session.isFinished) //safety, stop here if match is already over
        return;

    Session.isFinished = true; //session is no more accesible
    
    if (Session.player1.ws.readyState === 1)  //send gamestate to players so front-end knows game is over
        Session.player1.ws.send(JSON.stringify(Session.gameState));
    
    if (Session.player2.ws.readyState === 1) 
        Session.player2.ws.send(JSON.stringify(Session.gameState));

    if (winner === 'p1') {    //p1 is the winner
        if (Session.player1.ws.readyState === 1)    
            Session.player1.ws.send("Voce ganhou!");
        if (isDc) { //because p2 disconnected/afk
            Session.player1.ws.close(4001, "O seu oponente desconectou");
            if (Session.player2.ws.readyState === 1)
                Session.player2.ws.close(4001, "Voce perdeu por inatividade");
        }
        else if (Session.player2.ws.readyState === 1) //p1 is winner and p2 is on
            Session.player2.ws.send("Voce perdeu");
    } 
    
    else if (winner === 'p2') {  //p2 is the winner
        if (Session.player1.ws.readyState === 1)
            Session.player1.ws.send("Voce perdeu");
        if (Session.player2.ws.readyState === 1) //p2 is winner and p1 is on
            Session.player2.ws.send("Voce ganhou!");
        if (isDc) { //because p1 disconnected/afk
            Session.player2.ws.close(4001, "O seu oponente desconectou");
            if (Session.player1.ws.readyState === 1)
                Session.player1.ws.close(4001, "Voce perdeu por inatividade");
        }
    }
    
    else if (winner === 'draw') { //nobody won
        if (Session.player1.ws.readyState === 1) 
            Session.player1.ws.send("Empate!");
        if (Session.player2.ws.readyState === 1)
            Session.player2.ws.send("Empate!");
    }


    
    if (Session.player1.ws.readyState === 1) {
       Session.player1.ws.close(1000, 'match has finished'); //close socket and warn front that everything is fine  
       Session.player1.ws.terminate(); //safety
    } 
    if (Session.player2.ws.readyState === 1) {
        Session.player2.ws.close(1000, 'match has finished');
        Session.player2.ws.terminate(); //safety
    } 

    Session.player1.reconKey = null; //clear reconnection keys
    Session.player2.reconKey = null;
    Session.player1.ws = null; //clear ws
    Session.player2.ws = null; 
    
    fs.readFile('./database/game-sessions.json', (err, readData) => { //save match data on database
        if (err) { console.log("ERROR: SessionNum:" + Session.sID + "on reading database: "); throw console.log(err); } //if error, print it
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
            disconnec: isDc
        });
        let toWrite = JSON.stringify(dataBase);
        fs.writeFile('./database/game-sessions.json', toWrite, (err, out) => {
            if (err) { console.log("ERROR: SessionNum:" + Session.sID + "on writing database: "); throw console.log(err) }; //if error, print it
        });
    });

}
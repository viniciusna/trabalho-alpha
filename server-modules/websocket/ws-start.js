const CardGameSession = require('../../objects/card-game-session/constructor.js');
const Active = require('./ws-message.js');  //imports active game sessions array && game sockets array (array stores sockets currently playing)

const waitSockArr = [];  //store sockets waiting for other players

function wsStart(ws, req) {
    
    ws.reconKey = req.sessionID; //put session data into socket
    ws.isAlive = true; //assures the connection is alive, set to true on pong, set to false on timer
    
    if (reconnecChecker(ws))
        return;

    ws.waitingLine = true; //don't let player on the waiting line for too long, if this is true, timer is also triggered
    ws.lineTimer = 10;
    waitSockArr.push(ws); //goes to end of waiting line and...
    waitLineChecker();  //is passed to the function below

}

function waitLineChecker() {
    if (waitSockArr.length >= 2) { //2 or more players, create a match
        
        Active.gameArr.push(waitSockArr.shift(), waitSockArr.shift()); //puts first 2 players on the line into the end of the game socket array

        let sID;

        let replaceableIndex = Active.sessArr.findIndex(session => { //see if there's an available place in the active games array
            return session === null;
        });


        if (replaceableIndex !== -1) { //if yes, replace the finished match in the array
            Active.sessArr[replaceableIndex] = new CardGameSession(Active.gameArr[Active.gameArr.length - 2], Active.gameArr[Active.gameArr.length - 1]);
            sID = replaceableIndex;
        } else {  //if not, push the array with a new session
            Active.sessArr.push(new CardGameSession(Active.gameArr[Active.gameArr.length - 2], Active.gameArr[Active.gameArr.length - 1]));
            sID = Active.sessArr.length - 1;
        }

        Active.sessArr[sID].aID = sID;  //save access id, just in case

        console.log("new match id:" +sID+" created");
        console.log("new match access id = " +Active.sessArr[sID].aID);


        prepareSocket('player1', sID);
        prepareSocket('player2', sID);

        //console.log(Active.sessArr[sID]);

        waitLineChecker(); //try again in case there's more players

    } else {
        console.log("waitLineChecker --> only 1 player in line");
        return; //keep waiting
    }
}



function reconnecChecker(ws) {
    
    console.log("reconnecChecker");
    
    if (ws.readyState === 0) //quick fix, probably a bad idea
        reconnecChecker(ws); 
    
    console.log("checking if player recon key belongs to session -->"+ws.reconKey);

    Active.sessArr.forEach( session => {
        
        console.log("session reconn key for p1 = "+session.player1.reconKey);
        console.log("session reconn key for p2 = "+session.player1.reconKey);
        
        if (session.player1.reconKey = ws.reconKey) {   
            console.log("p1 reconnect");
            session.player1.ws = ws;  //re-assing socket 
            if (session.player1.ws.readyState === 1) { //don't send messages to closed sockets
                ws.send('p1');
                ws.send(JSON.stringify(session.player1.hand)); //send game info to player
                ws.send(JSON.stringify(session.gameState));
                Active.gameArr.push(ws);
                return true; 
            }
        }
        
        else if (session.player2.reconKey = ws.reconKey) {          
            console.log("p2 reconnect");
            session.player2.ws = ws;  //re-assing socket
            if (session.player2.ws.readyState === 1) { //don't send messages to closed sockets
                ws.send('p2');
                ws.send(JSON.stringify(session.player2.hand)); //send game info to player
                ws.send(JSON.stringify(session.gameState));
                Active.gameArr.push(ws);
                return true;
            } 
        }

    });

    return false;

}



function prepareSocket(playerSymbol, sID) {

    console.log("I will send match data to player" +playerSymbol+", match ID = "+Active.sessArr[sID].sID+" acces id = "+Active.sessArr[sID].aID);
    console.log("player "+playerSymbol+" acces id = "+Active.sessArr[sID][playerSymbol].aID);
    
    if (Active.sessArr[sID][playerSymbol].ws.readyState === 0) //quick fix, probably a bad idea
        prepareSocket(playerSymbol, sID);
    
    //tell front-end game is ready, which players it is, player hand, and gameState 
    playerSymbol === 'player1' ? Active.sessArr[sID][playerSymbol].ws.send('p1') : Active.sessArr[sID][playerSymbol].ws.send('p2')

    Active.sessArr[sID][playerSymbol].reconKey = Active.sessArr[sID][playerSymbol].ws.reconKey; 

    if (Active.sessArr[sID][playerSymbol].ws.readyState === 1) { //don't send messages to closed sockets
        console.log("sending hand: "+Active.sessArr[sID][playerSymbol].hand+" to " +playerSymbol+", match ID = "+Active.sessArr[sID].sID+" acces id = "+Active.sessArr[sID].aID);
        Active.sessArr[sID][playerSymbol].ws.send(JSON.stringify(Active.sessArr[sID][playerSymbol].hand)); //send game info to player
        console.log("sending gamestate: "+Active.sessArr[sID].gameState+" to " +playerSymbol+", match ID = "+Active.sessArr[sID].sID+" acces id = "+Active.sessArr[sID].aID);
        Active.sessArr[sID][playerSymbol].ws.send(JSON.stringify(Active.sessArr[sID].gameState));
    } else {
        if (playerSymbol === 'player1')
            Active.sessArr[sID].player2.ws.send("O oponente desconectou antes do inicio da partida");
        else
            Active.sessArr[sID].player1.ws.send("O oponente desconectou antes do inicio da partida");
    }

    Active.sessArr[sID][playerSymbol].ws.aID = sID; //assign the sockets the access index for faster performance

}



module.exports = {
    wsStart: wsStart,
    waitSockArr: waitSockArr
}
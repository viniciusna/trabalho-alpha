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
    waitSockArr.forEach( ( el, index ) => {
        if (el.readyState > 1)
            waitSockArr.splice(index, 1); 
    });
    waitLineChecker();  //is passed to the function below

}

function waitLineChecker() {
    
    if (waitSockArr.length >= 2) { //2 or more players, create a match

        Active.gameArr.push(waitSockArr.shift(), waitSockArr.shift()); //puts first 2 players on the line into the end of the game socket array

        let aID;

        let replaceableIndex = Active.sessArr.findIndex(session => { //see if there's an available place in the active games array
            return session.isFinished === true;
        });

        if (replaceableIndex !== -1) { //if yes, replace the finished match in the array
            Active.sessArr[replaceableIndex] = new CardGameSession(Active.gameArr[Active.gameArr.length - 2], Active.gameArr[Active.gameArr.length - 1]);
            aID = replaceableIndex;
        } else {  //if not, push the array with a new session
            Active.sessArr.push(new CardGameSession(Active.gameArr[Active.gameArr.length - 2], Active.gameArr[Active.gameArr.length - 1]));
            aID = Active.sessArr.length - 1;
        }

        Active.sessArr[aID].aID = aID;  //save access id, just in case
        Active.sessArr[aID].gameState.accessID = Active.sessArr[aID].aID;
        
        console.log("new match id:" + Active.sessArr[aID].sID + " created");
        console.log("new match access id = " + Active.sessArr[aID].aID);

        prepareSocket('player1', aID);
        prepareSocket('player2', aID);

        //console.log(Active.sessArr[aID]);

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

    console.log("checking if player recon key belongs to session -->" + ws.reconKey);

    Active.sessArr.forEach(session => {
        
        if (!session.isFinished) {

            console.log("session reconn key for p1 = " + session.player1.reconKey);
            console.log("session reconn key for p2 = " + session.player1.reconKey);

            if (session.player1.reconKey === ws.reconKey) {
                console.log("p1 reconnect");
                console.log("acces id = " + session.aID);
                session.player1.ws = ws;  //re-assing socket 
                session.player1.ws.aID = session.aID;
                if (session.player1.ws.readyState === 1) { //don't send messages to closed sockets
                    ws.send('p1');
                    ws.send(JSON.stringify(session.player1.hand)); //send game info to player
                    ws.send(JSON.stringify(session.gameState));
                    Active.gameArr.push(ws);
                    return true;
                }
            }

            else if (session.player2.reconKey === ws.reconKey) {
                console.log("p2 reconnect");
                session.player2.ws = ws;  //re-assing socket
                session.player2.ws.aID = session.aID;
                if (session.player2.ws.readyState === 1) { //don't send messages to closed sockets
                    ws.send('p2');
                    ws.send(JSON.stringify(session.player2.hand)); //send game info to player
                    ws.send(JSON.stringify(session.gameState));
                    Active.gameArr.push(ws);
                    return true;
                }
            }

        }
    });

    return false;

}



function prepareSocket(playerSymbol, aID) {

    console.log("I will send match data to player" + playerSymbol + ", match ID = " + Active.sessArr[aID].sID + " acces id = " + Active.sessArr[aID].aID);
    console.log("player " + playerSymbol + " acces id = " + Active.sessArr[aID][playerSymbol].ws.aID);

    if (Active.sessArr[aID][playerSymbol].ws.readyState === 0) //quick fix, probably a bad idea
        prepareSocket(playerSymbol, aID);

    //tell front-end game is ready, which players it is, player hand, and gameState 
    playerSymbol === 'player1' ? Active.sessArr[aID][playerSymbol].ws.send('p1') : Active.sessArr[aID][playerSymbol].ws.send('p2')

    Active.sessArr[aID][playerSymbol].reconKey = Active.sessArr[aID][playerSymbol].ws.reconKey;

    if (Active.sessArr[aID][playerSymbol].ws.readyState === 1) { //don't send messages to closed sockets
        console.log("sending hand: " + Active.sessArr[aID][playerSymbol].hand + " to " + playerSymbol + ", match ID = " + Active.sessArr[aID].sID + " acces id = " + Active.sessArr[aID].aID);
        Active.sessArr[aID][playerSymbol].ws.send(JSON.stringify(Active.sessArr[aID][playerSymbol].hand)); //send game info to player
        console.log("sending gamestate: " + Active.sessArr[aID].gameState + " to " + playerSymbol + ", match ID = " + Active.sessArr[aID].sID + " acces id = " + Active.sessArr[aID].aID);
        Active.sessArr[aID][playerSymbol].ws.send(JSON.stringify(Active.sessArr[aID].gameState));
    } else {
        if (playerSymbol === 'player1')
            Active.sessArr[aID].player2.ws.send("O oponente desconectou antes do inicio da partida");
        else
            Active.sessArr[aID].player1.ws.send("O oponente desconectou antes do inicio da partida");
    }

    Active.sessArr[aID][playerSymbol].ws.aID = aID; //assign the sockets the access index for faster performance

}



module.exports = {
    wsStart: wsStart,
    waitSockArr: waitSockArr
}
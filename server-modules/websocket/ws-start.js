const CardGameSession = require('../../objects/card-game-session/constructor.js');
const Active = require('./ws-message.js');  //imports active game sessions array && game sockets array (array stores sockets currently playing)

const waitSockArr = [];  //store sockets waiting for other players
const wss = require('../../socket-server.js');

function wsStart(ws, req) {

    waitSockArr.forEach( ( el, index ) => { //kick closed sockets from waiting line
        if (el.readyState > 1)
            waitSockArr.splice(index, 1);
    });
    
    ws.reconKey = req.sessionID; //put session data into socket
    ws.isAlive = true; //assures the connection is alive, set to true on pong, set to false on timer

    if(reconnecChecker(ws))
        return;

    ws.waitingLine = true; //don't let player on the waiting line for too long, if this is true, timer is also triggered
    ws.lineTimer = 10;
    waitSockArr.push(ws); //goes to end of waiting line and...

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

        prepareSocket('player1', aID);
        prepareSocket('player2', aID);

        waitLineChecker(); //try again in case there's more players

    } else 
        return; //keep waiting
}



function reconnecChecker(ws) {

    let isRec = false

    if (ws.readyState === 0) //quick fix, probably a bad idea
        reconnecChecker(ws);

    Active.sessArr.forEach(session => {
        
        if (!session.isFinished) {

            if (session.player1.reconKey === ws.reconKey) {
                Active.gameArr.push(ws);
                session.player1.ws = ws;  //re-assing socket 
                session.player1.ws.aID = session.aID;
                if (session.player1.ws.readyState === 1) { //don't send messages to closed sockets
                    ws.send('p1');
                    ws.send(JSON.stringify(session.player1.hand)); //send game info to player
                    ws.send(JSON.stringify(session.gameState));
                    isRec = true;
                }
            }

            else if (session.player2.reconKey === ws.reconKey) {
                Active.gameArr.push(ws);
                session.player2.ws = ws;  //re-assing socket
                session.player2.ws.aID = session.aID;
                if (session.player2.ws.readyState === 1) { //don't send messages to closed sockets
                    ws.send('p2');
                    ws.send(JSON.stringify(session.player2.hand)); //send game info to player
                    ws.send(JSON.stringify(session.gameState));
                    isRec = true;
                }
            }

        }
    });

    return isRec;

}



function prepareSocket(playerSymbol, aID) {

    if (Active.sessArr[aID][playerSymbol].ws.readyState === 0) //quick fix, probably a bad idea
        prepareSocket(playerSymbol, aID);

    //tell front-end game is ready, which players it is, player hand, and gameState 
    playerSymbol === 'player1' ? Active.sessArr[aID][playerSymbol].ws.send('p1') : Active.sessArr[aID][playerSymbol].ws.send('p2')

    Active.sessArr[aID][playerSymbol].reconKey = Active.sessArr[aID][playerSymbol].ws.reconKey;

    if (Active.sessArr[aID][playerSymbol].ws.readyState === 1) { //don't send messages to closed sockets
        Active.sessArr[aID][playerSymbol].ws.send(JSON.stringify(Active.sessArr[aID][playerSymbol].hand)); //send game info to player
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
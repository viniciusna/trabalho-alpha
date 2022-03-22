const CardGameSession = require('../../objects/card-game-session/constructor.js');
const Active = require('./ws-message.js');  //imports active game sessions array && game sockets array (array stores sockets currently playing)

const waitSockArr = [];  //store sockets waiting for other players

function wsStart(ws, req) {

    console.log(req.session);

    ws.reconKey = req.reconKey; //put session data into socket

    ws.isAlive = true; //assures the connection is alive, set to true on pong, set to false on timer
    ws.timeout = 10;  //gives a timer to close AFK players

    if (reconnecChecker(ws, req.session.reconKey))
        return;

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

        prepareSocket('player1', sID);
        prepareSocket('player2', sID);

        console.log(Active.sessArr[sID]);

        waitLineChecker(); //try again in case there's more players

    } else
        return; //keep waiting
}

module.exports = wsStart;



function reconnecChecker(ws, reconKey) {
    
    Active.sessArr.forEach( session => {
        
        if (session.player1.reconKey = reconKey) {
            session.player1.ws = ws;  //re-assing socket 
            if (session.player1.ws.readyState === 1) { //don't send messages to closed sockets
                ws.send(JSON.stringify(session.player1.hand)); //send game info to player
                ws.send(JSON.stringify(session.gameState));
            }
            return true; 
        }
        
        else if (session.player2.reconKey = reconKey) {
            session.player2.ws = ws;  //re-assing socket
            if (session.player2.ws.readyState === 1) { //don't send messages to closed sockets
                ws.send(JSON.stringify(session.player2.hand)); //send game info to player
                ws.send(JSON.stringify(session.gameState));
            } 
            return true;
        }

    });

}



function prepareSocket(playerSymbol, sID) {

    //tell front-end game is ready, which players it is, player hand, and gameState 
    playerSymbol === 'player1' ? Active.sessArr[sID][playerSymbol].ws.send('p1') : Active.sessArr[sID][playerSymbol].ws.send('p2')

    Active.sessArr[sID][playerSymbol].reconKey = Active.sessArr[sID][playerSymbol].ws.reconKey; 

    if (Active.sessArr[sID][playerSymbol].ws.readyState === 1) { //don't send messages to closed sockets
        Active.sessArr[sID][playerSymbol].ws.send(JSON.stringify(Active.sessArr[sID][playerSymbol].hand)); //send game info to player
        Active.sessArr[sID][playerSymbol].ws.send(JSON.stringify(Active.sessArr[sID].gameState));
    } else {
        //TODO: user disconnected on match creation
    }

    Active.sessArr[sID][playerSymbol].ws.aID = sID; //assign the sockets the access index for faster performance

}

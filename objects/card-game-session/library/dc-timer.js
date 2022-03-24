//+------------------------------------------------------------------------------+
//|                   CHECKS IF PLAYS IS DISCONNECTED OR AFK                     |
//+------------------------------------------------------------------------------+
const Active = require('../../../server-modules/websocket/ws-message.js');
const dbStore = require('./db-writer.js');

module.exports = function() {

    Active.sessArr.forEach( session => {
        
        if (session.gameState.player1turn) //reduces user timer if It's his turn
            session.player1.timer--;
        else   
            session.player2.timer--;

        if (session.player2.timer === 0) {  //if user is afk or disconnected for a while, he loses
            dbStore(session, 'p1', true);
        }
        if (session.player1.timer === 0) {
            dbStore(session, 'p2', true);
        }

    });

}
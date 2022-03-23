const Active = require('../../../server-modules/websocket/ws-message.js');
const dbStore = require('./db-writer.js');

module.exports = function() {

    Active.sessArr.forEach( session => {
        
        if (session.gameState.player1turn)
            session.player1.timer--;
        else   
            session.player2.timer--;

        if (session.player2.timer === 0) {
            dbStore(session, 'p1', true);
        }
        if (session.player1.timer === 0) {
            dbStore(session, 'p2', true);
        }

    });

}
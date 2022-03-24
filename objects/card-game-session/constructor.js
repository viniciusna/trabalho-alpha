////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//+------------------------------------------------------------------+ this object has internal variables for each game session
//|                    GAME SESSION OBJECT                           | and methods for controlling each game session independently
//+------------------------------------------------------------------+ and methods for storing the matches in the database
const shuffler = require('./library/shuffler.js');
let getNextSessionID = require('./library/session-id-inititializer.js');


class CardGameSession {
   constructor(wsP1, wsP2) {

      this.isLocked = false;
      this.sID = getNextSessionID(), //session ID, never repeated and id stored on database
      this.aID = null,  //access ID, used for o(1) access to socket game
      
      this.gameState = {
         matchID: this.sID,
         turnNum: 1,  
         player1turn: Boolean(Math.round(Math.random())), // randomized true or false, who plays first
         board: ['', ''], // [player1, player2]
         scoreP1: 0,
         scoreP2: 0
      };
      
      this.serverSide = { //for database statistics
         hasGivenUp: false,
         disconnec: false,
         hasCheated: false
      };
      
      this.player1 = {  //server side only, data about player 1
         regID: null,
         reconKey: null,
         timer: 8,
         hand: [],
         deck: null,
         ws: wsP1  //CAREFULL WITH RECONNECTIONS!!!
      };
      
      this.player2 = {  //server side only, data about player 2
         regID: null,
         reconKey: null,
         timer: 8,
         hand: [],
         deck: null,
         ws: wsP2 //CAREFULL WITH RECONNECTIONS!!!
      };
      
      this.player1.deck = shuffler();  //calls for the shuffler function to randomize the deck
      this.player2.deck = shuffler();
      
      this.player1.hand = this.player1.deck.splice(0, 3); //get 3 cards from deck and gives to player hand
      this.player2.hand = this.player2.deck.splice(0, 3); 

      this.player1.ws.lineTimer = null;
      this.player2.ws.lineTimer = null;
      
      this.player1.ws.waitingLine = false;
      this.player2.ws.waitingLine = false;

      console.log("new session created");

   }
}

module.exports = CardGameSession;
//+------------------------------------------------------------------+
//|                    DEDEPENDENCIES/MODULES                        |
//+------------------------------------------------------------------+
const WebSocket = require('ws');

const wsStartModule = require('./server-modules/websocket/ws-start.js');
const wsMsgModule = require('./server-modules/websocket/ws-message.js');
const wsCloseModule = require('./server-modules/websocket/ws-close.js');

const dcTimerMod = require('./objects/card-game-session/library/dc-timer.js');


const wss = new WebSocket.Server({
    noServer: true,  //server-less socket server
    clientTracking: true
});


wss.on('error', (error) => { //if error, caught first hand
    console.log('SOCKET SERVER ERROR: ');
    console.log(error);
});


wss.on('close', () => { //clear timer if socket server closes
    console.log("SOCKET SERVER CLOSED");
    clearInterval(wssTimer);
});

wss.on('connection', (ws, req) => {
    ws.on('error', (error) => { console.log('wss: WS error: '); console.log(error); });  //if error, caught first hand  
    ws.on('pong', () => { ws.isAlive = true }); //on pong, we are sure socket is alive
    ws.on('close', () => wsCloseModule.close(ws));
    
    wsStartModule.wsStart(ws, req); //run this function before setting socket up to exchange messages
    
    ws.on('message', (data, isBinary) => wsMsgModule.msg(data, isBinary, ws));
});

const wssTimer = setInterval( () => {

  wss.clients.forEach( ws => {
    if (ws.isAlive === false)
      ws.terminate();
        
    ws.isAlive = false;
    ws.ping();
  });

}, 5000); //50000

const lineTimer = setInterval( () => {
  wsStartModule.waitSockArr.forEach( ws => {
    if (ws.isAlive === false)
      ws.terminate();

    else {
      if (ws.lineTimer === 0) {
        ws.close(4002, "Não há outros players no momento");
        ws.terminate();
      }

      else if (ws.waitingLine)
        ws.lineTimer--;
      
      ws.isAlive = false;
      ws.ping();
    }
  });
}, 10000); //10000

const dcTimer = setInterval( dcTimerMod, 9000);  //10000

//exporting the server
module.exports = wss;
const fs = require('fs');

module.exports = function gameConsult(req, res) {
    fs.readFile('./database/game-sessions.json', (err, readData) => {
        let db = JSON.parse(readData);
        res.json(db);
        //TODO: filter sensitive data before sending
    });
};
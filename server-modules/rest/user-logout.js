module.exports = function (req, res) {
    if (req.session.regID) {
        req.session.regID = undefined; //safety
        req.session.destroy();
        res.send("log-out realizado");
    }
    else    
        res.send("Voce não esta logado");
}
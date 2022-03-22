//TODO: deleta o cookie do server e do browser, e reloada

module.exports = function (req, res) {
    if (req.session.regID) {
        req.session.regID = undefined; //safety
        req.session.destroy();
    }
    else    
        res.send("Voce não esta logado");
}
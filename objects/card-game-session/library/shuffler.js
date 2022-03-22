//+------------------------------------------------------------------+
//|                FUNCTION SHUFFLES PLAYERS DECK                    |
//+------------------------------------------------------------------+
const unordDeck = ['w', 'w', 'w', 'w', 'f', 'f', 'f', 'f', 'p', 'p', 'p', 'p', 'e', 'e', 'v', 'v', 'd', 'd']; //unshuffled deck

module.exports = function () {
    let arrCpy = [...unordDeck];  //1 dimension array, spread operator copies 1 level deep copy
    let currentIndex = arrCpy.length;
    let randomIndex;
    while (currentIndex != 0) {   // While there remain elements to shuffle...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;  //Pick a remaining element...
        [arrCpy[currentIndex], arrCpy[randomIndex]] =   //And swap it with the current element.
            [arrCpy[randomIndex], arrCpy[currentIndex]];
    }
    return arrCpy;
}
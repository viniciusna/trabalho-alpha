let isMyTurn = false

let myStr = document.cookie;
let endIndex = myStr.indexOf('=');
let myName = myStr.slice(0, endIndex);

$(document).ready( () => {
    if(whichPlayer === "p1"){
        $("#span-player1").text(myName)
    }else{
        if(whichPlayer === "p2"){
            $("#span-player2").text(myName)
        }
    }
    $(".btn-back-to-home").attr("href", `http://${url}:${port}`)

    $(".cards-in-hand").draggable({
        revert: "invalid",
    })

    if ( youStart ) {
        openModalBoard('modal-initial')
        $("#description-modal-initial").text('É sua vez de jogar')
        isMyTurn = true
        turnControlAndPlayCard()
        greenShine()
    } else {
        openModalBoard('modal-initial')
        $("#description-modal-initial").text('É a vez do oponente jogar, aguarde')
        redShine()
    }
})

function openModalBoard(modalId) {
    const container = document.getElementById('container-modais');
    container.style.visibility = "visible";

    $('body').css('overflowY', "hidden");

    $('.modal-div').css('visibility', 'hidden');

    const modal = document.getElementById(modalId);
    modal.style.visibility = "visible";
}

function greenShine() {
    $("#container-first-hand-card").attr("class", "container-cards-from-hand card green-shine")
    $("#container-second-hand-card").attr("class", "container-cards-from-hand card green-shine")
    $("#container-third-hand-card").attr("class", "container-cards-from-hand card green-shine")
}

function redShine() {
    $("#container-first-hand-card").attr("class", "container-cards-from-hand card red-shine")
    $("#container-second-hand-card").attr("class", "container-cards-from-hand card red-shine")
    $("#container-third-hand-card").attr("class", "container-cards-from-hand card red-shine")
}

let cardImageTagId; //Essa variável serve para pegar a id da imagem da carta que foi jogada, pois isso será usado em diferentes funções

socket.onopen = (event) => {
    playCardSound("backgroundSound");
}

let gameState

socket.onmessage = (event) => {
    try {
        clearTimeout(timeout)

        let data = JSON.parse(event.data)

        if( data instanceof Array ) {
            hand = data
        } else {
            if ( whichPlayer === "p2" ) {
                data.board = data.board.reverse()
            }

            try {
                showEnemyCard(data.board[1])
            } catch {
            }

            gameState = data

            verifyIfIsYourTurn(data)
            console.log(data)
            console.log("==============================")
            verifyIfHaveTwoCardsInTheField(data)
        }

        if(isMyTurn) {
            timeout = setInterval(() => {
                $(".cards-in-hand").draggable({
                    revert: "invalid",
                });
            }, 500);

            greenShine()
        } else {
            redShine()
        }

        turnControlAndPlayCard();
    } catch {
        console.log(event.data)
    }

}

socket.onclose = (event) => {

    console.log("SOCKET CLOSE: ");
    console.log(event);
    console.log("CLOSE CODE: " + event.code);
    console.log("CLOSE REASON: " + event.reason);

    if ( gameState.turnNum == 18 ) {
        if ( gameState.scoreP1 === gameState.scoreP2 ) {
            $("#description-modal").text("Empate!")
            openModalBoard("modal-general")
        } else if ( whichPlayer === "p1" && gameState.scoreP1 > gameState.scoreP2 ) {
            $("#description-modal").text("Você venceu!")
            openModalBoard("modal-general")
        } else if ( whichPlayer === "p1" && gameState.scoreP1 < gameState.scoreP2 ) {
            $("#description-modal").text("Você perdeu!")
            openModalBoard("modal-general")
        } else if ( whichPlayer === "p2" && gameState.scoreP1 < gameState.scoreP2 ) {
            $("#description-modal").text("Você venceu!")
            openModalBoard("modal-general")
        } else if ( whichPlayer === "p2" && gameState.scoreP1 > gameState.scoreP2 ) {
            $("#description-modal").text("Você perdeu!")
            openModalBoard("modal-general")
        }
    }
}


let timeout = setInterval(() => {
    $(".cards-in-hand").draggable({
        revert: "invalid",
    });
}, 500);

function turnControlAndPlayCard() {
    if (isMyTurn) {
            $("#playing-card-field").droppable({
                disabled: false,
                drop: function (event, ui) {
                    cardImageTagId = ui.draggable.attr("id");
                    $("#playing-card-field").droppable({ disabled: true })
                    isMyTurn = false

                    socket.send(Number(cardImageTagId.slice(-1)))
                }
            });
    }
}

function verifyIfIsYourTurn(data) {
    if ( whichPlayer === 'p1' && data.player1turn ) {
        isMyTurn = true
    } else if ( whichPlayer === 'p2' && !data.player1turn ) {
        isMyTurn = true
    } else {
        isMyTurn = false
    }
}

function showEnemyCard(cardString) {

    switch (cardString) {
        case 'f':
            $("#container-card-player2").html('<img class="cards-in-hand" src="./board-assets/card-fire.svg">');
            playCardSound("f");
            verifyCardOnTop();
            break;
        case 'w':
            $("#container-card-player2").html('<img class="cards-in-hand" src="./board-assets/card-water.svg">');
            playCardSound("w");
            verifyCardOnTop();
            break;
        case 'p':
            $("#container-card-player2").html('<img class="cards-in-hand" src="./board-assets/card-plant.svg">');
            playCardSound("p");
            verifyCardOnTop();
            break;
        case 'e':
            $("#container-card-player2").html('<img class="cards-in-hand" src="./board-assets/card-ether.svg">');
            playCardSound("e");
            verifyCardOnTop();
            break;
        case 'v':
            $("#container-card-player2").html('<img class="cards-in-hand" src="./board-assets/card-void.svg">');
            playCardSound("v");
            verifyCardOnTop();
            break;
        case 'd':
            $("#container-card-player2").html('<img class="cards-in-hand" src="./board-assets/card-dark-matter.svg">');
            playCardSound("d");
            verifyCardOnTop();
            break;
        default:
            break;
    }
}

function verifyIfHaveTwoCardsInTheField(data) {
    if ( data.board[0] != '' && data.board[1] != '' ) {
        setTimeout(() => {
            cleanTheCardField(cardImageTagId);
            $("#container-card-player2").html('');
            hideCheap();
        }, 3000);

        clearTimeout(timeout)
    } else if ( data.board[0] == '' && data.board[1] == '') {
        setTimeout(() => {
            $("#score-player1").text(data.scoreP1)
            $("#score-player2").text(data.scoreP2)
        }, 3000)
    }

    finishTheMatch(data.scoreP1, data.scoreP2)
}

function takeCard(hand) {

    if ( hand[0] != null ) {
        $("#container-first-hand-card").html(`<img id="card1" value=${hand[0]} class="cards-in-hand" src="./board-assets/${getCardImage(hand[0])}.svg" alt="">`);
    }
    if ( hand[1] != null ) {
        $("#container-second-hand-card").html(`<img id="card2" value=${hand[1]} class="cards-in-hand" src="./board-assets/${getCardImage(hand[1])}.svg" alt="">`);
    }
    if ( hand[2] != null ) {
        $("#container-third-hand-card").html(`<img id="card3" value=${hand[2]} class="cards-in-hand" src="./board-assets/${getCardImage(hand[2])}.svg" alt="">`);
    }
}

function getCardImage(card) {

    let nameOfImageArchive;

    switch (card) {
        case "w":
            nameOfImageArchive = 'card-water';
            break;
        case "f":
            nameOfImageArchive = 'card-fire';
            break;
        case "p":
            nameOfImageArchive = 'card-plant';
            break;
        case "e":
            nameOfImageArchive = 'card-ether';
            break;
        case "v":
            nameOfImageArchive = 'card-void';
            break;
        case "d":
            nameOfImageArchive = 'card-dark-matter';
            break;
    }

    return nameOfImageArchive;
}

function finishTheMatch(scoreP1, scoreP2) {
    setTimeout( () => {
        if ( scoreP1 === 5 && whichPlayer === "p2" ) {
            $("#score-player1").text(scoreP1)
            $("#score-player2").text(scoreP2)
            $("#description-modal").text("Você perdeu!")
            openModalBoard("modal-general")
            loserSound.play();
        } else if ( scoreP2 === 5 && whichPlayer === "p1" ) {
            $("#score-player1").text(scoreP1)
            $("#score-player2").text(scoreP2)
            $("#description-modal").text("Você perdeu!")
            openModalBoard("modal-general")
            loserSound.play();
        } else if ( scoreP1 === 5 && whichPlayer === "p1" ) {
            $("#score-player1").text(scoreP1)
            $("#score-player2").text(scoreP2)
            $("#description-modal").text("Você venceu!")
            openModalBoard("modal-general")
            winnerSound.play();
        } else if ( scoreP2 === 5 && whichPlayer === "p2" ) {
            $("#score-player1").text(scoreP1)
            $("#score-player2").text(scoreP2)
            $("#description-modal").text("Você venceu!")
            openModalBoard("modal-general")
            winnerSound.play();
        }
    }, 3500)
}

function backgroundSound(){
    myAudio = new Audio('someSound.ogg');
    if (typeof myAudio.loop == 'boolean') {
        myAudio.loop = true;
    }
    else {
        myAudio.addEventListener('ended', function() {
            this.currentTime = 0;
            this.play();
        }, false);
    }
}

function cleanTheCardField(tagCardId) {

    if (tagCardId === "card1") {
        $("#container-first-hand-card").html("");
    }

    else if (tagCardId === "card2") {
        $("#container-second-hand-card").html("");
    }

    else if (tagCardId === "card3") {
        $("#container-third-hand-card").html("");
    }
    takeCard(hand)
    cardsOnDeck();
}

function verifyCardOnTop() {
    console.log("board "+ gameState.board)
    if((gameState.board[0] == '') && (gameState.board[1] != '')){
        $("#container-card-player2").css('zIndex',3);
    }else if ((gameState.board[0] != '') && (gameState.board[1] == '')) {
        $("#container-card-player2").css('zIndex',5);
    }
}

function cardsOnDeck() {
    let cardsOnDeck = 16 - gameState.turnNum;
    document.getElementById("cards-left").innerHTML = cardsOnDeck;
}

function hideCheap() {
    if(gameState.turnNum == 16){
        $("#second-cheap").hide();
    }
}

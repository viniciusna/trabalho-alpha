function openModal(modalId) {
    const container = document.getElementById('container-modais');
    container.style.visibility = "visible";

    $('body').css('overflowY', "hidden");

    $('.modal-div').css('visibility', 'hidden');

    const modal = document.getElementById(modalId);
    modal.style.visibility = "visible";
}

function closeModal(modalId) {
    const container = document.getElementById('container-modais');
    container.style.visibility = "hidden";

    $('body').css('overflowY', "visible");

    const modal = document.getElementById(modalId);
    modal.style.visibility = "hidden";
}

function openMenu() {
    $('#menu').css('visibility', 'visible');
}

function openHelp(modalId) {
    $('body').css('overflowY', "hidden");

    $('.modal-div').css('visibility', 'hidden');
    
    const modal = document.getElementById(modalId);
    modal.style.visibility = "visible";
}

$('#btn-guide').click(function() {
    if ($(this).attr('src') == './board-assets/subtitles_white_24dp.svg') {
        $(this).removeAttr('src');
        $(this).attr('src', './board-assets/subtitles_off_white_24dp.svg');

        $( document ).tooltip({ disabled: true });
    } else {
        $(this).removeAttr('src');
        $(this).attr('src', './board-assets/subtitles_white_24dp.svg');

        $( document ).tooltip({ disabled: false });
    };
})

function flipCard() {
    const card = document.querySelector(".flip-card .flip-card-inner");
    card.style.transform = "rotateY(180deg)";
}

let waterSound = new Audio('board-assets/sounds/waterCardSound.mp3');
let fireSound = new Audio('board-assets/sounds/fireCardSound.mp3');
let plantSound = new Audio('board-assets/sounds/plantCardSound.mp3');
let etherSound = new Audio('board-assets/sounds/etherCardSound.mp3');
let darkMatterSound = new Audio('board-assets/sounds/darkMatterCardSound.mp3');
let voidSound = new Audio('board-assets/sounds/voidCardSound.wav');

let winnerSound = new Audio('board-assets/sounds/winnerRound.mp3');
let loserSound = new Audio('board-assets/sounds/roundLoser.mp3');

let cardDrawSound = new Audio('board-assets/sounds/cardDrawSound.mp3');
let backgroundMusic = new Audio('board-assets/sounds/backgroundSound.mp3');

function playCardSound(card) {
    switch (card) {
        case "w":
            waterSound.play();
            break;
        case "f": 
            fireSound.play();
            fireSound.volume = 0.15;
            break;
        case "p": 
            plantSound.play();
            break;
        case "e":
            etherSound.play();
            break;
        case "d":
            darkMatterSound.play();
            break;
        case "v":
            voidSound.play();
            break;
        case "cardDraw":
            cardDrawSound.play();
            break;
        case "roundWinner":
            winnerSound.play();
            break;
        case "roundLoser":
            loserSound.play();
        case "backgroundSound":
            backgroundMusic.loop = true;
            backgroundMusic.volume = 0.08;
            backgroundMusic.play();
            break;
    }
}

let count = -1;
function changeSoundConf() {
    count++;
    const button = document.getElementById('btn-sound');
    if(count%2 == 0) {
        button.setAttribute('src', '');
        button.setAttribute('src', './board-assets/music_off_white_24dp.svg');
        waterSound.src = "";
        fireSound.src = "";
        plantSound.src = "";
        etherSound.src = "";
        cardDrawSound.src = "";
        backgroundMusic.src = "";
    } else {
        button.setAttribute('src', '');
        button.setAttribute('src', './board-assets/music_note_white_24dp.svg');
        waterSound.src = 'board-assets/sounds/waterCardSound.mp3';
        fireSound.src = 'board-assets/sounds/fireCardSound.mp3';
        plantSound.src = 'board-assets/sounds/plantCardSound.mp3';
        etherSound.src = 'board-assets/sounds/etherCardSound.mp3';
        cardDrawSound.src = 'board-assets/sounds/cardDrawSound.mp3';
        backgroundMusic.src = 'board-assets/sounds/backgroundSound.mp3';
        backgroundMusic.play();
    }
}

module.exports = playCardSound;
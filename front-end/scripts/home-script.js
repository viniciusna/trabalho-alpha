let boardDocument = '';
let leaderDocument = '';
let homeDocument = '';


function openModalHome(modalId) {
  const modal = document.getElementById(modalId);
  modal.style.visibility = "visible";
}

function closeModalHome(modalId) {
  let modal = document.getElementById(modalId);
  modal.style.visibility = "hidden";
}

const url = window.location.href.slice(7, -1);
const port = 80;

let socket;
var youStart = false
var whichPlayer
var hand

document.getElementById('play-now-button').addEventListener('click', () => {

  socket = new WebSocket(`ws://${url}:${port}/`);

  socket.onmessage = (event) => {

    let obj

    try {
        obj = JSON.parse(event.data)

        if ( obj.hasOwnProperty("board") ) {
            socket.onmessage = null

            $.ajax({
                url: `/board1`,
                dataType: "script",
                complete: callBoard2()
            })

            function callBoard2() {
              $.ajax({
                url: `/board2`,
                dataType: "script"
              })
            }

            console.log(obj)

            if ( whichPlayer === 'p1' && obj.player1turn ) {
                console.log("vc primeiro")
                youStart = true
            } else if ( whichPlayer === 'p2' && !obj.player1turn ) {
                console.log("vc primeiro")
                youStart = true
            }

        } else {
            hand = obj
            prepareTheGame(obj)
        }
    } catch {
        document.documentElement.innerHTML = boardDocument;
        whichPlayer = event.data
        console.log(event.data)
    }

  }
});

function prepareTheGame(data) {
        let obj = data

        $("#container-first-hand-card").html(`<img id="card1" value=${obj[0]} class="cards-in-hand" src="./board-assets/${getCardImage(obj[0])}.svg" alt="">`);
        $("#container-second-hand-card").html(`<img id="card2" value=${obj[1]} class="cards-in-hand" src="./board-assets/${getCardImage(obj[1])}.svg" alt="">`);
        $("#container-third-hand-card").html(`<img id="card3" value=${obj[2]} class="cards-in-hand" src="./board-assets/${getCardImage(obj[2])}.svg" alt="">`);
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

fetch('/board.html').then( resp => {
  return resp.text();
}).then( boardHTML =>{
  boardDocument = boardHTML;
}).catch( err => {
  console.log(err);
});

fetch('/leader.html').then( resp => {
  return resp.text();
}).then( leaderHTML =>{
  leaderDocument = leaderHTML;
}).catch( err => {
  console.log(err);
});

fetch('/index.html').then( resp => {
  return resp.text();
}).then( homeHTML =>{
  homeDocument = homeHTML;
}).catch( err => {
  console.log(err);
});

function register() {
    if ( $("#input-player-email").val().length >= 3 & $("#input-player-name").val().length >= 3 & $("#input-player-password").val().length >= 3 ) {
        console.log("rodou o if")

        const username = $("#input-player-name").val()
        const userEmail = $("#input-player-email").val()
        const userpw = $("#input-player-password").val()

        fetch('http://localhost/register/', {
            method: 'POST',
            body: JSON.stringify({
                name: username,
                email: userEmail,
                password: userpw
            }),
            headers: {
                'content-type': 'application/json'
            }
        }).then( resp => resp.text() )
        .then( resp => {
            $("#modal-sign-up").html(resp)
            $("#modal-sign-up").append(`<button type="button" id="cancel-button" onclick="closeModalHome('modal-sign-up')">Ok</button>`)
        })
    } else {
        $("#response-register").text("Preencha todos os campos")
        console.log("rodou o else")
    }
}

function login() {
    if ( $("#input-player-name-login").val().length >= 3 & $("#input-player-password-login").val().length >= 3 ) {
        const username = $("#input-player-name-login").val()
        const userpw = $("#input-player-password-login").val()

        fetch('http://localhost/login/', {
            method: 'POST',
            body: JSON.stringify({
                id: username,
                password: userpw
            }),
            headers: {
                'content-type': 'application/json'
            }
        }).then( response => {
            return response.text()
        }).then( res =>
            $("#response-msg-server").text(res)
        )
    } else {
        $("#response-register").text("Preencha todos os campos")
    }
}
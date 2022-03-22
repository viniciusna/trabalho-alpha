function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.visibility = "visible";
}

function closeModal(modalId) {
    let modal = document.getElementById(modalId);
    modal.style.visibility = "hidden";
}

const url = window.location.href.slice(7,-1);
const port = 80;

$(document).ready(function (){
  $.ajax({
    url: url
  }).done((data)=>{
    Object.entries(data).forEach(element => {
      $("#ranking  tr:last").after(`<tr><td>${data.name}</td><td>${data.victories}</td></tr>`)
    });
  });
});
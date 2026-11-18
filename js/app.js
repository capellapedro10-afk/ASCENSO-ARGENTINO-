/* app.js — Punto de entrada de Ascenso Argentino */
window.AA = window.AA || {};

function main(){
  const State = window.AA.State;
  const UI = window.AA.UI;

  /* Cargar partida existente o crear estado vacío */
  State.load();

  /* Inicializar interfaz y enlazar eventos */
  UI.init();

  /* Pantalla inicial: inicio (menú principal) */
  UI.showScreen("home");
  UI.renderHome();
}

document.addEventListener("DOMContentLoaded", main);

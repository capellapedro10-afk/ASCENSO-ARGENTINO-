/* state.js — Estado del juego y persistencia en localStorage */
window.AA.State = (function(){
  const C = window.AA.CONFIG;
  let state = null;

  function newEmptyState(){
    return {
      meta: { version: C.STORAGE_VERSION, createdAt: Date.now() },
      careerName: "Mi Carrera",
      coachName: "",
      clubId: null,
      season: 1,
      division: 2,
      matchday: 1,
      budget: 0,
      squads: {},        // clubId -> [jugadores]
      lineup: { formation: "4-3-3", style: "equilibrado", slots: {}, subs: [] },
      transfers: [],
      played: {},        // matchday -> [resultados]
      calendar: {},
      standings: {},
      divisions: { 1: [], 2: [] },
      history: [],
      market: []
    };
  }

  function load(){
    const raw = localStorage.getItem(C.STORAGE_KEY);
    if(raw){
      try {
        state = JSON.parse(raw);
        if(!state || !state.meta || state.meta.version !== C.STORAGE_VERSION){
          state = newEmptyState();
        }
      } catch(e){
        console.error("Error al leer la partida guardada", e);
        state = newEmptyState();
      }
    } else {
      state = newEmptyState();
    }
    return state;
  }

  function save(){
    localStorage.setItem(C.STORAGE_KEY, JSON.stringify(state));
    return state;
  }

  function get(){ return state; }
  function set(s){ state = s; }

  function reset(){
    state = newEmptyState();
    save();
    return state;
  }

  return { load, save, get, set, reset, newEmptyState };
})();

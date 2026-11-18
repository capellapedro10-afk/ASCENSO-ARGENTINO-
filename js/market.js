/* market.js — Mercado de pases: fichajes, ventas y validaciones */
window.AA.Market = (function(){
  const C = window.AA.CONFIG;
  const Data = window.AA.Data;

  function canAfford(state, amount){
    return (state.budget || 0) >= amount;
  }

  /* Vende un jugador del plantel del usuario */
  function sellPlayer(state, playerId){
    const squad = state.squads[state.clubId];
    if(!squad) return { ok: false, msg: "No hay plantel cargado." };
    const idx = squad.findIndex(p => p.id === playerId);
    if(idx === -1) return { ok: false, msg: "Jugador no encontrado en el plantel." };
    const p = squad[idx];
    const price = Math.max(200000, Math.round(p.marketValue * 0.85));

    squad.splice(idx, 1);

    /* Quitar de alineación si estaba */
    const lineup = state.lineup || {};
    Object.keys(lineup.slots || {}).forEach(slot => {
      if(lineup.slots[slot] === playerId) lineup.slots[slot] = null;
    });
    lineup.subs = (lineup.subs || []).filter(id => id !== playerId);

    state.budget = Math.round(state.budget + price);
    state.transfers.push({
      type: "venta", playerId, player: p.nombreCompleto, club: state.clubId,
      price, when: Date.now(), season: state.season
    });
    return { ok: true, price, player: p };
  }

  /* Ficha un agente libre */
  function signPlayer(state, playerId){
    const idx = state.market.findIndex(p => p.id === playerId);
    if(idx === -1) return { ok: false, msg: "Jugador no disponible en el mercado." };
    const p = state.market[idx];
    const squad = state.squads[state.clubId];
    if(!squad) return { ok: false, msg: "No hay plantel cargado." };

    const totalSalaries = squad.reduce((sum, x) => sum + (x.salary || 0), 0) + p.salary;
    const cost = Math.round(p.marketValue * 1.1); // coste de fichaje

    if(!canAfford(state, cost)){
      return { ok: false, msg: "Presupuesto insuficiente para fichar a este jugador." };
    }
    if(squad.length >= 30){
      return { ok: false, msg: "El plantel está completo (máximo 30 jugadores). Vende a alguien antes." };
    }

    const nuevo = { ...p };
    nuevo.clubId = state.clubId;
    nuevo.id = Data.nextId("p"); // nuevo id propio del club

    state.budget = Math.round(state.budget - cost);
    squad.push(nuevo);

    state.transfers.push({
      type: "fichaje", playerId: nuevo.id, player: nuevo.nombreCompleto,
      from: null, club: state.clubId, price: cost,
      salary: nuevo.salary, when: Date.now(), season: state.season
    });

    state.market.splice(idx, 1);
    return { ok: true, player: nuevo, cost };
  }

  /* Genera un nuevo lote de agentes libres para el mercado */
  function refreshMarket(state){
    const count = 14 + Math.floor(Math.random() * 8);
    state.market = Data.generateFreeAgents(count);
    return state.market;
  }

  function filterMarket(market, { position, rating, maxPrice }){
    return market.filter(p => {
      if(position && position !== "todos" && p.position !== position) return false;
      if(rating && p.rating < rating) return false;
      if(maxPrice && p.marketValue > maxPrice) return false;
      return true;
    });
  }

  return { canAfford, sellPlayer, signPlayer, refreshMarket, filterMarket };
})();

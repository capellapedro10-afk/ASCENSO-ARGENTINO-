/* match.js — Motor de simulación de partidos (determinista por semilla) */
window.AA.Match = (function(){
  const C = window.AA.CONFIG;

  function hashCode(str){
    let h = 0;
    for(let i = 0; i < str.length; i++){
      h = ((h << 5) - h + str.charCodeAt(i)) | 0;
    }
    return h >>> 0;
  }

  function createRng(seed){
    let s = seed >>> 0;
    return function(){
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  function rngInt(rng, min, max){ return Math.floor(rng() * (max - min + 1)) + min; }

  function avgRating(players){
    if(!players || !players.length) return 0;
    return players.reduce((sum, p) => sum + p.rating, 0) / players.length;
  }

  /* Elige goleadores ponderados por rating entre atacantes */
  function pickScorers(players, n, rng){
    const attackers = players.filter(p => p.position === "DEL" || p.position === "MED");
    if(attackers.length === 0) attackers = players.slice();
    const out = [];
    for(let i = 0; i < n; i++){
      const total = attackers.reduce((s, p) => s + p.rating, 0);
      let r = rng() * total;
      let chosen = attackers[attackers.length - 1];
      for(const p of attackers){
        r -= p.rating;
        if(r <= 0){ chosen = p; break; }
      }
      let entry = out.find(o => o.id === chosen.id);
      if(!entry){
        entry = { id: chosen.id, nombre: chosen.nombreCompleto, minutes: [] };
        out.push(entry);
      }
      entry.minutes.push(rngInt(rng, 3, 90));
    }
    return out;
  }

  const CHANCE_TEXTS = [
    "Oportunidad clara de {name}, el remate se va desviado.",
    "{name} queda mano a mano, pero el arquero ataaja.",
    "Remate de {name} que se va por encima del travesaño.",
    "Contragolpe peligroso iniciado por {name}.",
    "{name} probó desde fuera del área, atajada del portero.",
    "Jugada de estrategia de {name}, el cabezazo se va cerca del poste."
  ];

  function simulateMatch(ctx){
    const {
      season, division, matchday, homeId, awayId, homeName, awayName,
      homePlayers, awayPlayers, homeStyle, awayStyle
    } = ctx;

    /* Semilla determinista: iguales parámetros dan siempre el mismo resultado */
    const seed = hashCode(`${season}|${division}|${matchday}|${homeId}|${awayId}`);
    const rng = createRng(seed);

    const hStyle = C.STYLES[homeStyle] || C.STYLES.equilibrado;
    const aStyle = C.STYLES[awayStyle] || C.STYLES.equilibrado;

    const homeAvg = avgRating(homePlayers);
    const awayAvg = avgRating(awayPlayers);

    /* Fuerza del equipo: calidad + estilo + localía */
    const homeStrength = homeAvg * hStyle.att * 1.08;
    const awayStrength = awayAvg * aStyle.att;

    let xgHome = Math.max(0.05, homeStrength / 70 + (rng() - 0.5) * 0.5);
    let xgAway = Math.max(0.05, awayStrength / 70 + (rng() - 0.5) * 0.5);

    const homeGoals = Math.round(xgHome);
    const awayGoals = Math.round(xgAway);

    const events = [];
    const yellowCount = {};

    const addEvent = (minute, team, type, player, desc) => {
      events.push({
        minute, team, type,
        player: player ? player.nombreCompleto : "",
        playerId: player ? player.id : "",
        desc
      });
    };

    const homeScorers = pickScorers(homePlayers, homeGoals, rng);
    const awayScorers = pickScorers(awayPlayers, awayGoals, rng);

    homeScorers.forEach(s => s.minutes.forEach(m => addEvent(m, "home", "gol",
      homePlayers.find(p => p.id === s.id), `¡Gol de ${s.nombre}!`)));
    awayScorers.forEach(s => s.minutes.forEach(m => addEvent(m, "away", "gol",
      awayPlayers.find(p => p.id === s.id), `¡Gol de ${s.nombre}!`)));

    /* Ocasiones de gol */
    for(let i = 0; i < rngInt(rng, 2, 5); i++){
      const p = homePlayers[rngInt(rng, 0, homePlayers.length - 1)];
      addEvent(rngInt(rng, 1, 90), "home", "ocasion", p,
        pick(CHANCE_TEXTS).replace("{name}", p.nombreCompleto));
    }
    for(let i = 0; i < rngInt(rng, 2, 5); i++){
      const p = awayPlayers[rngInt(rng, 0, awayPlayers.length - 1)];
      addEvent(rngInt(rng, 1, 90), "away", "ocasion", p,
        pick(CHANCE_TEXTS).replace("{name}", p.nombreCompleto));
    }

    /* Tarjetas amarillas y rojas (segunda amarilla = roja) */
    const yellowsHome = Math.floor(rngInt(rng, 0, 3) * hStyle.cards);
    const yellowsAway = Math.floor(rngInt(rng, 0, 3) * aStyle.cards);
    const giveYellow = (team, playersArr) => {
      const p = playersArr[rngInt(rng, 0, playersArr.length - 1)];
      yellowCount[p.id] = (yellowCount[p.id] || 0) + 1;
      if(yellowCount[p.id] >= 2){
        addEvent(rngInt(rng, 1, 90), team, "tarjeta_roja", p,
          `Tarjeta roja para ${p.nombreCompleto}. Segunda amarilla, es expulsado.`);
      } else {
        addEvent(rngInt(rng, 1, 90), team, "tarjeta_amarilla", p,
          `Tarjeta amarilla para ${p.nombreCompleto}.`);
      }
    };
    for(let i = 0; i < yellowsHome; i++) giveYellow("home", homePlayers);
    for(let i = 0; i < yellowsAway; i++) giveYellow("away", awayPlayers);
    if(rng() < 0.10){
      const team = rng() < 0.5 ? "home" : "away";
      const playersArr = team === "home" ? homePlayers : awayPlayers;
      const p = playersArr[rngInt(rng, 0, playersArr.length - 1)];
      addEvent(rngInt(rng, 1, 90), team, "tarjeta_roja", p,
        `Tarjeta roja directa para ${p.nombreCompleto}. Es expulsado.`);
    }

    events.sort((a, b) => a.minute - b.minute || (a.team === "home" ? -1 : 1));

    /* Posesión y disparos informativos */
    let poss = 50 + Math.round((homeAvg - awayAvg) / 2 + (rng() - 0.5) * 10);
    if(poss < 30) poss = 30;
    if(poss > 70) poss = 70;

    const winner = homeGoals > awayGoals ? "home" : homeGoals < awayGoals ? "away" : "draw";

    return {
      id: "m_" + Date.now() + "_" + Math.floor(Math.random() * 100000),
      season, division, matchday, homeId, awayId, homeName, awayName,
      homeGoals, awayGoals, winner,
      events,
      scorers: [...homeScorers, ...awayScorers].map(s => ({
        id: s.id, nombre: s.nombre, minutes: s.minutes.slice().sort((a, b) => a - b)
      })),
      homeAvg, awayAvg,
      possession: [poss, 100 - poss],
      shots: [Math.round(homeGoals + rngInt(rng, 2, 6)), Math.round(awayGoals + rngInt(rng, 2, 6))],
      finished: true,
      playedAt: Date.now()
    };
  }

  const TAG_LABEL = { gol: "Gol", ocasion: "Ocasión", tarjeta_amarilla: "Amarilla", tarjeta_roja: "Roja" };

  return { simulateMatch, hashCode, createRng, TAG_LABEL };
})();

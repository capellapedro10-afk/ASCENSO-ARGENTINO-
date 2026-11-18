/* league.js — Calendario de liga, tablas de posiciones y ascensos/descensos */
window.AA.League = (function(){
  const C = window.AA.CONFIG;
  const Data = window.AA.Data;

  /* Genera calendario de ida y vuelta (todos contra todos) con rondas balanceadas */
  function generateCalendar(clubIds){
    const ids = clubIds.slice();
    const n = ids.length;
    const rounds = n - 1;
    const matchesPerRound = n / 2;
    const calendar = []; // { matchday: 1..14, matches: [{homeId, awayId}] }

    /* Round-robin: fija el último equipo y rota los demás */
    const rotated = ids.slice(0, n - 1);
    const fixed = ids[n - 1];

    for(let r = 0; r < rounds; r++){
      const matchday = r + 1;
      const matches = [];
      /* Primera mitad del round */
      for(let i = 0; i < matchesPerRound; i++){
        const a = rotated[i];
        const b = rotated[n - 2 - i];
        matches.push({ homeId: a, awayId: b });
      }
      /* El último equipo juega contra el que "sobra" */
      const leftover = rotated[matchesPerRound - 1];
      matches[matchesPerRound - 1] = { homeId: fixed, awayId: leftover };
      calendar.push({ matchday, matches });

      /* Rota: el último pasa a segunda posición */
      const last = rotated.pop();
      rotated.splice(1, 0, last);
    }

    /* Segunda vuelta: se invierten localía */
    const secondLeg = [];
    for(const leg of calendar){
      const matches = leg.matches.map(m => ({ homeId: m.awayId, awayId: m.homeId }));
      secondLeg.push({ matchday: leg.matchday + rounds, matches });
    }

    return [...calendar, ...secondLeg];
  }

  /* Inicializa las tablas vacías */
  function emptyStandings(clubIds){
    const out = {};
    for(const id of clubIds){
      out[id] = {
        clubId: id,
        pts: 0, pj: 0, pg: 0, pe: 0, pp: 0,
        gf: 0, gc: 0, dg: 0, pos: 0
      };
    }
    return out;
  }

  function applyResult(standings, result){
    const home = standings[result.homeId];
    const away = standings[result.awayId];
    if(!home || !away) return;

    home.pj++; away.pj++;
    home.gf += result.homeGoals; home.gc += result.awayGoals;
    away.gf += result.awayGoals; away.gc += result.homeGoals;

    home.dg = home.gf - home.gc;
    away.dg = away.gf - away.gc;

    if(result.homeGoals > result.awayGoals){
      home.pts += C.GOAL_POINTS; home.pg++; away.pp++;
    } else if(result.homeGoals < result.awayGoals){
      away.pts += C.GOAL_POINTS; away.pg++; home.pp++;
    } else {
      home.pts += C.DRAW_POINTS; away.pts += C.DRAW_POINTS;
      home.pe++; away.pe++;
    }
  }

  function sortStandings(standings, clubs){
    return Object.values(standings).sort((a, b) => {
      if(b.pts !== a.pts) return b.pts - a.pts;
      if(b.dg !== a.dg) return b.dg - a.dg;
      if(b.gf !== a.gf) return b.gf - a.gf;
      return 0;
    }).map((s, i) => ({ ...s, pos: i + 1 }));
  }

  /* Asciende el campeón de la división inferior; desciende el último de la superior */
  function endOfSeasonPromotionRelegation(standings1, standings2, divisions){
    const s1 = sortStandings(standings1, divisions[1]);
    const s2 = sortStandings(standings2, divisions[2]);

    const champion2 = s2[0]; // campeón de la división inferior (nivel 2)
    const relegated1 = s1[s1.length - 1]; // último de la superior

    return {
      promoted: champion2.clubId,
      relegated: relegated1.clubId
    };
  }

  function matchdayKey(season, division, matchday){
    return `s${season}_d${division}_md${matchday}`;
  }

  function findMatchInCalendar(calendar, matchday, homeId, awayId){
    const leg = calendar.find(x => x.matchday === matchday);
    if(!leg) return null;
    return leg.matches.find(m => m.homeId === homeId && m.awayId === awayId) || null;
  }

  return {
    generateCalendar,
    emptyStandings,
    applyResult,
    sortStandings,
    endOfSeasonPromotionRelegation,
    matchdayKey,
    findMatchInCalendar
  };
})();

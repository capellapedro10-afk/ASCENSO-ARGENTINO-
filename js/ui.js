/* ui.js — Renderizado de pantallas y componentes de interfaz */
window.AA.UI = (function(){
  const AA = window.AA;
  const C = AA.CONFIG;
  const Data = AA.Data;
  const League = AA.League;
  const Market = AA.Market;
  const State = AA.State;

  let currentScreen = "home";

  /* ---------- Utilidades ---------- */
  function $(sel){ return document.querySelector(sel); }
  function $$(sel){ return document.querySelectorAll(sel); }

  function showScreen(name){
    $$(".screen").forEach(el => el.classList.remove("active"));
    const el = $(`.screen[data-screen="${name}"]`);
    if(el) el.classList.add("active");
    currentScreen = name;
    $$(".nav-item").forEach(n => n.classList.remove("active"));
    const active = $(`.nav-item[data-screen="${name}"]`);
    if(active) active.classList.add("active");
    if(name === "sidebar" || name === null) return;
    // Cerrar sidebar móvil al cambiar de pantalla
    const sidebar = $(".sidebar");
    if(sidebar) sidebar.classList.remove("open");
  }

  function setSidebarBadge(html){
    const el = $("#sidebar-badge");
    if(el) el.innerHTML = html;
  }

  function toast(msg, type = "info"){
    const container = $("#toast");
    const t = document.createElement("div");
    t.className = "toast " + type;
    t.textContent = msg;
    container.appendChild(t);
    setTimeout(() => t.remove(), 3000);
  }

  function confirmAction(msg, onYes, onNo){
    if(confirm(msg)) onYes(); else if(onNo) onNo();
  }

  function formatMoney(n){
    return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n || 0);
  }

  /* ---------- Estado ---------- */
  function getState(){ return State.get(); }
  function club(){ const s = getState(); return s.clubId ? Data.getClub(s.clubId) : null; }

  /* ---------- Datos auxiliares ---------- */
  function playersOfClub(clubId){
    const s = getState();
    return (s.squads && s.squads[clubId]) || [];
  }

  function getLineup(){
    const s = getState();
    return s.lineup || { formation: "4-3-3", style: "equilibrado", slots: {}, subs: [] };
  }

  function getPlayersByIds(ids){
    const squad = playersOfClub(getState().clubId);
    const byId = {};
    squad.forEach(p => byId[p.id] = p);
    return (ids || []).map(id => byId[id]).filter(Boolean);
  }

  function statusText(rating){
    if(rating >= 75) return "Excelente";
    if(rating >= 65) return "Muy bueno";
    if(rating >= 55) return "Bueno";
    if(rating >= 45) return "Regular";
    return "Deficiente";
  }

  function statusClass(rating){
    if(rating >= 65) return "ok";
    if(rating >= 50) return "";
    return "bad";
  }

  /* ---------- Home ---------- */
  function renderHome(){
    const s = getState();
    const c = club();
    if(!c) return;

    $("#home-club-name").textContent = c.nombre;
    $("#home-club-city").textContent = c.ciudad;
    $("#home-shield").innerHTML = Data.shieldOf(c);
    $("#home-category").textContent = C.DIVISION_NAME(s.division);
    $("#home-season").textContent = "Temporada " + s.season;
    $("#home-matchday").textContent = "Fecha " + s.matchday;
    $("#home-budget").textContent = formatMoney(s.budget);

    const squad = playersOfClub(c.id);
    const avg = squad.length ? (squad.reduce((a,b) => a + b.rating,0)/squad.length).toFixed(1) : "—";
    $("#home-squad-rating").textContent = avg;
    $("#home-squad-rating").className = "stat-value " + statusClass(parseFloat(avg) || 0);

    const standing = getStanding(c.id);
    if(standing){
      $("#home-position").textContent = standing.pos;
      $("#home-points").textContent = standing.pts + " pts";
    }

    const last = getLastResult(c.id);
    const next = getNextMatch(c.id);
    $("#home-last-result").textContent = last ? last.homeName + " " + last.homeGoals + "-" + last.awayGoals + " " + last.awayName : "Sin partidos";
    $("#home-next-match").textContent = next ? next.homeName + " vs " + next.awayName : "Sin partido";

    const next = getNextMatch(c.id);
    const btn = $("#btn-next-match");
    if(!next){
      /* Ya no hay partido pendiente en esta fecha */
      if(s.matchday < C.MATCHDAYS_PER_SEASON){
        btn.disabled = false;
        btn.textContent = "Avanzar a la siguiente fecha";
        btn.classList.add("btn-primary");
        btn.classList.remove("btn-outline");
      } else {
        btn.disabled = false;
        btn.textContent = "Finalizar temporada";
        btn.classList.add("btn-primary");
        btn.classList.remove("btn-outline");
      }
    } else {
      btn.disabled = false;
      btn.textContent = "Jugar próximo partido";
      btn.classList.add("btn-primary");
      btn.classList.remove("btn-outline");
    }

    renderSidebarStats();
  }

  function getStanding(clubId){
    const s = getState();
    const table = s.standings && s.standings[s.division];
    if(!table) return null;
    return table.find(t => t.clubId === clubId) || null;
  }

  function getLastResult(clubId){
    const s = getState();
    const played = s.played[s.division];
    if(!played) return null;
    for(let md = s.matchday; md >= 1; md--){
      const arr = played[md] || [];
      for(let i = arr.length - 1; i >= 0; i--){
        const r = arr[i];
        if(r.homeId === clubId || r.awayId === clubId) return r;
      }
    }
    return null;
  }

  function getNextMatch(clubId){
    const s = getState();
    const leg = (s.calendar[s.division] || []).find(x => x.matchday === s.matchday);
    if(!leg) return null;
    const m = leg.matches.find(x => x.homeId === clubId || x.awayId === clubId);
    if(!m) return null;
    const home = Data.getClub(m.homeId);
    const away = Data.getClub(m.awayId);
    return { homeId: m.homeId, awayId: m.awayId, homeName: home.nombre, awayName: away.nombre };
  }

  function renderSidebarStats(){
    const s = getState();
    const c = club();
    if(!c) return;
    const squad = playersOfClub(c.id);
    const avg = squad.length ? (squad.reduce((a,b) => a + b.rating,0)/squad.length).toFixed(1) : "0";
    const stand = getStanding(c.id);
    const html = `
      <div style="padding: 12px 16px; border-bottom: 1px solid var(--border); background:#0b1016;">
        <div style="font-size:.75rem; text-transform:uppercase; letter-spacing:.1em; color:var(--muted); margin-bottom:6px;">Tu club</div>
        <div style="font-weight:700; font-size:1rem;">${c.nombre}</div>
        <div style="font-size:.85rem; color:var(--green); margin-top:4px;">${C.DIVISION_NAME(s.division)}</div>
      </div>
      <div style="padding: 12px 16px;">
        <div style="font-size:.75rem; text-transform:uppercase; letter-spacing:.1em; color:var(--muted); margin-bottom:6px;">Plantel</div>
        <div style="font-weight:700;">${squad.length} jugadores</div>
        <div style="font-size:.85rem; color:var(--text); margin-top:4px;">Valoración media: <b>${avg}</b></div>
      </div>
      <div style="padding: 12px 16px; border-top:1px solid var(--border);">
        <div style="font-size:.75rem; text-transform:uppercase; letter-spacing:.1em; color:var(--muted); margin-bottom:6px;">Tabla</div>
        <div style="font-weight:700;">Pos. ${stand ? stand.pos : "—"}</div>
        <div style="font-size:.85rem; color:var(--text); margin-top:4px;">${stand ? stand.pts : "—"} puntos</div>
      </div>
    `;
    setSidebarBadge(html);
  }

  /* ---------- Plantel / alineación ---------- */
  function renderPlantel(){
    const s = getState();
    const c = club();
    if(!c) return;

    const squad = playersOfClub(c.id);
    const lineup = getLineup();

    $("#plantel-budget").textContent = formatMoney(s.budget);
    $("#plantel-title").textContent = "Plantel — " + c.nombre;

    /* Tabla de jugadores */
    const tbody = $("#plantel-table-body");
    tbody.innerHTML = "";
    squad.forEach(p => {
      const tr = document.createElement("tr");
      const inLineup = Object.values(lineup.slots || {}).includes(p.id);
      const inSubs = (lineup.subs || []).includes(p.id);
      let estado = "Plantel";
      if(inLineup) estado = "Titular";
      else if(inSubs) estado = "Suplente";
      tr.innerHTML = `
        <td><div class="shield-cell"><div class="shield">${Data.makeShield(c.primary, c.secondary, c.shieldText)}</div></div>${p.nombreCompleto}</td>
        <td>${p.age}</td>
        <td>${p.position}</td>
        <td>${p.role}</td>
        <td><b>${p.rating}</b></td>
        <td>${p.potential}</td>
        <td>₡ ${formatMoney(p.salary)}/mes</td>
        <td>₡ ${formatMoney(p.marketValue)}</td>
        <td><span class="position-cell">${estado}</span></td>
        <td>
          <button class="btn btn-sm btn-outline" onclick="AA.UI.sellFromPlantel('${p.id}')">Vender</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    renderFormationControls(lineup);
    renderLineupPitch(lineup);
    renderSubs(lineup);
    renderTeamAnalysis(lineup);
  }

  function renderFormationControls(lineup){
    const box = $("#formation-controls");
    box.innerHTML = "";
    for(const [key, form] of Object.entries(C.FORMATIONS)){
      const btn = document.createElement("button");
      btn.className = "formation-btn" + (lineup.formation === key ? " active" : "");
      btn.textContent = form.label;
      btn.onclick = () => changeFormation(key);
      box.appendChild(btn);
    }
    const styleBox = $("#style-controls");
    styleBox.innerHTML = "";
    const styleLabel = document.createElement("span");
    styleLabel.style.cssText = "font-size:.75rem; text-transform:uppercase; letter-spacing:.1em; color:var(--muted); margin-right:8px;";
    styleLabel.textContent = "Estilo de juego:";
    styleBox.appendChild(styleLabel);
    for(const [key, st] of Object.entries(C.STYLES)){
      const btn = document.createElement("button");
      btn.className = "formation-btn" + (lineup.style === key ? " active" : "");
      btn.textContent = st.name;
      btn.onclick = () => changeStyle(key);
      styleBox.appendChild(btn);
    }
  }

  function changeFormation(formation){
    const s = getState();
    const current = s.lineup || { formation: "4-3-3", style: "equilibrado", slots: {}, subs: [] };
    const squad = playersOfClub(s.clubId);
    const nuevo = Data.initialLineup(s.clubId, squad, formation);
    nuevo.style = current.style; // conserva el estilo de juego elegido
    s.lineup = nuevo;
    State.save();
    renderPlantel();
    toast("Formación cambiada a " + C.FORMATIONS[formation].name);
  }

  function changeStyle(style){
    const s = getState();
    if(!s.lineup) s.lineup = { formation: "4-3-3", style: "equilibrado", slots: {}, subs: [] };
    s.lineup.style = style;
    State.save();
    renderPlantel();
    toast("Estilo de juego: " + C.STYLES[style].name);
  }

  function renderLineupPitch(lineup){
    const form = C.FORMATIONS[lineup.formation] || C.FORMATIONS["4-3-3"];
    const box = $("#lineup-pitch");
    box.innerHTML = "";

    const squad = playersOfClub(getState().clubId);
    const byId = {};
    squad.forEach(p => byId[p.id] = p);

    const slotsHtml = [];
    for(const slot of form.slots){
      const pid = lineup.slots[slot.id] || null;
      let player = pid ? byId[pid] : null;
      const empty = !player;
      slotsHtml.push(`
        <div class="slot ${empty ? "empty" : "fill"}">
          <label>${slot.label}</label>
          ${empty
            ? `<div class="player-name" style="color:var(--muted);">Vacante</div>`
            : `<div class="player-name">${player.nombreCompleto}</div>
               <div class="player-rating">${player.rating} — ${player.position}</div>`}
          ${!empty
            ? `<select id="slot-${slot.id}"><option value="">Quitar</option>${squad.map(p => `<option value="${p.id}" ${p.id===pid?"selected":""}>${p.nombreCompleto} (${p.rating})</option>`).join("")}</select>`
            : ``}
        </div>
      `);
    }

    /* Agrupar slots en filas por categoría (ARQ, DEF, MED, DEL) */
    const rows = [];
    let rowHtml = [];
    let currentCat = null;
    for(let i = 0; i < form.slots.length; i++){
      const slot = form.slots[i];
      if(currentCat !== slot.cat){
        if(rowHtml.length) rows.push(rowHtml.join(""));
        rowHtml = [];
        currentCat = slot.cat;
      }
      rowHtml.push(slotsHtml[i]);
    }
    if(rowHtml.length) rows.push(rowHtml.join(""));

    box.innerHTML = rows.map(html => `<div class="line-row">${html}</div>`).join("");

    /* Listeners de selects */
    form.slots.forEach(slot => {
      const sel = $(`#slot-${slot.id}`);
      if(!sel) return;
      sel.onchange = (e) => {
        const newId = e.target.value || null;
        const s2 = getState();
        const l2 = s2.lineup || { formation: "4-3-3", style: "equilibrado", slots: {}, subs: [] };
        /* Si el jugador elegido ya está en otro slot, lo liberamos de allí */
        Object.keys(l2.slots).forEach(k => { if(l2.slots[k] === newId) l2.slots[k] = null; });
        l2.slots[slot.id] = newId;
        l2.subs = (l2.subs || []).filter(id => id !== newId);
        s2.lineup = l2;
        State.save();
        renderPlantel();
      };
    });

    $("#team-rating").textContent = lineupRating(lineup);
    $("#team-status").textContent = statusText(parseFloat(lineupRating(lineup)) || 0);
  }

  function renderSubs(lineup){
    const box = $("#subs-list");
    box.innerHTML = "";
    const squad = playersOfClub(getState().clubId);
    const byId = {};
    squad.forEach(p => byId[p.id] = p);
    const used = new Set(Object.values(lineup.slots || {}).filter(Boolean));
    const subs = (lineup.subs || []).filter(id => byId[id] && !used.has(id));
    subs.forEach(id => {
      const p = byId[id];
      const el = document.createElement("div");
      el.className = "sub-item";
      el.innerHTML = `${p.nombreCompleto} <span style="font-size:.75rem; color:var(--muted);">(${p.rating} ${p.position})</span>
        <button class="btn btn-sm btn-danger" style="margin-left:8px; padding:2px 8px;" onclick="AA.UI.removeSub('${p.id}')">Quitar</button>`;
      box.appendChild(el);
    });
  }

  function removeSub(pid){
    const s = getState();
    const l = s.lineup || { formation: "4-3-3", style: "equilibrado", slots: {}, subs: [] };
    l.subs = (l.subs || []).filter(id => id !== pid);
    s.lineup = l;
    State.save();
    renderPlantel();
  }

  function validateLineup(lineup, squad){
    const errors = [];
    const form = C.FORMATIONS[lineup.formation];
    const filled = Object.values(lineup.slots || {}).filter(Boolean);
    if(filled.length < 11) errors.push("Debes completar los 11 titulares.");
    const dupes = filled.filter((v, i, a) => a.indexOf(v) !== i);
    if(dupes.length > 0) errors.push("Un jugador no puede ocupar dos posiciones al mismo tiempo.");
    /* Rol razonable: filtramos por categoría de la ranura */
    for(const slot of form.slots){
      const pid = lineup.slots[slot.id];
      if(pid){
        const p = squad.find(x => x.id === pid);
        if(p && p.position !== slot.cat) errors.push(`${p.nombreCompleto} no es ${slot.cat.toLowerCase()}.`);
      }
    }
    return errors;
  }

  function renderTeamAnalysis(lineup){
    const s = getState();
    const squad = playersOfClub(s.clubId);
    const form = C.FORMATIONS[lineup.formation];
    const starters = Object.values(lineup.slots || {}).map(id => squad.find(p => p.id === id)).filter(Boolean);
    const box = $("#team-analysis");
    if(!starters.length){
      box.innerHTML = "<p>Completa la alineación para ver el análisis.</p>";
      return;
    }
    const avg = starters.reduce((a,b) => a + b.rating,0)/starters.length;
    const def = starters.filter(p => p.position === "DEF");
    const med = starters.filter(p => p.position === "MED");
    const del = starters.filter(p => p.position === "DEL");
    const arq = starters.find(p => p.position === "ARQ");
    let strong = "", weak = "";
    if(avg >= 65) strong = "Buena valoración general del once inicial.";
    else weak = "Valoración general baja; considera reforzar el plantel.";
    if(arq && arq.rating >= 70) strong += " Arquero sólido.";
    else if(arq) weak += " El arquero es un punto débil.";
    if(del.length && del.reduce((a,b)=>a+b.rating,0)/del.length >= 70) strong += " Línea ofensiva peligrosa.";
    else if(del.length) weak += " Falta gol en la delantera.";
    if(def.length && def.reduce((a,b)=>a+b.rating,0)/def.length < 60) weak += " Defensa vulnerable.";
    box.innerHTML = `
      <h5>Análisis del equipo</h5>
      <p>Valoración media del once: <b>${avg.toFixed(1)}</b> — ${statusText(Math.round(avg))}</p>
      <p class="${strong?'strong':''}">${strong || "Sin puntos fuertes destacados."}</p>
      <p class="${weak?'weak':''}">${weak || "Sin puntos débiles críticos."}</p>
    `;
  }

  function lineupRating(lineup){
    const s = getState();
    const squad = playersOfClub(s.clubId);
    const starters = Object.values(lineup.slots || {}).map(id => squad.find(p => p.id === id)).filter(Boolean);
    if(!starters.length) return 0;
    return (starters.reduce((a,b) => a + b.rating,0)/starters.length).toFixed(1);
  }

  function sellFromPlantel(playerId){
    const s = getState();
    const res = Market.sellPlayer(s, playerId);
    if(res.ok){
      toast("Jugador vendido por " + formatMoney(res.price));
      State.save();
      renderPlantel();
      renderHome();
    } else {
      toast(res.msg, "err");
    }
  }

  /* ---------- Calendario ---------- */
  function renderCalendario(){
    const s = getState();
    const c = club();
    if(!c) return;

    const divisionIds = Data.clubIdsByDivision(s.division);
    const calendar = s.calendar[s.division];
    if(!calendar){
      /* Generar si no existe */
      const cal = League.generateCalendar(divisionIds);
      if(!s.calendar) s.calendar = {};
      s.calendar[s.division] = cal;
      State.save();
    }

    const leg = calendar.find(x => x.matchday === s.matchday);
    const box = $("#calendar-list");
    box.innerHTML = "";

    calendar.forEach(leg => {
      const played = (s.played[s.division] && s.played[s.division][leg.matchday]) || [];
      const playedIds = new Set(played.map(r => r.id));

      const header = document.createElement("div");
      header.style.cssText = "margin:18px 0 8px 0; font-size:.9rem; text-transform:uppercase; letter-spacing:.1em; color:var(--green); border-bottom:1px solid var(--border); padding-bottom:6px;";
      header.textContent = "Fecha " + leg.matchday;
      box.appendChild(header);

      leg.matches.forEach(m => {
        const home = Data.getClub(m.homeId);
        const away = Data.getClub(m.awayId);
        const result = played.find(r => r.homeId === m.homeId && r.awayId === m.awayId);
        const row = document.createElement("div");
        row.className = "card";
        row.style.padding = "12px 16px";
        const isUser = m.homeId === c.id || m.awayId === c.id;
        if(result){
          row.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div style="display:flex; gap:12px; align-items:center;">
                <div class="shield-cell">${Data.shieldOf(home)}</div>
                <div><b style="color:var(--text);">${home.nombre}</b><div style="font-size:.8rem; color:var(--muted);">${home.ciudad}</div></div>
              </div>
              <div style="font-variant-numeric:tabular-nums; font-size:1.5rem; font-weight:900;">${result.homeGoals} — ${result.awayGoals}</div>
              <div style="display:flex; gap:12px; align-items:center;">
                <div><b style="color:var(--text);">${away.nombre}</b><div style="font-size:.8rem; color:var(--muted);">${away.ciudad}</div></div>
                <div class="shield-cell">${Data.shieldOf(away)}</div>
              </div>
            </div>
            <div style="margin-top:8px; font-size:.85rem; color:var(--muted);">Jugado — ${result.winner==="home"?"Victoria local":result.winner==="away"?"Victoria visitante":"Empate"}</div>
          `;
        } else {
          const disabled = !(isUser && s.matchday === leg.matchday);
          row.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div style="display:flex; gap:12px; align-items:center;">
                <div class="shield-cell">${Data.shieldOf(home)}</div>
                <div><b style="color:var(--text);">${home.nombre}</b><div style="font-size:.8rem; color:var(--muted);">${home.ciudad}</div></div>
              </div>
              <div style="font-variant-numeric:tabular-nums; font-size:1.5rem; font-weight:900; color:var(--muted);">— —</div>
              <div style="display:flex; gap:12px; align-items:center;">
                <div><b style="color:var(--text);">${away.nombre}</b><div style="font-size:.8rem; color:var(--muted);">${away.ciudad}</div></div>
                <div class="shield-cell">${Data.shieldOf(away)}</div>
              </div>
            </div>
            <div style="margin-top:8px; display:flex; gap:8px;">
              ${disabled
                ? `<span style="font-size:.8rem; color:var(--muted);">Se juega tras tu partido</span>`
                : `<button class="btn btn-primary btn-sm" onclick="AA.UI.playMatch('${m.homeId}','${m.awayId}')">Jugar partido</button>`
              }
            </div>
          `;
        }
        box.appendChild(row);
      });
    });
  }

  function playMatch(homeId, awayId){
    const s = getState();
    const c = club();
    const leg = (s.calendar[s.division] || []).find(x => x.matchday === s.matchday);
    if(!leg) { toast("No hay calendario para esta fecha.", "err"); return; }
    const m = leg.matches.find(x => x.homeId === homeId && x.awayId === awayId);
    if(!m) { toast("Partido no encontrado.", "err"); return; }

    const isUserHome = homeId === c.id;
    const isUserAway = awayId === c.id;
    if(!isUserHome && !isUserAway){
      toast("Solo puedes jugar los partidos de tu club.", "err");
      return;
    }

    /* Validar alineación válida del usuario */
    const lineup = getLineup();
    const squad = playersOfClub(c.id);
    const errs = validateLineup(lineup, squad);
    if(errs.length){
      toast(errs.join(" "), "err");
      return;
    }

    const homePlayers = getPlayersByIds(Object.values(lineup.slots).filter(Boolean)).filter(p => {
      /* Para simular, usamos titulares; para el rival usamos su plantel */
      return true;
    });
    const awayPlayers = (s.squads[awayId] || []).slice().sort((a,b)=>b.rating-a.rating).slice(0, 11);
    const homePlayersFinal = isUserHome ? homePlayers : (s.squads[homeId] || []).slice().sort((a,b)=>b.rating-a.rating).slice(0, 11);
    const awayPlayersFinal = isUserAway ? homePlayers : awayPlayers;

    const ctx = {
      season: s.season, division: s.division, matchday: s.matchday,
      homeId, awayId,
      homeName: Data.getClub(homeId).nombre, awayName: Data.getClub(awayId).nombre,
      homePlayers: homePlayersFinal, awayPlayers: awayPlayersFinal,
      homeStyle: isUserHome ? lineup.style : (Data.getClub(homeId).style || "equilibrado"),
      awayStyle: isUserAway ? lineup.style : (Data.getClub(awayId).style || "equilibrado")
    };

    const result = AA.Match.simulateMatch(ctx);

    /* Actualizar estadísticas de jugadores */
    updatePlayerStats(result, squad);
    updatePlayerStats(result, s.squads[awayId] || []);

    if(!s.played[s.division]) s.played[s.division] = {};
    if(!s.played[s.division][s.matchday]) s.played[s.division][s.matchday] = [];
    s.played[s.division][s.matchday].push(result);

    /* Actualizar tabla */
    if(!s.standings[s.division]) s.standings[s.division] = League.emptyStandings(Data.clubIdsByDivision(s.division));
    League.applyResult(s.standings[s.division], result);

    /* Finanzas por partido */
    const gate = Math.round(400000 + (s.division === 1 ? 600000 : 0));
    s.budget = Math.round(s.budget + gate);

    State.save();
    showMatchResult(result);
    renderHome();
  }

  function updatePlayerStats(result, squad){
    const byId = {};
    squad.forEach(p => byId[p.id] = p);
    result.events.forEach(ev => {
      if(!ev.playerId) return;
      const p = byId[ev.playerId];
      if(!p) return;
      if(ev.type === "gol"){ p.stats.goals = (p.stats.goals||0)+1; p.stats.apps=(p.stats.apps||0)+1; p.stats.mins=(p.stats.mins||0)+45; }
      else if(ev.type === "ocasion"){ p.stats.apps=(p.stats.apps||0)+1; }
      else if(ev.type === "tarjeta_amarilla"){ p.stats.yellows=(p.stats.yellows||0)+1; }
      else if(ev.type === "tarjeta_roja"){ p.stats.reds=(p.stats.reds||0)+1; }
    });
  }

  /* ---------- Clasificación ---------- */
  function renderClasificacion(){
    const s = getState();
    const ids = Data.clubIdsByDivision(s.division);
    if(!s.standings[s.division]) s.standings[s.division] = League.emptyStandings(ids);
    const table = League.sortStandings(s.standings[s.division], ids);
    const c = club();
    const tbody = $("#standings-table-body");
    tbody.innerHTML = "";
    table.forEach((t, i) => {
      const clubD = Data.getClub(t.clubId);
      const isUser = t.clubId === c.id;
      const row = document.createElement("tr");
      if(isUser) row.classList.add("user-row");
      row.innerHTML = `
        <td class="position-cell">${t.pos}</td>
        <td><div class="shield-cell">${Data.shieldOf(clubD)}</div>${clubD.nombre}</td>
        <td>${t.pj}</td><td>${t.pg}</td><td>${t.pe}</td><td>${t.pp}</td>
        <td>${t.gf}</td><td>${t.gc}</td><td>${t.dg >= 0 ? "+":""}${t.dg}</td>
        <td><b>${t.pts}</b></td>
      `;
      tbody.appendChild(row);
    });
  }

  /* ---------- Mercado ---------- */
  function renderMercado(){
    const s = getState();
    const c = club();
    $("#market-budget").textContent = formatMoney(s.budget);
    const box = $("#market-list");
    box.innerHTML = "";
    let list = s.market || [];
    if(!list.length) Market.refreshMarket(s);

    list = Market.filterMarket(list, {
      position: $("#filtro-pos").value,
      rating: $("#filtro-rating").value ? parseInt($("#filtro-rating").value) : null,
      maxPrice: $("#filtro-precio").value ? parseInt($("#filtro-precio").value) : null
    });

    list.forEach(p => {
      const row = document.createElement("div");
      row.className = "card";
      row.style.display = "flex";
      row.style.justifyContent = "space-between";
      row.style.alignItems = "center";
      row.style.padding = "12px 16px";
      const affordable = Market.canAfford(s, Math.round(p.marketValue * 1.1));
      row.innerHTML = `
        <div>
          <div style="font-weight:700;">${p.nombreCompleto}</div>
          <div style="font-size:.85rem; color:var(--muted);">${p.position} — ${p.role} — ${p.age} años</div>
          <div style="font-size:.85rem;">Valoración <b>${p.rating}</b> | Potencial <b>${p.potential}</b></div>
          <div style="font-size:.85rem; color:var(--green);">Salario: ${formatMoney(p.salary)}/mes</div>
          <div style="font-size:.85rem;">Precio: ${formatMoney(p.marketValue)}</div>
        </div>
        <button class="btn btn-sm ${affordable?"btn-primary":"btn-outline"}" ${!affordable?"disabled":""} onclick="AA.UI.signFromMarket('${p.id}')">Fichar</button>
      `;
      box.appendChild(row);
    });
    State.save();
  }

  function signFromMarket(playerId){
    const s = getState();
    const res = Market.signPlayer(s, playerId);
    if(res.ok){
      toast("Fichaste a " + res.player.nombreCompleto + " por " + formatMoney(res.cost));
      renderMercado();
      renderPlantel();
      renderHome();
    } else {
      toast(res.msg, "err");
    }
  }

  /* ---------- Finanzas ---------- */
  function renderFinanzas(){
    const s = getState();
    const c = club();
    const squad = playersOfClub(c.id);
    const totalSalaries = squad.reduce((a,b) => a + (b.salary||0), 0);
    const yearly = totalSalaries * C.SALARY_MONTHS;
    $("#fin-budget").textContent = formatMoney(s.budget);
    $("#fin-salaries-month").textContent = formatMoney(totalSalaries);
    $("#fin-salaries-year").textContent = formatMoney(yearly);
    $("#fin-projection").textContent = formatMoney(s.budget - yearly);
    const projEl = $("#fin-projection");
    projEl.className = "stat-value " + (s.budget >= yearly ? "ok" : "bad");
  }

  /* ---------- Historial ---------- */
  function renderHistorial(){
    const s = getState();
    const box = $("#historial-list");
    box.innerHTML = "";
    if(!s.history || !s.history.length){
      box.innerHTML = "<p style='color:var(--muted);'>Aún no hay historial de temporadas.</p>";
      return;
    }
    s.history.slice().reverse().forEach(h => {
      const div = document.createElement("div");
      div.className = "card";
      div.style.padding = "16px";
      div.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div style="font-weight:800; font-size:1.1rem;">Temporada ${h.season}</div>
            <div style="font-size:.9rem; color:var(--muted);">${C.DIVISION_NAME(h.division)} — Posición ${h.position} — ${h.points} pts</div>
          </div>
          <div style="text-align:right;">
            <div style="font-weight:800; color:var(--green);">${h.promoted?"Ascenso":""}${h.relegated?" Descenso":""}</div>
            <div style="font-size:.85rem; color:var(--muted);">${h.evalGrade || ""}</div>
          </div>
        </div>
      `;
      box.appendChild(div);
    });
  }

  /* ---------- Partido (pantalla de resultado) ---------- */
  function showMatchResult(result){
    const s = getState();
    const home = Data.getClub(result.homeId);
    const away = Data.getClub(result.awayId);
    const isUser = result.homeId === s.clubId || result.awayId === s.clubId;
    const userWon = (result.winner === "home" && result.homeId === s.clubId) ||
                    (result.winner === "away" && result.awayId === s.clubId);
    const userDraw = result.winner === "draw" && isUser;

    $("#match-result-screen").classList.remove("hidden");
    $("#match-home-name").textContent = home.nombre;
    $("#match-away-name").textContent = away.nombre;
    $("#match-home-shield").innerHTML = Data.shieldOf(home);
    $("#match-away-shield").innerHTML = Data.shieldOf(away);
    $("#match-score").textContent = result.homeGoals + " — " + result.awayGoals;
    $("#match-score").className = "score";
    const lbl = $("#match-result-label");
    lbl.textContent = userWon ? "¡VICTORIA!" : (userDraw ? "EMPATE" : "DERROTA");
    lbl.className = "result-label " + (userWon ? "result-w" : userDraw ? "result-d" : "result-l");

    $("#match-info").textContent = `${home.ciudad} — ${C.DIVISION_NAME(s.division)} — Fecha ${s.matchday} — Temporada ${s.season}`;
    $("#match-possession").textContent = result.possession[0] + "% / " + result.possession[1] + "%";
    $("#match-shots").textContent = result.shots[0] + " / " + result.shots[1];

    /* Eventos */
    const evBox = $("#match-events");
    evBox.innerHTML = "";
    result.events.forEach(ev => {
      const div = document.createElement("div");
      div.className = "event " + (ev.team === "home" ? "home" : "away");
      const tagClass = "tag-" + ev.type;
      const tagLabel = AA.Match.TAG_LABEL[ev.type] || ev.type;
      div.innerHTML = `
        <div class="minute">${ev.minute}'</div>
        <div class="tag ${tagClass}">${tagLabel}</div>
        <div class="desc">${ev.desc}</div>
      `;
      evBox.appendChild(div);
    });

    /* Goleadores */
    const scorersBox = $("#match-scorers");
    scorersBox.innerHTML = "";
    if(result.scorers && result.scorers.length){
      result.scorers.forEach(sc => {
        const d = document.createElement("div");
        d.textContent = sc.nombre + " (" + sc.minutes.join("', '") + "')";
        scorersBox.appendChild(d);
      });
    } else {
      scorersBox.textContent = "Sin goles.";
    }

    /* Animación sencilla del marcador */
    animateScore(0, result.homeGoals, $("#match-score-home"));
    animateScore(0, result.awayGoals, $("#match-score-away"));

    showScreen("match");
    scrollTo(0,0);
  }

  function animateScore(from, to, el){
    if(!el) return;
    let cur = from;
    const step = Math.ceil((to - from) / 10);
    const timer = setInterval(() => {
      cur += step;
      if((step > 0 && cur >= to) || (step < 0 && cur <= to)) cur = to;
      el.textContent = cur;
      if(cur === to) clearInterval(timer);
    }, 40);
  }

  function closeMatchResult(){
    $("#match-result-screen").classList.add("hidden");
    showScreen("home");
    renderHome();
  }

  function advanceMatchday(){
    const s = getState();
    const c = club();
    const next = getNextMatch(c.id);
    if(next){
      toast("Aún queda un partido pendiente de esta fecha.", "err");
      return;
    }
    if(s.matchday < C.MATCHDAYS_PER_SEASON){
      s.matchday++;
      State.save();
      showScreen("home");
      renderHome();
      toast("Fecha " + s.matchday + " iniciada.");
    } else {
      endSeason();
    }
  }

  /* ---------- Fin de temporada ---------- */
  function endSeason(){
    const s = getState();
    const c = club();
    const ids = Data.clubIdsByDivision(s.division);
    const table = League.sortStandings(s.standings[s.division] || {}, ids);
    const userPos = table.find(t => t.clubId === c.id);
    const champion = table[0];
    const last = table[table.length - 1];

    let promoted = false, relegated = false;
    let evalGrade = "Regular";
    let evalClass = "regular";

    /* Ascenso/descenso solo si es el usuario quien está en la división afectada */
    if(s.division === 2){
      if(champion.clubId === c.id){
        promoted = true;
        s.division = 1;
      }
    } else if(s.division === 1){
      if(last.clubId === c.id){
        relegated = true;
        s.division = 2;
      }
    }

    /* Evaluación del entrenador */
    const pts = userPos ? userPos.pts : 0;
    const maxPts = C.MATCHDAYS_PER_SEASON * C.GOAL_POINTS;
    const ratio = maxPts ? pts / maxPts : 0;
    if(ratio >= 0.75){ evalGrade = "Sobresaliente"; evalClass = "sobresaliente"; }
    else if(ratio >= 0.55){ evalGrade = "Bueno"; evalClass = "bueno"; }
    else if(ratio >= 0.35){ evalGrade = "Regular"; evalClass = "regular"; }
    else { evalGrade = "Deficiente"; evalClass = "deficiente"; }

    s.history.push({
      season: s.season, division: s.division, position: userPos ? userPos.pos : 0,
      points: pts, promoted, relegated, evalGrade, evalClass
    });

    s.season++;
    s.matchday = 1;
    /* Reiniciar jugados y tabla de la nueva división */
    s.played[s.division] = {};
    s.standings[s.division] = League.emptyStandings(Data.clubIdsByDivision(s.division));

    /* Ajuste de presupuesto por temporada */
    const bonus = promoted ? 5000000 : (relegated ? -3000000 : 2000000);
    s.budget = Math.round(s.budget + bonus);

    /* Refrescar mercado */
    Market.refreshMarket(s);

    State.save();

    const box = $("#season-end-content");
    box.innerHTML = `
      <h2>Fin de la Temporada ${s.season - 1}</h2>
      <p>Tu club: <b>${c.nombre}</b> — ${C.DIVISION_NAME(s.division === 2 ? (promoted?1:2) : (relegated?2:1))}</p>
      <p>Posición final: ${userPos ? userPos.pos : "—"} de ${ids.length} — ${pts} puntos</p>
      ${promoted ? '<p style="color:var(--green); font-weight:800;">¡ASCENSO a la máxima categoría!</p>' : ''}
      ${relegated ? '<p style="color:var(--red); font-weight:800;">Descenso a la división inferior.</p>' : ''}
      <p>Evaluación del entrenador: <span class="eval-grade ${evalClass}">${evalGrade}</span></p>
      <p>Presupuesto actualizado: <b>${formatMoney(s.budget)}</b></p>
      <button class="btn btn-primary btn-block" onclick="AA.UI.closeSeasonEnd()">Continuar a la siguiente temporada</button>
    `;
    showScreen("season-end");
  }

  function closeSeasonEnd(){
    showScreen("home");
    renderHome();
    renderCalendario();
    renderClasificacion();
  }

  /* ---------- Creación de carrera ---------- */
  function renderNewCareer(){
    const box = $("#career-clubs");
    box.innerHTML = "";
    Data.getPlayableClubs().forEach(c => {
      const card = document.createElement("div");
      card.className = "club-card";
      card.onclick = () => selectClub(c.id);
      card.innerHTML = `
        <div class="club-card-header">
          <div class="shield">${Data.makeShield(c.primary, c.secondary, c.shieldText)}</div>
          <div>
            <div class="club-card-title">${c.nombre}</div>
            <div class="club-card-city">${c.ciudad}</div>
          </div>
        </div>
        <div class="club-card-body">
          <span class="club-tag tag-${c.dificultad}">${C.DIFFICULTY[c.dificultad].name}</span><br>
          <div style="font-size:.85rem; color:var(--muted); margin-bottom:8px;">${c.objetivo}</div>
          <div style="font-size:.85rem;">Presupuesto inicial: <b>${formatMoney(c.presupuesto)}</b></div>
          <div style="font-size:.85rem; color:var(--text); margin-top:6px;">Estadio: ${c.estadio}</div>
        </div>
        <div class="club-card-footer">
          <button class="btn btn-sm btn-primary" onclick="event.stopPropagation(); AA.UI.selectClub('${c.id}')">Elegir</button>
        </div>
      `;
      box.appendChild(card);
    });
  }

  let selectedClubId = null;
  function selectClub(id){
    selectedClubId = id;
    $$(".club-card").forEach(el => el.classList.remove("selected"));
    const el = Array.from($$(".club-card")).find(e => e.onclick && e.onclick.toString().includes(id));
    /* Marcamos visualmente por data */
    $$(".club-card").forEach(e => {
      if(e.querySelector("button") && e.querySelector("button").onclick && e.querySelector("button").onclick.toString().includes(id)){
        e.classList.add("selected");
      }
    });
    $("#career-coach-name").disabled = false;
    $("#btn-start-career").disabled = false;
  }

  function startCareer(){
    const coach = $("#career-coach-name").value.trim() || "Director Técnico";
    const name = $("#career-name").value.trim() || "Mi Carrera";
    const c = Data.getClub(selectedClubId);
    if(!c) return;

    const s = State.newEmptyState();
    s.coachName = coach;
    s.careerName = name;
    s.clubId = c.id;
    s.division = c.division;
    s.budget = c.presupuesto;
    s.season = 1;
    s.matchday = 1;

    const squad = Data.generateClubSquad(c);
    s.squads[c.id] = squad;
    s.lineup = Data.initialLineup(c.id, squad, "4-3-3");
    Market.refreshMarket(s);

    /* Calendario de la división 2 */
    const ids2 = Data.clubIdsByDivision(2);
    s.calendar[2] = League.generateCalendar(ids2);
    s.played[2] = {};
    s.standings[2] = League.emptyStandings(ids2);

    State.save();
    toast("Carrera iniciada: " + name);
    showScreen("home");
    renderHome();
  }

  /* ---------- Inicialización / menú ---------- */
  function init(){
    /* Botones globales */
    $$(".nav-item").forEach(btn => {
      btn.onclick = (e) => {
        const screen = btn.getAttribute("data-screen");
        if(screen === "new-career"){
          renderNewCareer();
          selectedClubId = null;
          $("#career-coach-name").value = "";
          $("#career-coach-name").disabled = true;
          $("#btn-start-career").disabled = true;
          showScreen(screen);
          return;
        }
        if(screen === "delete-save"){
          confirmAction("¿Borrar toda la partida? Esta acción no se puede deshacer.", () => {
            State.reset();
            toast("Partida borrada.");
            showScreen("home");
            renderHome();
          });
          return;
        }
        showScreen(screen);
        if(screen === "home") renderHome();
        else if(screen === "plantel") renderPlantel();
        else if(screen === "calendario") renderCalendario();
        else if(screen === "clasificacion") renderClasificacion();
        else if(screen === "mercado") renderMercado();
        else if(screen === "finanzas") renderFinanzas();
        else if(screen === "historial") renderHistorial();
      };
    });

    $("#btn-next-match").onclick = () => {
      const s = getState();
      const c = club();
      const next = getNextMatch(c.id);
      if(next){
        playMatch(next.homeId, next.awayId);
      } else {
        advanceMatchday();
      }
    };
    $("#btn-start-career").onclick = startCareer;
    $("#btn-close-match").onclick = closeMatchResult;
    $("#btn-continue-season").onclick = closeSeasonEnd;

    /* Filtros mercado */
    $("#filtro-pos").onchange = renderMercado;
    $("#filtro-rating").onchange = renderMercado;
    $("#filtro-precio").onchange = renderMercado;

    /* Toggle sidebar móvil */
    const btnMenu = $("#btn-menu");
    const sidebar = $(".sidebar");
    if(btnMenu && sidebar){
      btnMenu.onclick = () => sidebar.classList.toggle("open");
    }
  }

  return {
    init, showScreen, renderHome, renderPlantel, renderCalendario, renderClasificacion,
    renderMercado, renderFinanzas, renderHistorial, playMatch, advanceMatchday,
    endSeason, sellFromPlantel, signFromMarket, selectClub, startCareer,
    toast, confirmAction, getState, club, getLineup, getPlayersByIds
  };
})();

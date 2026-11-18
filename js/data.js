/* data.js — Clubes, nombres, escudos SVG y generación de plantillas */
window.AA.Data = (function(){
  const C = window.AA.CONFIG;

  const FIRST_NAMES = [
    "Lautaro","Mateo","Thiago","Santiago","Benjamín","Martín","Julián","Nicolás","Franco","Luciano",
    "Diego","Gabriel","Esteban","Rodrigo","Walter","Fernando","Ricardo","Oscar","Jorge","Carlos","Andrés",
    "Leandro","Exequiel","Nahuel","Bruno","Emiliano","Facundo","Ángel","Luis","Miguel","Javier",
    "Tomás","Lucas","Joaquín","Agustín","Ramón","Héctor","Adrián","Martín","Fabián","Daniel"
  ];
  const LAST_NAMES = [
    "Pérez","González","Rodríguez","López","Martínez","García","Fernández","Díaz","Sánchez","Romero",
    "Álvarez","Gutiérrez","Suárez","Vega","Rojas","Acuña","Medina","Castro","Ortiz","Morales",
    "Silva","Iglesias","Cabrera","Mendoza","Paredes","Ferrero","Navarro","Cáceres","Godoy","Figueroa",
    "Ríos","Domínguez","Varela","Flores","Campos","Acosta","Bustos","Calderón","Duarte","Escalante"
  ];

  /* Clubes ficticios inspirados en el fútbol argentino (sin marcas reales) */
  const CLUBS = [
    /* Primera Nacional (División 2) — jugables al iniciar la carrera */
    { id: "cac", division: 2, nombre: "Club Atlético Chascomús", ciudad: "Chascomús", primary: "#b91c1c", secondary: "#ffffff", shieldText: "CAC", presupuesto: 12000000, dificultad: "media", objetivo: "Luchar por el ascenso a la Liga Profesional.", estadio: "Estadio María Luisa", nivel: 55, style: "equilibrado" },
    { id: "fdp", division: 2, nombre: "Ferroviario de Pergamino", ciudad: "Pergamino", primary: "#1e3a8a", secondary: "#fbbf24", shieldText: "FP", presupuesto: 9000000, dificultad: "media", objetivo: "Mantener la categoría y clasificar al reducido.", estadio: "Estadio del Ferrocarril", nivel: 56, style: "defensivo" },
    { id: "sjt", division: 2, nombre: "Club San Jorge de Tandil", ciudad: "Tandil", primary: "#166534", secondary: "#ffffff", shieldText: "SJ", presupuesto: 14000000, dificultad: "facil", objetivo: "Ascender a la máxima categoría.", estadio: "Estadio del Bicentenario", nivel: 58, style: "ofensivo" },
    { id: "dlc", division: 2, nombre: "Defensores de La Carlota", ciudad: "La Carlota", primary: "#ca8a04", secondary: "#1f2937", shieldText: "DC", presupuesto: 6000000, dificultad: "dificil", objetivo: "Evitar el descenso y estabilizar el club.", estadio: "Estadio Ciudad de La Carlota", nivel: 52, style: "defensivo" },
    { id: "igy", division: 2, nombre: "Independiente de Gualeguay", ciudad: "Gualeguay", primary: "#dc2626", secondary: "#ffffff", shieldText: "IG", presupuesto: 13000000, dificultad: "facil", objetivo: "Pelear el campeonato del ascenso.", estadio: "Estadio José María Barbagelata", nivel: 57, style: "equilibrado" },
    { id: "jao", division: 2, nombre: "Juventud Antoniana del Oeste", ciudad: "Moreno", primary: "#7e22ce", secondary: "#ffffff", shieldText: "JAO", presupuesto: 8000000, dificultad: "media", objetivo: "Clasificar al reducido por el segundo ascenso.", estadio: "Estadio Fray Pío X", nivel: 54, style: "ofensivo" },
    { id: "ccu", division: 2, nombre: "Comercio Central Unidos", ciudad: "Resistencia", primary: "#b91c1c", secondary: "#ffffff", shieldText: "CCU", presupuesto: 5500000, dificultad: "dificil", objetivo: "Mantener la categoría sin compromisos.", estadio: "Estadio Centenario", nivel: 51, style: "defensivo" },
    { id: "usr", division: 2, nombre: "Unión de San Rafael", ciudad: "San Rafael", primary: "#ea580c", secondary: "#ffffff", shieldText: "USR", presupuesto: 8500000, dificultad: "media", objetivo: "Luchar por un lugar en el reducido.", estadio: "Estadio San Rafael", nivel: 55, style: "equilibrado" },
    /* Liga Profesional (División 1) — objetivo final de la carrera */
    { id: "idn", division: 1, nombre: "Independiente del Norte", ciudad: "Salta", primary: "#b91c1c", secondary: "#ffffff", shieldText: "IDN", presupuesto: 18000000, dificultad: "media", objetivo: "Mantener la categoría.", estadio: "Estadio del Norte", nivel: 66, style: "equilibrado" },
    { id: "dlp", division: 1, nombre: "Deportivo La Plata", ciudad: "La Plata", primary: "#1e3a8a", secondary: "#ffffff", shieldText: "DLP", presupuesto: 20000000, dificultad: "media", objetivo: "Clasificar a copas internacionales.", estadio: "Estadio Ciudad de La Plata", nivel: 68, style: "ofensivo" },
    { id: "rco", division: 1, nombre: "Rosario Central Oeste", ciudad: "Rosario", primary: "#000000", secondary: "#fbbf24", shieldText: "RCO", presupuesto: 17000000, dificultad: "media", objetivo: "Mantener la categoría.", estadio: "Estadio Gigante de Arroyito Oeste", nivel: 65, style: "defensivo" },
    { id: "rac", division: 1, nombre: "Racing de Córdoba", ciudad: "Córdoba", primary: "#1d4ed8", secondary: "#ffffff", shieldText: "RAC", presupuesto: 19000000, dificultad: "media", objetivo: "Pelear los primeros puestos.", estadio: "Estadio Cautivo", nivel: 67, style: "equilibrado" },
    { id: "smm", division: 1, nombre: "San Martín de Mendoza", ciudad: "Mendoza", primary: "#ffffff", secondary: "#000000", shieldText: "SMM", presupuesto: 16000000, dificultad: "media", objetivo: "Evitar el descenso.", estadio: "Estadio Malvinas Argentinas", nivel: 64, style: "ofensivo" },
    { id: "vse", division: 1, nombre: "Vélez Sarsfield Este", ciudad: "Buenos Aires", primary: "#ffffff", secondary: "#000000", shieldText: "VSE", presupuesto: 21000000, dificultad: "media", objetivo: "Campeón de la Liga Profesional.", estadio: "Estadio José Amalfitani Este", nivel: 69, style: "defensivo" },
    { id: "bds", division: 1, nombre: "Banfield del Sur", ciudad: "Banfield", primary: "#166534", secondary: "#ffffff", shieldText: "BDS", presupuesto: 17500000, dificultad: "media", objetivo: "Mantener la categoría.", estadio: "Estadio Florencio Sola Sur", nivel: 66, style: "equilibrado" },
    { id: "hds", division: 1, nombre: "Huracán de Santiago", ciudad: "Santiago del Estero", primary: "#7f1d1d", secondary: "#1d4ed8", shieldText: "HSD", presupuesto: 15500000, dificultad: "media", objetivo: "Clasificar a copas.", estadio: "Estadio Tomás Adolfo Ducó", nivel: 65, style: "ofensivo" }
  ];

  function getClub(id){ return CLUBS.find(c => c.id === id) || null; }
  function getAllClubs(){ return CLUBS; }
  function getPlayableClubs(){ return CLUBS.filter(c => c.division === 2); }
  function clubIdsByDivision(div){ return CLUBS.filter(c => c.division === div).map(c => c.id); }

  /* Escudo generado con SVG (original, sin imágenes ni marcas registradas) */
  function makeShield(primary, secondary, text){
    return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 6 L95 42 Q98 50 95 58 L50 94 L5 58 Q2 50 5 42 Z" fill="${primary}" stroke="${secondary}" stroke-width="3"/>
      <circle cx="50" cy="54" r="20" fill="${secondary}" opacity="0.14"/>
      <text x="50" y="62" text-anchor="middle" fill="${secondary}" font-family="Arial Black, sans-serif" font-size="30" font-weight="900">${text}</text>
    </svg>`;
  }

  function shieldOf(club){
    return `<div class="shield">${makeShield(club.primary, club.secondary, club.shieldText)}</div>`;
  }

  function pick(arr){ return arr[Math.floor(Math.random() * arr.length)]; }
  function randInt(min, max){ return Math.floor(Math.random() * (max - min + 1)) + min; }

  let playerCounter = 0;
  function nextId(prefix){ return `${prefix}_${++playerCounter}_${Date.now()}`; }

  function generatePlayer(clubId, division, position, role, age, rating){
    const nombre = pick(FIRST_NAMES);
    const apellido = pick(LAST_NAMES);
    const potential = Math.min(88, Math.max(50, rating + randInt(-6, 14)));
    const marketValue = Math.max(400000, Math.round((rating - 38) * 380000 + randInt(-450000, 450000)));
    const salary = Math.round(18000 + (rating - 40) * 30000 + randInt(0, 130000));
    return {
      id: nextId("p"),
      nombre, apellido,
      nombreCompleto: nombre + " " + apellido,
      age, position, role, rating, potential,
      salary, marketValue, clubId,
      stats: { apps: 0, goals: 0, mins: 0, yellows: 0, reds: 0 }
    };
  }

  function ratingForClub(club){
    const dif = C.DIFFICULTY[club.dificultad] || C.DIFFICULTY.media;
    return Math.min(88, Math.max(45, club.nivel + randInt(-5, 6) + dif.ratingBonus));
  }

  /* Plantel inicial de aproximadamente 18 jugadores por club */
  function generateClubSquad(club){
    const squad = [];
    const plan = [
      { position: "ARQ", count: 2 },
      { position: "DEF", count: 6 },
      { position: "MED", count: 6 },
      { position: "DEL", count: 4 }
    ];
    for(const group of plan){
      for(let i = 0; i < group.count; i++){
        const pos = group.position;
        const role = pick(C.ROLES[pos]).key;
        const age = pos === "ARQ" ? randInt(20, 35) : randInt(17, 34);
        squad.push(generatePlayer(club.id, club.division, pos, role, age, ratingForClub(club)));
      }
    }
    return squad;
  }

  function generateFreeAgents(count){
    const agents = [];
    const positions = ["ARQ","DEF","MED","DEL"];
    for(let i = 0; i < count; i++){
      const pos = pick(positions);
      const rating = randInt(50, 78);
      const age = randInt(18, 34);
      agents.push(generatePlayer(null, 2, pos, pick(C.ROLES[pos]).key, age, rating));
    }
    return agents;
  }

  /* Alineación por defecto: mejores jugadores de cada categoría según la formación */
  function initialLineup(clubId, players, formation = "4-3-3"){
    const def = C.FORMATIONS[formation];
    const byCat = { ARQ: [], DEF: [], MED: [], DEL: [] };
    players.forEach(p => byCat[p.position].push(p));
    Object.values(byCat).forEach(arr => arr.sort((a, b) => b.rating - a.rating));
    const slots = {};
    const c = { ARQ: 0, DEF: 0, MED: 0, DEL: 0 };
    for(const slot of def.slots){
      const player = byCat[slot.cat][c[slot.cat]];
      if(player) slots[slot.id] = player.id;
      c[slot.cat]++;
    }
    const usedIds = Object.values(slots).filter(Boolean);
    const subs = players.filter(p => !usedIds.includes(p.id));
    return { formation, style: "equilibrado", slots, subs: subs.map(p => p.id) };
  }

  return {
    CLUBS, getClub, getAllClubs, getPlayableClubs, clubIdsByDivision,
    makeShield, shieldOf, generateClubSquad, generateFreeAgents, initialLineup,
    pick, randInt
  };
})();

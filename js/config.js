/* config.js — Constantes y configuración del juego "Ascenso Argentino" */
window.AA = window.AA || {};

window.AA.CONFIG = {
  STORAGE_KEY: "ascenso_argentino_v1",
  STORAGE_VERSION: 1,

  DIVISIONS: [
    { id: 1, name: "Liga Profesional", short: "LP", level: 1, color: "#b91c1c" },
    { id: 2, name: "Primera Nacional", short: "PN", level: 2, color: "#1d4ed8" }
  ],

  /* Nombre legible de una división */
  DIVISION_NAME(divId){
    const d = this.DIVISIONS.find(x => x.id === divId);
    return d ? d.name : "División";
  },

  MATCHDAYS_PER_SEASON: 14,

  /* Formaciones tácticas y sus ranuras (slot) con categoría requerida */
  FORMATIONS: {
    "4-3-3": {
      label: "4-3-3",
      name: "Cuatro — Tres — Tres",
      slots: [
        { id: "gk", cat: "ARQ", label: "Arquero" },
        { id: "lb", cat: "DEF", label: "Lateral Izq." },
        { id: "cb1", cat: "DEF", label: "Def. Central" },
        { id: "cb2", cat: "DEF", label: "Def. Central" },
        { id: "rb", cat: "DEF", label: "Lateral Der." },
        { id: "cdm", cat: "MED", label: "Volante (Cdm)" },
        { id: "cm", cat: "MED", label: "Volante (C)" },
        { id: "cam", cat: "MED", label: "Volante (Cam)" },
        { id: "lw", cat: "DEL", label: "Extremo Izq." },
        { id: "st", cat: "DEL", label: "Delantero C." },
        { id: "rw", cat: "DEL", label: "Extremo Der." }
      ]
    },
    "4-4-2": {
      label: "4-4-2",
      name: "Cuatro — Cuatro — Dos",
      slots: [
        { id: "gk", cat: "ARQ", label: "Arquero" },
        { id: "lb", cat: "DEF", label: "Lateral Izq." },
        { id: "cb1", cat: "DEF", label: "Def. Central" },
        { id: "cb2", cat: "DEF", label: "Def. Central" },
        { id: "rb", cat: "DEF", label: "Lateral Der." },
        { id: "lm", cat: "MED", label: "Volante Izq." },
        { id: "cm1", cat: "MED", label: "Volante (C)" },
        { id: "cm2", cat: "MED", label: "Volante (C)" },
        { id: "rm", cat: "MED", label: "Volante Der." },
        { id: "st1", cat: "DEL", label: "Delantero C." },
        { id: "st2", cat: "DEL", label: "Delantero C." }
      ]
    },
    "4-2-3-1": {
      label: "4-2-3-1",
      name: "Cuatro — Dos — Tres — Uno",
      slots: [
        { id: "gk", cat: "ARQ", label: "Arquero" },
        { id: "lb", cat: "DEF", label: "Lateral Izq." },
        { id: "cb1", cat: "DEF", label: "Def. Central" },
        { id: "cb2", cat: "DEF", label: "Def. Central" },
        { id: "rb", cat: "DEF", label: "Lateral Der." },
        { id: "cdm1", cat: "MED", label: "Volante (Cdm)" },
        { id: "cdm2", cat: "MED", label: "Volante (Cdm)" },
        { id: "lm", cat: "MED", label: "Volante Izq." },
        { id: "cam", cat: "MED", label: "Volante (Cam)" },
        { id: "rm", cat: "MED", label: "Volante Der." },
        { id: "st", cat: "DEL", label: "Delantero C." }
      ]
    }
  },

  /* Estilos de juego y su efecto en la simulación */
  STYLES: {
    ofensivo: { key: "ofensivo", name: "Ofensivo", att: 1.15, def: 0.90, cards: 1.30,
      desc: "Más goles y ocasiones, pero mayor riesgo defensivo y más tarjetas." },
    equilibrado: { key: "equilibrado", name: "Equilibrado", att: 1.00, def: 1.00, cards: 1.00,
      desc: "Rendimiento equilibrado sin sacrificios extremos." },
    defensivo: { key: "defensivo", name: "Defensivo", att: 0.90, def: 1.15, cards: 0.80,
      desc: "Menos goles en contra, menos ocasiones y juego más tranquilo." }
  },

  POSITIONS: {
    ARQ: { key: "ARQ", name: "Arquero" },
    DEF: { key: "DEF", name: "Defensor" },
    MED: { key: "MED", name: "Mediocampista" },
    DEL: { key: "DEL", name: "Delantero" }
  },

  ROLES: {
    ARQ: [{ key: "ARQ", name: "Arquero" }],
    DEF: [
      { key: "DEF_CB", name: "Defensor Central" },
      { key: "DEF_LB", name: "Lateral Izquierdo" },
      { key: "DEF_RB", name: "Lateral Derecho" }
    ],
    MED: [
      { key: "MED_CDM", name: "Volante Central Defensivo" },
      { key: "MED_CM", name: "Volante Central" },
      { key: "MED_CAM", name: "Volante Ofensivo" },
      { key: "MED_LM", name: "Volante por Izquierda" },
      { key: "MED_RM", name: "Volante por Derecha" }
    ],
    DEL: [
      { key: "DEL_ST", name: "Delantero Centro" },
      { key: "DEL_CF", name: "Delantero de Apoyo" },
      { key: "DEL_LW", name: "Extremo Izquierdo" },
      { key: "DEL_RW", name: "Extremo Derecho" }
    ]
  },

  DIFFICULTY: {
    facil: { key: "facil", name: "Fácil", budgetMult: 1.4, ratingBonus: 4 },
    media: { key: "media", name: "Media", budgetMult: 1.0, ratingBonus: 0 },
    dificil: { key: "dificil", name: "Difícil", budgetMult: 0.7, ratingBonus: -4 }
  },

  SALARY_MONTHS: 12,
  GOAL_POINTS: 3,
  DRAW_POINTS: 1
};

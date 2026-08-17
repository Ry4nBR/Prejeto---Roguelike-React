import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import { drawSpriteOrFallback } from "./assets/sprites";

/* =========================================================
   CONFIGURAÇÕES GERAIS
========================================================= */

const WORLD_SIZE = 100000;
const WAVE_DURATION = 30;
const BOSS_EVERY_WAVES = 5;
const MAX_ENEMIES_CAP = 100;

const PLAYER_START_X = WORLD_SIZE / 2;
const PLAYER_START_Y = WORLD_SIZE / 2;

const INITIAL_XP_NEEDED = 60;

/* =========================================================
   OS 10 PERSONAGENS & PREÇOS DE DESBLOQUEIO
========================================================= */

const CHARACTERS = [
  {
    id: "ignis",
    name: "Ignis",
    title: "O Piromante",
    spellKey: "fire",
    icon: "🔥",
    color: "#ff6b21",
    cost: 0,
    spriteKey: "char_ignis",
    description: "Mestre das chamas primordiais que incinera hordas com projéteis incandescentes de fogo.",
  },
  {
    id: "eira",
    name: "Eira",
    title: "A Feiticeira Glacial",
    spellKey: "ice",
    icon: "❄️",
    color: "#6be5ff",
    cost: 0,
    spriteKey: "char_eira",
    description: "Feiticeira das terras gélidas que congela e estilhaça inimigos com raios de gelo.",
  },
  {
    id: "voltis",
    name: "Voltis",
    title: "O Condutor",
    spellKey: "lightning",
    icon: "⚡",
    color: "#ffd54f",
    cost: 100,
    spriteKey: "char_voltis",
    description: "Canalizador de tempestades elétricas devastadoras e relâmpagos em cadeia.",
  },
  {
    id: "nox",
    name: "Nox",
    title: "O Arauto do Abismo",
    spellKey: "shadow",
    icon: "🌑",
    color: "#b388ff",
    cost: 120,
    spriteKey: "char_nox",
    description: "Guardião do vazio que devora a velocidade e a vida dos inimigos próximos com vórtices sombrios.",
  },
  {
    id: "pyra",
    name: "Pyra",
    title: "A Invocadora Ígnea",
    spellKey: "orbitFire",
    icon: "🔴",
    color: "#ff5722",
    cost: 140,
    spriteKey: "char_pyra",
    description: "Invocadora de esferas orbitais flamejantes em formação geométrica sagrada.",
  },
  {
    id: "morrigan",
    name: "Morrigan",
    title: "A Bruxa Espectral",
    spellKey: "familiar",
    icon: "👻",
    color: "#ea80fc",
    cost: 160,
    spriteKey: "char_morrigan",
    description: "Bruxa arcana guiada por familiares espirituais que atacam incansavelmente à distância.",
  },
  {
    id: "magmus",
    name: "Magmus",
    title: "O Senhor da Lava",
    spellKey: "lava",
    icon: "🌋",
    color: "#ff3d00",
    cost: 180,
    spriteKey: "char_magmus",
    description: "Forjador vulcânico que cobre o solo com poças de magma fervente e destrutivo.",
  },
  {
    id: "astrion",
    name: "Astrion",
    title: "O Astrólogo",
    spellKey: "meteor",
    icon: "☄️",
    color: "#ff9100",
    cost: 200,
    spriteKey: "char_astrion",
    description: "Conjurador celestial que invoca meteoros cósmicos para aniquilar áreas inteiras.",
  },
  {
    id: "sylva",
    name: "Sylva",
    title: "A Druida Sombria",
    spellKey: "vines",
    icon: "🌿",
    color: "#76ff03",
    cost: 220,
    spriteKey: "char_sylva",
    description: "Guardiã da floresta sombria que invoca vinhas espinhosas para enraizar e estraçalhar seus alvos.",
  },
  {
    id: "nymira",
    name: "Nymira",
    title: "A Maga da Névoa",
    spellKey: "humidity",
    icon: "💧",
    color: "#00e5ff",
    cost: 250,
    spriteKey: "char_nymira",
    description: "Senhora das marés e névoas que confunde opositores e concede invencibilidade temporária.",
  },
];

/* =========================================================
   AS 10 MAGIAS
========================================================= */

const SPELLS = {
  fire: {
    id: "fire",
    name: "Chama",
    icon: "🔥",
    type: "Ofensivo Direto",
    baseCooldown: 1.5,
    description: "Dispara projéteis de fogo incandescente em leque.",
    details: "Projéteis velozes que incineram os inimigos à frente com alto dano de queima.",
    max: 5,
  },
  ice: {
    id: "ice",
    name: "Gelo",
    icon: "❄️",
    type: "Controle & Dano",
    baseCooldown: 3.0,
    description: "Dispara raios congelantes que paralisam alvos (3x mais se molhados).",
    details: "Paralisa completamente os alvos atingidos e causa dano contínuo de frio cortante.",
    max: 5,
  },
  lightning: {
    id: "lightning",
    name: "Raio",
    icon: "⚡",
    type: "Eliminação Rápida",
    baseCooldown: 4.5,
    description: "Invoca relâmpagos celestiais que eliminam inimigos instantaneamente.",
    details: "Gera arcos elétricos devastadores que saltam em cadeia caso haja inimigos molhados.",
    max: 5,
  },
  shadow: {
    id: "shadow",
    name: "Vórtice Sombrio",
    icon: "🌑",
    type: "Aura Contínua",
    baseCooldown: 0,
    description: "Cria um vórtice abissal constante ao redor do bruxo que desacelera e causa dano.",
    details: "Área de drenagem contínua que reduz a velocidade dos monstros e drena vida.",
    max: 5,
  },
  orbitFire: {
    id: "orbitFire",
    name: "Orbes de Fogo",
    icon: "🔴",
    type: "Defesa Orbital",
    baseCooldown: 0,
    description: "Invoca orbes de fogo em formação pentagonal simétrica que disparam periodicamente.",
    details: "Esferas giratórias protetoras ao redor do mago que atacam inimigos próximos.",
    max: 5,
  },
  familiar: {
    id: "familiar",
    name: "Familiar",
    icon: "👻",
    type: "Invocação Suporte",
    baseCooldown: 0,
    description: "Invoca familiares em formação pentagonal simétrica que disparam projéteis arcanos.",
    details: "Espíritos auxiliares leais que atacam os alvos com disparos teleguiados.",
    max: 5,
  },
  lava: {
    id: "lava",
    name: "Poças de Lava",
    icon: "🌋",
    type: "Área de Dano (DoT)",
    baseCooldown: 5.0,
    description: "Cria poças de lava no chão que causam dano contínuo massivo por segundo.",
    details: "Magma fervente deixado no solo para derreter qualquer criatura que pisar nele.",
    max: 5,
  },
  meteor: {
    id: "meteor",
    name: "Meteoro",
    icon: "☄️",
    type: "Dano Explosivo",
    baseCooldown: 4.8,
    description: "Chove meteoros incandescentes com explosões devastadoras de alto impacto.",
    details: "Impacto cósmico que pulveriza grandes grupos de inimigos em área.",
    max: 5,
  },
  vines: {
    id: "vines",
    name: "Vinhas Sombrias",
    icon: "🌿",
    type: "Enraizamento",
    baseCooldown: 5.5,
    description: "Brotam vinhas espinhosas sob os inimigos e os enraízam completamente.",
    details: "Prende os monstros ao solo, impedindo seu movimento enquanto sofrem dano contínuo.",
    max: 5,
  },
  humidity: {
    id: "humidity",
    name: "Umidade Arcana",
    icon: "💧",
    type: "Névoa & Invencibilidade",
    baseCooldown: 8.0,
    description: "Cria névoas pelo mapa que molham os inimigos e concedem invencibilidade ao bruxo.",
    details: "Névoa protetora que permite atravessar hordas sem sofrer dano enquanto estiver dentro.",
    max: 5,
  },
};

/* =========================================================
   AS 5 FUSÕES SUPREMAS
========================================================= */

const COMBINATIONS = [
  {
    id: "vaporInfernal",
    name: "Vapor Infernal",
    icon: "♨️",
    a: "Chama",
    b: "Gelo",
    keyA: "fire",
    keyB: "ice",
    requirement: "Chama Nv. 5 + Gelo Nv. 5",
    description: "Cria vapor ofensivo e combina dano contínuo de fogo + gelo com desaceleração.",
  },
  {
    id: "florestaEletrica",
    name: "Geração de Floresta",
    icon: "⚡🌿",
    a: "Raio",
    b: "Vinhas",
    keyA: "lightning",
    keyB: "vines",
    requirement: "Raio Nv. 5 + Vinhas Nv. 5",
    description: "Mortes por raio brotam Plantas Elétricas (máx. 5 por 5s) que disparam raios e geram reação em cadeia.",
  },
  {
    id: "pantanoSombrio",
    name: "Pântano Sombrio",
    icon: "🌿💧",
    a: "Vinhas",
    b: "Umidade",
    keyA: "vines",
    keyB: "humidity",
    requirement: "Vinhas Nv. 5 + Umidade Nv. 5",
    description: "Cria áreas pantanosas que prendem e desaceleram inimigos em 70%, aplicando umidade e dano contínuo.",
  },
  {
    id: "cataclismo",
    name: "Cataclismo",
    icon: "☄️🌋",
    a: "Meteoro",
    b: "Poças de Lava",
    keyA: "meteor",
    keyB: "lava",
    requirement: "Meteoro Nv. 5 + Poças de Lava Nv. 5",
    description: "Meteoros criam explosões devastadoras e deixam poças de lava duradouras no ponto de impacto.",
  },
  {
    id: "abismoVivo",
    name: "Abismo Vivo",
    icon: "🌑👻",
    a: "Vórtice Sombrio",
    b: "Familiar",
    keyA: "shadow",
    keyB: "familiar",
    requirement: "Vórtice Nv. 5 + Familiar Nv. 5",
    description: "Combina o vórtice com os familiares, criando manifestações sombrias nos familiares que sugam e aniquilam inimigos.",
  },
];

/* =========================================================
   MAPAS
========================================================= */

const MAPS = [
  {
    id: "forest",
    name: "Floresta Negra",
    icon: "🌲",
    description: "Bosque místico dominado por bruxos das sombras e criaturas espectrais.",
    unlocked: true,
  },
  {
    id: "crypt",
    name: "Cripta Abissal",
    icon: "🏛️",
    description: "Catacumbas ancestrais seladas repletas de horrores antigos.",
    unlocked: false,
    lockText: "Em Breve — Bloqueado",
  },
];

/* =========================================================
   LOJA ARCANA (UPGRADES PERMANENTES)
========================================================= */

const SHOP_ITEMS = [
  {
    id: "maxHp",
    name: "Vitalidade Arcana",
    icon: "❤",
    description: "+20 de Vida Máxima inicial por nível",
    cost: 50,
    maxLevel: 5,
  },
  {
    id: "speed",
    name: "Passos Etéreos",
    icon: "👟",
    description: "+8% de Velocidade de Movimento por nível",
    cost: 50,
    maxLevel: 5,
  },
  {
    id: "damage",
    name: "Poder Primordial",
    icon: "⚔",
    description: "+10% de Dano em todas as magias por nível",
    cost: 75,
    maxLevel: 5,
  },
  {
    id: "magnet",
    name: "Magnetismo Espiritual",
    icon: "🧲",
    description: "+25% no raio de atração de almas por nível",
    cost: 60,
    maxLevel: 5,
  },
];

/* =========================================================
   TODOS OS ARTEFATOS (EXISTENTES + 5 NOVOS)
========================================================= */

const ARTIFACTS = {
  mirror: {
    id: "mirror",
    name: "Espelho Arcano",
    icon: "🪞",
    hasCooldown: false,
    description: "Duplica a quantidade atual de Familiares e Orbes de Fogo.",
  },
  broom: {
    id: "broom",
    name: "Vassoura Encantada",
    icon: "🧹",
    hasCooldown: false,
    description: "Aumenta a velocidade de movimento do personagem em 40%.",
  },
  piercingFlame: {
    id: "piercingFlame",
    name: "Chama Perfurante",
    icon: "🔥",
    hasCooldown: false,
    description: "Os projéteis de Chama atravessam até 8 inimigos.",
  },
  ricochet: {
    id: "ricochet",
    name: "Olho do Ricochete",
    icon: "🔮",
    hasCooldown: false,
    description: "Projéteis de magia ricocheteiam entre até 5 alvos próximos.",
  },
  repulsionRune: {
    id: "repulsionRune",
    name: "Símbolo da Repulsão",
    icon: "✦",
    hasCooldown: true,
    cooldownMax: 15,
    description: "A cada 15s ativa a Runa de Repulsão que empurra e repele inimigos.",
  },
  healingRune: {
    id: "healingRune",
    name: "Símbolo da Vida",
    icon: "✚",
    hasCooldown: true,
    cooldownMax: 15,
    description: "A cada 15s ativa a Runa de Vida para restaurar 35 pontos de HP.",
  },
  stormSymbol: {
    id: "stormSymbol",
    name: "Símbolo da Tempestade",
    icon: "☔",
    hasCooldown: true,
    cooldownMax: 10,
    description: "Invoca chuva periódica. Inimigos molhados sofrem choques elétricos em cadeia.",
  },
  bloodPact: {
    id: "bloodPact",
    name: "Pacto de Sangue",
    icon: "🩸",
    hasCooldown: false,
    description: "Aumenta o dano causado em até +50% conforme a sua vida diminui.",
  },
  magneticCore: {
    id: "magneticCore",
    name: "Núcleo Magnético",
    icon: "🧲",
    hasCooldown: false,
    description: "Aumenta o raio de atração de almas e baús em +100%.",
  },
  arcaneHourglass: {
    id: "arcaneHourglass",
    name: "Ampulheta Arcana",
    icon: "⏳",
    hasCooldown: false,
    description: "Reduz o tempo de recarga de todas as magias ativas em 25%.",
  },
  huntersEye: {
    id: "huntersEye",
    name: "Olho do Caçador",
    icon: "👁️",
    hasCooldown: false,
    description: "Causa +60% de dano crítico contra inimigos com menos de 35% de vida.",
  },
  darkMoon: {
    id: "darkMoon",
    name: "Lua Sombria",
    icon: "🌙",
    hasCooldown: false,
    description: "Aumenta o poder destrutivo em +12% a cada wave avançada.",
  },
};

/* =========================================================
   UTILITÁRIOS
========================================================= */

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

/* =========================================================
   10 TIPOS DE INIMIGOS (4 CLÁSSICOS + 6 NOVOS)
========================================================= */

const ENEMY_TYPES = [
  /* 4 CLÁSSICOS */
  {
    typeKey: "darkWizard",
    name: "Bruxo Sombrio",
    color: "#15121c",
    hp: 45,
    speed: 35,
    size: 20,
    soul: "minor",
    soulXP: 8,
    minTime: 0,
  },
  {
    typeKey: "darkWitch",
    name: "Bruxa Negra",
    color: "#26152e",
    hp: 70,
    speed: 28,
    size: 23,
    soul: "dark",
    soulXP: 15,
    minTime: 20,
  },
  {
    typeKey: "corruptedMage",
    name: "Mago Corrompido",
    color: "#101a25",
    hp: 110,
    speed: 22,
    size: 27,
    soul: "cursed",
    soulXP: 25,
    minTime: 45,
  },
  {
    typeKey: "spectralWitch",
    name: "Bruxo Espectral",
    color: "#322044",
    hp: 170,
    speed: 18,
    size: 30,
    soul: "spectral",
    soulXP: 40,
    minTime: 80,
  },
  /* 6 NOVOS */
  {
    typeKey: "guardian",
    name: "Guardião",
    color: "#3e4a59",
    hp: 260,
    speed: 14,
    size: 28,
    soul: "dark",
    soulXP: 35,
    minTime: 50,
  },
  {
    typeKey: "runner",
    name: "Corredor",
    color: "#ff6347",
    hp: 32,
    speed: 68,
    size: 17,
    soul: "minor",
    soulXP: 10,
    minTime: 25,
  },
  {
    typeKey: "summoner",
    name: "Invocador",
    color: "#795290",
    hp: 140,
    speed: 20,
    size: 26,
    soul: "cursed",
    soulXP: 45,
    minTime: 60,
    isSummoner: true,
  },
  {
    typeKey: "swarm",
    name: "Enxame",
    color: "#a8e6cf",
    hp: 18,
    speed: 50,
    size: 13,
    soul: "minor",
    soulXP: 5,
    minTime: 15,
  },
  {
    typeKey: "reaper",
    name: "Ceifador",
    color: "#1a0022",
    hp: 210,
    speed: 42,
    size: 25,
    soul: "spectral",
    soulXP: 60,
    minTime: 100,
  },
  {
    typeKey: "colossus",
    name: "Colosso",
    color: "#2d132c",
    hp: 480,
    speed: 11,
    size: 40,
    soul: "spectral",
    soulXP: 90,
    minTime: 120,
  },
];

function createEnemy(x, y, typeIndex, time = 0) {
  const eligibleTypes = ENEMY_TYPES.filter((t) => time >= t.minTime);
  const pool = eligibleTypes.length > 0 ? eligibleTypes : [ENEMY_TYPES[0]];
  const type =
    typeof typeIndex === "number" && eligibleTypes[typeIndex]
      ? eligibleTypes[typeIndex]
      : pool[Math.floor(Math.random() * pool.length)];

  const hpMultiplier = 1 + Math.min(time / 180, 2.5);
  const scaledHp = Math.floor(type.hp * hpMultiplier);

  return {
    id: `${Date.now()}-${Math.random()}`,
    x,
    y,
    ...type,
    speed: type.speed * (1 + Math.min(time / 300, 0.35)),
    maxHp: scaledHp,
    hp: scaledHp,
    frozen: 0,
    wet: 0,
    rootedTimer: 0,
    shadowSlow: 0,
    dead: false,
    isBoss: false,
    summonTimer: type.isSummoner ? randomBetween(3, 5) : 0,
    hitTargets: {},
  };
}

/* =========================================================
   6 BOSSES ELEMENTAIS (WAVES 5, 10, 15, 20, 25, 30...)
========================================================= */

const BOSS_TYPES = [
  {
    id: "boss_primordial",
    name: "Bruxo Primordial",
    color: "#21152d",
    element: "dark",
    speed: 18,
    size: 38,
    spriteKey: "boss",
    specialAttack: "vortexBarrage",
  },
  {
    id: "boss_magmord",
    name: "Magmord, o Senhor do Magma",
    color: "#4a1200",
    element: "fire",
    speed: 17,
    size: 42,
    spriteKey: "boss_magmord",
    specialAttack: "magmaEruption",
  },
  {
    id: "boss_nocthar",
    name: "Nocthar, o Devorador de Sombras",
    color: "#18002a",
    element: "shadow",
    speed: 20,
    size: 40,
    spriteKey: "boss_nocthar",
    specialAttack: "abyssPull",
  },
  {
    id: "boss_tempestrix",
    name: "Tempestrix, a Rainha dos Raios",
    color: "#1b2c4d",
    element: "lightning",
    speed: 22,
    size: 36,
    spriteKey: "boss_tempestrix",
    specialAttack: "stormBarrage",
  },
  {
    id: "boss_virelia",
    name: "Virelia, a Matriarca das Vinhas",
    color: "#0f3319",
    element: "vines",
    speed: 16,
    size: 40,
    spriteKey: "boss_virelia",
    specialAttack: "entangleRoots",
  },
  {
    id: "boss_astragor",
    name: "Astragor, o Soberano Cósmico",
    color: "#301344",
    element: "meteor",
    speed: 17,
    size: 44,
    spriteKey: "boss_astragor",
    specialAttack: "meteorShower",
  },
];

function createBoss(player, wave) {
  const bossIndex = Math.floor(((wave || 5) / 5 - 1)) % BOSS_TYPES.length;
  const template = BOSS_TYPES[bossIndex] || BOSS_TYPES[0];
  const bossHp = 650 + (wave || 1) * 130;

  return {
    id: `boss-${Date.now()}-${Math.random()}`,
    name: template.name,
    x: player.x + randomBetween(-400, 400),
    y: player.y + randomBetween(-400, 400),
    color: template.color,
    hp: bossHp,
    maxHp: bossHp,
    speed: template.speed,
    size: template.size,
    soul: "boss",
    soulXP: 250,
    frozen: 0,
    wet: 0,
    rootedTimer: 0,
    shadowSlow: 0,
    dead: false,
    isBoss: true,
    bossWave: wave || 1,
    templateId: template.id,
    specialAttack: template.specialAttack,
    attackTimer: 4.0,
    rewardGiven: false,
    hitTargets: {},
  };
}

function createSoul(enemy) {
  return {
    id: `soul-${Date.now()}-${Math.random()}`,
    x: enemy.x,
    y: enemy.y,
    type: enemy.soul,
    xp: enemy.soulXP,
    life: 30,
    collected: false,
  };
}

const CHEST_TYPES = [
  { id: "xp", name: "Experiência Dobrada", icon: "✦" },
  { id: "damage", name: "Dano x2", icon: "⚔" },
  { id: "level", name: "Level Up", icon: "⬆" },
  { id: "heal", name: "Recuperação de Vida", icon: "❤" },
  { id: "nuke", name: "Bomba Atômica", icon: "☢" },
];

function createChest(player) {
  const angle = Math.random() * Math.PI * 2;
  const spawnDistance = 300 + Math.random() * 500;

  return {
    id: `chest-${Date.now()}-${Math.random()}`,
    x: player.x + Math.cos(angle) * spawnDistance,
    y: player.y + Math.sin(angle) * spawnDistance,
    type: Math.floor(Math.random() * CHEST_TYPES.length),
    opened: false,
  };
}

/* =========================================================
   COMPONENTE PRINCIPAL APP
========================================================= */

function App() {
  const canvasRef = useRef(null);

  /* ESTADOS DO MENU E TELAS */
  const [screen, setScreen] = useState("menu");
  const [selectedCharacter, setSelectedCharacter] = useState("ignis");
  const [selectedMap, setSelectedMap] = useState("forest");
  const [isPausedUI, setIsPausedUI] = useState(false);
  const [saveDataAvailable, setSaveDataAvailable] = useState(false);

  /* BANCO DE MOEDAS / ALMAS & PERSONAGENS DESBLOQUEADOS */
  const [soulsBank, setSoulsBank] = useState(() => {
    const saved = localStorage.getItem("roguelike_bank");
    return saved ? parseInt(saved, 10) : 0;
  });

  const [unlockedChars, setUnlockedChars] = useState(() => {
    const saved = localStorage.getItem("roguelike_unlocked_chars");
    return saved ? JSON.parse(saved) : ["ignis", "eira"];
  });

  const [permanentStats, setPermanentStats] = useState(() => {
    const saved = localStorage.getItem("roguelike_upgrades");
    return saved ? JSON.parse(saved) : { maxHp: 0, speed: 0, damage: 0, magnet: 0 };
  });

  /* ESTADOS REACT DA PARTIDA */
  const [, setTick] = useState(0);
  const [levelUpOptions, setLevelUpOptions] = useState([]);
  const [artifactChoices, setArtifactChoices] = useState([]);
  const [incomingArtifact, setIncomingArtifact] = useState(null);
  const [isReplacingArtifact, setIsReplacingArtifact] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  /* ESTADO DO JOGO NO REF */
  const gameRef = useRef({
    running: false,
    paused: false,
    playerIsInvincible: false,
    selectedCharacter: "ignis",
    selectedMap: "forest",

    player: {
      x: PLAYER_START_X,
      y: PLAYER_START_Y,
      hp: 100,
      maxHp: 100,
      speed: 260,
      level: 1,
      xp: 0,
      xpNeeded: INITIAL_XP_NEEDED,
      damageMultiplier: 1,
      coins: 0,
    },

    camera: {
      x: PLAYER_START_X,
      y: PLAYER_START_Y,
    },

    enemies: [],
    projectiles: [],
    effects: [],
    souls: [],
    chests: [],
    familiars: [],
    orbitBalls: [],
    lavaPools: [],
    meteors: [],
    mistClouds: [],

    /* ENTIDADES DAS FUSÕES */
    steamClouds: [],
    electricPlants: [],
    swampPools: [],

    /* OS 3 SLOTS FIXOS DE ARTEFATOS */
    artifacts: [], // lista de até 3 IDs

    /* AS 10 MAGIAS: CHAMA DESBLOQUEADA, HERÓI NO LV.2, DEMAIS LV.0 BLOQUEADAS */
    spells: {
      fire: 1,
      ice: 0,
      lightning: 0,
      shadow: 0,
      orbitFire: 0,
      familiar: 0,
      lava: 0,
      meteor: 0,
      vines: 0,
      humidity: 0,
    },

    /* COOLDOWNS ATUAIS DAS MAGIAS */
    spellTimers: {
      fire: 0,
      ice: 0,
      lightning: 0,
      lava: 0,
      meteor: 0,
      vines: 0,
      humidity: 0,
    },

    /* AS 5 FUSÕES SUPREMAS (SEM NÍVEL: ATIVAS OU NÃO) */
    fusions: {
      vaporInfernal: false,
      florestaEletrica: false,
      pantanoSombrio: false,
      cataclismo: false,
      abismoVivo: false,
    },

    keys: {},
    time: 0,
    wave: 1,

    spawnTimer: 0,
    basicTimer: 0,
    chestTimer: 10,

    xpMultiplier: 1,
    xpMultiplierTimer: 0,
    damageMultiplierTimer: 0,

    artifactTimers: {
      repulsion: 15,
      repulsionActive: 0,
      healing: 15,
      healingActive: 0,
      storm: 10,
    },

    stormActive: false,
    stormTimer: 0,
    bossSpawnedThisWave: false,
    artifactPaused: false,
    bombsUsed: 0,
    kills: 0,
  });

  function refreshUI() {
    setTick((v) => v + 1);
  }

  /* VERIFICAÇÃO INICIAL DE SAVE */
  useEffect(() => {
    const saved = localStorage.getItem("roguelike_save");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.player) {
          setSaveDataAvailable(true);
        }
      } catch (e) {
        localStorage.removeItem("roguelike_save");
      }
    }
  }, []);

  /* =======================================================
     INICIAR NOVA PARTIDA
     - Chama sempre Lv.1 (ou Lv.2 se Ignis)
     - Magia do personagem escolhido Lv.2
     - Outras 8 magias em Lv.0 e BLOQUEADAS
  ======================================================= */

  function startNewGame(charId = selectedCharacter, mapId = selectedMap) {
    const char = CHARACTERS.find((c) => c.id === charId) || CHARACTERS[0];

    const initialSpells = {
      fire: 1,
      ice: 0,
      lightning: 0,
      shadow: 0,
      orbitFire: 0,
      familiar: 0,
      lava: 0,
      meteor: 0,
      vines: 0,
      humidity: 0,
    };

    if (char && char.spellKey) {
      initialSpells[char.spellKey] = 2;
    }

    const bonusHp = (permanentStats.maxHp || 0) * 20;
    const bonusSpeed = 1 + (permanentStats.speed || 0) * 0.08;
    const bonusDmg = 1 + (permanentStats.damage || 0) * 0.1;

    gameRef.current = {
      ...gameRef.current,
      running: true,
      paused: false,
      playerIsInvincible: false,
      selectedCharacter: char.id,
      selectedMap: mapId,
      player: {
        x: PLAYER_START_X,
        y: PLAYER_START_Y,
        hp: 100 + bonusHp,
        maxHp: 100 + bonusHp,
        speed: 260 * bonusSpeed,
        level: 1,
        xp: 0,
        xpNeeded: INITIAL_XP_NEEDED,
        damageMultiplier: bonusDmg,
        coins: 0,
      },
      camera: {
        x: PLAYER_START_X,
        y: PLAYER_START_Y,
      },
      enemies: [],
      projectiles: [],
      effects: [],
      souls: [],
      chests: [],
      familiars: [],
      orbitBalls: [],
      artifacts: [],
      lavaPools: [],
      meteors: [],
      mistClouds: [],
      steamClouds: [],
      electricPlants: [],
      swampPools: [],
      spells: initialSpells,
      spellTimers: {
        fire: 0,
        ice: 0,
        lightning: 0,
        lava: 0,
        meteor: 0,
        vines: 0,
        humidity: 0,
      },
      fusions: {
        vaporInfernal: false,
        florestaEletrica: false,
        pantanoSombrio: false,
        cataclismo: false,
        abismoVivo: false,
      },
      keys: {},
      time: 0,
      wave: 1,
      spawnTimer: 0,
      basicTimer: 0,
      chestTimer: 10,
      xpMultiplier: 1,
      xpMultiplierTimer: 0,
      damageMultiplierTimer: 0,
      artifactTimers: {
        repulsion: 15,
        repulsionActive: 0,
        healing: 15,
        healingActive: 0,
        storm: 10,
      },
      stormActive: false,
      stormTimer: 0,
      bossSpawnedThisWave: false,
      artifactPaused: false,
      bombsUsed: 0,
      kills: 0,
    };

    updateSpecialSpell("orbitFire");
    updateSpecialSpell("familiar");

    setLevelUpOptions([]);
    setArtifactChoices([]);
    setIncomingArtifact(null);
    setIsReplacingArtifact(false);
    setGameOver(false);
    setIsPausedUI(false);
    setScreen("game");
    refreshUI();
  }

  /* =======================================================
     SALVAR E CONTINUAR (LOCALSTORAGE)
  ======================================================= */

  function saveGameToStorage() {
    const game = gameRef.current;
    if (!game.running) return;

    const saveData = {
      selectedCharacter: game.selectedCharacter,
      selectedMap: game.selectedMap,
      player: { ...game.player },
      camera: { ...game.camera },
      spells: { ...game.spells },
      spellTimers: { ...game.spellTimers },
      fusions: { ...game.fusions },
      artifacts: [...game.artifacts],
      time: game.time,
      wave: game.wave,
      kills: game.kills,
      enemies: game.enemies.map((e) => ({ ...e })),
      souls: game.souls.map((s) => ({ ...s })),
      chests: game.chests.map((c) => ({ ...c })),
      lavaPools: game.lavaPools.map((l) => ({ ...l })),
      mistClouds: game.mistClouds.map((m) => ({ ...m })),
      steamClouds: game.steamClouds.map((s) => ({ ...s })),
      electricPlants: game.electricPlants.map((p) => ({ ...p })),
      swampPools: game.swampPools.map((sw) => ({ ...sw })),
      savedAt: Date.now(),
    };

    localStorage.setItem("roguelike_save", JSON.stringify(saveData));
    setSaveDataAvailable(true);

    const newBank = soulsBank + Math.floor(game.kills / 2);
    setSoulsBank(newBank);
    localStorage.setItem("roguelike_bank", newBank.toString());

    game.paused = true;
    setIsPausedUI(false);
    setScreen("menu");
  }

  function loadGameFromStorage() {
    const saved = localStorage.getItem("roguelike_save");
    if (!saved) return;

    try {
      const data = JSON.parse(saved);
      const game = gameRef.current;

      game.running = true;
      game.paused = false;
      game.playerIsInvincible = false;
      game.selectedCharacter = data.selectedCharacter || "ignis";
      game.selectedMap = data.selectedMap || "forest";
      game.player = { ...data.player };
      game.camera = { ...data.camera };
      game.spells = { ...data.spells };
      game.spellTimers = data.spellTimers || { fire: 0, ice: 0, lightning: 0, lava: 0, meteor: 0, vines: 0, humidity: 0 };
      game.fusions = { ...data.fusions };
      game.artifacts = [...(data.artifacts || [])];
      game.time = data.time || 0;
      game.wave = data.wave || 1;
      game.kills = data.kills || 0;
      game.enemies = (data.enemies || []).map((e) => ({ ...e }));
      game.souls = (data.souls || []).map((s) => ({ ...s }));
      game.chests = (data.chests || []).map((c) => ({ ...c }));
      game.lavaPools = (data.lavaPools || []).map((l) => ({ ...l }));
      game.mistClouds = (data.mistClouds || []).map((m) => ({ ...m }));
      game.steamClouds = (data.steamClouds || []).map((s) => ({ ...s }));
      game.electricPlants = (data.electricPlants || []).map((p) => ({ ...p }));
      game.swampPools = (data.swampPools || []).map((sw) => ({ ...sw }));
      game.projectiles = [];
      game.effects = [];
      game.keys = {};

      updateSpecialSpell("orbitFire");
      updateSpecialSpell("familiar");

      setLevelUpOptions([]);
      setArtifactChoices([]);
      setIncomingArtifact(null);
      setIsReplacingArtifact(false);
      setGameOver(false);
      setIsPausedUI(false);
      setScreen("game");
      refreshUI();
    } catch (e) {
      localStorage.removeItem("roguelike_save");
      setSaveDataAvailable(false);
    }
  }

  function togglePause() {
    if (screen !== "game") return;
    const game = gameRef.current;
    if (levelUpOptions.length > 0 || artifactChoices.length > 0 || isReplacingArtifact || gameOver) return;

    const nextPaused = !game.paused;
    game.paused = nextPaused;
    setIsPausedUI(nextPaused);
    refreshUI();
  }

  /* =======================================================
     DISTÂNCIA ATÉ INIMIGO
  ======================================================= */

  function getClosestEnemy(x, y, ignoreIds = []) {
    const game = gameRef.current;
    let closest = null;
    let closestDistance = Infinity;

    for (const enemy of game.enemies) {
      if (enemy.dead || ignoreIds.includes(enemy.id)) continue;
      const currentDistance = Math.hypot(enemy.x - x, enemy.y - y);
      if (currentDistance < closestDistance) {
        closest = enemy;
        closestDistance = currentDistance;
      }
    }

    return closest;
  }

  /* =======================================================
     ADICIONAR XP
  ======================================================= */

  function addXP(amount) {
    const game = gameRef.current;
    if (amount <= 0) return;

    const finalXP = amount * game.xpMultiplier;
    game.player.xp += finalXP;

    while (game.player.xp >= game.player.xpNeeded) {
      game.player.xp -= game.player.xpNeeded;
      game.player.level += 1;
      game.player.xpNeeded = Math.floor(game.player.xpNeeded * 1.25);
      triggerLevelUp();
      break;
    }

    refreshUI();
  }

  /* =======================================================
     VERIFICAÇÃO DE FUSÕES AUTOMÁTICAS
  ======================================================= */

  function checkFusions() {
    const game = gameRef.current;
    for (const combo of COMBINATIONS) {
      const isAMax = (game.spells[combo.keyA] || 0) >= 5;
      const isBMax = (game.spells[combo.keyB] || 0) >= 5;
      if (isAMax && isBMax && !game.fusions[combo.id]) {
        game.fusions[combo.id] = true;
        game.effects.push({
          type: "fusionUnlocked",
          x: game.player.x,
          y: game.player.y,
          name: combo.name,
          timer: 3.0,
        });
      }
    }
  }

  /* =======================================================
     LEVEL UP - FILTRAGEM: SEM LV.5, SEM NÍVEL P/ FUSÃO
     - Magias Lv.0 aparecem para desbloqueio
     - Magias Lv.5 nunca aparecem
  ======================================================= */

  function triggerLevelUp() {
    const game = gameRef.current;
    game.paused = true;

    const availableNormalSpells = Object.keys(SPELLS).filter(
      (key) => (game.spells[key] || 0) < SPELLS[key].max
    );

    if (availableNormalSpells.length === 0) {
      game.player.hp = Math.min(game.player.maxHp, game.player.hp + 40);
      game.paused = false;
      return;
    }

    const pool = [...availableNormalSpells].sort(() => Math.random() - 0.5);
    const options = pool.slice(0, 3);
    setLevelUpOptions(options);
    refreshUI();
  }

  /* =======================================================
     ESCOLHER MAGIA NORMAL (OU DESBLOQUEAR SE LV.0)
  ======================================================= */

  function chooseSpell(spellKey) {
    const game = gameRef.current;

    if (SPELLS[spellKey]) {
      const currentLv = game.spells[spellKey] || 0;
      if (currentLv < SPELLS[spellKey].max) {
        game.spells[spellKey] = currentLv + 1;
        updateSpecialSpell(spellKey);
        checkFusions();
      }
    }

    game.paused = false;
    setLevelUpOptions([]);
    refreshUI();
  }

  /* =======================================================
     ATUALIZA MAGIAS ESPECIAIS (FORMAÇÃO PENTAGONAL)
  ======================================================= */

  function updateSpecialSpell(spellKey) {
    const game = gameRef.current;

    if (spellKey === "orbitFire") {
      const amount = game.spells.orbitFire || 0;
      while (game.orbitBalls.length < amount) {
        game.orbitBalls.push({
          angle: 0,
          timer: Math.random() * 5,
          state: "orbit",
          x: game.player.x,
          y: game.player.y,
        });
      }
    }

    if (spellKey === "familiar") {
      const amount = game.spells.familiar || 0;
      while (game.familiars.length < amount) {
        game.familiars.push({
          angle: 0,
          timer: Math.random() * 1.2,
          x: game.player.x,
          y: game.player.y,
        });
      }
    }
  }

  /* =======================================================
     MORTE DO INIMIGO & REAÇÃO DAS PLANTAS ELÉTRICAS
  ======================================================= */

  function killEnemy(enemy, killedByLightning = false) {
    const game = gameRef.current;
    if (!enemy || enemy.dead) return;

    enemy.dead = true;
    game.kills += 1;

    // FUSÃO: Geração de Floresta (Raio + Vinhas)
    if (killedByLightning && game.fusions.florestaEletrica) {
      if (game.electricPlants.length < 5) {
        game.electricPlants.push({
          id: `plant-${Date.now()}-${Math.random()}`,
          x: enemy.x,
          y: enemy.y,
          duration: 5.0,
          shootTimer: 0.6,
        });
        game.effects.push({
          type: "plantSpawn",
          x: enemy.x,
          y: enemy.y,
          timer: 0.8,
        });
      }
    }

    if (!enemy.isBoss) {
      game.souls.push(createSoul(enemy));
    }

    if (enemy.isBoss) {
      addXP(250);
      game.effects.push({
        type: "bossDeath",
        x: enemy.x,
        y: enemy.y,
        timer: 1.5,
      });

      forceBossLevelUp();
      generateArtifactChoices();
    } else {
      game.effects.push({
        type: "death",
        x: enemy.x,
        y: enemy.y,
        timer: 0.5,
      });
    }
  }

  function forceBossLevelUp() {
    const game = gameRef.current;
    game.player.level += 1;
    game.player.xp = 0;
    game.player.xpNeeded = Math.floor(game.player.xpNeeded * 1.25);
    game.paused = true;
    game.artifactPaused = true;
  }

  /* =======================================================
     DANO NO INIMIGO (COM EFEITOS DOS NOVOS ARTEFATOS)
  ======================================================= */

  function damageEnemy(enemy, amount, isLightning = false) {
    const game = gameRef.current;
    if (!enemy || enemy.dead) return;

    let multiplier = game.player.damageMultiplier;

    // ARTEFATO: Pacto de Sangue (+1% dano a cada 2% de vida perdida, max +50%)
    if (game.artifacts.includes("bloodPact")) {
      const lostHpPct = (game.player.maxHp - game.player.hp) / game.player.maxHp;
      const bonusPct = Math.min(0.5, lostHpPct * 0.5);
      multiplier *= 1 + bonusPct;
    }

    // ARTEFATO: Lua Sombria (+12% de dano por wave avançada)
    if (game.artifacts.includes("darkMoon")) {
      multiplier *= 1 + Math.max(0, (game.wave - 1) * 0.12);
    }

    // ARTEFATO: Olho do Caçador (+60% de dano contra inimigos < 35% de vida)
    if (game.artifacts.includes("huntersEye")) {
      if (enemy.hp / enemy.maxHp < 0.35) {
        multiplier *= 1.6;
      }
    }

    enemy.hp -= amount * multiplier;

    if (enemy.hp <= 0) {
      enemy.hp = 0;
      killEnemy(enemy, isLightning);
    }
  }

  /* =======================================================
     TIRO BÁSICO
  ======================================================= */

  function fireBasicShot() {
    const game = gameRef.current;
    const enemy = getClosestEnemy(game.player.x, game.player.y);
    if (!enemy) return;

    const angle = Math.atan2(enemy.y - game.player.y, enemy.x - game.player.x);

    game.projectiles.push({
      type: "basic",
      x: game.player.x,
      y: game.player.y,
      vx: Math.cos(angle) * 520,
      vy: Math.sin(angle) * 520,
      damage: 15,
      radius: 6,
      life: 2,
      color: "#ffffff",
      ricochets: 0,
      pierced: 0,
    });
  }

  /* =======================================================
     MAGIAS DE COMBATE COM COOLDOWNS EQUILIBRADOS
  ======================================================= */

  function getEffectiveCooldown(baseCd) {
    const game = gameRef.current;
    let cd = baseCd;
    if (game.artifacts.includes("arcaneHourglass")) {
      cd *= 0.75;
    }
    return cd;
  }

  // 1. CHAMA
  function castFire() {
    const game = gameRef.current;
    const level = game.spells.fire || 0;
    if (level <= 0) return;

    const amount = level;
    for (let i = 0; i < amount; i++) {
      const enemy = getClosestEnemy(game.player.x, game.player.y);
      if (!enemy) return;

      const spread = amount === 1 ? 0 : (i - (amount - 1) / 2) * 0.15;
      const angle =
        Math.atan2(enemy.y - game.player.y, enemy.x - game.player.x) + spread;

      game.projectiles.push({
        type: "fire",
        x: game.player.x,
        y: game.player.y,
        vx: Math.cos(angle) * 440,
        vy: Math.sin(angle) * 440,
        damage: 32 + amount * 6,
        radius: 10,
        life: 2,
        color: "#ff6b21",
        ricochets: 0,
        pierced: 0,
      });
    }

    if (game.fusions.vaporInfernal) {
      game.steamClouds.push({
        id: `steam-${Date.now()}-${Math.random()}`,
        x: game.player.x + randomBetween(-60, 60),
        y: game.player.y + randomBetween(-60, 60),
        radius: 75,
        duration: 4.5,
        damagePerSec: 60,
      });
    }

    game.spellTimers.fire = getEffectiveCooldown(Math.max(0.9, 1.5 - (level - 1) * 0.1));
  }

  // 2. GELO
  function castIce() {
    const game = gameRef.current;
    const level = game.spells.ice || 0;
    if (level <= 0) return;

    const targets = [...game.enemies]
      .filter((enemy) => !enemy.dead)
      .sort((a, b) => distance(game.player, a) - distance(game.player, b))
      .slice(0, Math.min(level, 5));

    for (const enemy of targets) {
      const freezeMult = enemy.wet > 0 ? 3 : 1;
      enemy.frozen = 2.5 * freezeMult;
      damageEnemy(enemy, 20 + level * 4);

      game.effects.push({
        type: "ice",
        x: enemy.x,
        y: enemy.y,
        timer: 0.5,
      });

      if (game.fusions.vaporInfernal) {
        game.steamClouds.push({
          id: `steam-${Date.now()}-${Math.random()}`,
          x: enemy.x,
          y: enemy.y,
          radius: 70,
          duration: 4.0,
          damagePerSec: 65,
        });
      }
    }

    game.spellTimers.ice = getEffectiveCooldown(Math.max(1.8, 3.0 - (level - 1) * 0.25));
  }

  // 3. RAIO
  function castLightning() {
    const game = gameRef.current;
    const level = game.spells.lightning || 0;
    if (level <= 0) return;

    const targets = [...game.enemies]
      .filter((enemy) => !enemy.dead)
      .sort((a, b) => distance(game.player, a) - distance(game.player, b))
      .slice(0, Math.min(level, 5));

    for (const enemy of targets) {
      game.effects.push({
        type: "lightning",
        x: enemy.x,
        y: enemy.y,
        timer: 0.4,
      });

      damageEnemy(enemy, 9999, true);

      if (enemy.wet > 0 || game.stormActive) {
        lightningChain(enemy);
      }
    }

    const baseCd = game.stormActive ? 1.0 : Math.max(2.4, 4.5 - (level - 1) * 0.35);
    game.spellTimers.lightning = getEffectiveCooldown(baseCd);
  }

  // 4. POÇAS DE LAVA
  function castLava() {
    const game = gameRef.current;
    const level = game.spells.lava || 0;
    if (level <= 0) return;

    for (let i = 0; i < level; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 60 + Math.random() * 260;

      game.lavaPools.push({
        id: `lava-${Date.now()}-${Math.random()}`,
        x: game.player.x + Math.cos(angle) * dist,
        y: game.player.y + Math.sin(angle) * dist,
        radius: 45 + level * 4,
        duration: 6,
        damagePerSec: 35 + level * 6,
        isCataclysm: false,
      });
    }

    game.spellTimers.lava = getEffectiveCooldown(Math.max(3.2, 5.0 - (level - 1) * 0.35));
  }

  function updateLavaPools(dt) {
    const game = gameRef.current;

    for (const pool of game.lavaPools) {
      pool.duration -= dt;

      for (const enemy of game.enemies) {
        if (enemy.dead) continue;
        if (distance(pool, enemy) <= pool.radius) {
          damageEnemy(enemy, pool.damagePerSec * dt);
        }
      }
    }

    game.lavaPools = game.lavaPools.filter((pool) => pool.duration > 0);
  }

  // 5. METEORO & FUSÃO CATACLISMO
  function castMeteor() {
    const game = gameRef.current;
    const level = game.spells.meteor || 0;
    if (level <= 0) return;

    for (let i = 0; i < level; i++) {
      const targetEnemy = getClosestEnemy(
        game.player.x + randomBetween(-300, 300),
        game.player.y + randomBetween(-300, 300)
      );

      const targetX = targetEnemy ? targetEnemy.x : game.player.x + randomBetween(-250, 250);
      const targetY = targetEnemy ? targetEnemy.y : game.player.y + randomBetween(-250, 250);

      game.meteors.push({
        id: `meteor-${Date.now()}-${Math.random()}`,
        x: targetX,
        y: targetY,
        startX: targetX + 180,
        startY: targetY - 400,
        currentX: targetX + 180,
        currentY: targetY - 400,
        timer: 0.7,
        radius: 65 + level * 8,
        damage: 130 + level * 30,
        exploded: false,
      });
    }

    game.spellTimers.meteor = getEffectiveCooldown(Math.max(3.0, 4.8 - (level - 1) * 0.35));
  }

  function updateMeteors(dt) {
    const game = gameRef.current;

    for (const m of game.meteors) {
      if (m.exploded) continue;

      m.timer -= dt;
      const progress = clamp(1 - m.timer / 0.7, 0, 1);
      m.currentX = m.startX + (m.x - m.startX) * progress;
      m.currentY = m.startY + (m.y - m.startY) * progress;

      if (m.timer <= 0) {
        m.exploded = true;

        const isCataclysm = game.fusions.cataclismo;
        const blastRadius = isCataclysm ? m.radius * 1.5 : m.radius;
        const blastDamage = isCataclysm ? m.damage * 1.6 : m.damage;

        game.effects.push({
          type: "meteorExplosion",
          x: m.x,
          y: m.y,
          radius: blastRadius,
          timer: 0.6,
        });

        for (const enemy of game.enemies) {
          if (enemy.dead) continue;
          if (distance(m, enemy) <= blastRadius) {
            damageEnemy(enemy, blastDamage);
          }
        }

        if (isCataclysm) {
          game.lavaPools.push({
            id: `cataclysm-lava-${Date.now()}-${Math.random()}`,
            x: m.x,
            y: m.y,
            radius: 110,
            duration: 10,
            damagePerSec: 85,
            isCataclysm: true,
          });

          for (let k = 0; k < 8; k++) {
            const angle = (k * Math.PI * 2) / 8;
            game.projectiles.push({
              type: "fire",
              x: m.x,
              y: m.y,
              vx: Math.cos(angle) * 380,
              vy: Math.sin(angle) * 380,
              damage: 75,
              radius: 9,
              life: 1.5,
              color: "#ff3300",
              ricochets: 0,
              pierced: 1,
            });
          }
        }
      }
    }

    game.meteors = game.meteors.filter((m) => !m.exploded);
  }

  // 6. VINHAS SOMBRIAS & FUSÃO PÂNTANO SOMBRIO
  function castVines() {
    const game = gameRef.current;
    const level = game.spells.vines || 0;
    if (level <= 0) return;

    const count = level * 3;
    const targets = [...game.enemies]
      .filter((enemy) => !enemy.dead && enemy.rootedTimer <= 0)
      .sort((a, b) => distance(game.player, a) - distance(game.player, b))
      .slice(0, count);

    for (const enemy of targets) {
      const vineMult = enemy.wet > 0 ? 3 : 1;
      enemy.rootedTimer = 3.5 * vineMult;
      damageEnemy(enemy, 25 + level * 5);

      game.effects.push({
        type: "vinesGrasp",
        x: enemy.x,
        y: enemy.y,
        timer: enemy.rootedTimer,
      });

      if (game.fusions.pantanoSombrio) {
        game.swampPools.push({
          id: `swamp-${Date.now()}-${Math.random()}`,
          x: enemy.x,
          y: enemy.y,
          radius: 80,
          duration: 7,
          damagePerSec: 45,
        });
      }
    }

    game.spellTimers.vines = getEffectiveCooldown(Math.max(3.5, 5.5 - (level - 1) * 0.4));
  }

  // 7. UMIDADE ARCANA & FUSÃO PÂNTANO
  function castHumidity() {
    const game = gameRef.current;
    const level = game.spells.humidity || 0;
    if (level <= 0) return;

    const radius = 120 + level * 25;
    const angle = Math.random() * Math.PI * 2;
    const dist = randomBetween(100, 380);

    const cloudX = game.player.x + Math.cos(angle) * dist;
    const cloudY = game.player.y + Math.sin(angle) * dist;

    game.mistClouds.push({
      id: `mist-${Date.now()}-${Math.random()}`,
      x: cloudX,
      y: cloudY,
      radius,
      duration: 8,
    });

    if (game.fusions.pantanoSombrio) {
      game.swampPools.push({
        id: `swamp-${Date.now()}-${Math.random()}`,
        x: cloudX,
        y: cloudY,
        radius: radius * 0.9,
        duration: 9,
        damagePerSec: 50,
      });
    }

    game.spellTimers.humidity = getEffectiveCooldown(Math.max(5.0, 8.0 - (level - 1) * 0.5));
  }

  function updateMistClouds(dt) {
    const game = gameRef.current;
    let playerInsideMist = false;

    for (const cloud of game.mistClouds) {
      cloud.duration -= dt;
      if (distance(game.player, cloud) <= cloud.radius) {
        playerInsideMist = true;
      }
      for (const enemy of game.enemies) {
        if (enemy.dead) continue;
        if (distance(cloud, enemy) <= cloud.radius) {
          enemy.wet = 8;
        }
      }
    }

    game.playerIsInvincible = playerInsideMist;
    game.mistClouds = game.mistClouds.filter((cloud) => cloud.duration > 0);
  }

  // ATUALIZAÇÃO DAS FUSÕES ATIVAS
  function updateSteamClouds(dt) {
    const game = gameRef.current;
    for (const cloud of game.steamClouds) {
      cloud.duration -= dt;
      for (const enemy of game.enemies) {
        if (enemy.dead) continue;
        if (distance(cloud, enemy) <= cloud.radius) {
          enemy.shadowSlow = Math.max(enemy.shadowSlow || 0, 0.45);
          enemy.wet = Math.max(enemy.wet || 0, 4);
          damageEnemy(enemy, cloud.damagePerSec * dt);
        }
      }
    }
    game.steamClouds = game.steamClouds.filter((c) => c.duration > 0);
  }

  function updateElectricPlants(dt) {
    const game = gameRef.current;
    for (const plant of game.electricPlants) {
      plant.duration -= dt;
      plant.shootTimer -= dt;

      if (plant.shootTimer <= 0) {
        const target = getClosestEnemy(plant.x, plant.y);
        if (target && distance(plant, target) < 420) {
          const angle = Math.atan2(target.y - plant.y, target.x - plant.x);
          game.projectiles.push({
            type: "electricBall",
            x: plant.x,
            y: plant.y,
            vx: Math.cos(angle) * 500,
            vy: Math.sin(angle) * 500,
            damage: 65,
            radius: 8,
            life: 1.8,
            color: "#a0ff40",
            ricochets: 0,
            pierced: 0,
            isPlantShot: true,
          });
          game.effects.push({
            type: "chainLightning",
            x: plant.x,
            y: plant.y,
            fromX: target.x,
            fromY: target.y,
            timer: 0.15,
          });
        }
        plant.shootTimer = 0.65;
      }
    }
    game.electricPlants = game.electricPlants.filter((p) => p.duration > 0);
  }

  function updateSwampPools(dt) {
    const game = gameRef.current;
    for (const pool of game.swampPools) {
      pool.duration -= dt;
      for (const enemy of game.enemies) {
        if (enemy.dead) continue;
        if (distance(pool, enemy) <= pool.radius) {
          enemy.shadowSlow = Math.max(enemy.shadowSlow || 0, 0.7);
          enemy.wet = Math.max(enemy.wet || 0, 6);
          damageEnemy(enemy, pool.damagePerSec * dt);
        }
      }
    }
    game.swampPools = game.swampPools.filter((p) => p.duration > 0);
  }

  // 8. VÓRTICE SOMBRIO
  function updateShadow(dt) {
    const game = gameRef.current;
    const level = game.spells.shadow || 0;
    if (level <= 0) return;

    const radius = 75 + level * 15;
    const slowAmount = Math.min(0.25 + level * 0.05, 0.75);

    for (const enemy of game.enemies) {
      if (enemy.dead) continue;
      const d = distance(game.player, enemy);
      if (d < radius) {
        enemy.shadowSlow = slowAmount;
        damageEnemy(enemy, 25 * dt);
      } else {
        enemy.shadowSlow = 0;
      }
    }

    game.effects.push({
      type: "shadowAura",
      x: game.player.x,
      y: game.player.y,
      radius,
      rotation: game.time * 2.5,
      timer: 0.03,
    });
  }

  // 9. ORBES DE FOGO (PENTÁGONO REAL)
  function updateOrbitBalls(dt) {
    const game = gameRef.current;
    const amount = game.spells.orbitFire || 0;
    if (amount <= 0) return;

    const radius = 70 + amount * 7;

    game.orbitBalls.forEach((ball, index) => {
      ball.angle += dt * 1.5;
      const vertexAngle = (index * Math.PI * 2) / 5;
      const currentAngle = ball.angle + vertexAngle;

      ball.x = game.player.x + Math.cos(currentAngle) * radius;
      ball.y = game.player.y + Math.sin(currentAngle) * radius;
      ball.timer += dt;

      if (ball.timer >= 5 && ball.state === "orbit") {
        const enemy = getClosestEnemy(ball.x, ball.y);
        if (enemy) {
          const angle = Math.atan2(enemy.y - ball.y, enemy.x - ball.x);
          game.projectiles.push({
            type: "orbit",
            x: ball.x,
            y: ball.y,
            vx: Math.cos(angle) * 480,
            vy: Math.sin(angle) * 480,
            damage: 50,
            radius: 12,
            life: 2,
            color: "#ff9d24",
            ricochets: 0,
            pierced: 0,
          });
          ball.timer = 0;
        }
      }
    });
  }

  // 10. FAMILIARES & FUSÃO ABISMO VIVO
  function updateFamiliars(dt) {
    const game = gameRef.current;
    const amount = game.spells.familiar || 0;
    if (amount <= 0) return;

    const isAbismoVivo = game.fusions.abismoVivo;

    game.familiars.forEach((familiar, index) => {
      familiar.angle += dt;
      const radius = 95;
      const vertexAngle = (index * Math.PI * 2) / 5;
      const currentAngle = familiar.angle + vertexAngle;

      familiar.x = game.player.x + Math.cos(currentAngle) * radius;
      familiar.y = game.player.y + Math.sin(currentAngle) * radius;

      if (isAbismoVivo) {
        const vortexRadius = 80;
        for (const enemy of game.enemies) {
          if (enemy.dead) continue;
          if (distance(familiar, enemy) <= vortexRadius) {
            enemy.shadowSlow = 0.65;
            damageEnemy(enemy, 55 * dt);
          }
        }
        game.effects.push({
          type: "shadowAura",
          x: familiar.x,
          y: familiar.y,
          radius: vortexRadius,
          rotation: game.time * 3,
          timer: 0.03,
        });
      }

      familiar.timer -= dt;

      if (familiar.timer <= 0) {
        const enemy = getClosestEnemy(familiar.x, familiar.y);
        if (enemy) {
          const angle = Math.atan2(enemy.y - familiar.y, enemy.x - familiar.x);
          game.projectiles.push({
            type: "familiar",
            x: familiar.x,
            y: familiar.y,
            vx: Math.cos(angle) * 420,
            vy: Math.sin(angle) * 420,
            damage: isAbismoVivo ? 48 : 22,
            radius: isAbismoVivo ? 10 : 7,
            life: 2,
            color: isAbismoVivo ? "#7b1fa2" : "#b978ff",
            ricochets: 0,
            pierced: isAbismoVivo ? 99 : 0,
          });
          familiar.timer = isAbismoVivo ? 0.8 : 1.2;
        }
      }
    });
  }

  /* =======================================================
     PROJÉTEIS
  ======================================================= */

  function ricochetProjectile(projectile, enemy) {
    const game = gameRef.current;
    if (!game.artifacts.includes("ricochet")) return false;

    const ricochetCount = projectile.ricochets || 0;
    if (ricochetCount >= 5) return false;

    const hitEnemies = projectile.hitEnemies || [];
    const nextEnemy = getClosestEnemy(enemy.x, enemy.y, hitEnemies);
    if (!nextEnemy || distance(enemy, nextEnemy) > 500) return false;

    const angle = Math.atan2(nextEnemy.y - enemy.y, nextEnemy.x - enemy.x);
    projectile.x = enemy.x;
    projectile.y = enemy.y;
    projectile.vx = Math.cos(angle) * 500;
    projectile.vy = Math.sin(angle) * 500;
    projectile.ricochets = ricochetCount + 1;
    return true;
  }

  function updateProjectiles(dt) {
    const game = gameRef.current;

    for (const projectile of game.projectiles) {
      projectile.x += projectile.vx * dt;
      projectile.y += projectile.vy * dt;
      projectile.life -= dt;

      if (projectile.life <= 0) continue;

      for (const enemy of game.enemies) {
        if (enemy.dead) continue;

        const alreadyHit = projectile.hitEnemies && projectile.hitEnemies.includes(enemy.id);
        if (alreadyHit) continue;

        const d = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);

        if (d < projectile.radius + enemy.size / 2) {
          if (!projectile.hitEnemies) {
            projectile.hitEnemies = [];
          }
          projectile.hitEnemies.push(enemy.id);

          let finalDamage = projectile.damage;
          if (projectile.type === "fire" && enemy.wet > 0) {
            finalDamage *= 2;
            game.effects.push({
              type: "steamCloud",
              x: enemy.x,
              y: enemy.y,
              timer: 0.4,
            });
          }

          const isLightningKill = projectile.isPlantShot || projectile.type === "electricBall";
          damageEnemy(enemy, finalDamage, isLightningKill);

          if (projectile.type === "fire" && game.artifacts.includes("piercingFlame")) {
            projectile.pierced = (projectile.pierced || 0) + 1;
            if (projectile.pierced >= 8) projectile.life = 0;
            continue;
          }

          if (projectile.pierced > 0) {
            projectile.pierced -= 1;
            continue;
          }

          if (projectile.type !== "basic") {
            const bounced = ricochetProjectile(projectile, enemy);
            if (bounced) continue;
          }

          projectile.life = 0;
          break;
        }
      }
    }

    game.projectiles = game.projectiles.filter((p) => p.life > 0);
  }

  /* =======================================================
     ATUALIZAÇÃO DOS INIMIGOS E ATAQUES DE BOSSES
  ======================================================= */

  function updateBossAttacks(boss, dt) {
    const game = gameRef.current;
    boss.attackTimer -= dt;
    if (boss.attackTimer > 0) return;

    boss.attackTimer = randomBetween(3.5, 5.0);

    switch (boss.specialAttack) {
      case "magmaEruption": {
        for (let i = 0; i < 4; i++) {
          const angle = Math.random() * Math.PI * 2;
          const dist = randomBetween(80, 220);
          game.lavaPools.push({
            id: `boss-lava-${Date.now()}-${Math.random()}`,
            x: boss.x + Math.cos(angle) * dist,
            y: boss.y + Math.sin(angle) * dist,
            radius: 60,
            duration: 8,
            damagePerSec: 40,
            isCataclysm: false,
          });
        }
        break;
      }
      case "abyssPull": {
        game.effects.push({
          type: "shadowAura",
          x: boss.x,
          y: boss.y,
          radius: 180,
          rotation: game.time * 4,
          timer: 1.5,
        });
        const d = distance(boss, game.player);
        if (d < 300) {
          const angle = Math.atan2(boss.y - game.player.y, boss.x - game.player.x);
          game.player.x += Math.cos(angle) * 70;
          game.player.y += Math.sin(angle) * 70;
        }
        break;
      }
      case "stormBarrage": {
        for (let i = 0; i < 3; i++) {
          const px = game.player.x + randomBetween(-150, 150);
          const py = game.player.y + randomBetween(-150, 150);
          game.effects.push({
            type: "lightning",
            x: px,
            y: py,
            timer: 0.5,
          });
          if (distance({ x: px, y: py }, game.player) < 50 && !game.playerIsInvincible) {
            game.player.hp -= 25;
          }
        }
        break;
      }
      case "entangleRoots": {
        game.effects.push({
          type: "vinesGrasp",
          x: game.player.x,
          y: game.player.y,
          timer: 1.8,
        });
        if (!game.playerIsInvincible) {
          game.player.hp -= 15;
        }
        break;
      }
      case "meteorShower": {
        for (let i = 0; i < 2; i++) {
          const mx = game.player.x + randomBetween(-180, 180);
          const my = game.player.y + randomBetween(-180, 180);
          game.meteors.push({
            id: `boss-meteor-${Date.now()}-${Math.random()}`,
            x: mx,
            y: my,
            startX: mx + 150,
            startY: my - 350,
            currentX: mx + 150,
            currentY: my - 350,
            timer: 0.8,
            radius: 70,
            damage: 30,
            exploded: false,
          });
        }
        break;
      }
      default:
        break;
    }
  }

  function updateEnemies(dt) {
    const game = gameRef.current;

    for (const enemy of game.enemies) {
      if (enemy.dead) continue;

      if (enemy.isBoss) {
        updateBossAttacks(enemy, dt);
      }

      if (enemy.isSummoner && !enemy.dead) {
        enemy.summonTimer -= dt;
        if (enemy.summonTimer <= 0) {
          enemy.summonTimer = randomBetween(4.0, 6.0);
          if (game.enemies.length < MAX_ENEMIES_CAP) {
            game.enemies.push(createEnemy(enemy.x + randomBetween(-40, 40), enemy.y + randomBetween(-40, 40), 0, game.time));
          }
        }
      }

      if (enemy.rootedTimer > 0) {
        enemy.rootedTimer -= dt;
        continue;
      }

      if (enemy.frozen > 0) {
        enemy.frozen -= dt;
        continue;
      }

      const slow = enemy.shadowSlow || 0;
      const currentSpeed = enemy.speed * (1 - slow);

      const angle = Math.atan2(
        game.player.y - enemy.y,
        game.player.x - enemy.x
      );

      enemy.x += Math.cos(angle) * currentSpeed * dt;
      enemy.y += Math.sin(angle) * currentSpeed * dt;

      const d = distance(enemy, game.player);
      if (d < 28) {
        if (!game.playerIsInvincible) {
          const dmg = enemy.typeKey === "reaper" ? 18 : 10;
          game.player.hp -= dmg * dt;
        }
      }

      if (enemy.wet > 0) {
        enemy.wet -= dt;
        if (enemy.wet < 0) enemy.wet = 0;
      }

      if (enemy.shadowSlow > 0) {
        enemy.shadowSlow = Math.max(0, enemy.shadowSlow - dt);
      }
    }

    game.enemies = game.enemies.filter((enemy) => !enemy.dead);
  }

  /* =======================================================
     SPAWN DE INIMIGOS (ADAPTATIVO)
  ======================================================= */

  function randomEnemyAround(player, time) {
    const angle = Math.random() * Math.PI * 2;
    const spawnDistance = 650 + Math.random() * 500;

    return createEnemy(
      player.x + Math.cos(angle) * spawnDistance,
      player.y + Math.sin(angle) * spawnDistance,
      null,
      time
    );
  }

  function spawnEnemies(dt) {
    const game = gameRef.current;
    if (game.enemies.length >= MAX_ENEMIES_CAP) return;

    game.spawnTimer -= dt;
    if (game.spawnTimer > 0) return;

    const amount = Math.min(1 + Math.floor(game.time / 45), 6);
    for (let i = 0; i < amount; i++) {
      if (game.enemies.length < MAX_ENEMIES_CAP) {
        game.enemies.push(randomEnemyAround(game.player, game.time));
      }
    }

    game.spawnTimer = Math.max(0.7, 2.5 - game.time / 220);
  }

  /* =======================================================
     WAVES
  ======================================================= */

  function updateWaves() {
    const game = gameRef.current;
    const newWave = Math.floor(game.time / WAVE_DURATION) + 1;
    if (newWave === game.wave) return;

    game.wave = newWave;

    if (game.wave % BOSS_EVERY_WAVES === 0) {
      if (!game.bossSpawnedThisWave) {
        const boss = createBoss(game.player, game.wave);
        game.enemies.push(boss);
        game.bossSpawnedThisWave = true;
        game.effects.push({
          type: "bossWarning",
          x: game.player.x,
          y: game.player.y,
          timer: 3,
        });
      }
    } else {
      game.bossSpawnedThisWave = false;
    }
  }

  /* =======================================================
     BAÚS
  ======================================================= */

  function spawnChest(dt) {
    const game = gameRef.current;
    game.chestTimer -= dt;
    if (game.chestTimer > 0) return;

    game.chests.push(createChest(game.player));
    game.chestTimer = 20;
  }

  function openChest(chest) {
    const game = gameRef.current;
    if (chest.opened) return;

    chest.opened = true;
    const chestType = CHEST_TYPES[chest.type];
    if (!chestType) return;

    switch (chestType.id) {
      case "xp": {
        game.xpMultiplier = 2;
        game.xpMultiplierTimer = 15;
        game.effects.push({
          type: "chestReward",
          x: chest.x,
          y: chest.y,
          timer: 1,
        });
        break;
      }
      case "damage": {
        game.player.damageMultiplier = 2;
        game.damageMultiplierTimer = 15;
        break;
      }
      case "level": {
        game.player.xp = game.player.xpNeeded;
        triggerLevelUp();
        break;
      }
      case "heal": {
        game.player.hp = game.player.maxHp;
        game.effects.push({
          type: "heal",
          x: game.player.x,
          y: game.player.y,
          timer: 1.5,
        });
        break;
      }
      case "nuke": {
        triggerNuclearBomb();
        break;
      }
      default:
        break;
    }

    refreshUI();
  }

  function checkChests() {
    const game = gameRef.current;
    for (const chest of game.chests) {
      if (chest.opened) continue;
      if (distance(game.player, chest) < 40) {
        openChest(chest);
      }
    }
    game.chests = game.chests.filter(
      (chest) => distance(game.player, chest) < 1800
    );
  }

  /* =======================================================
     BOMBA ATÔMICA
  ======================================================= */

  function triggerNuclearBomb() {
    const game = gameRef.current;
    let killed = 0;

    for (const enemy of game.enemies) {
      if (enemy.dead) continue;
      killEnemy(enemy);
      killed += 1;
    }

    game.bombsUsed += 1;

    game.effects.push({
      type: "nuclearPrep",
      x: game.player.x,
      y: game.player.y,
      timer: 0.3,
    });

    game.effects.push({
      type: "nuclearShockwave",
      x: game.player.x,
      y: game.player.y,
      radius: 0,
      maxRadius: 1400,
      timer: 1.5,
    });

    game.effects.push({
      type: "nuclearFlash",
      timer: 1.2,
    });

    if (killed > 0) {
      addXP(Math.min(killed * 2, 100));
    }
  }

  /* =======================================================
     ALMAS
  ======================================================= */

  function updateSouls(dt) {
    const game = gameRef.current;
    let magnetRadius = 160 * (1 + (permanentStats.magnet || 0) * 0.25);

    // ARTEFATO: Núcleo Magnético (+100% no raio de atração)
    if (game.artifacts.includes("magneticCore")) {
      magnetRadius *= 2.0;
    }

    for (const soul of game.souls) {
      soul.life -= dt;
      const d = distance(soul, game.player);

      if (d < magnetRadius) {
        const angle = Math.atan2(
          game.player.y - soul.y,
          game.player.x - soul.x
        );
        const attractionSpeed = 120 + (magnetRadius - d) * 3;
        soul.x += Math.cos(angle) * attractionSpeed * dt;
        soul.y += Math.sin(angle) * attractionSpeed * dt;
      }

      if (d < 25) {
        addXP(soul.xp);
        soul.collected = true;
      }
    }

    game.souls = game.souls.filter(
      (soul) => soul.life > 0 && !soul.collected
    );
  }

  /* =======================================================
     ARTEFATOS: 3 SLOTS FIXOS & SUBSTITUIÇÃO
  ======================================================= */

  function generateArtifactChoices() {
    const game = gameRef.current;
    const available = Object.keys(ARTIFACTS).filter(
      (key) => !game.artifacts.includes(key)
    );

    const pool = available.length >= 3 ? available : Object.keys(ARTIFACTS);
    const choices = [...pool].sort(() => Math.random() - 0.5).slice(0, 3);

    game.paused = true;
    game.artifactPaused = true;
    setArtifactChoices(choices);
    refreshUI();
  }

  function chooseArtifact(artifactKey) {
    const game = gameRef.current;
    if (!ARTIFACTS[artifactKey]) return;

    if (game.artifacts.length < 3) {
      game.artifacts.push(artifactKey);
      applyArtifact(artifactKey);
      game.paused = false;
      game.artifactPaused = false;
      setArtifactChoices([]);
      refreshUI();
    } else {
      // SLOTS CHEIOS (3/3): ABRIR MODAL DE SUBSTITUIÇÃO
      setIncomingArtifact(artifactKey);
      setIsReplacingArtifact(true);
      setArtifactChoices([]);
      refreshUI();
    }
  }

  function replaceEquippedArtifact(slotIndex) {
    const game = gameRef.current;
    if (slotIndex < 0 || slotIndex >= game.artifacts.length) return;
    if (!incomingArtifact) return;

    const oldArtifact = game.artifacts[slotIndex];
    removeArtifactEffect(oldArtifact);

    game.artifacts[slotIndex] = incomingArtifact;
    applyArtifact(incomingArtifact);

    setIncomingArtifact(null);
    setIsReplacingArtifact(false);
    game.paused = false;
    game.artifactPaused = false;
    refreshUI();
  }

  function removeArtifactEffect(artifactKey) {
    const game = gameRef.current;
    if (artifactKey === "broom") {
      game.player.speed /= 1.4;
    }
    if (artifactKey === "stormSymbol") {
      game.stormActive = false;
      game.stormTimer = 0;
    }
  }

  function applyArtifact(artifactKey) {
    const game = gameRef.current;

    switch (artifactKey) {
      case "mirror": {
        const familiarLevel = game.spells.familiar || 0;
        const orbitLevel = game.spells.orbitFire || 0;
        const familiarTarget = Math.min(familiarLevel * 2, SPELLS.familiar.max * 2);
        const orbitTarget = Math.min(orbitLevel * 2, SPELLS.orbitFire.max * 2);

        while (game.familiars.length < familiarTarget && familiarLevel > 0) {
          game.familiars.push({
            angle: 0,
            timer: Math.random(),
            x: game.player.x,
            y: game.player.y,
          });
        }

        while (game.orbitBalls.length < orbitTarget && orbitLevel > 0) {
          game.orbitBalls.push({
            angle: 0,
            timer: Math.random() * 5,
            state: "orbit",
            x: game.player.x,
            y: game.player.y,
          });
        }
        break;
      }
      case "broom": {
        game.player.speed *= 1.4;
        break;
      }
      case "repulsionRune": {
        game.artifactTimers.repulsion = 15;
        break;
      }
      case "healingRune": {
        game.artifactTimers.healing = 15;
        break;
      }
      case "stormSymbol": {
        game.artifactTimers.storm = 10;
        break;
      }
      default:
        break;
    }
  }

  function updateRepulsionRune(dt) {
    const game = gameRef.current;
    if (!game.artifacts.includes("repulsionRune")) return;

    if (game.artifactTimers.repulsionActive > 0) {
      game.artifactTimers.repulsionActive -= dt;
    }

    game.artifactTimers.repulsion -= dt;
    if (game.artifactTimers.repulsion > 0) return;

    game.artifactTimers.repulsion = 15;
    game.artifactTimers.repulsionActive = 2.0;
    const radius = 180;

    game.effects.push({
      type: "repulsionRuneActive",
      x: game.player.x,
      y: game.player.y,
      radius,
      timer: 2,
    });

    for (const enemy of game.enemies) {
      if (enemy.dead) continue;
      const d = distance(game.player, enemy);
      if (d >= radius) continue;

      const angle = Math.atan2(enemy.y - game.player.y, enemy.x - game.player.x);
      const force = (radius - d) * 2;
      enemy.x += Math.cos(angle) * force;
      enemy.y += Math.sin(angle) * force;
    }
  }

  function updateHealingRune(dt) {
    const game = gameRef.current;
    if (!game.artifacts.includes("healingRune")) return;

    if (game.artifactTimers.healingActive > 0) {
      game.artifactTimers.healingActive -= dt;
    }

    game.artifactTimers.healing -= dt;
    if (game.artifactTimers.healing > 0) return;

    game.artifactTimers.healing = 15;
    game.artifactTimers.healingActive = 2.0;
    game.player.hp = Math.min(game.player.maxHp, game.player.hp + 35);

    game.effects.push({
      type: "healingRuneActive",
      x: game.player.x,
      y: game.player.y,
      radius: 100,
      timer: 2,
    });
  }

  function updateStorm(dt) {
    const game = gameRef.current;
    if (!game.artifacts.includes("stormSymbol")) return;

    game.artifactTimers.storm -= dt;

    if (game.artifactTimers.storm <= 0) {
      game.artifactTimers.storm = 10;
      game.stormActive = true;
      game.stormTimer = 5;
      game.effects.push({
        type: "stormStart",
        x: game.player.x,
        y: game.player.y,
        timer: 1,
      });
    }

    if (game.stormActive) {
      game.stormTimer -= dt;
      for (const enemy of game.enemies) {
        if (enemy.dead) continue;
        if (distance(game.player, enemy) < 450) {
          enemy.wet = 10;
        }
      }
      if (game.stormTimer <= 0) {
        game.stormActive = false;
      }
    }
  }

  function lightningChain(source) {
    const game = gameRef.current;
    const targets = [...game.enemies]
      .filter((enemy) => !enemy.dead && enemy !== source && enemy.wet > 0)
      .sort((a, b) => distance(source, a) - distance(source, b))
      .slice(0, 5);

    for (const enemy of targets) {
      game.effects.push({
        type: "chainLightning",
        x: enemy.x,
        y: enemy.y,
        fromX: source.x,
        fromY: source.y,
        timer: 0.5,
      });
      killEnemy(enemy, true);
    }
  }

  function updateArtifacts(dt) {
    const game = gameRef.current;
    updateRepulsionRune(dt);
    updateHealingRune(dt);
    updateStorm(dt);

    if (game.damageMultiplierTimer > 0) {
      game.damageMultiplierTimer -= dt;
      if (game.damageMultiplierTimer <= 0) {
        game.damageMultiplierTimer = 0;
        game.player.damageMultiplier = 1;
      }
    }

    if (game.xpMultiplierTimer > 0) {
      game.xpMultiplierTimer -= dt;
      if (game.xpMultiplierTimer <= 0) {
        game.xpMultiplierTimer = 0;
        game.xpMultiplier = 1;
      }
    }
  }

  /* =======================================================
     MOVIMENTO DO JOGADOR
  ======================================================= */

  function updatePlayerMovement(dt) {
    const game = gameRef.current;
    const keys = game.keys;

    let dx = 0;
    let dy = 0;

    if (keys["w"] || keys["W"] || keys["ArrowUp"]) dy -= 1;
    if (keys["s"] || keys["S"] || keys["ArrowDown"]) dy += 1;
    if (keys["a"] || keys["A"] || keys["ArrowLeft"]) dx -= 1;
    if (keys["d"] || keys["D"] || keys["ArrowRight"]) dx += 1;

    if (dx === 0 && dy === 0) return;

    const length = Math.hypot(dx, dy);
    dx /= length;
    dy /= length;

    game.player.x += dx * game.player.speed * dt;
    game.player.y += dy * game.player.speed * dt;

    game.player.x = clamp(game.player.x, 0, WORLD_SIZE);
    game.player.y = clamp(game.player.y, 0, WORLD_SIZE);
  }

  function updateCamera(dt) {
    const game = gameRef.current;
    game.camera.x += (game.player.x - game.camera.x) * 8 * dt;
    game.camera.y += (game.player.y - game.camera.y) * 8 * dt;
  }

  /* =======================================================
     ATAQUES AUTOMÁTICOS COM CONTAGEM REGRESSIVA DE COOLDOWN
  ======================================================= */

  function updateAttackTimers(dt) {
    const game = gameRef.current;

    game.basicTimer -= dt;
    if (game.basicTimer <= 0) {
      fireBasicShot();
      game.basicTimer = 0.65;
    }

    // Atualiza contadores individuais
    for (const key of Object.keys(game.spellTimers)) {
      if (game.spellTimers[key] > 0) {
        game.spellTimers[key] -= dt;
        if (game.spellTimers[key] < 0) game.spellTimers[key] = 0;
      }
    }

    if ((game.spells.fire || 0) > 0 && game.spellTimers.fire <= 0) {
      castFire();
    }
    if ((game.spells.ice || 0) > 0 && game.spellTimers.ice <= 0) {
      castIce();
    }
    if ((game.spells.lightning || 0) > 0 && game.spellTimers.lightning <= 0) {
      castLightning();
    }
    if ((game.spells.lava || 0) > 0 && game.spellTimers.lava <= 0) {
      castLava();
    }
    if ((game.spells.meteor || 0) > 0 && game.spellTimers.meteor <= 0) {
      castMeteor();
    }
    if ((game.spells.vines || 0) > 0 && game.spellTimers.vines <= 0) {
      castVines();
    }
    if ((game.spells.humidity || 0) > 0 && game.spellTimers.humidity <= 0) {
      castHumidity();
    }
  }

  /* =======================================================
     LIMPEZA DE EFEITOS
  ======================================================= */

  function updateEffects(dt) {
    const game = gameRef.current;

    for (const effect of game.effects) {
      effect.timer -= dt;
      if (effect.type === "nuclearShockwave") {
        effect.radius = Math.min(
          effect.maxRadius || 1400,
          (effect.radius || 0) + 1400 * dt
        );
      }
    }

    game.effects = game.effects.filter((effect) => effect.timer > 0);
  }

  /* =======================================================
     LOOP PRINCIPAL DO JOGO (UPDATE)
  ======================================================= */

  function update(dt) {
    const game = gameRef.current;
    if (!game.running || game.paused) return;

    game.time += dt;

    updateWaves();
    updatePlayerMovement(dt);
    updateCamera(dt);
    updateAttackTimers(dt);
    spawnEnemies(dt);
    spawnChest(dt);

    updateEnemies(dt);
    updateProjectiles(dt);
    updateOrbitBalls(dt);
    updateFamiliars(dt);
    updateShadow(dt);
    updateLavaPools(dt);
    updateMeteors(dt);
    updateMistClouds(dt);

    updateSteamClouds(dt);
    updateElectricPlants(dt);
    updateSwampPools(dt);

    updateSouls(dt);
    updateArtifacts(dt);
    checkChests();
    updateEffects(dt);

    /* DERROTA */
    if (game.player.hp <= 0) {
      game.player.hp = 0;
      game.running = false;
      game.paused = true;
      localStorage.removeItem("roguelike_save");
      setSaveDataAvailable(false);
      setGameOver(true);
      refreshUI();
    }
  }

  /* =======================================================
     COORDENADAS DO MUNDO → TELA
  ======================================================= */

  function worldToScreen(x, y, camera, width, height) {
    return {
      x: x - camera.x + width / 2,
      y: y - camera.y + height / 2,
    };
  }

  /* =======================================================
     RENDERIZAÇÃO CANVAS
  ======================================================= */

  function drawBackground(ctx, width, height, camera) {
    drawSpriteOrFallback(
      ctx,
      "forestTile",
      () => {
        ctx.fillStyle = "#080b0d";
        ctx.fillRect(0, 0, width, height);

        const grid = 120;
        const startX = Math.floor(camera.x / grid) * grid - grid * 3;
        const startY = Math.floor(camera.y / grid) * grid - grid * 3;

        for (
          let worldX = startX;
          worldX < camera.x + width + grid * 3;
          worldX += grid
        ) {
          for (
            let worldY = startY;
            worldY < camera.y + height + grid * 3;
            worldY += grid
          ) {
            const seed = Math.abs(
              Math.sin(worldX * 12.9898 + worldY * 78.233)
            );
            if (seed < 0.55) continue;

            const screenP = worldToScreen(worldX, worldY, camera, width, height);

            ctx.fillStyle = "#121313";
            ctx.fillRect(screenP.x - 5, screenP.y - 5, 10, 50);

            ctx.fillStyle = "#111713";
            ctx.beginPath();
            ctx.moveTo(screenP.x, screenP.y - 60);
            ctx.lineTo(screenP.x - 35, screenP.y);
            ctx.lineTo(screenP.x - 18, screenP.y + 5);
            ctx.lineTo(screenP.x - 28, screenP.y + 25);
            ctx.lineTo(screenP.x, screenP.y + 10);
            ctx.lineTo(screenP.x + 28, screenP.y + 25);
            ctx.lineTo(screenP.x + 18, screenP.y + 5);
            ctx.lineTo(screenP.x + 35, screenP.y);
            ctx.closePath();
            ctx.fill();
          }
        }
      },
      width / 2,
      height / 2,
      width,
      height
    );
  }

  function drawMistClouds(ctx, game, camera, width, height) {
    for (const cloud of game.mistClouds) {
      const p = worldToScreen(cloud.x, cloud.y, camera, width, height);

      ctx.save();
      ctx.fillStyle = "rgba(70, 180, 240, 0.22)";
      ctx.shadowBlur = 30;
      ctx.shadowColor = "#40c0ff";

      ctx.beginPath();
      ctx.arc(p.x, p.y, cloud.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "rgba(220, 245, 255, 0.4)";
      for (let i = 0; i < 5; i++) {
        const angle = (game.time * 1.5 + i * 1.2) % (Math.PI * 2);
        const bx = p.x + Math.cos(angle) * (cloud.radius * 0.45);
        const by = p.y + Math.sin(angle) * (cloud.radius * 0.45);
        ctx.beginPath();
        ctx.arc(bx, by, 12, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  function drawSteamClouds(ctx, game, camera, width, height) {
    for (const cloud of game.steamClouds) {
      const p = worldToScreen(cloud.x, cloud.y, camera, width, height);

      ctx.save();
      ctx.fillStyle = "rgba(235, 180, 255, 0.28)";
      ctx.shadowBlur = 25;
      ctx.shadowColor = "#ff99cc";

      ctx.beginPath();
      ctx.arc(p.x, p.y, cloud.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "rgba(255, 240, 250, 0.5)";
      for (let i = 0; i < 4; i++) {
        const angle = (game.time * 2.2 + i * 1.4) % (Math.PI * 2);
        const bx = p.x + Math.cos(angle) * (cloud.radius * 0.5);
        const by = p.y + Math.sin(angle) * (cloud.radius * 0.5);
        ctx.beginPath();
        ctx.arc(bx, by, 8, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  function drawSwampPools(ctx, game, camera, width, height) {
    for (const swamp of game.swampPools) {
      const p = worldToScreen(swamp.x, swamp.y, camera, width, height);

      ctx.save();
      ctx.fillStyle = "rgba(35, 60, 30, 0.6)";
      ctx.shadowBlur = 20;
      ctx.shadowColor = "#3d8544";

      ctx.beginPath();
      ctx.arc(p.x, p.y, swamp.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "#1b4d24";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(p.x, p.y, swamp.radius * 0.8, 0, Math.PI * 1.6);
      ctx.stroke();

      ctx.restore();
    }
  }

  function drawElectricPlants(ctx, game, camera, width, height) {
    for (const plant of game.electricPlants) {
      const p = worldToScreen(plant.x, plant.y, camera, width, height);

      ctx.save();
      ctx.translate(p.x, p.y);

      ctx.shadowBlur = 25;
      ctx.shadowColor = "#9eff30";
      ctx.strokeStyle = "#9eff30";
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      ctx.moveTo(0, 15);
      ctx.lineTo(0, -10);
      ctx.lineTo(8, -20);
      ctx.moveTo(0, -10);
      ctx.lineTo(-8, -20);
      ctx.stroke();

      ctx.fillStyle = "#d4ff6b";
      ctx.beginPath();
      ctx.arc(0, -22, 9, 0, Math.PI * 2);
      ctx.fill();

      const rot = game.time * 8;
      ctx.strokeStyle = "#ffffff";
      ctx.beginPath();
      ctx.moveTo(Math.cos(rot) * 14, -22 + Math.sin(rot) * 14);
      ctx.lineTo(Math.cos(rot + Math.PI) * 14, -22 + Math.sin(rot + Math.PI) * 14);
      ctx.stroke();

      ctx.restore();
    }
  }

  function drawLavaPools(ctx, game, camera, width, height) {
    for (const pool of game.lavaPools) {
      const p = worldToScreen(pool.x, pool.y, camera, width, height);

      ctx.save();
      drawSpriteOrFallback(
        ctx,
        "lavaPool",
        () => {
          ctx.shadowBlur = pool.isCataclysm ? 35 : 25;
          ctx.shadowColor = pool.isCataclysm ? "#ff0000" : "#ff3300";

          ctx.fillStyle = pool.isCataclysm ? "rgba(255, 30, 0, 0.8)" : "rgba(255, 68, 0, 0.65)";
          ctx.beginPath();
          ctx.arc(p.x, p.y, pool.radius, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = pool.isCataclysm ? "#fff2a6" : "#ffcc00";
          for (let i = 0; i < (pool.isCataclysm ? 6 : 4); i++) {
            const angle = (game.time * 2 + i * 1.5) % (Math.PI * 2);
            const bx = p.x + Math.cos(angle) * (pool.radius * 0.5);
            const by = p.y + Math.sin(angle) * (pool.radius * 0.5);
            ctx.beginPath();
            ctx.arc(bx, by, pool.isCataclysm ? 8 : 6, 0, Math.PI * 2);
            ctx.fill();
          }
        },
        p.x,
        p.y,
        pool.radius * 2,
        pool.radius * 2
      );
      ctx.restore();
    }
  }

  function drawPlayerRunes(ctx, game, camera, width, height) {
    const p = worldToScreen(game.player.x, game.player.y, camera, width, height);
    const runeRadius = 80;

    ctx.save();
    ctx.translate(p.x, p.y);

    if (game.artifacts.includes("repulsionRune")) {
      const isActive = game.artifactTimers.repulsionActive > 0;
      ctx.save();
      ctx.shadowBlur = isActive ? 30 : 0;
      ctx.shadowColor = isActive ? "#b86cff" : "transparent";
      ctx.strokeStyle = isActive ? "#b86cff" : "rgba(130, 130, 130, 0.35)";
      ctx.lineWidth = isActive ? 3.5 : 2;

      const rot = game.time * (isActive ? 1.5 : 0.4);
      ctx.rotate(rot);
      ctx.beginPath();
      ctx.arc(0, 0, runeRadius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, -runeRadius * 0.75);
      ctx.lineTo(0, runeRadius * 0.75);
      ctx.moveTo(0, -runeRadius * 0.2);
      ctx.lineTo(-runeRadius * 0.45, -runeRadius * 0.65);
      ctx.moveTo(0, -runeRadius * 0.2);
      ctx.lineTo(runeRadius * 0.45, -runeRadius * 0.65);
      ctx.stroke();
      ctx.restore();
    }

    if (game.artifacts.includes("healingRune")) {
      const isActive = game.artifactTimers.healingActive > 0;
      ctx.save();
      ctx.shadowBlur = isActive ? 30 : 0;
      ctx.shadowColor = isActive ? "#55ff7c" : "transparent";
      ctx.strokeStyle = isActive ? "#55ff7c" : "rgba(130, 130, 130, 0.35)";
      ctx.lineWidth = isActive ? 3.5 : 2;

      const rot = -game.time * (isActive ? 1.2 : 0.3);
      ctx.rotate(rot);
      ctx.beginPath();
      ctx.arc(0, 0, runeRadius * 0.85, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-runeRadius * 0.3, -runeRadius * 0.6);
      ctx.lineTo(-runeRadius * 0.3, runeRadius * 0.6);
      ctx.lineTo(0, -runeRadius * 0.2);
      ctx.lineTo(-runeRadius * 0.3, 0);
      ctx.lineTo(0, runeRadius * 0.4);
      ctx.lineTo(-runeRadius * 0.3, runeRadius * 0.6);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }

  function drawPlayer(ctx, player, camera, width, height, game) {
    const p = worldToScreen(player.x, player.y, camera, width, height);
    const char = CHARACTERS.find((c) => c.id === game.selectedCharacter) || CHARACTERS[0];

    ctx.save();
    ctx.translate(p.x, p.y);

    if (game.playerIsInvincible) {
      ctx.shadowBlur = 30;
      ctx.shadowColor = "#40c0ff";
      ctx.globalAlpha = 0.85;
    }

    drawSpriteOrFallback(
      ctx,
      char.spriteKey || "player",
      () => {
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.beginPath();
        ctx.ellipse(0, 25, 27, 9, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#09080d";
        ctx.beginPath();
        ctx.moveTo(-17, -2);
        ctx.lineTo(-32, 35);
        ctx.quadraticCurveTo(0, 48, 32, 35);
        ctx.lineTo(17, -2);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = char.color || "#40374d";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-14, 3);
        ctx.quadraticCurveTo(0, 12, 14, 3);
        ctx.stroke();

        ctx.fillStyle = "#211a28";
        ctx.beginPath();
        ctx.moveTo(-12, -4);
        ctx.lineTo(-15, 25);
        ctx.lineTo(15, 25);
        ctx.lineTo(12, -4);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "#d5b5a4";
        ctx.beginPath();
        ctx.arc(0, -15, 10, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#0a080e";
        ctx.beginPath();
        ctx.moveTo(-20, -21);
        ctx.lineTo(20, -21);
        ctx.lineTo(5, -26);
        ctx.lineTo(2, -43);
        ctx.lineTo(-3, -43);
        ctx.lineTo(-7, -26);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = game.playerIsInvincible ? "#60d0ff" : char.color || "#c77dff";
        ctx.fillRect(-5, -16, 3, 2);
        ctx.fillRect(2, -16, 3, 2);

        ctx.strokeStyle = "#59402d";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(18, 25);
        ctx.lineTo(28, -25);
        ctx.stroke();

        ctx.shadowBlur = 15;
        ctx.shadowColor = char.color || "#a86cff";
        ctx.fillStyle = char.color || "#a86cff";
        ctx.beginPath();
        ctx.arc(28, -27, 4, 0, Math.PI * 2);
        ctx.fill();
      },
      0,
      0,
      40,
      60
    );

    ctx.restore();
  }

  function drawEnemy(ctx, enemy, camera, width, height) {
    const p = worldToScreen(enemy.x, enemy.y, camera, width, height);

    ctx.save();
    ctx.translate(p.x, p.y);

    const size = enemy.size;
    const scale = enemy.isBoss ? 1.3 : 1;
    ctx.scale(scale, scale);

    if (enemy.isBoss) {
      ctx.shadowBlur = 25;
      ctx.shadowColor = enemy.color || "#9d3cff";
    }

    drawSpriteOrFallback(
      ctx,
      enemy.spriteKey || (enemy.isBoss ? "boss" : enemy.typeKey || "darkWitch"),
      () => {
        ctx.fillStyle = enemy.color;
        ctx.beginPath();
        ctx.moveTo(-size / 2, 0);
        ctx.lineTo(-size, size * 1.5);
        ctx.quadraticCurveTo(0, size * 2, size, size * 1.5);
        ctx.lineTo(size / 2, 0);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "#6d5960";
        ctx.beginPath();
        ctx.arc(0, -size / 2, size / 2.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#09070b";
        ctx.beginPath();
        ctx.moveTo(-size, -size / 2);
        ctx.lineTo(size, -size / 2);
        ctx.lineTo(0, -size * 2);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = enemy.wet > 0 ? "#62d9ff" : "#d85cff";
        ctx.fillRect(-size / 4, -size / 2, 3, 2);
        ctx.fillRect(size / 8, -size / 2, 3, 2);
      },
      0,
      0,
      size * 2,
      size * 2
    );

    ctx.fillStyle = "#30151b";
    ctx.fillRect(-size, -size * 2.3, size * 2, 4);

    ctx.fillStyle = enemy.isBoss ? "#d84cff" : "#b63c58";
    ctx.fillRect(
      -size,
      -size * 2.3,
      size * 2 * clamp(enemy.hp / enemy.maxHp, 0, 1),
      4
    );

    if (enemy.frozen > 0) {
      ctx.strokeStyle = "#70dfff";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, size * 1.4, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (enemy.wet > 0) {
      ctx.font = "14px serif";
      ctx.textAlign = "center";
      ctx.fillText("💧", 0, -size * 2.6);
    }

    if (enemy.rootedTimer > 0) {
      ctx.strokeStyle = "#2d6a4f";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, size * 0.8, size * 0.9, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawMeteors(ctx, game, camera, width, height) {
    for (const m of game.meteors) {
      const targetP = worldToScreen(m.x, m.y, camera, width, height);

      ctx.save();
      ctx.strokeStyle = "rgba(255, 60, 0, 0.85)";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.arc(targetP.x, targetP.y, m.radius, 0, Math.PI * 2);
      ctx.stroke();

      const currP = worldToScreen(m.currentX, m.currentY, camera, width, height);
      ctx.shadowBlur = 20;
      ctx.shadowColor = "#ff5500";
      ctx.fillStyle = "#ffaa00";

      ctx.beginPath();
      ctx.arc(currP.x, currP.y, 16, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  function drawProjectiles(ctx, game, camera, width, height) {
    for (const projectile of game.projectiles) {
      const p = worldToScreen(projectile.x, projectile.y, camera, width, height);

      ctx.save();
      ctx.shadowBlur = 18;
      ctx.shadowColor = projectile.color;
      ctx.fillStyle = projectile.color;

      ctx.beginPath();
      ctx.arc(p.x, p.y, projectile.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  function drawOrbits(ctx, game, camera, width, height) {
    for (const ball of game.orbitBalls) {
      const p = worldToScreen(ball.x, ball.y, camera, width, height);

      ctx.save();
      ctx.shadowBlur = 25;
      ctx.shadowColor = "#ff6b18";
      ctx.fillStyle = "#ff7b22";

      ctx.beginPath();
      ctx.arc(p.x, p.y, 12, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#ffd166";
      ctx.beginPath();
      ctx.arc(p.x - 2, p.y - 2, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  function drawFamiliars(ctx, game, camera, width, height) {
    const isAbismo = game.fusions.abismoVivo;
    for (const familiar of game.familiars) {
      const p = worldToScreen(familiar.x, familiar.y, camera, width, height);

      ctx.save();
      ctx.shadowBlur = 20;
      ctx.shadowColor = isAbismo ? "#800080" : "#b978ff";
      ctx.fillStyle = isAbismo ? "#4b0082" : "#d9b4ff";

      ctx.beginPath();
      ctx.moveTo(p.x, p.y - 14);
      ctx.quadraticCurveTo(p.x - 15, p.y - 2, p.x - 9, p.y + 12);
      ctx.quadraticCurveTo(p.x, p.y + 6, p.x + 9, p.y + 12);
      ctx.quadraticCurveTo(p.x + 15, p.y - 2, p.x, p.y - 14);
      ctx.fill();

      ctx.fillStyle = "#38214d";
      ctx.beginPath();
      ctx.arc(p.x, p.y - 2, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  function drawChests(ctx, game, camera, width, height) {
    const chestColors = ["#66d9ff", "#ff623f", "#d76cff", "#68e08a", "#ffcf4d"];

    for (const chest of game.chests) {
      if (chest.opened) continue;
      const p = worldToScreen(chest.x, chest.y, camera, width, height);

      ctx.save();
      const color = chestColors[chest.type] || "#ffcf4d";
      ctx.shadowBlur = 20;
      ctx.shadowColor = color;

      ctx.fillStyle = "#56331e";
      ctx.fillRect(p.x - 18, p.y - 12, 36, 25);

      ctx.fillStyle = color;
      ctx.fillRect(p.x - 18, p.y - 12, 36, 6);
      ctx.fillRect(p.x - 3, p.y - 2, 6, 9);

      ctx.restore();
    }
  }

  function drawSouls(ctx, game, camera, width, height) {
    const soulColors = {
      minor: "#9c9ca8",
      dark: "#7f67b8",
      cursed: "#55a6c9",
      spectral: "#df8cff",
      boss: "#ffcf5c",
    };

    for (const soul of game.souls) {
      const p = worldToScreen(soul.x, soul.y, camera, width, height);

      ctx.save();
      const color = soulColors[soul.type] || "#9c9ca8";
      ctx.shadowBlur = 15;
      ctx.shadowColor = color;
      ctx.fillStyle = color;

      ctx.beginPath();
      ctx.arc(p.x, p.y, soul.type === "boss" ? 9 : 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(p.x - 4, p.y + 4);
      ctx.lineTo(p.x, p.y + 12);
      ctx.lineTo(p.x + 4, p.y + 4);
      ctx.fill();

      ctx.restore();
    }
  }

  function drawEffects(ctx, game, camera, width, height) {
    for (const effect of game.effects) {
      const p = worldToScreen(effect.x, effect.y, camera, width, height);

      ctx.save();

      if (effect.type === "meteorExplosion") {
        ctx.shadowBlur = 30;
        ctx.shadowColor = "#ff3300";
        ctx.fillStyle = "rgba(255, 102, 0, 0.6)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, effect.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      if (effect.type === "lightning") {
        ctx.shadowBlur = 25;
        ctx.shadowColor = "#a9eaff";
        ctx.strokeStyle = "#a9eaff";
        ctx.lineWidth = 5;

        ctx.beginPath();
        ctx.moveTo(p.x, p.y - 110);
        ctx.lineTo(p.x - 18, p.y - 50);
        ctx.lineTo(p.x + 12, p.y - 20);
        ctx.lineTo(p.x - 8, p.y + 30);
        ctx.stroke();
      }

      if (effect.type === "chainLightning") {
        ctx.strokeStyle = "#8be9ff";
        ctx.shadowBlur = 20;
        ctx.shadowColor = "#8be9ff";
        ctx.lineWidth = 4;

        const source = worldToScreen(
          effect.fromX,
          effect.fromY,
          camera,
          width,
          height
        );

        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }

      if (effect.type === "ice") {
        ctx.strokeStyle = "#6be5ff";
        ctx.shadowBlur = 15;
        ctx.shadowColor = "#6be5ff";
        ctx.lineWidth = 4;

        ctx.beginPath();
        ctx.arc(p.x, p.y, 28, 0, Math.PI * 2);
        ctx.stroke();
      }

      if (effect.type === "shadowAura") {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(effect.rotation || 0);

        ctx.strokeStyle = "rgba(130,70,190,0.65)";
        ctx.shadowBlur = 20;
        ctx.shadowColor = "#8d48d6";
        ctx.lineWidth = 8;

        ctx.beginPath();
        ctx.arc(0, 0, effect.radius, 0.2, Math.PI * 1.4);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, 0, effect.radius, Math.PI, Math.PI * 1.8);
        ctx.stroke();

        ctx.restore();
      }

      if (effect.type === "nuclearShockwave") {
        ctx.strokeStyle = "#fff2a6";
        ctx.shadowBlur = 40;
        ctx.shadowColor = "#ffb52e";
        ctx.lineWidth = 8;

        ctx.beginPath();
        ctx.arc(p.x, p.y, effect.radius || 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      if (effect.type === "nuclearFlash") {
        const alpha = clamp(effect.timer / 1.2, 0, 1);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.85})`;
        ctx.fillRect(0, 0, width, height);
      }

      if (effect.type === "death") {
        ctx.strokeStyle = "#d7a8ff";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 20, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  function drawStorm(ctx, game, width, height) {
    if (!game.stormActive) return;

    ctx.save();
    ctx.fillStyle = "rgba(60,90,130,0.08)";
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = "rgba(150,200,255,0.45)";
    ctx.lineWidth = 1;

    const offset = performance.now() * 0.4;
    for (let i = 0; i < 140; i++) {
      const x = (i * 71) % width;
      const y = (i * 113 + offset) % height;

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - 5, y + 20);
      ctx.stroke();
    }

    ctx.restore();
  }

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    const game = gameRef.current;

    ctx.clearRect(0, 0, width, height);

    drawBackground(ctx, width, height, game.camera);
    drawMistClouds(ctx, game, game.camera, width, height);
    drawSwampPools(ctx, game, game.camera, width, height);
    drawSteamClouds(ctx, game, game.camera, width, height);
    drawLavaPools(ctx, game, game.camera, width, height);
    drawPlayerRunes(ctx, game, game.camera, width, height);
    drawStorm(ctx, game, width, height);
    drawElectricPlants(ctx, game, game.camera, width, height);

    drawChests(ctx, game, game.camera, width, height);
    drawSouls(ctx, game, game.camera, width, height);
    drawMeteors(ctx, game, game.camera, width, height);

    for (const enemy of game.enemies) {
      drawEnemy(ctx, enemy, game.camera, width, height);
    }

    drawOrbits(ctx, game, game.camera, width, height);
    drawFamiliars(ctx, game, game.camera, width, height);
    drawProjectiles(ctx, game, game.camera, width, height);
    drawPlayer(ctx, game.player, game.camera, width, height, game);
    drawEffects(ctx, game, game.camera, width, height);
  }

  /* =======================================================
     HOOK PRINCIPAL - LOOP DE ANIMAÇÃO E ATALHOS
  ======================================================= */

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    resize();
    window.addEventListener("resize", resize);

    const handleKeyDown = (event) => {
      if (event.key === "Escape" || event.key === "p" || event.key === "P") {
        if (screen === "game") {
          togglePause();
          return;
        }
      }
      gameRef.current.keys[event.key] = true;
    };

    const handleKeyUp = (event) => {
      gameRef.current.keys[event.key] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    let last = performance.now();
    let animationFrame;

    function loop(now) {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      if (screen === "game") {
        update(dt);
        draw();
      }

      animationFrame = requestAnimationFrame(loop);
    }

    animationFrame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  /* COMPRA DE PERSONAGEM */
  function buyCharacter(char) {
    if (unlockedChars.includes(char.id)) return;
    if (soulsBank < char.cost) return;

    const newBank = soulsBank - char.cost;
    const newUnlocked = [...unlockedChars, char.id];

    setSoulsBank(newBank);
    setUnlockedChars(newUnlocked);
    localStorage.setItem("roguelike_bank", newBank.toString());
    localStorage.setItem("roguelike_unlocked_chars", JSON.stringify(newUnlocked));
  }

  /* COMPRA NA LOJA */
  function buyShopUpgrade(item) {
    const currentLevel = permanentStats[item.id] || 0;
    if (currentLevel >= item.maxLevel) return;
    if (soulsBank < item.cost) return;

    const newBank = soulsBank - item.cost;
    const newStats = {
      ...permanentStats,
      [item.id]: currentLevel + 1,
    };

    setSoulsBank(newBank);
    setPermanentStats(newStats);
    localStorage.setItem("roguelike_bank", newBank.toString());
    localStorage.setItem("roguelike_upgrades", JSON.stringify(newStats));
  }

  const game = gameRef.current;
  const currentChar = CHARACTERS.find((c) => c.id === selectedCharacter) || CHARACTERS[0];

  return (
    <div className="game">
      <canvas ref={canvasRef} />

      {/* =========================================================
          TELA 1: MENU PRINCIPAL
      ========================================================= */}
      {screen === "menu" && (
        <div className="menu-overlay">
          <div className="menu-container">
            <h1 className="game-logo-title">ROGUELIKE REACT</h1>
            <div className="game-subtitle">A NOITE DOS BRUXOS</div>

            <div className="menu-character-preview">
              <div className="preview-avatar">{currentChar.icon}</div>
              <div className="preview-info">
                <div className="preview-name">{currentChar.name}, {currentChar.title}</div>
                <div className="preview-spell">✦ Magia Inicial Lv.2: <b>{SPELLS[currentChar.spellKey]?.name}</b> ({currentChar.icon})</div>
                <div className="preview-desc">{currentChar.description}</div>
              </div>
            </div>

            <div className="menu-buttons-list">
              <button
                className="btn-menu-primary"
                onClick={() => startNewGame(selectedCharacter, selectedMap)}
              >
                ⚔️ JOGAR
              </button>

              {saveDataAvailable && (
                <button
                  className="btn-menu-continue"
                  onClick={loadGameFromStorage}
                >
                  📜 CONTINUAR PARTIDA SALVA
                </button>
              )}

              <button
                className="btn-menu-secondary"
                onClick={() => setScreen("characters")}
              >
                🧙‍♂️ PERSONAGENS ({unlockedChars.length}/{CHARACTERS.length})
              </button>

              <button
                className="btn-menu-secondary"
                onClick={() => setScreen("spells")}
              >
                📖 MAGIAS (10)
              </button>

              <button
                className="btn-menu-secondary"
                onClick={() => setScreen("maps")}
              >
                🗺️ MAPAS
              </button>

              <button
                className="btn-menu-secondary"
                onClick={() => setScreen("shop")}
              >
                🏛️ LOJA ARCANA ({soulsBank} 🪙)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TELA 2: SELEÇÃO E DESBLOQUEIO DE PERSONAGENS
      ========================================================= */}
      {screen === "characters" && (
        <div className="screen-overlay">
          <div className="screen-header">
            <h1 className="screen-title">✦ ESCOLHA SEU PERSONAGEM ✦</h1>
            <p className="screen-subtitle">
              Seu herói inicia com sua magia principal no <b>Lv. 2</b> e Chama no <b>Lv. 1</b>. As demais começam no <b>Lv. 0</b>.
            </p>
          </div>

          <div className="shop-balance-bar">
            🪙 Saldo Acumulado: <b>{soulsBank} Almas</b>
          </div>

          <div className="screen-content-wrapper">
            <div className="characters-grid">
              {CHARACTERS.map((char) => {
                const isUnlocked = unlockedChars.includes(char.id);
                const isSelected = selectedCharacter === char.id;
                const canBuy = soulsBank >= char.cost;

                return (
                  <div
                    key={char.id}
                    className={`character-card ${isSelected ? "selected" : ""} ${
                      !isUnlocked ? "locked" : ""
                    }`}
                    onClick={() => {
                      if (isUnlocked) setSelectedCharacter(char.id);
                    }}
                  >
                    <div className="char-icon">{char.icon}</div>
                    <div className="char-name">{char.name}</div>
                    <div className="char-title">{char.title}</div>
                    <div className="char-spell-badge">
                      Principal: <b>{SPELLS[char.spellKey]?.name} (Nv.2)</b>
                    </div>
                    <div className="char-desc">{char.description}</div>

                    {isUnlocked ? (
                      <button className="char-select-btn">
                        {isSelected ? "✦ SELECIONADO ✦" : "SELECIONAR"}
                      </button>
                    ) : (
                      <div style={{ width: "100%" }}>
                        <div className="char-price-badge">
                          <span>🔒 Preço:</span> <b>{char.cost} 🪙</b>
                        </div>
                        <button
                          className="char-buy-action-btn"
                          disabled={!canBuy}
                          onClick={(e) => {
                            e.stopPropagation();
                            buyCharacter(char);
                          }}
                        >
                          {canBuy ? `DESBLOQUEAR (${char.cost} 🪙)` : `FALTAM ALMAS (${char.cost} 🪙)`}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <button className="btn-back-menu" onClick={() => setScreen("menu")}>
            ⬅ VOLTAR AO MENU
          </button>
        </div>
      )}

      {/* =========================================================
          TELA 3: ENCICLOPÉDIA DE MAGIAS (10 MAGIAS)
      ========================================================= */}
      {screen === "spells" && (
        <div className="screen-overlay">
          <div className="screen-header">
            <h1 className="screen-title">✦ COMPÊNDIO DE MAGIAS ✦</h1>
            <p className="screen-subtitle">
              Conheça as 10 artes arcanas ancestrais e seus tempos de recarga.
            </p>
          </div>

          <div className="screen-content-wrapper">
            <div className="spells-grid">
              {Object.values(SPELLS).map((spell) => (
                <div key={spell.id} className="spell-encyclopedia-card">
                  <div className="spell-header-row">
                    <span className="spell-big-icon">{spell.icon}</span>
                    <div className="spell-main-info">
                      <div className="spell-main-name">{spell.name}</div>
                      <div className="spell-type-tag">{spell.type}</div>
                    </div>
                  </div>
                  <div className="spell-card-body">{spell.description}</div>
                  <div className="spell-details-box">
                    <b>Efeito em Combate:</b> {spell.details}
                    {spell.baseCooldown > 0 && (
                      <div style={{ marginTop: "4px", color: "#ffd54f" }}>
                        ⏱️ Tempo Base de Recarga: <b>{spell.baseCooldown}s</b>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button className="btn-back-menu" onClick={() => setScreen("menu")}>
            ⬅ VOLTAR AO MENU
          </button>
        </div>
      )}

      {/* =========================================================
          TELA 4: MAPAS
      ========================================================= */}
      {screen === "maps" && (
        <div className="screen-overlay">
          <div className="screen-header">
            <h1 className="screen-title">✦ MAPAS & BIOMAS ✦</h1>
            <p className="screen-subtitle">
              Selecione o domínio para enfrentar a horda de bruxos sombrios.
            </p>
          </div>

          <div className="screen-content-wrapper">
            <div className="maps-grid">
              {MAPS.map((map) => {
                const isSelected = selectedMap === map.id;
                return (
                  <div
                    key={map.id}
                    className={`map-card ${isSelected ? "selected" : ""} ${
                      !map.unlocked ? "locked" : ""
                    }`}
                    onClick={() => {
                      if (map.unlocked) setSelectedMap(map.id);
                    }}
                  >
                    <div className="map-icon">{map.icon}</div>
                    <div className="map-name">{map.name}</div>
                    <div className="map-desc">{map.description}</div>
                    {map.unlocked ? (
                      <span className="map-badge-unlocked">✦ DESBLOQUEADO ✦</span>
                    ) : (
                      <span className="map-badge-locked">🔒 {map.lockText}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <button className="btn-back-menu" onClick={() => setScreen("menu")}>
            ⬅ VOLTAR AO MENU
          </button>
        </div>
      )}

      {/* =========================================================
          TELA 5: LOJA ARCANA
      ========================================================= */}
      {screen === "shop" && (
        <div className="screen-overlay">
          <div className="screen-header">
            <h1 className="screen-title">✦ LOJA ARCANA ✦</h1>
            <p className="screen-subtitle">
              Adquira aprimoramentos permanentes para todos os seus heróis.
            </p>
          </div>

          <div className="shop-balance-bar">
            🪙 Saldo Acumulado: <b>{soulsBank} Almas / Moedas</b>
          </div>

          <div className="screen-content-wrapper">
            <div className="shop-grid">
              {SHOP_ITEMS.map((item) => {
                const currentLv = permanentStats[item.id] || 0;
                const isMax = currentLv >= item.maxLevel;
                const canBuy = soulsBank >= item.cost && !isMax;

                return (
                  <div key={item.id} className="shop-card">
                    <div className="shop-item-header">
                      <span className="shop-item-icon">{item.icon}</span>
                      <div className="shop-item-name">{item.name}</div>
                    </div>
                    <div className="shop-item-desc">{item.description}</div>
                    <div className="shop-item-level">
                      Nível: <b>{currentLv}/{item.maxLevel}</b>
                    </div>
                    <button
                      className="shop-buy-btn"
                      disabled={!canBuy}
                      onClick={() => buyShopUpgrade(item)}
                    >
                      {isMax ? "MÁXIMO ALCANÇADO" : `UPGRADE (${item.cost} 🪙)`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <button className="btn-back-menu" onClick={() => setScreen("menu")}>
            ⬅ VOLTAR AO MENU
          </button>
        </div>
      )}

      {/* =========================================================
          TELA 6: JOGO EM ANDAMENTO (HUD & GAMEPLAY)
      ========================================================= */}
      {screen === "game" && (
        <>
          <button className="pause-btn-hud" onClick={togglePause}>
            ⏸ PAUSA (Esc/P)
          </button>

          <div className="hud">
            <div className="top-left">
              <div className="level">
                LVL {game.player.level}
                {game.playerIsInvincible && (
                  <span className="invincible-badge">🛡️ INVENCÍVEL</span>
                )}
              </div>
              <div className="xp-bar">
                <div
                  className="xp-fill"
                  style={{
                    width: `${Math.min(
                      100,
                      (game.player.xp / game.player.xpNeeded) * 100
                    )}%`,
                  }}
                />
              </div>
              <div className="xp-text">
                {Math.floor(game.player.xp)} / {game.player.xpNeeded} XP
              </div>
            </div>

            <div className="hp-container">
              <div className="hp-label">VIDA</div>
              <div className="hp-bar">
                <div
                  className="hp-fill"
                  style={{
                    width: `${(game.player.hp / game.player.maxHp) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className="time">{Math.floor(game.time)}s</div>
            <div className="wave">WAVE {game.wave}</div>

            <div className="controls">
              <b>WASD</b> / <b>SETAS</b> para mover
              <br />
              As magias atacam automaticamente
            </div>

            {/* LISTA DE MAGIAS NO HUD COM COOLDOWN ATIVO */}
            <div className="spell-list">
              {Object.entries(game.spells)
                .filter(([, level]) => level > 0)
                .map(([key, level]) => {
                  const spell = SPELLS[key];
                  const timer = game.spellTimers[key] || 0;
                  const isReady = timer <= 0;

                  return (
                    <div className="spell-mini" key={key}>
                      <span>{spell?.icon}</span>
                      <span>{spell?.name}</span>
                      <b>{level}/5</b>
                      {spell?.baseCooldown > 0 && (
                        <span className={`spell-cd-indicator ${isReady ? "spell-cd-ready" : ""}`}>
                          {isReady ? "PRONTO" : `${timer.toFixed(1)}s`}
                        </span>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>

          {/* 3 SLOTS FIXOS DE ARTEFATOS NO HUD */}
          <div className="artifact-slots-hud">
            <div className="artifact-slots-title">✦ ARTEFATOS (SLOTS 3) ✦</div>
            <div className="artifact-slots-row">
              {[0, 1, 2].map((slotIdx) => {
                const artifactKey = game.artifacts[slotIdx];
                if (!artifactKey) {
                  return (
                    <div key={slotIdx} className="artifact-slot-card">
                      <div className="artifact-slot-empty">[ VAZIO ]</div>
                    </div>
                  );
                }

                const art = ARTIFACTS[artifactKey];
                let cdText = "PASSIVO";
                let isReady = false;

                if (art.hasCooldown) {
                  let rem = 0;
                  if (artifactKey === "repulsionRune") rem = game.artifactTimers.repulsion;
                  if (artifactKey === "healingRune") rem = game.artifactTimers.healing;
                  if (artifactKey === "stormSymbol") rem = game.artifactTimers.storm;

                  if (rem <= 0) {
                    cdText = "PRONTO!";
                    isReady = true;
                  } else {
                    cdText = `${rem.toFixed(1)}s`;
                  }
                }

                return (
                  <div
                    key={slotIdx}
                    className={`artifact-slot-card filled ${isReady ? "ready" : ""}`}
                  >
                    <div className="artifact-slot-icon">{art.icon}</div>
                    <div className="artifact-slot-name">{art.name}</div>
                    <div
                      className={`artifact-slot-cd ${
                        !art.hasCooldown
                          ? "passive-badge"
                          : isReady
                          ? "ready-badge"
                          : ""
                      }`}
                    >
                      {cdText}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* MODAL DE PAUSA */}
          {isPausedUI && (
            <div className="pause-overlay">
              <div className="pause-box">
                <h2 className="pause-title">⏸ JOGO PAUSADO</h2>
                <div className="pause-stats-grid">
                  <div className="pause-stat-item">
                    Personagem: <b>{currentChar.name} ({currentChar.icon})</b>
                  </div>
                  <div className="pause-stat-item">
                    Nível Atual: <b>{game.player.level}</b>
                  </div>
                  <div className="pause-stat-item">
                    Tempo: <b>{Math.floor(game.time)}s</b>
                  </div>
                  <div className="pause-stat-item">
                    Wave: <b>{game.wave}</b>
                  </div>
                  <div className="pause-stat-item">
                    Inimigos Derrotados: <b>{game.kills}</b>
                  </div>
                  <div className="pause-stat-item">
                    Artefatos Equipados: <b>{game.artifacts.length}/3</b>
                  </div>
                </div>

                <div className="pause-buttons-col">
                  <button className="btn-pause-action btn-resume" onClick={togglePause}>
                    ▶️ CONTINUAR PARTIDA
                  </button>
                  <button className="btn-pause-action btn-save-quit" onClick={saveGameToStorage}>
                    💾 SALVAR E SAIR PARA O MENU
                  </button>
                  <button
                    className="btn-pause-action btn-restart"
                    onClick={() => startNewGame(selectedCharacter, selectedMap)}
                  >
                    🔄 REINICIAR PARTIDA
                  </button>
                  <button
                    className="btn-pause-action btn-menu-exit"
                    onClick={() => {
                      game.paused = true;
                      setIsPausedUI(false);
                      setScreen("menu");
                    }}
                  >
                    🚪 SAIR PARA O MENU (SEM SALVAR)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MODAL DO GRIMÓRIO (LEVEL UP) */}
          {levelUpOptions.length > 0 && (
            <div className="level-overlay">
              <div className="spellbook">
                <div className="book-page left-page">
                  <div className="book-title">✦ GRIMÓRIO ✦</div>
                  <p className="book-subtitle">Escolha uma magia para aprender ou aprimorar</p>
                  <div className="choices">
                    {levelUpOptions.map((spellKey) => {
                      const spell = SPELLS[spellKey];
                      const currentLv = game.spells[spellKey] || 0;
                      const isUnlock = currentLv === 0;

                      return (
                        <button
                          className="spell-choice"
                          key={spellKey}
                          onClick={() => chooseSpell(spellKey)}
                        >
                          <span className="choice-icon">{spell.icon}</span>
                          <span className="choice-name">{spell.name}</span>
                          <span className="choice-level">
                            {isUnlock ? "✨ DESBLOQUEAR (Nv. 1/5)" : `Nv. ${currentLv + 1}/${spell.max}`}
                          </span>
                          <span className="choice-description">
                            {spell.description}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* PÁGINA DIREITA: AS 5 FUSÕES SUPREMAS (SEM NÍVEL) */}
                <div className="book-page right-page">
                  <div className="book-title">✧ FUSÕES ✧</div>
                  <p className="book-subtitle">Combinações Desbloqueáveis</p>
                  {COMBINATIONS.map((combo) => {
                    const isAMax = (game.spells[combo.keyA] || 0) >= 5;
                    const isBMax = (game.spells[combo.keyB] || 0) >= 5;
                    const isUnlocked = isAMax && isBMax;

                    return (
                      <div
                        className={`combination ${
                          isUnlocked ? "unlocked fusion-unlocked-card" : ""
                        }`}
                        key={combo.id}
                      >
                        <div className="combo-icon">{combo.icon}</div>
                        <div>
                          <strong>
                            {combo.name}{" "}
                            {isUnlocked ? (
                              <span className="fusion-active-badge">✨ ATIVA</span>
                            ) : (
                              "🔒"
                            )}
                          </strong>
                          <div className="combo-spells">
                            <span className={isAMax ? "spell-maxed-white" : ""}>
                              {combo.a} ({game.spells[combo.keyA] || 0}/5)
                            </span>{" "}
                            +{" "}
                            <span className={isBMax ? "spell-maxed-white" : ""}>
                              {combo.b} ({game.spells[combo.keyB] || 0}/5)
                            </span>
                          </div>
                          <div className="combo-requirement">
                            {combo.description}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* RECOMPENSA DE ARTEFATO DO BOSS */}
          {artifactChoices.length > 0 && (
            <div className="level-overlay">
              <div className="artifact-book">
                <div className="artifact-title">👑 RECOMPENSA DO BOSS 👑</div>
                <div className="artifact-subtitle">
                  O Guardião Ancestral foi derrotado. Escolha um artefato lendário para equipar.
                </div>

                <div className="artifact-grid">
                  {artifactChoices.map((artifactKey) => {
                    const artifact = ARTIFACTS[artifactKey];
                    return (
                      <button
                        key={artifactKey}
                        className="artifact-card"
                        onClick={() => chooseArtifact(artifactKey)}
                      >
                        <div className="artifact-icon">{artifact.icon}</div>
                        <div className="artifact-name">{artifact.name}</div>
                        <div className="artifact-description">
                          {artifact.description}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="boss-reward">✦ +1 NÍVEL CONCEDIDO ✦</div>
              </div>
            </div>
          )}

          {/* MODAL DE SUBSTITUIÇÃO DE ARTEFATO (SLOTS 3/3 CHEIOS) */}
          {isReplacingArtifact && incomingArtifact && (
            <div className="replace-modal-overlay">
              <div className="replace-modal-box">
                <h2 className="replace-title">🔄 SLOTS CHEIOS (3/3)</h2>
                <div className="replace-subtitle">
                  Escolha qual dos artefatos abaixo você deseja descartar para equipar o novo:
                </div>

                <div className="replace-new-incoming">
                  <span style={{ fontSize: "28px" }}>{ARTIFACTS[incomingArtifact]?.icon}</span>
                  <div>
                    <b>Novo Artefato: {ARTIFACTS[incomingArtifact]?.name}</b>
                    <div style={{ fontSize: "12px", color: "#ddd" }}>
                      {ARTIFACTS[incomingArtifact]?.description}
                    </div>
                  </div>
                </div>

                <div className="replace-slots-grid">
                  {game.artifacts.map((key, idx) => {
                    const art = ARTIFACTS[key];
                    return (
                      <div
                        key={idx}
                        className="replace-equipped-card"
                        onClick={() => replaceEquippedArtifact(idx)}
                      >
                        <div style={{ fontSize: "24px" }}>{art.icon}</div>
                        <div style={{ fontWeight: "bold", fontSize: "13px", color: "#ffd54f" }}>
                          {art.name}
                        </div>
                        <div style={{ fontSize: "11px", color: "#aaa", margin: "4px 0" }}>
                          {art.description}
                        </div>
                        <button className="btn-replace-slot">
                          SUBSTITUIR ESTE (SLOT {idx + 1})
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* GAME OVER */}
          {gameOver && (
            <div className="game-over">
              <div className="game-over-box">
                <h1>☠ FIM DA NOITE ☠</h1>
                <p>
                  Você sobreviveu por <b>{Math.floor(game.time)}</b> segundos.
                </p>
                <p>
                  Nível alcançado: <b>{game.player.level}</b> | Inimigos derrotados: <b>{game.kills}</b>
                </p>
                <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                  <button onClick={() => startNewGame(selectedCharacter, selectedMap)}>
                    Tentar novamente
                  </button>
                  <button onClick={() => setScreen("menu")}>Menu Inicial</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
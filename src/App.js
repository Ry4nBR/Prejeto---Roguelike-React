import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import { drawSpriteOrFallback } from "./assets/sprites";

/* =========================================================
   CONFIGURAÇÕES GERAIS
========================================================= */

const WORLD_SIZE = 100000;
const WAVE_DURATION = 30;
const BOSS_EVERY_WAVES = 5;

const PLAYER_START_X = WORLD_SIZE / 2;
const PLAYER_START_Y = WORLD_SIZE / 2;

const INITIAL_XP_NEEDED = 60;

/* =========================================================
   MAGIAS
========================================================= */

const SPELLS = {
  fire: {
    name: "Chama",
    icon: "🔥",
    description:
      "Dispara projéteis de fogo. A cada nível aumenta a quantidade de tiros.",
    max: 5,
  },
  ice: {
    name: "Gelo",
    icon: "❄️",
    description: "Dispara raios congelantes. A quantidade aumenta até 5.",
    max: 5,
  },
  lightning: {
    name: "Raio",
    icon: "⚡",
    description: "Invoca raios que eliminam instantaneamente um inimigo.",
    max: 5,
  },
  shadow: {
    name: "Vórtice Sombrio",
    icon: "🌑",
    description:
      "Cria um vórtice ao redor do personagem que desacelera e causa dano por segundo.",
    max: 8,
  },
  orbitFire: {
    name: "Orbes de Fogo",
    icon: "🔴",
    description:
      "Cria bolas de fogo que orbitam o personagem e depois atacam.",
    max: 5,
  },
  familiar: {
    name: "Familiar",
    icon: "👻",
    description:
      "Invoca um auxiliar mágico que flutua próximo ao bruxo e dispara contra inimigos.",
    max: 5,
  },
};

/* =========================================================
   ARTEFATOS
========================================================= */

const ARTIFACTS = {
  mirror: {
    name: "Espelho Arcano",
    icon: "🪞",
    description: "Duplica a quantidade atual de Familiares e Orbes de Fogo.",
  },
  broom: {
    name: "Vassoura Encantada",
    icon: "🧹",
    description: "Aumenta a velocidade de movimento do personagem em 40%.",
  },
  piercingFlame: {
    name: "Chama Perfurante",
    icon: "🔥",
    description: "Os projéteis de Chama atravessam vários inimigos.",
  },
  ricochet: {
    name: "Olho do Ricochete",
    icon: "🔮",
    description: "Projéteis podem ricochetear entre até 5 inimigos.",
  },
  repulsionRune: {
    name: "Símbolo da Repulsão",
    icon: "✦",
    description:
      "A cada 15 segundos cria uma grande runa que empurra os inimigos.",
  },
  healingRune: {
    name: "Símbolo da Vida",
    icon: "✚",
    description: "A cada 15 segundos cria uma runa que restaura parte da vida.",
  },
  stormSymbol: {
    name: "Símbolo da Tempestade",
    icon: "☔",
    description:
      "Invoca uma chuva. Inimigos molhados sofrem correntes elétricas.",
  },
};

/* =========================================================
   COMBINAÇÕES
========================================================= */

const COMBINATIONS = [
  {
    name: "Inferno Arcano",
    a: "Chama",
    b: "Orbes de Fogo",
    requirement: "Chama Nv. 5 + Orbes de Fogo Nv. 5",
    icon: "🔥",
  },
  {
    name: "Tempestade Glacial",
    a: "Gelo",
    b: "Raio",
    requirement: "Gelo Nv. 5 + Raio Nv. 5",
    icon: "⚡",
  },
  {
    name: "Abismo",
    a: "Vórtice Sombrio",
    b: "Familiar",
    requirement: "Vórtice Nv. 5 + Familiar Nv. 5",
    icon: "🌑",
  },
];

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
   TIPOS DE INIMIGOS
========================================================= */

const ENEMY_TYPES = [
  {
    name: "Bruxo Sombrio",
    color: "#15121c",
    hp: 45,
    speed: 35,
    size: 20,
    soul: "minor",
    soulXP: 8,
  },
  {
    name: "Bruxa Negra",
    color: "#26152e",
    hp: 70,
    speed: 28,
    size: 23,
    soul: "dark",
    soulXP: 15,
  },
  {
    name: "Mago Corrompido",
    color: "#101a25",
    hp: 110,
    speed: 22,
    size: 27,
    soul: "cursed",
    soulXP: 25,
  },
  {
    name: "Bruxo Espectral",
    color: "#322044",
    hp: 170,
    speed: 18,
    size: 30,
    soul: "spectral",
    soulXP: 40,
  },
];

/* =========================================================
   CRIAÇÃO DE INIMIGO
========================================================= */

function createEnemy(x, y, typeIndex) {
  const index =
    typeof typeIndex === "number"
      ? clamp(typeIndex, 0, ENEMY_TYPES.length - 1)
      : Math.floor(Math.random() * ENEMY_TYPES.length);

  const type = ENEMY_TYPES[index];

  return {
    id: `${Date.now()}-${Math.random()}`,
    x,
    y,
    ...type,
    maxHp: type.hp,
    hp: type.hp,
    frozen: 0,
    wet: 0,
    shadowSlow: 0,
    dead: false,
    isBoss: false,
    hitTargets: {},
  };
}

/* =========================================================
   CRIAÇÃO DO BOSS
========================================================= */

function createBoss(player, wave) {
  const bossHp = 1800 + (wave || 1) * 250;

  return {
    id: `boss-${Date.now()}-${Math.random()}`,
    name: "Bruxo Primordial",
    x: player.x + randomBetween(-500, 500),
    y: player.y + randomBetween(-500, 500),
    color: "#21152d",
    hp: bossHp,
    maxHp: bossHp,
    speed: 12,
    size: 55,
    soul: "boss",
    soulXP: 250,
    frozen: 0,
    wet: 0,
    shadowSlow: 0,
    dead: false,
    isBoss: true,
    bossWave: wave || 1,
    rewardGiven: false,
    hitTargets: {},
  };
}

/* =========================================================
   CRIAÇÃO DE ALMAS
========================================================= */

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

/* =========================================================
   CRIAÇÃO DE BAÚ
========================================================= */

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
   COMPONENTE PRINCIPAL
========================================================= */

function App() {
  const canvasRef = useRef(null);

  /* =======================================================
     ESTADO DO JOGO
  ======================================================= */

  const gameRef = useRef({
    running: true,
    paused: false,

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
    artifacts: [],

    spells: {
      fire: 1,
      ice: 0,
      lightning: 0,
      shadow: 0,
      orbitFire: 0,
      familiar: 0,
    },

    keys: {},
    time: 0,
    wave: 1,

    spawnTimer: 0,
    basicTimer: 0,
    fireTimer: 0,
    iceTimer: 0,
    lightningTimer: 0,
    chestTimer: 10,

    xpMultiplier: 1,
    xpMultiplierTimer: 0,
    damageMultiplierTimer: 0,

    artifactTimers: {
      repulsion: 15,
      healing: 15,
      storm: 10,
    },

    stormActive: false,
    stormTimer: 0,
    bossSpawnedThisWave: false,
    artifactPaused: false,
    bombsUsed: 0,
    kills: 0,
  });

  /* =======================================================
     ESTADOS REACT
  ======================================================= */

  const [, setTick] = useState(0);
  const [levelUpOptions, setLevelUpOptions] = useState([]);
  const [artifactChoices, setArtifactChoices] = useState([]);
  const [gameOver, setGameOver] = useState(false);

  /* =======================================================
     FORÇA RENDERIZAÇÃO DA INTERFACE
  ======================================================= */

  function refreshUI() {
    setTick((value) => value + 1);
  }

  /* =======================================================
     RESET DO JOGO
  ======================================================= */

  function resetGame() {
    gameRef.current = {
      ...gameRef.current,
      running: true,
      paused: false,
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
      artifacts: [],
      spells: {
        fire: 1,
        ice: 0,
        lightning: 0,
        shadow: 0,
        orbitFire: 0,
        familiar: 0,
      },
      keys: {},
      time: 0,
      wave: 1,
      spawnTimer: 0,
      basicTimer: 0,
      fireTimer: 0,
      iceTimer: 0,
      lightningTimer: 0,
      chestTimer: 10,
      xpMultiplier: 1,
      xpMultiplierTimer: 0,
      damageMultiplierTimer: 0,
      artifactTimers: {
        repulsion: 15,
        healing: 15,
        storm: 10,
      },
      stormActive: false,
      stormTimer: 0,
      bossSpawnedThisWave: false,
      artifactPaused: false,
      bombsUsed: 0,
      kills: 0,
    };

    setLevelUpOptions([]);
    setArtifactChoices([]);
    setGameOver(false);
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
     LEVEL UP
  ======================================================= */

  function triggerLevelUp() {
    const game = gameRef.current;
    game.paused = true;

    const available = Object.keys(SPELLS)
      .filter((key) => game.spells[key] < SPELLS[key].max)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    if (available.length === 0) {
      const fallback = Object.keys(SPELLS)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

      setLevelUpOptions(fallback);
    } else {
      setLevelUpOptions(available);
    }

    refreshUI();
  }

  /* =======================================================
     ESCOLHER MAGIA
  ======================================================= */

  function chooseSpell(spellKey) {
    const game = gameRef.current;
    if (!SPELLS[spellKey]) return;

    game.spells[spellKey] = Math.min(
      game.spells[spellKey] + 1,
      SPELLS[spellKey].max
    );

    updateSpecialSpell(spellKey);
    game.paused = false;
    setLevelUpOptions([]);
    refreshUI();
  }

  /* =======================================================
     ATUALIZA MAGIAS ESPECIAIS
  ======================================================= */

  function updateSpecialSpell(spellKey) {
    const game = gameRef.current;

    /* ORBES DE FOGO */
    if (spellKey === "orbitFire") {
      const amount = game.spells.orbitFire;
      while (game.orbitBalls.length < amount) {
        game.orbitBalls.push({
          angle:
            game.orbitBalls.length *
            ((Math.PI * 2) / Math.max(amount, 1)),
          timer: Math.random() * 5,
          state: "orbit",
          x: game.player.x,
          y: game.player.y,
        });
      }
    }

    /* FAMILIARES */
    if (spellKey === "familiar") {
      const amount = game.spells.familiar;
      while (game.familiars.length < amount) {
        game.familiars.push({
          angle:
            game.familiars.length *
            ((Math.PI * 2) / Math.max(amount, 1)),
          timer: Math.random() * 1.2,
          x: game.player.x,
          y: game.player.y,
        });
      }
    }
  }

  /* =======================================================
     MORTE DO INIMIGO
  ======================================================= */

  function killEnemy(enemy) {
    const game = gameRef.current;

    if (!enemy || enemy.dead) return;

    enemy.dead = true;
    game.kills += 1;

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

  /* =======================================================
     LEVEL UP DO BOSS
  ======================================================= */

  function forceBossLevelUp() {
    const game = gameRef.current;
    game.player.level += 1;
    game.player.xp = 0;
    game.player.xpNeeded = Math.floor(game.player.xpNeeded * 1.25);
    game.paused = true;
    game.artifactPaused = true;
  }

  /* =======================================================
     DANO NO INIMIGO
  ======================================================= */

  function damageEnemy(enemy, amount) {
    const game = gameRef.current;
    if (!enemy || enemy.dead) return;

    enemy.hp -= amount * game.player.damageMultiplier;

    if (enemy.hp <= 0) {
      enemy.hp = 0;
      killEnemy(enemy);
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
     MAGIA DE FOGO
  ======================================================= */

  function castFire() {
    const game = gameRef.current;
    const amount = game.spells.fire;

    if (amount <= 0) return;

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
        vx: Math.cos(angle) * 420,
        vy: Math.sin(angle) * 420,
        damage: 30,
        radius: 10,
        life: 2,
        color: "#ff6b21",
        ricochets: 0,
        pierced: 0,
      });
    }
  }

  /* =======================================================
     MAGIA DE GELO
  ======================================================= */

  function castIce() {
    const game = gameRef.current;
    const amount = game.spells.ice;

    if (amount <= 0) return;

    const targets = [...game.enemies]
      .filter((enemy) => !enemy.dead)
      .sort((a, b) => distance(game.player, a) - distance(game.player, b))
      .slice(0, Math.min(amount, 5));

    for (const enemy of targets) {
      enemy.frozen = 2.5;
      damageEnemy(enemy, 18);

      game.effects.push({
        type: "ice",
        x: enemy.x,
        y: enemy.y,
        timer: 0.5,
      });
    }
  }

  /* =======================================================
     MAGIA DE RAIO
  ======================================================= */

  function castLightning() {
    const game = gameRef.current;
    const amount = game.spells.lightning;

    if (amount <= 0) return;

    const targets = [...game.enemies]
      .filter((enemy) => !enemy.dead)
      .sort((a, b) => distance(game.player, a) - distance(game.player, b))
      .slice(0, Math.min(amount, 5));

    for (const enemy of targets) {
      game.effects.push({
        type: "lightning",
        x: enemy.x,
        y: enemy.y,
        timer: 0.4,
      });

      killEnemy(enemy);

      if (game.stormActive && enemy.wet > 0) {
        lightningChain(enemy);
      }
    }
  }

  /* =======================================================
     VÓRTICE SOMBRIO
  ======================================================= */

  function updateShadow(dt) {
    const game = gameRef.current;
    const level = game.spells.shadow;

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

  /* =======================================================
     ORBES DE FOGO
  ======================================================= */

  function updateOrbitBalls(dt) {
    const game = gameRef.current;
    const amount = game.spells.orbitFire;

    if (amount <= 0) return;

    const radius = 70 + amount * 7;

    game.orbitBalls.forEach((ball, index) => {
      ball.angle += dt * 1.5;

      ball.x =
        game.player.x +
        Math.cos(ball.angle + (index * Math.PI * 2) / amount) * radius;
      ball.y =
        game.player.y +
        Math.sin(ball.angle + (index * Math.PI * 2) / amount) * radius;

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

  /* =======================================================
     FAMILIARES
  ======================================================= */

  function updateFamiliars(dt) {
    const game = gameRef.current;
    const amount = game.spells.familiar;

    if (amount <= 0) return;

    game.familiars.forEach((familiar, index) => {
      familiar.angle += dt;
      const radius = 95;

      familiar.x =
        game.player.x +
        Math.cos(familiar.angle + (index * Math.PI * 2) / amount) * radius;
      familiar.y =
        game.player.y +
        Math.sin(familiar.angle + (index * Math.PI * 2) / amount) * radius;

      familiar.timer -= dt;

      if (familiar.timer <= 0) {
        const enemy = getClosestEnemy(familiar.x, familiar.y);
        if (enemy) {
          const angle = Math.atan2(enemy.y - familiar.y, enemy.x - familiar.x);

          game.projectiles.push({
            type: "familiar",
            x: familiar.x,
            y: familiar.y,
            vx: Math.cos(angle) * 400,
            vy: Math.sin(angle) * 400,
            damage: 20,
            radius: 7,
            life: 2,
            color: "#b978ff",
            ricochets: 0,
            pierced: 0,
          });

          familiar.timer = 1.2;
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

        const alreadyHit =
          projectile.hitEnemies && projectile.hitEnemies.includes(enemy.id);
        if (alreadyHit) continue;

        const d = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);

        if (d < projectile.radius + enemy.size / 2) {
          if (!projectile.hitEnemies) {
            projectile.hitEnemies = [];
          }
          projectile.hitEnemies.push(enemy.id);

          damageEnemy(enemy, projectile.damage);

          if (
            projectile.type === "fire" &&
            game.artifacts.includes("piercingFlame")
          ) {
            projectile.pierced = (projectile.pierced || 0) + 1;
            if (projectile.pierced >= 8) {
              projectile.life = 0;
            }
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
     ATUALIZAÇÃO DOS INIMIGOS
  ======================================================= */

  function updateEnemies(dt) {
    const game = gameRef.current;

    for (const enemy of game.enemies) {
      if (enemy.dead) continue;

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
        game.player.hp -= 10 * dt;
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
     SPAWN DE INIMIGOS
  ======================================================= */

  function randomEnemyAround(player) {
    const angle = Math.random() * Math.PI * 2;
    const spawnDistance = 650 + Math.random() * 500;

    return createEnemy(
      player.x + Math.cos(angle) * spawnDistance,
      player.y + Math.sin(angle) * spawnDistance
    );
  }

  function spawnEnemies(dt) {
    const game = gameRef.current;

    game.spawnTimer -= dt;
    if (game.spawnTimer > 0) return;

    const amount = Math.min(1 + Math.floor(game.time / 30), 8);

    for (let i = 0; i < amount; i++) {
      game.enemies.push(randomEnemyAround(game.player));
    }

    game.spawnTimer = Math.max(0.4, 2.2 - game.time / 100);
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
      type: "nuclear",
      x: game.player.x,
      y: game.player.y,
      radius: 0,
      maxRadius: 1000,
      timer: 2,
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

    for (const soul of game.souls) {
      soul.life -= dt;

      const d = distance(soul, game.player);
      if (d < 160) {
        const angle = Math.atan2(
          game.player.y - soul.y,
          game.player.x - soul.x
        );
        const attractionSpeed = 120 + (160 - d) * 3;

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
     ARTEFATOS
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

    if (!game.artifacts.includes(artifactKey)) {
      game.artifacts.push(artifactKey);
      applyArtifact(artifactKey);
    }

    game.paused = false;
    game.artifactPaused = false;
    setArtifactChoices([]);
    refreshUI();
  }

  /* =======================================================
     APLICAÇÃO DOS ARTEFATOS
  ======================================================= */

  function applyArtifact(artifactKey) {
    const game = gameRef.current;

    switch (artifactKey) {
      case "mirror": {
        const familiarLevel = game.spells.familiar;
        const orbitLevel = game.spells.orbitFire;

        const familiarTarget = Math.min(
          familiarLevel * 2,
          SPELLS.familiar.max * 2
        );
        const orbitTarget = Math.min(
          orbitLevel * 2,
          SPELLS.orbitFire.max * 2
        );

        while (
          game.familiars.length < familiarTarget &&
          familiarLevel > 0
        ) {
          game.familiars.push({
            angle: Math.random() * Math.PI * 2,
            timer: Math.random(),
            x: game.player.x,
            y: game.player.y,
          });
        }

        while (game.orbitBalls.length < orbitTarget && orbitLevel > 0) {
          game.orbitBalls.push({
            angle: Math.random() * Math.PI * 2,
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

  /* =======================================================
     RUNA DE REPULSÃO
  ======================================================= */

  function updateRepulsionRune(dt) {
    const game = gameRef.current;
    if (!game.artifacts.includes("repulsionRune")) return;

    game.artifactTimers.repulsion -= dt;
    if (game.artifactTimers.repulsion > 0) return;

    game.artifactTimers.repulsion = 15;
    const radius = 180;

    game.effects.push({
      type: "repulsionRune",
      x: game.player.x,
      y: game.player.y,
      radius,
      timer: 2,
    });

    for (const enemy of game.enemies) {
      if (enemy.dead) continue;

      const d = distance(game.player, enemy);
      if (d >= radius) continue;

      const angle = Math.atan2(
        enemy.y - game.player.y,
        enemy.x - game.player.x
      );
      const force = (radius - d) * 2;

      enemy.x += Math.cos(angle) * force;
      enemy.y += Math.sin(angle) * force;
    }
  }

  /* =======================================================
     RUNA DE CURA
  ======================================================= */

  function updateHealingRune(dt) {
    const game = gameRef.current;
    if (!game.artifacts.includes("healingRune")) return;

    game.artifactTimers.healing -= dt;
    if (game.artifactTimers.healing > 0) return;

    game.artifactTimers.healing = 15;
    game.player.hp = Math.min(game.player.maxHp, game.player.hp + 35);

    game.effects.push({
      type: "healingRune",
      x: game.player.x,
      y: game.player.y,
      radius: 100,
      timer: 2,
    });
  }

  /* =======================================================
     TEMPESTADE / CHUVA
  ======================================================= */

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

  /* =======================================================
     CORRENTE DE RAIO
  ======================================================= */

  function lightningChain(source) {
    const game = gameRef.current;
    if (!game.stormActive) return;

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

      killEnemy(enemy);
    }
  }

  /* =======================================================
     ATUALIZAÇÃO DOS ARTEFATOS E BUFFS
  ======================================================= */

  function updateArtifacts(dt) {
    const game = gameRef.current;

    updateRepulsionRune(dt);
    updateHealingRune(dt);
    updateStorm(dt);

    /* Temporizador de Dano x2 */
    if (game.damageMultiplierTimer > 0) {
      game.damageMultiplierTimer -= dt;
      if (game.damageMultiplierTimer <= 0) {
        game.damageMultiplierTimer = 0;
        game.player.damageMultiplier = 1;
      }
    }

    /* Temporizador de XP x2 */
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

  /* =======================================================
     CÂMERA
  ======================================================= */

  function updateCamera(dt) {
    const game = gameRef.current;
    game.camera.x += (game.player.x - game.camera.x) * 8 * dt;
    game.camera.y += (game.player.y - game.camera.y) * 8 * dt;
  }

  /* =======================================================
     ATAQUES AUTOMÁTICOS
  ======================================================= */

  function updateAttackTimers(dt) {
    const game = gameRef.current;

    game.basicTimer -= dt;
    game.fireTimer -= dt;
    game.iceTimer -= dt;
    game.lightningTimer -= dt;

    /* TIRO BÁSICO (Sempre funciona) */
    if (game.basicTimer <= 0) {
      fireBasicShot();
      game.basicTimer = 0.65;
    }

    /* CHAMA */
    if (game.spells.fire > 0 && game.fireTimer <= 0) {
      castFire();
      game.fireTimer = 1.5;
    }

    /* GELO */
    if (game.spells.ice > 0 && game.iceTimer <= 0) {
      castIce();
      game.iceTimer = 2.8;
    }

    /* RAIO */
    if (game.spells.lightning > 0 && game.lightningTimer <= 0) {
      castLightning();
      game.lightningTimer = game.stormActive ? 0.8 : 4;
    }
  }

  /* =======================================================
     LIMPEZA DE EFEITOS
  ======================================================= */

  function updateEffects(dt) {
    const game = gameRef.current;

    for (const effect of game.effects) {
      effect.timer -= dt;
      if (effect.type === "nuclear") {
        effect.radius = Math.min(
          effect.maxRadius || 1000,
          (effect.radius || 0) + 1200 * dt
        );
      }
    }

    game.effects = game.effects.filter((effect) => effect.timer > 0);
  }

  /* =======================================================
     LOOP PRINCIPAL DO JOGO
  ======================================================= */

  function update(dt) {
    const game = gameRef.current;

    /*
      PAUSA COMPLETA DO GAMEPLAY:
      Quando o jogo está pausado (Level Up / Escolha de Artefato / GameOver),
      nenhuma lógica de movimento, inimigo, projétil ou timer executa.
    */
    if (!game.running || game.paused) {
      return;
    }

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
    updateSouls(dt);
    updateArtifacts(dt);
    checkChests();
    updateEffects(dt);

    /* DERROTA */
    if (game.player.hp <= 0) {
      game.player.hp = 0;
      game.running = false;
      game.paused = true;
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
     DESENHO DO FUNDO (FLORESTA NEGRA)
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

            const screen = worldToScreen(worldX, worldY, camera, width, height);

            /* Tronco */
            ctx.fillStyle = "#121313";
            ctx.fillRect(screen.x - 5, screen.y - 5, 10, 50);

            /* Copa */
            ctx.fillStyle = "#111713";
            ctx.beginPath();
            ctx.moveTo(screen.x, screen.y - 60);
            ctx.lineTo(screen.x - 35, screen.y);
            ctx.lineTo(screen.x - 18, screen.y + 5);
            ctx.lineTo(screen.x - 28, screen.y + 25);
            ctx.lineTo(screen.x, screen.y + 10);
            ctx.lineTo(screen.x + 28, screen.y + 25);
            ctx.lineTo(screen.x + 18, screen.y + 5);
            ctx.lineTo(screen.x + 35, screen.y);
            ctx.closePath();
            ctx.fill();
          }
        }

        /* Névoa */
        for (let i = 0; i < 35; i++) {
          const x = (i * 271 - camera.x * 0.2) % (width + 200);
          const y = (i * 149 - camera.y * 0.15) % (height + 200);

          ctx.fillStyle = "rgba(120,130,130,0.07)";
          ctx.beginPath();
          ctx.arc(x, y, 30, 0, Math.PI * 2);
          ctx.fill();
        }
      },
      width / 2,
      height / 2,
      width,
      height
    );
  }

  /* =======================================================
     DESENHO DO JOGADOR
  ======================================================= */

  function drawPlayer(ctx, player, camera, width, height) {
    const p = worldToScreen(player.x, player.y, camera, width, height);

    ctx.save();
    ctx.translate(p.x, p.y);

    drawSpriteOrFallback(
      ctx,
      "player",
      () => {
        /* Sombra */
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.beginPath();
        ctx.ellipse(0, 25, 27, 9, 0, 0, Math.PI * 2);
        ctx.fill();

        /* Capa */
        ctx.fillStyle = "#09080d";
        ctx.beginPath();
        ctx.moveTo(-17, -2);
        ctx.lineTo(-32, 35);
        ctx.quadraticCurveTo(0, 48, 32, 35);
        ctx.lineTo(17, -2);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = "#40374d";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-14, 3);
        ctx.quadraticCurveTo(0, 12, 14, 3);
        ctx.stroke();

        /* Corpo */
        ctx.fillStyle = "#211a28";
        ctx.beginPath();
        ctx.moveTo(-12, -4);
        ctx.lineTo(-15, 25);
        ctx.lineTo(15, 25);
        ctx.lineTo(12, -4);
        ctx.closePath();
        ctx.fill();

        /* Cabeça */
        ctx.fillStyle = "#d5b5a4";
        ctx.beginPath();
        ctx.arc(0, -15, 10, 0, Math.PI * 2);
        ctx.fill();

        /* Chapéu */
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

        /* Olhos */
        ctx.fillStyle = "#c77dff";
        ctx.fillRect(-5, -16, 3, 2);
        ctx.fillRect(2, -16, 3, 2);

        /* Cajado */
        ctx.strokeStyle = "#59402d";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(18, 25);
        ctx.lineTo(28, -25);
        ctx.stroke();

        ctx.shadowBlur = 15;
        ctx.shadowColor = "#a86cff";
        ctx.fillStyle = "#a86cff";
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

  /* =======================================================
     DESENHO DO INIMIGO
  ======================================================= */

  function drawEnemy(ctx, enemy, camera, width, height) {
    const p = worldToScreen(enemy.x, enemy.y, camera, width, height);

    ctx.save();
    ctx.translate(p.x, p.y);

    const size = enemy.size;
    const scale = enemy.isBoss ? 1.8 : 1;
    ctx.scale(scale, scale);

    if (enemy.isBoss) {
      ctx.shadowBlur = 30;
      ctx.shadowColor = "#9d3cff";
    }

    drawSpriteOrFallback(
      ctx,
      enemy.isBoss ? "boss" : "darkWitch",
      () => {
        /* Corpo */
        ctx.fillStyle = enemy.color;
        ctx.beginPath();
        ctx.moveTo(-size / 2, 0);
        ctx.lineTo(-size, size * 1.5);
        ctx.quadraticCurveTo(0, size * 2, size, size * 1.5);
        ctx.lineTo(size / 2, 0);
        ctx.closePath();
        ctx.fill();

        /* Cabeça */
        ctx.fillStyle = "#6d5960";
        ctx.beginPath();
        ctx.arc(0, -size / 2, size / 2.2, 0, Math.PI * 2);
        ctx.fill();

        /* Chapéu */
        ctx.fillStyle = "#09070b";
        ctx.beginPath();
        ctx.moveTo(-size, -size / 2);
        ctx.lineTo(size, -size / 2);
        ctx.lineTo(0, -size * 2);
        ctx.closePath();
        ctx.fill();

        /* Olhos */
        ctx.fillStyle = enemy.wet > 0 ? "#62d9ff" : "#d85cff";
        ctx.fillRect(-size / 4, -size / 2, 3, 2);
        ctx.fillRect(size / 8, -size / 2, 3, 2);
      },
      0,
      0,
      size * 2,
      size * 2
    );

    /* Barra de Vida */
    ctx.fillStyle = "#30151b";
    ctx.fillRect(-size, -size * 2.3, size * 2, 4);

    ctx.fillStyle = enemy.isBoss ? "#d84cff" : "#b63c58";
    ctx.fillRect(
      -size,
      -size * 2.3,
      size * 2 * clamp(enemy.hp / enemy.maxHp, 0, 1),
      4
    );

    /* Congelamento */
    if (enemy.frozen > 0) {
      ctx.strokeStyle = "#70dfff";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, size * 1.4, 0, Math.PI * 2);
      ctx.stroke();
    }

    /* Molhado */
    if (enemy.wet > 0) {
      ctx.strokeStyle = "rgba(90,190,255,0.7)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, size * 1.2, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  /* =======================================================
     DESENHO DE PROJÉTEIS
  ======================================================= */

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

  /* =======================================================
     DESENHO DE ORBES
  ======================================================= */

  function drawOrbits(ctx, game, camera, width, height) {
    for (const ball of game.orbitBalls) {
      const p = worldToScreen(ball.x, ball.y, camera, width, height);

      ctx.save();
      ctx.shadowBlur = 25;
      ctx.shadowColor = "#ff6b18";
      ctx.fillStyle = "#ff7b22";

      ctx.beginPath();
      ctx.arc(p.x, p.y, 11, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#ffd166";
      ctx.beginPath();
      ctx.arc(p.x - 2, p.y - 2, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  /* =======================================================
     DESENHO DE FAMILIARES
  ======================================================= */

  function drawFamiliars(ctx, game, camera, width, height) {
    for (const familiar of game.familiars) {
      const p = worldToScreen(familiar.x, familiar.y, camera, width, height);

      ctx.save();
      ctx.shadowBlur = 20;
      ctx.shadowColor = "#b978ff";
      ctx.fillStyle = "#d9b4ff";

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

  /* =======================================================
     DESENHO DE BAÚS
  ======================================================= */

  function drawChests(ctx, game, camera, width, height) {
    const chestColors = [
      "#66d9ff", // xp
      "#ff623f", // damage
      "#d76cff", // level
      "#68e08a", // heal
      "#ffcf4d", // nuke
    ];

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

  /* =======================================================
     DESENHO DE ALMAS
  ======================================================= */

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

  /* =======================================================
     DESENHO DE EFEITOS
  ======================================================= */

  function drawEffects(ctx, game, camera, width, height) {
    for (const effect of game.effects) {
      const p = worldToScreen(effect.x, effect.y, camera, width, height);

      ctx.save();

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

      if (effect.type === "repulsionRune") {
        ctx.strokeStyle = "#d4a6ff";
        ctx.shadowBlur = 20;
        ctx.shadowColor = "#b86cff";
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.arc(p.x, p.y, effect.radius, 0, Math.PI * 2);
        ctx.stroke();

        for (let i = 0; i < 8; i++) {
          const angle = (Math.PI * 2 * i) / 8;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(
            p.x + Math.cos(angle) * effect.radius,
            p.y + Math.sin(angle) * effect.radius
          );
          ctx.stroke();
        }
      }

      if (effect.type === "healingRune") {
        ctx.strokeStyle = "#7dff9b";
        ctx.shadowBlur = 20;
        ctx.shadowColor = "#55ff7c";
        ctx.lineWidth = 4;

        ctx.beginPath();
        ctx.arc(p.x, p.y, effect.radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(p.x - 25, p.y);
        ctx.lineTo(p.x + 25, p.y);
        ctx.moveTo(p.x, p.y - 25);
        ctx.lineTo(p.x, p.y + 25);
        ctx.stroke();
      }

      if (effect.type === "nuclear") {
        ctx.strokeStyle = "#fff2a6";
        ctx.shadowBlur = 40;
        ctx.shadowColor = "#ffb52e";
        ctx.lineWidth = 8;

        ctx.beginPath();
        ctx.arc(p.x, p.y, effect.radius || 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = "rgba(255,180,50,0.08)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, effect.radius || 0, 0, Math.PI * 2);
        ctx.fill();
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

  /* =======================================================
     DESENHO DA TEMPESTADE / CHUVA
  ======================================================= */

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

  /* =======================================================
     RENDERIZAÇÃO PRINCIPAL (DRAW)
  ======================================================= */

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    const game = gameRef.current;

    ctx.clearRect(0, 0, width, height);

    drawBackground(ctx, width, height, game.camera);
    drawStorm(ctx, game, width, height);

    drawChests(ctx, game, game.camera, width, height);
    drawSouls(ctx, game, game.camera, width, height);

    for (const enemy of game.enemies) {
      drawEnemy(ctx, enemy, game.camera, width, height);
    }

    drawOrbits(ctx, game, game.camera, width, height);
    drawFamiliars(ctx, game, game.camera, width, height);
    drawProjectiles(ctx, game, game.camera, width, height);
    drawPlayer(ctx, game.player, game.camera, width, height);
    drawEffects(ctx, game, game.camera, width, height);
  }

  /* =======================================================
     HOOK PRINCIPAL - LOOP ÚNICO DE ANIMAÇÃO E EVENTOS
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

      update(dt);
      draw();

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
  }, []);

  const game = gameRef.current;

  return (
    <div className="game">
      <canvas ref={canvasRef} />

      <div className="hud">
        <div className="top-left">
          <div className="level">LVL {game.player.level}</div>
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

        <div className="spell-list">
          {Object.entries(game.spells)
            .filter(([, level]) => level > 0)
            .map(([key, level]) => (
              <div className="spell-mini" key={key}>
                <span>{SPELLS[key].icon}</span>
                <span>{SPELLS[key].name}</span>
                <b>{level}</b>
              </div>
            ))}
        </div>
      </div>

      {levelUpOptions.length > 0 && (
        <div className="level-overlay">
          <div className="spellbook">
            <div className="book-page left-page">
              <div className="book-title">✦ GRIMÓRIO ✦</div>
              <p className="book-subtitle">Escolha uma magia</p>
              <div className="choices">
                {levelUpOptions.map((spellKey) => (
                  <button
                    className="spell-choice"
                    key={spellKey}
                    onClick={() => chooseSpell(spellKey)}
                  >
                    <span className="choice-icon">{SPELLS[spellKey].icon}</span>
                    <span className="choice-name">{SPELLS[spellKey].name}</span>
                    <span className="choice-level">
                      Nv. {game.spells[spellKey] + 1}/{SPELLS[spellKey].max}
                    </span>
                    <span className="choice-description">
                      {SPELLS[spellKey].description}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="book-page right-page">
              <div className="book-title">✧ FUSÕES ✧</div>
              <p className="book-subtitle">Combinações</p>
              {COMBINATIONS.map((combo) => (
                <div className="combination" key={combo.name}>
                  <div className="combo-icon">{combo.icon}</div>
                  <div>
                    <strong>{combo.name}</strong>
                    <div className="combo-spells">
                      {combo.a} + {combo.b}
                    </div>
                    <div className="combo-requirement">
                      🔒 {combo.requirement}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {artifactChoices.length > 0 && (
        <div className="level-overlay">
          <div className="artifact-book">
            <div className="artifact-title">👑 RECOMPENSA DO BOSS 👑</div>
            <div className="artifact-subtitle">
              O Bruxo Primordial foi derrotado.
              <br />
              Escolha um artefato.
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

      {gameOver && (
        <div className="game-over">
          <div className="game-over-box">
            <h1>☠ FIM DA NOITE ☠</h1>
            <p>
              Você sobreviveu por <b>{Math.floor(game.time)}</b> segundos.
            </p>
            <p>
              Nível alcançado: <b>{game.player.level}</b>
            </p>
            <button onClick={resetGame}>Tentar novamente</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
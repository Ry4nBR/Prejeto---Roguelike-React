import React, { useEffect, useRef, useState } from "react";
import "./App.css";

const WORLD_SIZE = 100000;

// Configuração das waves
const WAVE_DURATION = 30;
const BOSS_EVERY_WAVES = 5;

// Configuração dos artefatos
const ARTIFACT_COUNT = 6;

const SPELLS = {
  fire: {
    name: "Chama",
    icon: "🔥",
    description: "Dispara projéteis de fogo.",
    max: 5,
  },
  ice: {
    name: "Gelo",
    icon: "❄️",
    description: "Invoca raios congelantes.",
    max: 5,
  },
  lightning: {
    name: "Raio",
    icon: "⚡",
    description: "Um relâmpago elimina um inimigo instantaneamente.",
    max: 5,
  },
  shadow: {
    name: "Vórtice Sombrio",
    icon: "🌑",
    description: "Cria um vórtice que gira ao redor do bruxo.",
    max: 8,
  },
  orbitFire: {
    name: "Orbes de Fogo",
    icon: "🔴",
    description: "Bolas de fogo orbitam o personagem e depois atacam.",
    max: 5,
  },
  familiar: {
    name: "Familiar",
    icon: "👻",
    description: "Invoca um auxiliar mágico que ataca os inimigos.",
    max: 5,
  },
};

const ARTIFACTS = {
  mirror: {
    name: "Espelho Arcano",
    icon: "🪞",
    description:
      "Duplica a quantidade máxima atual de Familiares e Orbes de Fogo.",
  },

  broom: {
    name: "Vassoura Encantada",
    icon: "🧹",
    description:
      "Aumenta a velocidade de movimento do personagem em 40%.",
  },

  piercingFlame: {
    name: "Chama Perfurante",
    icon: "🔥",
    description:
      "Os projéteis de Chama atravessam os inimigos.",
  },

  ricochet: {
    name: "Olho do Ricochete",
    icon: "🔮",
    description:
      "Os projéteis podem ricochetear até 5 vezes entre inimigos.",
  },

  repulsionRune: {
    name: "Símbolo da Repulsão",
    icon: "✦",
    description:
      "A cada 15 segundos cria uma grande runa no chão que empurra os inimigos.",
  },

  healingRune: {
    name: "Símbolo da Vida",
    icon: "✚",
    description:
      "Cria uma runa a cada 15 segundos que restaura a vida do personagem.",
  },

  stormSymbol: {
    name: "Símbolo da Tempestade",
    icon: "☔",
    description:
      "Invoca chuva periodicamente. Inimigos molhados sofrem correntes elétricas.",
  },
};

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

function createEnemy(x, y, type = Math.floor(Math.random() * 4)) {
  const types = [
    {
      name: "Bruxo Sombrio",
      color: "#15121c",
      hp: 45,
      speed: 35,
      size: 20,

      // Alma mais fraca
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

  const t = types[type];

  return {
    id: Math.random(),

    x,
    y,

    ...t,

    maxHp: t.hp,

    frozen: 0,

    // Novo efeito
    wet: 0,

    // Controle de ricochete
    hitByProjectile: false,
  };
}

function createEnemy(x, y, type = Math.floor(Math.random() * 4)) {
  const types = [
    {
      name: "Bruxo Sombrio",
      color: "#15121c",
      hp: 45,
      speed: 35,
      size: 20,

      // Alma mais fraca
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

  const t = types[type];

  return {
    id: Math.random(),

    x,
    y,

    ...t,

    maxHp: t.hp,

    frozen: 0,

    // Novo efeito
    wet: 0,

    // Controle de ricochete
    hitByProjectile: false,
  };
}

function updateSouls(dt) {
  const game = gameRef.current;

  for (const soul of game.souls) {
    soul.life -= dt;

    /*
      As almas são atraídas pelo personagem
      quando ele chega perto.
    */

    const d = distance(
      soul,
      game.player
    );

    if (d < 160) {
      const angle = Math.atan2(
        game.player.y - soul.y,
        game.player.x - soul.x
      );

      const attractionSpeed =
        120 +
        (160 - d) * 3;

      soul.x +=
        Math.cos(angle) *
        attractionSpeed *
        dt;

      soul.y +=
        Math.sin(angle) *
        attractionSpeed *
        dt;
    }

    if (d < 25) {
      addXP(soul.xp);

      soul.collected = true;
    }
  }

  game.souls =
    game.souls.filter(
      (soul) =>
        soul.life > 0 &&
        !soul.collected
    );
}

function updateSouls(dt) {
  const game = gameRef.current;

  for (const soul of game.souls) {
    soul.life -= dt;

    /*
      As almas são atraídas pelo personagem
      quando ele chega perto.
    */

    const d = distance(
      soul,
      game.player
    );

    if (d < 160) {
      const angle = Math.atan2(
        game.player.y - soul.y,
        game.player.x - soul.x
      );

      const attractionSpeed =
        120 +
        (160 - d) * 3;

      soul.x +=
        Math.cos(angle) *
        attractionSpeed *
        dt;

      soul.y +=
        Math.sin(angle) *
        attractionSpeed *
        dt;
    }

    if (d < 25) {
      addXP(soul.xp);

      soul.collected = true;
    }
  }

  game.souls =
    game.souls.filter(
      (soul) =>
        soul.life > 0 &&
        !soul.collected
    );
}

function randomEnemyAround(player) {
  const angle = Math.random() * Math.PI * 2;
  const distance = 650 + Math.random() * 500;

  return createEnemy(
    player.x + Math.cos(angle) * distance,
    player.y + Math.sin(angle) * distance
  );
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function App() {
  const canvasRef = useRef(null);

  const gameRef = useRef({
    running: true,
    player: {
      x: WORLD_SIZE / 2,
      y: WORLD_SIZE / 2,
      hp: 100,
      maxHp: 100,
      speed: 260,
      level: 1,
      xp: 0,
      xpNeeded: 60,
      damageMultiplier: 1,
    },

    camera: {
      x: WORLD_SIZE / 2,
      y: WORLD_SIZE / 2,
    },

    enemies: [],
    projectiles: [],
    effects: [],
    chests: [],

    spells: {
      fire: 1,
      ice: 0,
      lightning: 0,
      shadow: 0,
      orbitFire: 0,
      familiar: 0,
    },

    familiars: [],
    orbitBalls: [],

    keys: {},

    time: 0,
    spawnTimer: 0,
    basicTimer: 0,
    fireTimer: 0,
    iceTimer: 0,
    lightningTimer: 0,
    chestTimer: 0,

    xpMultiplier: 1,
    damageMultiplierTimer: 0,

    paused: false,
  });

  const [tick, setTick] = useState(0);
  const [levelUpOptions, setLevelUpOptions] = useState([]);
  const [gameOver, setGameOver] = useState(false);

  const levelUpOptionsRef = useRef(levelUpOptions);

  useEffect(() => {
    levelUpOptionsRef.current = levelUpOptions;
  }, [levelUpOptions]);

  function triggerLevelUp() {
    const game = gameRef.current;

    game.paused = true;

    const available = Object.keys(SPELLS)
      .filter((key) => game.spells[key] < SPELLS[key].max)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    setLevelUpOptions(available);
  }

  function chooseSpell(spellKey) {
    const game = gameRef.current;

    game.spells[spellKey] = Math.min(
      game.spells[spellKey] + 1,
      SPELLS[spellKey].max
    );

    updateSpecialSpell(spellKey);

    game.paused = false;

    setLevelUpOptions([]);

    setTick((v) => v + 1);
  }

  function updateSpecialSpell(spellKey) {
    const game = gameRef.current;

    if (spellKey === "orbitFire") {
      const amount = game.spells.orbitFire;

      while (game.orbitBalls.length < amount) {
        game.orbitBalls.push({
          angle: game.orbitBalls.length * ((Math.PI * 2) / amount),
          timer: 0,
          state: "orbit",
          x: game.player.x,
          y: game.player.y,
        });
      }
    }

    if (spellKey === "familiar") {
      const amount = game.spells.familiar;

      while (game.familiars.length < amount) {
        game.familiars.push({
          angle: game.familiars.length * ((Math.PI * 2) / amount),
          timer: Math.random() * 2,
          x: game.player.x,
          y: game.player.y,
        });
      }
    }
  }

  function addXP(amount) {
    const game = gameRef.current;

    game.player.xp += amount * game.xpMultiplier;

    if (game.player.xp >= game.player.xpNeeded) {
      game.player.xp -= game.player.xpNeeded;

      game.player.level++;

      game.player.xpNeeded = Math.floor(
        game.player.xpNeeded * 1.25
      );

      triggerLevelUp();
    }
  }

  function damageEnemy(enemy, amount) {
    const game = gameRef.current;

    enemy.hp -= amount * game.player.damageMultiplier;

    if (enemy.hp <= 0) {
      addXP(enemy.xp);
      enemy.dead = true;

      game.effects.push({
        type: "death",
        x: enemy.x,
        y: enemy.y,
        timer: 0.5,
      });
    }
  }

  function getClosestEnemy(x, y) {
    const game = gameRef.current;

    let closest = null;
    let closestDistance = Infinity;

    for (const enemy of game.enemies) {
      if (enemy.dead) continue;

      const d = Math.hypot(enemy.x - x, enemy.y - y);

      if (d < closestDistance) {
        closest = enemy;
        closestDistance = d;
      }
    }

    return closest;
  }

  function fireBasicShot() {
    const game = gameRef.current;
    const enemy = getClosestEnemy(
      game.player.x,
      game.player.y
    );

    if (!enemy) return;

    const angle = Math.atan2(
      enemy.y - game.player.y,
      enemy.x - game.player.x
    );

    /*
      ESTE É O TIRO PADRÃO.

      Ele é independente das outras magias.
      Portanto sempre existe um ataque básico.
    */

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
    });
  }

  function castFire() {
    const game = gameRef.current;

    const amount = game.spells.fire;

    for (let i = 0; i < amount; i++) {
      const enemy = getClosestEnemy(
        game.player.x,
        game.player.y
      );

      if (!enemy) return;

      const spread =
        amount === 1
          ? 0
          : (i - (amount - 1) / 2) * 0.15;

      const angle =
        Math.atan2(
          enemy.y - game.player.y,
          enemy.x - game.player.x
        ) + spread;

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
      });
    }
  }

  function castIce() {
    const game = gameRef.current;

    const amount = game.spells.ice;

    if (amount <= 0) return;

    const targets = [...game.enemies]
      .filter((e) => !e.dead)
      .sort(
        (a, b) =>
          distance(game.player, a) -
          distance(game.player, b)
      )
      .slice(0, amount);

    for (const enemy of targets) {
      enemy.frozen = 2.5;

      game.effects.push({
        type: "ice",
        x: enemy.x,
        y: enemy.y,
        timer: 0.5,
      });
    }
  }

  function castLightning() {
    const game = gameRef.current;

    const amount = game.spells.lightning;

    if (amount <= 0) return;

    const targets = [...game.enemies]
      .filter((e) => !e.dead)
      .sort(
        (a, b) =>
          distance(game.player, a) -
          distance(game.player, b)
      )
      .slice(0, amount);

    for (const enemy of targets) {
      game.effects.push({
        type: "lightning",
        x: enemy.x,
        y: enemy.y,
        timer: 0.4,
      });

      enemy.hp = 0;
      enemy.dead = true;

      addXP(enemy.xp);
    }
  }

  function updateOrbitBalls(dt) {
    const game = gameRef.current;

    const amount = game.spells.orbitFire;

    if (amount <= 0) return;

    const radius = 70 + amount * 7;

    game.orbitBalls.forEach((ball, index) => {
      ball.angle += dt * 1.5;

      ball.x =
        game.player.x +
        Math.cos(
          ball.angle +
          (index * Math.PI * 2) / amount
        ) *
          radius;

      ball.y =
        game.player.y +
        Math.sin(
          ball.angle +
          (index * Math.PI * 2) / amount
        ) *
          radius;

      ball.timer += dt;

      /*
        A bola fica orbitando por 5 segundos.
        Depois dispara contra um inimigo.
      */

      if (ball.timer >= 5 && ball.state === "orbit") {
        const enemy = getClosestEnemy(ball.x, ball.y);

        if (enemy) {
          const angle = Math.atan2(
            enemy.y - ball.y,
            enemy.x - ball.x
          );

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
          });

          ball.timer = 0;
        }
      }
    });
  }

  function updateFamiliars(dt) {
    const game = gameRef.current;

    const amount = game.spells.familiar;

    if (amount <= 0) return;

    game.familiars.forEach((familiar, index) => {
      familiar.angle += dt;

      const radius = 95;

      familiar.x =
        game.player.x +
        Math.cos(
          familiar.angle +
          (index * Math.PI * 2) / amount
        ) *
          radius;

      familiar.y =
        game.player.y +
        Math.sin(
          familiar.angle +
          (index * Math.PI * 2) / amount
        ) *
          radius;

      familiar.timer -= dt;

      if (familiar.timer <= 0) {
        const enemy = getClosestEnemy(
          familiar.x,
          familiar.y
        );

        if (enemy) {
          const angle = Math.atan2(
            enemy.y - familiar.y,
            enemy.x - familiar.x
          );

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
          });

          familiar.timer = 1.2;
        }
      }
    });
  }

  function updateProjectiles(dt) {
    const game = gameRef.current;

    for (const projectile of game.projectiles) {
      projectile.x += projectile.vx * dt;
      projectile.y += projectile.vy * dt;
      projectile.life -= dt;

      for (const enemy of game.enemies) {
        if (enemy.dead) continue;

        const d = Math.hypot(
          projectile.x - enemy.x,
          projectile.y - enemy.y
        );

        if (
  d <
  projectile.radius +
    enemy.size / 2
) {
  damageEnemy(
    enemy,
    projectile.damage
  );

  /*
    Se possuir o artefato
    Chama Perfurante,
    o projétil continua.
  */

  if (
    projectile.type === "fire" &&
    game.piercingFlame
  ) {
    projectile.pierced =
      (projectile.pierced || 0) + 1;

    /*
      Evita atravessar infinitamente.
    */

    if (
      projectile.pierced >= 8
    ) {
      projectile.life = 0;
    }
  }

  else {
    projectile.life = 0;
  }

  break;
}

          break;
        }
      }
    }

    game.projectiles = game.projectiles.filter(
      (p) => p.life > 0
    );
  }

function updateShadow(dt) {
  const game = gameRef.current;

  const level =
    game.spells.shadow;

  if (level <= 0) return;

  /*
    O tamanho cresce com o nível.
  */

  const radius =
    75 + level * 15;

  /*
    Quanto maior o nível,
    maior a redução de velocidade.
  */

  const slowAmount =
    Math.min(
      0.25 + level * 0.05,
      0.75
    );

  for (const enemy of game.enemies) {
    if (enemy.dead) continue;

    const d = distance(
      game.player,
      enemy
    );

    if (d < radius) {

      /*
        O inimigo fica desacelerado.
      */

      enemy.shadowSlow =
        slowAmount;

      /*
        Dano por segundo.
      */

      damageEnemy(
        enemy,
        25 * dt
      );
    }
  }

  /*
    Efeito visual do vórtice.
  */

  game.effects.push({
    type: "shadowAura",

    x: game.player.x,
    y: game.player.y,

    radius,

    timer: 0.02,
  });
}

  function updateEnemies(dt) {
    const game = gameRef.current;

    for (const enemy of game.enemies) {
      if (enemy.dead) continue;

      if (enemy.frozen > 0) {
        enemy.frozen -= dt;
        continue;
      }

      const angle = Math.atan2(
        game.player.y - enemy.y,
        game.player.x - enemy.x
      );

        enemy.x +=
          Math.cos(angle) *
          enemy.speed *
          dt;

        enemy.y +=
          Math.sin(angle) *
          enemy.speed *
          dt;

      const d = distance(enemy, game.player);

      if (d < 28) {
        game.player.hp -= 10 * dt;
      }
    }

    game.enemies = game.enemies.filter(
      (enemy) => !enemy.dead
    );
  }

  function spawnEnemies(dt) {
    const game = gameRef.current;

    game.spawnTimer -= dt;

    if (game.spawnTimer <= 0) {
      const amount = Math.min(
        1 + Math.floor(game.time / 30),
        8
      );

      for (let i = 0; i < amount; i++) {
        game.enemies.push(
          randomEnemyAround(game.player)
        );
      }

      game.spawnTimer = Math.max(
        0.4,
        2.2 - game.time / 100
      );
    }
  }

  function spawnChest(dt) {
    const game = gameRef.current;

    game.chestTimer -= dt;

    if (game.chestTimer <= 0) {
      const angle = Math.random() * Math.PI * 2;

      const distanceFromPlayer =
        300 + Math.random() * 500;

      game.chests.push({
        x:
          game.player.x +
          Math.cos(angle) *
            distanceFromPlayer,

        y:
          game.player.y +
          Math.sin(angle) *
            distanceFromPlayer,

        type: Math.floor(Math.random() * 5),
        opened: false,
      });

      game.chestTimer = 20;
    }
  }

  function checkChests() {
    const game = gameRef.current;

    for (const chest of game.chests) {
      if (chest.opened) continue;

      if (
        distance(game.player, chest) < 40
      ) {
        chest.opened = true;

        switch (chest.type) {
          case 0:
            game.xpMultiplier = 2;

            setTimeout(() => {
              game.xpMultiplier = 1;
            }, 15000);

            break;

          case 1:
            game.player.damageMultiplier = 2;

            setTimeout(() => {
              game.player.damageMultiplier = 1;
            }, 15000);

            break;

          case 2:
            game.player.xp =
              game.player.xpNeeded;

            break;

          case 3:
            game.player.hp = game.player.maxHp;

            break;

          default:
            break;
        }
        case 4:

  /*
    BOMBA ATÔMICA

    Mata todos os inimigos
    atualmente presentes no mapa.
  */

  for (
    const enemy of game.enemies
  ) {
    if (!enemy.dead) {
      killEnemy(enemy);
    }
  }

  game.bombsUsed++;

  game.effects.push({
    type: "nuclear",
    x: game.player.x,
    y: game.player.y,
    timer: 2,
  });

  break;
      }
    }
  }

  function update(dt) {
    const game = gameRef.current;

    if (!game.running || game.paused) return;

    game.time += dt;

    const keys = game.keys;

    let dx = 0;
    let dy = 0;

    if (keys["w"] || keys["ArrowUp"]) dy -= 1;
    if (keys["s"] || keys["ArrowDown"]) dy += 1;
    if (keys["a"] || keys["ArrowLeft"]) dx -= 1;
    if (keys["d"] || keys["ArrowRight"]) dx += 1;

    if (dx !== 0 || dy !== 0) {
      const length = Math.hypot(dx, dy);

      dx /= length;
      dy /= length;

      game.player.x +=
        dx * game.player.speed * dt;

      game.player.y +=
        dy * game.player.speed * dt;
    }

    game.camera.x +=
      (game.player.x - game.camera.x) *
      8 *
      dt;

    game.camera.y +=
      (game.player.y - game.camera.y) *
      8 *
      dt;

    game.basicTimer -= dt;
    game.fireTimer -= dt;
    game.iceTimer -= dt;
    game.lightningTimer -= dt;

    /*
      TIRO PADRÃO.
      Não depende do nível das outras magias.
    */

    if (game.basicTimer <= 0) {
      fireBasicShot();
      game.basicTimer = 0.65;
    }

    if (
      game.spells.fire > 0 &&
      game.fireTimer <= 0
    ) {
      castFire();
      game.fireTimer = 1.5;
    }

    if (
      game.spells.ice > 0 &&
      game.iceTimer <= 0
    ) {
      castIce();
      game.iceTimer = 2.8;
    }

    if (
      game.spells.lightning > 0 &&
      game.lightningTimer <= 0
    ) {
      castLightning();
      game.lightningTimer = 4;
    }

    spawnEnemies(dt);
    spawnChest(dt);

    updateEnemies(dt);
    updateProjectiles(dt);
    updateOrbitBalls(dt);
    updateFamiliars(dt);
    updateShadow(dt);

    checkChests();

    for (const effect of game.effects) {
      effect.timer -= dt;
    }

    game.effects = game.effects.filter(
      (e) => e.timer > 0
    );

    if (game.player.hp <= 0) {
      game.player.hp = 0;
      game.running = false;
      setGameOver(true);
    }
  }

  function drawBackground(ctx, width, height, camera) {
    ctx.fillStyle = "#080b0d";
    ctx.fillRect(0, 0, width, height);

    /*
      Floresta procedural.
      Como a posição é calculada usando a câmera,
      a floresta acompanha o deslocamento.
    */

    const grid = 120;

    const startX =
      Math.floor(camera.x / grid) * grid - grid * 3;

    const startY =
      Math.floor(camera.y / grid) * grid - grid * 3;

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
        const seed =
          Math.abs(
            Math.sin(worldX * 12.9898 + worldY * 78.233)
          );

        const screenX =
          worldX - camera.x + width / 2;

        const screenY =
          worldY - camera.y + height / 2;

        if (seed > 0.55) {
          ctx.fillStyle = "#111b15";

          ctx.beginPath();
          ctx.moveTo(screenX, screenY + 40);
          ctx.lineTo(screenX - 22, screenY - 15);
          ctx.lineTo(screenX - 5, screenY - 8);
          ctx.lineTo(screenX - 10, screenY - 45);
          ctx.lineTo(screenX + 10, screenY - 45);
          ctx.lineTo(screenX + 5, screenY - 8);
          ctx.lineTo(screenX + 22, screenY - 15);
          ctx.closePath();

          ctx.fill();
        }
      }
    }

    /*
      Pequenas partículas de névoa.
    */

    for (let i = 0; i < 35; i++) {
      const x =
        ((i * 271 - camera.x * 0.2) %
          (width + 200)) -
        100;

      const y =
        ((i * 149 - camera.y * 0.15) %
          (height + 200)) -
        100;

      ctx.fillStyle = "rgba(100,120,120,0.08)";

      ctx.beginPath();
      ctx.arc(x, y, 25, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function worldToScreen(x, y, camera, width, height) {
    return {
      x: x - camera.x + width / 2,
      y: y - camera.y + height / 2,
    };
  }

  function drawPlayer(
    ctx,
    player,
    camera,
    width,
    height
  ) {
    const p = worldToScreen(
      player.x,
      player.y,
      camera,
      width,
      height
    );

    ctx.save();

    ctx.translate(p.x, p.y);

    /*
      Sombra.
    */

    ctx.fillStyle = "rgba(0,0,0,0.5)";

    ctx.beginPath();
    ctx.ellipse(
      0,
      22,
      25,
      8,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    /*
      Capa.
    */

    ctx.fillStyle = "#09080c";

    ctx.beginPath();
    ctx.moveTo(-17, -2);
    ctx.lineTo(-30, 32);
    ctx.quadraticCurveTo(
      0,
      45,
      30,
      32
    );
    ctx.lineTo(17, -2);
    ctx.closePath();
    ctx.fill();

    /*
      Corpo.
    */

    ctx.fillStyle = "#17131e";

    ctx.beginPath();
    ctx.moveTo(-12, -2);
    ctx.lineTo(-15, 24);
    ctx.lineTo(15, 24);
    ctx.lineTo(12, -2);
    ctx.closePath();
    ctx.fill();

    /*
      Cabeça.
    */

    ctx.fillStyle = "#d5b5a4";

    ctx.beginPath();
    ctx.arc(
      0,
      -14,
      10,
      0,
      Math.PI * 2
    );
    ctx.fill();

    /*
      Chapéu.
    */

    ctx.fillStyle = "#0a080e";

    ctx.beginPath();
    ctx.moveTo(-19, -20);
    ctx.lineTo(19, -20);
    ctx.lineTo(5, -25);
    ctx.lineTo(2, -42);
    ctx.lineTo(-3, -42);
    ctx.lineTo(-7, -25);
    ctx.closePath();
    ctx.fill();

    /*
      Olhos mágicos.
    */

    ctx.fillStyle = "#b56cff";

    ctx.fillRect(-5, -15, 3, 2);
    ctx.fillRect(2, -15, 3, 2);

    /*
      Cajado.
    */

    ctx.strokeStyle = "#563d2b";
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(18, 25);
    ctx.lineTo(28, -25);
    ctx.stroke();

    ctx.fillStyle = "#9d62ff";

    ctx.beginPath();
    ctx.arc(
      28,
      -27,
      4,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.restore();
  }

  function drawEnemy(
    ctx,
    enemy,
    camera,
    width,
    height
  ) {
    const p = worldToScreen(
      enemy.x,
      enemy.y,
      camera,
      width,
      height
    );

    ctx.save();

    ctx.translate(p.x, p.y);

    /*
      Corpo do bruxo inimigo.
    */

    ctx.fillStyle = enemy.color;

    ctx.beginPath();
    ctx.moveTo(
      -enemy.size / 2,
      0
    );

    ctx.lineTo(
      -enemy.size,
      enemy.size * 1.5
    );

    ctx.quadraticCurveTo(
      0,
      enemy.size * 2,
      enemy.size,
      enemy.size * 1.5
    );

    ctx.lineTo(
      enemy.size / 2,
      0
    );

    ctx.closePath();

    ctx.fill();

    /*
      Cabeça.
    */

    ctx.fillStyle = "#6d5960";

    ctx.beginPath();
    ctx.arc(
      0,
      -enemy.size / 2,
      enemy.size / 2.2,
      0,
      Math.PI * 2
    );

    ctx.fill();

    /*
      Chapéu.
    */

    ctx.fillStyle = "#09070b";

    ctx.beginPath();
    ctx.moveTo(
      -enemy.size,
      -enemy.size / 2
    );

    ctx.lineTo(
      enemy.size,
      -enemy.size / 2
    );

    ctx.lineTo(
      0,
      -enemy.size * 2
    );

    ctx.closePath();

    ctx.fill();

    /*
      Olhos.
    */

    ctx.fillStyle = "#d85cff";

    ctx.fillRect(
      -enemy.size / 4,
      -enemy.size / 2,
      3,
      2
    );

    ctx.fillRect(
      enemy.size / 8,
      -enemy.size / 2,
      3,
      2
    );

    /*
      Barra de vida.
    */

    ctx.fillStyle = "#30151b";

    ctx.fillRect(
      -enemy.size,
      -enemy.size * 2.3,
      enemy.size * 2,
      4
    );

    ctx.fillStyle = "#b63c58";

    ctx.fillRect(
      -enemy.size,
      -enemy.size * 2.3,
      enemy.size *
        2 *
        clamp(enemy.hp / enemy.maxHp, 0, 1),
      4
    );

    if (enemy.frozen > 0) {
      ctx.strokeStyle = "#70dfff";
      ctx.lineWidth = 3;

      ctx.beginPath();
      ctx.arc(
        0,
        0,
        enemy.size * 1.4,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawProjectiles(
    ctx,
    game,
    camera,
    width,
    height
  ) {
    for (const projectile of game.projectiles) {
      const p = worldToScreen(
        projectile.x,
        projectile.y,
        camera,
        width,
        height
      );

      ctx.save();

      ctx.shadowBlur = 15;
      ctx.shadowColor = projectile.color;

      ctx.fillStyle = projectile.color;

      ctx.beginPath();

      ctx.arc(
        p.x,
        p.y,
        projectile.radius,
        0,
        Math.PI * 2
      );

      ctx.fill();

      ctx.restore();
    }
  }

  function drawOrbits(
    ctx,
    game,
    camera,
    width,
    height
  ) {
    for (const ball of game.orbitBalls) {
      const p = worldToScreen(
        ball.x,
        ball.y,
        camera,
        width,
        height
      );

      ctx.save();

      ctx.shadowBlur = 25;
      ctx.shadowColor = "#ff6b18";

      ctx.fillStyle = "#ff7b22";

      ctx.beginPath();

      ctx.arc(
        p.x,
        p.y,
        10,
        0,
        Math.PI * 2
      );

      ctx.fill();

      ctx.restore();
    }
  }

  function drawFamiliars(
    ctx,
    game,
    camera,
    width,
    height
  ) {
    for (const familiar of game.familiars) {
      const p = worldToScreen(
        familiar.x,
        familiar.y,
        camera,
        width,
        height
      );

      ctx.save();

      ctx.fillStyle = "#d9b4ff";

      ctx.beginPath();
      ctx.arc(
        p.x,
        p.y,
        11,
        0,
        Math.PI * 2
      );

      ctx.fill();

      ctx.fillStyle = "#38214d";

      ctx.beginPath();
      ctx.arc(
        p.x,
        p.y,
        6,
        0,
        Math.PI * 2
      );

      ctx.fill();

      ctx.restore();
    }
  }

  function drawChests(
    ctx,
    game,
    camera,
    width,
    height
  ) {
    for (const chest of game.chests) {
      if (chest.opened) continue;

      const p = worldToScreen(
        chest.x,
        chest.y,
        camera,
        width,
        height
      );

      ctx.save();

      ctx.fillStyle = "#9c622d";

      ctx.fillRect(
        p.x - 18,
        p.y - 12,
        36,
        25
      );

      ctx.fillStyle = "#d89b3d";

      ctx.fillRect(
        p.x - 18,
        p.y - 12,
        36,
        7
      );

      ctx.fillStyle = "#ffe28a";

      ctx.fillRect(
        p.x - 3,
        p.y - 3,
        6,
        8
      );

      ctx.restore();
    }
  }

  function drawEffects(
    ctx,
    game,
    camera,
    width,
    height
  ) {
    for (const effect of game.effects) {
      const p = worldToScreen(
        effect.x,
        effect.y,
        camera,
        width,
        height
      );

      ctx.save();

      if (effect.type === "lightning") {
        ctx.strokeStyle = "#a9eaff";
        ctx.lineWidth = 5;

        ctx.beginPath();

        ctx.moveTo(
          p.x,
          p.y - 100
        );

        ctx.lineTo(
          p.x - 15,
          p.y - 45
        );

        ctx.lineTo(
          p.x + 10,
          p.y - 20
        );

        ctx.lineTo(
          p.x - 8,
          p.y + 30
        );

        ctx.stroke();
      }

      if (effect.type === "ice") {
        ctx.strokeStyle = "#6be5ff";
        ctx.lineWidth = 4;

        ctx.beginPath();

        ctx.arc(
          p.x,
          p.y,
          28,
          0,
          Math.PI * 2
        );

        ctx.stroke();
      }

      if (effect.type === "shadowAura") {
        ctx.strokeStyle =
          "rgba(110,60,180,0.5)";

        ctx.lineWidth = 8;

        ctx.beginPath();

        ctx.arc(
          p.x,
          p.y,
          effect.radius,
          0,
          Math.PI * 2
        );

        ctx.stroke();
      }

      if (
        effect.type === "death" ||
        effect.type === "basic" ||
        effect.type === "fire" ||
        effect.type === "orbit" ||
        effect.type === "familiar"
      ) {
        ctx.strokeStyle =
          effect.type === "fire"
            ? "#ff6824"
            : "#d7a8ff";

        ctx.lineWidth = 3;

        ctx.beginPath();

        ctx.arc(
          p.x,
          p.y,
          20 *
            (1.5 - effect.timer),
          0,
          Math.PI * 2
        );

        ctx.stroke();
      }

      ctx.restore();
    }
  }

  function draw() {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    const width = canvas.width;
    const height = canvas.height;

    const game = gameRef.current;

    ctx.clearRect(
      0,
      0,
      width,
      height
    );

    drawBackground(
      ctx,
      width,
      height,
      game.camera
    );

    drawChests(
      ctx,
      game,
      game.camera,
      width,
      height
    );

    drawSouls(
      ctx,
      game,
      game.camera,
      width,
      height
    );

    for (const enemy of game.enemies) {
      drawEnemy(
        ctx,
        enemy,
        game.camera,
        width,
        height
      );
    }

    drawOrbits(
      ctx,
      game,
      game.camera,
      width,
      height
    );

    drawFamiliars(
      ctx,
      game,
      game.camera,
      width,
      height
    );

    drawProjectiles(
      ctx,
      game,
      game.camera,
      width,
      height
    );

    drawPlayer(
      ctx,
      game.player,
      game.camera,
      width,
      height
    );

    drawEffects(
      ctx,
      game,
      game.camera,
      width,
      height
    );
  }

  useEffect(() => {
    const canvas = canvasRef.current;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    resize();

    window.addEventListener(
      "resize",
      resize
    );

    const down = (event) => {
      gameRef.current.keys[
        event.key
      ] = true;
    };

    const up = (event) => {
      gameRef.current.keys[
        event.key
      ] = false;
    };

    window.addEventListener(
      "keydown",
      down
    );

    window.addEventListener(
      "keyup",
      up
    );

    let last = performance.now();

    function loop(now) {
      const dt = Math.min(
        (now - last) / 1000,
        0.05
      );

      last = now;

      update(dt);
      draw();

      setTick((v) => v + 1);

      requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);

    return () => {
      window.removeEventListener(
        "resize",
        resize
      );

      window.removeEventListener(
        "keydown",
        down
      );

      window.removeEventListener(
        "keyup",
        up
      );
    };
  }, []);

  const game = gameRef.current;

  function restart() {
    window.location.reload();
  }

  return (
    <div className="game">
      <canvas ref={canvasRef} />

      <div className="hud">
        <div className="top-left">
          <div className="level">
            LVL {game.player.level}
          </div>

          <div className="xp-bar">
            <div
              className="xp-fill"
              style={{
                width: `${
                  (game.player.xp /
                    game.player.xpNeeded) *
                  100
                }%`,
              }}
            />
          </div>

          <div className="xp-text">
            {Math.floor(game.player.xp)} /
            {game.player.xpNeeded} XP
          </div>
        </div>

        <div className="hp-container">
          <div className="hp-label">
            VIDA
          </div>

          <div className="hp-bar">
            <div
              className="hp-fill"
              style={{
                width: `${
                  (game.player.hp /
                    game.player.maxHp) *
                  100
                }%`,
              }}
            />
          </div>
        </div>

        <div className="time">
          {Math.floor(game.time)}s
        </div>

        <div className="controls">
          <b>WASD</b> / <b>SETAS</b> para mover
          <br />
          As magias atacam automaticamente
        </div>

        <div className="spell-list">
          {Object.entries(game.spells)
            .filter(([, level]) => level > 0)
            .map(([key, level]) => (
              <div
                className="spell-mini"
                key={key}
              >
                <span>
                  {SPELLS[key].icon}
                </span>

                <span>
                  {SPELLS[key].name}
                </span>

                <b>
                  {level}
                </b>
              </div>
            ))}
        </div>
      </div>

      {levelUpOptions.length > 0 && (
        <div className="level-overlay">
          <div className="spellbook">
            <div className="book-page left-page">
              <div className="book-title">
                ✦ GRIMÓRIO ✦
              </div>

              <p className="book-subtitle">
                Escolha uma magia
              </p>

              <div className="choices">
                {levelUpOptions.map(
                  (spellKey) => (
                    <button
                      className="spell-choice"
                      key={spellKey}
                      onClick={() =>
                        chooseSpell(
                          spellKey
                        )
                      }
                    >
                      <span className="choice-icon">
                        {
                          SPELLS[
                            spellKey
                          ].icon
                        }
                      </span>

                      <span className="choice-name">
                        {
                          SPELLS[
                            spellKey
                          ].name
                        }
                      </span>

                      <span className="choice-level">
                        Nv.{" "}
                        {game.spells[
                          spellKey
                        ] + 1}
                        /
                        {
                          SPELLS[
                            spellKey
                          ].max
                        }
                      </span>

                      <span className="choice-description">
                        {
                          SPELLS[
                            spellKey
                          ].description
                        }
                      </span>
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="book-page right-page">
              <div className="book-title">
                ✧ FUSÕES ✧
              </div>

              <p className="book-subtitle">
                Combinações descobertas
              </p>

              {COMBINATIONS.map(
                (combo) => (
                  <div
                    className="combination"
                    key={combo.name}
                  >
                    <div className="combo-icon">
                      {combo.icon}
                    </div>

                    <div>
                      <strong>
                        {combo.name}
                      </strong>

                      <div className="combo-spells">
                        {combo.a} +{" "}
                        {combo.b}
                      </div>

                      <div className="combo-requirement">
                        🔒{" "}
                        {combo.requirement}
                      </div>
                    </div>
                  </div>
                )
              )}

              <div className="future">
                As fusões serão
                desbloqueadas em uma
                próxima etapa...
              </div>
            </div>
          </div>
        </div>
        {artifactChoices.length > 0 && (
  <div className="level-overlay">

    <div className="artifact-book">

      <div className="artifact-title">
        👑 RECOMPENSA DO BOSS 👑
      </div>

      <div className="artifact-subtitle">
        O Bruxo Primordial foi derrotado.
        <br />
        Escolha um artefato.
      </div>

      <div className="artifact-grid">

        {artifactChoices.map(
          (artifactKey) => {

            const artifact =
              ARTIFACTS[
                artifactKey
              ];

            return (
              <button
                key={artifactKey}
                className="artifact-card"
                onClick={() =>
                  chooseArtifact(
                    artifactKey
                  )
                }
              >

                <div className="artifact-icon">
                  {artifact.icon}
                </div>

                <div className="artifact-name">
                  {artifact.name}
                </div>

                <div className="artifact-description">
                  {
                    artifact.description
                  }
                </div>

              </button>
            );
          }
        )}

      </div>

      <div className="boss-reward">
        ✦ +1 NÍVEL CONCEDIDO ✦
      </div>

    </div>

  </div>
)}
      )}

      {gameOver && (
        <div className="game-over">
          <div className="game-over-box">
            <h1>☠ FIM DA NOITE ☠</h1>

            <p>
              Você sobreviveu por{" "}
              <b>
                {Math.floor(game.time)}
              </b>{" "}
              segundos.
            </p>

            <p>
              Nível alcançado:{" "}
              <b>
                {game.player.level}
              </b>
            </p>

            <button onClick={restart}>
              Tentar novamente
            </button>
          </div>
        </div>
      )}
    </div>
  );
  function updateWaves() {
  const game = gameRef.current;

  const newWave =
    Math.floor(
      game.time / WAVE_DURATION
    ) + 1;

  if (
    newWave !== game.wave
  ) {
    game.wave = newWave;

    /*
      A cada 5 waves nasce um boss.
    */

    if (
      game.wave %
        BOSS_EVERY_WAVES ===
        0 &&
      !game.bossSpawnedThisWave
    ) {
      game.enemies.push(
        createBoss(
          game.player
        )
      );

      game.bossSpawnedThisWave =
        true;

      game.effects.push({
        type: "bossWarning",

        x: game.player.x,
        y: game.player.y,

        timer: 3,
      });
    }
  }

  /*
    Quando começa uma nova wave,
    libera o próximo boss.
  */

  if (
    game.wave %
      BOSS_EVERY_WAVES !==
    0
  ) {
    game.bossSpawnedThisWave =
      false;
  }
}

function updateWaves() {
  const game = gameRef.current;

  const newWave =
    Math.floor(
      game.time / WAVE_DURATION
    ) + 1;

  if (
    newWave !== game.wave
  ) {
    game.wave = newWave;

    /*
      A cada 5 waves nasce um boss.
    */

    if (
      game.wave %
        BOSS_EVERY_WAVES ===
        0 &&
      !game.bossSpawnedThisWave
    ) {
      game.enemies.push(
        createBoss(
          game.player
        )
      );

      game.bossSpawnedThisWave =
        true;

      game.effects.push({
        type: "bossWarning",

        x: game.player.x,
        y: game.player.y,

        timer: 3,
      });
    }
  }

  /*
    Quando começa uma nova wave,
    libera o próximo boss.
  */

  if (
    game.wave %
      BOSS_EVERY_WAVES !==
    0
  ) {
    game.bossSpawnedThisWave =
      false;
  }
}

generateArtifactChoices()

function chooseArtifact(
  artifactKey
) {
  const game = gameRef.current;

  if (
    game.artifacts.includes(
      artifactKey
    )
  ) {
    /*
      Se futuramente quisermos permitir
      evolução dos artefatos, podemos
      colocar níveis aqui.
    */

    game.paused = false;
    game.artifactPaused = false;

    setArtifactChoices([]);

    return;
  }

  game.artifacts.push(
    artifactKey
  );

  applyArtifact(
    artifactKey
  );

  game.paused = false;
  game.artifactPaused = false;

  setArtifactChoices([]);
}

function ricochetProjectile(
  projectile,
  enemy
) {
  const game = gameRef.current;

  if (!game.ricochet) {
    return false;
  }

  if (
    projectile.ricochets >= 5
  ) {
    return false;
  }

  const next =
    getClosestEnemy(
      enemy.x,
      enemy.y
    );

  if (!next || next === enemy) {
    return false;
  }

  const angle =
    Math.atan2(
      next.y - enemy.y,
      next.x - enemy.x
    );

  projectile.x =
    enemy.x;

  projectile.y =
    enemy.y;

  projectile.vx =
    Math.cos(angle) * 500;

  projectile.vy =
    Math.sin(angle) * 500;

  projectile.ricochets =
    (projectile.ricochets || 0) + 1;

  return true;
}

if (
  game.ricochet &&
  projectile.type !== "basic"
) {
  const bounced =
    ricochetProjectile(
      projectile,
      enemy
    );

  if (bounced) {
    break;
  }
}

if (
  game.ricochet &&
  projectile.type !== "basic"
) {
  const bounced =
    ricochetProjectile(
      projectile,
      enemy
    );

  if (bounced) {
    break;
  }
}

function updateRepulsionRune(
  dt
) {
  const game = gameRef.current;

  if (
    !game.hasRepulsionRune
  ) {
    return;
  }

  game.artifactTimers.repulsion -= dt;

  if (
    game.artifactTimers.repulsion <= 0
  ) {
    game.artifactTimers.repulsion =
      15;

    const radius = 180;

    game.effects.push({
      type: "repulsionRune",

      x: game.player.x,
      y: game.player.y,

      radius,

      timer: 2,
    });

    for (
      const enemy of game.enemies
    ) {
      const d =
        distance(
          game.player,
          enemy
        );

      if (d < radius) {

        const angle =
          Math.atan2(
            enemy.y -
              game.player.y,

            enemy.x -
              game.player.x
          );

        const force =
          (radius - d) * 2;

        enemy.x +=
          Math.cos(angle) *
          force;

        enemy.y +=
          Math.sin(angle) *
          force;
      }
    }
  }
}

function updateHealingRune(
  dt
) {
  const game = gameRef.current;

  if (
    !game.hasHealingRune
  ) {
    return;
  }

  game.artifactTimers.healing -= dt;

  if (
    game.artifactTimers.healing <= 0
  ) {
    game.artifactTimers.healing =
      15;

    game.player.hp =
      Math.min(
        game.player.maxHp,
        game.player.hp + 35
      );

    game.effects.push({
      type: "healingRune",

      x: game.player.x,
      y: game.player.y,

      radius: 100,

      timer: 2,
    });
  }
}

updateHealingRune(dt);

function updateStorm(
  dt
) {
  const game = gameRef.current;

  if (
    !game.hasStormSymbol
  ) {
    return;
  }

  game.artifactTimers.storm -= dt;

  if (
    game.artifactTimers.storm <= 0
  ) {
    game.artifactTimers.storm =
      10;

    /*
      A chuva dura 5 segundos.
    */

    game.stormActive = true;

    game.stormTimer = 5;
  }

  if (game.stormActive) {

    game.stormTimer -= dt;

    /*
      Enquanto chove, inimigos
      próximos ficam molhados.
    */

    for (
      const enemy of game.enemies
    ) {
      if (enemy.dead) continue;

      const d =
        distance(
          game.player,
          enemy
        );

      if (d < 450) {
        enemy.wet = 10;
      }
    }

    if (
      game.stormTimer <= 0
    ) {
      game.stormActive = false;
    }
  }

  /*
    Diminui o efeito molhado.
  */

  for (
    const enemy of game.enemies
  ) {
    if (enemy.wet > 0) {
      enemy.wet -= dt;
    }
  }
}

updateStorm(dt);

game.lightningTimer =
  game.stormActive
    ? 0.8
    : 4;



updateRepulsionRune(dt);
}

export default App;

function lightningChain(
  source
) {
  const game = gameRef.current;

  if (
    !game.stormActive
  ) {
    return;
  }

  /*
    Procura os 5 inimigos
    mais próximos do alvo.
  */

  const targets =
    [...game.enemies]
      .filter(
        (enemy) =>
          !enemy.dead &&
          enemy !== source &&
          enemy.wet > 0
      )
      .sort(
        (a, b) =>
          distance(
            source,
            a
          ) -
          distance(
            source,
            b
          )
      )
      .slice(0, 5);

  for (
    const enemy of targets
  ) {

    game.effects.push({
      type: "chainLightning",

      x: enemy.x,
      y: enemy.y,

      timer: 0.5,
    });

    /*
      A corrente também mata.
    */

    killEnemy(enemy);
  }
}

if (
  game.stormActive &&
  enemy.wet > 0
) {
  lightningChain(enemy);
}

function drawStorm(
  ctx,
  game,
  width,
  height
) {
  if (!game.stormActive) {
    return;
  }

  ctx.save();

  ctx.fillStyle =
    "rgba(80,120,180,0.08)";

  ctx.fillRect(
    0,
    0,
    width,
    height
  );

  ctx.strokeStyle =
    "rgba(150,200,255,0.35)";

  ctx.lineWidth = 1;

  for (
    let i = 0;
    i < 120;
    i++
  ) {
    const x =
      (i * 71) %
      width;

    const y =
      (i * 113 +
        performance.now() * 0.4) %
      height;

    ctx.beginPath();

    ctx.moveTo(
      x,
      y
    );

    ctx.lineTo(
      x - 5,
      y + 18
    );

    ctx.stroke();
  }

  ctx.restore();
}

drawStorm(
  ctx,
  game,
  width,
  height
);


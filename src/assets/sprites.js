/**
 * GERENCIADOR DE SPRITES
 * 
 * Permite registrar e carregar sprites futuramente para:
 * - characters (jogador, bruxos)
 * - enemies (inimigos comuns, bosses)
 * - spells (projéteis, magias)
 * - familiars (espíritos auxiliares)
 * - items (baús, orbes, moedas)
 * - effects (explosões, auras)
 * - background (texturas de floresta, névoa)
 * 
 * Se uma imagem não estiver carregada ou pronta, executa o fallback via Canvas API procedural.
 */

export const SPRITES = {
  player: null,
  /* 10 PERSONAGENS */
  char_ignis: null,
  char_eira: null,
  char_voltis: null,
  char_nox: null,
  char_pyra: null,
  char_morrigan: null,
  char_magmus: null,
  char_astrion: null,
  char_sylva: null,
  char_nymira: null,
  /* INIMIGOS E BOSS */
  darkWitch: null,
  darkWizard: null,
  corruptedMage: null,
  spectralWitch: null,
  boss: null,
  /* MAGIAS */
  fireBall: null,
  iceRay: null,
  lightningBolt: null,
  shadowAura: null,
  orbitBall: null,
  familiar: null,
  lavaPool: null,
  meteor: null,
  vines: null,
  humidityCloud: null,
  /* ITENS E RUNAS */
  chest: null,
  soul: null,
  forestTile: null,
  nukeFlash: null,
  repulsionRune: null,
  healingRune: null,
  /* 5 FUSÕES SUPREMAS */
  fusionVapor: null,
  fusionFloresta: null,
  fusionPantano: null,
  fusionCataclismo: null,
  fusionAbismoVivo: null,
  electricPlant: null,
  swampPool: null,
};

/**
 * Desenha o sprite se estiver carregado e pronto.
 * Caso contrário, executa a função de renderização procedural via Canvas.
 */
export function drawSpriteOrFallback(ctx, spriteKey, drawFallbackFn, ...args) {
  const sprite = SPRITES[spriteKey];
  if (sprite && sprite.complete && sprite.naturalWidth !== 0) {
    try {
      // Exemplo generico de desenho do sprite se fornecido
      const [x, y, w, h] = args;
      ctx.drawImage(sprite, x - w / 2, y - h / 2, w, h);
      return true;
    } catch (e) {
      // Se houver qualquer falha ao desenhar imagem, recorre ao fallback procedural
    }
  }
  
  // Executa o fallback procedural do Canvas
  if (typeof drawFallbackFn === "function") {
    drawFallbackFn();
  }
  return false;
}

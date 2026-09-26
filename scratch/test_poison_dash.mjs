import assert from 'node:assert';
import poisonAbility, {
  TOXIC_DASH_COOLDOWN,
  TOXIC_DASH_DISTANCE,
  TOXIC_DASH_POISON_DURATION,
  TOXIC_DASH_TICK_RATE,
  TOXIC_DASH_TICK_DAMAGE_FRACTION
} from '../src/swords/poison/poison.ability.js';

console.log('Testing Poison Toxic Dash [Z] fix...');

// Setup mock window & Killstreak environment
globalThis.window = {
  Killstreak: {
    Config: {
      MAPS: {
        COMBAT: {
          width: 5000,
          height: 5000,
          trees: [],
          houses: []
        }
      }
    },
    Entities: {
      Particle: class {
        constructor(x, y, vx, vy, color, size, life) {
          this.x = x;
          this.y = y;
        }
      },
      FloatingText: class {
        constructor(x, y, text, color, size) {
          this.text = text;
        }
      }
    }
  }
};

function createMockGame(overrides = {}) {
  return {
    state: 'COMBAT',
    currentArea: 'COMBAT',
    isGameOver: false,
    isCutsceneActive: false,
    toxicDashCooldown: 0,
    saveData: { settings: { screenShake: true, damageNumbers: true } },
    input: { up: false, down: false, left: false, right: false },
    particles: [],
    floatingTexts: [],
    activePoisonDots: [],
    npcs: [
      { id: 'npc_1', x: 1100, y: 1000, radius: 25, hp: 100000, isDead: false }
    ],
    camera: {
      x: 1000,
      y: 1000,
      shake(intensity, duration) { this.shook = true; },
      follow(x, y, mw, mh, dt) { this.x = x; this.y = y; }
    },
    player: {
      x: 1000,
      y: 1000,
      radius: 20,
      damage: 12000,
      isSwordEquipped: true,
      swordId: 'poison',
      phase: { phase: 4, damage: 12000 },
      angle: 0,
      knockbackX: 50,
      knockbackY: 50
    },
    ...overrides
  };
}

// TEST 1: Stationary player dashes in facing angle (0 -> rightwards) on clear field
{
  const game = createMockGame();
  const res = poisonAbility.activate(game);
  assert.strictEqual(res, true, 'Toxic Dash should activate');
  assert.strictEqual(game.toxicDashCooldown, TOXIC_DASH_COOLDOWN, 'Cooldown set');
  assert.strictEqual(Number.isFinite(game.player.x), true, 'player.x must be finite');
  assert.strictEqual(Number.isFinite(game.player.y), true, 'player.y must be finite');
  assert.strictEqual(game.player.x, 1300, 'Stationary angle 0 should dash +300 px right to 1300');
  assert.strictEqual(game.player.y, 1000, 'player.y should remain 1000');
  assert.strictEqual(game.player.knockbackX, 0, 'KnockbackX cleared');
  assert.strictEqual(game.player.knockbackY, 0, 'KnockbackY cleared');
  assert.strictEqual(game.activePoisonDots.length, 1, 'NPC along path received poison DoT');
  assert.strictEqual(game.activePoisonDots[0].npcId, 'npc_1');
  assert.strictEqual(game.activePoisonDots[0].tickDamage, 3000);
  console.log('  ✓ Test 1 Passed: Stationary dash in facing angle without NaN');
}

// TEST 2: Moving player dashes in input movement direction (input: left)
{
  const game = createMockGame();
  game.input.left = true;
  const res = poisonAbility.activate(game);
  assert.strictEqual(res, true);
  assert.strictEqual(game.player.x, 700, 'Should dash left 300px from 1000 to 700');
  assert.strictEqual(game.player.y, 1000);
  assert.strictEqual(Number.isFinite(game.player.x), true);
  console.log('  ✓ Test 2 Passed: Moving player dashes in input direction');
}

// TEST 3: Moving diagonal (up + right)
{
  const game = createMockGame();
  game.input.up = true;
  game.input.right = true;
  const res = poisonAbility.activate(game);
  assert.strictEqual(res, true);
  const expectedAngle = Math.atan2(-1, 1);
  const expectedX = 1000 + Math.cos(expectedAngle) * 300;
  const expectedY = 1000 + Math.sin(expectedAngle) * 300;
  assert.ok(Math.abs(game.player.x - expectedX) < 1, 'Correct diagonal X');
  assert.ok(Math.abs(game.player.y - expectedY) < 1, 'Correct diagonal Y');
  console.log('  ✓ Test 3 Passed: Moving diagonal dashes correctly');
}

// TEST 4: Boundary clamping near map boundary
{
  const game = createMockGame();
  game.player.x = 4900;
  game.player.y = 2500;
  game.input.right = true; // dashing towards right boundary at 5000
  const res = poisonAbility.activate(game);
  assert.strictEqual(res, true);
  const margin = game.player.radius + 15; // 35
  const maxBoundary = 5000 - margin; // 4965
  assert.strictEqual(game.player.x, maxBoundary, 'Clamped to right boundary');
  assert.ok(game.player.x <= maxBoundary, 'Never exceeds map boundary');
  console.log('  ✓ Test 4 Passed: Boundary clamping prevents out-of-map glitch');
}

// TEST 5: Obstacle collision halts dash before tree
{
  window.Killstreak.Config.MAPS.COMBAT.trees = [{ x: 1200, y: 1000, radius: 40 }];
  const game = createMockGame();
  // Tree is at x=1200, y=1000, radius=40. Player radius=20. Min safe dist = 60.
  // Player at x=1050 dashing rightwards (+300) would go to 1350, passing through tree.
  game.player.x = 1050;
  game.player.y = 1000;
  game.player.angle = 0;
  const res = poisonAbility.activate(game);
  assert.strictEqual(res, true);
  // Dash should have stopped before hitting tree obstacle (dist < 60)
  const distToTree = Math.hypot(game.player.x - 1200, game.player.y - 1000);
  assert.ok(distToTree >= 60, `Player stopped before tree (dist: ${distToTree} >= 60)`);
  assert.ok(game.player.x < 1200, 'Player did not clip through tree');
  console.log('  ✓ Test 5 Passed: Obstacle collision halts dash before circle obstacle');
}

// TEST 6: Obstacle collision halts dash before house box
{
  window.Killstreak.Config.MAPS.COMBAT.houses = [{ x: 800, y: 800, width: 200, height: 200 }];
  const game = createMockGame();
  // House at x=800..1000, y=800..1000.
  // Player at x=1150, y=900 dashing left towards house (-300) would go to 850 (inside house)
  game.player.x = 1150;
  game.player.y = 900;
  game.input.left = true;
  const res = poisonAbility.activate(game);
  assert.strictEqual(res, true);
  // Player must stop outside house (x >= 1000 + player.radius)
  assert.ok(game.player.x >= 1000, `Player stopped outside house box (x=${game.player.x} >= 1000)`);
  console.log('  ✓ Test 6 Passed: Obstacle collision halts dash before box obstacle');
}

console.log('All Poison Toxic Dash tests passed successfully!');

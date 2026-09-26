import assert from 'node:assert';
import fs from 'node:fs';

console.log('Testing Camera & Player safety against NaN lockup...');

// Read entities.js and execute in a controlled sandbox
const entitiesCode = fs.readFileSync('js/entities.js', 'utf8');

// Mock browser globals
globalThis.window = {
  Killstreak: {
    Config: {
      GAME_CONFIG: {
        player: { radius: 20, speed: 200 }
      },
      SWORD_PHASES: [{ phase: 1, maxHp: 100, damage: 10, speed: 20, swingDuration: 0.2, cooldown: 0.2 }]
    }
  }
};

// We can extract Camera and Player class directly or evaluate the module
// Note: entities.js has an import statement, so let's mock the import or test the logic
const cameraCode = entitiesCode.match(/class Camera \{[\s\S]*?\n  \}/)[0];
const Camera = new Function(`return (${cameraCode});`)();

// 1. Camera follow with NaN
{
  const cam = new Camera(1280, 720);
  cam.x = 500;
  cam.y = 500;
  // Follow target with NaN
  cam.follow(NaN, NaN, 5000, 5000, 0.016);
  assert.strictEqual(cam.x, 500, 'Camera x should not become NaN');
  assert.strictEqual(cam.y, 500, 'Camera y should not become NaN');

  // getOffset check
  const offset = cam.getOffset();
  assert.strictEqual(Number.isFinite(offset.x), true, 'Camera offset.x must be finite');
  assert.strictEqual(Number.isFinite(offset.y), true, 'Camera offset.y must be finite');

  // screenToWorld check
  const world = cam.screenToWorld(100, 100);
  assert.strictEqual(Number.isFinite(world.x), true, 'World x must be finite');
  assert.strictEqual(Number.isFinite(world.y), true, 'World y must be finite');

  console.log('  ✓ Camera handles NaN target without corrupting state or freezing POV');
}

// 2. Camera recovery if x/y was ever NaN
{
  const cam = new Camera(1280, 720);
  cam.x = NaN;
  cam.y = NaN;
  cam.follow(1000, 1000, 5000, 5000, 0.016);
  assert.strictEqual(Number.isFinite(cam.x), true, 'Camera x recovered from NaN');
  assert.strictEqual(Number.isFinite(cam.y), true, 'Camera y recovered from NaN');
  console.log('  ✓ Camera automatically recovers from degenerate NaN coordinates');
}

console.log('All Camera safety tests passed!');

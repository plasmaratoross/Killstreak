/**
 * Cutscene definitions — Phase 3.
 *
 * Each entry holds the dialogue and completion behaviour that used to be
 * hard-coded inside the eleven `Game.start*Cutscene()` methods and the body of
 * `Game.finishCutscene()` in js/game.js.
 *
 * Everything below was moved verbatim. `this` became the `game` parameter; no
 * line of dialogue, shake strength, particle count or colour was altered.
 *
 * `lines()` is a factory rather than a frozen literal because each entry
 * resolves its i18n keys at call time, exactly as the original methods did.
 *
 * `onFinish` is null for devourer_p17: the original finishCutscene() had no
 * guarded block for it and fell through to the default block below.
 */

import * as AchievementSystem from './AchievementSystem.js';

export const CUTSCENES = {
  aquatic_unlock: {
    type: "aquatic_unlock",

    shake: [10, 0.5],

    achieve: null,

    lines() {
      const I18n = window.Killstreak && window.Killstreak.I18n;
      return [
        {
          speaker: I18n ? I18n.t("cutscene.speaker_spring") : "PRIMORDIAL SPRING",
          text: I18n ? I18n.t("cutscene.aquatic_unlock_1") : "In the beginning, there was only silence... and a single falling drop."
        },
        {
          speaker: I18n ? I18n.t("cutscene.speaker_spring") : "PRIMORDIAL SPRING",
          text: I18n ? I18n.t("cutscene.aquatic_unlock_2") : "Two thousand five hundred souls have fallen. Their essence converges into an oceanic wellspring."
        },
        {
          speaker: I18n ? I18n.t("cutscene.speaker_aquatic_unlock") : "AQUATIC — THE DROWNING TIDE",
          text: I18n ? I18n.t("cutscene.aquatic_unlock_3") : "The quiet ripples have begun to stir. Take the blade... and let the deluge commence."
        }
      ];
    },

    onFinish(game) {
    // Re-resolve bindings that were file-scope in js/game.js.
    const Storage = window.Killstreak.Storage;
    const { Particle, FloatingText } = (window.Killstreak && window.Killstreak.Entities) || {};

    game.saveData.aquaticUnlockCutsceneSeen = true;
    Storage.save(game.saveData);

    game.camera.shake(14, 0.6);
    for (let i = 0; i < 60; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 90 + Math.random() * 200;
      const color = i % 2 === 0 ? "#06b6d4" : "#38bdf8";
      game.particles.push(
        new Particle(game.player.x, game.player.y, Math.cos(angle) * speed, Math.sin(angle) * speed, color, 4.5, 0.6)
      );
    }

    const I18n = window.Killstreak && window.Killstreak.I18n;
    game.floatingTexts.push(
      new FloatingText(game.player.x, game.player.y - 45, I18n ? I18n.t("floating.aquatic_unlocked") : "AQUATIC UNLOCKED!", "#06b6d4", 20)
    );

    if (game.callbacks.onCutsceneEnd) {
      game.callbacks.onCutsceneEnd();
    }
    if (game.callbacks.onToast) {
      const tTitle = I18n ? I18n.t("toasts.aquatic_unlock_title") : "WEAPON UNLOCKED";
      const tDesc = I18n ? I18n.t("toasts.aquatic_unlock_desc") : "Aquatic — The Drowning Tide is now available!";
      game.callbacks.onToast(tTitle, tDesc, "🌊");
    }
    return;
    }
  },

  aquatic_p13: {
    type: "aquatic_p13",

    shake: [16, 0.6],

    achieve: "aquatic_ascended",

    lines() {
      const I18n = window.Killstreak && window.Killstreak.I18n;
      return [
        {
          speaker: I18n ? I18n.t("cutscene.speaker_aquatic_p13") : "AQUATIC — OMNITIDAL",
          text: I18n ? I18n.t("cutscene.aquatic_p13_1") : "The continents submerge beneath a boundless, unforgiving abyss."
        },
        {
          speaker: I18n ? I18n.t("cutscene.speaker_aquatic_p13") : "AQUATIC — OMNITIDAL",
          text: I18n ? I18n.t("cutscene.aquatic_p13_2") : "One hundred and forty-five thousand lives swept away into the infinite tide."
        },
        {
          speaker: I18n ? I18n.t("cutscene.speaker_ocean") : "THE PRIMORDIAL OCEAN",
          text: I18n ? I18n.t("cutscene.aquatic_p13_3") : "Every drop of water in existence now answers to your pulse. Phase 13 — Omnitidal. The deluge is complete."
        }
      ];
    },

    onFinish(game) {
    // Re-resolve bindings that were file-scope in js/game.js.
    const Storage = window.Killstreak.Storage;
    const { Particle, FloatingText } = (window.Killstreak && window.Killstreak.Entities) || {};

    game.saveData.aquaticPhase13CutsceneSeen = true;
    AchievementSystem.unlockAchievement(game, "aquatic_ascended");
    Storage.save(game.saveData);

    game.camera.shake(20, 1.0);
    for (let i = 0; i < 90; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 120 + Math.random() * 280;
      const color = i % 2 === 0 ? "#ffffff" : "#06b6d4";
      game.particles.push(
        new Particle(game.player.x, game.player.y, Math.cos(angle) * speed, Math.sin(angle) * speed, color, 5.5, 0.8)
      );
    }

    const I18n = window.Killstreak && window.Killstreak.I18n;
    game.floatingTexts.push(
      new FloatingText(game.player.x, game.player.y - 45, I18n ? (I18n.getLanguage() === "vi" ? "ĐẠI HỒNG THỦY OMNITIDAL!" : "OMNITIDAL APOCALYPSE!") : "OMNITIDAL APOCALYPSE!", "#ffffff", 22)
    );

    if (game.callbacks.onCutsceneEnd) {
      game.callbacks.onCutsceneEnd();
    }
    if (game.callbacks.onToast) {
      const tTitle = I18n ? I18n.t("toasts.aquatic_p13_title") : "MAXIMUM TRANSCENDENCE";
      const tDesc = I18n ? I18n.t("toasts.aquatic_p13_desc") : "Phase 13: Omnitidal — Primordial ocean divinity reached!";
      game.callbacks.onToast(tTitle, tDesc, "🌊");
    }
    return;
    }
  },

  soil_unlock: {
    type: "soil_unlock",

    shake: [10, 0.5],

    achieve: null,

    lines() {
      const I18n = window.Killstreak && window.Killstreak.I18n;
      return [
        {
          speaker: I18n ? I18n.t("cutscene.speaker_core") : "EARTHEN CORE",
          text: I18n ? I18n.t("cutscene.soil_unlock_1") : "Deep beneath the soil, ancient roots awaken."
        },
        {
          speaker: I18n ? I18n.t("cutscene.speaker_core") : "EARTHEN CORE",
          text: I18n ? I18n.t("cutscene.soil_unlock_2") : "Three thousand five hundred battles have nourished the earth beneath your feet."
        },
        {
          speaker: I18n ? I18n.t("cutscene.speaker_soil") : "SOIL",
          text: I18n ? I18n.t("cutscene.soil_unlock_3") : "I'm... just dirt. But I'll protect what I can."
        },
        {
          speaker: I18n ? I18n.t("cutscene.speaker_soil") : "SOIL",
          text: I18n ? I18n.t("cutscene.soil_unlock_4") : "Take me. Together, we will make sure nothing ever reaches your treasure."
        }
      ];
    },

    onFinish(game) {
    // Re-resolve bindings that were file-scope in js/game.js.
    const Storage = window.Killstreak.Storage;
    const { Particle, FloatingText } = (window.Killstreak && window.Killstreak.Entities) || {};

    game.saveData.soilUnlockCutsceneSeen = true;
    Storage.save(game.saveData);

    game.camera.shake(14, 0.6);
    for (let i = 0; i < 60; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 90 + Math.random() * 200;
      const color = i % 2 === 0 ? "#f59e0b" : "#78350f";
      game.particles.push(
        new Particle(game.player.x, game.player.y, Math.cos(angle) * speed, Math.sin(angle) * speed, color, 4.5, 0.6)
      );
    }

    const I18n = window.Killstreak && window.Killstreak.I18n;
    game.floatingTexts.push(
      new FloatingText(game.player.x, game.player.y - 45, I18n ? I18n.t("floating.soil_unlocked") : "SOIL UNLOCKED!", "#f59e0b", 20)
    );

    if (game.callbacks.onCutsceneEnd) {
      game.callbacks.onCutsceneEnd();
    }
    if (game.callbacks.onToast) {
      const tTitle = I18n ? I18n.t("toasts.soil_unlock_title") : "WEAPON UNLOCKED";
      const tDesc = I18n ? I18n.t("toasts.soil_unlock_desc") : "Soil — The Indestructible Fortress is now available!";
      game.callbacks.onToast(tTitle, tDesc, "🛡️");
    }
    return;
    }
  },

  soil_p10: {
    type: "soil_p10",

    shake: [18, 0.7],

    achieve: "soil_ascended",

    lines() {
      const I18n = window.Killstreak && window.Killstreak.I18n;
      return [
        {
          speaker: I18n ? I18n.t("cutscene.speaker_soil") : "SOIL",
          text: I18n ? I18n.t("cutscene.soil_p10_1") : "[The screen briefly darkens.]\n\nYou thought I had fallen?"
        },
        {
          speaker: I18n ? I18n.t("cutscene.speaker_soil") : "SOIL",
          text: I18n ? I18n.t("cutscene.soil_p10_2") : "[The broken blade sinks into the ground.]\n\nNo.\n\nI returned to where I began."
        },
        {
          speaker: I18n ? I18n.t("cutscene.speaker_soil") : "SOIL",
          text: I18n ? I18n.t("cutscene.soil_p10_3") : "[The ground begins trembling. Cracks spread outward from the sword.]\n\nEvery grain...\nEvery fragment...\nEvery piece of me that was broken..."
        },
        {
          speaker: I18n ? I18n.t("cutscene.speaker_soil") : "SOIL",
          text: I18n ? I18n.t("cutscene.soil_p10_4") : "[The scattered dirt from previous phases begins floating toward the blade.]\n\n...was still mine."
        },
        {
          speaker: I18n ? I18n.t("cutscene.speaker_soil") : "SOIL",
          text: I18n ? I18n.t("cutscene.soil_p10_5") : "[Massive layers of earth rise from the ground and surround the sword.]\n\nI spent every battle learning how to endure.\nEvery defeat taught me how to rebuild."
        },
        {
          speaker: I18n ? I18n.t("cutscene.speaker_soil") : "SOIL",
          text: I18n ? I18n.t("cutscene.soil_p10_6") : "[The earth rapidly compresses, becoming incredibly dense and towering.]\n\nI am no longer loose dirt.\nI am no longer merely a blade."
        },
        {
          speaker: I18n ? I18n.t("cutscene.speaker_soil") : "SOIL",
          text: I18n ? I18n.t("cutscene.soil_p10_7") : "[The entire structure erupts into a colossal fortress-like sword.]\n\nI am the ground beneath your feet.\nThe wall between your treasure and everything that seeks to take it."
        },
        {
          speaker: I18n ? I18n.t("cutscene.speaker_soil") : "SOIL",
          text: I18n ? I18n.t("cutscene.soil_p10_8") : "[The fortress settles into complete silence.]\n\nCome.\nBreak yourself against me."
        },
        {
          speaker: I18n ? I18n.t("cutscene.speaker_soil_p10") : "SOIL — PHASE 10: THE INDESTRUCTIBLE FORTRESS",
          text: I18n ? I18n.t("cutscene.soil_p10_9") : "As long as I stand...\nYour treasure will never be taken."
        }
      ];
    },

    onFinish(game) {
    // Re-resolve bindings that were file-scope in js/game.js.
    const Storage = window.Killstreak.Storage;
    const { Particle, FloatingText } = (window.Killstreak && window.Killstreak.Entities) || {};

    game.saveData.soilPhase10CutsceneSeen = true;
    AchievementSystem.unlockAchievement(game, "soil_ascended");
    Storage.save(game.saveData);

    game.camera.shake(22, 1.1);
    for (let i = 0; i < 90; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 120 + Math.random() * 280;
      const color = i % 3 === 0 ? "#fef08a" : (i % 3 === 1 ? "#f59e0b" : "#78350f");
      game.particles.push(
        new Particle(game.player.x, game.player.y, Math.cos(angle) * speed, Math.sin(angle) * speed, color, 5.5, 0.8)
      );
    }

    const I18n = window.Killstreak && window.Killstreak.I18n;
    game.floatingTexts.push(
      new FloatingText(game.player.x, game.player.y - 45, I18n ? I18n.t("floating.soil_p10") : "THE INDESTRUCTIBLE FORTRESS!", "#fef08a", 22)
    );

    if (game.callbacks.onCutsceneEnd) {
      game.callbacks.onCutsceneEnd();
    }
    if (game.callbacks.onToast) {
      const tTitle = I18n ? I18n.t("toasts.soil_p10_title") : "INDESTRUCTIBLE FORTRESS";
      const tDesc = I18n ? I18n.t("toasts.soil_p10_desc") : "Phase 10: Soil — Indestructible Fortress transformation complete!";
      game.callbacks.onToast(tTitle, tDesc, "🛡️");
    }
    return;
    }
  },

  metallic_unlock: {
    type: "metallic_unlock",

    shake: [10, 0.5],

    achieve: null,

    lines() {
      const I18n = window.Killstreak && window.Killstreak.I18n;
      return [
        {
          speaker: I18n ? I18n.t("cutscene.speaker_anvil") : "ANVIL OF WILL",
          text: I18n ? I18n.t("cutscene.metallic_unlock_1") : "From raw iron and molten fire, an unyielding will takes shape."
        },
        {
          speaker: I18n ? I18n.t("cutscene.speaker_anvil") : "ANVIL OF WILL",
          text: I18n ? I18n.t("cutscene.metallic_unlock_2") : "Five thousand foes have fallen before your resolve. The steel recognizes its master."
        },
        {
          speaker: I18n ? I18n.t("cutscene.speaker_metallic") : "METALLIC",
          text: I18n ? I18n.t("cutscene.metallic_unlock_3") : "I was discarded once. Now, I have another purpose."
        },
        {
          speaker: I18n ? I18n.t("cutscene.speaker_metallic") : "METALLIC",
          text: I18n ? I18n.t("cutscene.metallic_unlock_4") : "Hold me firm. We will bend neither to hardship nor death."
        }
      ];
    },

    onFinish(game) {
    // Re-resolve bindings that were file-scope in js/game.js.
    const Storage = window.Killstreak.Storage;
    const { Particle, FloatingText } = (window.Killstreak && window.Killstreak.Entities) || {};

    game.saveData.metallicUnlockCutsceneSeen = true;
    Storage.save(game.saveData);

    game.camera.shake(14, 0.6);
    for (let i = 0; i < 60; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 90 + Math.random() * 200;
      const color = i % 2 === 0 ? "#cbd5e1" : "#ffffff";
      game.particles.push(
        new Particle(game.player.x, game.player.y, Math.cos(angle) * speed, Math.sin(angle) * speed, color, 4.5, 0.6)
      );
    }

    const I18n = window.Killstreak && window.Killstreak.I18n;
    game.floatingTexts.push(
      new FloatingText(game.player.x, game.player.y - 45, I18n ? I18n.t("floating.metallic_unlocked", { defaultValue: "METALLIC UNLOCKED!" }) : "METALLIC UNLOCKED!", "#cbd5e1", 20)
    );

    if (game.callbacks.onCutsceneEnd) {
      game.callbacks.onCutsceneEnd();
    }
    if (game.callbacks.onToast) {
      const tTitle = I18n ? I18n.t("toasts.metallic_unlock_title", { defaultValue: "WEAPON UNLOCKED" }) : "WEAPON UNLOCKED";
      const tDesc = I18n ? I18n.t("toasts.metallic_unlock_desc", { defaultValue: "Metallic — The Forged Will is now available!" }) : "Metallic — The Forged Will is now available!";
      game.callbacks.onToast(tTitle, tDesc, "⚙️");
    }
    return;
    }
  },

  metallic_p10: {
    type: "metallic_p10",

    shake: [18, 0.7],

    achieve: "metallic_ascended",

    lines() {
      const I18n = window.Killstreak && window.Killstreak.I18n;
      return [
        {
          speaker: I18n ? I18n.t("cutscene.speaker_metallic") : "METALLIC",
          text: I18n ? I18n.t("cutscene.metallic_p10_1") : "[The sword ceases all vibration. The air around it feels unnaturally heavy.]\n\nThere is nothing left to temper."
        },
        {
          speaker: I18n ? I18n.t("cutscene.speaker_metallic") : "METALLIC",
          text: I18n ? I18n.t("cutscene.metallic_p10_2") : "[The scratches on the blade begin to glow with cold white light.]\n\nEvery strike against me...\nEvery blow meant to shatter me..."
        },
        {
          speaker: I18n ? I18n.t("cutscene.speaker_metallic") : "METALLIC",
          text: I18n ? I18n.t("cutscene.metallic_p10_3") : "[The cracks and dents fill in, not by healing, but by folding into denser steel.]\n\n...was simply another hammer blow."
        },
        {
          speaker: I18n ? I18n.t("cutscene.speaker_metallic") : "METALLIC",
          text: I18n ? I18n.t("cutscene.metallic_p10_4") : "[A ringing sound echoes—like an anvil struck in an empty cathedral.]\n\nI was scrap.\nI became a weapon."
        },
        {
          speaker: I18n ? I18n.t("cutscene.speaker_metallic") : "METALLIC",
          text: I18n ? I18n.t("cutscene.metallic_p10_5") : "[The blade transforms into perfectly polished, dark silver steel. No reflections appear on its surface.]\n\nNow..."
        },
        {
          speaker: I18n ? I18n.t("cutscene.speaker_metallic") : "METALLIC",
          text: I18n ? I18n.t("cutscene.metallic_p10_6") : "[The white glow settles deep inside the core of the blade.]\n\nI am the standard against which all force is measured."
        },
        {
          speaker: I18n ? I18n.t("cutscene.speaker_metallic") : "METALLIC",
          text: I18n ? I18n.t("cutscene.metallic_p10_7") : "[The sword emits a low, steady hum that does not fade.]\n\nBring your worst.\nBring everything."
        },
        {
          speaker: I18n ? I18n.t("cutscene.speaker_metallic") : "METALLIC",
          text: I18n ? I18n.t("cutscene.metallic_p10_8") : "[The screen flashes pure white for a fraction of a second.]\n\nI will not bend.\nI will not break."
        },
        {
          speaker: I18n ? I18n.t("cutscene.speaker_metallic_p10") : "METALLIC — PHASE 10: ETERNAL STEEL",
          text: I18n ? I18n.t("cutscene.metallic_p10_9") : "I am Eternal Steel."
        },
        {
          speaker: I18n ? I18n.t("cutscene.speaker_metallic_p10") : "METALLIC — PHASE 10: ETERNAL STEEL",
          text: I18n ? I18n.t("cutscene.metallic_p10_10") : "And I will outlast all of you."
        }
      ];
    },

    onFinish(game) {
    // Re-resolve bindings that were file-scope in js/game.js.
    const Storage = window.Killstreak.Storage;
    const { Particle, FloatingText } = (window.Killstreak && window.Killstreak.Entities) || {};

    game.saveData.metallicPhase10CutsceneSeen = true;
    AchievementSystem.unlockAchievement(game, "metallic_ascended");
    Storage.save(game.saveData);

    game.camera.shake(22, 1.1);
    for (let i = 0; i < 90; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 120 + Math.random() * 280;
      const color = i % 3 === 0 ? "#ffffff" : (i % 3 === 1 ? "#cbd5e1" : "#475569");
      game.particles.push(
        new Particle(game.player.x, game.player.y, Math.cos(angle) * speed, Math.sin(angle) * speed, color, 5.5, 0.8)
      );
    }

    const I18n = window.Killstreak && window.Killstreak.I18n;
    game.floatingTexts.push(
      new FloatingText(game.player.x, game.player.y - 45, I18n ? I18n.t("floating.metallic_p10", { defaultValue: "ETERNAL STEEL ASCENDS!" }) : "ETERNAL STEEL ASCENDS!", "#ffffff", 22)
    );

    if (game.callbacks.onCutsceneEnd) {
      game.callbacks.onCutsceneEnd();
    }
    if (game.callbacks.onToast) {
      const tTitle = I18n ? I18n.t("toasts.metallic_p10_title", { defaultValue: "ETERNAL STEEL" }) : "ETERNAL STEEL";
      const tDesc = I18n ? I18n.t("toasts.metallic_p10_desc", { defaultValue: "Phase 10: Metallic — Eternal Steel forged into perfection!" }) : "Phase 10: Metallic — Eternal Steel forged into perfection!";
      game.callbacks.onToast(tTitle, tDesc, "⚙️");
    }
    return;
    }
  },

  flora_unlock: {
    type: "flora_unlock",

    shake: [10, 0.5],

    achieve: null,

    lines() {
      const I18n = window.Killstreak && window.Killstreak.I18n;
      return [
        {
          speaker: I18n ? I18n.t("cutscene.speaker_grove") : "ELDER GROVE",
          text: I18n ? I18n.t("cutscene.flora_unlock_1") : "Leaves rustle as ancient roots stir beneath the emerald meadow."
        },
        {
          speaker: I18n ? I18n.t("cutscene.speaker_grove") : "ELDER GROVE",
          text: I18n ? I18n.t("cutscene.flora_unlock_2") : "Seven thousand slaughters have fertilized the timeless grove. The forest awakens."
        },
        {
          speaker: I18n ? I18n.t("cutscene.speaker_flora") : "FLORA",
          text: I18n ? I18n.t("cutscene.flora_unlock_3") : "A sprout in the storm... but patience outlives all tempests."
        },
        {
          speaker: I18n ? I18n.t("cutscene.speaker_flora") : "FLORA",
          text: I18n ? I18n.t("cutscene.flora_unlock_4") : "Take root with me. Together, we shall endure longer than the mountains."
        }
      ];
    },

    onFinish(game) {
    // Re-resolve bindings that were file-scope in js/game.js.
    const Storage = window.Killstreak.Storage;
    const { Particle, FloatingText } = (window.Killstreak && window.Killstreak.Entities) || {};

    game.saveData.floraUnlockCutsceneSeen = true;
    Storage.save(game.saveData);

    game.camera.shake(14, 0.6);
    for (let i = 0; i < 60; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 90 + Math.random() * 200;
      const color = i % 2 === 0 ? "#4ade80" : "#22c55e";
      game.particles.push(
        new Particle(game.player.x, game.player.y, Math.cos(angle) * speed, Math.sin(angle) * speed, color, 4.5, 0.6)
      );
    }

    const I18n = window.Killstreak && window.Killstreak.I18n;
    game.floatingTexts.push(
      new FloatingText(game.player.x, game.player.y - 45, I18n ? I18n.t("floating.flora_unlocked", { defaultValue: "FLORA UNLOCKED!" }) : "FLORA UNLOCKED!", "#4ade80", 20)
    );

    if (game.callbacks.onCutsceneEnd) {
      game.callbacks.onCutsceneEnd();
    }
    if (game.callbacks.onToast) {
      const tTitle = I18n ? I18n.t("toasts.flora_unlock_title", { defaultValue: "WEAPON UNLOCKED" }) : "WEAPON UNLOCKED";
      const tDesc = I18n ? I18n.t("toasts.flora_unlock_desc", { defaultValue: "Flora — The Evergrowth is now available!" }) : "Flora — The Evergrowth is now available!";
      game.callbacks.onToast(tTitle, tDesc, "🌿");
    }
    return;
    }
  },

  flora_p10: {
    type: "flora_p10",

    shake: [18, 0.7],

    achieve: "flora_ascended",

    lines() {
      const I18n = window.Killstreak && window.Killstreak.I18n;
      return [
        {
          speaker: I18n ? I18n.t("cutscene.speaker_flora") : "FLORA",
          text: I18n ? I18n.t("cutscene.flora_p10_1") : "[Roots slowly retreat into the soil. The world falls completely still.]\n\nYou fought so hard."
        },
        {
          speaker: I18n ? I18n.t("cutscene.speaker_flora") : "FLORA",
          text: I18n ? I18n.t("cutscene.flora_p10_2") : "[Green light pulses softly through the ground, spreading outward in all directions.]\n\nYou conquered empires.\nYou built monuments.\nYou swung your weapons with such fury."
        },
        {
          speaker: I18n ? I18n.t("cutscene.speaker_flora") : "FLORA",
          text: I18n ? I18n.t("cutscene.flora_p10_3") : "[Vines begin growing over everything—the arena, the weapons, the fallen.]\n\nAnd yet..."
        },
        {
          speaker: I18n ? I18n.t("cutscene.speaker_flora") : "FLORA",
          text: I18n ? I18n.t("cutscene.flora_p10_4") : "[Flowers bloom in the cracks of broken armor.]\n\n...the grass always returns."
        },
        {
          speaker: I18n ? I18n.t("cutscene.speaker_flora") : "FLORA",
          text: I18n ? I18n.t("cutscene.flora_p10_5") : "[Massive ancient roots erupt from the earth, interlocking into an immense living sword.]\n\nI do not need to defeat you.\nI only need to exist."
        },
        {
          speaker: I18n ? I18n.t("cutscene.speaker_flora") : "FLORA",
          text: I18n ? I18n.t("cutscene.flora_p10_6") : "[Leaves drift down, glowing with calm, pale green light.]\n\nYour strength will fade.\nYour iron will rust.\nYour fires will die."
        },
        {
          speaker: I18n ? I18n.t("cutscene.speaker_flora") : "FLORA",
          text: I18n ? I18n.t("cutscene.flora_p10_7") : "[The living sword pulses with slow, heartbeat-like warmth.]\n\nAnd when everything you built has turned to dust..."
        },
        {
          speaker: I18n ? I18n.t("cutscene.speaker_flora") : "FLORA",
          text: I18n ? I18n.t("cutscene.flora_p10_8") : "[A single new sprout opens at the tip of the blade.]\n\n...I will still be growing."
        },
        {
          speaker: I18n ? I18n.t("cutscene.speaker_flora_p10") : "FLORA — PHASE 10: THE EVERGROWTH",
          text: I18n ? I18n.t("cutscene.flora_p10_9") : "I am the Evergrowth."
        },
        {
          speaker: I18n ? I18n.t("cutscene.speaker_flora_p10") : "FLORA — PHASE 10: THE EVERGROWTH",
          text: I18n ? I18n.t("cutscene.flora_p10_10") : "Life does not end."
        },
        {
          speaker: I18n ? I18n.t("cutscene.speaker_flora_p10") : "FLORA — PHASE 10: THE EVERGROWTH",
          text: I18n ? I18n.t("cutscene.flora_p10_11") : "It only takes back what was always its own."
        }
      ];
    },

    onFinish(game) {
    // Re-resolve bindings that were file-scope in js/game.js.
    const Storage = window.Killstreak.Storage;
    const { Particle, FloatingText } = (window.Killstreak && window.Killstreak.Entities) || {};

    game.saveData.floraPhase10CutsceneSeen = true;
    AchievementSystem.unlockAchievement(game, "flora_ascended");
    Storage.save(game.saveData);

    game.camera.shake(22, 1.1);
    for (let i = 0; i < 90; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 120 + Math.random() * 280;
      const color = i % 3 === 0 ? "#4ade80" : (i % 3 === 1 ? "#86efac" : "#15803d");
      game.particles.push(
        new Particle(game.player.x, game.player.y, Math.cos(angle) * speed, Math.sin(angle) * speed, color, 5.5, 0.8)
      );
    }

    const I18n = window.Killstreak && window.Killstreak.I18n;
    game.floatingTexts.push(
      new FloatingText(game.player.x, game.player.y - 45, I18n ? I18n.t("floating.flora_p10", { defaultValue: "THE EVERGROWTH ASCENDS!" }) : "THE EVERGROWTH ASCENDS!", "#4ade80", 22)
    );

    if (game.callbacks.onCutsceneEnd) {
      game.callbacks.onCutsceneEnd();
    }
    if (game.callbacks.onToast) {
      const tTitle = I18n ? I18n.t("toasts.flora_p10_title", { defaultValue: "THE EVERGROWTH" }) : "THE EVERGROWTH";
      const tDesc = I18n ? I18n.t("toasts.flora_p10_desc", { defaultValue: "Phase 10: Flora — The Evergrowth blooms across eternity!" }) : "Phase 10: Flora — The Evergrowth blooms across eternity!";
      game.callbacks.onToast(tTitle, tDesc, "🌿");
    }
    return;
    }
  },

  hellfire_unlock: {
    type: "hellfire_unlock",

    shake: [10, 0.5],

    achieve: null,

    lines() {
      const I18n = window.Killstreak && window.Killstreak.I18n;
      return [
        {
          speaker: I18n ? I18n.t("cutscene.speaker_abyss") : "INFERNAL ABYSS",
          text: I18n ? I18n.t("cutscene.hellfire_unlock_1") : "The air scorches with suffocating heat as obsidian fissures rip open."
        },
        {
          speaker: I18n ? I18n.t("cutscene.speaker_abyss") : "INFERNAL ABYSS",
          text: I18n ? I18n.t("cutscene.hellfire_unlock_2") : "Ten thousand souls burned away in your crucible of slaughter. The demon within demands release."
        },
        {
          speaker: I18n ? I18n.t("cutscene.speaker_hellfire") : "HELLFIRE",
          text: I18n ? I18n.t("cutscene.hellfire_unlock_3") : "A spark... it is enough to ignite the world."
        },
        {
          speaker: I18n ? I18n.t("cutscene.speaker_hellfire") : "HELLFIRE",
          text: I18n ? I18n.t("cutscene.hellfire_unlock_4") : "Unleash me! Feed me! Let nothing remain but ash!"
        }
      ];
    },

    onFinish(game) {
    // Re-resolve bindings that were file-scope in js/game.js.
    const Storage = window.Killstreak.Storage;
    const { Particle, FloatingText } = (window.Killstreak && window.Killstreak.Entities) || {};

    game.saveData.hellfireUnlockCutsceneSeen = true;
    Storage.save(game.saveData);

    game.camera.shake(14, 0.6);
    for (let i = 0; i < 60; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 90 + Math.random() * 200;
      const color = i % 2 === 0 ? "#ef4444" : "#fbbf24";
      game.particles.push(
        new Particle(game.player.x, game.player.y, Math.cos(angle) * speed, Math.sin(angle) * speed, color, 4.5, 0.6)
      );
    }

    const I18n = window.Killstreak && window.Killstreak.I18n;
    game.floatingTexts.push(
      new FloatingText(game.player.x, game.player.y - 45, I18n ? I18n.t("floating.hellfire_unlocked", { defaultValue: "HELLFIRE UNLOCKED!" }) : "HELLFIRE UNLOCKED!", "#ef4444", 20)
    );

    if (game.callbacks.onCutsceneEnd) {
      game.callbacks.onCutsceneEnd();
    }
    if (game.callbacks.onToast) {
      const tTitle = I18n ? I18n.t("toasts.hellfire_unlock_title", { defaultValue: "WEAPON UNLOCKED" }) : "WEAPON UNLOCKED";
      const tDesc = I18n ? I18n.t("toasts.hellfire_unlock_desc", { defaultValue: "Hellfire — The Infernal is now available!" }) : "Hellfire — The Infernal is now available!";
      game.callbacks.onToast(tTitle, tDesc, "🔥");
    }
    return;
    }
  },

  hellfire_p10: {
    type: "hellfire_p10",

    shake: [20, 0.8],

    achieve: "hellfire_ascended",

    lines() {
      const I18n = window.Killstreak && window.Killstreak.I18n;
      return [
        {
          speaker: I18n ? I18n.t("cutscene.speaker_hellfire") : "HELLFIRE",
          text: I18n ? I18n.t("cutscene.hellfire_p10_1") : "[The flames completely disappear. The screen goes pitch black.]\n\n..."
        },
        {
          speaker: I18n ? I18n.t("cutscene.speaker_hellfire") : "HELLFIRE",
          text: I18n ? I18n.t("cutscene.hellfire_p10_2") : "[A single red line appears down the center of the screen, splitting the darkness.]\n\nYou thought it was a fire you could put out?"
        },
        {
          speaker: I18n ? I18n.t("cutscene.speaker_hellfire") : "HELLFIRE",
          text: I18n ? I18n.t("cutscene.hellfire_p10_3") : "[The red line tears open into an ocean of black and crimson fire.]\n\nFIRE DOES NOT NEGOTIATE."
        },
        {
          speaker: I18n ? I18n.t("cutscene.speaker_hellfire") : "HELLFIRE",
          text: I18n ? I18n.t("cutscene.hellfire_p10_4") : "[The sword reappears—surrounded by jagged obsidian horns and swirling black flame.]\n\nIt does not pause.\nIt does not show mercy."
        },
        {
          speaker: I18n ? I18n.t("cutscene.speaker_hellfire") : "HELLFIRE",
          text: I18n ? I18n.t("cutscene.hellfire_p10_5") : "[The ground around the sword melts instantly into bubbling magma.]\n\nIt only consumes."
        },
        {
          speaker: I18n ? I18n.t("cutscene.speaker_hellfire") : "HELLFIRE",
          text: I18n ? I18n.t("cutscene.hellfire_p10_6") : "[The blade erupts with a sound like a volcanic explosion.]\n\nYou brought me foes.\nYou brought me souls.\nYou gave me everything I needed to burn through the cage."
        },
        {
          speaker: I18n ? I18n.t("cutscene.speaker_hellfire") : "HELLFIRE",
          text: I18n ? I18n.t("cutscene.hellfire_p10_7") : "[Pillars of black fire shoot skyward, turning the sky dark red.]\n\nNow..."
        },
        {
          speaker: I18n ? I18n.t("cutscene.speaker_hellfire") : "HELLFIRE",
          text: I18n ? I18n.t("cutscene.hellfire_p10_8") : "[The sword burns with fire so dark it absorbs the light around it.]\n\nTHERE IS NOTHING LEFT TO HOLD ME BACK."
        },
        {
          speaker: I18n ? I18n.t("cutscene.speaker_hellfire") : "HELLFIRE",
          text: I18n ? I18n.t("cutscene.hellfire_p10_9") : "[Violent tremors shake the entire screen. The fire roars with terrifying intensity.]\n\nBURN!"
        },
        {
          speaker: I18n ? I18n.t("cutscene.speaker_hellfire_p10") : "HELLFIRE — PHASE 10: THE INFERNAL",
          text: I18n ? I18n.t("cutscene.hellfire_p10_10") : "I am The Infernal."
        },
        {
          speaker: I18n ? I18n.t("cutscene.speaker_hellfire_p10") : "HELLFIRE — PHASE 10: THE INFERNAL",
          text: I18n ? I18n.t("cutscene.hellfire_p10_11") : "And everything ends in ash."
        }
      ];
    },

    onFinish(game) {
    // Re-resolve bindings that were file-scope in js/game.js.
    const Storage = window.Killstreak.Storage;
    const { Particle, FloatingText } = (window.Killstreak && window.Killstreak.Entities) || {};

    game.saveData.hellfirePhase10CutsceneSeen = true;
    AchievementSystem.unlockAchievement(game, "hellfire_ascended");
    Storage.save(game.saveData);

    game.camera.shake(24, 1.2);
    for (let i = 0; i < 95; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 120 + Math.random() * 300;
      const color = i % 3 === 0 ? "#ef4444" : (i % 3 === 1 ? "#f97316" : "#fbbf24");
      game.particles.push(
        new Particle(game.player.x, game.player.y, Math.cos(angle) * speed, Math.sin(angle) * speed, color, 5.5, 0.8)
      );
    }

    const I18n = window.Killstreak && window.Killstreak.I18n;
    game.floatingTexts.push(
      new FloatingText(game.player.x, game.player.y - 45, I18n ? I18n.t("floating.hellfire_p10", { defaultValue: "THE INFERNAL CONSUMES ALL!" }) : "THE INFERNAL CONSUMES ALL!", "#ef4444", 22)
    );

    if (game.callbacks.onCutsceneEnd) {
      game.callbacks.onCutsceneEnd();
    }
    if (game.callbacks.onToast) {
      const tTitle = I18n ? I18n.t("toasts.hellfire_p10_title", { defaultValue: "THE INFERNAL" }) : "THE INFERNAL";
      const tDesc = I18n ? I18n.t("toasts.hellfire_p10_desc", { defaultValue: "Phase 10: Hellfire — The Infernal consumes everything into ash!" }) : "Phase 10: Hellfire — The Infernal consumes everything into ash!";
      game.callbacks.onToast(tTitle, tDesc, "🔥");
    }
    return;
    }
  },

  frostbite_unlock: {
    type: "frostbite_unlock",

    shake: [8, 0.5],

    achieve: null,

    lines() {
      const I18n = window.Killstreak && window.Killstreak.I18n;
      return [
        {
          speaker: I18n ? I18n.t("cutscene.speaker_frostbite") : "FROSTBITE",
          text: I18n ? I18n.t("cutscene.frostbite_unlock_1") : "Thirty-two thousand, five hundred kills. Something in the air has stopped moving."
        },
        {
          speaker: I18n ? I18n.t("cutscene.speaker_frostbite") : "FROSTBITE",
          text: I18n ? I18n.t("cutscene.frostbite_unlock_2") : "Cold."
        },
        {
          speaker: I18n ? I18n.t("cutscene.speaker_frostbite") : "FROSTBITE",
          text: I18n ? I18n.t("cutscene.frostbite_unlock_3") : "That's all it is. Not yet a weapon — just a shape that refuses to warm up."
        },
        {
          speaker: I18n ? I18n.t("cutscene.speaker_frostbite") : "FROSTBITE",
          text: I18n ? I18n.t("cutscene.frostbite_unlock_4") : "But the cold is spreading. Tell it where."
        }
      ];
    },

    onFinish(game) {
    // Re-resolve bindings that were file-scope in js/game.js.
    const Storage = window.Killstreak.Storage;
    const { Particle, FloatingText } = (window.Killstreak && window.Killstreak.Entities) || {};

    game.saveData.frostbiteUnlockCutsceneSeen = true;
    Storage.save(game.saveData);

    game.camera.shake(12, 0.55);
    for (let i = 0; i < 55; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 110 + Math.random() * 230;
      const color = i % 2 === 0 ? "#a5f3fc" : "#e0f2fe";
      game.particles.push(
        new Particle(game.player.x, game.player.y, Math.cos(angle) * speed, Math.sin(angle) * speed, color, 4.5, 0.6)
      );
    }

    const I18n = window.Killstreak && window.Killstreak.I18n;
    game.floatingTexts.push(
      new FloatingText(game.player.x, game.player.y - 45, I18n ? I18n.t("floating.frostbite_unlocked", { defaultValue: "FROSTBITE UNLOCKED!" }) : "FROSTBITE UNLOCKED!", "#a5f3fc", 20)
    );

    if (game.callbacks.onCutsceneEnd) {
      game.callbacks.onCutsceneEnd();
    }
    if (game.callbacks.onToast) {
      const tTitle = I18n ? I18n.t("toasts.frostbite_unlock_title", { defaultValue: "WEAPON UNLOCKED" }) : "WEAPON UNLOCKED";
      const tDesc = I18n ? I18n.t("toasts.frostbite_unlock_desc", { defaultValue: "Frostbite — The Frozen is now available!" }) : "Frostbite — The Frozen is now available!";
      game.callbacks.onToast(tTitle, tDesc, "🧊");
    }
    return;
    }
  },

  frostbite_p12: {
    type: "frostbite_p12",

    shake: [12, 0.5],

    achieve: "frostbite_ascended",

    lines() {
      const I18n = window.Killstreak && window.Killstreak.I18n;
      return [
        {
          speaker: I18n ? I18n.t("cutscene.speaker_frostbite_p12") : "FROSTBITE — PHASE 12: ABSOLUTE ZERO",
          text: I18n ? I18n.t("cutscene.frostbite_p12_1") : "[The frost stops falling. It simply hangs, suspended, waiting for permission to move.]"
        },
        {
          speaker: I18n ? I18n.t("cutscene.speaker_frostbite_p12") : "FROSTBITE — PHASE 12: ABSOLUTE ZERO",
          text: I18n ? I18n.t("cutscene.frostbite_p12_2") : "The cold has no limit."
        },
        {
          speaker: I18n ? I18n.t("cutscene.speaker_frostbite_p12") : "FROSTBITE — PHASE 12: ABSOLUTE ZERO",
          text: I18n ? I18n.t("cutscene.frostbite_p12_3") : "The world has stopped."
        },
        {
          speaker: I18n ? I18n.t("cutscene.speaker_frostbite_p12") : "FROSTBITE — PHASE 12: ABSOLUTE ZERO",
          text: I18n ? I18n.t("cutscene.frostbite_p12_4") : "[Every layer of ice goes still at the same instant. Nothing melts. Nothing breaks.]\n\nThis is absolute zero."
        },
        {
          speaker: I18n ? I18n.t("cutscene.speaker_frostbite_p12") : "FROSTBITE — PHASE 12: ABSOLUTE ZERO",
          text: I18n ? I18n.t("cutscene.frostbite_p12_5") : "Freeze."
        }
      ];
    },

    onFinish(game) {
    const Storage = window.Killstreak.Storage;
    const { Particle, FloatingText } = (window.Killstreak && window.Killstreak.Entities) || {};

    game.saveData.frostbitePhase12CutsceneSeen = true;
    Storage.save(game.saveData);

    game.camera.shake(18, 0.6);
    for (let i = 0; i < 80; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 130 + Math.random() * 260;
      const color = i % 3 === 0 ? "#e0f2fe" : (i % 3 === 1 ? "#a5f3fc" : "#ffffff");
      game.particles.push(
        new Particle(game.player.x, game.player.y, Math.cos(angle) * speed, Math.sin(angle) * speed, color, 5.0, 0.7)
      );
    }

    const I18n = window.Killstreak && window.Killstreak.I18n;
    game.floatingTexts.push(
      new FloatingText(game.player.x, game.player.y - 45, I18n ? I18n.t("floating.frostbite_p12", { defaultValue: "ABSOLUTE ZERO!" }) : "ABSOLUTE ZERO!", "#e0f2fe", 20)
    );

    if (game.callbacks.onCutsceneEnd) {
      game.callbacks.onCutsceneEnd();
    }
    if (game.callbacks.onToast) {
      const tTitle = I18n ? I18n.t("toasts.frostbite_p12_title", { defaultValue: "ABSOLUTE ZERO" }) : "ABSOLUTE ZERO";
      const tDesc = I18n ? I18n.t("toasts.frostbite_p12_desc", { defaultValue: "Frostbite has reached its final form." }) : "Frostbite has reached its final form.";
      game.callbacks.onToast(tTitle, tDesc, "🧊");
    }
    return;
    }
  },

  windy_unlock: {
    type: "windy_unlock",

    shake: [8, 0.5],

    achieve: null,

    lines() {
      const I18n = window.Killstreak && window.Killstreak.I18n;
      return [
        {
          speaker: I18n ? I18n.t("cutscene.speaker_windy") : "WINDY",
          text: I18n ? I18n.t("cutscene.windy_unlock_1") : "A faint current slips past your shoulder. It does not push. It waits."
        },
        {
          speaker: I18n ? I18n.t("cutscene.speaker_windy") : "WINDY",
          text: I18n ? I18n.t("cutscene.windy_unlock_2") : "Twenty-four thousand kills, and not one of them left a mark on the air."
        },
        {
          speaker: I18n ? I18n.t("cutscene.speaker_windy") : "WINDY",
          text: I18n ? I18n.t("cutscene.windy_unlock_3") : "Can you feel that? Something is moving."
        },
        {
          speaker: I18n ? I18n.t("cutscene.speaker_windy") : "WINDY",
          text: I18n ? I18n.t("cutscene.windy_unlock_4") : "It follows you now. Tell it where to strike."
        }
      ];
    },

    onFinish(game) {
    // Re-resolve bindings that were file-scope in js/game.js.
    const Storage = window.Killstreak.Storage;
    const { Particle, FloatingText } = (window.Killstreak && window.Killstreak.Entities) || {};

    game.saveData.windyUnlockCutsceneSeen = true;
    Storage.save(game.saveData);

    game.camera.shake(12, 0.55);
    for (let i = 0; i < 55; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 110 + Math.random() * 230;
      const color = i % 2 === 0 ? "#22d3ee" : "#e0f2fe";
      game.particles.push(
        new Particle(game.player.x, game.player.y, Math.cos(angle) * speed, Math.sin(angle) * speed, color, 4.5, 0.6)
      );
    }

    const I18n = window.Killstreak && window.Killstreak.I18n;
    game.floatingTexts.push(
      new FloatingText(game.player.x, game.player.y - 45, I18n ? I18n.t("floating.windy_unlocked", { defaultValue: "WINDY UNLOCKED!" }) : "WINDY UNLOCKED!", "#22d3ee", 20)
    );

    if (game.callbacks.onCutsceneEnd) {
      game.callbacks.onCutsceneEnd();
    }
    if (game.callbacks.onToast) {
      const tTitle = I18n ? I18n.t("toasts.windy_unlock_title", { defaultValue: "WEAPON UNLOCKED" }) : "WEAPON UNLOCKED";
      const tDesc = I18n ? I18n.t("toasts.windy_unlock_desc", { defaultValue: "Windy — The Aerial is now available!" }) : "Windy — The Aerial is now available!";
      game.callbacks.onToast(tTitle, tDesc, "🌬️");
    }
    return;
    }
  },

  windy_p13: {
    type: "windy_p13",

    shake: [12, 0.5],

    achieve: "windy_ascended",

    lines() {
      const I18n = window.Killstreak && window.Killstreak.I18n;
      return [
        {
          speaker: I18n ? I18n.t("cutscene.speaker_windy_p13") : "WINDY — PHASE 13: ULTIMATE TEMPEST",
          text: I18n ? I18n.t("cutscene.windy_p13_1") : "[The wind stops. Completely. Not a leaf moves. The silence is louder than the storm ever was.]"
        },
        {
          speaker: I18n ? I18n.t("cutscene.speaker_windy_p13") : "WINDY — PHASE 13: ULTIMATE TEMPEST",
          text: I18n ? I18n.t("cutscene.windy_p13_2") : "There is no breeze."
        },
        {
          speaker: I18n ? I18n.t("cutscene.speaker_windy_p13") : "WINDY — PHASE 13: ULTIMATE TEMPEST",
          text: I18n ? I18n.t("cutscene.windy_p13_3") : "There is no gale."
        },
        {
          speaker: I18n ? I18n.t("cutscene.speaker_windy_p13") : "WINDY — PHASE 13: ULTIMATE TEMPEST",
          text: I18n ? I18n.t("cutscene.windy_p13_4") : "[The horizon folds inward. Every rotating layer of sky answers at once.]\n\nThere is only the storm."
        },
        {
          speaker: I18n ? I18n.t("cutscene.speaker_windy_p13") : "WINDY — PHASE 13: ULTIMATE TEMPEST",
          text: I18n ? I18n.t("cutscene.windy_p13_5") : "Become the tempest."
        }
      ];
    },

    onFinish(game) {
    const Storage = window.Killstreak.Storage;
    const { Particle, FloatingText } = (window.Killstreak && window.Killstreak.Entities) || {};

    game.saveData.windyPhase13CutsceneSeen = true;
    Storage.save(game.saveData);

    game.camera.shake(18, 0.6);
    for (let i = 0; i < 80; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 130 + Math.random() * 260;
      const color = i % 3 === 0 ? "#67e8f9" : (i % 3 === 1 ? "#22d3ee" : "#e0f2fe");
      game.particles.push(
        new Particle(game.player.x, game.player.y, Math.cos(angle) * speed, Math.sin(angle) * speed, color, 5, 0.65)
      );
    }

    const I18n = window.Killstreak && window.Killstreak.I18n;
    game.floatingTexts.push(
      new FloatingText(game.player.x, game.player.y - 45, I18n ? I18n.t("floating.windy_p13", { defaultValue: "BECOME THE TEMPEST!" }) : "BECOME THE TEMPEST!", "#67e8f9", 22)
    );

    if (game.callbacks.onCutsceneEnd) {
      game.callbacks.onCutsceneEnd();
    }
    if (game.callbacks.onToast) {
      const tTitle = I18n ? I18n.t("toasts.windy_p13_title", { defaultValue: "ULTIMATE TEMPEST" }) : "ULTIMATE TEMPEST";
      const tDesc = I18n ? I18n.t("toasts.windy_p13_desc", { defaultValue: "Phase 13: Ultimate Tempest — Windy becomes the storm." }) : "Phase 13: Ultimate Tempest — Windy becomes the storm.";
      game.callbacks.onToast(tTitle, tDesc, "🌬️");
    }
    return;
    }
  },

  devourer_p17: {
    type: "devourer_p17",

    shake: [12, 0.5],

    achieve: null,

    lines() {
  const I18n = window.Killstreak && window.Killstreak.I18n;
  if (!I18n) {
    return [
      {
        speaker: "DEVOURER — TRANSCENDENCE",
        text: "The endless hunger ceases its trembling. All that lived and breathed in this realm... has been consumed."
      },
      {
        speaker: "DEVOURER — TRANSCENDENCE",
        text: "Seventy-five thousand souls surrendered their essence to forge this final vessel."
      },
      {
        speaker: "DEVOURER — TRANSCENDENCE",
        text: "The blade transcends mortal flesh, bone, and steel. Reality itself bends to your divine command."
      },
      {
        speaker: "THE ALL DEVOURER",
        text: "BEHOLD — THE APEX OF CONSUMPTION IS ATTAINED. I AM THE ALL DEVOURER."
      }
    ];
  }
  return [
    {
      speaker: I18n.t("cutscene.speaker_transcendence"),
      text: I18n.t("cutscene.dialogue_1")
    },
    {
      speaker: I18n.t("cutscene.speaker_transcendence"),
      text: I18n.t("cutscene.dialogue_2")
    },
    {
      speaker: I18n.t("cutscene.speaker_transcendence"),
      text: I18n.t("cutscene.dialogue_3")
    },
    {
      speaker: I18n.t("cutscene.speaker_all_devourer"),
      text: I18n.t("cutscene.dialogue_4")
    }
  ];
    },

    beforeShake(game) {
    // Re-resolve bindings that were file-scope in js/game.js.
    const Storage = window.Killstreak.Storage;

  // Immediately grant All Devourer badge
  if (!game.saveData.achievements.includes("all_devourer")) {
    game.saveData.achievements.push("all_devourer");
    if (!game.saveData.badges.includes("all_devourer")) {
      game.saveData.badges.push("all_devourer");
    }
    Storage.save(game.saveData);
    if (game.callbacks.onBadgesUpdated) {
      game.callbacks.onBadgesUpdated(game.saveData.badges);
    }
  }
    },

    onFinish: null  // falls through to the default completion block
  }
};

/**
 * Default completion block. In the original `finishCutscene()` this ran as an
 * unguarded fall-through, so it executes for `devourer_p17` and for any
 * unrecognised cutsceneType. That behaviour is preserved.
 */
export function runDefaultFinish(game) {
    // Re-resolve bindings that were file-scope in js/game.js.
    const Storage = window.Killstreak.Storage;
    const { Particle, FloatingText } = (window.Killstreak && window.Killstreak.Entities) || {};


  game.saveData.phase17CutsceneSeen = true;

  // Final confirmation of All Devourer badge
  if (!game.saveData.achievements.includes("all_devourer")) {
    game.saveData.achievements.push("all_devourer");
    if (!game.saveData.badges.includes("all_devourer")) {
      game.saveData.badges.push("all_devourer");
    }
  }
  Storage.save(game.saveData);

  // Apocalyptic Climax Explosion
  game.camera.shake(18, 0.85);
  for (let i = 0; i < 85; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 110 + Math.random() * 260;
    const color = i % 2 === 0 ? "#facc15" : "#38bdf8";
    game.particles.push(
      new Particle(game.player.x, game.player.y, Math.cos(angle) * speed, Math.sin(angle) * speed, color, 5.5, 0.85)
    );
  }

  const I18n = window.Killstreak && window.Killstreak.I18n;
  game.floatingTexts.push(
    new FloatingText(game.player.x, game.player.y - 45, I18n ? I18n.t("floating.all_devourer") : "THE ALL DEVOURER ASCENDS!", "#facc15", 22)
  );

  if (game.callbacks.onCutsceneEnd) {
    game.callbacks.onCutsceneEnd();
  }
  if (game.callbacks.onBadgesUpdated) {
    game.callbacks.onBadgesUpdated(game.saveData.badges);
  }
  if (game.callbacks.onToast) {
    const I18n = window.Killstreak && window.Killstreak.I18n;
    const achInfo = I18n ? I18n.getAchievementInfo("all_devourer") : { title: "All Devourer", description: "Marks completion of the final Devourer phase." };
    const title = I18n ? I18n.t("toasts.achievement_unlocked_title") : "Achievement Unlocked!";
    game.callbacks.onToast(title, `${achInfo.title}: ${achInfo.description}`, "👑");
  }
}

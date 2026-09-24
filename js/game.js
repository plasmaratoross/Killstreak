/**
 * Game Core Controller
 * Manages world areas (Lobby, Grassland Combat Map), 2 NPC Zones (max 7 each, 5s respawn), and Devourer phases.
 */

import * as CutsceneSystem from '../src/systems/CutsceneSystem.js';
import * as AchievementSystem from '../src/systems/AchievementSystem.js';
import * as BloodmoonEventSystem from '../src/systems/BloodmoonEventSystem.js';
import { getSwordRenderer } from '../src/swords/SwordRegistry.js';
import * as WorldRenderer from '../src/render/WorldRenderer.js';
import * as LobbyRenderer from '../src/render/LobbyRenderer.js';

(function(window) {
  window.Killstreak = window.Killstreak || {};
  const Config = window.Killstreak.Config;
  const Storage = window.Killstreak.Storage;
  const { Camera, Player, NPC, Tree, Rock, SwordStand, Portal, Particle, FloatingText, TsunamiWave } = window.Killstreak.Entities;

  class Game {
    constructor(canvas, callbacks = {}) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.callbacks = callbacks;

      this.viewport = Config.GAME_CONFIG.viewport;
      this.camera = new Camera(this.viewport.width, this.viewport.height);

      this.saveData = Storage.load();
      const I18n = window.Killstreak && window.Killstreak.I18n;
      if (I18n && this.saveData && this.saveData.settings && this.saveData.settings.language) {
        I18n.init(this.saveData.settings.language);
      }

      this.state = "MENU";
      this.currentArea = "LOBBY";
      this.isGameOver = false;
      this.killstreak = 0;
      this.isDebugModeActive = false;
      window.Killstreak.game = this;
      window.Killstreak.GameInstance = this;

      this.player = new Player(Config.MAPS.LOBBY.spawn.x, Config.MAPS.LOBBY.spawn.y);
      this.player.game = this;
      this.player.swordId = this.saveData.equippedSword || "devourer";
      this.player.swordName = this.player.swordId === "aquatic" ? "Aquatic" : (this.player.swordId === "overdrive" ? "Overdrive" : "Devourer");
      this.player.isSwordEquipped = typeof this.saveData.isSwordEquipped === "boolean" ? this.saveData.isSwordEquipped : true;
      this.swordStands = (Config.MAPS.LOBBY.swordStands || [Config.MAPS.LOBBY.swordStand]).map(cfg => new SwordStand(cfg));
      this.swordStand = this.swordStands[0];
      this.lobbyPortal = new Portal(Config.MAPS.LOBBY.portalToCombat);
      this.combatPortal = new Portal(Config.MAPS.COMBAT.portalToLobby);
      this.atlantisPortal = new Portal((Config.MAPS.COMBAT && Config.MAPS.COMBAT.portalToAtlantis) || { x: 9650, y: 2675, width: 60, height: 60, label: "ENTER ATLANTIS", interactRadius: 100, unlockKills: 150000 });
      this.atlantisReturnPortal = new Portal((Config.MAPS.ATLANTIS && Config.MAPS.ATLANTIS.portalToGrassland) || { x: 5720, y: 3960, width: 64, height: 64, label: "RETURN TO GRASSLAND", interactRadius: 100 });
      this.corals = [];

      this.enterAtlantis = () => {
        const totalKills = (this.saveData && this.saveData.totalKills) || 0;
        if (totalKills < 150000) {
          if (this.callbacks.onToast) {
            const I18n = window.Killstreak && window.Killstreak.I18n;
            const title = I18n ? I18n.t("toasts.atlantis_locked_title") : "ATLANTIS LOCKED";
            const desc = I18n ? I18n.t("toasts.atlantis_locked_desc", { kills: totalKills.toLocaleString() }) : `Requires 150,000 Total Kills to unlock Atlantis! (Current: ${totalKills.toLocaleString()})`;
            this.callbacks.onToast(title, desc, "🔒");
          }
          if (this.player && this.floatingTexts) {
            const { FloatingText } = (window.Killstreak && window.Killstreak.Entities) || {};
            if (FloatingText) {
              this.floatingTexts.push(
                new FloatingText(this.player.x, this.player.y - 48, "LOCKED: 150,000 KILLS REQUIRED", "#ef4444", 18)
              );
            }
          }
          return false;
        }

        this.state = "COMBAT";
        this.setupArea("ATLANTIS");

        if (this.callbacks.onToast) {
          const I18n = window.Killstreak && window.Killstreak.I18n;
          const title = I18n ? I18n.t("toasts.entered_atlantis_title") : "Entered Atlantis";
          const desc = I18n ? I18n.t("toasts.entered_atlantis_desc") : "Ancient underwater realm of deep mysteries.";
          this.callbacks.onToast(title, desc, "🌊");
        }
        return true;
      };

      this.returnToGrasslandFromAtlantis = () => {
        this.state = "COMBAT";
        this.setupArea("COMBAT");
        this.player.x = 9650;
        this.player.y = 2820;
        this.camera.follow(this.player.x, this.player.y, Config.MAPS.COMBAT.width, Config.MAPS.COMBAT.height, 1);

        if (this.callbacks.onToast) {
          const I18n = window.Killstreak && window.Killstreak.I18n;
          const title = I18n ? I18n.t("toasts.returned_grassland_title") : "Returned to Open Grassland";
          const desc = I18n ? I18n.t("toasts.returned_grassland_desc") : "Surfaced from the depths of Atlantis.";
          this.callbacks.onToast(title, desc, "🌿");
        }
      };

      this.npcs = [];
      this.respawnQueue = []; // Holds { zoneIndex, timer: 5.0 }
      this.trees = [];
      this.rocks = [];
      this.particles = [];
      this.floatingTexts = [];
      this.activePrompt = null;

      // Devourer Skills (Gluttony & Engulf)
      this.gluttonyCooldown = 0;
      this.engulfCooldown = 0;
      this.isEngulfActive = false;
      this.engulfTimer = 0;
      this.engulfTickTimer = 0;
      this.activeBeam = null;
      this.statsSaveTimer = 0;

      // Aquatic Skill (Tsunami)
      this.tsunamiCooldown = 0;
      this.activeTsunamis = [];

      // Soil Skill (Fortitude)
      this.fortitudeCooldown = 0;

      // Metallic Skill (Iron Will)
      this.ironWillCooldown = 0;

      // Flora Skill (Worldroot)
      this.worldrootCooldown = 0;
      this.activeWorldroots = [];

      // Hellfire Skill (Cataclysm)
      this.cataclysmCooldown = 0;
      this.activeCataclysms = [];

      // Windy Skill (Cyclone)
      this.cycloneCooldown = 0;
      this.activeCyclones = [];

      // Frostbite Skills (Freeze / Blizzard)
      this.freezeCooldown = 0;
      this.activeFreezes = [];
      this.blizzardCooldown = 0;
      this.activeBlizzards = [];

      // Voltstrike Skill (Zap)
      this.zapCooldown = 0;
      this.activeZaps = [];

      // Lumen Skills (Flash / Radiance)
      this.flashCooldown = 0;
      this.activeFlashes = [];
      this.radianceCooldown = 0;
      this.activeRadiances = [];

      // Umbra Skills (Gravity Well / Erasure)
      this.gravityWellCooldown = 0;
      this.activeGravityWells = [];
      this.erasureCooldown = 0;
      this.activeErasures = [];

      // Sanguine Skills (Bloodletting / Exsanguinate)
      this.bloodlettingCooldown = 0;
      this.activeBloodlettings = [];
      this.exsanguinateCooldown = 0;
      this.activeExsanguinates = [];

      this.isPaused = false;

      // Bloodmoon Event State
      this.bloodmoon = {
        isActive: false,
        activeTimer: 0,          // Counts up while active (max 15*60 = 900s)
        checkTimer: 0,           // Counts up between checks (max 60s)
        bannerPhase: "hidden",   // "hidden" | "entering" | "visible" | "exiting"
        bannerTimer: 0,          // Controls how long each banner phase lasts
        npcStatsApplied: false,  // Whether the +25% buff is currently applied
      };

      this.input = {
        up: false,
        down: false,
        left: false,
        right: false,
        screenMouseX: this.viewport.width / 2,
        screenMouseY: this.viewport.height / 2,
        isMouseDown: false
      };

      // Cutscene & Dialogue System
      this.isCutsceneActive = false;
      this.cutsceneIndex = 0;
      this.cutsceneTimer = 0;
      this.cutsceneType = "devourer_p17";
      this.cutsceneDialogue = CutsceneSystem.getLines("devourer_p17");

      this.player.swordId = this.saveData.equippedSword || "devourer";
      this.player.swordName = this.player.swordId === "soil" ? "Soil" : (this.player.swordId === "aquatic" ? "Aquatic" : (this.player.swordId === "overdrive" ? "Overdrive" : "Devourer"));
      this.player.isSwordEquipped = typeof this.saveData.isSwordEquipped === "boolean" ? this.saveData.isSwordEquipped : true;
      this.syncSwordPhase(true);
      AchievementSystem.checkFirstSessionAchievement(this);
      this.setupArea("LOBBY");
      this.isInitialized = true;

      if (window.Killstreak && window.Killstreak.MapSystem) {
        window.Killstreak.MapSystem.init(this);
      }
    }


    setupArea(areaId) {
      this.currentArea = areaId;
      const mapConfig = Config.MAPS[areaId];

      this.trees = [];
      this.rocks = [];
      this.corals = [];
      this.npcs = [];
      this.respawnQueue = [];
      this.particles = [];
      this.floatingTexts = [];

      // Environmental props (Trees, Rocks, Corals)
      if (mapConfig.trees) {
        mapConfig.trees.forEach(t => this.trees.push(new Tree(t.x, t.y, t.radius)));
      }
      if (mapConfig.rocks) {
        mapConfig.rocks.forEach(r => this.rocks.push(new Rock(r.x, r.y, r.radius)));
      }
      if (mapConfig.corals) {
        mapConfig.corals.forEach(c => this.corals.push(c));
      }

      this.player.x = mapConfig.spawn.x;
      this.player.y = mapConfig.spawn.y;
      this.player.hp = this.player.maxHp;

      this.camera.follow(this.player.x, this.player.y, mapConfig.width, mapConfig.height, 1);

      if (areaId === "COMBAT") {
        this.populateGrasslandZones();
      }

      if (window.Killstreak && window.Killstreak.BloodmoonEventSystem && typeof window.Killstreak.BloodmoonEventSystem.updateBloodmoonTintStyle === "function") {
        window.Killstreak.BloodmoonEventSystem.updateBloodmoonTintStyle(this);
      }

      if (this.callbacks.onAreaChange) {
        this.callbacks.onAreaChange(areaId, mapConfig.name);
      }
    }

    startInLobby() {
      this.state = "LOBBY";
      this.setupArea("LOBBY");
    }

    enterCombatZone() {
      this.state = "COMBAT";
      this.setupArea("COMBAT");

      if (this.callbacks.onToast) {
        const I18n = window.Killstreak && window.Killstreak.I18n;
        const title = I18n ? I18n.t("toasts.entered_combat_title") : "Entered Open Grassland";
        const desc = I18n ? I18n.t("toasts.entered_combat_desc") : "Strike stationary sentries in the feeding grounds!";
        this.callbacks.onToast(title, desc, "⚔️");
      }
    }

    setPaused(isPaused) {
      this.isPaused = Boolean(isPaused);
    }

    returnToLobby() {
      this.isGameOver = false;
      this.state = "LOBBY";
      this.killstreak = 0;
      this.syncSwordPhase(true);
      if (this.player && this.player.isSwordEquipped && typeof this.player.applyKillstreakScaling === "function") {
        this.player.applyKillstreakScaling(0);
      }
      this.setupArea("LOBBY");
      if (this.callbacks.onKill) {
        this.callbacks.onKill(0, this.saveData.highestKillstreak, this.saveData.kills, this.saveData.totalKills);
      }
      if (this.callbacks.onPhaseChange) {
        this.callbacks.onPhaseChange(this.player.phase);
      }
    }

    /**
     * Populate the 4 designated NPC zones with structured formations
     * 2 Normal Sentry zones (max 7 each, 14 total) + 2 Fairy groves (max 7 each, 14 total)
     */
    populateGrasslandZones() {
      this.npcs = [];
      this.respawnQueue = [];
      const zones = Config.MAPS.COMBAT.npcZones;

      zones.forEach((zone) => {
        for (let slot = 0; slot < zone.maxNpcs; slot++) {
          this.spawnNpcInSlot(zone.index, slot, zone.npcType);
        }
      });
    }

    /**
     * Spawn an individual NPC inside a structured formation slot (7-slot or 5-slot)
     * @param {number} zoneIndex 0 to 5
     * @param {number} slotIndex
     * @param {string} type
     */
    spawnNpcInSlot(zoneIndex, slotIndex, type = "normal") {
      const zone = Config.MAPS.COMBAT.npcZones[zoneIndex];
      if (!zone) return;

      let offsets = Config.NPC_FORMATION_10_SLOTS;
      if (zone.npcType === "buff_man") {
        offsets = Config.NPC_FORMATION_10_BUFF_SLOTS || Config.NPC_FORMATION_7_BUFF_SLOTS;
      } else if (zone.maxNpcs === 10) {
        offsets = Config.NPC_FORMATION_10_SLOTS;
      } else if (zone.maxNpcs === 9) {
        offsets = Config.NPC_FORMATION_9_SLOTS;
      } else if (zone.maxNpcs === 8) {
        offsets = Config.NPC_FORMATION_8_SLOTS;
      } else if (zone.maxNpcs === 7) {
        offsets = Config.NPC_FORMATION_7_SLOTS;
      } else if (zone.maxNpcs === 6) {
        offsets = Config.NPC_FORMATION_6_SLOTS;
      } else if (zone.maxNpcs === 5) {
        offsets = Config.NPC_FORMATION_5_SLOTS;
      }

      const offset = (offsets && offsets[slotIndex]) || {
        x: ((slotIndex % 4) - 1.5) * 55,
        y: (Math.floor(slotIndex / 4) - 1) * 55
      };
      const centerX = zone.x + zone.width / 2;
      const centerY = zone.y + zone.height / 2;
      const x = centerX + offset.x;
      const y = centerY + offset.y;

      const npc = new NPC(x, y, zoneIndex, type, slotIndex);
      npc.game = this;
      this.npcs.push(npc);
    }

    equipSword(swordId) {
      if (swordId === "overdrive") {
        if ((this.saveData.totalKills || 0) < 1250) {
          if (this.callbacks.onToast) {
            const I18n = window.Killstreak && window.Killstreak.I18n;
            const title = I18n ? I18n.t("toasts.weapon_locked_title") : "WEAPON LOCKED";
            const desc = I18n ? I18n.t("toasts.weapon_locked_desc") : "Requires 1,250 Total Kills to equip Overdrive!";
            this.callbacks.onToast(title, desc, "🔒");
          }
          return false;
        }
      } else if (swordId === "aquatic") {
        if ((this.saveData.totalKills || 0) < 2500) {
          if (this.callbacks.onToast) {
            const I18n = window.Killstreak && window.Killstreak.I18n;
            const title = I18n ? I18n.t("toasts.weapon_locked_title") : "WEAPON LOCKED";
            const desc = I18n ? I18n.t("toasts.weapon_aquatic_locked_desc", { defaultValue: "Requires 2,500 Total Kills to equip Aquatic!" }) : "Requires 2,500 Total Kills to equip Aquatic!";
            this.callbacks.onToast(title, desc, "🔒");
          }
          return false;
        }
      } else if (swordId === "soil") {
        if ((this.saveData.totalKills || 0) < 3500) {
          if (this.callbacks.onToast) {
            const I18n = window.Killstreak && window.Killstreak.I18n;
            const title = I18n ? I18n.t("toasts.weapon_locked_title") : "WEAPON LOCKED";
            const desc = I18n ? I18n.t("toasts.weapon_soil_locked_desc", { defaultValue: "Requires 3,500 Total Kills to equip Soil!" }) : "Requires 3,500 Total Kills to equip Soil!";
            this.callbacks.onToast(title, desc, "🔒");
          }
          return false;
        }
      } else if (swordId === "metallic") {
        if ((this.saveData.totalKills || 0) < 5000) {
          if (this.callbacks.onToast) {
            const I18n = window.Killstreak && window.Killstreak.I18n;
            const title = I18n ? I18n.t("toasts.weapon_locked_title") : "WEAPON LOCKED";
            const desc = I18n ? I18n.t("toasts.weapon_metallic_locked_desc", { defaultValue: "Requires 5,000 Total Kills to equip Metallic!" }) : "Requires 5,000 Total Kills to equip Metallic!";
            this.callbacks.onToast(title, desc, "🔒");
          }
          return false;
        }
      } else if (swordId === "flora") {
        if ((this.saveData.totalKills || 0) < 7000) {
          if (this.callbacks.onToast) {
            const I18n = window.Killstreak && window.Killstreak.I18n;
            const title = I18n ? I18n.t("toasts.weapon_locked_title") : "WEAPON LOCKED";
            const desc = I18n ? I18n.t("toasts.weapon_flora_locked_desc", { defaultValue: "Requires 7,000 Total Kills to equip Flora!" }) : "Requires 7,000 Total Kills to equip Flora!";
            this.callbacks.onToast(title, desc, "🔒");
          }
          return false;
        }
      } else if (swordId === "hellfire") {
        if ((this.saveData.totalKills || 0) < 10000) {
          if (this.callbacks.onToast) {
            const I18n = window.Killstreak && window.Killstreak.I18n;
            const title = I18n ? I18n.t("toasts.weapon_locked_title") : "WEAPON LOCKED";
            const desc = I18n ? I18n.t("toasts.weapon_hellfire_locked_desc", { defaultValue: "Requires 10,000 Total Kills to equip Hellfire!" }) : "Requires 10,000 Total Kills to equip Hellfire!";
            this.callbacks.onToast(title, desc, "🔒");
          }
          return false;
        }
      } else if (swordId === "windy") {
        if ((this.saveData.totalKills || 0) < 24000) {
          if (this.callbacks.onToast) {
            const I18n = window.Killstreak && window.Killstreak.I18n;
            const title = I18n ? I18n.t("toasts.weapon_locked_title") : "WEAPON LOCKED";
            const desc = I18n ? I18n.t("toasts.weapon_windy_locked_desc", { defaultValue: "Requires 24,000 Total Kills to equip Windy!" }) : "Requires 24,000 Total Kills to equip Windy!";
            this.callbacks.onToast(title, desc, "🔒");
          }
          return false;
        }
      } else if (swordId === "frostbite") {
        if ((this.saveData.totalKills || 0) < 32500) {
          if (this.callbacks.onToast) {
            const I18n = window.Killstreak && window.Killstreak.I18n;
            const title = I18n ? I18n.t("toasts.weapon_locked_title") : "WEAPON LOCKED";
            const desc = I18n ? I18n.t("toasts.weapon_frostbite_locked_desc", { defaultValue: "Requires 32,500 Total Kills to equip Frostbite!" }) : "Requires 32,500 Total Kills to equip Frostbite!";
            this.callbacks.onToast(title, desc, "🔒");
          }
          return false;
        }
      } else if (swordId === "voltstrike") {
        if ((this.saveData.totalKills || 0) < 45000) {
          if (this.callbacks.onToast) {
            const I18n = window.Killstreak && window.Killstreak.I18n;
            const title = I18n ? I18n.t("toasts.weapon_locked_title") : "WEAPON LOCKED";
            const desc = I18n ? I18n.t("toasts.weapon_voltstrike_locked_desc", { defaultValue: "Requires 45,000 Total Kills to equip Voltstrike!" }) : "Requires 45,000 Total Kills to equip Voltstrike!";
            this.callbacks.onToast(title, desc, "🔒");
          }
          return false;
        }
      } else if (swordId === "lumen") {
        if ((this.saveData.totalKills || 0) < 50000) {
          if (this.callbacks.onToast) {
            const I18n = window.Killstreak && window.Killstreak.I18n;
            const title = I18n ? I18n.t("toasts.weapon_locked_title") : "WEAPON LOCKED";
            const desc = I18n ? I18n.t("toasts.weapon_lumen_locked_desc", { defaultValue: "Requires 50,000 Total Kills to equip Lumen!" }) : "Requires 50,000 Total Kills to equip Lumen!";
            this.callbacks.onToast(title, desc, "🔒");
          }
          return false;
        }
      } else if (swordId === "umbra") {
        if ((this.saveData.totalKills || 0) < 70000) {
          if (this.callbacks.onToast) {
            const I18n = window.Killstreak && window.Killstreak.I18n;
            const title = I18n ? I18n.t("toasts.weapon_locked_title") : "WEAPON LOCKED";
            const desc = I18n ? I18n.t("toasts.weapon_umbra_locked_desc", { defaultValue: "Requires 70,000 Total Kills to equip Umbra!" }) : "Requires 70,000 Total Kills to equip Umbra!";
            this.callbacks.onToast(title, desc, "🔒");
          }
          return false;
        }
      } else if (swordId === "sanguine") {
        if ((this.saveData.totalKills || 0) < 100000) {
          if (this.callbacks.onToast) {
            const I18n = window.Killstreak && window.Killstreak.I18n;
            const title = I18n ? I18n.t("toasts.weapon_locked_title") : "WEAPON LOCKED";
            const desc = I18n ? I18n.t("toasts.weapon_sanguine_locked_desc", { defaultValue: "Requires 100,000 Total Kills to equip Sanguine!" }) : "Requires 100,000 Total Kills to equip Sanguine!";
            this.callbacks.onToast(title, desc, "🔒");
          }
          return false;
        }
      }

      const isSwitchingSword = this.player.swordId !== swordId;
      if (isSwitchingSword) {
        this.killstreak = 0;
      }

      this.player.swordId = swordId;
      this.player.swordName = swordId === "sanguine" ? "Sanguine" : (swordId === "umbra" ? "Umbra" : (swordId === "lumen" ? "Lumen" : (swordId === "voltstrike" ? "Voltstrike" : (swordId === "frostbite" ? "Frostbite" : (swordId === "windy" ? "Windy" : (swordId === "hellfire" ? "Hellfire" : (swordId === "flora" ? "Flora" : (swordId === "metallic" ? "Metallic" : (swordId === "soil" ? "Soil" : (swordId === "aquatic" ? "Aquatic" : (swordId === "overdrive" ? "Overdrive" : "Devourer")))))))))));
      this.player.isSwordEquipped = true;
      this.saveData.equippedSword = swordId;
      this.saveData.isSwordEquipped = true;

      // Devourer skills disabled when not using Devourer
      if (swordId !== "devourer") {
        this.isEngulfActive = false;
        this.player.isEngulfActive = false;
        this.activeBeam = null;
        this.gluttonyCooldown = 0;
        this.engulfCooldown = 0;
      }

      // Aquatic skills disabled when not using Aquatic
      if (swordId !== "aquatic") {
        this.tsunamiCooldown = 0;
        this.activeTsunamis = [];
      }

      // Soil skills disabled when not using Soil
      if (swordId !== "soil") {
        this.fortitudeCooldown = 0;
        this.player.shield = 0;
        this.player.shieldDuration = 0;
      }

      // Metallic skills disabled when not using Metallic
      if (swordId !== "metallic") {
        this.ironWillCooldown = 0;
        this.player.ironWillActive = false;
        this.player.ironWillTimer = 0;
      }

      // Flora skills disabled when not using Flora
      if (swordId !== "flora") {
        this.worldrootCooldown = 0;
        this.player.worldrootHealTimer = 0;
        this.activeWorldroots = [];
      }

      // Hellfire skills disabled when not using Hellfire
      if (swordId !== "hellfire") {
        this.cataclysmCooldown = 0;
        this.activeCataclysms = [];
      }

      // Windy skills disabled when not using Windy
      if (swordId !== "windy") {
        this.cycloneCooldown = 0;
        this.activeCyclones = [];
      }

      // Frostbite skills disabled when not using Frostbite
      if (swordId !== "frostbite") {
        this.freezeCooldown = 0;
        this.activeFreezes = [];
        this.blizzardCooldown = 0;
        this.activeBlizzards = [];
      }

      // Voltstrike skill disabled when not using Voltstrike
      if (swordId !== "voltstrike") {
        this.zapCooldown = 0;
        this.activeZaps = [];
      }

      // Lumen skills disabled when not using Lumen
      if (swordId !== "lumen") {
        this.flashCooldown = 0;
        this.activeFlashes = [];
        this.radianceCooldown = 0;
        this.activeRadiances = [];
      }

      // Umbra skills disabled when not using Umbra
      if (swordId !== "umbra") {
        this.gravityWellCooldown = 0;
        this.activeGravityWells = [];
        this.erasureCooldown = 0;
        this.activeErasures = [];
      }

      // Sanguine skills disabled when not using Sanguine
      if (swordId !== "sanguine") {
        this.bloodlettingCooldown = 0;
        this.activeBloodlettings = [];
        this.exsanguinateCooldown = 0;
        this.activeExsanguinates = [];
      }

      this.syncSwordPhase(true);
      if (this.player.isSwordEquipped && typeof this.player.applyKillstreakScaling === "function") {
        this.player.applyKillstreakScaling(this.killstreak);
      }

      if (isSwitchingSword && this.callbacks.onKill) {
        this.callbacks.onKill(this.killstreak, this.saveData.highestKillstreak, this.saveData.kills, this.saveData.totalKills);
      }

      if (this.callbacks.onSkillsUpdate) {
        this.callbacks.onSkillsUpdate({
          isSwordEquipped: this.player.isSwordEquipped,
          swordId: this.player.swordId,
          gluttonyCooldown: this.gluttonyCooldown,
          engulfCooldown: this.engulfCooldown,
          isEngulfActive: this.isEngulfActive,
          tsunamiCooldown: this.tsunamiCooldown,
          fortitudeCooldown: this.fortitudeCooldown,
          shield: this.player.shield,
          ironWillCooldown: this.ironWillCooldown,
          ironWillActive: Boolean(this.player.ironWillActive || this.player.ironWillTimer > 0),
          worldrootCooldown: this.worldrootCooldown,
          cataclysmCooldown: this.cataclysmCooldown,
          cycloneCooldown: this.cycloneCooldown,
          freezeCooldown: this.freezeCooldown,
          blizzardCooldown: this.blizzardCooldown,
          zapCooldown: this.zapCooldown,
          flashCooldown: this.flashCooldown,
          radianceCooldown: this.radianceCooldown,
          gravityWellCooldown: this.gravityWellCooldown,
          erasureCooldown: this.erasureCooldown,
          bloodlettingCooldown: this.bloodlettingCooldown,
          exsanguinateCooldown: this.exsanguinateCooldown,
          phase: this.player.phase.phase
        });
      }
      if (this.callbacks.onPhaseChange) {
        this.callbacks.onPhaseChange(this.player.phase);
      }

      // First time equipping Aquatic -> Play unlock cutscene
      if (swordId === "aquatic" && !this.saveData.aquaticUnlockCutsceneSeen) {
        CutsceneSystem.start(this, "aquatic_unlock");
      }

      // First time equipping Soil -> Play unlock cutscene
      if (swordId === "soil" && !this.saveData.soilUnlockCutsceneSeen) {
        CutsceneSystem.start(this, "soil_unlock");
      }

      // First time equipping Metallic -> Play unlock cutscene
      if (swordId === "metallic" && !this.saveData.metallicUnlockCutsceneSeen) {
        CutsceneSystem.start(this, "metallic_unlock");
      }

      // First time equipping Flora -> Play unlock cutscene
      if (swordId === "flora" && !this.saveData.floraUnlockCutsceneSeen) {
        CutsceneSystem.start(this, "flora_unlock");
      }

      // First time equipping Hellfire -> Play unlock cutscene
      if (swordId === "hellfire" && !this.saveData.hellfireUnlockCutsceneSeen) {
        CutsceneSystem.start(this, "hellfire_unlock");
      }

      // First time equipping Windy -> Play unlock cutscene
      if (swordId === "windy" && !this.saveData.windyUnlockCutsceneSeen) {
        CutsceneSystem.start(this, "windy_unlock");
      }

      // First time equipping Frostbite -> Play unlock cutscene
      if (swordId === "frostbite" && !this.saveData.frostbiteUnlockCutsceneSeen) {
        CutsceneSystem.start(this, "frostbite_unlock");
      }

      // First time equipping Voltstrike -> Play unlock cutscene
      if (swordId === "voltstrike" && !this.saveData.voltstrikeUnlockCutsceneSeen) {
        CutsceneSystem.start(this, "voltstrike_unlock");
      }

      // First time equipping Lumen -> Play unlock cutscene
      if (swordId === "lumen" && !this.saveData.lumenUnlockCutsceneSeen) {
        CutsceneSystem.start(this, "lumen_unlock");
      }

      // First time equipping Umbra -> Play unlock cutscene
      if (swordId === "umbra" && !this.saveData.umbraUnlockCutsceneSeen) {
        CutsceneSystem.start(this, "umbra_unlock");
      }

      // First time equipping Sanguine -> Play unlock cutscene
      if (swordId === "sanguine" && !this.saveData.sanguineUnlockCutsceneSeen) {
        CutsceneSystem.start(this, "sanguine_unlock");
      }

      return true;
    }

    toggleSwordEquip(targetSwordId = null) {
      if (targetSwordId && targetSwordId !== this.player.swordId) {
        return this.equipSword(targetSwordId);
      }

      this.player.isSwordEquipped = !this.player.isSwordEquipped;
      this.saveData.isSwordEquipped = this.player.isSwordEquipped;
      if (!this.player.isSwordEquipped) {
        this.isEngulfActive = false;
        this.player.isEngulfActive = false;
        this.activeBeam = null;
        this.activeTsunamis = [];
        this.player.shield = 0;
        this.player.shieldDuration = 0;
        this.player.ironWillActive = false;
        this.player.ironWillTimer = 0;
        this.player.worldrootHealTimer = 0;
        this.activeWorldroots = [];
        this.activeCataclysms = [];
      }
      if (this.callbacks.onSkillsUpdate) {
        this.callbacks.onSkillsUpdate({
          isSwordEquipped: this.player.isSwordEquipped,
          swordId: this.player.swordId,
          gluttonyCooldown: this.gluttonyCooldown,
          engulfCooldown: this.engulfCooldown,
          isEngulfActive: this.isEngulfActive,
          tsunamiCooldown: this.tsunamiCooldown,
          fortitudeCooldown: this.fortitudeCooldown,
          shield: this.player.shield,
          ironWillCooldown: this.ironWillCooldown,
          ironWillActive: Boolean(this.player.ironWillActive || this.player.ironWillTimer > 0),
          worldrootCooldown: this.worldrootCooldown,
          cataclysmCooldown: this.cataclysmCooldown,
          flashCooldown: this.flashCooldown,
          radianceCooldown: this.radianceCooldown,
          gravityWellCooldown: this.gravityWellCooldown,
          erasureCooldown: this.erasureCooldown,
          bloodlettingCooldown: this.bloodlettingCooldown,
          exsanguinateCooldown: this.exsanguinateCooldown,
          phase: this.player.phase.phase
        });
      }
      if (this.callbacks.onPhaseChange) {
        this.callbacks.onPhaseChange(this.player.phase);
      }
      return this.player.isSwordEquipped;
    }

    syncSwordPhase(forceReset = false) {
      const isOverdrive = this.player.swordId === "overdrive";
      const isAquatic = this.player.swordId === "aquatic";
      const isSoil = this.player.swordId === "soil";
      const isMetallic = this.player.swordId === "metallic";
      const isFlora = this.player.swordId === "flora";
      const isHellfire = this.player.swordId === "hellfire";
      const isWindy = this.player.swordId === "windy";
      const isFrostbite = this.player.swordId === "frostbite";
      const isVoltstrike = this.player.swordId === "voltstrike";
      const isLumen = this.player.swordId === "lumen";
      const isUmbra = this.player.swordId === "umbra";
      const isSanguine = this.player.swordId === "sanguine";
      const phases = isSanguine
        ? Config.SANGUINE_PHASES
        : (isUmbra
        ? Config.UMBRA_PHASES
        : (isLumen
        ? Config.LUMEN_PHASES
        : (isVoltstrike
        ? Config.VOLTSTRIKE_PHASES
        : (isFrostbite
        ? Config.FROSTBITE_PHASES
        : (isWindy
        ? Config.WINDY_PHASES
        : (isHellfire
        ? Config.HELLFIRE_PHASES
        : (isFlora
          ? Config.FLORA_PHASES
          : (isMetallic
            ? Config.METALLIC_PHASES
            : (isSoil
              ? Config.SOIL_PHASES
              : (isAquatic
                ? Config.AQUATIC_PHASES
                : (isOverdrive ? Config.OVERDRIVE_PHASES : Config.SWORD_PHASES)))))))))));
      let matchedPhase = phases[0];

      for (let i = phases.length - 1; i >= 0; i--) {
        if (this.killstreak >= phases[i].killsRequired) {
          matchedPhase = phases[i];
          break;
        }
      }

      const previousPhase = this.player.phase;
      const isPhaseUp = Boolean(previousPhase && matchedPhase.phase > previousPhase.phase);
      const prevSwordId = (previousPhase && typeof previousPhase.cssClass === "string")
        ? (previousPhase.cssClass.startsWith("phase-sg") ? "sanguine" : (previousPhase.cssClass.startsWith("phase-um") ? "umbra" : (previousPhase.cssClass.startsWith("phase-lm") ? "lumen" : (previousPhase.cssClass.startsWith("phase-vs") ? "voltstrike" : (previousPhase.cssClass.startsWith("phase-fb") ? "frostbite" : (previousPhase.cssClass.startsWith("phase-wd") ? "windy" : (previousPhase.cssClass.startsWith("phase-hellfire") ? "hellfire" : (previousPhase.cssClass.startsWith("phase-flora") ? "flora" : (previousPhase.cssClass.startsWith("phase-metallic") ? "metallic" : (previousPhase.cssClass.startsWith("phase-soil") ? "soil" : (previousPhase.cssClass.startsWith("phase-aq") ? "aquatic" : (previousPhase.cssClass.startsWith("phase-od") ? "overdrive" : "devourer"))))))))))))
        : null;
      const isDifferentSword = Boolean(previousPhase && prevSwordId !== this.player.swordId);
      const phaseChanged = Boolean(previousPhase && (matchedPhase.phase !== previousPhase.phase || isDifferentSword));

      if (phaseChanged || forceReset) {
        this.player.setPhase(matchedPhase, isPhaseUp);
      }

      if (phaseChanged || isOverdrive || isAquatic || isSoil || isMetallic || isFlora || isHellfire || isWindy || isFrostbite || isVoltstrike || isLumen || isUmbra || isSanguine) {
        this.gluttonyCooldown = 0;
        this.engulfCooldown = 0;
        this.isEngulfActive = false;
        this.player.isEngulfActive = false;
        this.activeBeam = null;
      }

      if (isPhaseUp) {
        this.player.hp = this.player.maxHp; // Completely healed when phasing up!
        this.onSwordPhaseUp(matchedPhase);
      }

      if (isSanguine) {
        this.saveData.sanguinePhase = matchedPhase.phase;
      } else if (isUmbra) {
        this.saveData.umbraPhase = matchedPhase.phase;
      } else if (isLumen) {
        this.saveData.lumenPhase = matchedPhase.phase;
      } else if (isVoltstrike) {
        this.saveData.voltstrikePhase = matchedPhase.phase;
      } else if (isFrostbite) {
        this.saveData.frostbitePhase = matchedPhase.phase;
      } else if (isHellfire) {
        this.saveData.hellfirePhase = matchedPhase.phase;
      } else if (isWindy) {
        this.saveData.windyPhase = matchedPhase.phase;
      } else if (isFlora) {
        this.saveData.floraPhase = matchedPhase.phase;
      } else if (isMetallic) {
        this.saveData.metallicPhase = matchedPhase.phase;
      } else if (isSoil) {
        this.saveData.soilPhase = matchedPhase.phase;
      } else if (isAquatic) {
        this.saveData.aquaticPhase = matchedPhase.phase;
      } else if (isOverdrive) {
        this.saveData.overdrivePhase = matchedPhase.phase;
      } else {
        this.saveData.swordPhase = matchedPhase.phase;
      }

      if (this.isInitialized && this.callbacks.onPhaseChange && (phaseChanged || forceReset)) {
        this.callbacks.onPhaseChange(matchedPhase);
      }

      return phaseChanged;
    }

    onSwordPhaseUp(phase) {
      if (this.player.swordId === "soil") {
        if (phase.phase === 10) {
          AchievementSystem.unlockAchievement(this, "soil_ascended");
        }

        if (phase.phase === 10 && !this.saveData.soilPhase10CutsceneSeen) {
          CutsceneSystem.start(this, "soil_p10");
          return;
        }

        if (this.saveData.settings.screenShake) {
          this.camera.shake(phase.phase === 10 ? 20 : (phase.phase >= 7 ? 12 : 7), 0.35);
        }

        const pCount = phase.phase === 10 ? 75 : (phase.phase >= 7 ? 40 : 25);
        for (let i = 0; i < pCount; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 90 + Math.random() * 200;
          let pColor;
          if (phase.phase === 9) {
            pColor = i % 2 === 0 ? "#78716c" : "#57534e";
          } else if (phase.phase === 10) {
            pColor = i % 3 === 0 ? "#fef08a" : (i % 3 === 1 ? "#f59e0b" : "#78350f");
          } else {
            pColor = i % 2 === 0 ? (phase.color || "#b45309") : "#f59e0b";
          }
          this.particles.push(
            new Particle(this.player.x, this.player.y, Math.cos(angle) * speed, Math.sin(angle) * speed, pColor, 4.5, 0.55)
          );
        }

        const I18n = window.Killstreak && window.Killstreak.I18n;
        const pInfo = (I18n && phase) ? I18n.getPhaseInfo("soil", phase.phase) : phase;
        const phaseTitle = phase.phase === 9 ? "SOIL: COLLAPSE (WEAK PHASE!)" : `SOIL: ${(pInfo.shortName || phase.shortName).toUpperCase()}!`;
        const titleColor = phase.phase === 9 ? "#a8a29e" : (phase.color || "#d97706");
        this.floatingTexts.push(
          new FloatingText(this.player.x, this.player.y - 32, phaseTitle, titleColor, 16)
        );

        if (this.callbacks.onToast) {
          const title = I18n ? I18n.t("toasts.soil_up_title", { defaultValue: "EARTH FORTIFIED" }) : "EARTH FORTIFIED";
          const desc = (pInfo && pInfo.notification) || (I18n ? I18n.t("toasts.soil_up_desc", { name: pInfo.name, defaultValue: `Reached ${phase.name}` }) : `Reached ${phase.name}`);
          this.callbacks.onToast(title, desc, "🛡️");
        }
        return;
      }

      if (this.player.swordId === "aquatic") {
        if (phase.phase === 13) {
          AchievementSystem.unlockAchievement(this, "aquatic_ascended");
        }

        if (phase.phase === 13 && !this.saveData.aquaticPhase13CutsceneSeen) {
          CutsceneSystem.start(this, "aquatic_p13");
          return;
        }

        if (this.saveData.settings.screenShake) {
          this.camera.shake(phase.phase === 13 ? 18 : (phase.phase >= 9 ? 12 : 7), 0.35);
        }

        const pCount = phase.phase === 13 ? 70 : (phase.phase >= 9 ? 40 : 25);
        for (let i = 0; i < pCount; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 100 + Math.random() * 220;
          let pColor;
          if (phase.phase === 8) {
            pColor = i % 2 === 0 ? "#78716c" : "#a8a29e";
          } else {
            pColor = i % 2 === 0 ? (phase.color || "#06b6d4") : "#ffffff";
          }
          this.particles.push(
            new Particle(this.player.x, this.player.y, Math.cos(angle) * speed, Math.sin(angle) * speed, pColor, 4.2, 0.5)
          );
        }

        const I18n = window.Killstreak && window.Killstreak.I18n;
        const pInfo = (I18n && phase) ? I18n.getPhaseInfo("aquatic", phase.phase) : phase;
        const phaseTitle = phase.phase === 8 ? "AQUATIC: DROUGHT (POWER COLLAPSED!)" : `AQUATIC: ${(pInfo.shortName || phase.shortName).toUpperCase()}!`;
        const titleColor = phase.phase === 8 ? "#a8a29e" : (phase.color || "#06b6d4");
        this.floatingTexts.push(
          new FloatingText(this.player.x, this.player.y - 32, phaseTitle, titleColor, 16)
        );

        if (this.callbacks.onToast) {
          const title = I18n ? I18n.t("toasts.aquatic_up_title", { defaultValue: "AQUATIC DELUGE" }) : "AQUATIC DELUGE";
          const desc = (pInfo && pInfo.notification) || (I18n ? I18n.t("toasts.aquatic_up_desc", { name: pInfo.name, defaultValue: `Reached ${phase.name}` }) : `Reached ${phase.name}`);
          this.callbacks.onToast(title, desc, "🌊");
        }
        return;
      }

      if (this.player.swordId === "overdrive") {
        if (phase.phase === 7) {
          AchievementSystem.unlockAchievement(this, "overdrive_ascended");
        }
        if (this.saveData.settings.screenShake) {
          this.camera.shake(phase.phase === 7 ? 16 : 8, 0.35);
        }
        const pCount = phase.phase === 7 ? 60 : 30;
        for (let i = 0; i < pCount; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 120 + Math.random() * 240;
          const pColor = i % 2 === 0 ? "#ffffff" : "#ef4444";
          this.particles.push(
            new Particle(this.player.x, this.player.y, Math.cos(angle) * speed, Math.sin(angle) * speed, pColor, 4.2, 0.5)
          );
        }
        const I18n = window.Killstreak && window.Killstreak.I18n;
        const pInfo = (I18n && phase) ? I18n.getPhaseInfo("overdrive", phase.phase) : phase;
        this.floatingTexts.push(
          new FloatingText(this.player.x, this.player.y - 32, `OVERDRIVE: ${(pInfo.shortName || phase.shortName).toUpperCase()}!`, "#ffffff", 16)
        );
        if (this.callbacks.onToast) {
          const title = I18n ? I18n.t("toasts.overdrive_up_title") : "OVERDRIVE PHASE UP";
          const desc = (pInfo && pInfo.notification) || (I18n ? I18n.t("toasts.overdrive_up_desc", { name: pInfo.name }) : `Reached ${phase.name}`);
          this.callbacks.onToast(title, desc, "⚡");
        }
        return;
      }

      if (this.player.swordId === "metallic") {
        if (phase.phase === 10) {
          AchievementSystem.unlockAchievement(this, "metallic_ascended");
        }

        if (phase.phase === 10 && !this.saveData.metallicPhase10CutsceneSeen) {
          CutsceneSystem.start(this, "metallic_p10");
          return;
        }

        if (this.saveData.settings.screenShake) {
          this.camera.shake(phase.phase === 10 ? 20 : (phase.phase >= 7 ? 12 : 7), 0.35);
        }

        const pCount = phase.phase === 10 ? 75 : (phase.phase >= 7 ? 40 : 25);
        for (let i = 0; i < pCount; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 90 + Math.random() * 200;
          let pColor = phase.phase === 10 ? (i % 3 === 0 ? "#ffffff" : (i % 3 === 1 ? "#cbd5e1" : "#475569")) : (i % 2 === 0 ? (phase.color || "#cbd5e1") : "#ffffff");
          this.particles.push(
            new Particle(this.player.x, this.player.y, Math.cos(angle) * speed, Math.sin(angle) * speed, pColor, 4.5, 0.55)
          );
        }

        const I18n = window.Killstreak && window.Killstreak.I18n;
        const pInfo = (I18n && phase) ? I18n.getPhaseInfo("metallic", phase.phase) : phase;
        const phaseTitle = `METALLIC: ${(pInfo.shortName || phase.shortName).toUpperCase()}!`;
        this.floatingTexts.push(
          new FloatingText(this.player.x, this.player.y - 32, phaseTitle, phase.color || "#cbd5e1", 16)
        );

        if (this.callbacks.onToast) {
          const title = I18n ? I18n.t("toasts.metallic_up_title", { defaultValue: "STEEL REFORGED" }) : "STEEL REFORGED";
          const desc = (pInfo && pInfo.notification) || (I18n ? I18n.t("toasts.metallic_up_desc", { name: pInfo.name, defaultValue: `Reached ${phase.name}` }) : `Reached ${phase.name}`);
          this.callbacks.onToast(title, desc, "⚙️");
        }
        return;
      }

      if (this.player.swordId === "flora") {
        if (phase.phase === 10) {
          AchievementSystem.unlockAchievement(this, "flora_ascended");
        }

        if (phase.phase === 10 && !this.saveData.floraPhase10CutsceneSeen) {
          CutsceneSystem.start(this, "flora_p10");
          return;
        }

        if (this.saveData.settings.screenShake) {
          this.camera.shake(phase.phase === 10 ? 20 : (phase.phase >= 7 ? 12 : 7), 0.35);
        }

        const pCount = phase.phase === 10 ? 75 : (phase.phase >= 7 ? 40 : 25);
        for (let i = 0; i < pCount; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 90 + Math.random() * 200;
          let pColor = phase.phase === 10 ? (i % 3 === 0 ? "#4ade80" : (i % 3 === 1 ? "#22c55e" : "#14532d")) : (i % 2 === 0 ? (phase.color || "#22c55e") : "#86efac");
          this.particles.push(
            new Particle(this.player.x, this.player.y, Math.cos(angle) * speed, Math.sin(angle) * speed, pColor, 4.5, 0.55)
          );
        }

        const I18n = window.Killstreak && window.Killstreak.I18n;
        const pInfo = (I18n && phase) ? I18n.getPhaseInfo("flora", phase.phase) : phase;
        const phaseTitle = `FLORA: ${(pInfo.shortName || phase.shortName).toUpperCase()}!`;
        this.floatingTexts.push(
          new FloatingText(this.player.x, this.player.y - 32, phaseTitle, phase.color || "#4ade80", 16)
        );

        if (this.callbacks.onToast) {
          const title = I18n ? I18n.t("toasts.flora_up_title", { defaultValue: "NATURE AWAKENED" }) : "NATURE AWAKENED";
          const desc = (pInfo && pInfo.notification) || (I18n ? I18n.t("toasts.flora_up_desc", { name: pInfo.name, defaultValue: `Reached ${phase.name}` }) : `Reached ${phase.name}`);
          this.callbacks.onToast(title, desc, "🌿");
        }
        return;
      }

      if (this.player.swordId === "hellfire") {
        if (phase.phase === 10) {
          AchievementSystem.unlockAchievement(this, "hellfire_ascended");
        }

        if (phase.phase === 10 && !this.saveData.hellfirePhase10CutsceneSeen) {
          CutsceneSystem.start(this, "hellfire_p10");
          return;
        }

        if (this.saveData.settings.screenShake) {
          this.camera.shake(phase.phase === 10 ? 22 : (phase.phase >= 7 ? 14 : 8), 0.35);
        }

        const pCount = phase.phase === 10 ? 80 : (phase.phase >= 7 ? 45 : 30);
        for (let i = 0; i < pCount; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 100 + Math.random() * 220;
          let pColor = phase.phase === 10 ? (i % 3 === 0 ? "#ef4444" : (i % 3 === 1 ? "#f97316" : "#fbbf24")) : (i % 2 === 0 ? (phase.color || "#dc2626") : "#f97316");
          this.particles.push(
            new Particle(this.player.x, this.player.y, Math.cos(angle) * speed, Math.sin(angle) * speed, pColor, 4.8, 0.6)
          );
        }

        const I18n = window.Killstreak && window.Killstreak.I18n;
        const pInfo = (I18n && phase) ? I18n.getPhaseInfo("hellfire", phase.phase) : phase;
        const phaseTitle = `HELLFIRE: ${(pInfo.shortName || phase.shortName).toUpperCase()}!`;
        this.floatingTexts.push(
          new FloatingText(this.player.x, this.player.y - 32, phaseTitle, phase.color || "#ef4444", 16)
        );

        if (this.callbacks.onToast) {
          const title = I18n ? I18n.t("toasts.hellfire_up_title", { defaultValue: "INFERNO IGNITED" }) : "INFERNO IGNITED";
          const desc = (pInfo && pInfo.notification) || (I18n ? I18n.t("toasts.hellfire_up_desc", { name: pInfo.name, defaultValue: `Reached ${phase.name}` }) : `Reached ${phase.name}`);
          this.callbacks.onToast(title, desc, "🔥");
        }
        return;
      }

      if (this.player.swordId === "windy") {
        if (phase.phase === 13) {
          AchievementSystem.unlockAchievement(this, "windy_ascended");
        }

        if (phase.phase === 13 && !this.saveData.windyPhase13CutsceneSeen) {
          CutsceneSystem.start(this, "windy_p13");
          return;
        }

        if (this.saveData.settings.screenShake) {
          this.camera.shake(phase.phase === 13 ? 22 : (phase.phase >= 9 ? 14 : 8), 0.35);
        }

        const pCount = phase.phase === 13 ? 80 : (phase.phase >= 9 ? 45 : 30);
        for (let i = 0; i < pCount; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 120 + Math.random() * 240;
          let pColor = phase.phase === 13 ? (i % 3 === 0 ? "#67e8f9" : (i % 3 === 1 ? "#22d3ee" : "#e0f2fe")) : (i % 2 === 0 ? (phase.color || "#38bdf8") : "#e0f2fe");
          this.particles.push(
            new Particle(this.player.x, this.player.y, Math.cos(angle) * speed, Math.sin(angle) * speed, pColor, 4.8, 0.6)
          );
        }

        const I18n = window.Killstreak && window.Killstreak.I18n;
        const pInfo = (I18n && phase) ? I18n.getPhaseInfo("windy", phase.phase) : phase;
        const phaseTitle = `WINDY: ${(pInfo.shortName || phase.shortName).toUpperCase()}!`;
        this.floatingTexts.push(
          new FloatingText(this.player.x, this.player.y - 32, phaseTitle, phase.color || "#38bdf8", 16)
        );

        if (this.callbacks.onToast) {
          const title = I18n ? I18n.t("toasts.windy_up_title", { defaultValue: "THE STORM RISES" }) : "THE STORM RISES";
          const desc = (pInfo && pInfo.notification) || (I18n ? I18n.t("toasts.windy_up_desc", { name: pInfo.name, defaultValue: `Reached ${phase.name}` }) : `Reached ${phase.name}`);
          this.callbacks.onToast(title, desc, "🌬️");
        }
        return;
      }

      if (this.player.swordId === "voltstrike") {
        if (phase.phase === 14) {
          AchievementSystem.unlockAchievement(this, "voltstrike_ascended");
        }

        if (phase.phase === 14 && !this.saveData.voltstrikePhase14CutsceneSeen) {
          CutsceneSystem.start(this, "voltstrike_p14");
          return;
        }

        if (this.saveData.settings.screenShake) {
          this.camera.shake(phase.phase === 14 ? 22 : (phase.phase >= 9 ? 14 : 8), 0.35);
        }

        const pCount = phase.phase === 14 ? 80 : (phase.phase >= 9 ? 45 : 30);
        for (let i = 0; i < pCount; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 120 + Math.random() * 240;
          let pColor = phase.phase === 14 ? (i % 3 === 0 ? "#f0f9ff" : (i % 3 === 1 ? "#fde047" : "#7dd3fc")) : (i % 2 === 0 ? (phase.color || "#fde047") : "#fef3c7");
          this.particles.push(
            new Particle(this.player.x, this.player.y, Math.cos(angle) * speed, Math.sin(angle) * speed, pColor, 4.8, 0.6)
          );
        }

        const I18n = window.Killstreak && window.Killstreak.I18n;
        const pInfo = (I18n && phase) ? I18n.getPhaseInfo("voltstrike", phase.phase) : phase;
        const phaseTitle = `VOLTSTRIKE: ${(pInfo.shortName || phase.shortName).toUpperCase()}!`;
        this.floatingTexts.push(
          new FloatingText(this.player.x, this.player.y - 32, phaseTitle, phase.color || "#fde047", 16)
        );

        if (this.callbacks.onToast) {
          const title = I18n ? I18n.t("toasts.voltstrike_up_title", { defaultValue: "THE PRESSURE RISES" }) : "THE PRESSURE RISES";
          const desc = (pInfo && pInfo.notification) || (I18n ? I18n.t("toasts.voltstrike_up_desc", { name: pInfo.name, defaultValue: `Reached ${phase.name}` }) : `Reached ${phase.name}`);
          this.callbacks.onToast(title, desc, "⚡");
        }
        return;
      }

      if (this.player.swordId === "frostbite") {
        if (phase.phase === 12) {
          AchievementSystem.unlockAchievement(this, "frostbite_ascended");
        }

        if (phase.phase === 12 && !this.saveData.frostbitePhase12CutsceneSeen) {
          CutsceneSystem.start(this, "frostbite_p12");
          return;
        }

        if (this.saveData.settings.screenShake) {
          this.camera.shake(phase.phase === 12 ? 22 : (phase.phase >= 9 ? 14 : 8), 0.35);
        }

        const pCount = phase.phase === 12 ? 80 : (phase.phase >= 9 ? 45 : 30);
        for (let i = 0; i < pCount; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 120 + Math.random() * 240;
          let pColor = phase.phase === 12 ? (i % 3 === 0 ? "#e0f2fe" : (i % 3 === 1 ? "#a5f3fc" : "#ffffff")) : (i % 2 === 0 ? (phase.color || "#7dd3fc") : "#e0f2fe");
          this.particles.push(
            new Particle(this.player.x, this.player.y, Math.cos(angle) * speed, Math.sin(angle) * speed, pColor, 4.8, 0.6)
          );
        }

        const I18n = window.Killstreak && window.Killstreak.I18n;
        const pInfo = (I18n && phase) ? I18n.getPhaseInfo("frostbite", phase.phase) : phase;
        const phaseTitle = `FROSTBITE: ${(pInfo.shortName || phase.shortName).toUpperCase()}!`;
        this.floatingTexts.push(
          new FloatingText(this.player.x, this.player.y - 32, phaseTitle, phase.color || "#7dd3fc", 16)
        );

        if (this.callbacks.onToast) {
          const title = I18n ? I18n.t("toasts.frostbite_up_title", { defaultValue: "THE COLD DEEPENS" }) : "THE COLD DEEPENS";
          const desc = (pInfo && pInfo.notification) || (I18n ? I18n.t("toasts.frostbite_up_desc", { name: pInfo.name, defaultValue: `Reached ${phase.name}` }) : `Reached ${phase.name}`);
          this.callbacks.onToast(title, desc, "🧊");
        }
        return;
      }

      if (this.player.swordId === "lumen") {
        if (phase.phase === 14) {
          AchievementSystem.unlockAchievement(this, "lumen_ascended");
        }

        if (phase.phase === 14 && !this.saveData.lumenPhase14CutsceneSeen) {
          CutsceneSystem.start(this, "lumen_p14");
          return;
        }

        if (this.saveData.settings.screenShake) {
          this.camera.shake(phase.phase === 14 ? 22 : (phase.phase >= 9 ? 14 : 8), 0.35);
        }

        const pCount = phase.phase === 14 ? 80 : (phase.phase >= 9 ? 45 : 30);
        for (let i = 0; i < pCount; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 120 + Math.random() * 240;
          let pColor = phase.phase === 14 ? (i % 3 === 0 ? "#ffffff" : (i % 3 === 1 ? "#fef3c7" : "#fbbf24")) : (i % 2 === 0 ? (phase.color || "#fde047") : "#fffbeb");
          this.particles.push(
            new Particle(this.player.x, this.player.y, Math.cos(angle) * speed, Math.sin(angle) * speed, pColor, 4.8, 0.6)
          );
        }

        const I18n = window.Killstreak && window.Killstreak.I18n;
        const pInfo = (I18n && phase) ? I18n.getPhaseInfo("lumen", phase.phase) : phase;
        const phaseTitle = `LUMEN: ${(pInfo.shortName || phase.shortName).toUpperCase()}!`;
        this.floatingTexts.push(
          new FloatingText(this.player.x, this.player.y - 32, phaseTitle, phase.color || "#fde047", 16)
        );

        if (this.callbacks.onToast) {
          const title = I18n ? I18n.t("toasts.lumen_up_title", { defaultValue: "THE LIGHT RISES" }) : "THE LIGHT RISES";
          const desc = (pInfo && pInfo.notification) || (I18n ? I18n.t("toasts.lumen_up_desc", { name: pInfo.name, defaultValue: `Reached ${phase.name}` }) : `Reached ${phase.name}`);
          this.callbacks.onToast(title, desc, "✨");
        }
        return;
      }

      if (this.player.swordId === "umbra") {
        if (phase.phase === 15) {
          AchievementSystem.unlockAchievement(this, "umbra_ascended");
        }

        if (phase.phase === 15 && !this.saveData.umbraPhase15CutsceneSeen) {
          CutsceneSystem.start(this, "umbra_p15");
          return;
        }

        if (this.saveData.settings.screenShake) {
          this.camera.shake(phase.phase === 15 ? 22 : (phase.phase >= 9 ? 14 : 8), 0.35);
        }

        const pCount = phase.phase === 15 ? 80 : (phase.phase >= 9 ? 45 : 30);
        for (let i = 0; i < pCount; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 120 + Math.random() * 240;
          let pColor = phase.phase === 15 ? (i % 3 === 0 ? "#f5f3ff" : (i % 3 === 1 ? "#c4b5fd" : "#7c3aed")) : (i % 2 === 0 ? (phase.color || "#a78bfa") : "#2e1065");
          this.particles.push(
            new Particle(this.player.x, this.player.y, Math.cos(angle) * speed, Math.sin(angle) * speed, pColor, 4.8, 0.6)
          );
        }

        const I18n = window.Killstreak && window.Killstreak.I18n;
        const pInfo = (I18n && phase) ? I18n.getPhaseInfo("umbra", phase.phase) : phase;
        const phaseTitle = `UMBRA: ${(pInfo.shortName || phase.shortName).toUpperCase()}!`;
        this.floatingTexts.push(
          new FloatingText(this.player.x, this.player.y - 32, phaseTitle, phase.color || "#a78bfa", 16)
        );

        if (this.callbacks.onToast) {
          const title = I18n ? I18n.t("toasts.umbra_up_title", { defaultValue: "THE VOID DEEPENS" }) : "THE VOID DEEPENS";
          const desc = (pInfo && pInfo.notification) || (I18n ? I18n.t("toasts.umbra_up_desc", { name: pInfo.name, defaultValue: `Reached ${phase.name}` }) : `Reached ${phase.name}`);
          this.callbacks.onToast(title, desc, "🕳️");
        }
        return;
      }

      if (this.player.swordId === "sanguine") {
        if (phase.phase === 16) {
          AchievementSystem.unlockAchievement(this, "sanguine_ascended");
        }

        if (phase.phase === 16 && !this.saveData.sanguinePhase16CutsceneSeen) {
          CutsceneSystem.start(this, "sanguine_p16");
          return;
        }

        if (this.saveData.settings.screenShake) {
          this.camera.shake(phase.phase === 16 ? 22 : (phase.phase >= 9 ? 14 : 8), 0.35);
        }

        const pCount = phase.phase === 16 ? 80 : (phase.phase >= 9 ? 45 : 30);
        for (let i = 0; i < pCount; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 120 + Math.random() * 240;
          let pColor = phase.phase === 16 ? (i % 3 === 0 ? "#fff1f2" : (i % 3 === 1 ? "#ef4444" : "#7f1d1d")) : (i % 2 === 0 ? (phase.color || "#ef4444") : "#7f1d1d");
          this.particles.push(
            new Particle(this.player.x, this.player.y, Math.cos(angle) * speed, Math.sin(angle) * speed, pColor, 4.8, 0.6)
          );
        }

        const I18n = window.Killstreak && window.Killstreak.I18n;
        const pInfo = (I18n && phase) ? I18n.getPhaseInfo("sanguine", phase.phase) : phase;
        const phaseTitle = `SANGUINE: ${(pInfo.shortName || phase.shortName).toUpperCase()}!`;
        this.floatingTexts.push(
          new FloatingText(this.player.x, this.player.y - 32, phaseTitle, phase.color || "#ef4444", 16)
        );

        if (this.callbacks.onToast) {
          const title = I18n ? I18n.t("toasts.sanguine_up_title", { defaultValue: "THE BLOOD RISES" }) : "THE BLOOD RISES";
          const desc = (pInfo && pInfo.notification) || (I18n ? I18n.t("toasts.sanguine_up_desc", { name: pInfo.name, defaultValue: `Reached ${phase.name}` }) : `Reached ${phase.name}`);
          this.callbacks.onToast(title, desc, "🩸");
        }
        return;
      }

      if (phase.phase === 17 && !this.saveData.phase17CutsceneSeen) {
        CutsceneSystem.start(this, "devourer_p17");
        return;
      }

      if (this.saveData.settings.screenShake) {
        this.camera.shake(phase.phase === 17 ? 16 : 10, 0.4);
      }

      const pCount = phase.phase === 17 ? 65 : 35;
      for (let i = 0; i < pCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 100 + Math.random() * 220;
        const pColor = (phase.phase === 17 && i % 2 === 0) ? "#facc15" : phase.color;
        this.particles.push(
          new Particle(this.player.x, this.player.y, Math.cos(angle) * speed, Math.sin(angle) * speed, pColor, 4.8, 0.6)
        );
      }

      const I18n = window.Killstreak && window.Killstreak.I18n;
      const pInfo = (I18n && phase) ? I18n.getPhaseInfo("devourer", phase.phase) : phase;
      this.floatingTexts.push(
        new FloatingText(this.player.x, this.player.y - 32, `DEVOURER: ${(pInfo.shortName || phase.shortName).toUpperCase()}!`, phase.color, 16)
      );

      if (this.callbacks.onToast) {
        const title = I18n ? I18n.t("toasts.devourer_up_title") : "DEVOURER AWAKENED";
        const desc = I18n ? I18n.t("toasts.devourer_up_desc", { name: (pInfo.shortName || phase.shortName).toUpperCase() }) : `PHASE: ${phase.shortName.toUpperCase()}`;
        this.callbacks.onToast(title, desc, "👁️");
      }
    }


















    getNearbySwordStand() {
      if (!this.player) return null;
      const stands = (this.swordStands || [this.swordStand]).filter(s => s.isPlayerNearby(this.player));
      if (stands.length === 0) return null;
      if (stands.length === 1) return stands[0];
      // When multiple stands are within range, pick the one closest to the player
      let closest = stands[0];
      let minDist = Math.hypot(this.player.x - closest.x, this.player.y - closest.y);
      for (let i = 1; i < stands.length; i++) {
        const d = Math.hypot(this.player.x - stands[i].x, this.player.y - stands[i].y);
        if (d < minDist) {
          minDist = d;
          closest = stands[i];
        }
      }
      return closest;
    }

    handleInteraction() {
      if (this.isCutsceneActive) return;
      if (this.currentArea === "LOBBY") {
        const nearbyStand = this.getNearbySwordStand();
        if (nearbyStand) {
          if (this.callbacks.onOpenSwordModal) {
            this.callbacks.onOpenSwordModal(nearbyStand.swordId || "devourer");
          }
          return;
        }
        if (this.lobbyPortal.isPlayerNearby(this.player)) {
          this.enterCombatZone();
          return;
        }
      } else if (this.currentArea === "COMBAT") {
        if (this.atlantisPortal && this.atlantisPortal.isPlayerNearby(this.player)) {
          this.enterAtlantis();
          return;
        }
        if (this.combatPortal.isPlayerNearby(this.player)) {
          this.returnToLobby();
          return;
        }
      } else if (this.currentArea === "ATLANTIS") {
        if (this.atlantisReturnPortal && this.atlantisReturnPortal.isPlayerNearby(this.player)) {
          this.returnToGrasslandFromAtlantis();
          return;
        }
      }
    }

    handleAttackInput() {
      if (this.isGameOver || this.isCutsceneActive) return;
      this.player.attack();
    }









    checkLineCircleCollision(x1, y1, x2, y2, cx, cy, r) {
      const dx = x2 - x1;
      const dy = y2 - y1;
      const lenSq = dx * dx + dy * dy;

      if (lenSq === 0) return Math.hypot(cx - x1, cy - y1) <= r;

      let t = ((cx - x1) * dx + (cy - y1) * dy) / lenSq;
      t = Math.max(0, Math.min(1, t));

      const nearestX = x1 + t * dx;
      const nearestY = y1 + t * dy;
      return Math.hypot(cx - nearestX, cy - nearestY) <= r;
    }

    update(dt) {
      if (this.state === "MENU" || this.isGameOver || this.isPaused) return;

      // Accumulate Active Playtime & Periodic Save
      this.saveData.playTime = (this.saveData.playTime || 0) + dt;
      this.statsSaveTimer = (this.statsSaveTimer || 0) + dt;
      if (this.statsSaveTimer >= 5.0) {
        this.statsSaveTimer = 0;
        Storage.save(this.saveData);
      }

      // Update Skill Cooldowns
      if (this.gluttonyCooldown > 0) {
        this.gluttonyCooldown = Math.max(0, this.gluttonyCooldown - dt);
      }
      if (this.engulfCooldown > 0) {
        this.engulfCooldown = Math.max(0, this.engulfCooldown - dt);
      }
      if (this.activeBeam) {
        this.activeBeam.timer -= dt;
        if (this.activeBeam.timer <= 0) {
          this.activeBeam = null;
        }
      }

      if (this.isCutsceneActive) {
        this.cutsceneTimer += dt;
        // Inward cosmic energy vortex towards player
        if (Math.random() < 0.35) {
          const angle = Math.random() * Math.PI * 2;
          const dist = 120 + Math.random() * 80;
          const px = this.player.x + Math.cos(angle) * dist;
          const py = this.player.y + Math.sin(angle) * dist;
          const vx = -Math.cos(angle) * 140;
          const vy = -Math.sin(angle) * 140;
          this.particles.push(new Particle(px, py, vx, vy, "#facc15", 3.5, 0.6));
        }

        const activeMap = Config.MAPS[this.currentArea];
        this.camera.follow(this.player.x, this.player.y, activeMap.width, activeMap.height, dt);

        for (let i = this.particles.length - 1; i >= 0; i--) {
          this.particles[i].update(dt);
          if (this.particles[i].lifetime <= 0) {
            this.particles.splice(i, 1);
          }
        }
        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
          this.floatingTexts[i].update(dt);
          if (this.floatingTexts[i].lifetime <= 0) {
            this.floatingTexts.splice(i, 1);
          }
        }
        return;
      }

      const activeMap = Config.MAPS[this.currentArea];
      const worldMouse = this.camera.screenToWorld(this.input.screenMouseX, this.input.screenMouseY);

      this.player.update(dt, this.input, activeMap, worldMouse, this.currentArea === "COMBAT" ? this.npcs : []);
      this.camera.follow(this.player.x, this.player.y, activeMap.width, activeMap.height, dt);

      let prompt = null;

      if (this.currentArea === "LOBBY") {
        (this.swordStands || [this.swordStand]).forEach(s => s.update(dt));
        this.lobbyPortal.update(dt);

        const I18n = window.Killstreak && window.Killstreak.I18n;
        const nearbyStand = this.getNearbySwordStand();
        if (nearbyStand) {
          const sInfo = I18n ? I18n.getSwordInfo(nearbyStand.swordId) : null;
          const sName = sInfo ? sInfo.name : (nearbyStand.swordId === "soil" ? "Soil" : (nearbyStand.swordId === "aquatic" ? "Aquatic" : (nearbyStand.swordId === "overdrive" ? "Overdrive" : "Devourer")));
          prompt = I18n ? I18n.t("prompts.inspect", { sword: sName }) : `Inspect ${sName} [E]`;
        } else if (this.lobbyPortal.isPlayerNearby(this.player)) {
          prompt = I18n ? I18n.t("prompts.enter_grassland") : "Enter Grassland [E]";
          if (Math.hypot(this.player.x - this.lobbyPortal.x, this.player.y - this.lobbyPortal.y) < 30) {
            this.enterCombatZone();
            return;
          }
        }
      } else if (this.currentArea === "ATLANTIS") {
        if (this.atlantisReturnPortal) {
          this.atlantisReturnPortal.update(dt);
          if (this.atlantisReturnPortal.isPlayerNearby(this.player)) {
            const I18n = window.Killstreak && window.Killstreak.I18n;
            prompt = I18n ? I18n.t("prompts.return_to_grassland") : "Return to Grassland [E]";
            if (Math.hypot(this.player.x - this.atlantisReturnPortal.x, this.player.y - this.atlantisReturnPortal.y) < 32) {
              this.returnToGrasslandFromAtlantis();
              return;
            }
          }
        }
      } else {
        this.combatPortal.update(dt);
        if (this.atlantisPortal) this.atlantisPortal.update(dt);

        if (this.atlantisPortal && this.atlantisPortal.isPlayerNearby(this.player)) {
          const I18n = window.Killstreak && window.Killstreak.I18n;
          const totalKills = (this.saveData && this.saveData.totalKills) || 0;
          if (totalKills >= 150000) {
            prompt = I18n ? I18n.t("prompts.enter_atlantis") : "Enter Atlantis [E]";
            if (Math.hypot(this.player.x - this.atlantisPortal.x, this.player.y - this.atlantisPortal.y) < 32) {
              this.enterAtlantis();
              return;
            }
          } else {
            prompt = I18n
              ? I18n.t("prompts.enter_atlantis_locked", { current: totalKills.toLocaleString(), req: "150,000" })
              : `Atlantis Portal [Locked - 150,000 Kills required (${totalKills.toLocaleString()}/150,000)]`;
          }
        } else if (this.combatPortal.isPlayerNearby(this.player)) {
          const I18n = window.Killstreak && window.Killstreak.I18n;
          prompt = I18n ? I18n.t("prompts.return_to_lobby") : "Return to Lobby [E]";
          if (Math.hypot(this.player.x - this.combatPortal.x, this.player.y - this.combatPortal.y) < 30) {
            this.returnToLobby();
            return;
          }
        }

        // Engulf Active AoE Tick Processing
        if (this.isEngulfActive) {
          this.engulfTimer -= dt;
          this.player.isEngulfActive = true;
          this.engulfTickTimer += dt;
          const tickInterval = 0.25;
          if (this.engulfTickTimer >= tickInterval) {
            this.engulfTickTimer -= tickInterval;
            const tickDamage = Math.round((5 * (this.player.damage || this.player.phase.damage)) * tickInterval);
            const engulfRadius = 240;

            for (let i = this.npcs.length - 1; i >= 0; i--) {
              const npc = this.npcs[i];
              const dist = Math.hypot(npc.x - this.player.x, npc.y - this.player.y);
              if (dist <= engulfRadius + npc.radius) {
                const hitAngle = Math.atan2(npc.y - this.player.y, npc.x - this.player.x);
                this.player.timeSinceCombat = 0;
                npc.takeDamage(tickDamage, hitAngle, 50);

                if (this.saveData.settings.damageNumbers) {
                  this.floatingTexts.push(
                    new FloatingText(npc.x, npc.y - 14, `-${tickDamage}`, "#facc15", 15)
                  );
                }

                if (Math.random() < 0.45) {
                  this.particles.push(
                    new Particle(npc.x, npc.y, -Math.cos(hitAngle) * 70, -Math.sin(hitAngle) * 70, "#facc15", 3.2, 0.3)
                  );
                }

                if (npc.hp <= 0) {
                  this.handleNpcDeath(npc);
                }
              }
            }

            if (this.saveData.settings.screenShake) {
              this.camera.shake(3, 0.1);
            }
          }

          if (this.engulfTimer <= 0) {
            this.isEngulfActive = false;
            this.player.isEngulfActive = false;
          }
        } else {
          this.player.isEngulfActive = false;
        }

        // Sword Combat Hit Detection (Multi-Layer Arc Sector & Swept Capsule Detection)
        if (this.player.isAttacking && this.player.isSwordEquipped) {
          const swordGeom = this.player.getSwordGeometry();
          const bladeLength = this.player.phase.bladeLength || 40;
          const bladeWidth = this.player.phase.bladeWidth || 10;
          const arcAngle = this.player.phase.arcAngle || (Math.PI * 1.2);
          const maxReach = this.player.radius + bladeLength + 10;

          for (let i = this.npcs.length - 1; i >= 0; i--) {
            const npc = this.npcs[i];
            if (npc.isDead) continue;
            if (npc.hp <= 0) {
              this.handleNpcDeath(npc);
              continue;
            }
            if (this.player.hitEnemiesThisSwing.has(npc)) continue;

            const dx = npc.x - this.player.x;
            const dy = npc.y - this.player.y;
            const dist = Math.hypot(dx, dy);

            let isHit = false;

            // Layer 1: Line-circle check from player center to sword tip with blade width buffer
            if (this.checkLineCircleCollision(
              this.player.x,
              this.player.y,
              swordGeom.tipX,
              swordGeom.tipY,
              npc.x,
              npc.y,
              npc.radius + bladeWidth / 2 + 4
            )) {
              isHit = true;
            }

            // Layer 2: Point-blank contact hit (enemy touching or in immediate contact with player's front)
            if (!isHit && dist <= this.player.radius + npc.radius + 16) {
              const angleToNpc = Math.atan2(dy, dx);
              const angleDiff = Math.atan2(Math.sin(angleToNpc - this.player.angle), Math.cos(angleToNpc - this.player.angle));
              if (Math.abs(angleDiff) <= Math.PI * 0.55) {
                isHit = true;
              }
            }

            // Layer 3: Swept arc sector hit (prevents fast frame jumps skipping enemies in the swing cone)
            if (!isHit && dist <= maxReach + npc.radius) {
              const angleToNpc = Math.atan2(dy, dx);
              const angleDiff = Math.atan2(Math.sin(angleToNpc - this.player.angle), Math.cos(angleToNpc - this.player.angle));
              const angularSpan = Math.asin(Math.min(0.95, npc.radius / Math.max(1, dist)));
              const halfArc = arcAngle / 2 + angularSpan + 0.12;

              if (Math.abs(angleDiff) <= halfArc && this.player.attackProgress > 0.05) {
                const currentOffset = (this.player.attackProgress - 0.5) * arcAngle;
                const minSweptOffset = -arcAngle / 2 - angularSpan - 0.15;
                const maxSweptOffset = currentOffset + angularSpan + 0.15;

                if (angleDiff >= minSweptOffset && angleDiff <= maxSweptOffset) {
                  isHit = true;
                }
              }
            }

            if (isHit) {
              this.player.hitEnemiesThisSwing.add(npc);
              this.player.timeSinceCombat = 0; // Player engaged in combat

              const hitAngle = Math.atan2(npc.y - this.player.y, npc.x - this.player.x);
              const damage = this.player.damage || this.player.phase.damage;
              
              // Only attacked NPC takes damage & activates!
              npc.takeDamage(damage, hitAngle, 180);

              if (this.saveData.settings.damageNumbers) {
                this.floatingTexts.push(
                  new FloatingText(npc.x, npc.y - 12, `-${damage}`, this.player.phase.color, 14)
                );
              }

              if (this.saveData.settings.screenShake) {
                this.camera.shake(3, 0.1);
              }

              for (let p = 0; p < 7; p++) {
                const pAngle = hitAngle + (Math.random() - 0.5) * 1.2;
                const pSpeed = 50 + Math.random() * 90;
                this.particles.push(
                  new Particle(npc.x, npc.y, Math.cos(pAngle) * pSpeed, Math.sin(pAngle) * pSpeed, this.player.phase.color, 3.5, 0.3)
                );
              }

              if (npc.hp <= 0 && !npc.isDead) {
                this.handleNpcDeath(npc);
              }
            }
          }
        }

        // Reaper sweep: Ensure any NPC whose HP reached <= 0 is cleanly handled
        for (let i = this.npcs.length - 1; i >= 0; i--) {
          const npc = this.npcs[i];
          if (!npc.isDead && npc.hp <= 0) {
            this.handleNpcDeath(npc);
          }
        }

        // Update NPCs
        for (let i = this.npcs.length - 1; i >= 0; i--) {
          this.npcs[i].update(dt, this.player, this.npcs, activeMap);
        }

        // Mutual physical collision separation & shoving (player can shove living NPCs)
        const isPlayerWalking = Boolean(this.input.up || this.input.down || this.input.left || this.input.right);
        for (let npc of this.npcs) {
          if (npc.isDead || npc.hp <= 0) continue;
          const pDist = Math.hypot(this.player.x - npc.x, this.player.y - npc.y);
          const minSep = this.player.radius + npc.radius;
          const attackReach = (npc.attackRange || (npc.radius + 14)) + this.player.radius;

          // If hostile NPC is in contact reach during collision or shoving, deal damage!
          if (npc.isHostile && pDist <= attackReach && npc.attackCooldown <= 0 && this.player.hp > 0) {
            this.player.takeDamage(npc.damage, npc);
            npc.attackCooldown = npc.attackRate;
          }

          if (pDist < minSep && pDist > 0.0001) {
            const overlap = minSep - pDist;
            const pAngle = Math.atan2(this.player.y - npc.y, this.player.x - npc.x);
            const shoveRatio = typeof npc.getShoveRatio === "function" ? npc.getShoveRatio() : 0.70;

            if (isPlayerWalking) {
              this.player.x += Math.cos(pAngle) * (overlap * (1 - shoveRatio));
              this.player.y += Math.sin(pAngle) * (overlap * (1 - shoveRatio));
              npc.x -= Math.cos(pAngle) * (overlap * shoveRatio);
              npc.y -= Math.sin(pAngle) * (overlap * shoveRatio);
            } else {
              this.player.x += Math.cos(pAngle) * (overlap * 0.4);
              this.player.y += Math.sin(pAngle) * (overlap * 0.4);
              npc.x -= Math.cos(pAngle) * (overlap * 0.6);
              npc.y -= Math.sin(pAngle) * (overlap * 0.6);
            }
          }
        }

        // Check Player Death
        if (this.player.hp <= 0) {
          this.handlePlayerDeath();
        }

        // 6-Second Slot Respawn System per Zone
        for (let i = this.respawnQueue.length - 1; i >= 0; i--) {
          const item = this.respawnQueue[i];
          item.timer -= dt;

          if (item.timer <= 0) {
            // Check if slot is occupied
            const slotOccupied = this.npcs.some(n => n.zoneIndex === item.zoneIndex && n.slotIndex === item.slotIndex);
            if (!slotOccupied) {
              this.spawnNpcInSlot(item.zoneIndex, item.slotIndex, item.type);
            }
            this.respawnQueue.splice(i, 1);
          }
        }
      }

      if (prompt !== this.activePrompt) {
        this.activePrompt = prompt;
        if (this.callbacks.onPrompt) {
          this.callbacks.onPrompt(Boolean(prompt), prompt);
        }
      }

      // Update Tsunami Skill Cooldown & Projectiles
      if (this.tsunamiCooldown > 0) {
        this.tsunamiCooldown -= dt;
      }
      for (let i = this.activeTsunamis.length - 1; i >= 0; i--) {
        const tsunami = this.activeTsunamis[i];
        tsunami.update(dt, this);
        if (tsunami.isDead) {
          this.activeTsunamis.splice(i, 1);
        }
      }

      // Update Fortitude Skill Cooldown
      if (this.fortitudeCooldown > 0) {
        this.fortitudeCooldown -= dt;
      }

      // Update Metallic Iron Will Skill Cooldown
      if (this.ironWillCooldown > 0) {
        this.ironWillCooldown -= dt;
      }

      // Update Flora Worldroot Skill Cooldown, Heal & Active Effects
      if (this.worldrootCooldown > 0) {
        this.worldrootCooldown -= dt;
      }
      if (this.player && this.player.worldrootHealTimer > 0) {
        this.player.worldrootHealTimer -= dt;
        const heal = (this.player.worldrootHealRate || 0) * dt;
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + heal);
      }
      for (let i = this.activeWorldroots.length - 1; i >= 0; i--) {
        this.activeWorldroots[i].timer -= dt;
        if (this.activeWorldroots[i].timer <= 0) {
          this.activeWorldroots.splice(i, 1);
        }
      }

      // Update Hellfire Cataclysm Skill Cooldown & Active Effects
      if (this.cataclysmCooldown > 0) {
        this.cataclysmCooldown -= dt;
      }
      for (let i = this.activeCataclysms.length - 1; i >= 0; i--) {
        this.activeCataclysms[i].timer -= dt;
        if (this.activeCataclysms[i].timer <= 0) {
          this.activeCataclysms.splice(i, 1);
        }
      }

      // Update Windy Cyclone Skill Cooldown & Active Effects
      if (this.cycloneCooldown > 0) {
        this.cycloneCooldown -= dt;
      }
      for (let i = this.activeCyclones.length - 1; i >= 0; i--) {
        this.activeCyclones[i].timer -= dt;
        if (this.activeCyclones[i].timer <= 0) {
          this.activeCyclones.splice(i, 1);
        }
      }

      // Update Voltstrike Skill Cooldown and the active Zap bolts
      if (this.zapCooldown > 0) {
        this.zapCooldown -= dt;
      }
      for (let i = this.activeZaps.length - 1; i >= 0; i--) {
        this.activeZaps[i].timer -= dt;
        if (this.activeZaps[i].timer <= 0) {
          this.activeZaps.splice(i, 1);
        }
      }

      // Update Frostbite Skill Cooldowns, Freeze pulse, and Blizzard zones
      if (this.freezeCooldown > 0) {
        this.freezeCooldown -= dt;
      }
      if (this.blizzardCooldown > 0) {
        this.blizzardCooldown -= dt;
      }
      for (let i = this.activeFreezes.length - 1; i >= 0; i--) {
        this.activeFreezes[i].timer -= dt;
        if (this.activeFreezes[i].timer <= 0) {
          this.activeFreezes.splice(i, 1);
        }
      }
      for (let i = this.activeBlizzards.length - 1; i >= 0; i--) {
        const bz = this.activeBlizzards[i];
        bz.timer -= dt;
        bz.tickTimer += dt;

        // 50% of current sword damage every 0.25s (20 ticks = 10x damage over the
        // full 5s), plus a 15% slow that is refreshed while the enemy stays inside.
        if (bz.tickTimer >= 0.25) {
          bz.tickTimer -= 0.25;
          const tickDamage = Math.round((this.player.damage || this.player.phase.damage) * 0.5);
          const showNumbers = this.saveData && this.saveData.settings && this.saveData.settings.damageNumbers;

          for (let n = this.npcs.length - 1; n >= 0; n--) {
            const npc = this.npcs[n];
            if (npc.isDead || npc.hp <= 0) continue;
            const d = Math.hypot(npc.x - bz.x, npc.y - bz.y);
            if (d <= bz.radius + npc.radius) {
              const hitAngle = Math.atan2(npc.y - bz.y, npc.x - bz.x);
              npc.slowTimer = 0.3;
              npc.slowFactor = 0.85;
              npc.takeDamage(tickDamage, hitAngle, 20);
              if (showNumbers) {
                this.floatingTexts.push(new FloatingText(npc.x, npc.y - 16, `-${tickDamage}`, "#a5f3fc", 16));
              }
              if (npc.hp <= 0 && !npc.isDead) {
                this.handleNpcDeath(npc);
              }
            }
          }
        }

        if (bz.timer <= 0) {
          this.activeBlizzards.splice(i, 1);
        }
      }

      // Update Lumen / Umbra / Sanguine skill cooldowns and active effects.
      //
      // The per-tick numbers below mirror the constants exported by each ability
      // module (RADIANCE_DAMAGE_FRACTION, EXSANGUINATE_DAMAGE_FRACTION, ...) exactly
      // the way the Blizzard block above mirrors BLIZZARD_*. js/game.js is a legacy
      // IIFE and does not import from src/, so the values are repeated rather than
      // imported; the ability module stays the owner of the number, and the ability
      // module's own header records the same figure.
      if (this.flashCooldown > 0) this.flashCooldown -= dt;
      if (this.radianceCooldown > 0) this.radianceCooldown -= dt;
      if (this.gravityWellCooldown > 0) this.gravityWellCooldown -= dt;
      if (this.erasureCooldown > 0) this.erasureCooldown -= dt;
      if (this.bloodlettingCooldown > 0) this.bloodlettingCooldown -= dt;
      if (this.exsanguinateCooldown > 0) this.exsanguinateCooldown -= dt;

      // Flash, Gravity Well, Erasure and Bloodletting are one-shot bursts — they only
      // need to expire; their whole effect was applied at cast time.
      for (const bursts of [this.activeFlashes, this.activeGravityWells, this.activeErasures, this.activeBloodlettings]) {
        for (let i = bursts.length - 1; i >= 0; i--) {
          bursts[i].timer -= dt;
          if (bursts[i].timer <= 0) bursts.splice(i, 1);
        }
      }

      // Radiance — a personal light field. It follows the wielder, burns everything
      // inside for 45% of sword damage per second and heals 10% of max HP per second.
      for (let i = this.activeRadiances.length - 1; i >= 0; i--) {
        const rd = this.activeRadiances[i];
        rd.timer -= dt;
        rd.tickTimer += dt;
        if (rd.follow && this.player) {
          rd.x = this.player.x;
          rd.y = this.player.y;
        }

        if (rd.tickTimer >= 1.0) {
          rd.tickTimer -= 1.0;
          const tickDamage = Math.round((this.player.damage || this.player.phase.damage) * 0.45);
          const showNumbers = this.saveData && this.saveData.settings && this.saveData.settings.damageNumbers;

          for (let n = this.npcs.length - 1; n >= 0; n--) {
            const npc = this.npcs[n];
            if (npc.isDead || npc.hp <= 0) continue;
            const d = Math.hypot(npc.x - rd.x, npc.y - rd.y);
            if (d > rd.radius + npc.radius) continue;
            const hitAngle = Math.atan2(npc.y - rd.y, npc.x - rd.x);
            npc.takeDamage(tickDamage, hitAngle, 20);
            if (showNumbers) {
              this.floatingTexts.push(new FloatingText(npc.x, npc.y - 16, `-${tickDamage}`, "#fde68a", 16));
            }
            if (npc.hp <= 0 && !npc.isDead) {
              this.handleNpcDeath(npc);
            }
          }

          const heal = Math.round(this.player.maxHp * 0.10);
          this.player.hp = Math.min(this.player.maxHp, this.player.hp + heal);
        }

        if (rd.timer <= 0) {
          this.activeRadiances.splice(i, 1);
        }
      }

      // Exsanguinate — a personal bleed field. It follows the wielder, drains
      // everything inside for 45% of sword damage per second, and heals the wielder
      // for 10% of the damage the bleed actually dealt (not the damage it attempted).
      for (let i = this.activeExsanguinates.length - 1; i >= 0; i--) {
        const ex = this.activeExsanguinates[i];
        ex.timer -= dt;
        ex.tickTimer += dt;
        if (ex.follow && this.player) {
          ex.x = this.player.x;
          ex.y = this.player.y;
        }

        if (ex.tickTimer >= 1.0) {
          ex.tickTimer -= 1.0;
          const tickDamage = Math.round((this.player.damage || this.player.phase.damage) * 0.45);
          const showNumbers = this.saveData && this.saveData.settings && this.saveData.settings.damageNumbers;
          let totalDealt = 0;

          for (let n = this.npcs.length - 1; n >= 0; n--) {
            const npc = this.npcs[n];
            if (npc.isDead || npc.hp <= 0) continue;
            const d = Math.hypot(npc.x - ex.x, npc.y - ex.y);
            if (d > ex.radius + npc.radius) continue;
            const before = npc.hp;
            const hitAngle = Math.atan2(npc.y - ex.y, npc.x - ex.x);
            npc.takeDamage(tickDamage, hitAngle, 20);
            totalDealt += Math.max(0, before - npc.hp);
            if (showNumbers) {
              this.floatingTexts.push(new FloatingText(npc.x, npc.y - 16, `-${tickDamage}`, "#fca5a5", 16));
            }
            if (npc.hp <= 0 && !npc.isDead) {
              this.handleNpcDeath(npc);
            }
          }

          const heal = Math.round(totalDealt * 0.10);
          if (heal > 0) {
            this.player.hp = Math.min(this.player.maxHp, this.player.hp + heal);
          }
        }

        if (ex.timer <= 0) {
          this.activeExsanguinates.splice(i, 1);
        }
      }

      // Update Particles
      for (let i = this.particles.length - 1; i >= 0; i--) {
        this.particles[i].update(dt);
        if (this.particles[i].lifetime <= 0) {
          this.particles.splice(i, 1);
        }
      }

      // Update Floating Texts
      for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
        this.floatingTexts[i].update(dt);
        if (this.floatingTexts[i].lifetime <= 0) {
          this.floatingTexts.splice(i, 1);
        }
      }

      // Notify HUD of Skill Cooldowns & Equipment
      if (this.callbacks.onSkillsUpdate) {
        this.callbacks.onSkillsUpdate({
          isSwordEquipped: this.player.isSwordEquipped,
          swordId: this.player.swordId,
          gluttonyCooldown: this.gluttonyCooldown,
          engulfCooldown: this.engulfCooldown,
          isEngulfActive: this.isEngulfActive,
          tsunamiCooldown: this.tsunamiCooldown,
          fortitudeCooldown: this.fortitudeCooldown,
          shield: this.player.shield,
          ironWillCooldown: this.ironWillCooldown,
          ironWillActive: Boolean(this.player.ironWillActive || this.player.ironWillTimer > 0),
          worldrootCooldown: this.worldrootCooldown,
          cataclysmCooldown: this.cataclysmCooldown,
          cycloneCooldown: this.cycloneCooldown,
          freezeCooldown: this.freezeCooldown,
          blizzardCooldown: this.blizzardCooldown,
          zapCooldown: this.zapCooldown,
          flashCooldown: this.flashCooldown,
          radianceCooldown: this.radianceCooldown,
          gravityWellCooldown: this.gravityWellCooldown,
          erasureCooldown: this.erasureCooldown,
          bloodlettingCooldown: this.bloodlettingCooldown,
          exsanguinateCooldown: this.exsanguinateCooldown,
          phase: this.player.phase.phase
        });
      }

      // Update Navigation & Minimap System
      if (window.Killstreak && window.Killstreak.MapSystem) {
        window.Killstreak.MapSystem.update(dt);
      }

      // Update Bloodmoon Event
      BloodmoonEventSystem.updateBloodmoon(this, dt);
    }

    /**
     * Bloodmoon Event System
     * - 2% chance to trigger every 1 minute (only when not active)
     * - Duration: 15 minutes (900 seconds)
     * - Effects: +25% HP/Speed/Damage on all active NPCs, screen tint, map tint
     * - Notification: banner appears at event start for ~5 seconds then hides
     */







    handleNpcDeath(npc) {
      if (npc.isDead) return;
      npc.isDead = true;

      const idx = this.npcs.indexOf(npc);
      if (idx !== -1) {
        this.npcs.splice(idx, 1);
      }

      const zone = Config.MAPS.COMBAT.npcZones[npc.zoneIndex];
      const respawnDelay = (zone && zone.respawnDelay) || Config.MAPS.COMBAT.respawnDelay || 6.0;

      // Queue respawn back into its exact formation slot
      this.respawnQueue.push({
        zoneIndex: npc.zoneIndex,
        slotIndex: npc.slotIndex,
        type: npc.type,
        timer: respawnDelay
      });

      let particleColor = "#ef4444";
      let count = 16;
      if (npc.type === "fairy") { particleColor = "#38bdf8"; count = 24; }
      else if (npc.type === "guard") { particleColor = "#f8fafc"; count = 28; }
      else if (npc.type === "thug") { particleColor = "#f59e0b"; count = 20; }
      else if (npc.type === "swordman") { particleColor = "#3b82f6"; count = 28; }
      else if (npc.type === "buff_man") { particleColor = "#d97706"; count = 35; }
      else if (npc.type === "elf") { particleColor = "#10b981"; count = 32; }

      for (let p = 0; p < count; p++) {
        const pAngle = Math.random() * Math.PI * 2;
        const pSpeed = 60 + Math.random() * 140;
        this.particles.push(
          new Particle(npc.x, npc.y, Math.cos(pAngle) * pSpeed, Math.sin(pAngle) * pSpeed, particleColor, 4.5, 0.5)
        );
      }

      // Award Kills & Killstreak Separately
      let killsAwarded = typeof npc.killsAwarded === "number" ? npc.killsAwarded : 1;
      let streakAwarded = typeof npc.killstreakAwarded === "number" ? npc.killstreakAwarded : (npc.killsAwarded || 1);

      // In Bloodmoon: NPCs yield 1.5x rounded up killstreak and +1 kill compared to normal
      const isBloodmoonActive = Boolean(this.bloodmoon && this.bloodmoon.isActive);
      if (isBloodmoonActive) {
        streakAwarded = Math.ceil(streakAwarded * 1.5);
        killsAwarded += 1;
      }

      this.saveData.totalKills = (this.saveData.totalKills || 0) + killsAwarded;
      this.saveData.kills = this.saveData.totalKills;

      // Process each awarded killstreak point individually to accurately transition phases and apply scaling
      for (let k = 0; k < streakAwarded; k++) {
        this.killstreak += 1;
        const phaseChanged = this.syncSwordPhase();
        if (!phaseChanged && this.player.isSwordEquipped) {
          this.player.applyKillstreakScaling(this.killstreak);
        }
      }

      if (npc.type !== "normal" || isBloodmoonActive) {
        let ftColor = isBloodmoonActive ? "#ef4444" : "#38bdf8";
        if (!isBloodmoonActive) {
          if (npc.type === "guard") ftColor = "#f8fafc";
          else if (npc.type === "thug") ftColor = "#f59e0b";
          else if (npc.type === "swordman") ftColor = "#60a5fa";
          else if (npc.type === "buff_man") ftColor = "#fbbf24";
          else if (npc.type === "elf") ftColor = "#34d399";
        }

        const streakMsg = isBloodmoonActive ? `+${streakAwarded} BLOOD STREAK! (+${killsAwarded} KILLS)` : `+${streakAwarded} STREAK!`;
        this.floatingTexts.push(
          new FloatingText(npc.x, npc.y - 20, streakMsg, ftColor, 16)
        );
      }

      if (this.killstreak > this.saveData.highestKillstreak) {
        this.saveData.highestKillstreak = this.killstreak;
      }

      AchievementSystem.checkAchievements(this);
      Storage.save(this.saveData);

      if (this.callbacks.onKill) {
        this.callbacks.onKill(this.killstreak, this.saveData.highestKillstreak, this.saveData.kills, this.saveData.totalKills);
      }
    }

    setDebugMode(active) {
      this.isDebugModeActive = Boolean(active);
    }

    addDebugTotalKills(amount) {
      if (!this.isDebugModeActive) return false;
      const parseFn = (window.Killstreak && window.Killstreak.parseNumberInput) || (Config && Config.parseNumberInput);
      const count = Math.max(1, typeof amount === "number" ? amount : (parseFn ? parseFn(amount) : Number(amount) || 0));
      if (count <= 0) return false;

      this.saveData.totalKills = (this.saveData.totalKills || 0) + count;
      this.saveData.kills = this.saveData.totalKills;

      // Note: Modifies Total Kills only — does NOT modify current sword's killstreak or trigger phase progression
      AchievementSystem.checkAchievements(this);
      Storage.save(this.saveData);

      if (this.callbacks.onKill) {
        this.callbacks.onKill(this.killstreak, this.saveData.highestKillstreak, this.saveData.kills, this.saveData.totalKills);
      }

      if (this.callbacks.onToast) {
        const I18n = window.Killstreak && window.Killstreak.I18n;
        const fmtFn = (window.Killstreak && window.Killstreak.formatNumber) || (Config && Config.formatNumber);
        const fCount = fmtFn ? fmtFn(count).short : count.toLocaleString();
        const fTotal = fmtFn ? fmtFn(this.saveData.totalKills || 0).short : (this.saveData.totalKills || 0).toLocaleString();
        const title = I18n ? I18n.t("toasts.debug_kills_add_title") : "Debug: Total Kills Added";
        const desc = I18n ? I18n.t("toasts.debug_kills_add_desc", { count: fCount, total: fTotal }) : `Added +${fCount} Total Kills (Total: ${fTotal})`;
        this.callbacks.onToast(title, desc, "⚡");
      }

      return true;
    }

    setDebugTotalKills(amount) {
      if (!this.isDebugModeActive) return false;
      const parseFn = (window.Killstreak && window.Killstreak.parseNumberInput) || (Config && Config.parseNumberInput);
      const count = Math.max(0, typeof amount === "number" ? amount : (parseFn ? parseFn(amount) : Number(amount) || 0));

      this.saveData.totalKills = count;
      this.saveData.kills = count;

      AchievementSystem.checkAchievements(this);
      Storage.save(this.saveData);

      if (this.callbacks.onKill) {
        this.callbacks.onKill(this.killstreak, this.saveData.highestKillstreak, this.saveData.kills, this.saveData.totalKills);
      }

      if (this.callbacks.onToast) {
        const I18n = window.Killstreak && window.Killstreak.I18n;
        const fmtFn = (window.Killstreak && window.Killstreak.formatNumber) || (Config && Config.formatNumber);
        const fCount = fmtFn ? fmtFn(count).short : count.toLocaleString();
        const title = I18n ? I18n.t("toasts.debug_kills_set_title") : "Debug: Total Kills Set";
        const desc = I18n ? I18n.t("toasts.debug_kills_set_desc", { count: fCount }) : `Total Kills set to ${fCount}`;
        this.callbacks.onToast(title, desc, "⚡");
      }

      return true;
    }

    addDebugKills(amount) {
      return this.addDebugTotalKills(amount);
    }

    setDebugKillstreak(amount) {
      if (!this.isDebugModeActive) return false;
      const parseFn = (window.Killstreak && window.Killstreak.parseNumberInput) || (Config && Config.parseNumberInput);
      const val = Math.max(0, typeof amount === "number" ? amount : (parseFn ? parseFn(amount) : Number(amount) || 0));

      this.killstreak = val;
      if (this.killstreak > this.saveData.highestKillstreak) {
        this.saveData.highestKillstreak = this.killstreak;
      }

      // Sync sword phase and recalculate scaling for new killstreak
      this.syncSwordPhase(true);
      if (this.player.isSwordEquipped && typeof this.player.applyKillstreakScaling === "function") {
        this.player.applyKillstreakScaling(this.killstreak);
      }

      AchievementSystem.checkAchievements(this);
      Storage.save(this.saveData);

      if (this.callbacks.onKill) {
        this.callbacks.onKill(this.killstreak, this.saveData.highestKillstreak, this.saveData.kills, this.saveData.totalKills);
      }

      if (this.callbacks.onToast) {
        const I18n = window.Killstreak && window.Killstreak.I18n;
        const fmtFn = (window.Killstreak && window.Killstreak.formatNumber) || (Config && Config.formatNumber);
        const fVal = fmtFn ? fmtFn(val).short : val.toLocaleString();
        const title = I18n ? I18n.t("toasts.debug_streak_set_title") : "Debug: Killstreak Set";
        const desc = I18n ? I18n.t("toasts.debug_streak_set_desc", { val: fVal }) : `Current sword killstreak set to ${fVal}`;
        this.callbacks.onToast(title, desc, "⚡");
      }

      return true;
    }

    grantDebugBadge(badgeId) {
      if (!this.isDebugModeActive) return false;
      const ach = Config.ACHIEVEMENTS.find(a => (a.id === badgeId || a.badge === badgeId));
      if (!ach) return false;

      let changed = false;
      if (!this.saveData.achievements.includes(ach.id)) {
        this.saveData.achievements.push(ach.id);
        changed = true;
      }
      if (!this.saveData.badges.includes(ach.badge)) {
        this.saveData.badges.push(ach.badge);
        changed = true;
      }

      if (changed) {
        Storage.save(this.saveData);
        if (this.callbacks.onBadgesUpdated) {
          this.callbacks.onBadgesUpdated(this.saveData.badges);
        }
        if (this.callbacks.onToast) {
          const I18n = window.Killstreak && window.Killstreak.I18n;
          const achInfo = I18n ? I18n.getAchievementInfo(ach.id) : ach;
          const title = I18n ? I18n.t("toasts.debug_badge_title") : "Debug: Badge Granted";
          this.callbacks.onToast(title, `${achInfo.title}: ${achInfo.description}`, ach.icon);
        }
      }
      return true;
    }

    grantAllDebugBadges() {
      if (!this.isDebugModeActive) return false;
      let count = 0;
      Config.ACHIEVEMENTS.forEach(ach => {
        let changed = false;
        if (!this.saveData.achievements.includes(ach.id)) {
          this.saveData.achievements.push(ach.id);
          changed = true;
        }
        if (!this.saveData.badges.includes(ach.badge)) {
          this.saveData.badges.push(ach.badge);
          changed = true;
        }
        if (changed) count++;
      });

      if (count > 0) {
        Storage.save(this.saveData);
        if (this.callbacks.onBadgesUpdated) {
          this.callbacks.onBadgesUpdated(this.saveData.badges);
        }
        if (this.callbacks.onToast) {
          const I18n = window.Killstreak && window.Killstreak.I18n;
          const title = I18n ? I18n.t("toasts.debug_badges_title") : "Debug: Badges Granted";
          const desc = I18n ? I18n.t("toasts.debug_badges_desc", { count }) : `Granted ${count} badge(s). All achievements unlocked.`;
          this.callbacks.onToast(title, desc, "👑");
        }
      } else {
        if (this.callbacks.onToast) {
          const I18n = window.Killstreak && window.Killstreak.I18n;
          const title = I18n ? I18n.t("toasts.debug_badge_title") : "Debug: Badges";
          const desc = I18n ? I18n.t("toasts.debug_badges_all_unlocked") : "All achievements are already unlocked.";
          this.callbacks.onToast(title, desc, "👑");
        }
      }
      return true;
    }

    resetAllProgress() {
      this.saveData = Storage.reset();
      this.killstreak = 0;
      this.isDebugModeActive = false;

      // Reset all sword skills & active effects
      this.gluttonyCooldown = 0;
      this.engulfCooldown = 0;
      this.isEngulfActive = false;
      this.engulfTimer = 0;
      this.engulfTickTimer = 0;
      this.activeBeam = null;
      this.tsunamiCooldown = 0;
      this.activeTsunamis = [];
      this.fortitudeCooldown = 0;
      this.ironWillCooldown = 0;
      this.worldrootCooldown = 0;
      this.cataclysmCooldown = 0;
      this.activeWorldroots = [];
      this.activeCataclysms = [];
      this.cycloneCooldown = 0;
      this.activeCyclones = [];
      this.freezeCooldown = 0;
      this.activeFreezes = [];
      this.blizzardCooldown = 0;
      this.activeBlizzards = [];
      this.zapCooldown = 0;
      this.activeZaps = [];
      this.flashCooldown = 0;
      this.activeFlashes = [];
      this.radianceCooldown = 0;
      this.activeRadiances = [];
      this.gravityWellCooldown = 0;
      this.activeGravityWells = [];
      this.erasureCooldown = 0;
      this.activeErasures = [];
      this.bloodlettingCooldown = 0;
      this.activeBloodlettings = [];
      this.exsanguinateCooldown = 0;
      this.activeExsanguinates = [];
      if (this.player) {
        this.player.isEngulfActive = false;
        this.player.swordId = "devourer";
        this.player.swordName = "Devourer";
        this.player.isSwordEquipped = true;
        this.player.phaseKills = 0;
        this.player.killstreak = 0;
        this.player.shield = 0;
        this.player.shieldDuration = 0;
        this.player.ironWillActive = false;
        this.player.ironWillTimer = 0;
        this.player.worldrootHealTimer = 0;
        this.player.vx = 0;
        this.player.vy = 0;
      }

      this.syncSwordPhase(true);
      if (this.player && typeof this.player.applyKillstreakScaling === "function") {
        this.player.applyKillstreakScaling(0);
      }
      if (this.player) {
        this.player.hp = this.player.maxHp;
      }

      this.isGameOver = false;
      this.activePrompt = null;
      this.respawnQueue = [];

      if (this.callbacks.onKill) {
        this.callbacks.onKill(0, 0, 0, 0);
      }
      if (this.callbacks.onPhaseChange && this.player) {
        this.callbacks.onPhaseChange(this.player.phase);
      }
      if (this.callbacks.onSkillsUpdate && this.player) {
        this.callbacks.onSkillsUpdate({
          isSwordEquipped: this.player.isSwordEquipped,
          swordId: this.player.swordId,
          gluttonyCooldown: this.gluttonyCooldown,
          engulfCooldown: this.engulfCooldown,
          isEngulfActive: this.isEngulfActive,
          tsunamiCooldown: this.tsunamiCooldown,
          fortitudeCooldown: this.fortitudeCooldown,
          shield: this.player.shield,
          ironWillCooldown: this.ironWillCooldown,
          ironWillActive: false,
          worldrootCooldown: this.worldrootCooldown,
          cataclysmCooldown: this.cataclysmCooldown,
          cycloneCooldown: this.cycloneCooldown,
          freezeCooldown: this.freezeCooldown,
          blizzardCooldown: this.blizzardCooldown,
          zapCooldown: this.zapCooldown,
          flashCooldown: this.flashCooldown,
          radianceCooldown: this.radianceCooldown,
          gravityWellCooldown: this.gravityWellCooldown,
          erasureCooldown: this.erasureCooldown,
          bloodlettingCooldown: this.bloodlettingCooldown,
          exsanguinateCooldown: this.exsanguinateCooldown,
          phase: this.player.phase.phase
        });
      }
      if (this.callbacks.onBadgesUpdated) {
        this.callbacks.onBadgesUpdated([]);
      }
    }

    handlePlayerDeath() {
      this.isGameOver = true;
      const finalStreak = this.killstreak;
      const finalPhaseName = this.player.phase.name;

      // Safely reset skills on death
      this.gluttonyCooldown = 0;
      this.engulfCooldown = 0;
      this.isEngulfActive = false;
      this.player.isEngulfActive = false;
      this.engulfTimer = 0;
      this.activeBeam = null;
      this.tsunamiCooldown = 0;
      this.activeTsunamis = [];
      this.fortitudeCooldown = 0;
      this.ironWillCooldown = 0;
      this.worldrootCooldown = 0;
      this.cataclysmCooldown = 0;
      this.activeWorldroots = [];
      this.activeCataclysms = [];
      this.cycloneCooldown = 0;
      this.activeCyclones = [];
      this.freezeCooldown = 0;
      this.activeFreezes = [];
      this.blizzardCooldown = 0;
      this.activeBlizzards = [];
      this.zapCooldown = 0;
      this.activeZaps = [];
      this.flashCooldown = 0;
      this.activeFlashes = [];
      this.radianceCooldown = 0;
      this.activeRadiances = [];
      this.gravityWellCooldown = 0;
      this.activeGravityWells = [];
      this.erasureCooldown = 0;
      this.activeErasures = [];
      this.bloodlettingCooldown = 0;
      this.activeBloodlettings = [];
      this.exsanguinateCooldown = 0;
      this.activeExsanguinates = [];
      if (this.player) {
        this.player.shield = 0;
        this.player.shieldDuration = 0;
        this.player.ironWillActive = false;
        this.player.ironWillTimer = 0;
        this.player.worldrootHealTimer = 0;
      }

      for (let p = 0; p < 30; p++) {
        const pAngle = Math.random() * Math.PI * 2;
        const pSpeed = 60 + Math.random() * 160;
        this.particles.push(
          new Particle(this.player.x, this.player.y, Math.cos(pAngle) * pSpeed, Math.sin(pAngle) * pSpeed, "#38bdf8", 5, 0.6)
        );
      }

      this.killstreak = 0;
      this.syncSwordPhase(true);
      if (this.player && this.player.isSwordEquipped && typeof this.player.applyKillstreakScaling === "function") {
        this.player.applyKillstreakScaling(0);
      }
      Storage.save(this.saveData);

      if (this.callbacks.onGameOver) {
        this.callbacks.onGameOver(finalStreak, finalPhaseName, this.saveData.highestKillstreak);
      }
    }

    respawnInCombat() {
      this.isGameOver = false;
      this.setupArea(this.currentArea === "ATLANTIS" ? "ATLANTIS" : "COMBAT");
      this.killstreak = 0;
      this.syncSwordPhase(true);

      if (this.callbacks.onRespawn) {
        this.callbacks.onRespawn();
      }
    }

    draw() {
      this.render();
    }

    render() {
      this.ctx.clearRect(0, 0, this.viewport.width, this.viewport.height);

      if (this.state === "MENU") {
        LobbyRenderer.drawAmbientMenuBg(this);
        return;
      }

      const activeMap = Config.MAPS[this.currentArea];
      const cameraOffset = this.camera.getOffset();

      this.ctx.save();
      this.ctx.translate(-cameraOffset.x, -cameraOffset.y);

      // 1. Draw Map Floor Terrain & Features
      WorldRenderer.drawMapWorld(this, activeMap);

      // 1b. Draw Lobby Floor Elements (Woven Rugs & Ambient Light Pools) BEFORE interactive zones
      if (this.currentArea === "LOBBY") {
        LobbyRenderer.drawLobbyFloor(this, activeMap);
      }

      // 2. Draw Interactive Zones
      if (this.currentArea === "LOBBY") {
        const nearbyStand = this.getNearbySwordStand();
        (this.swordStands || [this.swordStand]).forEach(stand => {
          const sId = stand.swordId || "devourer";
          const sDef = Config.SWORDS ? Config.SWORDS[sId] : null;
          const isLocked = sDef ? (this.saveData.totalKills || 0) < sDef.unlockKills : false;
          let standPhase = null;
          if (this.player.swordId === sId && this.player.isSwordEquipped) {
            standPhase = this.player.phase;
          } else {
            const pList = sId === "sanguine" ? Config.SANGUINE_PHASES : (sId === "umbra" ? Config.UMBRA_PHASES : (sId === "lumen" ? Config.LUMEN_PHASES : (sId === "voltstrike" ? Config.VOLTSTRIKE_PHASES : (sId === "frostbite" ? Config.FROSTBITE_PHASES : (sId === "windy" ? Config.WINDY_PHASES : (sId === "hellfire" ? Config.HELLFIRE_PHASES : (sId === "flora" ? Config.FLORA_PHASES : (sId === "metallic" ? Config.METALLIC_PHASES : (sId === "soil" ? Config.SOIL_PHASES : (sId === "aquatic" ? Config.AQUATIC_PHASES : (sId === "overdrive" ? Config.OVERDRIVE_PHASES : Config.SWORD_PHASES)))))))))));
            const pNum = sId === "sanguine" ? (this.saveData.sanguinePhase || 1) : (sId === "umbra" ? (this.saveData.umbraPhase || 1) : (sId === "lumen" ? (this.saveData.lumenPhase || 1) : (sId === "voltstrike" ? (this.saveData.voltstrikePhase || 1) : (sId === "frostbite" ? (this.saveData.frostbitePhase || 1) : (sId === "windy" ? (this.saveData.windyPhase || 1) : (sId === "hellfire" ? (this.saveData.hellfirePhase || 1) : (sId === "flora" ? (this.saveData.floraPhase || 1) : (sId === "metallic" ? (this.saveData.metallicPhase || 1) : (sId === "soil" ? (this.saveData.soilPhase || 1) : (sId === "aquatic" ? (this.saveData.aquaticPhase || 1) : (sId === "overdrive" ? (this.saveData.overdrivePhase || 1) : (this.saveData.swordPhase || 1))))))))))))
            standPhase = pList.find(p => p.phase === pNum) || pList[0];
          }
          stand.draw(this.ctx, standPhase, isLocked, false, Boolean(nearbyStand));
        });

        // If a stand is focused, draw its elevated illuminated badge on top of all pedestals
        if (nearbyStand && typeof nearbyStand.drawBadge === "function") {
          const sId = nearbyStand.swordId || "devourer";
          const sDef = Config.SWORDS ? Config.SWORDS[sId] : null;
          const isLocked = sDef ? (this.saveData.totalKills || 0) < sDef.unlockKills : false;
          let standPhase = null;
          if (this.player.swordId === sId && this.player.isSwordEquipped) {
            standPhase = this.player.phase;
          } else {
            const pList = sId === "sanguine" ? Config.SANGUINE_PHASES : (sId === "umbra" ? Config.UMBRA_PHASES : (sId === "lumen" ? Config.LUMEN_PHASES : (sId === "voltstrike" ? Config.VOLTSTRIKE_PHASES : (sId === "frostbite" ? Config.FROSTBITE_PHASES : (sId === "windy" ? Config.WINDY_PHASES : (sId === "hellfire" ? Config.HELLFIRE_PHASES : (sId === "flora" ? Config.FLORA_PHASES : (sId === "metallic" ? Config.METALLIC_PHASES : (sId === "soil" ? Config.SOIL_PHASES : (sId === "aquatic" ? Config.AQUATIC_PHASES : (sId === "overdrive" ? Config.OVERDRIVE_PHASES : Config.SWORD_PHASES)))))))))));
            const pNum = sId === "sanguine" ? (this.saveData.sanguinePhase || 1) : (sId === "umbra" ? (this.saveData.umbraPhase || 1) : (sId === "lumen" ? (this.saveData.lumenPhase || 1) : (sId === "voltstrike" ? (this.saveData.voltstrikePhase || 1) : (sId === "frostbite" ? (this.saveData.frostbitePhase || 1) : (sId === "windy" ? (this.saveData.windyPhase || 1) : (sId === "hellfire" ? (this.saveData.hellfirePhase || 1) : (sId === "flora" ? (this.saveData.floraPhase || 1) : (sId === "metallic" ? (this.saveData.metallicPhase || 1) : (sId === "soil" ? (this.saveData.soilPhase || 1) : (sId === "aquatic" ? (this.saveData.aquaticPhase || 1) : (sId === "overdrive" ? (this.saveData.overdrivePhase || 1) : (this.saveData.swordPhase || 1))))))))))))
            standPhase = pList.find(p => p.phase === pNum) || pList[0];
          }
          nearbyStand.drawBadge(this.ctx, standPhase, isLocked);
        }

        this.lobbyPortal.draw(this.ctx);
      } else if (this.currentArea === "COMBAT") {
        this.combatPortal.draw(this.ctx);
      } else if (this.currentArea === "ATLANTIS") {
        // Return portal, corals, and rocks are rendered in WorldRenderer.drawAtlantisWorld
      }

      // 3. Draw Village Ground Structures (Well, Barrels, Houses) or Lounge Furniture/Props
      if (this.currentArea === "COMBAT") {
        WorldRenderer.drawVillageStructures(this, activeMap);
      } else if (this.currentArea === "LOBBY") {
        LobbyRenderer.drawLobbyFurnitureAndProps(this, activeMap);
      }

      // 4. Draw Rocks (for maps other than Atlantis, since Atlantis renders underwater styled rocks & corals)
      if (this.currentArea !== "ATLANTIS") {
        for (let rock of this.rocks) {
          rock.draw(this.ctx);
        }
      }

      // 4. Draw NPCs
      for (let npc of this.npcs) {
        npc.draw(this.ctx);
      }

      // 5. Draw Player
      if (!this.isGameOver) {
        this.player.draw(this.ctx);
      }

      // Draw Gluttony Beam (if active)
      if (this.activeBeam) {
        getSwordRenderer("devourer").drawBeam(this.ctx, this);
      }

      // Draw Active Tsunamis (if any)
      for (let tsunami of this.activeTsunamis) {
        tsunami.draw(this.ctx);
      }

      // Draw Active Worldroots (if any)
      for (let wr of this.activeWorldroots) {
        const progress = wr.timer / wr.maxTimer;
        this.ctx.save();
        this.ctx.strokeStyle = `rgba(74, 222, 128, ${progress * 0.85})`;
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(wr.x, wr.y, wr.radius * (1 - progress * 0.15), 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.fillStyle = `rgba(21, 128, 61, ${progress * 0.2})`;
        this.ctx.fill();
        this.ctx.restore();
      }

      // Draw Active Cataclysms (if any)
      for (let c of this.activeCataclysms) {
        const progress = c.timer / c.maxTimer;
        this.ctx.save();
        this.ctx.strokeStyle = `rgba(239, 68, 68, ${progress * 0.9})`;
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.arc(c.x, c.y, c.radius * (1 - progress * 0.12), 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.fillStyle = `rgba(220, 38, 38, ${progress * 0.25})`;
        this.ctx.fill();
        this.ctx.restore();
      }

      // Draw Active Cyclones (if any) — Windy: a rotating vortex, not a blast ring
      for (let cy of this.activeCyclones) {
        const progress = cy.timer / cy.maxTimer;
        this.ctx.save();
        this.ctx.strokeStyle = `rgba(34, 211, 238, ${progress * 0.9})`;
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.arc(cy.x, cy.y, cy.radius * (1 - progress * 0.12), 0, Math.PI * 2);
        this.ctx.stroke();

        // A counter-rotating inner ring is what makes it read as spinning.
        this.ctx.strokeStyle = `rgba(224, 242, 254, ${progress * 0.7})`;
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([14, 9]);
        this.ctx.beginPath();
        this.ctx.arc(cy.x, cy.y, cy.radius * (1 - progress * 0.12) * 0.68, progress * 6, progress * 6 + Math.PI * 2);
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        this.ctx.fillStyle = `rgba(6, 182, 212, ${progress * 0.18})`;
        this.ctx.fill();
        this.ctx.restore();
      }

      // Draw Active Zap bolts — Voltstrike: a single strike, so a bolt rather than a ring
      for (let zap of this.activeZaps) {
        const progress = zap.timer / zap.maxTimer;
        this.ctx.save();
        this.ctx.strokeStyle = `rgba(254, 243, 199, ${progress * 0.55})`;
        this.ctx.lineWidth = 6;
        this.ctx.beginPath();
        this.ctx.moveTo(zap.x0, zap.y0);
        this.ctx.lineTo(zap.x1, zap.y1);
        this.ctx.stroke();

        // Jagged core, deterministic from the stored seed so it does not flicker
        // into a different shape every frame.
        this.ctx.strokeStyle = `rgba(255, 255, 255, ${0.5 + progress * 0.5})`;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(zap.x0, zap.y0);
        const segs = 7;
        for (let i = 1; i < segs; i++) {
          const t = i / segs;
          const j = (Math.sin((zap.seed + i) * 91.7) * 24634.6345 % 1) * 14 * Math.sin(t * Math.PI);
          this.ctx.lineTo(zap.x0 + (zap.x1 - zap.x0) * t + j, zap.y0 + (zap.y1 - zap.y0) * t + j * 0.6);
        }
        this.ctx.lineTo(zap.x1, zap.y1);
        this.ctx.stroke();
        this.ctx.restore();
      }

      // Draw Active Freeze Pulses — Frostbite: the ring expands as it fades
      for (let fz of this.activeFreezes) {
        const progress = fz.timer / fz.maxTimer;
        this.ctx.save();
        this.ctx.strokeStyle = `rgba(165, 243, 252, ${progress * 0.9})`;
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.arc(fz.x, fz.y, fz.radius * (1.15 - progress * 0.15), 0, Math.PI * 2);
        this.ctx.stroke();

        this.ctx.strokeStyle = `rgba(224, 242, 254, ${progress * 0.6})`;
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([10, 8]);
        this.ctx.beginPath();
        this.ctx.arc(fz.x, fz.y, fz.radius * (1.15 - progress * 0.15) * 0.9, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        this.ctx.fillStyle = `rgba(56, 189, 248, ${progress * 0.14})`;
        this.ctx.fill();
        this.ctx.restore();
      }

      // Draw Active Blizzards — a persistent storm zone, not a blast ring
      for (let bz of this.activeBlizzards) {
        const progress = bz.timer / bz.maxTimer;
        this.ctx.save();

        this.ctx.fillStyle = `rgba(103, 232, 249, ${0.08 + progress * 0.08})`;
        this.ctx.beginPath();
        this.ctx.arc(bz.x, bz.y, bz.radius, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.strokeStyle = `rgba(186, 230, 253, ${0.35 + progress * 0.35})`;
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(bz.x, bz.y, bz.radius, 0, Math.PI * 2);
        this.ctx.stroke();

        // Snow falling inside the zone, so it reads as weather rather than a circle.
        this.ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
        for (let i = 0; i < 26; i++) {
          const a = i * 2.4 + (bz.maxTimer - bz.timer) * 1.2;
          const rr = bz.radius * (0.2 + ((i * 0.137) % 1) * 0.78);
          this.ctx.beginPath();
          this.ctx.arc(bz.x + Math.cos(a) * rr, bz.y + Math.sin(a) * rr, 1.6, 0, Math.PI * 2);
          this.ctx.fill();
        }

        this.ctx.restore();
      }

      // Draw Active Lumen Flash bursts — a ring of light expanding outward
      for (let fl of this.activeFlashes) {
        const progress = fl.timer / fl.maxTimer;
        this.ctx.save();
        this.ctx.strokeStyle = `rgba(255, 251, 235, ${progress * 0.95})`;
        this.ctx.lineWidth = 5;
        this.ctx.beginPath();
        this.ctx.arc(fl.x, fl.y, fl.radius * (1.15 - progress * 0.15), 0, Math.PI * 2);
        this.ctx.stroke();

        this.ctx.strokeStyle = `rgba(253, 224, 71, ${progress * 0.7})`;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(fl.x, fl.y, fl.radius * (1.15 - progress * 0.15) * 0.86, 0, Math.PI * 2);
        this.ctx.stroke();

        this.ctx.fillStyle = `rgba(254, 243, 199, ${progress * 0.16})`;
        this.ctx.fill();
        this.ctx.restore();
      }

      // Draw Active Lumen Radiance fields — light held around the wielder, not a blast
      for (let rd of this.activeRadiances) {
        const progress = rd.timer / rd.maxTimer;
        this.ctx.save();
        this.ctx.fillStyle = `rgba(254, 243, 199, ${0.06 + progress * 0.08})`;
        this.ctx.beginPath();
        this.ctx.arc(rd.x, rd.y, rd.radius, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.strokeStyle = `rgba(255, 251, 235, ${0.35 + progress * 0.45})`;
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(rd.x, rd.y, rd.radius, 0, Math.PI * 2);
        this.ctx.stroke();

        // Straight rays rather than dashes: Radiance is emitted, not falling.
        this.ctx.strokeStyle = `rgba(253, 230, 138, ${progress * 0.55})`;
        this.ctx.lineWidth = 1.6;
        for (let i = 0; i < 12; i++) {
          const a = (i / 12) * Math.PI * 2 + (rd.maxTimer - rd.timer) * 0.8;
          this.ctx.beginPath();
          this.ctx.moveTo(rd.x + Math.cos(a) * rd.radius * 0.72, rd.y + Math.sin(a) * rd.radius * 0.72);
          this.ctx.lineTo(rd.x + Math.cos(a) * rd.radius, rd.y + Math.sin(a) * rd.radius);
          this.ctx.stroke();
        }
        this.ctx.restore();
      }

      // Draw Active Umbra Gravity Wells — the ring contracts as it fades
      for (let gw of this.activeGravityWells) {
        const progress = gw.timer / gw.maxTimer;
        this.ctx.save();
        this.ctx.strokeStyle = `rgba(196, 181, 253, ${progress * 0.85})`;
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.arc(gw.x, gw.y, gw.radius * (0.25 + progress * 0.75), 0, Math.PI * 2);
        this.ctx.stroke();

        this.ctx.strokeStyle = `rgba(124, 58, 237, ${progress * 0.6})`;
        this.ctx.lineWidth = 1.6;
        for (let i = 0; i < 10; i++) {
          const a = (i / 10) * Math.PI * 2 + (gw.maxTimer - gw.timer) * 1.2;
          const rOuter = gw.radius * (0.35 + progress * 0.65);
          this.ctx.beginPath();
          this.ctx.moveTo(gw.x + Math.cos(a) * rOuter, gw.y + Math.sin(a) * rOuter);
          this.ctx.lineTo(gw.x + Math.cos(a) * rOuter * 0.82, gw.y + Math.sin(a) * rOuter * 0.82);
          this.ctx.stroke();
        }

        this.ctx.fillStyle = `rgba(0, 0, 0, ${progress * 0.22})`;
        this.ctx.beginPath();
        this.ctx.arc(gw.x, gw.y, gw.radius * (0.25 + progress * 0.75), 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
      }

      // Draw Active Umbra Erasure fields — a hard boundary, filled with absence
      for (let er of this.activeErasures) {
        const progress = er.timer / er.maxTimer;
        this.ctx.save();
        this.ctx.fillStyle = `rgba(0, 0, 0, ${progress * 0.3})`;
        this.ctx.beginPath();
        this.ctx.arc(er.x, er.y, er.radius, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.strokeStyle = `rgba(245, 243, 255, ${progress * 0.95})`;
        this.ctx.lineWidth = 5;
        this.ctx.beginPath();
        this.ctx.arc(er.x, er.y, er.radius * (1.05 - progress * 0.05), 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.restore();
      }

      // Draw Active Sanguine Bloodletting bursts
      for (let bl of this.activeBloodlettings) {
        const progress = bl.timer / bl.maxTimer;
        this.ctx.save();
        this.ctx.strokeStyle = `rgba(239, 68, 68, ${progress * 0.9})`;
        this.ctx.lineWidth = 5;
        this.ctx.beginPath();
        this.ctx.arc(bl.x, bl.y, bl.radius * (1.15 - progress * 0.15), 0, Math.PI * 2);
        this.ctx.stroke();

        this.ctx.strokeStyle = `rgba(127, 29, 29, ${progress * 0.7})`;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(bl.x, bl.y, bl.radius * (1.15 - progress * 0.15) * 0.9, 0, Math.PI * 2);
        this.ctx.stroke();

        this.ctx.fillStyle = `rgba(127, 29, 29, ${progress * 0.18})`;
        this.ctx.fill();
        this.ctx.restore();
      }

      // Draw Active Sanguine Exsanguinate fields — a bleed zone that follows the wielder
      for (let ex of this.activeExsanguinates) {
        const progress = ex.timer / ex.maxTimer;
        this.ctx.save();
        this.ctx.fillStyle = `rgba(127, 29, 29, ${0.08 + progress * 0.1})`;
        this.ctx.beginPath();
        this.ctx.arc(ex.x, ex.y, ex.radius, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.strokeStyle = `rgba(239, 68, 68, ${0.35 + progress * 0.45})`;
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(ex.x, ex.y, ex.radius, 0, Math.PI * 2);
        this.ctx.stroke();

        // Droplets bleeding outward, so it reads as a wound rather than a circle.
        this.ctx.fillStyle = "rgba(254, 202, 202, 0.75)";
        for (let i = 0; i < 24; i++) {
          const a = i * 2.1 + (ex.maxTimer - ex.timer) * 1.4;
          const rr = ex.radius * (0.25 + ((i * 0.137) % 1) * 0.72);
          this.ctx.beginPath();
          this.ctx.arc(ex.x + Math.cos(a) * rr, ex.y + Math.sin(a) * rr, 1.8, 0, Math.PI * 2);
          this.ctx.fill();
        }
        this.ctx.restore();
      }

      // 6. Draw Trees (after player/NPCs for subtle canopy layering)
      for (let tree of this.trees) {
        tree.draw(this.ctx);
      }

      // 7. Draw Particles
      for (let particle of this.particles) {
        particle.draw(this.ctx);
      }

      // 8. Draw Floating Texts
      for (let ft of this.floatingTexts) {
        ft.draw(this.ctx);
      }

      this.ctx.restore();
    }







  }

  window.Killstreak.Game = Game;
})(window);

/**
 * Core Game Configuration
 * Extracted verbatim from js/config.js — viewport, player defaults,
 * bloodmoon settings, storage key, killstreak scaling.
 */

/** Canvas viewport dimensions */
export const VIEWPORT = {
  width: 1000,
  height: 650
};

/** Player base configuration */
export const PLAYER_CONFIG = {
  radius: 18,
  speed: 160,
  speedScale: 8,           // maps phase speed (21..189) → pixels/sec (168..1512)
  defaultMaxHp: 100,
  color: "#38bdf8",
  outlineColor: "#0284c7",
  regenInterval: 1.0,
  regenPercent: 0.10,
  outOfCombatDelay: 5.0
};

/** Bloodmoon event configuration */
export const BLOODMOON_CONFIG = {
  checkInterval: 60,       // seconds between trigger rolls
  chance: 0.10,            // 10% chance per check
  duration: 300            // active duration in seconds (5 minutes)
};

/** localStorage key for save data */
export const STORAGE_KEY = "killstreak_v1_data";

/**
 * Configurable Diminishing Killstreak Scaling (applies to ALL swords).
 * Uses closed-form logarithmic growth:
 *   exp(baseRate × H × ln((streak + H) / (startStreak + H)))
 */
export const KILLSTREAK_SCALING = {
  baseHpRate: 0.005,       // 0.5% base HP growth per killstreak
  baseDamageRate: 0.003,   // 0.3% base Damage growth per killstreak
  halfScaleStreak: 100,    // streak at which scaling efficiency drops to 50%
  minMultiplier: 0.05      // floor ensuring continuous positive growth
};

/** Backward-compatibility alias */
export const DEVOURER_SCALING = KILLSTREAK_SCALING;

/** Achievement definitions */
export const ACHIEVEMENTS = [
  { id: "getting_started",    badge: "getting_started",    icon: "⚔️",  title: "Getting Started",      description: "Join and begin your journey with Devourer.",                                          killsRequired: 0 },
  { id: "all_devourer",       badge: "all_devourer",       icon: "👑",  title: "All Devourer",         description: "Marks completion of the final Devourer phase (75,000 killstreak).",                   killsRequired: 75000 },
  { id: "overdrive_ascended", badge: "overdrive_ascended", icon: "⚡",  title: "Overdrive Ascended",   description: "Unlock when reaching the final phase of Overdrive (25,000 killstreak).",              killsRequired: 25000 },
  { id: "aquatic_ascended",   badge: "aquatic_ascended",   icon: "🌊",  title: "Aquatic Ascended",     description: "Unlock when reaching the final phase of Aquatic (145,000 killstreak).",              killsRequired: 145000 },
  { id: "soil_ascended",      badge: "soil_ascended",      icon: "🛡️", title: "Soil Ascended",        description: "Unlock when reaching the final phase of Soil (160,000 killstreak).",                 killsRequired: 160000 },
  { id: "metallic_ascended",  badge: "metallic_ascended",  icon: "⚙️", title: "Eternal Steel",        description: "Unlock when reaching the final phase of Metallic (198,000 killstreak).",             killsRequired: 198000 },
  { id: "flora_ascended",     badge: "flora_ascended",     icon: "🌿",  title: "The Evergrowth",       description: "Unlock when reaching the final phase of Flora (230,000 killstreak).",                killsRequired: 230000 },
  { id: "hellfire_ascended",  badge: "hellfire_ascended",  icon: "🔥",  title: "The Infernal",         description: "Unlock when reaching the final phase of Hellfire (264,375 killstreak).",             killsRequired: 264375 },
  { id: "windy_ascended",     badge: "windy_ascended",     icon: "🌬️", title: "The Aerial",           description: "Unlock when reaching the final phase of Windy (266,000 killstreak).",                killsRequired: 266000 }
];

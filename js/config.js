/**
 * Game Configuration & Static Data
 * Modular aggregator connecting distributed data from data/swords, data/npcs, and data/maps.
 */
(function(window) {
  window.Killstreak = window.Killstreak || {};
  const Data = window.Killstreak.Data || {};
  const SwordsData = Data.Swords || {};
  const NpcsData = Data.NPCs || {};
  const MapsData = Data.Maps || {};

  // Swords definitions from modular data
  const SWORDS = SwordsData;
  const SWORD_PHASES = (SWORDS.devourer && SWORDS.devourer.phases) || [];
  const OVERDRIVE_PHASES = (SWORDS.overdrive && SWORDS.overdrive.phases) || [];
  const AQUATIC_PHASES = (SWORDS.aquatic && SWORDS.aquatic.phases) || [];
  const SOIL_PHASES = (SWORDS.soil && SWORDS.soil.phases) || [];
  const METALLIC_PHASES = (SWORDS.metallic && SWORDS.metallic.phases) || [];
  const FLORA_PHASES = (SWORDS.flora && SWORDS.flora.phases) || [];
  const HELLFIRE_PHASES = (SWORDS.hellfire && SWORDS.hellfire.phases) || [];
  const WINDY_PHASES = (SWORDS.windy && SWORDS.windy.phases) || [];
  const FROSTBITE_PHASES = (SWORDS.frostbite && SWORDS.frostbite.phases) || [];

  // Structured NPC Formation Offsets (Relative to Zone Center)
  const NPC_FORMATION_10_SLOTS = [
    { x: -75, y: -60 }, // Row 1 Left
    { x: 0,   y: -60 }, // Row 1 Center
    { x: 75,  y: -60 }, // Row 1 Right
    { x: -90, y: 0 },   // Row 2 Leftmost
    { x: -30, y: 0 },   // Row 2 Mid-Left
    { x: 30,  y: 0 },   // Row 2 Mid-Right
    { x: 90,  y: 0 },   // Row 2 Rightmost
    { x: -75, y: 60 },  // Row 3 Left
    { x: 0,   y: 60 },  // Row 3 Center
    { x: 75,  y: 60 }   // Row 3 Right
  ];

  const NPC_FORMATION_10_BUFF_SLOTS = [
    { x: -120, y: -85 },
    { x: 0,    y: -85 },
    { x: 120,  y: -85 },
    { x: -140, y: 0 },
    { x: -50,  y: 0 },
    { x: 50,   y: 0 },
    { x: 140,  y: 0 },
    { x: -120, y: 85 },
    { x: 0,    y: 85 },
    { x: 120,  y: 85 }
  ];

  const NPC_FORMATION_9_SLOTS = [
    { x: -75, y: -55 },
    { x: 0,   y: -55 },
    { x: 75,  y: -55 },
    { x: -75, y: 0 },
    { x: 0,   y: 0 },
    { x: 75,  y: 0 },
    { x: -75, y: 55 },
    { x: 0,   y: 55 },
    { x: 75,  y: 55 }
  ];

  const NPC_FORMATION_8_SLOTS = [
    { x: -75, y: -50 },
    { x: 0,   y: -50 },
    { x: 75,  y: -50 },
    { x: -40, y: 0 },
    { x: 40,  y: 0 },
    { x: -75, y: 50 },
    { x: 0,   y: 50 },
    { x: 75,  y: 50 }
  ];

  const NPC_FORMATION_7_SLOTS = [
    { x: -70, y: -48 }, // Slot 0: Row 1 Left
    { x: 0,   y: -48 }, // Slot 1: Row 1 Center
    { x: 70,  y: -48 }, // Slot 2: Row 1 Right
    { x: -35, y: 6 },   // Slot 3: Row 2 Left
    { x: 35,  y: 6 },   // Slot 4: Row 2 Right
    { x: -70, y: 60 },  // Slot 5: Row 3 Left
    { x: 0,   y: 60 }   // Slot 6: Row 3 Center
  ];

  const NPC_FORMATION_7_BUFF_SLOTS = [
    { x: -105, y: -65 },
    { x: 0,    y: -65 },
    { x: 105,  y: -65 },
    { x: -55,  y: 8 },
    { x: 55,   y: 8 },
    { x: -105, y: 80 },
    { x: 0,    y: 80 }
  ];

  const NPC_FORMATION_6_SLOTS = [
    { x: -65, y: -42 }, // Row 1 Left
    { x: 0,   y: -42 }, // Row 1 Center
    { x: 65,  y: -42 }, // Row 1 Right
    { x: -65, y: 42 },  // Row 2 Left
    { x: 0,   y: 42 },  // Row 2 Center
    { x: 65,  y: 42 }   // Row 2 Right
  ];

  const NPC_FORMATION_5_SLOTS = [
    { x: -55, y: -38 }, // Slot 0: Row 1 Left
    { x: 55,  y: -38 }, // Slot 1: Row 1 Right
    { x: 0,   y: 0 },   // Slot 2: Center
    { x: -55, y: 38 },  // Slot 3: Row 2 Left
    { x: 55,  y: 38 }   // Slot 4: Row 2 Right
  ];

  // Achievements: Getting Started, All Devourer, Overdrive Ascended, and Aquatic Ascended
  const ACHIEVEMENTS = [
    {
      id: "getting_started",
      title: "Getting Started",
      badge: "getting_started",
      icon: "⚔️",
      description: "Join and begin your journey with Devourer.",
      killsRequired: 0
    },
    {
      id: "all_devourer",
      title: "All Devourer",
      badge: "all_devourer",
      icon: "👑",
      description: "Marks completion of the final Devourer phase (75,000 killstreak).",
      killsRequired: 75000
    },
    {
      id: "overdrive_ascended",
      title: "Overdrive Ascended",
      badge: "overdrive_ascended",
      icon: "⚡",
      description: "Unlock when reaching the final phase of Overdrive (25,000 killstreak).",
      killsRequired: 25000
    },
    {
      id: "aquatic_ascended",
      title: "Aquatic Ascended",
      badge: "aquatic_ascended",
      icon: "🌊",
      description: "Unlock when reaching the final phase of Aquatic (145,000 killstreak).",
      killsRequired: 145000
    },
    {
      id: "soil_ascended",
      title: "Soil Ascended",
      badge: "soil_ascended",
      icon: "🛡️",
      description: "Unlock when reaching the final phase of Soil (160,000 killstreak).",
      killsRequired: 160000
    },
    {
      id: "metallic_ascended",
      title: "Eternal Steel",
      badge: "metallic_ascended",
      icon: "⚙️",
      description: "Unlock when reaching the final phase of Metallic (198,000 killstreak).",
      killsRequired: 198000
    },
    {
      id: "flora_ascended",
      title: "The Evergrowth",
      badge: "flora_ascended",
      icon: "🌿",
      description: "Unlock when reaching the final phase of Flora (230,000 killstreak).",
      killsRequired: 230000
    },
    {
      id: "hellfire_ascended",
      title: "The Infernal",
      badge: "hellfire_ascended",
      icon: "🔥",
      description: "Unlock when reaching the final phase of Hellfire (264,375 killstreak).",
      killsRequired: 264375
    },
    {
      id: "windy_ascended",
      title: "The Aerial",
      badge: "windy_ascended",
      icon: "🌬️",
      description: "Unlock when reaching the final phase of Windy (266,000 killstreak).",
      killsRequired: 266000
    },
    {
      id: "frostbite_ascended",
      title: "The Frozen",
      badge: "frostbite_ascended",
      icon: "🧊",
      description: "Unlock when reaching the final phase of Frostbite (366,000 killstreak).",
      killsRequired: 366000
    }
  ];

  // Map Configurations from modular data
  const MAPS = MapsData;

  const GAME_CONFIG = {
    viewport: {
      width: 1000,
      height: 650
    },
    player: {
      radius: 18,
      speed: 160,
      speedScale: 8, // maps phase speed (21..189) to pixels/sec (168..1512 px/s)
      defaultMaxHp: 100,
      color: "#38bdf8",
      outlineColor: "#0284c7",
      regenInterval: 1.0,
      regenPercent: 0.10,
      outOfCombatDelay: 5.0
    },
    bloodmoon: {
      checkInterval: 60,
      chance: 0.10,
      duration: 300
    },
    npc: NpcsData.normal || {},
    fairy: NpcsData.fairy || {},
    thug: NpcsData.thug || {},
    guard: NpcsData.guard || {},
    swordman: NpcsData.swordman || {},
    buff_man: NpcsData.buff_man || {},
    elf: NpcsData.elf || {},
    ironborn: NpcsData.ironborn || {},
    bloodfang: NpcsData.bloodfang || {},
    arcanist: NpcsData.arcanist || {},
    colossus: NpcsData.colossus || {},
    starforged: NpcsData.starforged || {},
    grizzlehorn: NpcsData.grizzlehorn || {},
    brambleback: NpcsData.brambleback || {},
    embermane: NpcsData.embermane || {},
    duskhorn: NpcsData.duskhorn || {},
    mirewalker: NpcsData.mirewalker || {},
    thunderhoof: NpcsData.thunderhoof || {},
    gloomscale: NpcsData.gloomscale || {},
    wildtusk: NpcsData.wildtusk || {},
    moonmane: NpcsData.moonmane || {},
    crimsonhide: NpcsData.crimsonhide || {},
    storageKey: "killstreak_v1_data"
  };

  // Configurable Diminishing Killstreak Scaling (applies to ALL swords)
  // Uses closed-form logarithmic growth: exp(baseRate * H * ln((streak + H) / (startStreak + H)))
  const KILLSTREAK_SCALING = {
    baseHpRate: 0.005,       // 0.5% base HP growth per killstreak
    baseDamageRate: 0.003,   // 0.3% base Damage growth per killstreak
    halfScaleStreak: 100,    // Streak at which scaling efficiency drops to 50%
    minMultiplier: 0.05      // Floor ensuring continuous positive growth
  };

  // Backward compatibility alias
  const DEVOURER_SCALING = KILLSTREAK_SCALING;

  // Number formatting utilities with expanded range up to Googol (10^100)
  const NUMBER_UNITS = [
    { threshold: 1e100, suffix: " Googol" },
    { threshold: 1e99,  suffix: "Dtg" },  // Duotrigintillion
    { threshold: 1e96,  suffix: "Utg" },  // Untrigintillion
    { threshold: 1e93,  suffix: "Tg" },   // Trigintillion
    { threshold: 1e90,  suffix: "Novg" }, // Novemvigintillion
    { threshold: 1e87,  suffix: "Ocvg" }, // Octovigintillion
    { threshold: 1e84,  suffix: "Spvg" }, // Septenvigintillion
    { threshold: 1e81,  suffix: "Sxvg" }, // Sexvigintillion
    { threshold: 1e78,  suffix: "Qivg" }, // Quinvigintillion
    { threshold: 1e75,  suffix: "Qavg" }, // Quattuorvigintillion
    { threshold: 1e72,  suffix: "Tvg" },  // Tresvigintillion
    { threshold: 1e69,  suffix: "Dvg" },  // Duovigintillion
    { threshold: 1e66,  suffix: "Uvg" },  // Unvigintillion
    { threshold: 1e63,  suffix: "Vg" },   // Vigintillion
    { threshold: 1e60,  suffix: "Nod" },  // Novemdecillion
    { threshold: 1e57,  suffix: "Ocd" },  // Octodecillion
    { threshold: 1e54,  suffix: "Spd" },  // Septendecillion
    { threshold: 1e51,  suffix: "Sxd" },  // Sexdecillion
    { threshold: 1e48,  suffix: "Qid" },  // Quindecillion
    { threshold: 1e45,  suffix: "Qad" },  // Quattuordecillion
    { threshold: 1e42,  suffix: "Td" },   // Tredecillion
    { threshold: 1e39,  suffix: "Dd" },   // Duodecillion
    { threshold: 1e36,  suffix: "Ud" },   // Undecillion
    { threshold: 1e33,  suffix: "Dc" },   // Decillion
    { threshold: 1e30,  suffix: "No" },   // Nonillion
    { threshold: 1e27,  suffix: "Oc" },   // Octillion
    { threshold: 1e24,  suffix: "Sp" },   // Septillion
    { threshold: 1e21,  suffix: "Sx" },   // Sextillion
    { threshold: 1e18,  suffix: "Qi" },   // Quintillion
    { threshold: 1e15,  suffix: "Qa" },   // Quadrillion
    { threshold: 1e12,  suffix: "T" },    // Trillion
    { threshold: 1e9,   suffix: "B" },    // Billion
    { threshold: 1e6,   suffix: "M" },    // Million
    { threshold: 1e3,   suffix: "K" }     // Thousand
  ];

  function formatNumber(num) {
    const n = typeof num === "number" ? num : (parseFloat(num) || 0);
    const abs = Math.abs(n);
    const full = abs < 1e15 ? Math.round(n).toLocaleString() : (abs <= 1e21 ? n.toLocaleString("en-US", { maximumFractionDigits: 0 }) : n.toExponential(2));
    if (abs < 10000) return { short: full, full };
    for (let i = 0; i < NUMBER_UNITS.length; i++) {
      const { threshold, suffix } = NUMBER_UNITS[i];
      if (abs >= threshold * 0.9995) {
        const val = n / threshold;
        if (threshold === 1e100 && val >= 1000) {
          const gShort = formatNumber(val).short;
          return { short: `${gShort} Googol`, full };
        }
        const display = val < 100 ? val.toFixed(1).replace(/\.0$/, "") : (val < 1000 ? Math.round(val).toString() : val.toFixed(0));
        return { short: display + suffix, full };
      }
    }
    return { short: full, full };
  }

  function parseNumberInput(val) {
    if (typeof val === "number") return val;
    if (!val && val !== 0) return 0;
    const raw = String(val).trim();
    if (raw === "") return 0;

    const lower = raw.toLowerCase().replace(/,/g, "");

    if (lower.includes("googol")) {
      const numPart = parseFloat(lower.replace(/googol/g, "").trim());
      return (isNaN(numPart) || numPart === 0 ? 1 : numPart) * 1e100;
    }

    for (const { threshold, suffix } of NUMBER_UNITS) {
      const s = suffix.trim().toLowerCase();
      if (s && lower.endsWith(s)) {
        const numPart = parseFloat(lower.slice(0, -s.length).trim());
        return (isNaN(numPart) || numPart === 0 ? 1 : numPart) * threshold;
      }
    }

    const n = Number(lower);
    if (!isNaN(n)) return n;
    const f = parseFloat(lower);
    return isNaN(f) ? 0 : f;
  }

  window.formatNumber = formatNumber;
  window.Killstreak.formatNumber = formatNumber;
  window.parseNumberInput = parseNumberInput;
  window.Killstreak.parseNumberInput = parseNumberInput;

  window.Killstreak.Config = {
    SWORD_PHASES,
    OVERDRIVE_PHASES,
    AQUATIC_PHASES,
    SOIL_PHASES,
    METALLIC_PHASES,
    FLORA_PHASES,
    HELLFIRE_PHASES,
    WINDY_PHASES,
    FROSTBITE_PHASES,
    SWORDS,
    KILLSTREAK_SCALING,
    DEVOURER_SCALING,
    NPC_FORMATION_10_SLOTS,
    NPC_FORMATION_10_BUFF_SLOTS,
    NPC_FORMATION_9_SLOTS,
    NPC_FORMATION_8_SLOTS,
    NPC_FORMATION_7_SLOTS,
    NPC_FORMATION_7_BUFF_SLOTS,
    NPC_FORMATION_6_SLOTS,
    NPC_FORMATION_5_SLOTS,
    ACHIEVEMENTS,
    MAPS,
    GAME_CONFIG,
    NUMBER_UNITS,
    formatNumber,
    parseNumberInput
  };
})(window);

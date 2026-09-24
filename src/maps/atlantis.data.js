/**
 * Atlantis Underwater Combat Map Data
 * Scale: Equivalent to Open Grassland map (width: 11440, height: 7920).
 * Deep, mysterious, ancient underwater environment with vast open spaces.
 * Intentionally empty of NPCs, structures, and buildings for future development.
 * Pure ES module — exported as a plain object, no side effects.
 */

const ATLANTIS_MAP = {
  id: "ATLANTIS",
  name: "Atlantis",
  width: 11440,
  height: 7920,
  spawn: { x: 5720, y: 4120 },
  portalToGrassland: {
    x: 5720,
    y: 3960,
    width: 64,
    height: 64,
    label: "RETURN TO GRASSLAND",
    interactRadius: 100
  },
  npcZones: [
    { id: "zone_reefmaw",     index: 0,  label: "REEFMAW SHALLOWS",     npcType: "reefmaw",     x: 4700, y: 3100, width: 480, height: 360, maxNpcs: 8, respawnDelay: 6.0,  accentColor: "rgba(6, 182, 212, 0.55)",  tagColor: "rgba(103, 232, 249, 1.0)" },
    { id: "zone_coralback",   index: 1,  label: "CORALBACK REEF",       npcType: "coralback",   x: 6260, y: 3100, width: 480, height: 360, maxNpcs: 8, respawnDelay: 6.0,  accentColor: "rgba(244, 63, 94, 0.55)",  tagColor: "rgba(253, 164, 175, 1.0)" },
    { id: "zone_tidescale",   index: 2,  label: "TIDESCALE GROVE",      npcType: "tidescale",   x: 6700, y: 3780, width: 480, height: 360, maxNpcs: 8, respawnDelay: 6.0,  accentColor: "rgba(56, 189, 248, 0.55)", tagColor: "rgba(186, 230, 253, 1.0)" },
    { id: "zone_seafang",     index: 3,  label: "SEAFANG BASIN",        npcType: "seafang",     x: 6260, y: 4460, width: 480, height: 360, maxNpcs: 8, respawnDelay: 6.5,  accentColor: "rgba(2, 132, 199, 0.55)",  tagColor: "rgba(125, 211, 252, 1.0)" },
    { id: "zone_abyssfin",    index: 4,  label: "ABYSSFIN HOLLOW",      npcType: "abyssfin",    x: 4700, y: 4460, width: 480, height: 360, maxNpcs: 8, respawnDelay: 6.5,  accentColor: "rgba(34, 211, 238, 0.55)", tagColor: "rgba(165, 243, 252, 1.0)" },
    { id: "zone_deepclaw",    index: 5,  label: "DEEPCLAW COVE",        npcType: "deepclaw",    x: 4260, y: 3780, width: 480, height: 360, maxNpcs: 8, respawnDelay: 6.5,  accentColor: "rgba(225, 29, 72, 0.55)",  tagColor: "rgba(251, 113, 133, 1.0)" },
    { id: "zone_reefstalker", index: 6,  label: "REEFSTALKER TERRITORY",npcType: "reefstalker", x: 3100, y: 2600, width: 480, height: 360, maxNpcs: 7, respawnDelay: 7.0,  accentColor: "rgba(16, 185, 129, 0.55)", tagColor: "rgba(110, 231, 183, 1.0)" },
    { id: "zone_dreadscale",  index: 7,  label: "DREADSCALE PASS",      npcType: "dreadscale",  x: 4700, y: 2200, width: 480, height: 360, maxNpcs: 7, respawnDelay: 7.0,  accentColor: "rgba(139, 92, 246, 0.55)", tagColor: "rgba(196, 181, 253, 1.0)" },
    { id: "zone_tideborn",    index: 8,  label: "TIDEBORN SANCTUM",     npcType: "tideborn",    x: 6260, y: 2200, width: 480, height: 360, maxNpcs: 7, respawnDelay: 7.0,  accentColor: "rgba(14, 165, 233, 0.55)", tagColor: "rgba(125, 211, 252, 1.0)" },
    { id: "zone_leviathan",   index: 9,  label: "LEVIATHAN TRENCH",     npcType: "leviathan",   x: 7860, y: 2600, width: 500, height: 380, maxNpcs: 7, respawnDelay: 7.5,  accentColor: "rgba(29, 78, 216, 0.60)",  tagColor: "rgba(147, 197, 253, 1.0)" },
    { id: "zone_abysswalker", index: 10, label: "ABYSSWALKER RIDGES",   npcType: "abysswalker", x: 7860, y: 4960, width: 480, height: 360, maxNpcs: 7, respawnDelay: 7.5,  accentColor: "rgba(99, 102, 241, 0.60)", tagColor: "rgba(165, 180, 252, 1.0)" },
    { id: "zone_trenchmaw",   index: 11, label: "TRENCHMAW GORGE",      npcType: "trenchmaw",   x: 6260, y: 5360, width: 480, height: 360, maxNpcs: 7, respawnDelay: 8.0,  accentColor: "rgba(168, 85, 247, 0.60)", tagColor: "rgba(216, 180, 254, 1.0)" },
    { id: "zone_depthclaw",   index: 12, label: "DEPTHCLAW CRAGS",      npcType: "depthclaw",   x: 4700, y: 5360, width: 480, height: 360, maxNpcs: 6, respawnDelay: 8.0,  accentColor: "rgba(217, 70, 239, 0.60)", tagColor: "rgba(240, 171, 252, 1.0)" },
    { id: "zone_gloomray",    index: 13, label: "GLOOMRAY SHADOWS",     npcType: "gloomray",    x: 3100, y: 4960, width: 480, height: 360, maxNpcs: 6, respawnDelay: 8.0,  accentColor: "rgba(192, 132, 252, 0.60)",tagColor: "rgba(233, 213, 255, 1.0)" },
    { id: "zone_abyssal",     index: 14, label: "ABYSSAL VOID",         npcType: "abyssal",     x: 2600, y: 3780, width: 480, height: 360, maxNpcs: 6, respawnDelay: 8.5,  accentColor: "rgba(124, 58, 237, 0.65)", tagColor: "rgba(196, 181, 253, 1.0)" },
    { id: "zone_sirenborn",   index: 15, label: "SIRENBORN GROTTO",     npcType: "sirenborn",   x: 1700, y: 3100, width: 480, height: 360, maxNpcs: 6, respawnDelay: 8.5,  accentColor: "rgba(236, 72, 153, 0.65)", tagColor: "rgba(249, 168, 212, 1.0)" },
    { id: "zone_stormscale",  index: 16, label: "STORMSCALE EXPANSE",   npcType: "stormscale",  x: 3100, y: 1500, width: 480, height: 360, maxNpcs: 6, respawnDelay: 9.0,  accentColor: "rgba(56, 189, 248, 0.65)", tagColor: "rgba(186, 230, 253, 1.0)" },
    { id: "zone_dreadtide",   index: 17, label: "DREADTIDE CHANNEL",    npcType: "dreadtide",   x: 5720, y: 1500, width: 480, height: 360, maxNpcs: 6, respawnDelay: 9.0,  accentColor: "rgba(37, 99, 235, 0.65)",  tagColor: "rgba(147, 197, 253, 1.0)" },
    { id: "zone_trenchborn",  index: 18, label: "TRENCHBORN WASTES",    npcType: "trenchborn",  x: 7860, y: 1500, width: 480, height: 360, maxNpcs: 5, respawnDelay: 9.0,  accentColor: "rgba(147, 51, 234, 0.70)", tagColor: "rgba(216, 180, 254, 1.0)" },
    { id: "zone_deepwarden",  index: 19, label: "DEEPWARDEN PILLARS",   npcType: "deepwarden",  x: 9200, y: 2600, width: 480, height: 360, maxNpcs: 5, respawnDelay: 9.5,  accentColor: "rgba(5, 150, 105, 0.70)",  tagColor: "rgba(110, 231, 183, 1.0)" },
    { id: "zone_abysslord",   index: 20, label: "ABYSSLORD THRONE",     npcType: "abysslord",   x: 9200, y: 3780, width: 500, height: 380, maxNpcs: 5, respawnDelay: 9.5,  accentColor: "rgba(168, 85, 247, 0.70)", tagColor: "rgba(233, 213, 255, 1.0)" },
    { id: "zone_tidebreaker", index: 21, label: "TIDEBREAKER DEPTHS",   npcType: "tidebreaker", x: 9200, y: 4960, width: 480, height: 360, maxNpcs: 5, respawnDelay: 10.0, accentColor: "rgba(6, 182, 212, 0.70)",  tagColor: "rgba(103, 232, 249, 1.0)" },
    { id: "zone_depthforged", index: 22, label: "DEPTHFORGED CRATER",   npcType: "depthforged", x: 7860, y: 6060, width: 480, height: 360, maxNpcs: 5, respawnDelay: 10.0, accentColor: "rgba(245, 158, 11, 0.70)",  tagColor: "rgba(252, 211, 77, 1.0)" },
    { id: "zone_oceanbane",   index: 23, label: "OCEANBANE CHASM",      npcType: "oceanbane",   x: 5720, y: 6060, width: 500, height: 380, maxNpcs: 5, respawnDelay: 10.5, accentColor: "rgba(239, 68, 68, 0.75)",   tagColor: "rgba(252, 165, 165, 1.0)" },
    { id: "zone_abyssforged", index: 24, label: "ABYSSFORGED NEXUS",    npcType: "abyssforged", x: 3100, y: 6060, width: 520, height: 400, maxNpcs: 4, respawnDelay: 11.0, accentColor: "rgba(139, 92, 246, 0.80)", tagColor: "rgba(216, 180, 254, 1.0)" }
  ],
  respawnDelay: 6.0,
  // Playable terrain shelf boundaries surrounded by deep open abyssal water
  playableBounds: {
    minX: 850,
    maxX: 10590,
    minY: 850,
    maxY: 7070
  },
  // Initial Decorations: Rock Formations
  rocks: [
    // Northwest Reef Formations
    { x: 1800, y: 1800, radius: 48, type: "crag" },
    { x: 1920, y: 1740, radius: 36, type: "boulder" },
    { x: 2400, y: 1500, radius: 52, type: "ridge" },
    { x: 1500, y: 2600, radius: 44, type: "boulder" },
    { x: 3200, y: 2100, radius: 46, type: "crag" },

    // Southwest Reef Formations
    { x: 1700, y: 5800, radius: 50, type: "ridge" },
    { x: 1820, y: 5900, radius: 38, type: "boulder" },
    { x: 2300, y: 6400, radius: 48, type: "crag" },
    { x: 2900, y: 5400, radius: 42, type: "boulder" },
    { x: 1500, y: 5100, radius: 46, type: "ridge" },

    // Northeast Abyssal Formations
    { x: 8900, y: 1700, radius: 54, type: "crag" },
    { x: 9600, y: 2200, radius: 46, type: "boulder" },
    { x: 8200, y: 1400, radius: 44, type: "ridge" },
    { x: 10100, y: 1800, radius: 50, type: "crag" },

    // Southeast Abyssal Formations
    { x: 8800, y: 6200, radius: 52, type: "ridge" },
    { x: 9500, y: 5700, radius: 46, type: "crag" },
    { x: 8100, y: 6600, radius: 42, type: "boulder" },
    { x: 10000, y: 6100, radius: 50, type: "ridge" },

    // North Shelf Wall Formations
    { x: 4400, y: 1400, radius: 46, type: "boulder" },
    { x: 5720, y: 1500, radius: 54, type: "crag" },
    { x: 7000, y: 1300, radius: 48, type: "ridge" },

    // South Shelf Wall Formations
    { x: 4500, y: 6600, radius: 48, type: "boulder" },
    { x: 5720, y: 6500, radius: 52, type: "crag" },
    { x: 6900, y: 6700, radius: 44, type: "ridge" },

    // West Outer Barrier
    { x: 1100, y: 3960, radius: 54, type: "crag" },
    { x: 2100, y: 3700, radius: 42, type: "boulder" },

    // East Outer Barrier
    { x: 10300, y: 3960, radius: 54, type: "crag" },
    { x: 9300, y: 4200, radius: 44, type: "boulder" },

    // Perimeter Outcrops
    { x: 3900, y: 3100, radius: 40, type: "boulder" },
    { x: 7500, y: 3200, radius: 42, type: "boulder" },
    { x: 4000, y: 4900, radius: 40, type: "boulder" },
    { x: 7400, y: 4800, radius: 42, type: "boulder" }
  ],
  // Initial Decorations: Coral Formations
  // Normal state: vibrant, luminous bioluminescent hues.
  // Bloodmoon state: dead, dark, decayed, corrupted purple-black forms.
  corals: [
    // Northwest Reef Garden
    { x: 1650, y: 1950, radius: 36, type: "branch", color: "#06b6d4", accentColor: "#67e8f9" },
    { x: 2050, y: 1650, radius: 42, type: "brain",  color: "#f43f5e", accentColor: "#fda4af" },
    { x: 2550, y: 1350, radius: 34, type: "fan",    color: "#a855f7", accentColor: "#d8b4fe" },
    { x: 1350, y: 2450, radius: 38, type: "table",  color: "#10b981", accentColor: "#6ee7b7" },
    { x: 3050, y: 2250, radius: 40, type: "branch", color: "#f97316", accentColor: "#fdba74" },
    { x: 3350, y: 1950, radius: 30, type: "bioluminescent", color: "#22d3ee", accentColor: "#a5f3fc" },

    // Southwest Reef Garden
    { x: 1550, y: 5650, radius: 40, type: "brain",  color: "#f43f5e", accentColor: "#fda4af" },
    { x: 1950, y: 6050, radius: 36, type: "branch", color: "#06b6d4", accentColor: "#67e8f9" },
    { x: 2150, y: 6250, radius: 32, type: "fan",    color: "#a855f7", accentColor: "#d8b4fe" },
    { x: 2750, y: 5550, radius: 38, type: "table",  color: "#10b981", accentColor: "#6ee7b7" },
    { x: 1350, y: 4950, radius: 34, type: "bioluminescent", color: "#38bdf8", accentColor: "#bae6fd" },
    { x: 2450, y: 6550, radius: 38, type: "branch", color: "#f97316", accentColor: "#fdba74" },

    // Northeast Abyssal Grove
    { x: 8750, y: 1850, radius: 44, type: "brain",  color: "#a855f7", accentColor: "#e9d5ff" },
    { x: 9150, y: 1550, radius: 36, type: "branch", color: "#06b6d4", accentColor: "#67e8f9" },
    { x: 9750, y: 2050, radius: 40, type: "table",  color: "#f43f5e", accentColor: "#fda4af" },
    { x: 8050, y: 1250, radius: 34, type: "fan",    color: "#10b981", accentColor: "#6ee7b7" },
    { x: 10250, y: 1650, radius: 38, type: "bioluminescent", color: "#22d3ee", accentColor: "#a5f3fc" },

    // Southeast Abyssal Grove
    { x: 8650, y: 6350, radius: 42, type: "branch", color: "#f97316", accentColor: "#fdba74" },
    { x: 9350, y: 5850, radius: 38, type: "brain",  color: "#06b6d4", accentColor: "#67e8f9" },
    { x: 7950, y: 6450, radius: 34, type: "fan",    color: "#f43f5e", accentColor: "#fda4af" },
    { x: 9850, y: 6250, radius: 40, type: "table",  color: "#a855f7", accentColor: "#d8b4fe" },
    { x: 10150, y: 5950, radius: 32, type: "bioluminescent", color: "#38bdf8", accentColor: "#bae6fd" },

    // Northern Ridge Corals
    { x: 4250, y: 1550, radius: 38, type: "branch", color: "#06b6d4", accentColor: "#67e8f9" },
    { x: 4550, y: 1250, radius: 32, type: "fan",    color: "#a855f7", accentColor: "#d8b4fe" },
    { x: 5550, y: 1350, radius: 42, type: "brain",  color: "#f43f5e", accentColor: "#fda4af" },
    { x: 5880, y: 1650, radius: 36, type: "bioluminescent", color: "#22d3ee", accentColor: "#a5f3fc" },
    { x: 6850, y: 1450, radius: 40, type: "table",  color: "#10b981", accentColor: "#6ee7b7" },
    { x: 7150, y: 1180, radius: 34, type: "branch", color: "#f97316", accentColor: "#fdba74" },

    // Southern Ridge Corals
    { x: 4350, y: 6750, radius: 38, type: "brain",  color: "#f43f5e", accentColor: "#fda4af" },
    { x: 4650, y: 6450, radius: 34, type: "fan",    color: "#06b6d4", accentColor: "#67e8f9" },
    { x: 5550, y: 6650, radius: 42, type: "table",  color: "#a855f7", accentColor: "#d8b4fe" },
    { x: 5880, y: 6350, radius: 36, type: "bioluminescent", color: "#38bdf8", accentColor: "#bae6fd" },
    { x: 6750, y: 6550, radius: 40, type: "branch", color: "#10b981", accentColor: "#6ee7b7" },
    { x: 7050, y: 6850, radius: 32, type: "fan",    color: "#f97316", accentColor: "#fdba74" },

    // Central Dais Flanking Corals (Luminous Gate Sentinels)
    { x: 5460, y: 3960, radius: 36, type: "bioluminescent", color: "#22d3ee", accentColor: "#a5f3fc" },
    { x: 5980, y: 3960, radius: 36, type: "bioluminescent", color: "#22d3ee", accentColor: "#a5f3fc" },
    { x: 5480, y: 4260, radius: 30, type: "branch", color: "#a855f7", accentColor: "#d8b4fe" },
    { x: 5960, y: 4260, radius: 30, type: "branch", color: "#06b6d4", accentColor: "#67e8f9" },

    // Vast Open Space Scatter (Subtle accents far apart)
    { x: 3750, y: 3250, radius: 34, type: "fan",    color: "#06b6d4", accentColor: "#67e8f9" },
    { x: 7650, y: 3050, radius: 36, type: "table",  color: "#f43f5e", accentColor: "#fda4af" },
    { x: 3850, y: 4750, radius: 34, type: "brain",  color: "#10b981", accentColor: "#6ee7b7" },
    { x: 7550, y: 4950, radius: 36, type: "branch", color: "#f97316", accentColor: "#fdba74" }
  ]
};

export default ATLANTIS_MAP;

/**
 * Open Grassland Combat Map Data
 * Expanded by 200% (width: 11440, height: 7920) with increased distance between NPC zones
 */
(function(window) {
  window.Killstreak = window.Killstreak || {};
  window.Killstreak.Data = window.Killstreak.Data || {};
  window.Killstreak.Data.Maps = window.Killstreak.Data.Maps || {};

  const GRASSLAND_MAP = {
    id: "COMBAT",
    name: "Open Grassland",
    width: 11440,
    height: 7920,
    spawn: { x: 600, y: 3960 },
    portalToLobby: {
      x: 180,
      y: 3960,
      width: 36,
      height: 200,
      label: "RETURN TO LOBBY",
      interactRadius: 85
    },
    portalToAtlantis: {
      x: 9650,
      y: 2675,
      width: 60,
      height: 60,
      label: "ENTER ATLANTIS",
      interactRadius: 100,
      unlockKills: 150000
    },
    npcZones: [
      // --- TIER 1: WEAKEST ---
      {
        id: "zone_north",
        index: 0,
        label: "NORTH FEEDING GROUND",
        npcType: "normal",
        x: 1500,
        y: 2400,
        width: 440,
        height: 340,
        maxNpcs: 10,
        respawnDelay: 6.0,
        accentColor: "rgba(239, 68, 68, 0.45)",
        tagColor: "rgba(248, 113, 113, 0.9)"
      },
      {
        id: "zone_south",
        index: 1,
        label: "SOUTH FEEDING GROUND",
        npcType: "normal",
        x: 1500,
        y: 5180,
        width: 440,
        height: 340,
        maxNpcs: 10,
        respawnDelay: 6.0,
        accentColor: "rgba(239, 68, 68, 0.45)",
        tagColor: "rgba(248, 113, 113, 0.9)"
      },
      // --- TIER 2: MEDIUM - EASY ---
      {
        id: "zone_fairy_north",
        index: 2,
        label: "NORTH FAIRY GROVE",
        npcType: "fairy",
        x: 2900,
        y: 1600,
        width: 440,
        height: 340,
        maxNpcs: 10,
        respawnDelay: 6.0,
        accentColor: "rgba(56, 189, 248, 0.55)",
        tagColor: "rgba(56, 189, 248, 0.95)"
      },
      {
        id: "zone_fairy_south",
        index: 3,
        label: "SOUTH FAIRY GROVE",
        npcType: "fairy",
        x: 2900,
        y: 5980,
        width: 440,
        height: 340,
        maxNpcs: 10,
        respawnDelay: 6.0,
        accentColor: "rgba(56, 189, 248, 0.55)",
        tagColor: "rgba(56, 189, 248, 0.95)"
      },
      // --- TIER 3: MEDIUM - MODERATE ---
      {
        id: "zone_thug_camp",
        index: 4,
        label: "THUG CAMP",
        npcType: "thug",
        x: 4300,
        y: 3790,
        width: 420,
        height: 340,
        maxNpcs: 8,
        respawnDelay: 6.0,
        accentColor: "rgba(245, 158, 11, 0.55)",
        tagColor: "rgba(251, 191, 36, 0.95)"
      },
      // --- TIER 4: STRONG ---
      {
        id: "zone_guard",
        index: 5,
        label: "GUARD OUTPOST",
        npcType: "guard",
        x: 5700,
        y: 2100,
        width: 420,
        height: 340,
        maxNpcs: 8,
        respawnDelay: 6.0,
        accentColor: "rgba(226, 232, 240, 0.65)",
        tagColor: "rgba(248, 250, 252, 1.0)"
      },
      {
        id: "zone_swordman",
        index: 6,
        label: "SWORDMAN BARRACKS",
        npcType: "swordman",
        x: 5700,
        y: 5480,
        width: 440,
        height: 340,
        maxNpcs: 10,
        respawnDelay: 6.0,
        accentColor: "rgba(37, 99, 235, 0.65)",
        tagColor: "rgba(96, 165, 250, 1.0)"
      },
      // --- TIER 5: STRONGEST ---
      {
        id: "zone_buff_man",
        index: 7,
        label: "BUFF MAN ARENA",
        npcType: "buff_man",
        x: 7200,
        y: 1700,
        width: 580,
        height: 460,
        maxNpcs: 10,
        respawnDelay: 6.0,
        accentColor: "rgba(217, 119, 6, 0.65)",
        tagColor: "rgba(251, 191, 36, 1.0)"
      },
      {
        id: "zone_elf",
        index: 8,
        label: "ELF SANCTUARY",
        npcType: "elf",
        x: 7300,
        y: 5760,
        width: 460,
        height: 360,
        maxNpcs: 9,
        respawnDelay: 6.0,
        accentColor: "rgba(16, 185, 129, 0.65)",
        tagColor: "rgba(52, 211, 153, 1.0)"
      },
      // --- TIER 6: IRONBORN CAMP ---
      {
        id: "zone_ironborn",
        index: 9,
        label: "IRONBORN CAMP",
        npcType: "ironborn",
        x: 8600,
        y: 6500,
        width: 480,
        height: 380,
        maxNpcs: 7,
        respawnDelay: 4.0,
        accentColor: "rgba(127, 140, 141, 0.65)",
        tagColor: "rgba(189, 195, 199, 1.0)"
      },
      // --- TIER 7: BLOODFANG GROUNDS ---
      {
        id: "zone_bloodfang",
        index: 10,
        label: "BLOODFANG GROUNDS",
        npcType: "bloodfang",
        x: 9800,
        y: 1000,
        width: 480,
        height: 380,
        maxNpcs: 7,
        respawnDelay: 4.0,
        accentColor: "rgba(192, 57, 43, 0.65)",
        tagColor: "rgba(231, 76, 60, 1.0)"
      },
      // --- TIER 8: ARCANIST GROVE ---
      {
        id: "zone_arcanist",
        index: 11,
        label: "ARCANIST GROVE",
        npcType: "arcanist",
        x: 10200,
        y: 5200,
        width: 460,
        height: 360,
        maxNpcs: 6,
        respawnDelay: 4.5,
        accentColor: "rgba(142, 68, 173, 0.65)",
        tagColor: "rgba(155, 89, 182, 1.0)"
      },
      // --- TIER 9: COLOSSUS FIELD ---
      {
        id: "zone_colossus",
        index: 12,
        label: "COLOSSUS FIELD",
        npcType: "colossus",
        x: 9300,
        y: 3100,
        width: 520,
        height: 420,
        maxNpcs: 5,
        respawnDelay: 5.0,
        accentColor: "rgba(97, 106, 107, 0.65)",
        tagColor: "rgba(131, 145, 146, 1.0)"
      },
      // --- TIER 10: STARFORGED RUINS ---
      {
        id: "zone_starforged",
        index: 13,
        label: "STARFORGED RUINS",
        npcType: "starforged",
        x: 10600,
        y: 3600,
        width: 500,
        height: 400,
        maxNpcs: 4,
        respawnDelay: 5.0,
        accentColor: "rgba(243, 156, 18, 0.70)",
        tagColor: "rgba(241, 196, 15, 1.0)"
      },
      // --- TIER 11: GRIZZLEHORN CRAGS ---
      {
        id: "zone_grizzlehorn",
        index: 14,
        label: "GRIZZLEHORN CRAGS",
        npcType: "grizzlehorn",
        x: 1500,
        y: 950,
        width: 480,
        height: 380,
        maxNpcs: 8,
        respawnDelay: 5.0,
        accentColor: "rgba(180, 83, 9, 0.65)",
        tagColor: "rgba(245, 158, 11, 1.0)"
      },
      // --- TIER 12: BRAMBLEBACK THICKET ---
      {
        id: "zone_brambleback",
        index: 15,
        label: "BRAMBLEBACK THICKET",
        npcType: "brambleback",
        x: 2850,
        y: 3760,
        width: 480,
        height: 380,
        maxNpcs: 8,
        respawnDelay: 5.0,
        accentColor: "rgba(34, 197, 94, 0.65)",
        tagColor: "rgba(74, 222, 128, 1.0)"
      },
      // --- TIER 13: EMBERMANE RIDGE ---
      {
        id: "zone_embermane",
        index: 16,
        label: "EMBERMANE RIDGE",
        npcType: "embermane",
        x: 4250,
        y: 1500,
        width: 480,
        height: 380,
        maxNpcs: 8,
        respawnDelay: 5.5,
        accentColor: "rgba(234, 88, 12, 0.70)",
        tagColor: "rgba(251, 146, 60, 1.0)"
      },
      // --- TIER 14: DUSKHORN EXPANSE ---
      {
        id: "zone_duskhorn",
        index: 17,
        label: "DUSKHORN EXPANSE",
        npcType: "duskhorn",
        x: 4250,
        y: 6050,
        width: 460,
        height: 360,
        maxNpcs: 7,
        respawnDelay: 5.5,
        accentColor: "rgba(147, 51, 234, 0.70)",
        tagColor: "rgba(192, 132, 252, 1.0)"
      },
      // --- TIER 15: MIREWALKER MARSH ---
      {
        id: "zone_mirewalker",
        index: 18,
        label: "MIREWALKER MARSH",
        npcType: "mirewalker",
        x: 6450,
        y: 3760,
        width: 460,
        height: 360,
        maxNpcs: 7,
        respawnDelay: 6.0,
        accentColor: "rgba(20, 184, 166, 0.70)",
        tagColor: "rgba(45, 212, 191, 1.0)"
      },
      // --- TIER 16: THUNDERHOOF STEPPES ---
      {
        id: "zone_thunderhoof",
        index: 19,
        label: "THUNDERHOOF STEPPES",
        npcType: "thunderhoof",
        x: 6250,
        y: 6500,
        width: 460,
        height: 360,
        maxNpcs: 7,
        respawnDelay: 6.0,
        accentColor: "rgba(37, 99, 235, 0.70)",
        tagColor: "rgba(96, 165, 250, 1.0)"
      },
      // --- TIER 17: GLOOMSCALE HOLLOW ---
      {
        id: "zone_gloomscale",
        index: 20,
        label: "GLOOMSCALE HOLLOW",
        npcType: "gloomscale",
        x: 8250,
        y: 650,
        width: 440,
        height: 340,
        maxNpcs: 6,
        respawnDelay: 6.5,
        accentColor: "rgba(219, 39, 119, 0.70)",
        tagColor: "rgba(244, 114, 182, 1.0)"
      },
      // --- TIER 18: WILDTUSK GLADE ---
      {
        id: "zone_wildtusk",
        index: 21,
        label: "WILDTUSK GLADE",
        npcType: "wildtusk",
        x: 7400,
        y: 3760,
        width: 440,
        height: 340,
        maxNpcs: 6,
        respawnDelay: 6.5,
        accentColor: "rgba(217, 119, 6, 0.70)",
        tagColor: "rgba(251, 191, 36, 1.0)"
      },
      // --- TIER 19: MOONMANE PLATEAU ---
      {
        id: "zone_moonmane",
        index: 22,
        label: "MOONMANE PLATEAU",
        npcType: "moonmane",
        x: 10500,
        y: 1750,
        width: 440,
        height: 340,
        maxNpcs: 6,
        respawnDelay: 7.0,
        accentColor: "rgba(99, 102, 241, 0.70)",
        tagColor: "rgba(165, 180, 252, 1.0)"
      },
      // --- TIER 20: CRIMSONHIDE BADLANDS ---
      {
        id: "zone_crimsonhide",
        index: 23,
        label: "CRIMSONHIDE BADLANDS",
        npcType: "crimsonhide",
        x: 10200,
        y: 6700,
        width: 420,
        height: 340,
        maxNpcs: 5,
        respawnDelay: 7.0,
        accentColor: "rgba(220, 38, 38, 0.75)",
        tagColor: "rgba(248, 113, 113, 1.0)"
      }
    ],
    respawnDelay: 6.0,

    // Environmental Decor
    lake: {
      x: 8900,
      y: 2200,
      width: 1500,
      height: 950
    },
    houses: [
      { x: 8600, y: 4300, width: 220, height: 160, roofColor: "#92400e" },
      { x: 9100, y: 4200, width: 240, height: 170, roofColor: "#b45309" },
      { x: 9600, y: 4350, width: 210, height: 155, roofColor: "#78350f" },
      { x: 8900, y: 5400, width: 230, height: 160, roofColor: "#92400e" }
    ],
    well: {
      x: 9150,
      y: 4850,
      radius: 36
    },
    barrels: [
      { x: 8550, y: 4360, radius: 18 },
      { x: 8580, y: 4390, radius: 18 },
      { x: 9040, y: 4260, radius: 18 },
      { x: 9380, y: 4240, radius: 18 },
      { x: 9850, y: 4380, radius: 18 },
      { x: 9100, y: 4900, radius: 18 },
      { x: 8850, y: 5450, radius: 18 },
      { x: 9160, y: 5420, radius: 18 }
    ],
    hayBales: [
      { x: 8350, y: 4450, width: 50, height: 36 },
      { x: 8410, y: 4430, width: 50, height: 36 },
      { x: 8380, y: 4490, width: 50, height: 36 },
      { x: 9450, y: 4500, width: 50, height: 36 },
      { x: 9510, y: 4530, width: 50, height: 36 },
      { x: 9150, y: 5650, width: 50, height: 36 },
      { x: 9210, y: 5620, width: 50, height: 36 }
    ],
    trees: [
      { x: 800, y: 700, radius: 44 },
      { x: 800, y: 7200, radius: 44 },
      { x: 1300, y: 1500, radius: 46 },
      { x: 1300, y: 6400, radius: 46 },
      { x: 2300, y: 850, radius: 48 },
      { x: 2300, y: 7100, radius: 48 },
      { x: 3600, y: 900, radius: 46 },
      { x: 3600, y: 7000, radius: 46 },
      { x: 4900, y: 950, radius: 50 },
      { x: 4900, y: 6950, radius: 50 },
      { x: 6300, y: 900, radius: 48 },
      { x: 6300, y: 7050, radius: 48 },
      { x: 7700, y: 1100, radius: 50 },
      { x: 7700, y: 6850, radius: 50 },
      { x: 8500, y: 1400, radius: 48 },
      { x: 9900, y: 1500, radius: 50 },
      { x: 10700, y: 2600, radius: 52 },
      { x: 10700, y: 4400, radius: 48 },
      { x: 10400, y: 6200, radius: 50 },
      { x: 8100, y: 3700, radius: 46 }
    ],
    rocks: [
      { x: 950, y: 3960, radius: 34 },
      { x: 2300, y: 3700, radius: 38 },
      { x: 3300, y: 2800, radius: 34 },
      { x: 3300, y: 4700, radius: 34 },
      { x: 4700, y: 3700, radius: 40 },
      { x: 5900, y: 3700, radius: 36 },
      { x: 7200, y: 2600, radius: 38 },
      { x: 7200, y: 5200, radius: 36 },
      { x: 8600, y: 2100, radius: 34 },
      { x: 10400, y: 2900, radius: 38 }
    ]
  };

  window.Killstreak.Data.Maps.COMBAT = GRASSLAND_MAP;
  window.Killstreak.Data.Maps.GRASSLAND = GRASSLAND_MAP;
})(window);

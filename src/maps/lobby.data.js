/**
 * Sanctuary Lobby Map Data
 * Broadened by 150% (width: 2100, height: 1100) with expansive gallery dais for sword pedestals.
 * Pure ES module — exported as a plain object, no side effects.
 */
const LOBBY_MAP = {
  id: "LOBBY",
  name: "Sanctuary Lobby",
  width: 2100,
  height: 1100,
  spawn: { x: 450, y: 650 },
  swordStands: [
    { id: "devourer_stand",  swordId: "devourer",  x: 420,   y: 250, radius: 20, interactRadius: 48, title: "WEAPON PEDESTAL", subtitle: "DEVOURER",  unlockKills: 0 },
    { id: "overdrive_stand", swordId: "overdrive", x: 477.5, y: 250, radius: 20, interactRadius: 48, title: "WEAPON PEDESTAL", subtitle: "OVERDRIVE", unlockKills: 1250 },
    { id: "aquatic_stand",   swordId: "aquatic",   x: 535,   y: 250, radius: 20, interactRadius: 48, title: "WEAPON PEDESTAL", subtitle: "AQUATIC",   unlockKills: 2500 },
    { id: "soil_stand",      swordId: "soil",      x: 592.5, y: 250, radius: 20, interactRadius: 48, title: "WEAPON PEDESTAL", subtitle: "SOIL",      unlockKills: 3500 },
    { id: "metallic_stand",  swordId: "metallic",  x: 650,   y: 250, radius: 20, interactRadius: 48, title: "WEAPON PEDESTAL", subtitle: "METALLIC",  unlockKills: 6613 },
    { id: "flora_stand",     swordId: "flora",     x: 707.5, y: 250, radius: 20, interactRadius: 48, title: "WEAPON PEDESTAL", subtitle: "FLORA",     unlockKills: 10500 },
    { id: "hellfire_stand",  swordId: "hellfire",  x: 765,   y: 250, radius: 20, interactRadius: 48, title: "WEAPON PEDESTAL", subtitle: "HELLFIRE",  unlockKills: 18125 },
    { id: "windy_stand",     swordId: "windy",     x: 822.5, y: 250, radius: 20, interactRadius: 48, title: "WEAPON PEDESTAL", subtitle: "WINDY",     unlockKills: 24000 },
    { id: "frostbite_stand", swordId: "frostbite", x: 880,   y: 250, radius: 20, interactRadius: 48, title: "WEAPON PEDESTAL", subtitle: "FROSTBITE", unlockKills: 32500 }
  ],
  swordStand: { x: 420, y: 250, radius: 20, interactRadius: 48, title: "WEAPON PEDESTAL", subtitle: "DEVOURER" },
  portalToCombat: { x: 1980, y: 650, width: 36, height: 160, label: "ENTER GRASSLAND", interactRadius: 75 },
  rugs: [
    { id: "gallery_rug", x: 350, y: 180, width: 1400, height: 200, color: "#161f33", borderColor: "rgba(56, 189, 248, 0.45)" },
    { id: "lounge_rug",  x: 750, y: 540, width: 600,  height: 400, color: "#0f172a", borderColor: "rgba(148, 163, 184, 0.25)" }
  ],
  furniture: [
    { id: "sofa_main",      x: 900,  y: 570, width: 300, height: 55, type: "sofa_long", label: "Lounge Sofa" },
    { id: "chair_left",     x: 790,  y: 700, width: 56,  height: 75, type: "chair",     label: "Armchair" },
    { id: "chair_right",    x: 1254, y: 700, width: 56,  height: 75, type: "chair",     label: "Armchair" },
    { id: "coffee_table",   x: 950,  y: 705, width: 200, height: 65, type: "table",     label: "Coffee Table" },
    { id: "credenza_west",  x: 220,  y: 560, width: 40,  height: 180, type: "credenza", label: "Archive Shelving" },
    { id: "credenza_east",  x: 1840, y: 560, width: 40,  height: 180, type: "credenza", label: "Lounge Console" }
  ],
  plants: [
    { x: 300,  y: 280, radius: 20, type: "plant" },
    { x: 1800, y: 280, radius: 20, type: "plant" },
    { x: 700,  y: 560, radius: 20, type: "plant" },
    { x: 1400, y: 560, radius: 20, type: "plant" },
    { x: 700,  y: 920, radius: 20, type: "plant" },
    { x: 1400, y: 920, radius: 20, type: "plant" },
    { x: 300,  y: 850, radius: 20, type: "plant" },
    { x: 1800, y: 850, radius: 20, type: "plant" }
  ],
  lamps: [
    { x: 300,  y: 460, radius: 14, glowRadius: 130, color: "#fef08a" },
    { x: 1800, y: 460, radius: 14, glowRadius: 130, color: "#fef08a" },
    { x: 680,  y: 740, radius: 14, glowRadius: 120, color: "#fef08a" },
    { x: 1420, y: 740, radius: 14, glowRadius: 120, color: "#fef08a" }
  ],
  decorations: [
    { x: 140,  y: 140,  type: "pillar", radius: 24 },
    { x: 140,  y: 960,  type: "pillar", radius: 24 },
    { x: 1960, y: 140,  type: "pillar", radius: 24 },
    { x: 1960, y: 960,  type: "pillar", radius: 24 }
  ]
};

export default LOBBY_MAP;

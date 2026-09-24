/**
 * Atlantis Underwater Combat Map Data (Legacy IIFE Registration)
 * Scale: Equivalent to Open Grassland map (width: 11440, height: 7920).
 * Registers on window.Killstreak.Data.Maps.ATLANTIS
 */
(function(window) {
  window.Killstreak = window.Killstreak || {};
  window.Killstreak.Data = window.Killstreak.Data || {};
  window.Killstreak.Data.Maps = window.Killstreak.Data.Maps || {};

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
    playableBounds: {
      minX: 850,
      maxX: 10590,
      minY: 850,
      maxY: 7070
    },
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

      // Central Dais Flanking Corals
      { x: 5460, y: 3960, radius: 36, type: "bioluminescent", color: "#22d3ee", accentColor: "#a5f3fc" },
      { x: 5980, y: 3960, radius: 36, type: "bioluminescent", color: "#22d3ee", accentColor: "#a5f3fc" },
      { x: 5480, y: 4260, radius: 30, type: "branch", color: "#a855f7", accentColor: "#d8b4fe" },
      { x: 5960, y: 4260, radius: 30, type: "branch", color: "#06b6d4", accentColor: "#67e8f9" },

      // Vast Open Space Scatter
      { x: 3750, y: 3250, radius: 34, type: "fan",    color: "#06b6d4", accentColor: "#67e8f9" },
      { x: 7650, y: 3050, radius: 36, type: "table",  color: "#f43f5e", accentColor: "#fda4af" },
      { x: 3850, y: 4750, radius: 34, type: "brain",  color: "#10b981", accentColor: "#6ee7b7" },
      { x: 7550, y: 4950, radius: 36, type: "branch", color: "#f97316", accentColor: "#fdba74" }
    ]
  };

  window.Killstreak.Data.Maps.ATLANTIS = ATLANTIS_MAP;
})(typeof window !== "undefined" ? window : globalThis);

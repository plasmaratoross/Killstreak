/**
 * NPC Formation Slot Layouts
 * Extracted verbatim from js/config.js — defines relative (x,y) offsets
 * for each formation size so NPC zones spawn in structured grids.
 */

/** 10-slot standard formation */
export const NPC_FORMATION_10_SLOTS = [
  { x: -75, y: -60 }, { x: 0,   y: -60 }, { x: 75,  y: -60 },
  { x: -90, y: 0   }, { x: -30, y: 0   }, { x: 30,  y: 0   }, { x: 90, y: 0 },
  { x: -75, y: 60  }, { x: 0,   y: 60  }, { x: 75,  y: 60  }
];

/** 10-slot buff/boss formation (wider spacing) */
export const NPC_FORMATION_10_BUFF_SLOTS = [
  { x: -120, y: -85 }, { x: 0,    y: -85 }, { x: 120,  y: -85 },
  { x: -140, y: 0   }, { x: -50,  y: 0   }, { x: 50,   y: 0   }, { x: 140, y: 0 },
  { x: -120, y: 85  }, { x: 0,    y: 85  }, { x: 120,  y: 85  }
];

/** 9-slot formation */
export const NPC_FORMATION_9_SLOTS = [
  { x: -75, y: -55 }, { x: 0, y: -55 }, { x: 75, y: -55 },
  { x: -75, y: 0   }, { x: 0, y: 0   }, { x: 75, y: 0   },
  { x: -75, y: 55  }, { x: 0, y: 55  }, { x: 75, y: 55  }
];

/** 8-slot formation */
export const NPC_FORMATION_8_SLOTS = [
  { x: -75, y: -50 }, { x: 0,   y: -50 }, { x: 75, y: -50 },
  { x: -40, y: 0   }, { x: 40,  y: 0   },
  { x: -75, y: 50  }, { x: 0,   y: 50  }, { x: 75, y: 50  }
];

/** 7-slot standard formation */
export const NPC_FORMATION_7_SLOTS = [
  { x: -70, y: -48 }, { x: 0,   y: -48 }, { x: 70, y: -48 },
  { x: -35, y: 6   }, { x: 35,  y: 6   },
  { x: -70, y: 60  }, { x: 0,   y: 60  }
];

/** 7-slot buff/boss formation */
export const NPC_FORMATION_7_BUFF_SLOTS = [
  { x: -105, y: -65 }, { x: 0,    y: -65 }, { x: 105, y: -65 },
  { x: -55,  y: 8   }, { x: 55,   y: 8   },
  { x: -105, y: 80  }, { x: 0,    y: 80  }
];

/** 6-slot formation */
export const NPC_FORMATION_6_SLOTS = [
  { x: -65, y: -42 }, { x: 0,   y: -42 }, { x: 65, y: -42 },
  { x: -65, y: 42  }, { x: 0,   y: 42  }, { x: 65, y: 42  }
];

/** 5-slot formation */
export const NPC_FORMATION_5_SLOTS = [
  { x: -55, y: -38 }, { x: 55, y: -38 },
  { x: 0,   y: 0   },
  { x: -55, y: 38  }, { x: 55, y: 38  }
];

/**
 * Returns the appropriate formation slot array for a given NPC count.
 * @param {number} count
 * @param {boolean} [isBuff=false] - use wider buff/boss formation
 * @returns {Array<{x:number, y:number}>}
 */
export function getFormationSlots(count, isBuff = false) {
  if (count >= 10) return isBuff ? NPC_FORMATION_10_BUFF_SLOTS : NPC_FORMATION_10_SLOTS;
  if (count === 9)  return NPC_FORMATION_9_SLOTS;
  if (count === 8)  return NPC_FORMATION_8_SLOTS;
  if (count === 7)  return isBuff ? NPC_FORMATION_7_BUFF_SLOTS : NPC_FORMATION_7_SLOTS;
  if (count === 6)  return NPC_FORMATION_6_SLOTS;
  return NPC_FORMATION_5_SLOTS;
}

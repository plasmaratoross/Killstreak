/**
 * WorldRenderer — combat-map and village rendering, extracted from js/game.js in Phase 4.
 *
 * Bodies moved verbatim; `this` rebound to the `game` parameter. drawSafeRoundRect
 * is a pure helper (its original body never used `this`) so it keeps its ctx signature.
 * LobbyRenderer imports it from here.
 */

export function drawSafeRoundRect(ctx, x, y, w, h, r = 0) {
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(x, y, w, h, r);
  } else {
    const radius = typeof r === "number" ? Math.min(r, w / 2, h / 2) : 0;
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
  }
}

/** @param {object} game @param {object} map */
export function drawMapWorld(game, map) {
  if (game.currentArea === "COMBAT") {
    // Lush Grassland Base Floor (darkened during Bloodmoon)
    const bmActive = game.bloodmoon && game.bloodmoon.isActive;
    game.ctx.fillStyle = bmActive ? "#120d0d" : "#1b381d";
    game.ctx.fillRect(0, 0, map.width, map.height);

    // Grassland Natural Grid (crimson-tinted during Bloodmoon)
    const gridSize = 60;
    game.ctx.save();
    game.ctx.strokeStyle = bmActive ? "rgba(120, 20, 20, 0.35)" : "rgba(40, 80, 45, 0.35)";
    game.ctx.lineWidth = 1;

    for (let x = 0; x <= map.width; x += gridSize) {
      game.ctx.beginPath();
      game.ctx.moveTo(x, 0);
      game.ctx.lineTo(x, map.height);
      game.ctx.stroke();
    }
    for (let y = 0; y <= map.height; y += gridSize) {
      game.ctx.beginPath();
      game.ctx.moveTo(0, y);
      game.ctx.lineTo(map.width, y);
      game.ctx.stroke();
    }

    // Draw Village Pathways & Natural Clearings
    game.ctx.fillStyle = "rgba(55, 38, 20, 0.38)";
    game.ctx.beginPath();
    game.ctx.ellipse(4550, 2480, 480, 360, 0, 0, Math.PI * 2);
    game.ctx.fill();

    // Trail leading from village to lake
    game.ctx.beginPath();
    game.ctx.moveTo(4520, 2200);
    game.ctx.quadraticCurveTo(4600, 1800, 4700, 1650);
    game.ctx.lineWidth = 32;
    game.ctx.strokeStyle = "rgba(55, 38, 20, 0.32)";
    game.ctx.stroke();

    // Trail connecting from Combat Portal towards Zone 0 & 1
    game.ctx.beginPath();
    game.ctx.moveTo(120, 1980);
    game.ctx.lineTo(850, 1980);
    game.ctx.lineWidth = 24;
    game.ctx.strokeStyle = "rgba(55, 38, 20, 0.28)";
    game.ctx.stroke();

    // Draw Scenic Lake
    if (map.lake) {
      const lk = map.lake;
      const cx = lk.x + lk.width / 2;
      const cy = lk.y + lk.height / 2;
      const rx = lk.width / 2;
      const ry = lk.height / 2;

      // Sandy Shoreline Ring
      game.ctx.fillStyle = "#5c4028";
      game.ctx.beginPath();
      game.ctx.ellipse(cx, cy, rx + 18, ry + 18, 0, 0, Math.PI * 2);
      game.ctx.fill();

      // Wet Sand Edge
      game.ctx.fillStyle = "#3b291a";
      game.ctx.beginPath();
      game.ctx.ellipse(cx, cy, rx + 6, ry + 6, 0, 0, Math.PI * 2);
      game.ctx.fill();

      // Deep Water Basin (blood-red during Bloodmoon)
      const waterGrad = game.ctx.createRadialGradient(cx, cy, 20, cx, cy, rx);
      if (bmActive) {
        waterGrad.addColorStop(0, "#7f1d1d");
        waterGrad.addColorStop(0.7, "#991b1b");
        waterGrad.addColorStop(1, "#450a0a");
      } else {
        waterGrad.addColorStop(0, "#0284c7");
        waterGrad.addColorStop(0.7, "#0369a1");
        waterGrad.addColorStop(1, "#075985");
      }
      game.ctx.fillStyle = waterGrad;
      game.ctx.beginPath();
      game.ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      game.ctx.fill();
      game.ctx.strokeStyle = "rgba(56, 189, 248, 0.45)";
      game.ctx.lineWidth = 3;
      game.ctx.stroke();

      // Gentle Water Ripples
      const ripplePulse = (game.player.animTimer || 0) * 1.5;
      game.ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
      game.ctx.lineWidth = 1.5;
      for (let i = 0; i < 4; i++) {
        const rippleR = ((ripplePulse * 25 + i * 55) % (rx * 0.75)) + 15;
        game.ctx.beginPath();
        game.ctx.ellipse(cx - 30 + i * 20, cy + (i % 2 === 0 ? -15 : 20), rippleR * 0.45, rippleR * 0.2, 0, 0, Math.PI * 2);
        game.ctx.stroke();
      }

      // Lake Name Banner
      game.ctx.font = "bold 14px -apple-system, BlinkMacSystemFont, sans-serif";
      game.ctx.fillStyle = "rgba(56, 189, 248, 0.9)";
      game.ctx.textAlign = "center";
      game.ctx.fillText("TRANQUIL LAKE", cx, cy - 8);
      game.ctx.font = "11px -apple-system, BlinkMacSystemFont, sans-serif";
      game.ctx.fillStyle = "rgba(186, 230, 253, 0.7)";
      game.ctx.fillText("Scenic Eastern Frontier", cx, cy + 12);
    }

    // Draw Hay Bales
    if (map.hayBales) {
      for (let hb of map.hayBales) {
        game.ctx.save();
        // Drop Shadow
        game.ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
        game.ctx.fillRect(hb.x + 3, hb.y + 3, hb.width, hb.height);

        // Straw Bale Body
        game.ctx.fillStyle = "#ca8a04";
        game.ctx.fillRect(hb.x, hb.y, hb.width, hb.height);
        game.ctx.strokeStyle = "#854d0e";
        game.ctx.lineWidth = 1.5;
        game.ctx.strokeRect(hb.x, hb.y, hb.width, hb.height);

        // Twine Binding Cords
        game.ctx.strokeStyle = "#713f12";
        game.ctx.lineWidth = 2;
        game.ctx.beginPath();
        game.ctx.moveTo(hb.x + hb.width * 0.33, hb.y);
        game.ctx.lineTo(hb.x + hb.width * 0.33, hb.y + hb.height);
        game.ctx.moveTo(hb.x + hb.width * 0.66, hb.y);
        game.ctx.lineTo(hb.x + hb.width * 0.66, hb.y + hb.height);
        game.ctx.stroke();

        game.ctx.restore();
      }
    }

    // Draw all NPC Zones
    if (map.npcZones) {
      map.npcZones.forEach((zone) => {
        const isFairy = zone.npcType === "fairy";
        const isGuard = zone.npcType === "guard";
        const isThug = zone.npcType === "thug";
        const isSwordman = zone.npcType === "swordman";
        const isBuffMan = zone.npcType === "buff_man";
        const isElf = zone.npcType === "elf";
        const isIronborn = zone.npcType === "ironborn";
        const isBloodfang = zone.npcType === "bloodfang";
        const isArcanist = zone.npcType === "arcanist";
        const isColossus = zone.npcType === "colossus";
        const isStarforged = zone.npcType === "starforged";
        const isGrizzlehorn = zone.npcType === "grizzlehorn";
        const isBrambleback = zone.npcType === "brambleback";
        const isEmbermane = zone.npcType === "embermane";
        const isDuskhorn = zone.npcType === "duskhorn";
        const isMirewalker = zone.npcType === "mirewalker";
        const isThunderhoof = zone.npcType === "thunderhoof";
        const isGloomscale = zone.npcType === "gloomscale";
        const isWildtusk = zone.npcType === "wildtusk";
        const isMoonmane = zone.npcType === "moonmane";
        const isCrimsonhide = zone.npcType === "crimsonhide";

        // Clearing Ground
        if (isGuard) game.ctx.fillStyle = "rgba(40, 50, 65, 0.45)";
        else if (isThug) game.ctx.fillStyle = "rgba(50, 35, 18, 0.45)";
        else if (isFairy) game.ctx.fillStyle = "rgba(12, 34, 56, 0.45)";
        else if (isSwordman) game.ctx.fillStyle = "rgba(30, 41, 70, 0.45)";
        else if (isBuffMan) game.ctx.fillStyle = "rgba(60, 35, 10, 0.50)";
        else if (isElf) game.ctx.fillStyle = "rgba(6, 44, 25, 0.45)";
        else if (isIronborn) game.ctx.fillStyle = "rgba(40, 42, 45, 0.55)";
        else if (isBloodfang) game.ctx.fillStyle = "rgba(60, 15, 15, 0.55)";
        else if (isArcanist) game.ctx.fillStyle = "rgba(35, 10, 50, 0.55)";
        else if (isColossus) game.ctx.fillStyle = "rgba(30, 30, 30, 0.60)";
        else if (isStarforged) game.ctx.fillStyle = "rgba(55, 40, 5, 0.60)";
        else if (isGrizzlehorn) game.ctx.fillStyle = "rgba(45, 30, 15, 0.55)";
        else if (isBrambleback) game.ctx.fillStyle = "rgba(15, 45, 25, 0.55)";
        else if (isEmbermane) game.ctx.fillStyle = "rgba(55, 20, 5, 0.55)";
        else if (isDuskhorn) game.ctx.fillStyle = "rgba(30, 15, 55, 0.55)";
        else if (isMirewalker) game.ctx.fillStyle = "rgba(10, 40, 40, 0.55)";
        else if (isThunderhoof) game.ctx.fillStyle = "rgba(15, 25, 60, 0.55)";
        else if (isGloomscale) game.ctx.fillStyle = "rgba(35, 10, 30, 0.60)";
        else if (isWildtusk) game.ctx.fillStyle = "rgba(50, 30, 10, 0.55)";
        else if (isMoonmane) game.ctx.fillStyle = "rgba(25, 30, 60, 0.55)";
        else if (isCrimsonhide) game.ctx.fillStyle = "rgba(65, 8, 8, 0.65)";
        else game.ctx.fillStyle = "rgba(35, 25, 18, 0.40)";

        game.ctx.fillRect(zone.x, zone.y, zone.width, zone.height);

        game.ctx.strokeStyle = zone.accentColor || (isFairy ? "rgba(56, 189, 248, 0.55)" : "rgba(220, 38, 38, 0.45)");
        game.ctx.lineWidth = 2.5;
        game.ctx.setLineDash([8, 6]);
        game.ctx.strokeRect(zone.x, zone.y, zone.width, zone.height);
        game.ctx.setLineDash([]);

        // Zone Name Banner
        const I18n = window.Killstreak && window.Killstreak.I18n;
        game.ctx.font = "bold 11px -apple-system, BlinkMacSystemFont, sans-serif";
        game.ctx.fillStyle = zone.tagColor || (isFairy ? "rgba(56, 189, 248, 0.95)" : "rgba(248, 113, 113, 0.85)");
        game.ctx.textAlign = "center";
        const zoneBanner = I18n ? I18n.getZoneLabel(zone.id) : zone.label;
        game.ctx.fillText(zoneBanner, zone.x + zone.width / 2, zone.y + 20);

        // NPC count tag
        const activeInZone = game.npcs.filter(n => n.zoneIndex === zone.index).length;
        let unitKey = "zones.unit_sentry";
        if (isGuard) unitKey = "zones.unit_guard";
        else if (isThug) unitKey = "zones.unit_thug";
        else if (isFairy) unitKey = "zones.unit_fairy";
        else if (isSwordman) unitKey = "zones.unit_swordman";
        else if (isBuffMan) unitKey = "zones.unit_buff_man";
        else if (isElf) unitKey = "zones.unit_elf";
        else if (isIronborn) unitKey = "zones.unit_ironborn";
        else if (isBloodfang) unitKey = "zones.unit_bloodfang";
        else if (isArcanist) unitKey = "zones.unit_arcanist";
        else if (isColossus) unitKey = "zones.unit_colossus";
        else if (isStarforged) unitKey = "zones.unit_starforged";
        else if (isGrizzlehorn) unitKey = "zones.unit_grizzlehorn";
        else if (isBrambleback) unitKey = "zones.unit_brambleback";
        else if (isEmbermane) unitKey = "zones.unit_embermane";
        else if (isDuskhorn) unitKey = "zones.unit_duskhorn";
        else if (isMirewalker) unitKey = "zones.unit_mirewalker";
        else if (isThunderhoof) unitKey = "zones.unit_thunderhoof";
        else if (isGloomscale) unitKey = "zones.unit_gloomscale";
        else if (isWildtusk) unitKey = "zones.unit_wildtusk";
        else if (isMoonmane) unitKey = "zones.unit_moonmane";
        else if (isCrimsonhide) unitKey = "zones.unit_crimsonhide";

        const unitLabel = I18n ? I18n.t(unitKey) : "Sentries [100 HP • 1 Streak]";
        const countTag = I18n
          ? I18n.t("zones.unit_active_format", { unit: unitLabel, count: activeInZone, max: zone.maxNpcs })
          : `Active ${unitLabel}: ${activeInZone}/${zone.maxNpcs}`;

        game.ctx.font = "bold 10px -apple-system, BlinkMacSystemFont, sans-serif";
        game.ctx.fillStyle = zone.tagColor || "rgba(255, 255, 255, 0.6)";
        game.ctx.fillText(countTag, zone.x + zone.width / 2, zone.y + 36);
      });
    }

    // Outer Grassland Boundaries
    game.ctx.strokeStyle = "#14532d";
    game.ctx.lineWidth = 6;
    game.ctx.strokeRect(3, 3, map.width - 6, map.height - 6);
    game.ctx.restore();
  } else {
    // Warm Lounge Hardwood / Slate Tiles Floor
    game.ctx.fillStyle = "#0c111c";
    game.ctx.fillRect(0, 0, map.width, map.height);

    // Elegant Lounge Parquet Grid
    const gridSize = 40;
    game.ctx.save();
    game.ctx.strokeStyle = "rgba(148, 163, 184, 0.05)";
    game.ctx.lineWidth = 1;

    for (let x = 0; x <= map.width; x += gridSize) {
      game.ctx.beginPath();
      game.ctx.moveTo(x, 0);
      game.ctx.lineTo(x, map.height);
      game.ctx.stroke();
    }
    for (let y = 0; y <= map.height; y += gridSize) {
      game.ctx.beginPath();
      game.ctx.moveTo(0, y);
      game.ctx.lineTo(map.width, y);
      game.ctx.stroke();
    }

    // Ambient Lounge Outer Wall / Border
    game.ctx.strokeStyle = "rgba(56, 189, 248, 0.3)";
    game.ctx.lineWidth = 4;
    game.ctx.strokeRect(2, 2, map.width - 4, map.height - 4);
    game.ctx.restore();
  }
}

/** @param {object} game @param {object} map */
export function drawVillageStructures(game, map) {
  if (!map) return;
  const ctx = game.ctx;

  // Draw Well
  if (map.well) {
    const w = map.well;
    ctx.save();
    // Drop shadow
    ctx.beginPath();
    ctx.arc(w.x + 3, w.y + 4, w.radius, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
    ctx.fill();

    // Stone Rim
    ctx.beginPath();
    ctx.arc(w.x, w.y, w.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#64748b";
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#334155";
    ctx.stroke();

    // Well Water Core
    ctx.beginPath();
    ctx.arc(w.x, w.y, w.radius * 0.65, 0, Math.PI * 2);
    ctx.fillStyle = "#0c4a6e";
    ctx.fill();

    // Wooden Roof Beam
    ctx.fillStyle = "#78350f";
    ctx.fillRect(w.x - w.radius - 2, w.y - 4, (w.radius + 2) * 2, 8);
    ctx.strokeStyle = "#451a03";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(w.x - w.radius - 2, w.y - 4, (w.radius + 2) * 2, 8);

    // Well Label
    ctx.font = "bold 9px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillStyle = "rgba(203, 213, 225, 0.85)";
    ctx.textAlign = "center";
    ctx.fillText("VILLAGE WELL", w.x, w.y - w.radius - 6);
    ctx.restore();
  }

  // Draw Barrels
  if (map.barrels) {
    for (let b of map.barrels) {
      ctx.save();
      // Shadow
      ctx.beginPath();
      ctx.arc(b.x + 2, b.y + 3, b.radius, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
      ctx.fill();

      // Barrel Body
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fillStyle = "#92400e";
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#451a03";
      ctx.stroke();

      // Iron Hoops
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius * 0.7, 0, Math.PI * 2);
      ctx.strokeStyle = "#475569";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.restore();
    }
  }

  // Draw Houses
  if (map.houses) {
    for (let h of map.houses) {
      ctx.save();
      // House Shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
      ctx.fillRect(h.x + 8, h.y + 8, h.width, h.height);

      // Walls
      ctx.fillStyle = "#475569";
      ctx.fillRect(h.x, h.y, h.width, h.height);
      ctx.strokeStyle = "#1e293b";
      ctx.lineWidth = 2.5;
      ctx.strokeRect(h.x, h.y, h.width, h.height);

      // Stone Corner Pillars
      ctx.fillStyle = "#334155";
      ctx.fillRect(h.x, h.y, 14, h.height);
      ctx.fillRect(h.x + h.width - 14, h.y, 14, h.height);

      // Doorway
      const doorW = 24;
      const doorH = 34;
      const doorX = h.x + h.width / 2 - doorW / 2;
      const doorY = h.y + h.height - doorH;
      ctx.fillStyle = "#451a03";
      ctx.fillRect(doorX, doorY, doorW, doorH);
      ctx.strokeStyle = "#291e13";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(doorX, doorY, doorW, doorH);

      // Door Handle
      ctx.fillStyle = "#fbbf24";
      ctx.beginPath();
      ctx.arc(doorX + doorW - 5, doorY + doorH / 2, 2, 0, Math.PI * 2);
      ctx.fill();

      // Glowing Windows
      const winY = h.y + 24;
      const winSize = 18;
      [h.x + 22, h.x + h.width - 22 - winSize].forEach(wx => {
        ctx.fillStyle = "rgba(254, 240, 138, 0.85)";
        ctx.shadowColor = "#fef08a";
        ctx.shadowBlur = 8;
        ctx.fillRect(wx, winY, winSize, winSize);
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "#451a03";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(wx, winY, winSize, winSize);
        // Window Mullions
        ctx.beginPath();
        ctx.moveTo(wx + winSize / 2, winY);
        ctx.lineTo(wx + winSize / 2, winY + winSize);
        ctx.moveTo(wx, winY + winSize / 2);
        ctx.lineTo(wx + winSize, winY + winSize / 2);
        ctx.stroke();
      });

      // Pitched Roof
      const roofOverhang = 8;
      ctx.fillStyle = h.roofColor || "#92400e";
      ctx.beginPath();
      ctx.moveTo(h.x - roofOverhang, h.y);
      ctx.lineTo(h.x + h.width / 2, h.y - 32);
      ctx.lineTo(h.x + h.width + roofOverhang, h.y);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#451a03";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Roof Ridge / Shingle Line
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(h.x - roofOverhang + 6, h.y - 6);
      ctx.lineTo(h.x + h.width / 2, h.y - 26);
      ctx.lineTo(h.x + h.width + roofOverhang - 6, h.y - 6);
      ctx.stroke();

      ctx.restore();
    }
  }
}

export default { drawMapWorld, drawVillageStructures, drawSafeRoundRect };

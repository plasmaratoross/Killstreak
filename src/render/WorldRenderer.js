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

      // Lake Name Banner (positioned at upper area of lake)
      game.ctx.font = "bold 14px -apple-system, BlinkMacSystemFont, sans-serif";
      game.ctx.fillStyle = "rgba(56, 189, 248, 0.9)";
      game.ctx.textAlign = "center";
      game.ctx.fillText("TRANQUIL LAKE", cx, cy - ry + 42);
      game.ctx.font = "11px -apple-system, BlinkMacSystemFont, sans-serif";
      game.ctx.fillStyle = "rgba(186, 230, 253, 0.7)";
      game.ctx.fillText("Scenic Eastern Frontier", cx, cy - ry + 58);

      // Atlantis Entrance Portal — Positioned in the middle of the lake
      const totalKills = (game.saveData && game.saveData.totalKills) || 0;
      const isAtlantisUnlocked = totalKills >= 150000;
      drawAtlantisPortal(game.ctx, cx, cy, 46, false, isAtlantisUnlocked, ripplePulse, bmActive, totalKills);
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
  } else if (game.currentArea === "ATLANTIS") {
    drawAtlantisWorld(game, map);
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

/**
 * Draw underwater rock formations with oceanic shading and caustic highlights
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} r
 * @param {boolean} isBloodmoon
 */
export function drawUnderwaterRock(ctx, r, isBloodmoon) {
  ctx.save();
  // Drop Shadow
  ctx.beginPath();
  ctx.ellipse(r.x + 5, r.y + 6, r.radius * 1.12, r.radius * 0.88, 0, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
  ctx.fill();

  // Rock Body Gradient
  const grad = ctx.createRadialGradient(
    r.x - r.radius * 0.3, r.y - r.radius * 0.3, r.radius * 0.1,
    r.x, r.y, r.radius
  );
  if (isBloodmoon) {
    grad.addColorStop(0, "#2a153d");
    grad.addColorStop(0.65, "#180a26");
    grad.addColorStop(1, "#0a0312");
  } else {
    grad.addColorStop(0, "#334155");
    grad.addColorStop(0.65, "#1e293b");
    grad.addColorStop(1, "#0f172a");
  }

  ctx.beginPath();
  ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  // Rim highlight / Caustic reflection edge
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = isBloodmoon ? "rgba(168, 85, 247, 0.35)" : "rgba(56, 189, 248, 0.35)";
  ctx.stroke();

  // Strata Ridges / Ancient Crags
  ctx.beginPath();
  ctx.arc(r.x - r.radius * 0.2, r.y - r.radius * 0.2, r.radius * 0.45, 0.2, Math.PI * 1.2);
  ctx.strokeStyle = isBloodmoon ? "rgba(192, 132, 252, 0.25)" : "rgba(148, 163, 184, 0.25)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.restore();
}

/**
 * Draw coral formations
 * Normal: Vibrant, bioluminescent living reef
 * Bloodmoon: Dead, dark, decayed, corrupted purple-and-black withered forms
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} c
 * @param {boolean} isBloodmoon
 * @param {number} animTime
 */
export function drawCoralFormation(ctx, c, isBloodmoon, animTime) {
  ctx.save();
  const type = c.type || "branch";

  if (!isBloodmoon) {
    // ==========================================
    // NORMAL: VIBRANT BIOLUMINESCENT LIVING REEF
    // ==========================================
    const pulse = 0.85 + 0.15 * Math.sin(animTime * 2 + (c.x * 0.01));
    const baseColor = c.color || "#06b6d4";
    const tipColor = c.accentColor || "#67e8f9";

    // Ambient Bioluminescent Seafloor Glow
    const glowGrad = ctx.createRadialGradient(c.x, c.y, 5, c.x, c.y, c.radius * 1.5);
    glowGrad.addColorStop(0, baseColor + "33");
    glowGrad.addColorStop(1, "transparent");
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.radius * 1.5, 0, Math.PI * 2);
    ctx.fill();

    if (type === "brain") {
      // Brain Coral — Rounded dome with convoluted glowing ridges
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
      ctx.fillStyle = baseColor;
      ctx.fill();
      ctx.strokeStyle = tipColor;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Intricate Brain Ridges
      ctx.strokeStyle = tipColor;
      ctx.lineWidth = 2;
      for (let r = c.radius * 0.3; r < c.radius; r += 7) {
        ctx.beginPath();
        const startAng = (r * 0.1) + animTime * 0.2;
        ctx.arc(c.x, c.y, r, startAng, startAng + Math.PI * 1.5);
        ctx.stroke();
      }

    } else if (type === "fan") {
      // Sea Fan Coral — Delicate filigree lattice swaying gently
      const sway = Math.sin(animTime + c.x * 0.05) * 0.15;
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(sway);

      ctx.strokeStyle = baseColor;
      ctx.lineWidth = 2;
      const ribs = 7;
      for (let i = 0; i < ribs; i++) {
        const ang = -Math.PI * 0.4 + (i / (ribs - 1)) * Math.PI * 0.8;
        const len = c.radius * (0.8 + 0.2 * Math.sin(i * 1.2));
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(ang) * len, Math.sin(ang) * len);
        ctx.stroke();

        // Glowing outer tips
        ctx.fillStyle = tipColor;
        ctx.beginPath();
        ctx.arc(Math.cos(ang) * len, Math.sin(ang) * len, 3.5 * pulse, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

    } else if (type === "table") {
      // Table Coral — Tiered circular plates
      [c.radius, c.radius * 0.65, c.radius * 0.35].forEach((r, idx) => {
        ctx.beginPath();
        ctx.ellipse(c.x, c.y - idx * 4, r, r * 0.6, 0, 0, Math.PI * 2);
        ctx.fillStyle = idx === 0 ? baseColor : tipColor;
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

    } else if (type === "bioluminescent") {
      // Deep-Sea Lantern Polyps — Intense pulsing halo
      ctx.shadowColor = baseColor;
      ctx.shadowBlur = 18 * pulse;

      // Central core
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.radius * 0.55 * pulse, 0, Math.PI * 2);
      ctx.fillStyle = tipColor;
      ctx.fill();

      // Outer satellite glowing nodes
      const satellites = 5;
      for (let i = 0; i < satellites; i++) {
        const ang = (i * Math.PI * 2) / satellites + animTime * 0.5;
        const dist = c.radius * 0.85;
        ctx.beginPath();
        ctx.arc(c.x + Math.cos(ang) * dist, c.y + Math.sin(ang) * dist, 4.5 * pulse, 0, Math.PI * 2);
        ctx.fillStyle = baseColor;
        ctx.fill();
      }
      ctx.shadowBlur = 0;

    } else {
      // Branching Staghorn Coral (Default)
      ctx.strokeStyle = baseColor;
      ctx.lineWidth = 4;
      const branches = 6;
      for (let i = 0; i < branches; i++) {
        const ang = (i * Math.PI * 2) / branches + (c.x % 1);
        const len = c.radius * 0.85;
        const bx = c.x + Math.cos(ang) * len;
        const by = c.y + Math.sin(ang) * len;

        ctx.beginPath();
        ctx.moveTo(c.x, c.y);
        ctx.lineTo(bx, by);
        ctx.stroke();

        // Glowing bulbous tip
        ctx.shadowColor = tipColor;
        ctx.shadowBlur = 12 * pulse;
        ctx.fillStyle = tipColor;
        ctx.beginPath();
        ctx.arc(bx, by, 5 * pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      // Central base node
      ctx.fillStyle = baseColor;
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.radius * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }

  } else {
    // ==========================================================
    // BLOODMOON: DEAD, DARK, DECAYED CORRUPTED PURPLE-BLACK CORAL
    // ==========================================
    // Shriveled, broken, withered silhouette with necrotic purple cracks
    ctx.save();
    // Dead Coral Drop Shadow
    ctx.beginPath();
    ctx.ellipse(c.x + 3, c.y + 4, c.radius * 0.9, c.radius * 0.7, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
    ctx.fill();

    // Withered Obsidian Base
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.radius * 0.8, 0, Math.PI * 2);
    ctx.fillStyle = "#120e17";
    ctx.fill();
    ctx.strokeStyle = "#3b0764";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Withered Brittle Branches (Charred black and decaying purple)
    const branches = 5;
    for (let i = 0; i < branches; i++) {
      const ang = (i * Math.PI * 2) / branches + 0.3;
      const len = c.radius * 0.65; // Shriveled in length
      const bx = c.x + Math.cos(ang) * len;
      const by = c.y + Math.sin(ang) * len;

      ctx.strokeStyle = i % 2 === 0 ? "#1c1924" : "#2e1065";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(c.x, c.y);
      // Jagged withered angles
      const midX = (c.x + bx) / 2 + (i % 2 === 0 ? 4 : -4);
      const midY = (c.y + by) / 2;
      ctx.lineTo(midX, midY);
      ctx.lineTo(bx, by);
      ctx.stroke();

      // Dead, broken, decaying tip with faint dying necrotic purple ember
      ctx.fillStyle = "#1e1b24";
      ctx.beginPath();
      ctx.arc(bx, by, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Necrotic decay crack
      ctx.strokeStyle = "rgba(147, 51, 234, 0.45)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Ash-grey decayed crust overlay
    ctx.strokeStyle = "rgba(51, 65, 85, 0.4)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.radius * 0.4, 0, Math.PI * 1.5);
    ctx.stroke();

    ctx.restore();
  }

  ctx.restore();
}

/**
 * Draw Atlantis portals (Entrance whirlpool in lake or Return gateway on dais)
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} radius
 * @param {boolean} isReturn
 * @param {boolean} isUnlocked
 * @param {number} animTime
 * @param {boolean} isBloodmoon
 * @param {number} [totalKills=0]
 */
export function drawAtlantisPortal(ctx, x, y, radius, isReturn, isUnlocked, animTime, isBloodmoon, totalKills = 0) {
  ctx.save();
  const spin = animTime * 1.8;

  // 1. Sunken Stone Runic Dais (Base Platform)
  ctx.beginPath();
  ctx.arc(x, y, radius + 16, 0, Math.PI * 2);
  ctx.fillStyle = isBloodmoon ? "rgba(30, 8, 55, 0.65)" : "rgba(8, 51, 80, 0.65)";
  ctx.fill();
  ctx.strokeStyle = isBloodmoon
    ? "rgba(168, 85, 247, 0.5)"
    : (isUnlocked ? "rgba(56, 189, 248, 0.65)" : "rgba(239, 68, 68, 0.55)");
  ctx.lineWidth = 3.5;
  ctx.stroke();

  // 2. Swirling Water Vortex Whirlpool Rings
  const ringCount = 3;
  for (let i = 0; i < ringCount; i++) {
    const r = radius * (0.4 + i * 0.28);
    const ringAng = spin * (i % 2 === 0 ? 1 : -1) + (i * 1.2);
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, r, ringAng, ringAng + Math.PI * 1.4);
    if (isBloodmoon) {
      ctx.strokeStyle = i === 0 ? "rgba(216, 180, 254, 0.9)" : "rgba(147, 51, 234, 0.65)";
    } else if (isUnlocked) {
      ctx.strokeStyle = i === 0 ? "rgba(255, 255, 255, 0.95)" : "rgba(34, 211, 238, 0.75)";
    } else {
      ctx.strokeStyle = i === 0 ? "rgba(248, 113, 113, 0.85)" : "rgba(185, 28, 28, 0.65)";
    }
    ctx.lineWidth = 3 - i * 0.6;
    ctx.stroke();
    ctx.restore();
  }

  // 3. Central Vortex Core
  const coreGrad = ctx.createRadialGradient(x, y, 4, x, y, radius * 0.5);
  if (isBloodmoon) {
    coreGrad.addColorStop(0, "#c084fc");
    coreGrad.addColorStop(0.5, "#581c87");
    coreGrad.addColorStop(1, "#1e0836");
  } else if (isUnlocked) {
    coreGrad.addColorStop(0, "#ffffff");
    coreGrad.addColorStop(0.4, "#38bdf8");
    coreGrad.addColorStop(1, "#0369a1");
  } else {
    coreGrad.addColorStop(0, "#fca5a5");
    coreGrad.addColorStop(0.5, "#dc2626");
    coreGrad.addColorStop(1, "#450a0a");
  }
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(x, y, radius * 0.5, 0, Math.PI * 2);
  ctx.fill();

  // Swirling Particle Motes
  for (let p = 0; p < 6; p++) {
    const pAng = spin * 1.5 + (p * Math.PI / 3);
    const pDist = radius * 0.35 + Math.sin(animTime * 3 + p) * (radius * 0.25);
    const px = x + Math.cos(pAng) * pDist;
    const py = y + Math.sin(pAng) * pDist;
    ctx.fillStyle = isBloodmoon ? "#f3e8ff" : (isUnlocked ? "#e0f2fe" : "#fecaca");
    ctx.beginPath();
    ctx.arc(px, py, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // 4. Portal Label Badge & Information
  ctx.font = "bold 13px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.textAlign = "center";

  if (isReturn) {
    // Return Portal
    ctx.fillStyle = isBloodmoon ? "rgba(216, 180, 254, 0.95)" : "rgba(56, 189, 248, 0.95)";
    ctx.fillText("RETURN TO GRASSLAND", x, y - radius - 18);
    ctx.font = "10px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillStyle = isBloodmoon ? "rgba(192, 132, 252, 0.8)" : "rgba(186, 230, 253, 0.8)";
    ctx.fillText("[PRESS E]", x, y - radius - 4);
  } else {
    // Entrance Portal in Lake
    if (isUnlocked) {
      ctx.fillStyle = "rgba(56, 189, 248, 0.95)";
      ctx.fillText("PORTAL TO ATLANTIS", x, y - radius - 20);
      ctx.font = "bold 11px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillStyle = "rgba(34, 211, 238, 0.95)";
      ctx.fillText("✨ UNLOCKED — PRESS [E] TO ENTER", x, y - radius - 6);
    } else {
      ctx.fillStyle = "rgba(248, 113, 113, 0.95)";
      ctx.fillText("PORTAL TO ATLANTIS", x, y - radius - 20);
      ctx.font = "bold 10px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillStyle = "rgba(252, 165, 165, 0.95)";
      const formattedKills = (totalKills || 0).toLocaleString();
      ctx.fillText(`🔒 LOCKED: 150,000 KILLS (${formattedKills}/150,000)`, x, y - radius - 6);
    }
  }

  ctx.restore();
}

/**
 * Draw underwater particulate and bubbles drifting upward
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} game
 * @param {boolean} isBloodmoon
 * @param {number} animTime
 */
export function drawUnderwaterAtmosphere(ctx, game, isBloodmoon, animTime) {
  const cam = game.camera ? game.camera.getOffset() : { x: 0, y: 0 };
  const vpW = (game.viewport && game.viewport.width) || 1000;
  const vpH = (game.viewport && game.viewport.height) || 650;

  ctx.save();
  // 18 drifting bubbles within the viewport area
  const bubbleCount = 18;
  for (let i = 0; i < bubbleCount; i++) {
    const seed = i * 237.19;
    const speed = 35 + (i % 5) * 15;
    const rawY = vpH - (((animTime * speed + seed) % (vpH + 100)) - 50);
    const wobble = Math.sin(animTime * 1.5 + i) * 16;
    const rawX = ((seed * 17) % vpW) + wobble;

    const wx = cam.x + rawX;
    const wy = cam.y + rawY;
    const bRadius = 2.5 + (i % 4) * 1.8;

    ctx.beginPath();
    ctx.arc(wx, wy, bRadius, 0, Math.PI * 2);
    ctx.fillStyle = isBloodmoon ? "rgba(192, 132, 252, 0.28)" : "rgba(186, 230, 253, 0.32)";
    ctx.fill();
    ctx.strokeStyle = isBloodmoon ? "rgba(147, 51, 234, 0.45)" : "rgba(56, 189, 248, 0.45)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Specular bubble highlight
    ctx.beginPath();
    ctx.arc(wx - bRadius * 0.3, wy - bRadius * 0.3, bRadius * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.fill();
  }
  ctx.restore();
}

/**
 * Draw the Atlantis Underwater Realm
 * Vast underwater terrain, open ocean surroundings, ancient sunken plaza,
 * rock & coral formations with Bloodmoon purple-and-black corruption support.
 * @param {object} game
 * @param {object} map
 */
export function drawAtlantisWorld(game, map) {
  const ctx = game.ctx;
  const bmActive = Boolean(game.bloodmoon && game.bloodmoon.isActive);
  const animTime = (game.player ? game.player.animTimer || 0 : 0) * 1.5;
  const width = map.width || 11440;
  const height = map.height || 7920;
  const bounds = map.playableBounds || { minX: 850, maxX: width - 850, minY: 850, maxY: height - 850 };

  // 1. Vast Open Water Surrounding (Abyssal Trench)
  ctx.fillStyle = bmActive ? "#06020c" : "#010c17";
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  const shelfX = bounds.minX;
  const shelfY = bounds.minY;
  const shelfW = bounds.maxX - bounds.minX;
  const shelfH = bounds.maxY - bounds.minY;

  // 2. Playable Underwater Seabed Floor
  // Normal: Deep sapphire-cyan ocean floor
  // Bloodmoon: Corrupted purple-and-black abyss
  const floorGrad = ctx.createRadialGradient(
    width / 2, height / 2, 400,
    width / 2, height / 2, width * 0.55
  );
  if (bmActive) {
    floorGrad.addColorStop(0, "#19082e");
    floorGrad.addColorStop(0.5, "#10041f");
    floorGrad.addColorStop(1, "#07020d");
  } else {
    floorGrad.addColorStop(0, "#052d48");
    floorGrad.addColorStop(0.5, "#031d30");
    floorGrad.addColorStop(1, "#01121e");
  }
  ctx.fillStyle = floorGrad;
  ctx.fillRect(shelfX, shelfY, shelfW, shelfH);

  // Shelf Edge Drop-off Ring / Trench Border
  ctx.strokeStyle = bmActive ? "rgba(147, 51, 234, 0.45)" : "rgba(14, 165, 233, 0.4)";
  ctx.lineWidth = 8;
  ctx.strokeRect(shelfX, shelfY, shelfW, shelfH);

  // 3. Underwater Caustic Light Rays & Web Refraction (Dancing across the seafloor)
  ctx.save();
  ctx.lineWidth = 2.5;
  const causticColor1 = bmActive ? "rgba(168, 85, 247, 0.16)" : "rgba(56, 189, 248, 0.18)";
  const causticColor2 = bmActive ? "rgba(126, 34, 206, 0.10)" : "rgba(14, 165, 233, 0.11)";

  const causticGrid = 160;
  for (let x = shelfX; x <= bounds.maxX; x += causticGrid) {
    ctx.strokeStyle = causticColor1;
    ctx.beginPath();
    const waveOffset = Math.sin(animTime * 0.8 + x * 0.005) * 28;
    ctx.moveTo(x + waveOffset, shelfY);
    ctx.bezierCurveTo(
      x - waveOffset * 1.5, shelfY + shelfH * 0.33,
      x + waveOffset * 1.5, shelfY + shelfH * 0.66,
      x - waveOffset, bounds.maxY
    );
    ctx.stroke();
  }
  for (let y = shelfY; y <= bounds.maxY; y += causticGrid) {
    ctx.strokeStyle = causticColor2;
    ctx.beginPath();
    const waveOffset = Math.cos(animTime * 0.8 + y * 0.005) * 28;
    ctx.moveTo(shelfX, y + waveOffset);
    ctx.bezierCurveTo(
      shelfX + shelfW * 0.33, y - waveOffset * 1.5,
      shelfX + shelfW * 0.66, y + waveOffset * 1.5,
      bounds.maxX, y - waveOffset
    );
    ctx.stroke();
  }
  ctx.restore();

  // 4. Subtle Seabed Sand Ripple Lines (Sediment dunes)
  ctx.save();
  ctx.strokeStyle = bmActive ? "rgba(88, 28, 135, 0.22)" : "rgba(8, 70, 105, 0.22)";
  ctx.lineWidth = 1.5;
  for (let y = shelfY + 40; y < bounds.maxY; y += 80) {
    ctx.beginPath();
    ctx.moveTo(shelfX, y);
    ctx.lineTo(bounds.maxX, y);
    ctx.stroke();
  }
  ctx.restore();

  // 5. Ancient Atlantis Sunken Megalithic Plaza (Center around return portal)
  const portalX = (map.portalToGrassland && map.portalToGrassland.x) || 5720;
  const portalY = (map.portalToGrassland && map.portalToGrassland.y) || 3960;

  ctx.save();
  // Concentric sunken stone rings
  const ringColors = bmActive
    ? ["rgba(59, 7, 100, 0.45)", "rgba(107, 33, 168, 0.35)", "rgba(147, 51, 234, 0.22)"]
    : ["rgba(8, 51, 80, 0.55)", "rgba(14, 116, 144, 0.4)", "rgba(56, 189, 248, 0.22)"];

  [400, 260, 150].forEach((r, idx) => {
    ctx.beginPath();
    ctx.arc(portalX, portalY, r, 0, Math.PI * 2);
    ctx.fillStyle = ringColors[idx];
    ctx.fill();
    ctx.strokeStyle = bmActive ? "rgba(192, 132, 252, 0.35)" : "rgba(56, 189, 248, 0.45)";
    ctx.lineWidth = 3;
    ctx.stroke();
  });

  // Radiating Runepaths / Inlay
  const spokeCount = 8;
  for (let i = 0; i < spokeCount; i++) {
    const angle = (i * Math.PI * 2) / spokeCount;
    ctx.beginPath();
    ctx.moveTo(portalX + Math.cos(angle) * 150, portalY + Math.sin(angle) * 150);
    ctx.lineTo(portalX + Math.cos(angle) * 400, portalY + Math.sin(angle) * 400);
    ctx.strokeStyle = bmActive ? "rgba(192, 132, 252, 0.3)" : "rgba(34, 211, 238, 0.4)";
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }

  // Ancient Inscribed Title on the Plaza
  ctx.font = "bold 20px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillStyle = bmActive ? "rgba(216, 180, 254, 0.85)" : "rgba(186, 230, 253, 0.9)";
  ctx.textAlign = "center";
  ctx.fillText("ATLANTIS SANCTUARY DAIS", portalX, portalY - 180);
  ctx.font = "12px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillStyle = bmActive ? "rgba(192, 132, 252, 0.7)" : "rgba(125, 211, 252, 0.75)";
  ctx.fillText("Submerged Primordial Heart", portalX, portalY - 160);
  ctx.restore();

  // 6. Draw Rock Formations
  if (map.rocks) {
    for (let r of map.rocks) {
      drawUnderwaterRock(ctx, r, bmActive);
    }
  }

  // 7. Draw Coral Formations (Normal: glowing & vibrant; Bloodmoon: dead, dark, decayed)
  if (map.corals) {
    for (let c of map.corals) {
      drawCoralFormation(ctx, c, bmActive, animTime);
    }
  }

  // 8. Return Portal to Grassland
  if (map.portalToGrassland) {
    const pt = map.portalToGrassland;
    drawAtlantisPortal(ctx, pt.x, pt.y, 44, true, true, animTime, bmActive);
  }

  // 9. Drifting Underwater Bubbles & Marine Atmosphere
  drawUnderwaterAtmosphere(ctx, game, bmActive, animTime);

  // 10. Outer Boundary Labels
  ctx.font = "bold 14px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillStyle = bmActive ? "rgba(147, 51, 234, 0.35)" : "rgba(14, 165, 233, 0.35)";
  ctx.textAlign = "center";
  ctx.fillText("— ABYSSAL OCEANIC TRENCH —", width / 2, shelfY - 30);
  ctx.fillText("— ABYSSAL OCEANIC TRENCH —", width / 2, bounds.maxY + 45);

  ctx.restore();
}

export default { drawMapWorld, drawVillageStructures, drawSafeRoundRect, drawAtlantisWorld };


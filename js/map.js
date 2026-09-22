/**
 * Killstreak 2D — Map & Navigation System
 * Provides compact HUD Minimap and interactive Full Map with pan/zoom and zone tooltips.
 */
(function(window) {
  window.Killstreak = window.Killstreak || {};

  // Recognized thematic icons for NPC types
  const NPC_ZONE_ICONS = {
    normal: "💀",
    fairy: "🧚",
    thug: "🗡️",
    guard: "🛡️",
    swordman: "⚔️",
    buff_man: "💪",
    elf: "🍃",
    ironborn: "⚙️",
    bloodfang: "🩸",
    arcanist: "🔮",
    colossus: "🗿",
    starforged: "⭐",
    grizzlehorn: "🦏",
    brambleback: "🌿",
    embermane: "🔥",
    duskhorn: "🌑",
    mirewalker: "🫧",
    thunderhoof: "⚡",
    gloomscale: "🐉",
    wildtusk: "🐗",
    moonmane: "🌙",
    crimsonhide: "👑"
  };

  class MapSystem {
    constructor() {
      this.game = null;

      // Minimap DOM Elements
      this.minimapWidget = document.getElementById("minimap-widget");
      this.minimapCanvas = document.getElementById("minimap-canvas");
      this.minimapCtx = this.minimapCanvas ? this.minimapCanvas.getContext("2d") : null;
      this.minimapCoordsText = document.getElementById("minimap-coords-text");
      this.minimapTitleText = document.getElementById("minimap-title-text");
      this.minimapTooltip = document.getElementById("minimap-tooltip");

      // Full Map DOM Elements
      this.mapModal = document.getElementById("map-modal");
      this.fullMapViewport = document.getElementById("full-map-viewport");
      this.fullMapCanvas = document.getElementById("full-map-canvas");
      this.fullMapCtx = this.fullMapCanvas ? this.fullMapCanvas.getContext("2d") : null;
      this.fullMapCoordsText = document.getElementById("full-map-coords-text");
      this.fullMapHeading = document.getElementById("full-map-heading");
      this.fullMapTooltip = document.getElementById("full-map-tooltip");

      this.zoomInBtn = document.getElementById("map-zoom-in-btn");
      this.zoomOutBtn = document.getElementById("map-zoom-out-btn");
      this.zoomResetBtn = document.getElementById("map-reset-btn");
      this.closeMapBtn = document.getElementById("close-map-btn");
      this.closeMapBtnBottom = document.getElementById("close-map-btn-bottom");

      // Full Map Pan & Zoom State
      this.zoom = 1.0;
      this.minZoom = 0.04;
      this.maxZoom = 1.2;
      this.panX = 0;
      this.panY = 0;
      this.isDragging = false;
      this.dragStartX = 0;
      this.dragStartY = 0;
      this.dragStartPanX = 0;
      this.dragStartPanY = 0;

      this.hoveredZone = null;
      this.isFullMapActive = false;
    }

    init(game) {
      this.game = game;
      this.bindEvents();
    }

    bindEvents() {
      if (this.minimapWidget) {
        this.minimapWidget.addEventListener("click", () => {
          this.openFullMap();
        });

        this.minimapCanvas.addEventListener("mousemove", (e) => {
          this.handleMinimapHover(e);
        });

        this.minimapCanvas.addEventListener("mouseleave", () => {
          if (this.minimapTooltip) this.minimapTooltip.classList.add("hidden");
        });
      }

      if (this.closeMapBtn) {
        this.closeMapBtn.addEventListener("click", () => this.closeFullMap());
      }
      if (this.closeMapBtnBottom) {
        this.closeMapBtnBottom.addEventListener("click", () => this.closeFullMap());
      }

      if (this.mapModal) {
        this.mapModal.addEventListener("click", (e) => {
          if (e.target === this.mapModal) this.closeFullMap();
        });
      }

      if (this.zoomInBtn) {
        this.zoomInBtn.addEventListener("click", () => this.zoomAtCenter(1.3));
      }
      if (this.zoomOutBtn) {
        this.zoomOutBtn.addEventListener("click", () => this.zoomAtCenter(1 / 1.3));
      }
      if (this.zoomResetBtn) {
        this.zoomResetBtn.addEventListener("click", () => this.resetFullMapView());
      }

      // Full Map Pan & Zoom Mouse Events
      if (this.fullMapCanvas) {
        this.fullMapCanvas.addEventListener("mousedown", (e) => {
          if (e.button !== 0) return;
          this.isDragging = true;
          const down = this.canvasPointFromEvent(this.fullMapCanvas, e);
          this.dragStartX = down.x;
          this.dragStartY = down.y;
          this.dragStartPanX = this.panX;
          this.dragStartPanY = this.panY;
          this.fullMapCanvas.classList.add("grabbing");
        });

        window.addEventListener("mousemove", (e) => {
          if (this.isDragging) {
            // Both ends are in canvas space, so the delta stays 1:1 with the pan
            // even when the whole scene is scaled down.
            const now = this.canvasPointFromEvent(this.fullMapCanvas, e);
            const dx = now.x - this.dragStartX;
            const dy = now.y - this.dragStartY;
            this.panX = this.dragStartPanX + dx;
            this.panY = this.dragStartPanY + dy;
            this.renderFullMap();
          } else if (this.isFullMapActive) {
            this.handleFullMapHover(e);
          }
        });

        window.addEventListener("mouseup", (e) => {
          if (this.isDragging) {
            this.isDragging = false;
            if (this.fullMapCanvas) this.fullMapCanvas.classList.remove("grabbing");
          }
        });

        this.fullMapCanvas.addEventListener("wheel", (e) => {
          e.preventDefault();
          const { x: mouseX, y: mouseY } = this.canvasPointFromEvent(this.fullMapCanvas, e);
          const factor = e.deltaY < 0 ? 1.18 : 1 / 1.18;
          this.zoomAtPoint(factor, mouseX, mouseY);
        }, { passive: false });

        this.fullMapCanvas.addEventListener("mouseleave", () => {
          if (this.fullMapTooltip) this.fullMapTooltip.classList.add("hidden");
        });
      }
    }

    getActiveMap() {
      if (!this.game) return null;
      const Config = window.Killstreak.Config;
      return (Config && Config.MAPS && Config.MAPS[this.game.currentArea]) || null;
    }

    openFullMap() {
      if (!this.mapModal) return;
      this.isFullMapActive = true;
      this.mapModal.classList.remove("hidden");
      if (this.game && this.game.player && this.fullMapCoordsText) {
        this.fullMapCoordsText.innerText = `X: ${Math.round(this.game.player.x)} | Y: ${Math.round(this.game.player.y)}`;
      }
      this.resetFullMapView();
      this.renderFullMap();
    }

    closeFullMap() {
      if (!this.mapModal) return;
      this.isFullMapActive = false;
      this.mapModal.classList.add("hidden");
      if (this.fullMapTooltip) this.fullMapTooltip.classList.add("hidden");
    }

    toggleFullMap() {
      if (this.isFullMapOpen()) {
        this.closeFullMap();
      } else {
        this.openFullMap();
      }
    }

    isFullMapOpen() {
      return this.mapModal && !this.mapModal.classList.contains("hidden");
    }

    resetFullMapView() {
      const activeMap = this.getActiveMap();
      if (!activeMap || !this.fullMapCanvas) return;

      const cw = this.fullMapCanvas.width;
      const ch = this.fullMapCanvas.height;
      const mw = activeMap.width || 1000;
      const mh = activeMap.height || 650;

      // Fit map within canvas dimensions with 5% margin
      const scaleX = (cw * 0.90) / mw;
      const scaleY = (ch * 0.90) / mh;
      this.zoom = Math.min(scaleX, scaleY);
      this.minZoom = this.zoom * 0.7;
      this.maxZoom = Math.max(1.0, this.zoom * 8.0);

      // Center the map
      this.panX = (cw - mw * this.zoom) / 2;
      this.panY = (ch - mh * this.zoom) / 2;

      this.renderFullMap();
    }

    zoomAtCenter(factor) {
      if (!this.fullMapCanvas) return;
      const cx = this.fullMapCanvas.width / 2;
      const cy = this.fullMapCanvas.height / 2;
      this.zoomAtPoint(factor, cx, cy);
    }

    zoomAtPoint(factor, px, py) {
      const prevZoom = this.zoom;
      let newZoom = prevZoom * factor;
      newZoom = Math.max(this.minZoom, Math.min(this.maxZoom, newZoom));

      // Adjust pan so point (px, py) remains fixed
      this.panX = px - (px - this.panX) * (newZoom / prevZoom);
      this.panY = py - (py - this.panY) * (newZoom / prevZoom);
      this.zoom = newZoom;

      this.renderFullMap();
    }

    update(dt) {
      if (!this.game || !this.game.player) return;

      if (this.game.state === "MENU" || this.game.isGameOver) {
        if (this.minimapWidget && !this.minimapWidget.classList.contains("hidden")) {
          this.minimapWidget.classList.add("hidden");
        }
        return;
      } else {
        if (this.minimapWidget && this.minimapWidget.classList.contains("hidden")) {
          this.minimapWidget.classList.remove("hidden");
        }
      }

      const player = this.game.player;
      const activeMap = this.getActiveMap();
      const I18n = window.Killstreak.I18n;

      const px = Math.round(player.x);
      const py = Math.round(player.y);
      const coordsStr = `X: ${px} | Y: ${py}`;

      // Update real-time coordinates on minimap footer
      if (this.minimapCoordsText && this.minimapCoordsText.innerText !== coordsStr) {
        this.minimapCoordsText.innerText = coordsStr;
      }

      // Update full map coordinates pill if open
      if (this.fullMapCoordsText && this.isFullMapOpen() && this.fullMapCoordsText.innerText !== coordsStr) {
        this.fullMapCoordsText.innerText = coordsStr;
      }

      // Update map title
      if (activeMap) {
        const areaLabel = (I18n && activeMap.id)
          ? I18n.t(`maps.${activeMap.id}`, { defaultValue: activeMap.name })
          : activeMap.name;
        if (this.minimapTitleText && this.minimapTitleText.innerText !== areaLabel) {
          this.minimapTitleText.innerText = areaLabel;
        }
        if (this.fullMapHeading && this.isFullMapOpen()) {
          const fullTitle = "🗺️ " + areaLabel.toUpperCase();
          if (this.fullMapHeading.innerText !== fullTitle) {
            this.fullMapHeading.innerText = fullTitle;
          }
        }
      }

      // Render minimap every frame
      this.renderMinimap();

      // If full map modal is open, re-render to keep player blip synchronized
      if (this.isFullMapOpen()) {
        this.renderFullMap();
      }
    }

    // =========================================================================
    // MINIMAP DRAWING
    // =========================================================================
    renderMinimap() {
      if (!this.minimapCtx || !this.game || !this.game.player) return;

      const ctx = this.minimapCtx;
      const cw = this.minimapCanvas.width;
      const ch = this.minimapCanvas.height;
      const activeMap = this.getActiveMap();
      if (!activeMap) return;

      const mw = activeMap.width || 1;
      const mh = activeMap.height || 1;
      const scaleX = cw / mw;
      const scaleY = ch / mh;

      // 1. Background Fill
      ctx.clearRect(0, 0, cw, ch);
      ctx.fillStyle = activeMap.id === "LOBBY" ? "#0f172a" : "#0d1b13";
      ctx.fillRect(0, 0, cw, ch);

      // Subtle grid
      ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
      ctx.lineWidth = 1;
      for (let x = 0; x < cw; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, ch);
        ctx.stroke();
      }
      for (let y = 0; y < ch; y += 25) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(cw, y);
        ctx.stroke();
      }

      // 2. Map Landmarks (Lake, Village in Grassland)
      if (activeMap.lake) {
        const lx = activeMap.lake.x * scaleX;
        const ly = activeMap.lake.y * scaleY;
        const lw = activeMap.lake.width * scaleX;
        const lh = activeMap.lake.height * scaleY;
        ctx.fillStyle = "rgba(12, 74, 110, 0.7)";
        ctx.beginPath();
        ctx.ellipse(lx + lw / 2, ly + lh / 2, lw / 2, lh / 2, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      if (activeMap.id === "COMBAT") {
        // Village Zone Indicator
        ctx.fillStyle = "rgba(120, 53, 15, 0.4)";
        ctx.fillRect(8350 * scaleX, 4200 * scaleY, 1500 * scaleX, 1450 * scaleY);
      }

      // 3. Portals
      if (activeMap.portalToCombat) {
        const pt = activeMap.portalToCombat;
        ctx.fillStyle = "#ef4444";
        ctx.fillRect(pt.x * scaleX - 2, pt.y * scaleY - 2, 5, 5);
      }
      if (activeMap.portalToLobby) {
        const pt = activeMap.portalToLobby;
        ctx.fillStyle = "#38bdf8";
        ctx.fillRect(pt.x * scaleX - 2, pt.y * scaleY - 2, 5, 5);
      }

      // 4. NPC Zones
      if (activeMap.npcZones) {
        activeMap.npcZones.forEach(zone => {
          const zx = zone.x * scaleX;
          const zy = zone.y * scaleY;
          const zw = Math.max(3, zone.width * scaleX);
          const zh = Math.max(3, zone.height * scaleY);

          // Zone Area Box
          ctx.fillStyle = zone.accentColor || "rgba(239, 68, 68, 0.35)";
          ctx.fillRect(zx, zy, zw, zh);

          // Zone Center Icon Marker
          const cx = zx + zw / 2;
          const cy = zy + zh / 2;
          ctx.beginPath();
          ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = zone.tagColor || "#ffffff";
          ctx.fill();
        });
      }

      // 5. Camera Viewport Frustum Outline
      if (this.game.camera) {
        const camOff = this.game.camera.getOffset();
        const camW = this.game.viewport.width * scaleX;
        const camH = this.game.viewport.height * scaleY;
        const camX = camOff.x * scaleX;
        const camY = camOff.y * scaleY;

        ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
        ctx.lineWidth = 1;
        ctx.strokeRect(camX, camY, camW, camH);
      }

      // 6. Player Marker (Pulsing Cyan Dot + Direction Pointer)
      const player = this.game.player;
      const px = Math.max(3, Math.min(cw - 3, player.x * scaleX));
      const py = Math.max(3, Math.min(ch - 3, player.y * scaleY));

      const pulse = (Math.sin(Date.now() / 180) + 1) * 1.5;
      // Pulse ring
      ctx.beginPath();
      ctx.arc(px, py, 4 + pulse, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(56, 189, 248, 0.35)";
      ctx.fill();

      // Direction cone pointer
      if (typeof player.aimAngle === "number") {
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + Math.cos(player.aimAngle - 0.5) * 8, py + Math.sin(player.aimAngle - 0.5) * 8);
        ctx.lineTo(px + Math.cos(player.aimAngle + 0.5) * 8, py + Math.sin(player.aimAngle + 0.5) * 8);
        ctx.closePath();
        ctx.fillStyle = "rgba(56, 189, 248, 0.6)";
        ctx.fill();
      }

      // Solid Player Center
      ctx.beginPath();
      ctx.arc(px, py, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.strokeStyle = "#0284c7";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Outer border
      ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
      ctx.lineWidth = 1;
      ctx.strokeRect(0, 0, cw, ch);
    }

    // =========================================================================
    // FULL MAP DRAWING
    // =========================================================================
    renderFullMap() {
      if (!this.fullMapCtx || !this.game || !this.game.player) return;

      const ctx = this.fullMapCtx;
      const cw = this.fullMapCanvas.width;
      const ch = this.fullMapCanvas.height;
      const activeMap = this.getActiveMap();
      if (!activeMap) return;

      const mw = activeMap.width || 1000;
      const mh = activeMap.height || 650;
      const I18n = window.Killstreak.I18n;

      ctx.clearRect(0, 0, cw, ch);

      // Background outside map
      ctx.fillStyle = "#03060c";
      ctx.fillRect(0, 0, cw, ch);

      ctx.save();
      // Apply Pan & Zoom Transformation: everything inside is in WORLD COORDINATES!
      ctx.translate(this.panX, this.panY);
      ctx.scale(this.zoom, this.zoom);

      // 1. World Map Base Floor
      ctx.fillStyle = activeMap.id === "LOBBY" ? "#111827" : "#0d1f14";
      ctx.fillRect(0, 0, mw, mh);

      // Grid Lines (every 500 world units)
      ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
      ctx.lineWidth = 2;
      for (let x = 0; x <= mw; x += 500) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, mh);
        ctx.stroke();
      }
      for (let y = 0; y <= mh; y += 500) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(mw, y);
        ctx.stroke();
      }

      // 2. Landmarks
      if (activeMap.lake) {
        const lk = activeMap.lake;
        ctx.fillStyle = "rgba(14, 116, 144, 0.65)";
        ctx.strokeStyle = "#0891b2";
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.ellipse(lk.x + lk.width / 2, lk.y + lk.height / 2, lk.width / 2, lk.height / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.font = "bold 28px -apple-system, sans-serif";
        ctx.fillStyle = "rgba(224, 242, 254, 0.85)";
        ctx.textAlign = "center";
        ctx.fillText("CERULEAN LAKE", lk.x + lk.width / 2, lk.y + lk.height / 2 + 10);
      }

      if (activeMap.id === "COMBAT") {
        // Village Bounds
        ctx.fillStyle = "rgba(120, 53, 15, 0.3)";
        ctx.strokeStyle = "rgba(217, 119, 6, 0.5)";
        ctx.lineWidth = 4;
        ctx.strokeRect(8350, 4200, 1500, 1450);
        ctx.fillRect(8350, 4200, 1500, 1450);

        ctx.font = "bold 26px -apple-system, sans-serif";
        ctx.fillStyle = "rgba(251, 191, 36, 0.85)";
        ctx.textAlign = "center";
        ctx.fillText("SANCTUARY HAMLET", 8350 + 750, 4200 + 725);
      }

      // 3. Portals
      if (activeMap.portalToCombat) {
        const pt = activeMap.portalToCombat;
        ctx.fillStyle = "#ef4444";
        ctx.fillRect(pt.x, pt.y, pt.width || 40, pt.height || 100);
        ctx.font = "bold 20px -apple-system, sans-serif";
        ctx.fillStyle = "#fca5a5";
        ctx.textAlign = "center";
        ctx.fillText("PORTAL TO GRASSLAND", pt.x + 20, pt.y - 12);
      }

      if (activeMap.portalToLobby) {
        const pt = activeMap.portalToLobby;
        ctx.fillStyle = "#38bdf8";
        ctx.fillRect(pt.x, pt.y, pt.width || 36, pt.height || 200);
        ctx.font = "bold 24px -apple-system, sans-serif";
        ctx.fillStyle = "#93c5fd";
        ctx.textAlign = "center";
        ctx.fillText("PORTAL TO LOBBY", pt.x + 18, pt.y - 14);
      }

      // 4. All NPC Zones
      if (activeMap.npcZones) {
        activeMap.npcZones.forEach((zone) => {
          const isHovered = this.hoveredZone && this.hoveredZone.id === zone.id;

          // Zone Ground Tint
          ctx.fillStyle = isHovered
            ? (zone.tagColor || "rgba(255, 255, 255, 0.35)")
            : (zone.accentColor || "rgba(239, 68, 68, 0.4)");
          ctx.fillRect(zone.x, zone.y, zone.width, zone.height);

          // Dashed Zone Boundary
          ctx.strokeStyle = zone.tagColor || "#ef4444";
          ctx.lineWidth = isHovered ? 6 : 3;
          ctx.setLineDash([12, 8]);
          ctx.strokeRect(zone.x, zone.y, zone.width, zone.height);
          ctx.setLineDash([]);

          // Zone Center Icon & Label Badge
          const cx = zone.x + zone.width / 2;
          const cy = zone.y + zone.height / 2;
          const icon = NPC_ZONE_ICONS[zone.npcType] || "⚔️";

          // Icon Badge circle
          ctx.beginPath();
          ctx.arc(cx, cy - 10, 24, 0, Math.PI * 2);
          ctx.fillStyle = isHovered ? "rgba(15, 23, 42, 0.95)" : "rgba(15, 23, 42, 0.85)";
          ctx.fill();
          ctx.strokeStyle = zone.tagColor || "#ffffff";
          ctx.lineWidth = 3;
          ctx.stroke();

          // Emoji Icon
          ctx.font = "24px -apple-system, sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(icon, cx, cy - 8);

          // Zone Name Tag
          const zoneLabel = (I18n ? I18n.getZoneLabel(zone.id) : zone.label) || zone.label;
          ctx.font = "bold 20px -apple-system, sans-serif";
          ctx.fillStyle = isHovered ? "#ffffff" : (zone.tagColor || "#f1f5f9");
          ctx.textAlign = "center";
          ctx.fillText(zoneLabel, cx, cy + 32);

          // Coordinates Tag below name
          ctx.font = "bold 14px ui-monospace, SFMono-Regular, monospace";
          ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
          ctx.fillText(`X: ${Math.round(cx)} | Y: ${Math.round(cy)}`, cx, cy + 50);
        });
      }

      // 5. Camera Frustum Outline on World
      if (this.game.camera) {
        const camOff = this.game.camera.getOffset();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
        ctx.lineWidth = 4;
        ctx.strokeRect(camOff.x, camOff.y, this.game.viewport.width, this.game.viewport.height);
      }

      // 6. Player Position Marker
      const player = this.game.player;
      const px = player.x;
      const py = player.y;

      // Pulsing outer shockwave
      const pPulse = (Math.sin(Date.now() / 150) + 1) * 8;
      ctx.beginPath();
      ctx.arc(px, py, 26 + pPulse, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(56, 189, 248, 0.35)";
      ctx.fill();

      // Direction cone
      if (typeof player.aimAngle === "number") {
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + Math.cos(player.aimAngle - 0.45) * 50, py + Math.sin(player.aimAngle - 0.45) * 50);
        ctx.lineTo(px + Math.cos(player.aimAngle + 0.45) * 50, py + Math.sin(player.aimAngle + 0.45) * 50);
        ctx.closePath();
        ctx.fillStyle = "rgba(56, 189, 248, 0.55)";
        ctx.fill();
      }

      // Solid Player Blip
      ctx.beginPath();
      ctx.arc(px, py, 16, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.strokeStyle = "#0284c7";
      ctx.lineWidth = 4;
      ctx.stroke();

      // Player Label
      ctx.font = "bold 20px -apple-system, sans-serif";
      ctx.fillStyle = "#38bdf8";
      ctx.textAlign = "center";
      ctx.fillText(`YOU (X: ${Math.round(px)} | Y: ${Math.round(py)})`, px, py - 32);

      // Outer map boundary stroke
      ctx.strokeStyle = "#22c55e";
      ctx.lineWidth = 6;
      ctx.strokeRect(0, 0, mw, mh);

      ctx.restore();
    }

    // =========================================================================
    // HOVER TOOLTIP HANDLERS
    // =========================================================================

    /**
     * Converts a mouse event into canvas-space pixels for the given canvas.
     *
     * Phase 8 scales #game-container with a CSS transform, and
     * getBoundingClientRect() reports the VISUAL box — so subtracting only
     * rect.left yields screen pixels, while every hit test below works in canvas
     * pixels. Dividing by the rect's own size corrects for any scaling.
     *
     * At scale 1 both factors are exactly 1, so this is the identical arithmetic
     * that was inline here before.
     */
    /**
     * Converts a mouse event into bitmap-space pixels for the given canvas.
     *
     * Phase 8 scales #game-container with a CSS transform, so a canvas's VISIBLE
     * box shrinks while its bitmap stays the same size. getBoundingClientRect()
     * reports that visible box, so a raw `clientX - rect.left` is in scaled pixels
     * while every hit test below works in bitmap pixels; dividing by the transform
     * scale converts back.
     *
     * The divisor is the TRANSFORM scale (visible width / layout width), NOT
     * canvas.width / rect.width. Those are different here even with no transform:
     * #minimap-canvas is a 180px bitmap laid out at 184 CSS px, and #full-map-canvas
     * is 880 laid out at 890 — so canvas.width / rect.width would be 0.978 / 0.989
     * at rest, silently shifting zone hit-testing by ~2% from today's behaviour.
     * Dividing by the transform scale is exactly 1 when unscaled, so the existing
     * arithmetic is left bit-for-bit intact.
     *
     * A canvas inside a hidden ancestor reports a zero-sized rect, which also
     * collapses the scale to 0; the guard falls back to the plain screen offset,
     * which is what the original inline code produced in that case.
     */
    canvasPointFromEvent(canvas, e) {
      const rect = canvas.getBoundingClientRect();
      const layoutWidth = canvas.offsetWidth || rect.width;
      const scale = layoutWidth ? rect.width / layoutWidth : 1;
      const factor = scale > 0 ? scale : 1;
      return {
        x: (e.clientX - rect.left) / factor,
        y: (e.clientY - rect.top) / factor
      };
    }

    handleMinimapHover(e) {
      if (!this.minimapTooltip || !this.minimapCanvas) return;
      const { x: mx, y: my } = this.canvasPointFromEvent(this.minimapCanvas, e);

      const activeMap = this.getActiveMap();
      if (!activeMap || !activeMap.npcZones) {
        this.minimapTooltip.classList.add("hidden");
        return;
      }

      const scaleX = this.minimapCanvas.width / (activeMap.width || 1);
      const scaleY = this.minimapCanvas.height / (activeMap.height || 1);
      const worldX = mx / scaleX;
      const worldY = my / scaleY;

      const hitZone = this.findZoneAtWorldCoord(activeMap, worldX, worldY, 14 / scaleX);
      if (hitZone) {
        this.showTooltip(this.minimapTooltip, hitZone, mx, my);
      } else {
        this.minimapTooltip.classList.add("hidden");
      }
    }

    handleFullMapHover(e) {
      if (!this.fullMapTooltip || !this.fullMapCanvas) return;
      const { x: mx, y: my } = this.canvasPointFromEvent(this.fullMapCanvas, e);

      if (mx < 0 || mx > this.fullMapCanvas.width || my < 0 || my > this.fullMapCanvas.height) {
        this.fullMapTooltip.classList.add("hidden");
        this.hoveredZone = null;
        return;
      }

      const activeMap = this.getActiveMap();
      if (!activeMap || !activeMap.npcZones) {
        this.fullMapTooltip.classList.add("hidden");
        this.hoveredZone = null;
        return;
      }

      // Convert canvas coordinate to world coordinate
      const worldX = (mx - this.panX) / this.zoom;
      const worldY = (my - this.panY) / this.zoom;

      const hitZone = this.findZoneAtWorldCoord(activeMap, worldX, worldY, 35 / this.zoom);
      if (hitZone !== this.hoveredZone) {
        this.hoveredZone = hitZone;
        this.renderFullMap();
      }

      if (hitZone) {
        this.showTooltip(this.fullMapTooltip, hitZone, mx, my);
      } else {
        this.fullMapTooltip.classList.add("hidden");
      }
    }

    findZoneAtWorldCoord(activeMap, wx, wy, buffer = 0) {
      if (!activeMap || !activeMap.npcZones) return null;
      for (let i = activeMap.npcZones.length - 1; i >= 0; i--) {
        const z = activeMap.npcZones[i];
        if (
          wx >= z.x - buffer &&
          wx <= z.x + z.width + buffer &&
          wy >= z.y - buffer &&
          wy <= z.y + z.height + buffer
        ) {
          return z;
        }
      }
      return null;
    }

    showTooltip(tooltipEl, zone, screenX, screenY) {
      const I18n = window.Killstreak.I18n;
      const zoneLabel = (I18n ? I18n.getZoneLabel(zone.id) : zone.label) || zone.label;
      const icon = NPC_ZONE_ICONS[zone.npcType] || "⚔️";
      const cx = Math.round(zone.x + zone.width / 2);
      const cy = Math.round(zone.y + zone.height / 2);

      let unitLabel = "";
      if (I18n && zone.npcType) {
        // `normal` is the only npcType whose i18n key is not its own name — the
        // "Normal Sentry" NPC shares the Sentry unit label. WorldRenderer maps it
        // this way; asking for zones.unit_normal returned the key string itself,
        // because no such translation exists.
        const unitKey = `zones.unit_${zone.npcType === "normal" ? "sentry" : zone.npcType}`;
        unitLabel = I18n.t(unitKey, { defaultValue: zone.npcType });
      }

      // Phase 7: skeleton via innerHTML; icon, zone label, coords and unit go
      // through the DOM API (the label and unit are data/i18n strings).
      tooltipEl.innerHTML = `
        <div class="map-tooltip-title"><span></span> <span></span></div>
        <div class="map-tooltip-coords"></div>
      `;
      const tipSpans = tooltipEl.querySelectorAll(".map-tooltip-title span");
      tipSpans[0].textContent = icon;
      tipSpans[1].textContent = zoneLabel;
      tooltipEl.querySelector(".map-tooltip-coords").textContent = `X: ${cx} | Y: ${cy}`;
      if (unitLabel) {
        const unitEl = document.createElement("div");
        unitEl.className = "map-tooltip-detail";
        unitEl.textContent = unitLabel;
        tooltipEl.appendChild(unitEl);
      }

      tooltipEl.style.left = `${screenX}px`;
      tooltipEl.style.top = `${screenY}px`;
      tooltipEl.classList.remove("hidden");
    }
  }

  window.Killstreak.MapSystem = new MapSystem();
})(window);

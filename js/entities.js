/**
 * Entities & Systems: Camera, Player, NPC, SwordStand, Portal, Tree, Rock, Particle, FloatingText
 * Encapsulates grassland world rendering, stationary/hostile NPC AI, and Devourer phases.
 */

import { getSwordRenderer } from '../src/swords/SwordRegistry.js';

(function(window) {
  window.Killstreak = window.Killstreak || {};
  const Config = window.Killstreak.Config;

  /**
   * 2D Camera for scrolling wide maps
   */
  class Camera {
    constructor(viewportWidth, viewportHeight) {
      this.viewportWidth = viewportWidth;
      this.viewportHeight = viewportHeight;
      this.x = 0;
      this.y = 0;
      this.shakeIntensity = 0;
      this.shakeTimer = 0;
    }

    follow(targetX, targetY, mapWidth, mapHeight, dt) {
      const desiredX = targetX - this.viewportWidth / 2;
      const desiredY = targetY - this.viewportHeight / 2;
      const smoothFactor = 1 - Math.pow(0.001, dt);

      this.x += (desiredX - this.x) * smoothFactor;
      this.y += (desiredY - this.y) * smoothFactor;

      const maxX = Math.max(0, mapWidth - this.viewportWidth);
      const maxY = Math.max(0, mapHeight - this.viewportHeight);
      this.x = Math.max(0, Math.min(maxX, this.x));
      this.y = Math.max(0, Math.min(maxY, this.y));

      if (this.shakeTimer > 0) {
        this.shakeTimer -= dt;
      } else {
        this.shakeIntensity = 0;
      }
    }

    shake(intensity, duration = 0.2) {
      this.shakeIntensity = intensity;
      this.shakeTimer = duration;
    }

    getOffset() {
      let offsetX = this.x;
      let offsetY = this.y;
      if (this.shakeTimer > 0 && this.shakeIntensity > 0) {
        offsetX += (Math.random() - 0.5) * this.shakeIntensity;
        offsetY += (Math.random() - 0.5) * this.shakeIntensity;
      }
      return { x: offsetX, y: offsetY };
    }

    screenToWorld(screenX, screenY) {
      return { x: screenX + this.x, y: screenY + this.y };
    }
  }

  /**
   * Player Entity
   */
  class Player {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.radius = Config.GAME_CONFIG.player.radius;
      this.speed = Config.GAME_CONFIG.player.speed;
      this.swordId = "devourer";
      this.swordName = "Devourer";
      this.phase = Config.SWORD_PHASES[0];
      this.baseMaxHp = typeof this.phase.maxHp === "number" ? this.phase.maxHp : 100;
      this.baseDamage = typeof this.phase.damage === "number" ? this.phase.damage : 5;
      this.maxHp = this.baseMaxHp;
      this.damage = this.baseDamage;
      this.rawMaxHp = this.baseMaxHp;
      this.rawDamage = this.baseDamage;
      this.hp = this.maxHp;
      this.phaseKills = 0;

      this.angle = 0;
      this.isAttacking = false;
      this.attackProgress = 0;
      this.attackTimer = 0;
      this.cooldownTimer = 0;

      this.isSwordEquipped = true;
      this.hitEnemiesThisSwing = new Set();
      this.isEngulfActive = false;

      // Active Shield Mechanic (e.g. Fortitude skill)
      this.shield = 0;
      this.maxShield = 0;
      this.shieldDuration = 0;

      // Passive HP Regeneration (10% current HP per 1.0s, active only after 5s out of combat)
      this.regenTimer = 0;
      this.regenInterval = Config.GAME_CONFIG.player.regenInterval || 1.0;
      this.regenPercent = Config.GAME_CONFIG.player.regenPercent || 0.10;
      this.timeSinceCombat = 999;
      this.outOfCombatDelay = Config.GAME_CONFIG.player.outOfCombatDelay || 5.0;

      // Taking-Damage Visual Effect & Knockback
      this.hurtTimer = 0;
      this.hurtDuration = 0.25;
      this.knockbackX = 0;
      this.knockbackY = 0;
    }

    takeDamage(amount, attacker = null) {
      const prevTotalHealth = this.hp + (this.shield || 0);
      let remainingDmg = amount;
      if (this.ironWillActive || this.ironWillTimer > 0) {
        remainingDmg = Math.max(1, Math.round(remainingDmg * 0.54));
        // Reflective shrapnel damage back to attacker (15% enhanced)
        if (attacker && typeof attacker.takeDamage === "function" && !attacker.isDead && attacker.hp > 0) {
          const reflectDmg = Math.max(1, Math.round(this.damage * 0.40));
          const rAng = Math.atan2(attacker.y - this.y, attacker.x - this.x);
          attacker.takeDamage(reflectDmg, rAng, 180);
          const game = this.game || (window.Killstreak && (window.Killstreak.game || window.Killstreak.GameInstance));
          if (game && game.saveData && game.saveData.settings && game.saveData.settings.damageNumbers) {
            game.floatingTexts.push(
              new FloatingText(attacker.x, attacker.y - 14, `-${reflectDmg}`, "#94a3b8", 15)
            );
          }
          if (attacker.hp <= 0 && !attacker.isDead && game && typeof game.handleNpcDeath === "function") {
            game.handleNpcDeath(attacker);
          }
        }
      }
      if (this.shield > 0) {
        if (this.shield >= remainingDmg) {
          this.shield -= remainingDmg;
          remainingDmg = 0;
        } else {
          remainingDmg -= this.shield;
          this.shield = 0;
        }
      }
      this.hp = Math.max(0, this.hp - remainingDmg);
      this.timeSinceCombat = 0; // Reset out-of-combat timer
      this.regenTimer = 0;

      const damageDealt = prevTotalHealth - (this.hp + (this.shield || 0));
      if (damageDealt > 0) {
        // Taking-Damage Visual Effect: Red tint body & slight flickering
        this.hurtTimer = this.hurtDuration;

        // Super tiny knockback away from attacker
        if (attacker && typeof attacker.x === "number" && typeof attacker.y === "number") {
          const kbAngle = Math.atan2(this.y - attacker.y, this.x - attacker.x);
          this.knockbackX = (this.knockbackX || 0) + Math.cos(kbAngle) * 45;
          this.knockbackY = (this.knockbackY || 0) + Math.sin(kbAngle) * 45;
        }

        // Show damage taken every hit (can be toggled in settings)
        const gameInstance = this.game || (window.Killstreak && (window.Killstreak.game || window.Killstreak.GameInstance));
        if (gameInstance) {
          const showDmg = (!gameInstance.saveData || !gameInstance.saveData.settings || gameInstance.saveData.settings.damageTaken !== false);
          if (showDmg && gameInstance.floatingTexts) {
            const FloatingTextClass = (window.Killstreak && window.Killstreak.Entities && window.Killstreak.Entities.FloatingText) || FloatingText;
            if (FloatingTextClass) {
              gameInstance.floatingTexts.push(
                new FloatingTextClass(this.x + (Math.random() * 12 - 6), this.y - 18, `-${damageDealt}`, "#ef4444", 15)
              );
            }
          }
        }
      }
    }

    setPhase(phaseConfig, isPhaseUp = false) {
      this.phase = phaseConfig;
      this.baseMaxHp = typeof phaseConfig.maxHp === "number" ? phaseConfig.maxHp : 100;
      this.baseDamage = typeof phaseConfig.damage === "number" ? phaseConfig.damage : 5;
      this.maxHp = this.baseMaxHp;
      this.damage = this.baseDamage;
      this.rawMaxHp = this.baseMaxHp;
      this.rawDamage = this.baseDamage;
      this.phaseKills = 0;

      this.phaseSpeed = phaseConfig.speed || 20;
      const scale = (Config.GAME_CONFIG && Config.GAME_CONFIG.player && Config.GAME_CONFIG.player.speedScale) || 8;
      this.speed = this.phaseSpeed * scale;

      // Make player HP completely healed when phasing up
      if (isPhaseUp) {
        this.hp = this.maxHp;
      } else {
        this.hp = Math.min(this.hp, this.maxHp);
      }
    }

    applyKillstreakScaling(currentStreak) {
      if (!this.isSwordEquipped || !this.phase) return;

      // Use unified KILLSTREAK_SCALING, fall back to DEVOURER_SCALING for backward compat
      const scalingCfg = (Config && (Config.KILLSTREAK_SCALING || Config.DEVOURER_SCALING)) || {
        baseHpRate: 0.005,
        baseDamageRate: 0.003,
        halfScaleStreak: 100,
        minMultiplier: 0.05
      };

      const parseFn = (window.Killstreak && window.Killstreak.parseNumberInput) || (Config && Config.parseNumberInput);
      const streak = Math.max(0, typeof currentStreak === "number" ? currentStreak : (parseFn ? parseFn(currentStreak) : Number(currentStreak) || 0));
      const startStreak = typeof this.phase.killsRequired === "number" ? this.phase.killsRequired : 0;
      const prevMaxHp = this.maxHp;

      let rawHp = this.baseMaxHp;
      let rawDmg = this.baseDamage;

      // Closed-form diminishing-returns scaling using logarithmic growth
      // This is the integral of: baseRate * 1/(1 + s/H) ds from startStreak to streak
      // = baseRate * H * ln((streak + H) / (startStreak + H))
      // The result is the total log-growth factor, applied as exp(totalGrowth)
      const killsInPhase = Math.max(0, streak - startStreak);
      if (killsInPhase > 0) {
        const H = scalingCfg.halfScaleStreak || 100;
        const logFactor = Math.log((streak + H) / (startStreak + H));
        const hpGrowth = scalingCfg.baseHpRate * H * logFactor;
        const dmgGrowth = scalingCfg.baseDamageRate * H * logFactor;
        rawHp *= Math.exp(hpGrowth);
        rawDmg *= Math.exp(dmgGrowth);
      }

      this.rawMaxHp = rawHp;
      this.rawDamage = rawDmg;
      this.maxHp = Math.round(rawHp);
      this.damage = Math.round(rawDmg);
      this.phaseKills = killsInPhase;

      const hpGain = Math.max(0, this.maxHp - prevMaxHp);
      if (hpGain > 0) {
        this.hp = Math.min(this.maxHp, this.hp + hpGain);
      } else {
        this.hp = Math.min(this.hp, this.maxHp);
      }
    }

    applyKillScaling(kills = 1) {
      if (!this.isSwordEquipped) return;
      const streak = (this.phase ? (this.phase.killsRequired || 0) : 0) + (this.phaseKills || 0) + (kills || 1);
      this.applyKillstreakScaling(streak);
    }

    attack() {
      if (!this.isSwordEquipped) return false;
      if (this.cooldownTimer > 0 || this.isAttacking) return false;

      this.isAttacking = true;
      this.attackTimer = this.phase.swingDuration;
      this.attackProgress = 0;
      this.hitEnemiesThisSwing.clear();
      return true;
    }

    update(dt, input, map, worldMouse, npcs = []) {
      let dx = 0;
      let dy = 0;

      if (input.up) dy -= 1;
      if (input.down) dy += 1;
      if (input.left) dx -= 1;
      if (input.right) dx += 1;

      const isMoving = dx !== 0 || dy !== 0;

      if (dx !== 0 && dy !== 0) {
        const len = Math.hypot(dx, dy);
        dx /= len;
        dy /= len;
      }

      let nextX = this.x + dx * this.speed * dt;
      let nextY = this.y + dy * this.speed * dt;

      // Obstacle collision resolution (trees/rocks/pillars/barrels/well/plants/lamps)
      const circleObstacles = [
        ...(map.obstacles || []),
        ...(map.decorations || []),
        ...(map.trees || []),
        ...(map.rocks || []),
        ...(map.barrels || []),
        ...(map.well ? [map.well] : []),
        ...(map.plants || []),
        ...(map.lamps || [])
      ];

      for (let obs of circleObstacles) {
        const obsDist = Math.hypot(nextX - obs.x, nextY - obs.y);
        const minDist = this.radius + obs.radius;
        if (obsDist < minDist) {
          const pushAngle = Math.atan2(nextY - obs.y, nextX - obs.x);
          nextX = obs.x + Math.cos(pushAngle) * minDist;
          nextY = obs.y + Math.sin(pushAngle) * minDist;
        }
      }

      // Box Obstacles (houses, hay bales & lounge furniture)
      const boxObstacles = [
        ...(map.houses || []),
        ...(map.hayBales || []),
        ...(map.furniture || [])
      ];

      for (let box of boxObstacles) {
        const closestX = Math.max(box.x, Math.min(nextX, box.x + box.width));
        const closestY = Math.max(box.y, Math.min(nextY, box.y + box.height));
        const bDist = Math.hypot(nextX - closestX, nextY - closestY);
        if (bDist < this.radius) {
          const pushAngle = Math.atan2(nextY - closestY, nextX - closestX);
          const pushDist = Math.max(1, this.radius - bDist);
          nextX += Math.cos(pushAngle) * pushDist;
          nextY += Math.sin(pushAngle) * pushDist;
        }
      }

      // NPC collision & shoving resolution: allows the user to shove living NPCs!
      if (npcs && npcs.length > 0) {
        for (let npc of npcs) {
          if (npc.isDead || npc.hp <= 0) continue;
          const npcDist = Math.hypot(nextX - npc.x, nextY - npc.y);
          const minDist = this.radius + npc.radius;
          if (npcDist < minDist && npcDist > 0.0001) {
            const overlap = minDist - npcDist;
            const pushAngle = Math.atan2(nextY - npc.y, nextX - npc.x);
            const shoveRatio = typeof npc.getShoveRatio === "function" ? npc.getShoveRatio() : 0.70;

            // Displace the NPC forward (shoving the NPC ahead of player)
            npc.x -= Math.cos(pushAngle) * (overlap * shoveRatio);
            npc.y -= Math.sin(pushAngle) * (overlap * shoveRatio);

            // Shove momentum impulse when player is actively walking into the NPC
            if (isMoving) {
              npc.knockbackX += dx * this.speed * 0.20 * shoveRatio;
              npc.knockbackY += dy * this.speed * 0.20 * shoveRatio;
            }

            // Keep player from penetrating the NPC by absorbing the remainder
            nextX += Math.cos(pushAngle) * (overlap * (1 - shoveRatio));
            nextY += Math.sin(pushAngle) * (overlap * (1 - shoveRatio));

            // Hostile contact damage: Shoving or colliding with a hostile NPC deals damage to player!
            if (npc.isHostile && npc.attackCooldown <= 0 && this.hp > 0) {
              this.takeDamage(npc.damage, npc);
              npc.attackCooldown = npc.attackRate;
            }
          }
        }
      }

      // Apply player knockback impulse & decay
      if (Math.abs(this.knockbackX) > 0.01 || Math.abs(this.knockbackY) > 0.01) {
        nextX += this.knockbackX * dt;
        nextY += this.knockbackY * dt;
        this.knockbackX *= Math.pow(0.005, dt);
        this.knockbackY *= Math.pow(0.005, dt);
      } else {
        this.knockbackX = 0;
        this.knockbackY = 0;
      }

      if (this.hurtTimer > 0) {
        this.hurtTimer = Math.max(0, this.hurtTimer - dt);
      }

      this.x = Math.max(this.radius + 10, Math.min(map.width - this.radius - 10, nextX));
      this.y = Math.max(this.radius + 10, Math.min(map.height - this.radius - 10, nextY));

      this.angle = Math.atan2(worldMouse.y - this.y, worldMouse.x - this.x);

      if (this.isAttacking) {
        this.attackTimer -= dt;
        this.attackProgress = 1 - Math.max(0, this.attackTimer / this.phase.swingDuration);

        if (this.attackTimer <= 0) {
          this.isAttacking = false;
          this.cooldownTimer = this.phase.cooldown;
          this.hitEnemiesThisSwing.clear();
        }
      } else if (this.cooldownTimer > 0) {
        this.cooldownTimer -= dt;
      }

      this.timeSinceCombat += dt;

      // Base HP Regeneration: 10% of current HP per 1.0 second, only after 5 seconds out of combat
      if (this.hp > 0 && this.hp < this.maxHp && this.timeSinceCombat >= this.outOfCombatDelay) {
        this.regenTimer += dt;
        if (this.regenTimer >= this.regenInterval) {
          this.regenTimer -= this.regenInterval;
          // 10% of current HP (minimum 1 HP floor so low health can recover)
          const regenAmount = Math.max(1, this.hp * this.regenPercent);
          this.hp = Math.min(this.maxHp, this.hp + regenAmount);
        }
      }

      // Shield Duration Countdown
      if (this.shieldDuration > 0) {
        this.shieldDuration -= dt;
        if (this.shieldDuration <= 0) {
          this.shield = 0;
          this.shieldDuration = 0;
        }
      }

      // Iron Will Duration Countdown
      if (this.ironWillTimer > 0) {
        this.ironWillTimer -= dt;
        if (this.ironWillTimer <= 0) {
          this.ironWillTimer = 0;
          this.ironWillActive = false;
        }
      }

      this.animTimer = (this.animTimer || 0) + dt;
    }

    getSwordGeometry() {
      const halfArc = this.phase.arcAngle / 2;
      const currentOffset = this.isAttacking 
        ? -halfArc + (this.phase.arcAngle * this.attackProgress)
        : 0;

      const swingAngle = this.angle + currentOffset;
      const baseDist = this.radius * 0.8;
      const tipDist = baseDist + this.phase.bladeLength;

      return {
        baseX: this.x + Math.cos(swingAngle) * baseDist,
        baseY: this.y + Math.sin(swingAngle) * baseDist,
        tipX: this.x + Math.cos(swingAngle) * tipDist,
        tipY: this.y + Math.sin(swingAngle) * tipDist,
        angle: swingAngle,
        length: this.phase.bladeLength
      };
    }















    draw(ctx) {
      ctx.save();

      // Only draw blade if equipped
      if (this.isSwordEquipped) {
        const geom = this.getSwordGeometry();

        if (this.isAttacking) {
          const halfArc = this.phase.arcAngle / 2;
          const startSwing = this.angle - halfArc;
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(this.x, this.y);
          ctx.arc(this.x, this.y, this.radius + this.phase.bladeLength, startSwing, geom.angle, false);
          ctx.closePath();
          ctx.fillStyle = this.phase.trailColor;
          ctx.fill();

          // Phase 17 Devourer Extra Apocalyptic Slash Ring
          if (this.swordId === "devourer" && this.phase.phase === 17) {
            ctx.strokeStyle = "rgba(254, 240, 138, 0.75)";
            ctx.lineWidth = 3;
            ctx.stroke();
          }

          // Phase 7 Overdrive Extra Godspeed Slash Ring
          if (this.swordId === "overdrive" && this.phase.phase === 7) {
            ctx.strokeStyle = "rgba(255, 255, 255, 0.95)";
            ctx.lineWidth = 3.5;
            ctx.stroke();
            ctx.strokeStyle = "rgba(239, 68, 68, 0.85)";
            ctx.lineWidth = 1.8;
            ctx.stroke();
          }

          // Phase 11-13 Aquatic Extra Cataclysm / Omnitidal Slash Ring
          if (this.swordId === "aquatic" && this.phase.phase >= 11) {
            ctx.strokeStyle = this.phase.phase === 13 ? "rgba(255, 255, 255, 0.95)" : "rgba(6, 182, 212, 0.85)";
            ctx.lineWidth = this.phase.phase === 13 ? 4 : 2.5;
            ctx.stroke();
            if (this.phase.phase === 13) {
              ctx.strokeStyle = "rgba(6, 182, 212, 0.75)";
              ctx.lineWidth = 2;
              ctx.stroke();
            }
          }

          // Phase 10 Soil Extra Monolithic Fortress Slash Ring
          if (this.swordId === "soil" && this.phase.phase === 10) {
            ctx.strokeStyle = "rgba(245, 158, 11, 0.95)";
            ctx.lineWidth = 4;
            ctx.stroke();
            ctx.strokeStyle = "rgba(254, 240, 138, 0.8)";
            ctx.lineWidth = 2;
            ctx.stroke();
          }

          // Phase 10 Metallic Extra Eternal Steel Slash Ring
          if (this.swordId === "metallic" && this.phase.phase === 10) {
            ctx.strokeStyle = "rgba(248, 250, 252, 0.95)";
            ctx.lineWidth = 4;
            ctx.stroke();
            ctx.strokeStyle = "rgba(148, 163, 184, 0.8)";
            ctx.lineWidth = 2;
            ctx.stroke();
          }

          // Phase 10 Flora Extra Evergrowth Slash Ring
          if (this.swordId === "flora" && this.phase.phase === 10) {
            ctx.strokeStyle = "rgba(74, 222, 128, 0.95)";
            ctx.lineWidth = 4;
            ctx.stroke();
            ctx.strokeStyle = "rgba(34, 197, 94, 0.8)";
            ctx.lineWidth = 2;
            ctx.stroke();
          }

          // Phase 10 Hellfire Extra Infernal Cataclysm Slash Ring
          if (this.swordId === "hellfire" && this.phase.phase === 10) {
            ctx.strokeStyle = "rgba(239, 68, 68, 0.95)";
            ctx.lineWidth = 4.5;
            ctx.stroke();
            ctx.strokeStyle = "rgba(251, 191, 36, 0.85)";
            ctx.lineWidth = 2.2;
            ctx.stroke();
          }

          ctx.restore();
        }

        getSwordRenderer(this.swordId).drawBlade(ctx, geom, this);
      }

      // Draw Phase Aura - only when sword is equipped
      if (this.isSwordEquipped) {
        getSwordRenderer(this.swordId).drawAura(ctx, this);
      }

      // Active Fortitude Shield Barrier Effect
      if (this.shield > 0) {
        ctx.save();
        ctx.translate(this.x, this.y);
        const anim = this.animTimer || 0;
        const shieldPulse = 1 + Math.sin(anim * 6) * 0.05;
        const shieldR = (this.radius + 10) * shieldPulse;
        ctx.shadowColor = "#f59e0b";
        ctx.shadowBlur = 16;
        ctx.strokeStyle = "rgba(245, 158, 11, 0.9)";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, shieldR, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = "rgba(180, 83, 9, 0.22)";
        ctx.fill();

        // 6 orbiting shield plates / runes
        const sides = 6;
        ctx.rotate(anim * 2);
        ctx.beginPath();
        for (let i = 0; i < sides; i++) {
          const ang = (i * Math.PI * 2) / sides;
          const px = Math.cos(ang) * (shieldR + 3);
          const py = Math.sin(ang) * (shieldR + 3);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.strokeStyle = "rgba(253, 230, 138, 0.75)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
      }

      // Active Iron Will Metallic Barrier Effect
      if (this.ironWillActive || this.ironWillTimer > 0) {
        ctx.save();
        ctx.translate(this.x, this.y);
        const anim = this.animTimer || 0;
        const shieldPulse = 1 + Math.sin(anim * 8) * 0.04;
        const shieldR = (this.radius + 12) * shieldPulse;
        ctx.shadowColor = "#ffffff";
        ctx.shadowBlur = 18;
        ctx.strokeStyle = "rgba(248, 250, 252, 0.9)";
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        ctx.arc(0, 0, shieldR, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = "rgba(148, 163, 184, 0.22)";
        ctx.fill();

        // 8 orbiting hardened steel plates
        const sides = 8;
        ctx.rotate(anim * 2.5);
        ctx.beginPath();
        for (let i = 0; i < sides; i++) {
          const ang = (i * Math.PI * 2) / sides;
          const px = Math.cos(ang) * (shieldR + 2);
          const py = Math.sin(ang) * (shieldR + 2);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.strokeStyle = "rgba(203, 213, 225, 0.85)";
        ctx.lineWidth = 1.6;
        ctx.stroke();
        ctx.restore();
      }

      // Player Body
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);

      const isDevP17 = this.swordId === "devourer" && this.phase.phase === 17;
      const isOdP7 = this.swordId === "overdrive" && this.phase.phase === 7;
      const isAqP13 = this.swordId === "aquatic" && this.phase.phase === 13;
      const isAqP8 = this.swordId === "aquatic" && this.phase.phase === 8;
      const isSoilP10 = this.swordId === "soil" && this.phase.phase === 10;
      const isSoilP9 = this.swordId === "soil" && this.phase.phase === 9;
      const isSoil = this.swordId === "soil";
      const isMetP10 = this.swordId === "metallic" && this.phase.phase === 10;
      const isFloraP10 = this.swordId === "flora" && this.phase.phase === 10;
      const isHellP10 = this.swordId === "hellfire" && this.phase.phase === 10;
      const isMetallic = this.swordId === "metallic";
      const isFlora = this.swordId === "flora";
      const isHellfire = this.swordId === "hellfire";
      const isWindy = this.swordId === "windy";

      let shadowCol = "rgba(56, 189, 248, 0.4)";
      if (isDevP17) shadowCol = "rgba(250, 204, 21, 0.8)";
      else if (isOdP7) shadowCol = "rgba(239, 68, 68, 0.9)";
      else if (isAqP13 || isMetP10) shadowCol = "rgba(255, 255, 255, 0.95)";
      else if (isSoilP10) shadowCol = "rgba(245, 158, 11, 0.95)";
      else if (isFloraP10) shadowCol = "rgba(74, 222, 128, 0.95)";
      else if (isHellP10) shadowCol = "rgba(239, 68, 68, 0.95)";
      else if (isSoilP9 || isAqP8) shadowCol = "rgba(120, 113, 108, 0.3)";
      else if (isHellfire) shadowCol = "rgba(220, 38, 38, 0.45)";
      else if (isFlora) shadowCol = "rgba(34, 197, 94, 0.4)";
      else if (isMetallic) shadowCol = "rgba(148, 163, 184, 0.4)";
      else if (isSoil) shadowCol = "rgba(180, 83, 9, 0.4)";
      else if (isWindy) shadowCol = "rgba(34, 211, 238, 0.45)";

      ctx.shadowColor = shadowCol;
      ctx.shadowBlur = (isDevP17 || isOdP7 || isAqP13 || isSoilP10 || isMetP10 || isFloraP10 || isHellP10) ? 24 : 10;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);

      let playerFill = Config.GAME_CONFIG.player.color;
      if (isAqP8) playerFill = "#64748b";
      else if (isSoilP9) playerFill = "#57534e";
      else if (isSoilP10) playerFill = "#78350f";
      else if (isMetP10) playerFill = "#1e293b";
      else if (isFloraP10) playerFill = "#14532d";
      else if (isHellP10) playerFill = "#450a0a";
      else if (isHellfire) playerFill = "#18181b";
      else if (isFlora) playerFill = "#1c1917";
      else if (isMetallic) playerFill = "#0f172a";
      else if (isWindy) playerFill = "#0f172a";

      ctx.fillStyle = playerFill;
      ctx.fill();
      ctx.lineWidth = 2.5;

      let playerStroke = Config.GAME_CONFIG.player.outlineColor;
      if (isDevP17) playerStroke = "#facc15";
      else if (isOdP7) playerStroke = "#ef4444";
      else if (isAqP13) playerStroke = "#06b6d4";
      else if (isSoilP10) playerStroke = "#f59e0b";
      else if (isMetP10) playerStroke = "#ffffff";
      else if (isFloraP10) playerStroke = "#4ade80";
      else if (isHellP10) playerStroke = "#ef4444";
      else if (isSoilP9 || isAqP8) playerStroke = "#78716c";
      else if (isHellfire) playerStroke = "#dc2626";
      else if (isFlora) playerStroke = "#22c55e";
      else if (isMetallic) playerStroke = "#94a3b8";
      else if (isSoil) playerStroke = "#b45309";
      else if (isWindy) playerStroke = "#22d3ee";

      ctx.strokeStyle = playerStroke;
      ctx.stroke();

      // Eyes
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(6, -5, 3.5, 0, Math.PI * 2);
      ctx.arc(6, 5, 3.5, 0, Math.PI * 2);
      ctx.fill();

      let eyeColor = "#0f172a";
      if (isDevP17) eyeColor = "#7c3aed";
      else if (isOdP7) eyeColor = "#dc2626";
      else if (isAqP13) eyeColor = "#06b6d4";
      else if (isSoilP10) eyeColor = "#f59e0b";
      else if (isMetP10) eyeColor = "#cbd5e1";
      else if (isFloraP10) eyeColor = "#22c55e";
      else if (isHellP10) eyeColor = "#ef4444";
      else if (isAqP8 || isSoilP9) eyeColor = "#44403c";
      else if (isHellfire) eyeColor = "#ea580c";
      else if (isFlora) eyeColor = "#15803d";
      else if (isMetallic) eyeColor = "#64748b";
      else if (isSoil) eyeColor = "#92400e";
      else if (isWindy) eyeColor = "#06b6d4";

      ctx.fillStyle = eyeColor;
      ctx.beginPath();
      ctx.arc(7.5, -5, 1.8, 0, Math.PI * 2);
      ctx.arc(7.5, 5, 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Visual Hurt Effect: Red tint body & slight flickering
      if (this.hurtTimer > 0) {
        const isFlicker = (Math.floor(this.hurtTimer * 30) % 2 === 0);
        if (isFlicker) {
          ctx.globalAlpha = 0.72;
        }
        ctx.fillStyle = "rgba(239, 68, 68, 0.65)";
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowColor = "#ef4444";
        ctx.shadowBlur = 18;
      }

      ctx.restore();

      ctx.restore();
    }
  }

  /**
   * NPC Enemy (Normal Sentries, Fairies, Thugs, and Guards)
   * Strictly stationary until attacked. Only the attacked entity becomes hostile.
   */
  class NPC {
    constructor(x, y, zoneIndex = 0, type = "normal", slotIndex = 0) {
      this.x = x;
      this.y = y;
      this.spawnX = x;
      this.spawnY = y;
      this.zoneIndex = zoneIndex;
      this.type = type; // "normal", "fairy", "thug", "guard", "swordman", "buff_man", "elf", "ironborn", "bloodfang", "arcanist", "colossus", "starforged", "grizzlehorn", "brambleback", "embermane", "duskhorn", "mirewalker", "thunderhoof", "gloomscale", "wildtusk", "moonmane", "crimsonhide"
      this.slotIndex = slotIndex;

      let configObj = (window.Killstreak && window.Killstreak.Data && window.Killstreak.Data.NPCs && window.Killstreak.Data.NPCs[type])
        || (Config.GAME_CONFIG && Config.GAME_CONFIG[type])
        || (Config.GAME_CONFIG && Config.GAME_CONFIG.npc)
        || {};

      this.configObj = configObj;
      this.radius = configObj.radius || 16;
      this.speed = configObj.speed || 130;
      this.maxHp = configObj.maxHp || 40;
      this.hp = this.maxHp;
      this.damage = configObj.damage || 2;
      this.attackRate = configObj.attackRate || 0.75;
      this.attackRange = configObj.attackRange || this.radius;
      this.killsAwarded = typeof configObj.killsAwarded === "number" ? configObj.killsAwarded : 1;
      this.killstreakAwarded = typeof configObj.killstreakAwarded === "number" ? configObj.killstreakAwarded : (configObj.killsAwarded || 1);
      this.massScale = typeof configObj.massScale === "number" ? configObj.massScale : 1.0;
      this.shoveRatio = typeof configObj.shoveRatio === "number" ? configObj.shoveRatio : 0.70;
      this.barWidth = typeof configObj.barWidth === "number" ? configObj.barWidth : 28;
      this.barColor = configObj.barColor || null;

      // Aggro State: Neutral until attacked, wanders arbitrarily inside its zone
      this.isHostile = false;
      this.isDead = false;
      this.aimAngle = 0;

      this.hitFlashTimer = 0;
      this.attackCooldown = 0;
      this.knockbackX = 0;
      this.knockbackY = 0;
      this.wingTimer = Math.random() * Math.PI * 2;

      // Arbitrary zone wandering state
      this.wanderTargetX = this.x;
      this.wanderTargetY = this.y;
      this.wanderWaitTimer = 0.4 + Math.random() * 2.0; // Stagger initial movement
      this.wanderMoveTimer = 0;
      this.game = null;
    }

    takeDamage(amount, angle, force = 200) {
      this.hp -= amount;
      this.hitFlashTimer = 0.14;

      // Mass resistance to knockback based on unit type or modular config
      let massScale = typeof this.massScale === "number" ? this.massScale : 1.0;
      if (this.type === "fairy" && massScale === 1.0) massScale = 0.45;
      else if (this.type === "thug" && massScale === 1.0) massScale = 0.35;
      else if (this.type === "guard" && massScale === 1.0) massScale = 0.20;
      else if (this.type === "swordman" && massScale === 1.0) massScale = 0.25;
      else if (this.type === "buff_man" && massScale === 1.0) massScale = 0.15;
      else if (this.type === "elf" && massScale === 1.0) massScale = 0.30;

      const actualForce = force * massScale;
      this.knockbackX = Math.cos(angle) * actualForce;
      this.knockbackY = Math.sin(angle) * actualForce;

      // Only the attacked NPC becomes hostile and faces attacker!
      this.isHostile = true;
      this.aimAngle = angle + Math.PI;

      if (this.hp <= 0 && !this.isDead) {
        const game = this.game || (window.Killstreak && (window.Killstreak.game || window.Killstreak.GameInstance));
        if (game && typeof game.handleNpcDeath === "function") {
          game.handleNpcDeath(this);
        }
      }
    }

    getShoveRatio() {
      if (typeof this.shoveRatio === "number") return this.shoveRatio;
      if (this.type === "fairy") return 0.85;
      if (this.type === "normal") return 0.75;
      if (this.type === "elf") return 0.70;
      if (this.type === "thug") return 0.60;
      if (this.type === "swordman") return 0.55;
      if (this.type === "guard") return 0.45;
      if (this.type === "buff_man") return 0.35;
      return 0.70;
    }

    update(dt, player, allNpcs, map) {
      if (this.isDead) return;
      if (this.hp <= 0) {
        const game = this.game || (window.Killstreak && (window.Killstreak.game || window.Killstreak.GameInstance));
        if (game && typeof game.handleNpcDeath === "function") {
          game.handleNpcDeath(this);
        }
        return;
      }
      if (this.hitFlashTimer > 0) this.hitFlashTimer -= dt;
      if (this.attackCooldown > 0) this.attackCooldown -= dt;
      this.wingTimer += dt * (this.isHostile ? 16 : 8);

      // Apply knockback decay
      this.x += this.knockbackX * dt;
      this.y += this.knockbackY * dt;
      this.knockbackX *= Math.pow(0.04, dt);
      this.knockbackY *= Math.pow(0.04, dt);

      // Zone bounds setup (restrictive confinement to designated zone)
      const zone = (Config.MAPS && Config.MAPS.COMBAT && Config.MAPS.COMBAT.npcZones && Config.MAPS.COMBAT.npcZones[this.zoneIndex]);
      const pad = this.radius + 6;
      const minX = zone ? (zone.x + pad) : (this.radius + 15);
      const maxX = zone ? (zone.x + zone.width - pad) : (map.width - this.radius - 15);
      const minY = zone ? (zone.y + pad) : (this.radius + 15);
      const maxY = zone ? (zone.y + zone.height - pad) : (map.height - this.radius - 15);

      if (!this.isHostile) {
        // ARBITRARY WANDERING RESTRICTED TO ZONE
        this.wanderWaitTimer -= dt;
        if (this.wanderWaitTimer <= 0) {
          if (this.wanderMoveTimer <= 0) {
            // Pick a new random destination anywhere within the zone
            this.wanderTargetX = minX + Math.random() * (maxX - minX);
            this.wanderTargetY = minY + Math.random() * (maxY - minY);
            this.wanderMoveTimer = 1.8 + Math.random() * 2.5; // Walk for 1.8 - 4.3s
            this.wanderWaitTimer = this.wanderMoveTimer + 0.8 + Math.random() * 2.0; // Pause 0.8 - 2.8s
          }
        }

        if (this.rootTimer > 0) {
          this.rootTimer -= dt;
        } else if (this.wanderMoveTimer > 0) {
          this.wanderMoveTimer -= dt;
          const wdx = this.wanderTargetX - this.x;
          const wdy = this.wanderTargetY - this.y;
          const wdist = Math.hypot(wdx, wdy);

          if (wdist > 6) {
            let dirX = wdx / wdist;
            let dirY = wdy / wdist;
            this.aimAngle = Math.atan2(wdy, wdx);

            // Separation from other NPCs to avoid clumping
            for (let other of allNpcs) {
              if (other === this || other.isDead) continue;
              const sepDx = this.x - other.x;
              const sepDy = this.y - other.y;
              const sepDist = Math.hypot(sepDx, sepDy);
              const minSep = this.radius + other.radius + 6;
              if (sepDist > 0 && sepDist < minSep) {
                dirX += (sepDx / sepDist) * 0.45;
                dirY += (sepDy / sepDist) * 0.45;
              }
            }

            const mag = Math.hypot(dirX, dirY) || 1;
            const wSpeed = this.speed * 0.42;
            this.x += (dirX / mag) * wSpeed * dt;
            this.y += (dirY / mag) * wSpeed * dt;
          }
        }
      } else {
        if (this.rootTimer > 0) {
          this.rootTimer -= dt;
        } else {
          // HOSTILE RULE: Chases the player while staying strictly in zone
          const dx = player.x - this.x;
          const dy = player.y - this.y;
          const dist = Math.hypot(dx, dy);
          this.aimAngle = Math.atan2(dy, dx);

          if (dist > 1) {
            let dirX = dx / dist;
            let dirY = dy / dist;

            // Separation from other NPCs
            for (let other of allNpcs) {
              if (other === this || other.isDead) continue;
              const sepDx = this.x - other.x;
              const sepDy = this.y - other.y;
              const sepDist = Math.hypot(sepDx, sepDy);
              const minSep = this.radius + other.radius + 6;
              if (sepDist > 0 && sepDist < minSep) {
                dirX += (sepDx / sepDist) * 0.45;
                dirY += (sepDy / sepDist) * 0.45;
              }
            }

            const mag = Math.hypot(dirX, dirY) || 1;
            this.x += (dirX / mag) * this.speed * dt;
            this.y += (dirY / mag) * this.speed * dt;
          }
        }

        // Contact / weapon attack range (evaluated with reach buffer)
        const currentDist = Math.hypot(player.x - this.x, player.y - this.y);
        const attackReach = (this.attackRange || (this.radius + 14)) + player.radius;
        if (currentDist <= attackReach && this.attackCooldown <= 0 && player.hp > 0) {
          player.takeDamage(this.damage, this);
          this.attackCooldown = this.attackRate;
        }
      }

      // Player physical collision resolution (NPC cannot walk into or through player)
      if (player && player.hp > 0) {
        const pDist = Math.hypot(this.x - player.x, this.y - player.y);
        const minPDist = this.radius + player.radius;
        if (pDist < minPDist && pDist > 0.0001) {
          const pushAngle = Math.atan2(this.y - player.y, this.x - player.x);
          this.x = player.x + Math.cos(pushAngle) * minPDist;
          this.y = player.y + Math.sin(pushAngle) * minPDist;

          // Physical contact attack: If hostile, deals damage on contact!
          if (this.isHostile && this.attackCooldown <= 0) {
            player.takeDamage(this.damage, this);
            this.attackCooldown = this.attackRate;
          }
        }
      }

      // Avoid clipping into trees, rocks, barrels, well, and buildings
      const circleObstacles = [
        ...(map.trees || []),
        ...(map.rocks || []),
        ...(map.barrels || []),
        ...(map.well ? [map.well] : []),
        ...(map.obstacles || [])
      ];

      for (let obs of circleObstacles) {
        const obsDist = Math.hypot(this.x - obs.x, this.y - obs.y);
        const minDist = this.radius + obs.radius;
        if (obsDist < minDist) {
          const pushAngle = Math.atan2(this.y - obs.y, this.x - obs.x);
          this.x = obs.x + Math.cos(pushAngle) * minDist;
          this.y = obs.y + Math.sin(pushAngle) * minDist;
        }
      }

      const boxObstacles = [
        ...(map.houses || []),
        ...(map.hayBales || [])
      ];

      for (let box of boxObstacles) {
        const closestX = Math.max(box.x, Math.min(this.x, box.x + box.width));
        const closestY = Math.max(box.y, Math.min(this.y, box.y + box.height));
        const bDist = Math.hypot(this.x - closestX, this.y - closestY);
        if (bDist < this.radius) {
          const pushAngle = Math.atan2(this.y - closestY, this.x - closestX);
          const pushDist = Math.max(1, this.radius - bDist);
          this.x += Math.cos(pushAngle) * pushDist;
          this.y += Math.sin(pushAngle) * pushDist;
        }
      }

      // ZONE RESTRICTION: Neutral NPCs wander strictly within their assigned zone.
      // When attacked by the player (isHostile), NPCs are unleashed and allowed to move out of the zone!
      if (!this.isHostile && zone) {
        this.x = Math.max(minX, Math.min(maxX, this.x));
        this.y = Math.max(minY, Math.min(maxY, this.y));
      }

      // Keep within map boundaries as absolute safety net
      this.x = Math.max(this.radius + 15, Math.min(map.width - this.radius - 15, this.x));
      this.y = Math.max(this.radius + 15, Math.min(map.height - this.radius - 15, this.y));
    }

    draw(ctx) {
      if (this.isDead || this.hp <= 0) return;
      ctx.save();
      const isHit = this.hitFlashTimer > 0;

      // --- BLOODMOON AURA (dark-red malicious glow beneath the NPC body) ---
      const bmGame = window.Killstreak && (window.Killstreak.game || window.Killstreak.GameInstance);
      const bmActive = bmGame && bmGame.bloodmoon && bmGame.bloodmoon.isActive;
      if (bmActive && !this.isDead) {
        const auraTime = (Date.now() * 0.002) + (this.slotIndex || 0) * 0.8;
        const auraPulse = 0.7 + 0.3 * Math.sin(auraTime);
        const auraR = this.radius * (1.65 + 0.25 * auraPulse);
        ctx.save();
        const auraGrad = ctx.createRadialGradient(this.x, this.y, this.radius * 0.4, this.x, this.y, auraR);
        auraGrad.addColorStop(0, `rgba(180, 0, 0, ${0.45 * auraPulse})`);
        auraGrad.addColorStop(0.5, `rgba(120, 0, 0, ${0.30 * auraPulse})`);
        auraGrad.addColorStop(1, `rgba(60, 0, 0, 0)`);
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(this.x, this.y, auraR, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      if (this.type === "fairy") {
        // --- FAIRY MINI-BOSS RENDERING ---
        const wingFlap = Math.sin(this.wingTimer);

        // Translucent Fluttering Fairy Wings
        ctx.save();
        ctx.fillStyle = this.isHostile ? "rgba(244, 63, 94, 0.6)" : "rgba(56, 189, 248, 0.55)";
        ctx.strokeStyle = this.isHostile ? "rgba(255, 255, 255, 0.8)" : "rgba(224, 242, 254, 0.85)";
        ctx.lineWidth = 1.5;

        // Left Wing
        ctx.beginPath();
        ctx.ellipse(this.x - 14, this.y - 6 + wingFlap * 3, 14, 6 + Math.abs(wingFlap) * 3, -Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Right Wing
        ctx.beginPath();
        ctx.ellipse(this.x + 14, this.y - 6 + wingFlap * 3, 14, 6 + Math.abs(wingFlap) * 3, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // Fairy Core Body
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);

        if (isHit) {
          ctx.fillStyle = "#ffffff";
          ctx.strokeStyle = "#fbcfe8";
        } else if (this.isHostile) {
          ctx.fillStyle = "#f43f5e";
          ctx.strokeStyle = "#be123c";
          ctx.shadowColor = "rgba(244, 63, 94, 0.85)";
          ctx.shadowBlur = 18;
        } else {
          ctx.fillStyle = "#0284c7";
          ctx.strokeStyle = "#38bdf8";
          ctx.shadowColor = "rgba(56, 189, 248, 0.75)";
          ctx.shadowBlur = 14;
        }

        ctx.fill();
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Glowing Fae Tiara
        ctx.fillStyle = isHit ? "#f43f5e" : (this.isHostile ? "#fbbf24" : "#e0f2fe");
        ctx.beginPath();
        ctx.arc(this.x, this.y - 2, 4, 0, Math.PI * 2);
        ctx.fill();

      } else if (this.type === "guard") {
        // --- GUARD RENDERING (SHINING ARMOR) ---
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);

        if (isHit) {
          ctx.fillStyle = "#ffffff";
          ctx.strokeStyle = "#93c5fd";
        } else if (this.isHostile) {
          ctx.fillStyle = "#f1f5f9";
          ctx.strokeStyle = "#ef4444";
          ctx.shadowColor = "rgba(239, 68, 68, 0.8)";
          ctx.shadowBlur = 16;
        } else {
          // Shining polished silver plate armor
          ctx.fillStyle = "#e2e8f0";
          ctx.strokeStyle = "#94a3b8";
          ctx.shadowColor = "rgba(255, 255, 255, 0.85)";
          ctx.shadowBlur = 12;
        }

        ctx.fill();
        ctx.lineWidth = 3;
        ctx.stroke();

        // Polished Armor Crest / Visor
        ctx.fillStyle = this.isHostile ? "#dc2626" : "#facc15";
        ctx.beginPath();
        ctx.rect(this.x - 7, this.y - 4, 14, 4);
        ctx.fill();

        // Specular armor shine glint
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(this.x - 6, this.y - 7, 3, 0, Math.PI * 2);
        ctx.fill();

      } else if (this.type === "thug") {
        // --- THUG CAMP RAIDER RENDERING ---
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);

        if (isHit) {
          ctx.fillStyle = "#ffffff";
          ctx.strokeStyle = "#fef08a";
        } else if (this.isHostile) {
          ctx.fillStyle = "#991b1b";
          ctx.strokeStyle = "#450a0a";
          ctx.shadowColor = "rgba(239, 68, 68, 0.8)";
          ctx.shadowBlur = 14;
        } else {
          // Rough Leather Raider
          ctx.fillStyle = "#78350f";
          ctx.strokeStyle = "#451a03";
          ctx.shadowColor = "rgba(180, 83, 9, 0.6)";
          ctx.shadowBlur = 8;
        }

        ctx.fill();
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Outlaw Bandana
        ctx.fillStyle = "#dc2626";
        ctx.beginPath();
        ctx.arc(this.x, this.y - 3, this.radius - 2, Math.PI, Math.PI * 2);
        ctx.fill();

        // Menacing Eyes
        ctx.fillStyle = this.isHostile ? "#fef08a" : "#ffffff";
        ctx.beginPath();
        ctx.arc(this.x - 5, this.y + 2, 2.2, 0, Math.PI * 2);
        ctx.arc(this.x + 5, this.y + 2, 2.2, 0, Math.PI * 2);
        ctx.fill();

      } else if (this.type === "swordman") {
        // --- SWORDMAN RENDERING (BLUE TUNIC, CHAINMAIL, EXTENDED IRON SWORD) ---
        // Draw Iron Sword extending forward
        const aimAngle = this.isHostile ? (this.aimAngle || 0) : 0;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(aimAngle);
        ctx.fillStyle = isHit ? "#ffffff" : "#94a3b8";
        ctx.fillRect(this.radius - 2, -2, 22, 4); // 22px Iron Blade
        ctx.fillStyle = "#475569";
        ctx.fillRect(this.radius - 2, -5, 3, 10); // Crossguard
        ctx.restore();

        // Body
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        if (isHit) {
          ctx.fillStyle = "#ffffff";
          ctx.strokeStyle = "#93c5fd";
        } else if (this.isHostile) {
          ctx.fillStyle = "#1d4ed8";
          ctx.strokeStyle = "#ef4444";
          ctx.shadowColor = "rgba(239, 68, 68, 0.85)";
          ctx.shadowBlur = 15;
        } else {
          ctx.fillStyle = "#1e40af";
          ctx.strokeStyle = "#3b82f6";
          ctx.shadowColor = "rgba(37, 99, 235, 0.6)";
          ctx.shadowBlur = 8;
        }
        ctx.fill();
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Steel Helmet Visor
        ctx.fillStyle = "#e2e8f0";
        ctx.fillRect(this.x - 6, this.y - 4, 12, 3.5);

      } else if (this.type === "buff_man") {
        // --- BUFF MAN RENDERING (+15% SIZE, HEAVY MUSCULAR BRAWLER) ---
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        if (isHit) {
          ctx.fillStyle = "#ffffff";
          ctx.strokeStyle = "#fef08a";
        } else if (this.isHostile) {
          ctx.fillStyle = "#b45309";
          ctx.strokeStyle = "#7f1d1d";
          ctx.shadowColor = "rgba(239, 68, 68, 0.9)";
          ctx.shadowBlur = 18;
        } else {
          ctx.fillStyle = "#d97706";
          ctx.strokeStyle = "#92400e";
          ctx.shadowColor = "rgba(217, 119, 6, 0.7)";
          ctx.shadowBlur = 10;
        }
        ctx.fill();
        ctx.lineWidth = 3.5;
        ctx.stroke();

        // Spiked Shoulder Bands
        ctx.fillStyle = "#78350f";
        ctx.fillRect(this.x - this.radius, this.y - 4, 4, 8);
        ctx.fillRect(this.x + this.radius - 4, this.y - 4, 4, 8);

        // Battle Harness
        ctx.strokeStyle = this.isHostile ? "#fef08a" : "#451a03";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x - 6, this.y - 5);
        ctx.lineTo(this.x + 6, this.y + 5);
        ctx.moveTo(this.x + 6, this.y - 5);
        ctx.lineTo(this.x - 6, this.y + 5);
        ctx.stroke();

      } else if (this.type === "elf") {
        // --- ELF RENDERING (EMERALD TUNIC, GOLDEN HAIR, POINTED EARS, FAE SHINE) ---
        // Flowing Golden Hair
        ctx.fillStyle = "#fde047";
        ctx.beginPath();
        ctx.arc(this.x, this.y - 2, this.radius + 1, Math.PI * 0.9, Math.PI * 2.1);
        ctx.fill();

        // Pointed Elven Ears
        ctx.fillStyle = "#6ee7b7";
        ctx.beginPath();
        ctx.moveTo(this.x - this.radius + 1, this.y - 3);
        ctx.lineTo(this.x - this.radius - 6, this.y - 7);
        ctx.lineTo(this.x - this.radius + 2, this.y + 1);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(this.x + this.radius - 1, this.y - 3);
        ctx.lineTo(this.x + this.radius + 6, this.y - 7);
        ctx.lineTo(this.x + this.radius - 2, this.y + 1);
        ctx.closePath();
        ctx.fill();

        // Emerald Body
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        if (isHit) {
          ctx.fillStyle = "#ffffff";
          ctx.strokeStyle = "#a7f3d0";
        } else if (this.isHostile) {
          ctx.fillStyle = "#047857";
          ctx.strokeStyle = "#ef4444";
          ctx.shadowColor = "rgba(239, 68, 68, 0.85)";
          ctx.shadowBlur = 18;
        } else {
          ctx.fillStyle = "#059669";
          ctx.strokeStyle = "#34d399";
          ctx.shadowColor = "rgba(52, 211, 153, 0.8)";
          ctx.shadowBlur = 14;
        }
        ctx.fill();
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Radiant Brow Gem
        ctx.fillStyle = isHit ? "#ffffff" : (this.isHostile ? "#fbbf24" : "#a7f3d0");
        ctx.beginPath();
        ctx.arc(this.x, this.y - 4, 3, 0, Math.PI * 2);
        ctx.fill();

      } else if (this.type === "ironborn") {
        // --- IRONBORN RENDERING (CRUDE IRON PLATING, BATTLE-WORN) ---
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        if (isHit) {
          ctx.fillStyle = "#ffffff";
          ctx.strokeStyle = "#bdc3c7";
        } else if (this.isHostile) {
          ctx.fillStyle = "#5d6d7e";
          ctx.strokeStyle = "#ef4444";
          ctx.shadowColor = "rgba(239, 68, 68, 0.8)";
          ctx.shadowBlur = 14;
        } else {
          ctx.fillStyle = "#7f8c8d";
          ctx.strokeStyle = "#5d6d7e";
          ctx.shadowColor = "rgba(97, 106, 107, 0.5)";
          ctx.shadowBlur = 6;
        }
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.stroke();

        // Iron Pauldrons / Riveted Shoulderplates
        ctx.fillStyle = isHit ? "#ffffff" : "#4a5568";
        ctx.fillRect(this.x - this.radius - 2, this.y - 5, 5, 10); // Left plate
        ctx.fillRect(this.x + this.radius - 3, this.y - 5, 5, 10); // Right plate

        // Battle Scar Stripe
        ctx.strokeStyle = this.isHostile ? "#fbbf24" : "#95a5a6";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(this.x - 5, this.y - 3);
        ctx.lineTo(this.x + 3, this.y + 4);
        ctx.stroke();

      } else if (this.type === "bloodfang") {
        // --- BLOODFANG RENDERING (FERAL CRIMSON PREDATOR, FANGED) ---
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        if (isHit) {
          ctx.fillStyle = "#ffffff";
          ctx.strokeStyle = "#fca5a5";
        } else if (this.isHostile) {
          ctx.fillStyle = "#991b1b";
          ctx.strokeStyle = "#450a0a";
          ctx.shadowColor = "rgba(239, 68, 68, 0.95)";
          ctx.shadowBlur = 20;
        } else {
          ctx.fillStyle = "#c0392b";
          ctx.strokeStyle = "#7b241c";
          ctx.shadowColor = "rgba(192, 57, 43, 0.75)";
          ctx.shadowBlur = 10;
        }
        ctx.fill();
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Feral Fangs
        ctx.fillStyle = isHit ? "#ffffff" : "#fef9c3";
        ctx.beginPath();
        ctx.moveTo(this.x - 5, this.y + 3);
        ctx.lineTo(this.x - 3, this.y + this.radius - 1);
        ctx.lineTo(this.x - 1, this.y + 3);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(this.x + 1, this.y + 3);
        ctx.lineTo(this.x + 3, this.y + this.radius - 1);
        ctx.lineTo(this.x + 5, this.y + 3);
        ctx.closePath();
        ctx.fill();

        // Predator Eyes
        ctx.fillStyle = this.isHostile ? "#fef08a" : "#fca5a5";
        ctx.beginPath();
        ctx.arc(this.x - 5, this.y - 3, 2.5, 0, Math.PI * 2);
        ctx.arc(this.x + 5, this.y - 3, 2.5, 0, Math.PI * 2);
        ctx.fill();

      } else if (this.type === "arcanist") {
        // --- ARCANIST RENDERING (ARCANE MAGE, MYSTIC ROBE, CRACKLING ENERGY) ---
        // Arcane Aura Halo
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius + 5, 0, Math.PI * 2);
        ctx.fillStyle = isHit ? "rgba(255,255,255,0.15)" : (this.isHostile ? "rgba(239, 68, 68, 0.18)" : "rgba(142, 68, 173, 0.18)");
        ctx.fill();

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        if (isHit) {
          ctx.fillStyle = "#ffffff";
          ctx.strokeStyle = "#d7bde2";
        } else if (this.isHostile) {
          ctx.fillStyle = "#6c3483";
          ctx.strokeStyle = "#ef4444";
          ctx.shadowColor = "rgba(239, 68, 68, 0.9)";
          ctx.shadowBlur = 20;
        } else {
          ctx.fillStyle = "#8e44ad";
          ctx.strokeStyle = "#a569bd";
          ctx.shadowColor = "rgba(142, 68, 173, 0.85)";
          ctx.shadowBlur = 16;
        }
        ctx.fill();
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Arcane Staff Orb
        ctx.fillStyle = isHit ? "#ffffff" : (this.isHostile ? "#ef4444" : "#d2b4de");
        ctx.beginPath();
        ctx.arc(this.x, this.y - this.radius - 6, 4, 0, Math.PI * 2);
        ctx.fill();

        // Mystic Rune Eye
        ctx.fillStyle = isHit ? "#8e44ad" : (this.isHostile ? "#fbbf24" : "#f5eef8");
        ctx.beginPath();
        ctx.arc(this.x, this.y - 1, 3.5, 0, Math.PI * 2);
        ctx.fill();

      } else if (this.type === "colossus") {
        // --- COLOSSUS RENDERING (MASSIVE STONE GIANT, ANGULAR ROCK SILHOUETTE) ---
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        if (isHit) {
          ctx.fillStyle = "#ffffff";
          ctx.strokeStyle = "#b2bec3";
        } else if (this.isHostile) {
          ctx.fillStyle = "#3d4146";
          ctx.strokeStyle = "#ef4444";
          ctx.shadowColor = "rgba(239, 68, 68, 0.85)";
          ctx.shadowBlur = 18;
        } else {
          ctx.fillStyle = "#5d6470";
          ctx.strokeStyle = "#404347";
          ctx.shadowColor = "rgba(50, 50, 55, 0.6)";
          ctx.shadowBlur = 8;
        }
        ctx.fill();
        ctx.lineWidth = 4; // Heavier stroke = more mass
        ctx.stroke();

        // Stone Crack Lines
        ctx.strokeStyle = this.isHostile ? "rgba(239, 68, 68, 0.6)" : "rgba(40, 40, 40, 0.5)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(this.x - 7, this.y - this.radius + 4);
        ctx.lineTo(this.x, this.y);
        ctx.lineTo(this.x + 5, this.y + this.radius - 5);
        ctx.stroke();

        // Bouldered Shoulder Blocks
        ctx.fillStyle = isHit ? "#ffffff" : "#4a4e55";
        ctx.fillRect(this.x - this.radius - 3, this.y - 7, 7, 14);
        ctx.fillRect(this.x + this.radius - 4, this.y - 7, 7, 14);

      } else if (this.type === "starforged") {
        // --- STARFORGED RENDERING (STELLAR CELESTIAL CONSTRUCT, RADIANT AUREATE CORE) ---
        // Outer stellar pulse ring
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius + 7, 0, Math.PI * 2);
        ctx.fillStyle = isHit ? "rgba(255,255,255,0.12)" : (this.isHostile ? "rgba(239, 68, 68, 0.22)" : "rgba(243, 156, 18, 0.22)");
        ctx.fill();

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        if (isHit) {
          ctx.fillStyle = "#ffffff";
          ctx.strokeStyle = "#fef9c3";
        } else if (this.isHostile) {
          ctx.fillStyle = "#b7770a";
          ctx.strokeStyle = "#ef4444";
          ctx.shadowColor = "rgba(239, 68, 68, 1.0)";
          ctx.shadowBlur = 24;
        } else {
          ctx.fillStyle = "#e67e22";
          ctx.strokeStyle = "#f39c12";
          ctx.shadowColor = "rgba(243, 156, 18, 1.0)";
          ctx.shadowBlur = 20;
        }
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.stroke();

        // Stellar Core
        ctx.fillStyle = isHit ? "#ffffff" : (this.isHostile ? "#ef4444" : "#fef08a");
        ctx.beginPath();
        ctx.arc(this.x, this.y, 5, 0, Math.PI * 2);
        ctx.fill();

        // Orbiting Star Sparks (4 small arcs)
        const sparkAngle = (Date.now() / 500) % (Math.PI * 2);
        ctx.strokeStyle = isHit ? "#ffffff" : (this.isHostile ? "rgba(239,68,68,0.9)" : "rgba(241,196,15,0.9)");
        ctx.lineWidth = 1.5;
        for (let si = 0; si < 4; si++) {
          const sa = sparkAngle + si * (Math.PI / 2);
          const sx = this.x + Math.cos(sa) * (this.radius - 4);
          const sy = this.y + Math.sin(sa) * (this.radius - 4);
          ctx.beginPath();
          ctx.arc(sx, sy, 2, 0, Math.PI * 2);
          ctx.stroke();
        }

      } else if (this.type === "grizzlehorn") {
        // --- GRIZZLEHORN RENDERING (EARTH-ARMORED BEAST, SWEEPING FORWARD BRONZE HORNS) ---
        // Earth tremor pulse ring
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius + 6, 0, Math.PI * 2);
        ctx.fillStyle = isHit ? "rgba(255,255,255,0.12)" : (this.isHostile ? "rgba(239, 68, 68, 0.20)" : "rgba(217, 119, 6, 0.18)");
        ctx.fill();

        // Main Body Plate
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        if (isHit) {
          ctx.fillStyle = "#ffffff";
          ctx.strokeStyle = "#fef3c7";
        } else if (this.isHostile) {
          ctx.fillStyle = "#5c2b0e";
          ctx.strokeStyle = "#ef4444";
          ctx.shadowColor = "rgba(239, 68, 68, 1.0)";
          ctx.shadowBlur = 22;
        } else {
          ctx.fillStyle = "#453229";
          ctx.strokeStyle = "#b45309";
          ctx.shadowColor = "rgba(217, 119, 6, 0.85)";
          ctx.shadowBlur = 16;
        }
        ctx.fill();
        ctx.lineWidth = 3.5;
        ctx.stroke();

        // Directional features (horns, brow plate, eyes)
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.aimAngle);

        // Heavy sweeping bronze horns
        const ghHornColor = isHit ? "#ffffff" : (this.isHostile ? "#ef4444" : "#d97706");
        const ghHornTip = isHit ? "#ffffff" : (this.isHostile ? "#f87171" : "#fef3c7");
        ctx.fillStyle = ghHornColor;
        ctx.strokeStyle = ghHornTip;
        ctx.lineWidth = 1.5;

        // Top / Left horn
        ctx.beginPath();
        ctx.moveTo(4, -this.radius + 4);
        ctx.quadraticCurveTo(this.radius + 12, -this.radius - 8, this.radius + 16, -this.radius + 4);
        ctx.quadraticCurveTo(this.radius + 4, -this.radius + 1, 2, -this.radius + 10);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Bottom / Right horn
        ctx.beginPath();
        ctx.moveTo(4, this.radius - 4);
        ctx.quadraticCurveTo(this.radius + 12, this.radius + 8, this.radius + 16, this.radius - 4);
        ctx.quadraticCurveTo(this.radius + 4, this.radius - 1, 2, this.radius - 10);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Brow Ridge Heavy Armor Plate
        ctx.fillStyle = isHit ? "#ffffff" : "#2d1f18";
        ctx.fillRect(-2, -7, 11, 14);

        // Glowing Amber Beast Eyes
        ctx.fillStyle = isHit ? "#ffffff" : (this.isHostile ? "#ef4444" : "#fbbf24");
        ctx.beginPath();
        ctx.arc(6, -4, 2.5, 0, Math.PI * 2);
        ctx.arc(6, 4, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

      } else if (this.type === "brambleback") {
        // --- BRAMBLEBACK RENDERING (THORNY PRIMAL CARAPACE, RADIAL BRIAR SPINES) ---
        // Radial Sharp Briar Spikes
        const spineCount = 8;
        const spineColor = isHit ? "#ffffff" : (this.isHostile ? "#dc2626" : "#2d6a4f");
        const spineTip = isHit ? "#ffffff" : (this.isHostile ? "#ef4444" : "#84cc16");
        ctx.fillStyle = spineColor;
        ctx.strokeStyle = spineTip;
        ctx.lineWidth = 1.5;
        for (let i = 0; i < spineCount; i++) {
          const sAngle = (i * Math.PI * 2) / spineCount + (this.aimAngle || 0);
          const bx = this.x + Math.cos(sAngle) * (this.radius - 3);
          const by = this.y + Math.sin(sAngle) * (this.radius - 3);
          const tx = this.x + Math.cos(sAngle) * (this.radius + 9);
          const ty = this.y + Math.sin(sAngle) * (this.radius + 9);
          const perpX = Math.cos(sAngle + Math.PI / 2) * 4;
          const perpY = Math.sin(sAngle + Math.PI / 2) * 4;

          ctx.beginPath();
          ctx.moveTo(bx - perpX, by - perpY);
          ctx.lineTo(tx, ty);
          ctx.lineTo(bx + perpX, by + perpY);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }

        // Main Bark Shell
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        if (isHit) {
          ctx.fillStyle = "#ffffff";
          ctx.strokeStyle = "#dcfce7";
        } else if (this.isHostile) {
          ctx.fillStyle = "#14532d";
          ctx.strokeStyle = "#ef4444";
          ctx.shadowColor = "rgba(239, 68, 68, 1.0)";
          ctx.shadowBlur = 20;
        } else {
          ctx.fillStyle = "#1b4332";
          ctx.strokeStyle = "#4ade80";
          ctx.shadowColor = "rgba(132, 204, 22, 0.85)";
          ctx.shadowBlur = 16;
        }
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.stroke();

        // Pulsing Toxic Briar Core
        const corePulse = 3.5 + Math.sin(Date.now() / 250) * 1.5;
        ctx.fillStyle = isHit ? "#ffffff" : (this.isHostile ? "#ef4444" : "#84cc16");
        ctx.beginPath();
        ctx.arc(this.x, this.y, corePulse, 0, Math.PI * 2);
        ctx.fill();

        // Directional Briar Eyes
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.aimAngle);
        ctx.fillStyle = isHit ? "#ffffff" : (this.isHostile ? "#ef4444" : "#bef264");
        ctx.beginPath();
        ctx.arc(7, -5, 2, 0, Math.PI * 2);
        ctx.arc(7, 5, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

      } else if (this.type === "embermane") {
        // --- EMBERMANE RENDERING (VOLCANIC CHIMERA, DYNAMIC FLICKERING FLAME MANE) ---
        // Radiating Molten Aura
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius + 8, 0, Math.PI * 2);
        ctx.fillStyle = isHit ? "rgba(255,255,255,0.15)" : (this.isHostile ? "rgba(239, 68, 68, 0.25)" : "rgba(234, 88, 12, 0.25)");
        ctx.fill();

        // Flickering Flame Tendrils
        const flameCount = 10;
        const nowMs = Date.now();
        for (let i = 0; i < flameCount; i++) {
          const fAngle = (i * Math.PI * 2) / flameCount;
          const osc = Math.sin(nowMs / 110 + i * 0.9) * 4;
          const flameDist = this.radius + 6 + osc;
          const fx = this.x + Math.cos(fAngle) * flameDist;
          const fy = this.y + Math.sin(fAngle) * flameDist;
          ctx.beginPath();
          ctx.arc(fx, fy, 3.5, 0, Math.PI * 2);
          ctx.fillStyle = isHit ? "#ffffff" : (i % 2 === 0 ? "#f97316" : "#fef08a");
          ctx.fill();
        }

        // Basalt Core Body
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        if (isHit) {
          ctx.fillStyle = "#ffffff";
          ctx.strokeStyle = "#fed7aa";
        } else if (this.isHostile) {
          ctx.fillStyle = "#7c2d12";
          ctx.strokeStyle = "#ef4444";
          ctx.shadowColor = "rgba(239, 68, 68, 1.0)";
          ctx.shadowBlur = 24;
        } else {
          ctx.fillStyle = "#9a3412";
          ctx.strokeStyle = "#ea580c";
          ctx.shadowColor = "rgba(234, 88, 12, 1.0)";
          ctx.shadowBlur = 20;
        }
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.stroke();

        // Directional Molten Fissures & Feline Fire Eyes
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.aimAngle);

        ctx.strokeStyle = isHit ? "#ffffff" : "#fef08a";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(-this.radius + 4, 0);
        ctx.lineTo(2, 0);
        ctx.stroke();

        ctx.fillStyle = isHit ? "#ffffff" : (this.isHostile ? "#ef4444" : "#fef08a");
        ctx.beginPath();
        ctx.ellipse(8, -5, 3.5, 1.8, Math.PI / 8, 0, Math.PI * 2);
        ctx.ellipse(8, 5, 3.5, 1.8, -Math.PI / 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

      } else if (this.type === "duskhorn") {
        // --- DUSKHORN RENDERING (TWILIGHT SHADOW PREDATOR, OBSIDIAN CRYSTAL HORNS) ---
        // Twilight Void Nebula Ring
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius + 7, 0, Math.PI * 2);
        ctx.fillStyle = isHit ? "rgba(255,255,255,0.12)" : (this.isHostile ? "rgba(239, 68, 68, 0.22)" : "rgba(168, 85, 247, 0.25)");
        ctx.fill();

        // Main Void Shell
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        if (isHit) {
          ctx.fillStyle = "#ffffff";
          ctx.strokeStyle = "#f3e8ff";
        } else if (this.isHostile) {
          ctx.fillStyle = "#2e1065";
          ctx.strokeStyle = "#ef4444";
          ctx.shadowColor = "rgba(239, 68, 68, 1.0)";
          ctx.shadowBlur = 22;
        } else {
          ctx.fillStyle = "#1e1b4b";
          ctx.strokeStyle = "#a855f7";
          ctx.shadowColor = "rgba(168, 85, 247, 0.95)";
          ctx.shadowBlur = 18;
        }
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.stroke();

        // Directional Swept-Back Obsidian Horns & Twilight Eyes
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.aimAngle);

        const dhHornBaseColor = isHit ? "#ffffff" : "#0f0e17";
        const dhHornCrystColor = isHit ? "#ffffff" : (this.isHostile ? "#ef4444" : "#c084fc");

        // Upper swept crystal horn
        ctx.fillStyle = dhHornBaseColor;
        ctx.strokeStyle = dhHornCrystColor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(2, -this.radius + 3);
        ctx.lineTo(-this.radius - 8, -this.radius - 4);
        ctx.lineTo(-this.radius + 4, -this.radius + 8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Lower swept crystal horn
        ctx.beginPath();
        ctx.moveTo(2, this.radius - 3);
        ctx.lineTo(-this.radius - 8, this.radius + 4);
        ctx.lineTo(-this.radius + 4, this.radius - 8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Twilight Crescent Rune on Brow
        ctx.fillStyle = dhHornCrystColor;
        ctx.beginPath();
        ctx.arc(4, 0, 4, -Math.PI / 2, Math.PI / 2);
        ctx.fill();

        // Amethyst Glowing Slit Eyes
        ctx.fillStyle = isHit ? "#ffffff" : (this.isHostile ? "#ef4444" : "#e9d5ff");
        ctx.beginPath();
        ctx.arc(8, -4, 2.2, 0, Math.PI * 2);
        ctx.arc(8, 4, 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

      } else if (this.type === "mirewalker") {
        // --- MIREWALKER RENDERING (ABYSSAL BOG HORROR, ROTATING SPORES, CYCLOPEAN EYE) ---
        // Orbiting Toxic Spores
        const mwSporeTime = Date.now() / 700;
        const mwSporeColor = isHit ? "#ffffff" : (this.isHostile ? "rgba(239, 68, 68, 0.9)" : "rgba(45, 212, 191, 0.9)");
        for (let s = 0; s < 3; s++) {
          const sTheta = mwSporeTime + (s * Math.PI * 2) / 3;
          const sx = this.x + Math.cos(sTheta) * (this.radius + 8);
          const sy = this.y + Math.sin(sTheta) * (this.radius + 8);
          ctx.fillStyle = mwSporeColor;
          ctx.beginPath();
          ctx.arc(sx, sy, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Mossy Bog Carapace
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        if (isHit) {
          ctx.fillStyle = "#ffffff";
          ctx.strokeStyle = "#ccfbf1";
        } else if (this.isHostile) {
          ctx.fillStyle = "#042f2e";
          ctx.strokeStyle = "#ef4444";
          ctx.shadowColor = "rgba(239, 68, 68, 1.0)";
          ctx.shadowBlur = 22;
        } else {
          ctx.fillStyle = "#134e4a";
          ctx.strokeStyle = "#2dd4bf";
          ctx.shadowColor = "rgba(45, 212, 191, 0.85)";
          ctx.shadowBlur = 18;
        }
        ctx.fill();
        ctx.lineWidth = 3.5;
        ctx.stroke();

        // Directional Cyclopean Sunken Eye & Sludge Crust
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.aimAngle);

        // Sunken Eye Socket
        ctx.fillStyle = isHit ? "#ffffff" : "#041f1e";
        ctx.beginPath();
        ctx.arc(5, 0, 6, 0, Math.PI * 2);
        ctx.fill();

        // Glowing Bioluminescent Iris
        ctx.fillStyle = isHit ? "#ffffff" : (this.isHostile ? "#ef4444" : "#5eead4");
        ctx.beginPath();
        ctx.arc(6, 0, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Sludge Crust Marks
        ctx.strokeStyle = isHit ? "#ffffff" : "#0d9488";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-this.radius + 6, -6);
        ctx.lineTo(-2, -8);
        ctx.moveTo(-this.radius + 6, 6);
        ctx.lineTo(-2, 8);
        ctx.stroke();
        ctx.restore();

      } else if (this.type === "thunderhoof") {
        // --- THUNDERHOOF RENDERING (STORM-FORGED BEHEMOTH, LIGHTNING ARCS, TWIN PRONGS) ---
        // Branching Electric Lightning Arcs
        const thNowMs = Date.now();
        const thFlashPhase = Math.floor(thNowMs / 80) % 4;
        const thLightningColor = isHit ? "#ffffff" : (this.isHostile ? "rgba(239, 68, 68, 0.9)" : "rgba(103, 232, 249, 0.95)");
        ctx.strokeStyle = thLightningColor;
        ctx.lineWidth = 2;
        for (let l = 0; l < 4; l++) {
          const lAngle = (l * Math.PI) / 2 + (thFlashPhase * 0.4);
          const p0x = this.x + Math.cos(lAngle) * (this.radius - 2);
          const p0y = this.y + Math.sin(lAngle) * (this.radius - 2);
          const p1x = this.x + Math.cos(lAngle + 0.15) * (this.radius + 7);
          const p1y = this.y + Math.sin(lAngle + 0.15) * (this.radius + 7);
          const p2x = this.x + Math.cos(lAngle - 0.1) * (this.radius + 12);
          const p2y = this.y + Math.sin(lAngle - 0.1) * (this.radius + 12);
          ctx.beginPath();
          ctx.moveTo(p0x, p0y);
          ctx.lineTo(p1x, p1y);
          ctx.lineTo(p2x, p2y);
          ctx.stroke();
        }

        // Heavy Cobalt Plate Body
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        if (isHit) {
          ctx.fillStyle = "#ffffff";
          ctx.strokeStyle = "#e0f2fe";
        } else if (this.isHostile) {
          ctx.fillStyle = "#1e293b";
          ctx.strokeStyle = "#ef4444";
          ctx.shadowColor = "rgba(239, 68, 68, 1.0)";
          ctx.shadowBlur = 24;
        } else {
          ctx.fillStyle = "#1e3a8a";
          ctx.strokeStyle = "#38bdf8";
          ctx.shadowColor = "rgba(56, 189, 248, 0.95)";
          ctx.shadowBlur = 20;
        }
        ctx.fill();
        ctx.lineWidth = 3.5;
        ctx.stroke();

        // Directional Conductive Horn Prongs & Thunder Core
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.aimAngle);

        const thProngColor = isHit ? "#ffffff" : (this.isHostile ? "#ef4444" : "#7dd3fc");
        ctx.fillStyle = thProngColor;
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1;

        // Front top prong
        ctx.beginPath();
        ctx.moveTo(this.radius - 4, -8);
        ctx.lineTo(this.radius + 11, -12);
        ctx.lineTo(this.radius + 4, -4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Front bottom prong
        ctx.beginPath();
        ctx.moveTo(this.radius - 4, 8);
        ctx.lineTo(this.radius + 11, 12);
        ctx.lineTo(this.radius + 4, 4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Thunder Rune Core
        ctx.fillStyle = isHit ? "#ffffff" : (this.isHostile ? "#ef4444" : "#bae6fd");
        ctx.beginPath();
        ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
        ctx.fill();

        // Blue Visor Slits
        ctx.fillStyle = isHit ? "#ffffff" : (this.isHostile ? "#ef4444" : "#67e8f9");
        ctx.fillRect(7, -5, 3, 3);
        ctx.fillRect(7, 2, 3, 3);
        ctx.restore();

      } else if (this.type === "gloomscale") {
        // --- GLOOMSCALE RENDERING (VOID DRAGON SERPENT, SHIMMERING SCALE PLATES) ---
        // Dark Abyssal Void Vignette
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius + 7, 0, Math.PI * 2);
        ctx.fillStyle = isHit ? "rgba(255,255,255,0.12)" : (this.isHostile ? "rgba(239, 68, 68, 0.24)" : "rgba(236, 72, 153, 0.22)");
        ctx.fill();

        // Main Void Dragon Shell
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        if (isHit) {
          ctx.fillStyle = "#ffffff";
          ctx.strokeStyle = "#fce7f3";
        } else if (this.isHostile) {
          ctx.fillStyle = "#18181b";
          ctx.strokeStyle = "#ef4444";
          ctx.shadowColor = "rgba(239, 68, 68, 1.0)";
          ctx.shadowBlur = 24;
        } else {
          ctx.fillStyle = "#0f172a";
          ctx.strokeStyle = "#ec4899";
          ctx.shadowColor = "rgba(236, 72, 153, 0.95)";
          ctx.shadowBlur = 20;
        }
        ctx.fill();
        ctx.lineWidth = 3.5;
        ctx.stroke();

        // Directional Overlapping Scale Chevrons & Serpentine Slit Eyes
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.aimAngle);

        const gsScaleColor = isHit ? "#ffffff" : (this.isHostile ? "#ef4444" : "#db2777");
        ctx.strokeStyle = gsScaleColor;
        ctx.lineWidth = 2;

        // 3 Layered Scale Ridges
        for (let sc = -1; sc <= 1; sc++) {
          const scX = sc * 7 - 2;
          ctx.beginPath();
          ctx.moveTo(scX - 4, -9);
          ctx.lineTo(scX + 3, 0);
          ctx.lineTo(scX - 4, 9);
          ctx.stroke();
        }

        // Serpentine Glowing Vertical Slit Eyes
        ctx.fillStyle = isHit ? "#ffffff" : (this.isHostile ? "#ef4444" : "#f472b6");
        ctx.beginPath();
        ctx.ellipse(8, -5, 4, 1.5, Math.PI / 2, 0, Math.PI * 2);
        ctx.ellipse(8, 5, 4, 1.5, Math.PI / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

      } else if (this.type === "wildtusk") {
        // --- WILDTUSK RENDERING (PREHISTORIC DREAD-BOAR, MASSIVE WAR TUSKS) ---
        // Earth aura
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius + 6, 0, Math.PI * 2);
        ctx.fillStyle = isHit ? "rgba(255,255,255,0.12)" : (this.isHostile ? "rgba(239, 68, 68, 0.22)" : "rgba(217, 119, 6, 0.20)");
        ctx.fill();

        // Main Heavy Boar Body
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        if (isHit) {
          ctx.fillStyle = "#ffffff";
          ctx.strokeStyle = "#fef3c7";
        } else if (this.isHostile) {
          ctx.fillStyle = "#451a03";
          ctx.strokeStyle = "#ef4444";
          ctx.shadowColor = "rgba(239, 68, 68, 1.0)";
          ctx.shadowBlur = 24;
        } else {
          ctx.fillStyle = "#78350f";
          ctx.strokeStyle = "#f59e0b";
          ctx.shadowColor = "rgba(245, 158, 11, 0.95)";
          ctx.shadowBlur = 20;
        }
        ctx.fill();
        ctx.lineWidth = 3.5;
        ctx.stroke();

        // Directional Massive War Tusks & Snout
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.aimAngle);

        const wtTuskColor = isHit ? "#ffffff" : "#fef3c7";
        const wtTuskStroke = isHit ? "#ffffff" : (this.isHostile ? "#ef4444" : "#b45309");

        // Top massive outward-sweeping ivory war tusk
        ctx.fillStyle = wtTuskColor;
        ctx.strokeStyle = wtTuskStroke;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(this.radius - 2, -5);
        ctx.quadraticCurveTo(this.radius + 14, -18, this.radius + 18, -10);
        ctx.quadraticCurveTo(this.radius + 8, -6, this.radius - 2, -1);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Bottom massive outward-sweeping ivory war tusk
        ctx.beginPath();
        ctx.moveTo(this.radius - 2, 5);
        ctx.quadraticCurveTo(this.radius + 14, 18, this.radius + 18, 10);
        ctx.quadraticCurveTo(this.radius + 8, 6, this.radius - 2, 1);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Snout Heavy Iron Nose Plate
        ctx.fillStyle = isHit ? "#ffffff" : "#29150b";
        ctx.fillRect(this.radius - 8, -6, 7, 12);

        // Fierce Red/Amber Pig Eyes
        ctx.fillStyle = isHit ? "#ffffff" : (this.isHostile ? "#ef4444" : "#fbbf24");
        ctx.beginPath();
        ctx.arc(4, -6, 2.5, 0, Math.PI * 2);
        ctx.arc(4, 6, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

      } else if (this.type === "moonmane") {
        // --- MOONMANE RENDERING (LUNAR CELESTIAL SOVEREIGN, CRESCENT MOON CREST) ---
        // Radiant Astral Halo with Orbiting Star Motes
        const mmMoonTime = Date.now() / 600;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius + 8, 0, Math.PI * 2);
        ctx.fillStyle = isHit ? "rgba(255,255,255,0.15)" : (this.isHostile ? "rgba(239, 68, 68, 0.22)" : "rgba(129, 140, 248, 0.25)");
        ctx.fill();

        for (let m = 0; m < 5; m++) {
          const mAngle = mmMoonTime + (m * Math.PI * 2) / 5;
          const mx = this.x + Math.cos(mAngle) * (this.radius + 9);
          const my = this.y + Math.sin(mAngle) * (this.radius + 9);
          ctx.fillStyle = isHit ? "#ffffff" : "#c7d2fe";
          ctx.beginPath();
          ctx.arc(mx, my, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Pearlescent Celestial Body
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        if (isHit) {
          ctx.fillStyle = "#ffffff";
          ctx.strokeStyle = "#e0e7ff";
        } else if (this.isHostile) {
          ctx.fillStyle = "#312e81";
          ctx.strokeStyle = "#ef4444";
          ctx.shadowColor = "rgba(239, 68, 68, 1.0)";
          ctx.shadowBlur = 26;
        } else {
          ctx.fillStyle = "#e0e7ff";
          ctx.strokeStyle = "#818cf8";
          ctx.shadowColor = "rgba(129, 140, 248, 1.0)";
          ctx.shadowBlur = 22;
        }
        ctx.fill();
        ctx.lineWidth = 3.5;
        ctx.stroke();

        // Directional Glowing Crescent Moon Crest & Celestial Eyes
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.aimAngle);

        // Luminous Crescent Moon Crest on Forehead
        const mmCrescentColor = isHit ? "#ffffff" : (this.isHostile ? "#ef4444" : "#6366f1");
        ctx.fillStyle = mmCrescentColor;
        ctx.beginPath();
        ctx.arc(this.radius + 4, 0, 6, -Math.PI / 2, Math.PI / 2, false);
        ctx.arc(this.radius + 7, 0, 4, Math.PI / 2, -Math.PI / 2, true);
        ctx.closePath();
        ctx.fill();

        // Astral Mane Streaks
        ctx.strokeStyle = isHit ? "#ffffff" : "#a5b4fc";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-this.radius + 5, -8);
        ctx.lineTo(2, -4);
        ctx.moveTo(-this.radius + 5, 8);
        ctx.lineTo(2, 4);
        ctx.stroke();

        // Starlight Radiant Eyes
        ctx.fillStyle = isHit ? "#ffffff" : (this.isHostile ? "#ef4444" : "#4338ca");
        ctx.beginPath();
        ctx.arc(7, -5, 2.5, 0, Math.PI * 2);
        ctx.arc(7, 5, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

      } else if (this.type === "crimsonhide") {
        // --- CRIMSONHIDE RENDERING (APEX ANNIHILATION JUGGERNAUT, BLOOD-CRYSTALLINE CARAPACE) ---
        // Expanding Blood Shockwave Rings
        const bloodPulse = (Date.now() / 400) % (Math.PI * 2);
        const pulseR = this.radius + 8 + Math.sin(bloodPulse) * 3;
        ctx.beginPath();
        ctx.arc(this.x, this.y, pulseR, 0, Math.PI * 2);
        ctx.strokeStyle = isHit ? "rgba(255,255,255,0.4)" : "rgba(220, 38, 38, 0.6)";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius + 10, 0, Math.PI * 2);
        ctx.fillStyle = isHit ? "rgba(255,255,255,0.15)" : "rgba(220, 38, 38, 0.25)";
        ctx.fill();

        // 4 Protruding Dorsal Blood Crystals
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.aimAngle);

        const chCrystalColor = isHit ? "#ffffff" : (this.isHostile ? "#ef4444" : "#dc2626");
        ctx.fillStyle = chCrystalColor;
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1;

        // Rear dorsal crystals
        const chSpikes = [
          { x: -this.radius + 2, y: -10, w: 9, h: 4 },
          { x: -this.radius - 4, y: -4, w: 12, h: 5 },
          { x: -this.radius - 4, y: 4, w: 12, h: 5 },
          { x: -this.radius + 2, y: 10, w: 9, h: 4 }
        ];
        chSpikes.forEach(sp => {
          ctx.beginPath();
          ctx.moveTo(sp.x, sp.y - sp.h / 2);
          ctx.lineTo(sp.x - sp.w, sp.y);
          ctx.lineTo(sp.x, sp.y + sp.h / 2);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        });
        ctx.restore();

        // Main Obsidian & Dragonblood Core Shell
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        if (isHit) {
          ctx.fillStyle = "#ffffff";
          ctx.strokeStyle = "#fee2e2";
        } else if (this.isHostile) {
          ctx.fillStyle = "#450a0a";
          ctx.strokeStyle = "#ef4444";
          ctx.shadowColor = "rgba(239, 68, 68, 1.0)";
          ctx.shadowBlur = 30;
        } else {
          ctx.fillStyle = "#260303";
          ctx.strokeStyle = "#dc2626";
          ctx.shadowColor = "rgba(220, 38, 38, 1.0)";
          ctx.shadowBlur = 24;
        }
        ctx.fill();
        ctx.lineWidth = 4;
        ctx.stroke();

        // Fiery Heart Core & Predator Slit Eyes
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.aimAngle);

        // Pulsing demonic core
        const chCoreSize = 5 + Math.sin(Date.now() / 200) * 1.5;
        ctx.fillStyle = isHit ? "#ffffff" : "#ef4444";
        ctx.beginPath();
        ctx.arc(0, 0, chCoreSize, 0, Math.PI * 2);
        ctx.fill();

        // Apocalyptic crimson eyes
        ctx.fillStyle = isHit ? "#ffffff" : "#fef08a";
        ctx.beginPath();
        ctx.ellipse(8, -6, 4, 2, Math.PI / 6, 0, Math.PI * 2);
        ctx.ellipse(8, 6, 4, 2, -Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

      } else {
        // --- NORMAL SENTRY RENDERING ---
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);

        if (isHit) {
          ctx.fillStyle = "#ffffff";
          ctx.strokeStyle = "#fecdd3";
        } else if (this.isHostile) {
          ctx.fillStyle = Config.GAME_CONFIG.npc.color;
          ctx.strokeStyle = "#991b1b";
          ctx.shadowColor = "rgba(239, 68, 68, 0.6)";
          ctx.shadowBlur = 12;
        } else {
          ctx.fillStyle = "#475569";
          ctx.strokeStyle = "#334155";
          ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
          ctx.shadowBlur = 4;
        }

        ctx.fill();
        ctx.lineWidth = 2;
        ctx.stroke();

        // Sentry Eyes
        ctx.shadowBlur = 0;
        if (this.isHostile) {
          ctx.fillStyle = isHit ? "#e11d48" : "#ffffff";
          ctx.beginPath();
          ctx.arc(this.x - 4, this.y - 2, 2.5, 0, Math.PI * 2);
          ctx.arc(this.x + 4, this.y - 2, 2.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = "#dc2626";
          ctx.beginPath();
          ctx.arc(this.x - 3.5, this.y - 2, 1.2, 0, Math.PI * 2);
          ctx.arc(this.x + 4.5, this.y - 2, 1.2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = "#94a3b8";
          ctx.beginPath();
          ctx.arc(this.x - 4, this.y - 2, 2, 0, Math.PI * 2);
          ctx.arc(this.x + 4, this.y - 2, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Worldroot Rooting Visual (Tangled Root Vines around base)
      if (this.rootTimer > 0) {
        ctx.save();
        ctx.strokeStyle = "#15803d";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius + 5, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = "#4ade80";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius + 8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      }

      // Health bar: Show for all living NPCs (fixed: normal sentries now properly have a health bar)
      let barWidth = typeof this.barWidth === "number" ? this.barWidth : 28;
      if (!this.barWidth) {
        if (this.type === "guard") barWidth = 44;
        else if (this.type === "thug") barWidth = 38;
        else if (this.type === "fairy") barWidth = 36;
        else if (this.type === "swordman") barWidth = 46;
        else if (this.type === "buff_man") barWidth = 52;
        else if (this.type === "elf") barWidth = 50;
        else if (this.type === "normal") barWidth = 32;
      }

      const barHeight = this.type !== "normal" ? 5 : 4;
      const barX = this.x - barWidth / 2;
      const barY = this.y - this.radius - 9;

      ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
      ctx.fillRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2);

      const healthPct = Math.max(0, this.hp / this.maxHp);
      let barColor = healthPct > 0.4 ? (this.barColor || "#10b981") : "#ef4444";
      if (!this.barColor) {
        if (this.type === "guard") barColor = healthPct > 0.4 ? "#f8fafc" : "#f43f5e";
        else if (this.type === "thug") barColor = healthPct > 0.4 ? "#f59e0b" : "#ef4444";
        else if (this.type === "fairy") barColor = healthPct > 0.4 ? "#38bdf8" : "#f43f5e";
        else if (this.type === "swordman") barColor = healthPct > 0.4 ? "#60a5fa" : "#ef4444";
        else if (this.type === "buff_man") barColor = healthPct > 0.4 ? "#fbbf24" : "#ef4444";
        else if (this.type === "elf") barColor = healthPct > 0.4 ? "#34d399" : "#ef4444";
        else if (this.type === "normal") barColor = healthPct > 0.4 ? "#10b981" : "#ef4444";
      }

      ctx.fillStyle = barColor;
      ctx.fillRect(barX, barY, barWidth * healthPct, barHeight);

      // Render HP text over health bar for all NPCs
      ctx.font = "bold 8px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.fillText(`${Math.ceil(this.hp)}`, this.x, barY - 3);

      ctx.restore();
    }
  }

  /**
   * Natural Grassland Tree
   */
  class Tree {
    constructor(x, y, radius) {
      this.x = x;
      this.y = y;
      this.radius = radius;
    }

    draw(ctx) {
      ctx.save();
      // Drop Shadow
      ctx.beginPath();
      ctx.arc(this.x + 4, this.y + 6, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(10, 20, 10, 0.35)";
      ctx.fill();

      // Trunk Base
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius * 0.35, 0, Math.PI * 2);
      ctx.fillStyle = "#452d19";
      ctx.fill();

      // Outer Canopy Leaf Layer
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = "#1e532a";
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = "#164020";
      ctx.stroke();

      // Inner Highlight Canopy
      ctx.beginPath();
      ctx.arc(this.x - this.radius * 0.2, this.y - this.radius * 0.2, this.radius * 0.65, 0, Math.PI * 2);
      ctx.fillStyle = "#2d7a3e";
      ctx.fill();

      ctx.restore();
    }
  }

  /**
   * Natural Grassland Rock Boulder
   */
  class Rock {
    constructor(x, y, radius) {
      this.x = x;
      this.y = y;
      this.radius = radius;
    }

    draw(ctx) {
      ctx.save();
      // Drop Shadow
      ctx.beginPath();
      ctx.arc(this.x + 3, this.y + 4, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(10, 20, 10, 0.3)";
      ctx.fill();

      // Boulder Body
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = "#475569";
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#334155";
      ctx.stroke();

      // Mossy highlight
      ctx.beginPath();
      ctx.arc(this.x - this.radius * 0.25, this.y - this.radius * 0.25, this.radius * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = "#64748b";
      ctx.fill();

      ctx.restore();
    }
  }

  class SwordStand {
    constructor(config) {
      this.id = config.id || "sword_stand";
      this.swordId = config.swordId || "devourer";
      this.x = config.x;
      this.y = config.y;
      this.radius = config.radius;
      this.interactRadius = config.interactRadius;
      this.title = config.title || "WEAPON PEDESTAL";
      this.subtitle = config.subtitle || (this.swordId === "overdrive" ? "OVERDRIVE" : "DEVOURER");
      this.unlockKills = config.unlockKills || 0;
      this.hoverTime = 0;
    }

    update(dt) {
      this.hoverTime += dt * 2.5;
    }

    isPlayerNearby(player) {
      return Math.hypot(player.x - this.x, player.y - this.y) <= this.interactRadius;
    }

    render(ctx, activePhase, isLocked = false) {
      this.draw(ctx, activePhase, isLocked);
    }

    draw(ctx, activePhase, isLocked = false, isNearby = false, hasNearbyFocus = false) {
      ctx.save();
      const isOverdrive = this.swordId === "overdrive";
      const isAquatic = this.swordId === "aquatic";
      const isSoil = this.swordId === "soil";
      const isMetallic = this.swordId === "metallic";
      const isFlora = this.swordId === "flora";
      const isHellfire = this.swordId === "hellfire";
      const phaseColor = isLocked
        ? "#64748b"
        : (activePhase
            ? activePhase.color
            : (isHellfire ? "#dc2626" : (isFlora ? "#15803d" : (isMetallic ? "#94a3b8" : (isSoil ? "#d97706" : (isAquatic ? "#06b6d4" : (isOverdrive ? "#ffffff" : "#38bdf8")))))));
      const I18n = window.Killstreak && window.Killstreak.I18n;

      // 1. Radiant Ground Floor Aura (sized for compact row spacing)
      const auraGrad = ctx.createRadialGradient(this.x, this.y, 4, this.x, this.y, this.radius + 12);
      const auraColor = isLocked
        ? "rgba(71, 85, 105, 0.28)"
        : (isHellfire ? "rgba(220, 38, 38, 0.32)" : (isFlora ? "rgba(34, 197, 94, 0.30)" : (isMetallic ? "rgba(148, 163, 184, 0.28)" : (isSoil ? "rgba(180, 83, 9, 0.32)" : (isAquatic ? "rgba(6, 182, 212, 0.30)" : (isOverdrive ? "rgba(239, 68, 68, 0.28)" : "rgba(56, 189, 248, 0.28)"))))));
      auraGrad.addColorStop(0, auraColor);
      auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius + 12, 0, Math.PI * 2);
      ctx.fill();

      // 2. Animated Rotating Rune Ring (tight radius prevents collision with adjacent stands)
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius + 6, 0, Math.PI * 2);
      ctx.lineWidth = 1.4;
      ctx.setLineDash([4, 3]);
      ctx.lineDashOffset = -this.hoverTime * 8;
      ctx.strokeStyle = isLocked
        ? "rgba(100, 116, 139, 0.45)"
        : (isHellfire ? "rgba(239, 68, 68, 0.85)" : (isFlora ? "rgba(74, 222, 128, 0.8)" : (isMetallic ? "rgba(203, 213, 225, 0.8)" : (isSoil ? "rgba(245, 158, 11, 0.8)" : (isAquatic ? "rgba(6, 182, 212, 0.75)" : (isOverdrive ? "rgba(239, 68, 68, 0.7)" : "rgba(56, 189, 248, 0.7)"))))));
      ctx.stroke();
      ctx.setLineDash([]);

      // 3. Multi-Tier Stone Pedestal Base
      // Tier 1: Outer Step
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius + 3.5, 0, Math.PI * 2);
      ctx.fillStyle = isLocked ? "#1e293b" : "#334155";
      ctx.fill();
      ctx.lineWidth = 1.4;
      ctx.strokeStyle = isLocked ? "#334155" : (isHellfire ? "#7f1d1d" : (isFlora ? "#14532d" : (isMetallic ? "#334155" : (isSoil ? "#78350f" : (isAquatic ? "#0369a1" : (isOverdrive ? "#991b1b" : "#0284c7"))))));
      ctx.stroke();

      // Tier 2: Pedestal Core Table
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = isLocked ? "#0f172a" : "#1e293b";
      ctx.fill();
      ctx.lineWidth = 1.8;
      ctx.strokeStyle = isLocked ? "#475569" : (isHellfire ? "#dc2626" : (isFlora ? "#22c55e" : (isMetallic ? "#cbd5e1" : (isSoil ? "#b45309" : (isAquatic ? "#38bdf8" : (isOverdrive ? "#f87171" : "#7dd3fc"))))));
      ctx.stroke();

      // Tier 3: Inner Socket
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius * 0.48, 0, Math.PI * 2);
      ctx.fillStyle = isLocked ? "#020617" : "rgba(15, 23, 42, 0.95)";
      ctx.fill();
      ctx.strokeStyle = isLocked ? "#475569" : (isHellfire ? "#ef4444" : (isFlora ? "#4ade80" : (isMetallic ? "#f8fafc" : (isSoil ? "#f59e0b" : (isAquatic ? "#06b6d4" : (isOverdrive ? "#ef4444" : phaseColor))))));
      ctx.lineWidth = 1.6;
      ctx.stroke();

      // 4. Floating Animated Blade
      const bobY = Math.sin(this.hoverTime) * 3.2;
      ctx.save();
      ctx.translate(this.x, this.y - 8 + bobY);
      ctx.rotate(-Math.PI / 2);

      if (isLocked) {
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#475569";
        ctx.fillRect(-5, -2, 22, 4);
        ctx.restore();
      } else if (isSoil) {
        ctx.shadowColor = "#f59e0b";
        ctx.shadowBlur = 12;

        ctx.fillStyle = "#451a03";
        ctx.fillRect(-7, -2.5, 6, 5);

        ctx.fillStyle = "#78350f";
        ctx.beginPath();
        ctx.rect(-1.5, -4.5, 3, 9);
        ctx.fill();

        ctx.fillStyle = "#b45309";
        ctx.beginPath();
        ctx.moveTo(1.5, -2.4);
        ctx.lineTo(18, -2.0);
        ctx.lineTo(26, 0);
        ctx.lineTo(18, 2.0);
        ctx.lineTo(1.5, 2.4);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "#fef08a";
        ctx.fillRect(3, -0.6, 16, 1.2);
        ctx.restore();
      } else if (isAquatic) {
        ctx.shadowColor = "#06b6d4";
        ctx.shadowBlur = 12;

        ctx.fillStyle = "#0c4a6e";
        ctx.fillRect(-7, -2.5, 6, 5);

        ctx.fillStyle = "#0284c7";
        ctx.beginPath();
        ctx.arc(-1.5, 0, 3.2, -Math.PI * 0.5, Math.PI * 0.5);
        ctx.fill();

        ctx.fillStyle = "#38bdf8";
        ctx.beginPath();
        ctx.moveTo(1.5, -2);
        ctx.quadraticCurveTo(15, -3, 26, 0);
        ctx.quadraticCurveTo(15, 3, 1.5, 2);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(3, -0.5, 16, 1.0);
        ctx.restore();
      } else if (isOverdrive) {
        ctx.shadowColor = "#ef4444";
        ctx.shadowBlur = 12;

        ctx.fillStyle = "#1e293b";
        ctx.fillRect(-7, -2.5, 6, 5);

        ctx.fillStyle = "#ef4444";
        ctx.fillRect(-1.5, -4.5, 3, 9);

        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.moveTo(1.5, -1.8);
        ctx.lineTo(22, -1.4);
        ctx.lineTo(27, 0);
        ctx.lineTo(22, 1.4);
        ctx.lineTo(1.5, 1.8);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "#ef4444";
        ctx.fillRect(3, -0.5, 16, 1.0);
        ctx.restore();
      } else if (isMetallic) {
        ctx.shadowColor = "#cbd5e1";
        ctx.shadowBlur = 12;

        ctx.fillStyle = "#1e293b";
        ctx.fillRect(-7, -2.5, 6, 5);

        ctx.fillStyle = "#475569";
        ctx.fillRect(-1.5, -4.5, 3, 9);

        ctx.fillStyle = "#94a3b8";
        ctx.beginPath();
        ctx.moveTo(1.5, -2.2);
        ctx.lineTo(20, -2.0);
        ctx.lineTo(26, 0);
        ctx.lineTo(20, 2.0);
        ctx.lineTo(1.5, 2.2);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(3, -0.6, 16, 1.2);
        ctx.restore();
      } else if (isFlora) {
        ctx.shadowColor = "#4ade80";
        ctx.shadowBlur = 12;

        ctx.fillStyle = "#451a03";
        ctx.fillRect(-7, -2.5, 6, 5);

        ctx.fillStyle = "#15803d";
        ctx.beginPath();
        ctx.arc(-1.5, 0, 3.2, -Math.PI * 0.5, Math.PI * 0.5);
        ctx.fill();

        ctx.fillStyle = "#22c55e";
        ctx.beginPath();
        ctx.moveTo(1.5, -2.2);
        ctx.quadraticCurveTo(14, -3.2, 26, 0);
        ctx.quadraticCurveTo(14, 3.2, 1.5, 2.2);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "#86efac";
        ctx.fillRect(3, -0.6, 16, 1.2);
        ctx.restore();
      } else if (isHellfire) {
        ctx.shadowColor = "#ef4444";
        ctx.shadowBlur = 14;

        ctx.fillStyle = "#09090b";
        ctx.fillRect(-7, -2.5, 6, 5);

        ctx.fillStyle = "#7f1d1d";
        ctx.fillRect(-1.5, -4.5, 3, 9);

        ctx.fillStyle = "#ea580c";
        ctx.beginPath();
        ctx.moveTo(1.5, -2.4);
        ctx.lineTo(12, -3.0);
        ctx.lineTo(20, -1.8);
        ctx.lineTo(27, 0);
        ctx.lineTo(20, 1.8);
        ctx.lineTo(12, 3.0);
        ctx.lineTo(1.5, 2.4);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "#fbbf24";
        ctx.fillRect(3, -0.6, 16, 1.2);
        ctx.restore();
      } else {
        ctx.shadowColor = phaseColor;
        ctx.shadowBlur = 12;

        ctx.fillStyle = "#1e293b";
        ctx.fillRect(-6, -3.2, 5, 6.4);

        ctx.fillStyle = phaseColor;
        ctx.beginPath();
        ctx.moveTo(-1, -2.0);
        ctx.lineTo(20, -2.0);
        ctx.lineTo(26, 0);
        ctx.lineTo(20, 2.0);
        ctx.lineTo(-1, 2.0);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, -0.6, 18, 1.2);
        ctx.restore();
      }

      // 5. Header Title & Subtitle Labels
      // In compact row view (57.5px spacing), render clean compact labels that never collide.
      // If isNearby is true, call drawBadge directly (also called in second pass by Game for top z-index).
      const pNum = activePhase ? (typeof activePhase.phase === "number" ? activePhase.phase : 1) : 1;
      let headerColor = "#f8fafc";
      let subColor = phaseColor;

      if (isNearby) {
        this.drawBadge(ctx, activePhase, isLocked);
      } else if (!hasNearbyFocus) {
        // Idle Compact Labels (Width < 50px so they never collide at 57.5px spacing)
        let compactTitle = "";
        let compactSub = "";
        if (isLocked) {
          headerColor = isHellfire ? "#ef4444" : (isFlora ? "#4ade80" : (isMetallic ? "#cbd5e1" : (isSoil ? "#f59e0b" : (isAquatic ? "#06b6d4" : (isOverdrive ? "#ef4444" : "#94a3b8")))));
          subColor = "#94a3b8";
          const unlockReq = this.unlockKills || (window.Killstreak && window.Killstreak.Data && window.Killstreak.Data.Swords && window.Killstreak.Data.Swords[this.swordId] && window.Killstreak.Data.Swords[this.swordId].unlockKills) || 0;
          const formattedK = unlockReq >= 1000 ? `${parseFloat((unlockReq / 1000).toFixed(2))}K` : `${unlockReq}`;
          compactTitle = `🔒 ${formattedK}`;
          compactSub = "LOCKED";
        } else if (isHellfire) {
          compactTitle = "HELLFIRE";
          subColor = "#ef4444";
          compactSub = `PHASE ${pNum}`;
        } else if (isFlora) {
          compactTitle = "FLORA";
          subColor = "#4ade80";
          compactSub = `PHASE ${pNum}`;
        } else if (isMetallic) {
          compactTitle = "METALLIC";
          subColor = "#cbd5e1";
          compactSub = `PHASE ${pNum}`;
        } else if (isSoil) {
          compactTitle = "SOIL";
          subColor = "#d97706";
          compactSub = `PHASE ${pNum}`;
        } else if (isAquatic) {
          compactTitle = "AQUATIC";
          subColor = "#06b6d4";
          compactSub = `PHASE ${pNum}`;
        } else if (isOverdrive) {
          compactTitle = "OVERDRIVE";
          subColor = "#ef4444";
          compactSub = `PHASE ${pNum}`;
        } else {
          compactTitle = "DEVOURER";
          subColor = "#38bdf8";
          compactSub = `PHASE ${pNum}`;
        }

        ctx.save();
        ctx.textAlign = "center";
        ctx.shadowColor = "rgba(0, 0, 0, 0.9)";
        ctx.shadowBlur = 4;

        ctx.font = "bold 8px -apple-system, BlinkMacSystemFont, sans-serif";
        ctx.fillStyle = headerColor;
        ctx.fillText(compactTitle, this.x, this.y - this.radius - 23);

        ctx.font = "bold 7.5px -apple-system, BlinkMacSystemFont, sans-serif";
        ctx.fillStyle = subColor;
        ctx.fillText(compactSub, this.x, this.y - this.radius - 13);
        ctx.restore();
      }

      ctx.restore();
    }

    drawBadge(ctx, activePhase, isLocked = false) {
      ctx.save();
      const isOverdrive = this.swordId === "overdrive";
      const isAquatic = this.swordId === "aquatic";
      const isSoil = this.swordId === "soil";
      const isMetallic = this.swordId === "metallic";
      const isFlora = this.swordId === "flora";
      const isHellfire = this.swordId === "hellfire";
      const phaseColor = isLocked
        ? "#64748b"
        : (activePhase
            ? activePhase.color
            : (isHellfire ? "#dc2626" : (isFlora ? "#15803d" : (isMetallic ? "#94a3b8" : (isSoil ? "#d97706" : (isAquatic ? "#06b6d4" : (isOverdrive ? "#ffffff" : "#38bdf8")))))));
      const I18n = window.Killstreak && window.Killstreak.I18n;

      let fullTitle = "";
      let fullSubtitle = "";
      let headerColor = "#f8fafc";
      let subColor = phaseColor;

      if (isLocked) {
        headerColor = isHellfire ? "#ef4444" : (isFlora ? "#4ade80" : (isMetallic ? "#cbd5e1" : (isSoil ? "#f59e0b" : (isAquatic ? "#06b6d4" : (isOverdrive ? "#ef4444" : "#94a3b8")))));
        const sName = (I18n ? (I18n.getSwordInfo(this.swordId) || {}).name || this.swordId : this.swordId).toUpperCase();
        fullTitle = `🔒 ${sName} (${I18n && I18n.currentLang === "vi" ? "ĐÃ KHÓA" : "LOCKED"})`;
        subColor = "#94a3b8";
        const unlockReq = this.unlockKills || (window.Killstreak && window.Killstreak.Data && window.Killstreak.Data.Swords && window.Killstreak.Data.Swords[this.swordId] && window.Killstreak.Data.Swords[this.swordId].unlockKills) || 0;
        fullSubtitle = I18n && I18n.currentLang === "vi"
          ? `[ CẦN ${unlockReq.toLocaleString()} HẠ GỤC ]`
          : `[ ${unlockReq.toLocaleString()} KILLS REQUIRED ]`;
      } else if (isHellfire) {
        fullTitle = "🔥 HELLFIRE";
        subColor = "#ef4444";
        const pInfo = (I18n && activePhase) ? I18n.getPhaseInfo("hellfire", activePhase.phase) : activePhase;
        fullSubtitle = pInfo ? (I18n ? I18n.t("hud.phase_prefix", { name: (pInfo.shortName || "").toUpperCase() }) : `PHASE: ${(pInfo.shortName || "").toUpperCase()}`) : "PHASE 1: EMBER";
      } else if (isFlora) {
        fullTitle = "🌿 FLORA";
        subColor = "#4ade80";
        const pInfo = (I18n && activePhase) ? I18n.getPhaseInfo("flora", activePhase.phase) : activePhase;
        fullSubtitle = pInfo ? (I18n ? I18n.t("hud.phase_prefix", { name: (pInfo.shortName || "").toUpperCase() }) : `PHASE: ${(pInfo.shortName || "").toUpperCase()}`) : "PHASE 1: SPROUT";
      } else if (isMetallic) {
        fullTitle = "⚙️ METALLIC";
        subColor = "#cbd5e1";
        const pInfo = (I18n && activePhase) ? I18n.getPhaseInfo("metallic", activePhase.phase) : activePhase;
        fullSubtitle = pInfo ? (I18n ? I18n.t("hud.phase_prefix", { name: (pInfo.shortName || "").toUpperCase() }) : `PHASE: ${(pInfo.shortName || "").toUpperCase()}`) : "PHASE 1: SCRAP";
      } else if (isSoil) {
        fullTitle = "🛡️ SOIL";
        subColor = "#d97706";
        const pInfo = (I18n && activePhase) ? I18n.getPhaseInfo("soil", activePhase.phase) : activePhase;
        fullSubtitle = pInfo ? (I18n ? I18n.t("hud.phase_prefix", { name: (pInfo.shortName || "").toUpperCase() }) : `PHASE: ${(pInfo.shortName || "").toUpperCase()}`) : "PHASE 1: LOOSE DIRT";
      } else if (isAquatic) {
        fullTitle = "🌊 AQUATIC";
        subColor = "#06b6d4";
        const pInfo = (I18n && activePhase) ? I18n.getPhaseInfo("aquatic", activePhase.phase) : activePhase;
        fullSubtitle = pInfo ? (I18n ? I18n.t("hud.phase_prefix", { name: (pInfo.shortName || "").toUpperCase() }) : `PHASE: ${(pInfo.shortName || "").toUpperCase()}`) : "PHASE 1: DROPLET";
      } else if (isOverdrive) {
        fullTitle = "⚡ OVERDRIVE";
        subColor = "#ef4444";
        const pInfo = (I18n && activePhase) ? I18n.getPhaseInfo("overdrive", activePhase.phase) : activePhase;
        fullSubtitle = pInfo ? (I18n ? I18n.t("hud.phase_prefix", { name: (pInfo.shortName || "").toUpperCase() }) : `PHASE: ${(pInfo.shortName || "").toUpperCase()}`) : "PHASE 1: QUICK SILVER";
      } else {
        fullTitle = "👁️ DEVOURER";
        subColor = "#38bdf8";
        const pInfo = (I18n && activePhase) ? I18n.getPhaseInfo("devourer", activePhase.phase) : activePhase;
        fullSubtitle = pInfo ? (I18n ? I18n.t("hud.phase_prefix", { name: (pInfo.shortName || "").toUpperCase() }) : `PHASE: ${(pInfo.shortName || "").toUpperCase()}`) : "PHASE 1: HUNGER";
      }

      ctx.font = "bold 9.5px -apple-system, BlinkMacSystemFont, sans-serif";
      const titleW = ctx.measureText(fullTitle).width;
      ctx.font = "bold 8px -apple-system, BlinkMacSystemFont, sans-serif";
      const subW = ctx.measureText(fullSubtitle).width;
      const badgeW = Math.max(96, Math.max(titleW, subW) + 16);
      const badgeH = 28;
      const badgeX = this.x - badgeW / 2;
      const badgeY = this.y - this.radius - 40;

      // Solid backdrop pill with radiant neon border
      ctx.fillStyle = "#090d16";
      ctx.shadowColor = phaseColor;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      if (typeof ctx.roundRect === "function") {
        ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 5);
      } else {
        ctx.rect(badgeX, badgeY, badgeW, badgeH);
      }
      ctx.fill();
      ctx.strokeStyle = phaseColor;
      ctx.lineWidth = 1.3;
      ctx.stroke();

      // Text
      ctx.shadowBlur = 3;
      ctx.shadowColor = "rgba(0,0,0,0.9)";
      ctx.textAlign = "center";
      ctx.font = "bold 9.5px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillStyle = headerColor;
      ctx.fillText(fullTitle, this.x, badgeY + 12);

      ctx.font = "bold 8px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillStyle = subColor;
      ctx.fillText(fullSubtitle, this.x, badgeY + 23);
      ctx.restore();
    }
  }

  class Portal {
    constructor(config) {
      this.x = config.x;
      this.y = config.y;
      this.width = config.width;
      this.height = config.height;
      this.label = config.label;
      this.interactRadius = config.interactRadius || 60;
      this.pulseTimer = 0;
    }

    update(dt) {
      this.pulseTimer += dt * 3;
    }

    isPlayerNearby(player) {
      const dx = player.x - this.x;
      const dy = player.y - this.y;
      return Math.hypot(dx, dy) <= this.interactRadius;
    }

    draw(ctx) {
      this.render(ctx);
    }

    render(ctx) {
      this.pulseTimer += 0.04;
      const pulse = 0.5 + 0.5 * Math.sin(this.pulseTimer);

      ctx.save();
      ctx.strokeStyle = "rgba(56, 189, 248, 0.85)";
      ctx.lineWidth = 3;
      ctx.shadowColor = "#0284c7";
      ctx.shadowBlur = 12 + pulse * 8;
      ctx.strokeRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);

      ctx.fillStyle = "#38bdf8";
      const innerHeight = (this.height - 12) * (0.6 + pulse * 0.4);
      ctx.fillRect(this.x - 3, this.y - innerHeight / 2, 6, innerHeight);

      const I18n = window.Killstreak && window.Killstreak.I18n;
      const portalKey = this.label && this.label.includes("GRASSLAND") ? "maps.portal_combat" : "maps.portal_lobby";
      const displayLabel = I18n ? I18n.t(portalKey) : this.label;

      ctx.font = "bold 10px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillStyle = "#38bdf8";
      ctx.textAlign = "center";
      ctx.shadowBlur = 4;
      ctx.fillText(displayLabel, this.x, this.y - this.height / 2 - 10);

      ctx.restore();
    }
  }

  class Particle {
    constructor(x, y, vx, vy, color, size, lifetime) {
      this.x = x;
      this.y = y;
      this.vx = vx;
      this.vy = vy;
      this.color = color;
      this.size = size;
      this.lifetime = lifetime;
      this.maxLifetime = lifetime;
    }

    update(dt) {
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      this.lifetime -= dt;
    }

    draw(ctx) {
      const progress = Math.max(0, this.lifetime / this.maxLifetime);
      ctx.save();
      ctx.globalAlpha = progress;
      ctx.fillStyle = this.color;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * progress, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  class FloatingText {
    constructor(x, y, text, color = "#f8fafc", size = 13) {
      this.x = x;
      this.y = y;
      this.text = text;
      this.color = color;
      this.size = size;
      this.lifetime = 0.8;
      this.maxLifetime = 0.8;
    }

    update(dt) {
      this.y -= 35 * dt;
      this.lifetime -= dt;
    }

    draw(ctx) {
      const progress = Math.max(0, this.lifetime / this.maxLifetime);
      ctx.save();
      ctx.globalAlpha = progress;
      ctx.font = `bold ${this.size}px -apple-system, BlinkMacSystemFont, sans-serif`;
      ctx.fillStyle = this.color;
      ctx.textAlign = "center";
      ctx.shadowColor = "rgba(0,0,0,0.8)";
      ctx.shadowBlur = 4;
      ctx.fillText(this.text, this.x, this.y);
      ctx.restore();
    }
  }

  /**
   * TsunamiWave - Signature skill projectile for Aquatic (Phase 9+)
   * 3.0-second lifetime, fast-moving 2D wave, wide rectangular swept hitbox,
   * anti-multi-hit (each entity hit at most once per wave), 4x base damage.
   */
  class TsunamiWave {
    constructor(startX, startY, angle, damage, phaseNum = 9) {
      this.x = startX;
      this.y = startY;
      this.angle = angle;
      this.damage = damage;
      this.phaseNum = phaseNum;
      this.speed = 520;
      this.maxLifetime = 3.0;
      this.lifetime = 0;
      this.isDead = false;

      // Hitbox dimensions - widen with phase
      this.width = 140 + (phaseNum - 9) * 25;
      this.height = 70 + (phaseNum - 9) * 10;

      // Anti-multi-hit rule
      this.hitEntities = new Set();
      this.animTimer = 0;
    }

    update(dt, game) {
      if (this.isDead) return;
      this.lifetime += dt;
      this.animTimer += dt;
      if (this.lifetime >= this.maxLifetime) {
        this.isDead = true;
        return;
      }

      this.x += Math.cos(this.angle) * this.speed * dt;
      this.y += Math.sin(this.angle) * this.speed * dt;

      // Ambient water spray particles
      if (game && game.particles && Math.random() < 0.75) {
        const perp = this.angle + Math.PI / 2;
        const offset = (Math.random() - 0.5) * this.width;
        const px = this.x + Math.cos(perp) * offset;
        const py = this.y + Math.sin(perp) * offset;
        const pSpeed = 40 + Math.random() * 80;
        const pAngle = this.angle + (Math.random() - 0.5) * 0.8;
        const pColor = Math.random() > 0.4 ? "rgba(6, 182, 212, 0.7)" : "rgba(255, 255, 255, 0.85)";
        game.particles.push(new Particle(px, py, Math.cos(pAngle) * pSpeed, Math.sin(pAngle) * pSpeed, pColor, 2.5 + Math.random() * 3, 0.35 + Math.random() * 0.25));
      }

      if (!game || !game.npcs) return;

      const cos = Math.cos(this.angle);
      const sin = Math.sin(this.angle);
      const halfW = this.width / 2;
      const halfH = this.height / 2;

      for (let i = game.npcs.length - 1; i >= 0; i--) {
        const npc = game.npcs[i];
        if (!npc || npc.isDead || npc.hp <= 0) continue;
        if (this.hitEntities.has(npc)) continue; // Anti-multi-hit rule!

        // Oriented box collision
        const dx = npc.x - this.x;
        const dy = npc.y - this.y;
        const localX = dx * cos + dy * sin;
        const localY = -dx * sin + dy * cos;

        if (Math.abs(localX) <= halfH + npc.radius && Math.abs(localY) <= halfW + npc.radius) {
          this.hitEntities.add(npc);

          if (game.player) {
            game.player.timeSinceCombat = 0;
          }

          npc.takeDamage(this.damage, this.angle, 220);

          if (game.saveData && game.saveData.settings && game.saveData.settings.damageNumbers) {
            game.floatingTexts.push(
              new FloatingText(npc.x, npc.y - 14, `-${this.damage}`, "#06b6d4", 17)
            );
          }

          if (game.camera && typeof game.camera.shake === "function") {
            game.camera.shake(this.phaseNum >= 12 ? 8 : 4.5, 0.16);
          }

          if (game.particles) {
            for (let p = 0; p < 12; p++) {
              const pSpeed = 100 + Math.random() * 150;
              const pAngle = this.angle + (Math.random() - 0.5) * Math.PI * 0.75;
              const pColor = p % 2 === 0 ? "#06b6d4" : "#ffffff";
              game.particles.push(new Particle(npc.x, npc.y, Math.cos(pAngle) * pSpeed, Math.sin(pAngle) * pSpeed, pColor, 2.8 + Math.random() * 2.5, 0.4));
            }
          }

          if (npc.hp <= 0 && typeof game.handleNpcDeath === "function") {
            game.handleNpcDeath(npc);
          }
        }
      }
    }

    draw(ctx) {
      if (this.isDead) return;
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);

      const isOmni = this.phaseNum === 13;
      const fade = Math.min(1, Math.min(this.lifetime * 4, (this.maxLifetime - this.lifetime) * 3));
      ctx.globalAlpha = Math.max(0, fade);

      const halfW = this.width / 2;
      const crestH = this.height * 0.7;

      ctx.shadowColor = isOmni ? "rgba(255, 255, 255, 0.95)" : "rgba(6, 182, 212, 0.9)";
      ctx.shadowBlur = isOmni ? 30 : 20;

      const grad = ctx.createLinearGradient(-crestH, 0, crestH, 0);
      grad.addColorStop(0, "rgba(2, 132, 199, 0.1)");
      grad.addColorStop(0.6, isOmni ? "rgba(6, 182, 212, 0.75)" : "rgba(14, 165, 233, 0.65)");
      grad.addColorStop(1, isOmni ? "rgba(255, 255, 255, 0.95)" : "rgba(224, 242, 254, 0.95)");

      ctx.beginPath();
      ctx.moveTo(-crestH * 0.6, -halfW);
      ctx.quadraticCurveTo(crestH * 1.2, 0, -crestH * 0.6, halfW);
      ctx.quadraticCurveTo(crestH * 0.3, 0, -crestH * 0.6, -halfW);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.strokeStyle = isOmni ? "#ffffff" : "#e0f2fe";
      ctx.lineWidth = isOmni ? 4.5 : 3;
      ctx.beginPath();
      ctx.moveTo(-crestH * 0.6, -halfW);
      ctx.quadraticCurveTo(crestH * 1.25, 0, -crestH * 0.6, halfW);
      ctx.stroke();

      const anim = this.animTimer * 12;
      for (let i = -2; i <= 2; i++) {
        const yOff = (i / 2.5) * (halfW * 0.75);
        const xOff = Math.sin(anim + i) * 6;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(xOff, yOff, 12, -Math.PI * 0.4, Math.PI * 0.4);
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  window.Killstreak.Entities = {
    Camera,
    Player,
    NPC,
    Tree,
    Rock,
    SwordStand,
    Portal,
    Particle,
    FloatingText,
    TsunamiWave
  };
})(window);

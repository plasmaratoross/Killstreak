/**
 * Centralized Internationalization (I18n) System
 * Provides seamless English and Vietnamese localization for all UI, HUD,
 * weapons, phases, achievements, zones, cutscenes, and toasts.
 */
(function(window) {
  window.Killstreak = window.Killstreak || {};

  const translations = {
    en: {
      menu: {
        title: "KILLSTREAK",
        play: "PLAY",
        library: "LIBRARY",
        achievements: "ACHIEVEMENTS",
        settings: "SETTINGS",
        return_lobby: "RETURN TO LOBBY",
        controls_footer: "Move: WASD / Arrows • Aim: Mouse • Attack: Left Click / Space"
      },
      hud: {
        hp: "HP",
        dmg_tag: "⚔️ {damage} DMG",
        no_sword: "🛡️ NO SWORD",
        scale_streak: "Base: {dmg} DMG • {hp} HP (+{streak} streak)",
        scale_base: "Base: {dmg} DMG • {hp} HP",
        unequipped: "Unequipped",
        killstreak: "KILLSTREAK",
        kills: "KILLS",
        phase_prefix: "PHASE: {name}",
        unequipped_caps: "UNEQUIPPED",
        no_sword_caps: "NO SWORD",
        area_prefix: "AREA: {name}",
        stats_btn: "📊 STATS",
        stats_btn_title: "View Statistics",
        library_btn: "📖 LIBRARY",
        library_btn_title: "Open Library",
        lobby_btn: "🏠 LOBBY",
        lobby_btn_title: "Return to Sanctuary Lobby",
        menu_btn: "MENU [ESC]",
        menu_btn_title: "Pause / Menu",
        debug_streak_label: "Debug Killstreak:",
        debug_streak_placeholder: "amount",
        debug_apply_btn: "APPLY"
      },
      skills: {
        gluttony_label: "[ Z — GLUTTONY ]",
        gluttony_title: "Gluttony [Z] — Beam attack (Phase 10+)",
        engulf_label: "[ X — ENGULF ]",
        engulf_title: "Engulf [X] — Devourer AoE aura (Phase 17)",
        fortitude_label: "[ Z — FORTITUDE ]",
        fortitude_title: "Fortitude [Z] — Shield equal to 15% of current HP for 5s (Phase 4+, 20s CD)",
        tsunami_label: "[ Z — TSUNAMI ]",
        tsunami_title: "Tsunami [Z] — Sweeping wave dealing 4x sword damage (Phase 9+)",
        iron_will_label: "[ Z — IRON WILL ]",
        iron_will_title: "Iron Will [Z] — 46% DMG reduction for 6.9s & retaliatory shrapnel (Phase 4+, 17s CD)",
        worldroot_label: "[ Z — WORLDROOT ]",
        worldroot_title: "Worldroot [Z] — Entangle foes in briar thorns for 2.9s & heal 23% max HP over 4s (Phase 4+, 19s CD)",
        cataclysm_label: "[ Z — CATACLYSM ]",
        cataclysm_title: "Cataclysm [Z] — Slams blade releasing explosive magma eruptions dealing 5.75x DMG (Phase 4+, 15.3s CD)",
        locked_p4: "LOCKED (P4)",
        locked_p9: "LOCKED (P9)",
        locked_p10: "LOCKED (P10)",
        locked_p17: "LOCKED (P17)",
        locked: "LOCKED",
        active: "ACTIVE",
        ready: "READY"
      },
      floating: {
        aquatic_unlocked: "AQUATIC UNLOCKED!",
        soil_unlocked: "SOIL UNLOCKED!",
        soil_p10: "THE INDESTRUCTIBLE FORTRESS!",
        metallic_unlocked: "METALLIC UNLOCKED!",
        metallic_p10: "ETERNAL STEEL!",
        flora_unlocked: "FLORA UNLOCKED!",
        flora_p10: "THE EVERGROWTH!",
        hellfire_unlocked: "HELLFIRE UNLOCKED!",
        hellfire_p10: "THE INFERNAL!",
        all_devourer: "THE ALL DEVOURER ASCENDS!",
        fortitude: "FORTITUDE!",
        tsunami: "TSUNAMI!",
        iron_will: "IRON WILL!",
        worldroot: "WORLDROOT!",
        cataclysm: "CATACLYSM!",
        gluttony: "GLUTTONY!",
        engulf: "ENGULF!"
      },
      prompts: {
        inspect: "Inspect {sword} [E]",
        enter_grassland: "Enter Grassland [E]",
        return_to_lobby: "Return to Lobby [E]",
        confirm_return_lobby: "Return to Sanctuary Lobby? Current sword killstreak ({streak}) will reset to 0."
      },
      pedestal: {
        tag: "WEAPON PEDESTAL",
        weapon_label: "Weapon:",
        current_phase_label: "Current Phase:",
        phase_desc: "PHASE {phase}: {name} ({kills} KILLSTREAK)",
        phase_pedestal: "PHASE {phase}: {name} (PEDESTAL)",
        phase_locked: "LOCKED ({kills} LIFETIME KILLS NEEDED)",
        base_stats_label: "Base Stats:",
        base_stats_val: "{damage} DMG • {hp} HP",
        scaling_label: "Kill Scaling:",
        scaling_val: "+{kills} Phase Kills{bonus}",
        scaling_pedestal: "+0 Phase Kills (Pedestal)",
        scaled_bonus: " (+{pct}% scaled)",
        active_power_label: "Active Power:",
        active_power_val: "{damage} DMG • {hp} HP • {speed} SPD • Reach: {reach}px",
        lock_hint: "🔒 Requires 1,250 Lifetime Kills to Equip (Current: {kills})",
        btn_equip: "EQUIP",
        btn_equipped: "EQUIPPED ✓",
        btn_switch: "SWITCH TO {name}",
        btn_locked: "LOCKED 🔒",
        btn_close: "Close [Esc]"
      },
      library: {
        tag: "SANCTUARY ARCHIVE",
        title: "📖 LIBRARY",
        subtitle: "Official repository of known swords, transformation phases, and earned badges.",
        tab_swords: "⚔️ SWORDS",
        tab_badges: "🏆 BADGES",
        tab_npcs: "👾 BESTIARY",
        npc_count: "{count} KNOWN ENTITIES",
        npc_sort_hint: "Ordered from Weakest to Strongest",
        stat_hp: "HP",
        stat_damage: "DAMAGE",
        stat_attack_speed: "ATK RATE",
        stat_streak: "STREAK",
        stat_kills: "KILLS",
        stat_respawn: "RESPAWN",
        stat_location: "ZONE",
        tier_1: "TIER I • NOVICE",
        tier_2: "TIER II • ADEPT",
        tier_3: "TIER III • ELITE",
        tier_4: "TIER IV • DREAD",
        tier_5: "TIER V • APEX",
        final_badge: "👑 FINAL TRANSFORMATION",
        transitional_hurdle: "TRANSITIONAL HURDLE",
        deliberate_collapse: "DELIBERATE COLLAPSE",
        speed_unit: "SPD",
        req_streak: "Requirement: {kills} Killstreak",
        active_scaled: "Active Scaled: {damage} DMG • {hp} HP (+{kills} kills in active phase)",
        badge_unlocked: "UNLOCKED",
        badge_locked: "LOCKED",
        btn_close: "Close [Esc]"
      },
      achievements: {
        title: "🏆 Achievements",
        subtitle: "Milestones and honors unlocked during your battles.",
        btn_back: "Back [Esc]",
        status_unlocked: "Unlocked",
        status_locked: "Locked",
        items: {
          getting_started: {
            title: "Getting Started",
            description: "Join and begin your journey with Devourer."
          },
          all_devourer: {
            title: "All Devourer",
            description: "Marks completion of the final Devourer phase (75,000 killstreak)."
          },
          overdrive_ascended: {
            title: "Overdrive Ascended",
            description: "Unlock when reaching the final phase of Overdrive (25,000 killstreak)."
          },
          aquatic_ascended: {
            title: "Aquatic Ascended",
            description: "Unlock when reaching the final phase of Aquatic (145,000 killstreak)."
          },
          soil_ascended: {
            title: "Indestructible Soil Fortress",
            description: "Unlock when reaching the final phase of Soil (160,000 killstreak)."
          },
          metallic_ascended: {
            title: "Eternal Steel",
            description: "Unlock when reaching the final phase of Metallic (198,000 killstreak)."
          },
          flora_ascended: {
            title: "The Evergrowth",
            description: "Unlock when reaching the final phase of Flora (230,000 killstreak)."
          },
          hellfire_ascended: {
            title: "The Infernal",
            description: "Unlock when reaching the final phase of Hellfire (264,375 killstreak)."
          }
        }
      },
      settings: {
        title: "Game Settings",
        language: "Language",
        lang_en: "English",
        lang_vi: "Vietnamese",
        shake: "Screen Shake Effect",
        damage_numbers: "Floating Damage Numbers",
        damage_taken: "Show Damage Taken",
        reset_title: "Reset Progress",
        reset_desc: "Erases lifetime kills, highest streak, and badges.",
        reset_btn: "Reset Save",
        reset_confirm: "Reset all lifetime kills, highest streak, and unlocked badges?",
        btn_back: "Back [Esc]"
      },
      debug: {
        auth_title: "Developer Authentication",
        auth_desc: "Enter authorization password to access developer controls.",
        password_placeholder: "Password",
        unlock_btn: "Unlock",
        error_msg: "Incorrect password. Access denied.",
        title: "DEBUG MODE",
        status_on: "[ ON ]",
        status_off: "[ OFF ]",
        set_add_kills: "⚡ Set / Add Kills (Total Kills Only)",
        custom_placeholder: "Custom amount",
        add_kills_btn: "Add Kills",
        set_total_btn: "Set Total",
        badge_actions: "🏆 Badge Actions (Achievements)",
        grant_all_btn: "Grant All Badges",
        grant_btn: "Grant",
        granted_btn: "Granted",
        quick_add_kills: "+{n} Kills"
      },
      stats: {
        title: "📊 Game Statistics",
        subtitle: "Lifetime combat records and progression metrics.",
        total_playtime: "Total Playtime",
        total_kills: "Total Kills",
        highest_streak: "Highest Killstreak",
        current_phase: "Current Phase",
        none_unequipped: "None (Unequipped)",
        btn_back: "Back [Esc]"
      },
      game_over: {
        title: "YOU DIED",
        subtitle: "Your killstreak has ended in the grassland.",
        streak_reached: "Streak Reached",
        weapon: "Weapon",
        phase_reached: "Phase Reached",
        best_streak: "Best Streak",
        btn_fight_again: "Fight Again [Space]",
        btn_return_lobby: "Return to Lobby"
      },
      cutscene: {
        speaker_transcendence: "DEVOURER — TRANSCENDENCE",
        speaker_all_devourer: "THE ALL DEVOURER",
        speaker_spring: "PRIMORDIAL SPRING",
        speaker_aquatic_unlock: "AQUATIC — THE DROWNING TIDE",
        speaker_aquatic_p13: "AQUATIC — OMNITIDAL",
        speaker_ocean: "THE PRIMORDIAL OCEAN",
        speaker_core: "EARTHEN CORE",
        speaker_soil: "SOIL",
        speaker_soil_p10: "SOIL — PHASE 10: THE INDESTRUCTIBLE FORTRESS",
        speaker_metallic: "METALLIC",
        speaker_metallic_p10: "METALLIC — PHASE 10: ETERNAL STEEL",
        speaker_flora: "FLORA",
        speaker_flora_p10: "FLORA — PHASE 10: EVERGROWTH",
        speaker_hellfire: "HELLFIRE",
        speaker_hellfire_p10: "HELLFIRE — PHASE 10: THE INFERNAL",
        dialogue_1: "The endless hunger ceases its trembling. All that lived and breathed in this realm... has been consumed.",
        dialogue_2: "Seventy-five thousand souls surrendered their essence to forge this final vessel.",
        dialogue_3: "The blade transcends mortal flesh, bone, and steel. Reality itself bends to your divine command.",
        dialogue_4: "BEHOLD — THE APEX OF CONSUMPTION IS ATTAINED. I AM THE ALL DEVOURER.",
        aquatic_unlock_1: "In the beginning, there was only silence... and a single falling drop.",
        aquatic_unlock_2: "Two thousand five hundred souls have fallen. Their essence converges into an oceanic wellspring.",
        aquatic_unlock_3: "The quiet ripples have begun to stir. Take the blade... and let the deluge commence.",
        aquatic_p13_1: "The continents submerge beneath a boundless, unforgiving abyss.",
        aquatic_p13_2: "One hundred and forty-five thousand lives swept away into the infinite tide.",
        aquatic_p13_3: "Every drop of water in existence now answers to your pulse. Phase 13 — Omnitidal. The deluge is complete.",
        soil_unlock_1: "Deep beneath the soil, ancient roots awaken.",
        soil_unlock_2: "Three thousand five hundred battles have nourished the earth beneath your feet.",
        soil_unlock_3: "I'm... just dirt. But I'll protect what I can.",
        soil_unlock_4: "Take me. Together, we will make sure nothing ever reaches your treasure.",
        soil_p10_1: "[The screen briefly darkens.]\n\nYou thought I had fallen?",
        soil_p10_2: "[The broken blade sinks into the ground.]\n\nNo.\n\nI returned to where I began.",
        soil_p10_3: "[The ground begins trembling. Cracks spread outward from the sword.]\n\nEvery grain...\nEvery fragment...\nEvery piece of me that was broken...",
        soil_p10_4: "[The scattered dirt from previous phases begins floating toward the blade.]\n\n...was still mine.",
        soil_p10_5: "[Massive layers of earth rise from the ground and surround the sword.]\n\nI spent every battle learning how to endure.\nEvery defeat taught me how to rebuild.",
        soil_p10_6: "[The earth rapidly compresses, becoming incredibly dense and towering.]\n\nI am no longer loose dirt.\nI am no longer merely a blade.",
        soil_p10_7: "[The entire structure erupts into a colossal fortress-like sword.]\n\nI am the ground beneath your feet.\nThe wall between your treasure and everything that seeks to take it.",
        soil_p10_8: "[The fortress settles into complete silence.]\n\nCome.\nBreak yourself against me.",
        soil_p10_9: "As long as I stand...\nYour treasure will never be taken.",
        metallic_unlock_1: "The embers of five thousand battles heat the ancient anvil.",
        metallic_unlock_2: "I was discarded once. Scrap. Waste. Now, I have another purpose.",
        metallic_unlock_3: "Take the blade. Together, we will forge a will that cannot bend or break.",
        metallic_p10_1: "[The sword lies inside an enormous forge.]\n\nI remember when I was nothing.",
        metallic_p10_2: "[The forge ignites.]\n\nScrap. Waste. Something meant to be thrown away.",
        metallic_p10_3: "[The blade begins melting.]\n\nThey believed fire would destroy me.",
        metallic_p10_4: "[The molten metal suddenly stops flowing.]\n\nBut fire was never my enemy.",
        metallic_p10_5: "[The metal rapidly reforms.]\n\nIt was my teacher.",
        metallic_p10_6: "[Huge metallic plates assemble around the blade.]\n\nEvery strike taught me.\nEvery failure hardened me.",
        metallic_p10_7: "[The entire forge begins collapsing into the sword.]\n\nNow there is nothing left to forge.",
        metallic_p10_8: "[The sword becomes enormous and perfectly refined.]\n\nBecause I have already become what I was meant to be.",
        metallic_p10_9: "I do not bend.\nI do not break.\nI endure.",
        flora_unlock_1: "Seven thousand fallen foes nourish the earth beneath you.",
        flora_unlock_2: "I was only a seed. Even seeds know how to survive.",
        flora_unlock_3: "Take my vines. Wield the living growth... and we shall outlive everything.",
        flora_p10_1: "[The sword is planted into the ground.]\n\nBe quiet.",
        flora_p10_2: "[The battlefield becomes completely silent.]\n\nListen.",
        flora_p10_3: "[A faint heartbeat begins beneath the ground.]\n\nThe earth is alive.",
        flora_p10_4: "[Tiny roots emerge around the sword.]\n\nYou watched me grow.",
        flora_p10_5: "[The roots rapidly spread across the battlefield.]\n\nBut you never watched where I was growing.",
        flora_p10_6: "[Massive trees erupt from the ground.]\n\nBeneath your feet.\nBeneath the mountains.",
        flora_p10_7: "[The entire environment becomes covered in vegetation.]\n\nInto places you thought nothing could reach.",
        flora_p10_8: "[The sword disappears beneath a colossal ancient tree.]\n\nYou cannot kill something...",
        flora_p10_9: "[The tree splits apart.]\n\n...that has already become everything.",
        flora_p10_10: "Cut me down.\nI will grow back.",
        hellfire_unlock_1: "Ten thousand souls consumed in the blazing furnace.",
        hellfire_unlock_2: "A tiny spark. That's all I need.",
        hellfire_unlock_3: "You wanted power? Then face the fire. Take me... and let everything burn.",
        hellfire_p10_1: "[The battlefield suddenly becomes silent.]\n\nYou have fed me.",
        hellfire_p10_2: "[Every flame in the area begins moving toward the sword.]\n\nEvery battle.\nEvery kill.\nEvery spark.",
        hellfire_p10_3: "[The flames violently spiral into the blade.]\n\nYou thought I was consuming them.",
        hellfire_p10_4: "[The sky turns dark red.]\n\nThey were feeding me.",
        hellfire_p10_5: "[The sword begins cracking.]\n\nAnd now...",
        hellfire_p10_6: "[Magma erupts from beneath the player.]\n\n...there is nothing left to contain me.",
        hellfire_p10_7: "[The sword explodes into black-red flames.]\n\nI AM NOT THE FLAME.",
        hellfire_p10_8: "[A gigantic infernal aura erupts across the battlefield.]\n\nI AM THE HELLFIRE.",
        hellfire_p10_9: "Run.",
        hint: "[SPACE] or Click to Continue",
        btn_skip: "SKIP [ESC]"
      },
      toasts: {
        entered_combat_title: "Entered Open Grassland",
        entered_combat_desc: "Strike stationary sentries in the feeding grounds!",
        weapon_locked_title: "WEAPON LOCKED",
        weapon_locked_desc: "Requires 1,250 Total Kills to equip Overdrive!",
        weapon_locked_req_desc: "Requires {req} Total Kills to equip {name}!",
        weapon_aquatic_locked_desc: "Requires 2,500 Total Kills to equip Aquatic!",
        weapon_soil_locked_desc: "Requires 3,500 Total Kills to equip Soil!",
        weapon_metallic_locked_desc: "Requires 5,000 Total Kills to equip Metallic!",
        weapon_flora_locked_desc: "Requires 7,000 Total Kills to equip Flora!",
        weapon_hellfire_locked_desc: "Requires 10,000 Total Kills to equip Hellfire!",
        aquatic_unlock_title: "WEAPON UNLOCKED",
        aquatic_unlock_desc: "Aquatic — The Drowning Tide is now available!",
        aquatic_p13_title: "MAXIMUM TRANSCENDENCE",
        aquatic_p13_desc: "Phase 13: Omnitidal — Primordial ocean divinity reached!",
        soil_unlock_title: "WEAPON UNLOCKED",
        soil_unlock_desc: "Soil — The Indestructible Fortress is now available!",
        soil_p10_title: "INDESTRUCTIBLE FORTRESS",
        soil_p10_desc: "Phase 10: Soil — Indestructible Fortress transformation complete!",
        metallic_unlock_title: "WEAPON UNLOCKED",
        metallic_unlock_desc: "Metallic — The Forged Will is now available!",
        metallic_p10_title: "ETERNAL STEEL",
        metallic_p10_desc: "Phase 10: Metallic — Eternal Steel forged!",
        flora_unlock_title: "WEAPON UNLOCKED",
        flora_unlock_desc: "Flora — The Evergrowth is now available!",
        flora_p10_title: "THE EVERGROWTH",
        flora_p10_desc: "Phase 10: Flora — The Evergrowth blooms!",
        hellfire_unlock_title: "WEAPON UNLOCKED",
        hellfire_unlock_desc: "Hellfire — The Infernal is now available!",
        hellfire_p10_title: "THE INFERNAL",
        hellfire_p10_desc: "Phase 10: Hellfire — The Infernal unleashed!",
        overdrive_up_title: "OVERDRIVE PHASE UP",
        overdrive_up_desc: "Reached {name}",
        aquatic_up_title: "AQUATIC DELUGE",
        aquatic_up_desc: "Reached {name}",
        soil_up_title: "SOIL FORTITUDE",
        soil_up_desc: "Reached {name}",
        metallic_up_title: "STEEL TEMPERED",
        metallic_up_desc: "Reached {name}",
        flora_up_title: "EVERGROWTH SPREADS",
        flora_up_desc: "Reached {name}",
        hellfire_up_title: "INFERNAL BLAZE",
        hellfire_up_desc: "Reached {name}",
        devourer_up_title: "DEVOURER AWAKENED",
        devourer_up_desc: "PHASE: {name}",
        achievement_unlocked_title: "Achievement Unlocked!",
        sword_equipped_title: "{name} Equipped",
        sword_equipped_desc: "Ready to fight in the grassland.",
        sword_unequipped_title: "Sword Unequipped",
        sword_unequipped_desc: "Returned to weapon pedestal.",
        save_reset_title: "Save Reset",
        save_reset_desc: "All progress has been reset.",
        invalid_amount_title: "Invalid Amount",
        invalid_amount_desc: "Total kills must be 0 or positive.",
        invalid_input_title: "Invalid Input",
        invalid_input_desc: "Please enter a killstreak amount.",
        invalid_streak_title: "Invalid Killstreak",
        invalid_streak_desc: "Killstreak must be 0 or positive.",
        dev_mode_title: "Developer Mode",
        dev_mode_desc: "Access granted. Debug controls available.",
        debug_kills_add_title: "Debug: Total Kills Added",
        debug_kills_add_desc: "Added +{count} Total Kills (Total: {total})",
        debug_kills_set_title: "Debug: Total Kills Set",
        debug_kills_set_desc: "Total Kills set to {count}",
        debug_streak_set_title: "Debug: Killstreak Set",
        debug_streak_set_desc: "Current sword killstreak set to {val}",
        debug_badge_title: "Debug: Badge Granted",
        debug_badges_title: "Debug: Badges Granted",
        debug_badges_desc: "Granted {count} badge(s). All achievements unlocked.",
        debug_badges_all_unlocked: "All achievements are already unlocked."
      },
      maps: {
        LOBBY: "Sanctuary Lobby",
        COMBAT: "Open Grassland",
        portal_combat: "ENTER GRASSLAND",
        portal_lobby: "RETURN TO LOBBY",
        pedestal_overdrive_locked: "OVERDRIVE (LOCKED)",
        pedestal_overdrive_req: "[ 1,250 TOTAL KILLS REQUIRED ]",
        pedestal_aquatic_locked: "AQUATIC (LOCKED)",
        pedestal_aquatic_req: "[ 2,500 TOTAL KILLS REQUIRED ]",
        pedestal_soil_locked: "SOIL (LOCKED)",
        pedestal_soil_req: "[ 3,500 TOTAL KILLS REQUIRED ]",
        pedestal_metallic_locked: "METALLIC (LOCKED)",
        pedestal_metallic_req: "[ 5,000 TOTAL KILLS REQUIRED ]",
        pedestal_flora_locked: "FLORA (LOCKED)",
        pedestal_flora_req: "[ 7,000 TOTAL KILLS REQUIRED ]",
        pedestal_hellfire_locked: "HELLFIRE (LOCKED)",
        pedestal_hellfire_req: "[ 10,000 TOTAL KILLS REQUIRED ]"
      },
      map: {
        modal_tag: "TACTICAL NAVIGATION",
        full_title: "🗺️ WORLD MAP",
        player_coords_label: "COORDINATES:",
        legend_player: "Player",
        legend_zone: "NPC Zones",
        hint: "Drag to pan • Scroll to zoom • Hover zone for info",
        btn_close: "Close [Esc / M]"
      },
      zones: {
        zone_north: "NORTH FEEDING GROUND",
        zone_south: "SOUTH FEEDING GROUND",
        zone_fairy_north: "NORTH FAIRY GROVE",
        zone_fairy_south: "SOUTH FAIRY GROVE",
        zone_thug_camp: "THUG CAMP",
        zone_guard: "GUARD OUTPOST",
        zone_swordman: "SWORDMAN BARRACKS",
        zone_buff_man: "BUFF MAN ARENA",
        zone_elf: "ELF SANCTUARY",
        zone_ironborn: "IRONBORN CAMP",
        zone_bloodfang: "BLOODFANG GROUNDS",
        zone_arcanist: "ARCANIST GROVE",
        zone_colossus: "COLOSSUS FIELD",
        zone_starforged: "STARFORGED RUINS",
        zone_grizzlehorn: "GRIZZLEHORN CRAGS",
        zone_brambleback: "BRAMBLEBACK THICKET",
        zone_embermane: "EMBERMANE RIDGE",
        zone_duskhorn: "DUSKHORN EXPANSE",
        zone_mirewalker: "MIREWALKER MARSH",
        zone_thunderhoof: "THUNDERHOOF STEPPES",
        zone_gloomscale: "GLOOMSCALE HOLLOW",
        zone_wildtusk: "WILDTUSK GLADE",
        zone_moonmane: "MOONMANE PLATEAU",
        zone_crimsonhide: "CRIMSONHIDE BADLANDS",
        unit_active_format: "Active {unit}: {count}/{max}",
        unit_sentry: "Sentries [100 HP • 1 Streak]",
        unit_fairy: "Fairies [250 HP • 2 Streak]",
        unit_thug: "Thugs [750 HP • 5 Streak]",
        unit_guard: "Guards [2,000 HP • 10 Streak]",
        unit_swordman: "Swordmen [4,500 HP • 20 Streak]",
        unit_buff_man: "Buff Men [10,000 HP • 50 Streak]",
        unit_elf: "Elves [15,275 HP • 100 Streak]",
        unit_ironborn: "Ironborn [28,000 HP • 150 Streak]",
        unit_bloodfang: "Bloodfangs [45,000 HP • 200 Streak]",
        unit_arcanist: "Arcanists [72,000 HP • 300 Streak]",
        unit_colossus: "Colossi [110,000 HP • 450 Streak]",
        unit_starforged: "Starforged [190,000 HP • 650 Streak]",
        unit_grizzlehorn: "Grizzlehorns [300,000 HP • 850 Streak]",
        unit_brambleback: "Bramblebacks [475,000 HP • 1,200 Streak]",
        unit_embermane: "Embermanes [750,000 HP • 1,750 Streak]",
        unit_duskhorn: "Duskhorns [1,150,000 HP • 2,500 Streak]",
        unit_mirewalker: "Mirewalkers [1,800,000 HP • 3,600 Streak]",
        unit_thunderhoof: "Thunderhoofs [2,800,000 HP • 5,000 Streak]",
        unit_gloomscale: "Gloomscales [4,300,000 HP • 7,000 Streak]",
        unit_wildtusk: "Wildtusks [6,700,000 HP • 10,000 Streak]",
        unit_moonmane: "Moonmanes [10,500,000 HP • 14,500 Streak]",
        unit_crimsonhide: "Crimsonhides [17,000,000 HP • 21,000 Streak]"
      },
      npcs: {
        normal: { name: "Normal Sentry", desc: "Basic stationary sentry defending feeding grounds." },
        fairy: { name: "Fairy", desc: "Small winged woodland sprite with evasive fluttering." },
        thug: { name: "Thug", desc: "Aggressive bandit patrol wielding crude daggers." },
        guard: { name: "Guard", desc: "Heavily armored royal sentry defending outer encampments." },
        swordman: { name: "Swordman", desc: "Disciplined blademaster executing swift thrusts and parries." },
        buff_man: { name: "Buff Man", desc: "Imposing brawny powerhouse capable of delivering staggering blows." },
        elf: { name: "Elf", desc: "Agile woodland sniper wielding mystical bows." },
        ironborn: { name: "Ironborn", desc: "Forged in subterranean depths, boasting reinforced metallic plating." },
        bloodfang: { name: "Bloodfang", desc: "Fierce lupine predators driven by predatory bloodlust." },
        arcanist: { name: "Arcanist", desc: "Mystic spellcaster channeling raw arcane volatility." },
        colossus: { name: "Colossus", desc: "Ancient monolithic titan of primordial stone." },
        starforged: { name: "Starforged", desc: "Cosmic construct forged from fallen astral debris." },
        grizzlehorn: { name: "Grizzlehorn", desc: "Heavily plated beast with sweeping bronze armor horns." },
        brambleback: { name: "Brambleback", desc: "Spiny briar beast bristling with toxic radial thorns." },
        embermane: { name: "Embermane", desc: "Ferocious flaming feline entity radiating intense volcanic heat." },
        duskhorn: { name: "Duskhorn", desc: "Twilight beast crowned with long crystalline obsidian horns." },
        mirewalker: { name: "Mirewalker", desc: "Deep-marsh cyclopean wanderer enveloped in toxic spores." },
        thunderhoof: { name: "Thunderhoof", desc: "Crackling storm-beast discharging lethal electric arcs." },
        gloomscale: { name: "Gloomscale", desc: "Abyssal serpentine dragon cloaked in shadowy layered void scales." },
        wildtusk: { name: "Wildtusk", desc: "Prehistoric dread-boar armed with razor-sharp war tusks." },
        moonmane: { name: "Moonmane", desc: "Celestial astral guardian radiating pure celestial lunar luminescence." },
        crimsonhide: { name: "Crimsonhide", desc: "Apocalyptic apex behemoth encased in blood-crystalline dragon carapace." }
      },
      swords: {
        devourer: {
          name: "Devourer",
          tag: "FIRST WEAPON",
          description: "An insatiable predatory blade that consumes enemy essence to empower its wielder, progressing across 17 phases up to 75,000 killstreak."
        },
        overdrive: {
          name: "Overdrive",
          tag: "SPEED WEAPON",
          description: "A hyper-velocity speed blade with alternating white and crimson resonance. Progresses across 7 phases from a needle rapier into a divine godspeed katana, reaching 300 walk speed."
        },
        aquatic: {
          name: "Aquatic",
          tag: "EVOLUTIONARY DELUGE",
          description: "A liquid evolutionary blade that ascends from a harmless droplet into a planetary cataclysm across 13 phases, featuring the signature Tsunami skill."
        },
        soil: {
          name: "Soil",
          tag: "EARTHEN FORTRESS",
          description: "A defensive, HP-focused sword that gradually evolves from a crude dirt blade into an indestructible soil fortress across 10 phases. Features the Fortitude [Z] shield skill."
        },
        metallic: {
          name: "Metallic",
          tag: "THE FORGED WILL",
          description: "Born from raw metal and gradually forged into something that cannot bend or break. Unlocks the Iron Will [Z] hardening stance."
        },
        flora: {
          name: "Flora",
          tag: "THE EVERGROWTH",
          description: "A living sword that grows stronger through every battle, eventually becoming an embodiment of unstoppable natural growth. Features Worldroot [Z]."
        },
        hellfire: {
          name: "Hellfire",
          tag: "THE INFERNAL",
          description: "An infernal weapon that feeds on destruction and grows increasingly difficult to contain. Features Cataclysm [Z]."
        }
      },
      phases: {
        devourer: {
          1: {
            name: "Phase 1: Hunger",
            shortName: "Hunger",
            effects: "Basic bone steel edge. Base 5 DMG and 100 HP. Consumes essence from kills to scale in the active phase."
          },
          2: {
            name: "Phase 2: Feast",
            shortName: "Feast",
            effects: "Satiated edge. Base 18 DMG and 180 HP. Cleaves through flesh with hungry fervor."
          },
          3: {
            name: "Phase 3: Devourer",
            shortName: "Devourer",
            effects: "Awakened predatory entity. Base 32 DMG and 280 HP. Siphons life with abyssal resonance."
          },
          4: {
            name: "Phase 4: Voracity",
            shortName: "Voracity",
            effects: "Ravenous devouring fervor. Base 55 DMG and 450 HP. Blazes with scorching hunger."
          },
          5: {
            name: "Phase 5: Apex Maw",
            shortName: "Apex Maw",
            effects: "Apex dominance. Base 95 DMG and 750 HP with wide sweeping 180° cleaves."
          },
          6: {
            name: "Phase 6: World Eater",
            shortName: "World Eater",
            effects: "The cosmic calamity. Base 160 DMG and 1,200 HP. Consumes matter across extensive sweeping arcs."
          },
          7: {
            name: "Phase 7: Cosmic Calamity",
            shortName: "Cosmic Calamity",
            effects: "Galactic essence consumed. Base 260 DMG and 1,800 HP. Broad cleaves tear cosmic rifts."
          },
          8: {
            name: "Phase 8: Void Singularity",
            shortName: "Void Singularity",
            effects: "Bottomless hunger event horizon. Base 400 DMG and 2,600 HP with crushing void pull."
          },
          9: {
            name: "Phase 9: Starved Husk",
            shortName: "Starved Husk",
            effects: "A burned-out, starving husk. Senses dim to base 40 DMG, 58 HP, and 17 SPD. Requires exactly +250 kills to awaken."
          },
          10: {
            name: "Phase 10: Ascended Behemoth",
            shortName: "Ascended Behemoth",
            effects: "Cataclysmic resurrection! Base 650 DMG and 4,000 HP. Unlocks Gluttony [Z] forward energy beam."
          },
          11: {
            name: "Phase 11: Cosmic Devourer",
            shortName: "Cosmic Devourer",
            effects: "The cosmic devourer awakens. Base 1,000 DMG, 6,000 HP, and 126 speed with sweeping solar cleaves."
          },
          12: {
            name: "Phase 12: Abyssal Sovereign",
            shortName: "Abyssal Sovereign",
            effects: "Sovereign of the deep abyss. Massive flanged dual-edged blade inflicting base 1,550 devastation damage and 9,000 HP."
          },
          13: {
            name: "Phase 13: Singularity Core",
            shortName: "Singularity Core",
            effects: "Gravitational event horizon. Orbiting black hole core dealing base 2,300 void damage and 13,500 HP across wide arcs."
          },
          14: {
            name: "Phase 14: Eldritch Eclipse",
            shortName: "Eldritch Eclipse",
            effects: "Twin-horned solar eclipse scythe. Burns through enemy ranks with base 3,400 incinerating damage and 19,000 HP."
          },
          15: {
            name: "Phase 15: Cosmic Oblivion",
            shortName: "Cosmic Oblivion",
            effects: "Transcendent astral constellation blade. Base 4,800 DMG and 25,000 HP shattering reality."
          },
          16: {
            name: "Phase 16: Ashen Dormancy",
            shortName: "Ashen Dormancy",
            effects: "Transitional slumber before final ascension. Senses dull to base 138 DMG and 345 HP. Requires exactly +1,000 kills to reach the apex."
          },
          17: {
            name: "Phase 17: The All Devourer",
            shortName: "The All Devourer",
            effects: "FINAL TRANSFORMATION. The absolute zenith of existence. Base 6,500 DMG, 30,000 HP, divine aura, and permanent All Devourer badge. Unlocks Engulf [X]."
          }
        },
        overdrive: {
          1: {
            name: "Phase 1: Quick Silver",
            shortName: "Quick Silver",
            effects: "Slender white needle rapier with crimson accents. Base 8 DMG, 120 HP, and 50 SPD.",
            notification: "The needle stirs with kinetic potential."
          },
          2: {
            name: "Phase 2: Velocity Sting",
            shortName: "Velocity Sting",
            effects: "Enhanced crimson velocity rapier with rapid acceleration. Base 24 DMG, 260 HP, and 80 SPD.",
            notification: "Feel the acceleration."
          },
          3: {
            name: "Phase 3: Sonic Piercer",
            shortName: "Sonic Piercer",
            effects: "Elaborate sonic rapier whistling past the sound barrier. Base 65 DMG, 550 HP, and 115 SPD.",
            notification: "Faster than the eye can follow."
          },
          4: {
            name: "Phase 4: Tachyon Edge",
            shortName: "Tachyon Edge",
            effects: "Transitional tachyon speed blade warping perception. Base 180 DMG, 1,400 HP, and 155 SPD.",
            notification: "The world begins to slow."
          },
          5: {
            name: "Phase 5: Flash Katana",
            shortName: "Flash Katana",
            effects: "Katana transformation! Slashing arcs of white lightning. Base 650 DMG, 4,500 HP, and 200 SPD.",
            notification: "Steel flashes like crimson lightning."
          },
          6: {
            name: "Phase 6: Godspeed Blade",
            shortName: "Godspeed Blade",
            effects: "Advanced fancy katana shattering the sonic threshold. Base 2,100 DMG, 12,000 HP, and 250 SPD.",
            notification: "Reality fractures beneath the sonic wake."
          },
          7: {
            name: "Phase 7: Apex Godspeed",
            shortName: "Apex Godspeed",
            effects: "FINAL OVERDRIVE TRANSFORMATION. Majestic divine-speed katana. Base 5,500 DMG, 25,500 HP, and 300 SPD.",
            notification: "You have become the speed beyond gods."
          }
        },
        aquatic: {
          1: {
            name: "Phase 1: Droplet",
            shortName: "Droplet",
            effects: "A single trembling water drop upon the blade. Base 15 DMG and 150 HP.",
            notification: "A single drop rests upon the blade."
          },
          2: {
            name: "Phase 2: Ripple",
            shortName: "Ripple",
            effects: "Water begins circulating with momentum. Produces circular ripples on hit.",
            notification: "The water moves."
          },
          3: {
            name: "Phase 3: Stream",
            shortName: "Stream",
            effects: "A fluid stream flows around the blade. Leaves short water trails on swing.",
            notification: "The ripple becomes a stream."
          },
          4: {
            name: "Phase 4: Current",
            shortName: "Current",
            effects: "Accelerated current with cyan edge and white core. Water spirals with purpose.",
            notification: "The stream finds its current."
          },
          5: {
            name: "Phase 5: Undertow",
            shortName: "Undertow",
            effects: "Constant water vortex underneath player. Base 300 DMG and 3,500 HP.",
            notification: "Beneath the surface... something pulls."
          },
          6: {
            name: "Phase 6: Maelstrom",
            shortName: "Maelstrom",
            effects: "Dual rotating water rings and swirling vortex consuming matter. Base 550 DMG and 6,000 HP.",
            notification: "The current begins to spiral."
          },
          7: {
            name: "Phase 7: Deep",
            shortName: "Deep",
            effects: "Deep abyssal pressure. Wet trail while moving and crushing dark water aura. Base 900 DMG and 9,000 HP.",
            notification: "You have reached the deep."
          },
          8: {
            name: "Phase 8: Drought",
            shortName: "Drought",
            effects: "POWER COLLAPSE. Senses dim to 30 DMG and 300 HP. Droplets evaporate. Requires +750 kills to awaken.",
            notification: "The ocean falls silent."
          },
          9: {
            name: "Phase 9: Flood",
            shortName: "Flood",
            effects: "VIOLENT ERUPTION! Base 2,000 DMG and 15,000 HP. Unlocks signature skill: TSUNAMI [Z] (4x DMG = 8,000).",
            notification: "The silence breaks. THE FLOOD HAS BEGUN."
          },
          10: {
            name: "Phase 10: Monsoon",
            shortName: "Monsoon",
            effects: "Storm generator. Rain particles fall from the sky. Base 4,000 DMG, 25,000 HP. Tsunami deals 16,000 DMG.",
            notification: "One wave becomes a storm. THE MONSOON RISES."
          },
          11: {
            name: "Phase 11: Cataclysm",
            shortName: "Cataclysm",
            effects: "The sea escapes its boundaries. Camera shake on attacks. Base 7,000 DMG, 38,000 HP. Tsunami deals 28,000 DMG.",
            notification: "The sea has escaped its boundaries. CATACLYSM."
          },
          12: {
            name: "Phase 12: Leviathan",
            shortName: "Leviathan",
            effects: "Ancient leviathan silhouette manifests behind wielder. Base 11,500 DMG, 50,000 HP. Tsunami deals 46,000 DMG.",
            notification: "Something beneath the ocean awakens. THE LEVIATHAN RISES."
          },
          13: {
            name: "Phase 13: Omnitidal",
            shortName: "Omnitidal",
            effects: "FINAL TRANSFORMATION: WALKING NATURAL DISASTER. Base 18,000 DMG, 62,000 HP. Tsunami deals 72,000 cataclysmic damage.",
            notification: "There is no ocean left to conquer. Because you have become it. OMNITIDAL."
          }
        },
        soil: {
          1: {
            name: "Phase 1: Dirt Blade",
            shortName: "Dirt Blade",
            effects: "Crude blade pressed from moist topsoil. Base 3 DMG, 250 HP, and 10 SPD.",
            notification: "You hold me, weak and crumbling. But inside... there is a seed."
          },
          2: {
            name: "Phase 2: Packed Earth",
            shortName: "Packed Earth",
            effects: "Densely packed soil bonded with roots. Base 15 DMG, 800 HP, and 15 SPD.",
            notification: "The roots tighten. I will not let anything reach you."
          },
          3: {
            name: "Phase 3: Clay Shard",
            shortName: "Clay Shard",
            effects: "Sun-baked earthen edge with hardened clay ridges. Base 50 DMG, 2,200 HP, and 21 SPD.",
            notification: "The heat bakes us solid. You are safe behind me."
          },
          4: {
            name: "Phase 4: Loam Edge",
            shortName: "Loam Edge",
            effects: "Ancient compacted soil with active mineral veins. Base 150 DMG, 5,500 HP, and 28 SPD. Unlocks Fortitude [Z] shield barrier.",
            notification: "Drink from the earth! Stand your ground — I am your shield!"
          },
          5: {
            name: "Phase 5: Stoneheart",
            shortName: "Stoneheart",
            effects: "Heavy petrified soil blade fused with granite veins. Base 400 DMG, 13,000 HP, and 36 SPD.",
            notification: "Let them strike. Every blow only presses the soil firmer."
          },
          6: {
            name: "Phase 6: Terrene Bastion",
            shortName: "Terrene Bastion",
            effects: "Layered tectonic edge humming with seismic density. Base 950 DMG, 28,000 HP, and 47 SPD.",
            notification: "A fortress is not built in a day. We are the foundation."
          },
          7: {
            name: "Phase 7: Bedrock Cleaver",
            shortName: "Bedrock Cleaver",
            effects: "Unyielding mantle bedrock blade wrapped in stone runes. Base 2,100 DMG, 58,000 HP, and 60 SPD.",
            notification: "Bedrock does not break. Neither do we."
          },
          8: {
            name: "Phase 8: Mountain's Will",
            shortName: "Mountain's Will",
            effects: "Towering monolithic soil fortress with orbiting bedrock bulwarks. Base 4,200 DMG, 115,000 HP, and 76 SPD.",
            notification: "Nothing moves the mountain. Stand fast, my treasure."
          },
          9: {
            name: "Phase 9: Crumbling Husk",
            shortName: "Crumbling Husk",
            effects: "DELIBERATE COLLAPSE. Soil sheds its heavy shell, cracking down to base 135 DMG, 5,000 HP, and 96 SPD. Endure 40,000 kills to reveal the core.",
            notification: "Wait... the outer layers are falling away... hold on, trust me, DO NOT LET GO—"
          },
          10: {
            name: "Phase 10: Indestructible Soil Fortress",
            shortName: "Soil Fortress",
            effects: "FINAL TRANSFORMATION. The ultimate continental bulwark. Base 8,500 DMG, 315,000 HP, and 120 SPD. Grants permanent Indestructible Soil Fortress badge.",
            notification: "THE SEED HAS SPROUTED. I AM THE FORTRESS. NOTHING CAN HARM MY TREASURE NOW."
          }
        },
        metallic: {
          1: {
            name: "Phase 1: Scrap",
            shortName: "Scrap",
            effects: "A crude discarded metal shard. Base 5 DMG and 180 HP.",
            notification: "I was discarded once. Now, I have another purpose."
          },
          2: {
            name: "Phase 2: Forged",
            shortName: "Forged",
            effects: "The metal has passed through intense forge fire. Base 22 DMG and 650 HP.",
            notification: "The heat changed me. I will not remain weak."
          },
          3: {
            name: "Phase 3: Tempered",
            shortName: "Tempered",
            effects: "Hammered and water-quenched crystalline steel forms. Base 70 DMG and 1,800 HP.",
            notification: "Every strike leaves a mark. Every mark makes me harder."
          },
          4: {
            name: "Phase 4: Steelbound",
            shortName: "Steelbound",
            effects: "Solid steel plating. Unlocks Iron Will [Z] (40% DMG reduction & retaliatory shrapnel for 6s). Base 200 DMG and 4,800 HP.",
            notification: "I have learned to endure. Strike me again."
          },
          5: {
            name: "Phase 5: Reinforced",
            shortName: "Reinforced",
            effects: "Layered steel laminated across the spine. Base 480 DMG and 11,000 HP.",
            notification: "Another layer. Another weakness removed. I am becoming stronger."
          },
          6: {
            name: "Phase 6: Hardened",
            shortName: "Hardened",
            effects: "Unmatched metallurgical density under crushing pressure. Base 1,000 DMG and 24,000 HP.",
            notification: "Pressure does not frighten me. Pressure creates me."
          },
          7: {
            name: "Phase 7: Forgemaster",
            shortName: "Forgemaster",
            effects: "The blade commands the ancient fire and anvil. Base 2,100 DMG and 50,000 HP.",
            notification: "The earth gave me my material. The forge gave me my purpose."
          },
          8: {
            name: "Phase 8: Iron Fortress",
            shortName: "Iron Fortress",
            effects: "Bastion plating encases the user in unyielding armor. Base 4,200 DMG and 110,000 HP.",
            notification: "I no longer need a shield. I am the shield."
          },
          9: {
            name: "Phase 9: Unyielding",
            shortName: "Unyielding",
            effects: "Impervious to any force that attempts to bend or break it. Base 7,500 DMG and 210,000 HP.",
            notification: "You cannot bend me. You cannot break me."
          },
          10: {
            name: "Phase 10: Eternal Steel",
            shortName: "Eternal Steel",
            effects: "FINAL TRANSFORMATION: ETERNAL STEEL. Monolithic, perfectly refined divine blade. Base 11,500 DMG, 360,000 HP, and 125 SPD.",
            notification: "I do not bend. I do not break. I endure."
          }
        },
        flora: {
          1: {
            name: "Phase 1: Sprout",
            shortName: "Sprout",
            effects: "A fragile yet resilient living sprout blade. Base 4 DMG and 220 HP.",
            notification: "I was only a seed. Even seeds know how to survive."
          },
          2: {
            name: "Phase 2: Rooted",
            shortName: "Rooted",
            effects: "Fibrous roots anchor the blade directly to the soil. Base 18 DMG and 750 HP.",
            notification: "My roots are spreading. I am beginning to take hold."
          },
          3: {
            name: "Phase 3: Growing",
            shortName: "Growing",
            effects: "Vigorous woody stems wrap tightly around the blade spine. Base 60 DMG and 2,100 HP.",
            notification: "Every battle feeds me. Every victory makes me grow."
          },
          4: {
            name: "Phase 4: Thorned",
            shortName: "Thorned",
            effects: "Vicious briar thorns line the cutting edge. Unlocks Worldroot [Z] (Entangles foes and regenerates 20% max HP). Base 180 DMG and 5,600 HP.",
            notification: "Growth alone is not enough. Even flowers need thorns."
          },
          5: {
            name: "Phase 5: Wild",
            shortName: "Wild",
            effects: "Uninhibited wild jungle flora surges with primordial vitality. Base 440 DMG and 13,000 HP.",
            notification: "You call this overgrowth? I have barely begun."
          },
          6: {
            name: "Phase 6: Ancient",
            shortName: "Ancient",
            effects: "Millennia of arboreal memory hardens the blade into ironwood. Base 950 DMG and 28,000 HP.",
            notification: "I have survived countless seasons. You will not outlast me."
          },
          7: {
            name: "Phase 7: Overgrown",
            shortName: "Overgrown",
            effects: "Canopies of living foliage expand from the blade across the ground. Base 2,000 DMG and 60,000 HP.",
            notification: "The ground beneath you belongs to me. You simply haven't noticed yet."
          },
          8: {
            name: "Phase 8: Colossus",
            shortName: "Colossus",
            effects: "A colossal arboreal titan blade radiating ancient planetary vitality. Base 4,000 DMG and 130,000 HP.",
            notification: "I have grown beyond a sword. I am becoming something greater."
          },
          9: {
            name: "Phase 9: Worldroot",
            shortName: "Worldroot",
            effects: "The planetary root system pulses through the blade. Base 7,800 DMG and 240,000 HP.",
            notification: "My roots have reached farther than you can see. Where there is soil, I am there."
          },
          10: {
            name: "Phase 10: Evergrowth",
            shortName: "Evergrowth",
            effects: "FINAL TRANSFORMATION: EVERGROWTH. Planetary embodiment of unstoppable nature. Base 12,000 DMG, 400,000 HP, and 130 SPD.",
            notification: "Cut me down. I will grow back."
          }
        },
        hellfire: {
          1: {
            name: "Phase 1: Ember",
            shortName: "Ember",
            effects: "A smoldering ember clinging to charcoal steel. Base 7 DMG and 140 HP.",
            notification: "A tiny spark. That's all I need."
          },
          2: {
            name: "Phase 2: Flame",
            shortName: "Flame",
            effects: "Steady infernal fire coats the blade spine. Base 28 DMG and 500 HP.",
            notification: "Now I burn. Give me something to consume."
          },
          3: {
            name: "Phase 3: Blazing",
            shortName: "Blazing",
            effects: "Violent flames crackle outward with every swipe. Base 90 DMG and 1,500 HP.",
            notification: "Every kill feeds the flame. Keep them coming."
          },
          4: {
            name: "Phase 4: Infernal",
            shortName: "Infernal",
            effects: "Infernal hellfire bursts across the blade. Unlocks Cataclysm [Z] (Magma eruption dealing 5x DMG). Base 260 DMG and 4,200 HP.",
            notification: "You wanted power? Then face the fire."
          },
          5: {
            name: "Phase 5: Hellborn",
            shortName: "Hellborn",
            effects: "Deep volcanic runes ignite along obsidian steel. Base 650 DMG and 10,000 HP.",
            notification: "The flames know my name. Do you?"
          },
          6: {
            name: "Phase 6: Magma",
            shortName: "Magma",
            effects: "Liquid magma seeps from molten fissures in the sword. Base 1,400 DMG and 22,000 HP.",
            notification: "My fire has reached the earth. Now even the ground burns."
          },
          7: {
            name: "Phase 7: Devastation",
            shortName: "Devastation",
            effects: "Total incendiary erasure of all matter before the wielder. Base 2,800 DMG and 48,000 HP.",
            notification: "I no longer burn what stands before me. I erase it."
          },
          8: {
            name: "Phase 8: Cataclysm",
            shortName: "Cataclysm",
            effects: "Hellfire storm encircles the sword; nowhere is safe. Base 5,600 DMG and 100,000 HP.",
            notification: "Look around. There is nowhere left to run."
          },
          9: {
            name: "Phase 9: Apocalypse",
            shortName: "Apocalypse",
            effects: "The blade roars with the burning heat of an ending universe. Base 10,500 DMG and 190,000 HP.",
            notification: "Do you hear that? That's the sound of everything burning."
          },
          10: {
            name: "Phase 10: Hellfire",
            shortName: "The Infernal",
            effects: "FINAL TRANSFORMATION: THE INFERNAL. Uncontainable world-ending inferno. Base 16,800 DMG, 320,000 HP, and 145 SPD.",
            notification: "Run."
          }
        }
      },
      bloodmoon: {
        title: "BLOODMOON",
        subtitle: "The crimson moon rises — darkness descends upon the grassland!"
      }
    },
    vi: {

      menu: {
        title: "KILLSTREAK",
        play: "CHƠI",
        library: "THƯ VIỆN",
        achievements: "THÀNH TỰU",
        settings: "CÀI ĐẶT",
        return_lobby: "QUAY VỀ SẢNH",
        controls_footer: "Di chuyển: WASD / Phím Mũi Tên • Ngắm: Chuột • Tấn công: Chuột Trái / Phím Cách"
      },
      hud: {
        hp: "MÁU",
        dmg_tag: "⚔️ {damage} SÁT THƯƠNG",
        no_sword: "🛡️ CHƯA TRANG BỊ KIẾM",
        scale_streak: "Cơ bản: {dmg} Sát thương • {hp} Máu (+{streak} chuỗi)",
        scale_base: "Cơ bản: {dmg} Sát thương • {hp} Máu",
        unequipped: "Chưa trang bị",
        killstreak: "CHUỖI HẠ GỤC",
        kills: "MẠNG HẠ GỤC",
        phase_prefix: "GIAI ĐOẠN: {name}",
        unequipped_caps: "CHƯA TRANG BỊ",
        no_sword_caps: "CHƯA CÓ KIẾM",
        area_prefix: "KHU VỰC: {name}",
        stats_btn: "📊 THỐNG KÊ",
        stats_btn_title: "Xem bảng thống kê",
        library_btn: "📖 THƯ VIỆN",
        library_btn_title: "Mở thư viện tra cứu",
        lobby_btn: "🏠 SẢNH",
        lobby_btn_title: "Quay về Sảnh Thánh Địa",
        menu_btn: "MENU [ESC]",
        menu_btn_title: "Tạm dừng / Menu",
        debug_streak_label: "Debug Chuỗi Hạ Gục:",
        debug_streak_placeholder: "số lượng",
        debug_apply_btn: "ÁP DỤNG"
      },
      skills: {
        gluttony_label: "[ Z — PHÀM ĂN ]",
        gluttony_title: "Phàm Ăn [Z] — Tia năng lượng công phá (Giai đoạn 10+)",
        engulf_label: "[ X — NUỐT CHỬNG ]",
        engulf_title: "Nuốt Chửng [X] — Hào quang hủy diệt Devourer (Giai đoạn 17)",
        fortitude_label: "[ Z — KIÊN CƯỜNG ]",
        fortitude_title: "Kiên Cường [Z] — Tạo khiên bằng 15% Máu hiện tại trong 5s (GĐ 4+, 20s hồi chiêu)",
        tsunami_label: "[ Z — SÓNG THẦN ]",
        tsunami_title: "Sóng Thần [Z] — Đợt sóng quét gây sát thương gấp 4 lần kiếm (GĐ 9+)",
        iron_will_label: "[ Z — Ý CHÍ THÉP ]",
        iron_will_title: "Ý Chí Thép [Z] — Giảm 46% sát thương nhận vào trong 6.9s và phản kích mảnh thép (GĐ 4+, 17s hồi chiêu)",
        worldroot_label: "[ Z — THẾ GIỚI CĂN ]",
        worldroot_title: "Thế Giới Căn [Z] — Gai rễ giam hãm kẻ địch trong 2.9s và hồi 23% Máu tối đa trong 4s (GĐ 4+, 19s hồi chiêu)",
        cataclysm_label: "[ Z — ĐẠI HỌA DIỆT THẾ ]",
        cataclysm_title: "Đại Họa Diệt Thế [Z] — Cắm kiếm bộc phát cột dung nham gây sát thương gấp 5.75 lần kiếm (GĐ 4+, 15.3s hồi chiêu)",
        locked_p4: "KHÓA (GĐ4)",
        locked_p9: "KHÓA (GĐ9)",
        locked_p10: "KHÓA (GĐ10)",
        locked_p17: "KHÓA (GĐ17)",
        locked: "ĐANG KHÓA",
        active: "ĐANG BẬT",
        ready: "SẴN SÀNG"
      },
      floating: {
        aquatic_unlocked: "ĐÃ MỞ KHÓA THỦY LINH!",
        soil_unlocked: "ĐÃ MỞ KHÓA ĐẤT MẸ!",
        soil_p10: "PHÁO ĐÀI BẤT DIỆT!",
        metallic_unlocked: "ĐÃ MỞ KHÓA Ý CHÍ KIM THÉP!",
        metallic_p10: "THÉP VĨNH HẰNG!",
        flora_unlocked: "ĐÃ MỞ KHÓA BÁCH THẢO!",
        flora_p10: "VẠN VẬT TÁI SINH!",
        hellfire_unlocked: "ĐÃ MỞ KHÓA ĐỊA NGỤC HỎA!",
        hellfire_p10: "CHÚA TỂ HỎA NGỤC!",
        all_devourer: "THE ALL DEVOURER THĂNG HOA!",
        fortitude: "KIÊN CƯỜNG!",
        tsunami: "SÓNG THẦN!",
        iron_will: "Ý CHÍ THÉP!",
        worldroot: "THẾ GIỚI CĂN!",
        cataclysm: "ĐẠI HỌA!",
        gluttony: "PHÀM ĂN!",
        engulf: "NUỐT CHỬNG!"
      },
      prompts: {
        inspect: "Khảo sát {sword} [E]",
        enter_grassland: "Vào Thảo Nguyên [E]",
        return_to_lobby: "Trở về Sảnh [E]",
        confirm_return_lobby: "Quay về Sảnh Thánh Địa? Chuỗi hạ gục hiện tại ({streak}) sẽ được đặt lại về 0."
      },
      pedestal: {
        tag: "BỆ VŨ KHÍ",
        weapon_label: "Vũ khí:",
        current_phase_label: "Giai đoạn hiện tại:",
        phase_desc: "GIAI ĐOẠN {phase}: {name} ({kills} CHUỖI HẠ GỤC)",
        phase_pedestal: "GIAI ĐOẠN {phase}: {name} (BỆ VŨ KHÍ)",
        phase_locked: "ĐANG KHÓA (CẦN {kills} MẠNG TÍCH LŨY)",
        base_stats_label: "Chỉ số cơ bản:",
        base_stats_val: "{damage} Sát thương • {hp} Máu",
        scaling_label: "Tăng tiến chuỗi:",
        scaling_val: "+{kills} Mạng giai đoạn{bonus}",
        scaling_pedestal: "+0 Mạng giai đoạn (Bệ vũ khí)",
        scaled_bonus: " (+{pct}% tăng tiến)",
        active_power_label: "Sức mạnh thực tế:",
        active_power_val: "{damage} Sát thương • {hp} Máu • {speed} Tốc độ • Tầm đánh: {reach}px",
        lock_hint: "🔒 Yêu cầu {req} Mạng tích lũy để trang bị (Hiện tại: {kills})",
        btn_equip: "TRANG BỊ",
        btn_equipped: "ĐÃ TRANG BỊ ✓",
        btn_switch: "CHUYỂN SANG {name}",
        btn_locked: "ĐANG KHÓA 🔒",
        btn_close: "Đóng [Esc]"
      },
      library: {
        tag: "KHO LƯU TRỮ THÁNH ĐỊA",
        title: "📖 THƯ VIỆN",
        subtitle: "Kho lưu trữ chính thức về các thanh kiếm đã biết, các giai đoạn biến đổi và huy hiệu đạt được.",
        tab_swords: "⚔️ VŨ KHÍ",
        tab_badges: "🏆 HUY HIỆU",
        tab_npcs: "👾 QUÁI VẬT",
        npc_count: "{count} SINH VẬT ĐÃ BIẾT",
        npc_sort_hint: "Sắp xếp từ Yếu nhất đến Mạnh nhất",
        stat_hp: "MÁU",
        stat_damage: "SÁT THƯƠNG",
        stat_attack_speed: "TỐC ĐỘ ĐÁNH",
        stat_streak: "CHUỖI",
        stat_kills: "MẠNG",
        stat_respawn: "HỒI SINH",
        stat_location: "KHU VỰC",
        tier_1: "BẬC I • TÂN THỦ",
        tier_2: "BẬC II • THÀNH THẠO",
        tier_3: "BẬC III • TINH ANH",
        tier_4: "BẬC IV • NGUY HIỂM",
        tier_5: "BẬC V • TỐI THƯỢNG",
        final_badge: "👑 BIẾN ĐỔI CUỐI CÙNG",
        transitional_hurdle: "GIAI ĐOẠN QUÁ ĐỘ",
        deliberate_collapse: "SỰ SỤP ĐỔ CÓ CHỦ ĐÍCH",
        speed_unit: "TỐC ĐỘ",
        req_streak: "Yêu cầu: {kills} Chuỗi hạ gục",
        active_scaled: "Tăng tiến thực tế: {damage} Sát thương • {hp} Máu (+{kills} mạng trong giai đoạn)",
        badge_unlocked: "ĐÃ MỞ",
        badge_locked: "ĐANG KHÓA",
        btn_close: "Đóng [Esc]"
      },
      achievements: {
        title: "🏆 Thành Tựu",
        subtitle: "Các cột mốc và vinh quang mở khóa trong các trận chiến của bạn.",
        btn_back: "Quay lại [Esc]",
        status_unlocked: "Đã mở khóa",
        status_locked: "Đang khóa",
        items: {
          getting_started: {
            title: "Khởi Đầu Nan",
            description: "Tham gia và bắt đầu hành trình của bạn cùng Devourer."
          },
          all_devourer: {
            title: "All Devourer",
            description: "Đánh dấu việc hoàn thành giai đoạn Devourer cuối cùng (75,000 chuỗi hạ gục)."
          },
          overdrive_ascended: {
            title: "Overdrive Thăng Hoa",
            description: "Mở khóa khi đạt đến giai đoạn cuối cùng của Overdrive (25,000 chuỗi hạ gục)."
          },
          aquatic_ascended: {
            title: "Aquatic Thăng Hoa",
            description: "Mở khóa khi đạt đến giai đoạn cuối cùng của Aquatic (145,000 chuỗi hạ gục)."
          },
          soil_ascended: {
            title: "Pháo Đài Thổ Nhưỡng Bất Diệt",
            description: "Mở khóa khi đạt đến giai đoạn cuối cùng của Soil (160,000 chuỗi hạ gục)."
          },
          metallic_ascended: {
            title: "Thép Vĩnh Hằng",
            description: "Mở khóa khi đạt đến giai đoạn cuối cùng của Metallic (198,000 chuỗi hạ gục)."
          },
          flora_ascended: {
            title: "Vạn Vật Sinh Sôi",
            description: "Mở khóa khi đạt đến giai đoạn cuối cùng của Flora (230,000 chuỗi hạ gục)."
          },
          hellfire_ascended: {
            title: "Hỏa Ngục Tuyệt Diệt",
            description: "Mở khóa khi đạt đến giai đoạn cuối cùng của Hellfire (264,375 chuỗi hạ gục)."
          }
        }
      },
      settings: {
        title: "Cài Đặt Trò Chơi",
        language: "Ngôn Ngữ",
        lang_en: "English",
        lang_vi: "Vietnamese",
        shake: "Hiệu Ứng Rung Màn Hình",
        damage_numbers: "Hiển Thị Sát Thương Bay",
        damage_taken: "Hiển Thị Sát Thương Nhận Vào",
        reset_title: "Đặt Lại Tiến Trình",
        reset_desc: "Xóa toàn bộ số mạng tích lũy, chuỗi hạ gục cao nhất và huy hiệu.",
        reset_btn: "Xóa Dữ Liệu Lưu",
        reset_confirm: "Đặt lại toàn bộ số mạng hạ gục tích lũy, chuỗi hạ gục cao nhất và các huy hiệu đã mở khóa?",
        btn_back: "Quay lại [Esc]"
      },
      debug: {
        auth_title: "Xác Thực Nhà Phát Triển",
        auth_desc: "Nhập mật khẩu ủy quyền để truy cập bảng điều khiển nhà phát triển.",
        password_placeholder: "Mật khẩu",
        unlock_btn: "Mở Khóa",
        error_msg: "Mật khẩu không đúng. Quyền truy cập bị từ chối.",
        title: "CHẾ ĐỘ DEBUG",
        status_on: "[ BẬT ]",
        status_off: "[ TẮT ]",
        set_add_kills: "⚡ Thiết Lập / Thêm Mạng (Chỉ Mạng Tích Lũy)",
        custom_placeholder: "Số lượng tùy chỉnh",
        add_kills_btn: "Thêm Mạng",
        set_total_btn: "Đặt Tổng Mạng",
        badge_actions: "🏆 Hành Động Huy Hiệu (Thành Tựu)",
        grant_all_btn: "Mở Khóa Mọi Huy Hiệu",
        grant_btn: "Cấp",
        granted_btn: "Đã Cấp",
        quick_add_kills: "+{n} Mạng"
      },
      stats: {
        title: "📊 Thống Kê Trò Chơi",
        subtitle: "Hồ sơ chiến đấu tích lũy và các chỉ số tiến trình.",
        total_playtime: "Tổng Thời Gian Chơi",
        total_kills: "Tổng Số Mạng",
        highest_streak: "Chuỗi Hạ Gục Cao Nhất",
        current_phase: "Giai Đoạn Hiện Tại",
        none_unequipped: "Không có (Chưa trang bị)",
        btn_back: "Quay lại [Esc]"
      },
      game_over: {
        title: "BẠN ĐÃ TỬ TRẬN",
        subtitle: "Chuỗi hạ gục của bạn đã kết thúc trên thảo nguyên.",
        streak_reached: "Chuỗi Đạt Được",
        weapon: "Vũ Khí",
        phase_reached: "Giai Đoạn Đạt Được",
        best_streak: "Chuỗi Kỷ Lục",
        btn_fight_again: "Tái Đấu [Phím Cách]",
        btn_return_lobby: "Trở Về Sảnh"
      },
      cutscene: {
        speaker_transcendence: "DEVOURER — SIÊU PHÀM",
        speaker_all_devourer: "THE ALL DEVOURER",
        speaker_spring: "SUỐI NGUỒN NGUYÊN THỦY",
        speaker_aquatic_unlock: "AQUATIC — THỦY TRIỀU NHẤN CHÌM",
        speaker_aquatic_p13: "AQUATIC — THỦY TRIỀU VÔ TẬN",
        speaker_ocean: "ĐẠI DƯƠNG NGUYÊN THỦY",
        speaker_core: "LÕI ĐỊA LINH",
        speaker_soil: "SOIL",
        speaker_soil_p10: "SOIL — GIAI ĐOẠN 10: PHÁO ĐÀI BẤT DIỆT",
        speaker_metallic: "METALLIC",
        speaker_metallic_p10: "METALLIC — GIAI ĐOẠN 10: THÉP VĨNH HẰNG",
        speaker_flora: "FLORA",
        speaker_flora_p10: "FLORA — GIAI ĐOẠN 10: VẠN VẬT TÁI SINH",
        speaker_hellfire: "HELLFIRE",
        speaker_hellfire_p10: "HELLFIRE — GIAI ĐOẠN 10: CHÚA TỂ HỎA NGỤC",
        dialogue_1: "Cơn đói vô tận thôi rung chuyển. Mọi sinh linh từng hít thở tại cõi này... đều đã bị nuốt trọn.",
        dialogue_2: "Bảy mươi lăm nghìn linh hồn đã dâng hiến bản nguyên để tôi luyện nên hình thái tối hậu này.",
        dialogue_3: "Lưỡi kiếm vượt thoát khỏi xác thịt phàm trần, xương tủy và sắt thép. Hiện thực đang cúi mình trước mệnh lệnh thiêng liêng của bạn.",
        dialogue_4: "HÃY CHIÊM NGƯỠNG — ĐỈNH CAO NUỐT CHỬNG ĐÃ HOÀN THÀNH. TA CHÍNH LÀ THE ALL DEVOURER.",
        aquatic_unlock_1: "Thuở ban sơ, chỉ có sự tĩnh lặng... cùng một giọt nước nhẹ rơi.",
        aquatic_unlock_2: "Hai nghìn năm trăm linh hồn đã ngã xuống. Bản nguyên của họ quy tụ thành cội nguồn đại dương.",
        aquatic_unlock_3: "Những gợn sóng tĩnh lặng đã bắt đầu chuyển mình. Hãy cầm lấy thanh kiếm... và để cơn đại hồng thủy bắt đầu.",
        aquatic_p13_1: "Các đại lục chìm sâu dưới vực thẳm vô tận và tàn khốc.",
        aquatic_p13_2: "Một trăm bốn mươi lăm nghìn sinh linh đã bị cuốn trôi vào ngọn triều vô tận.",
        aquatic_p13_3: "Mọi giọt nước trong cõi này giờ đây đáp lại từng nhịp đập của bạn. Giai đoạn 13 — Thủy Triều Vô Tận. Đại hồng thủy đã hoàn tất.",
        soil_unlock_1: "Sâu dưới lòng đất, những chiếc rễ cổ xưa bắt đầu thức tỉnh.",
        soil_unlock_2: "Ba nghìn năm trăm trận chiến đã nuôi dưỡng mảnh đất dưới chân bạn.",
        soil_unlock_3: "Ta... chỉ là bùn đất. Nhưng ta sẽ bảo vệ những gì có thể.",
        soil_unlock_4: "Hãy cầm lấy ta. Chúng ta sẽ cùng nhau đảm bảo không thứ gì có thể chạm tới kho báu của ngươi.",
        soil_p10_1: "[Màn hình tối dần trong giây lát.]\n\nNgươi nghĩ rằng ta đã gục ngã ư?",
        soil_p10_2: "[Lưỡi kiếm vỡ vụn chìm dần vào lòng đất.]\n\nKhông.\n\nTa chỉ quay trở về nơi ta bắt đầu.",
        soil_p10_3: "[Mặt đất bắt đầu rung chuyển. Những vết nứt lan rộng từ thanh kiếm.]\n\nTừng hạt đất...\nTừng mảnh vụn...\nTừng phần vỡ nát của ta...",
        soil_p10_4: "[Lớp đất vương vãi từ các giai đoạn trước bắt đầu bay lơ lửng về phía lưỡi kiếm.]\n\n...vẫn luôn là của ta.",
        soil_p10_5: "[Các tầng địa chất khổng lồ trồi lên từ mặt đất bao bọc lấy thanh kiếm.]\n\nTa đã dùng từng trận chiến để học cách kiên cường nhẫn nại.\nTừng thất bại đã dạy ta cách tái tạo bản thân.",
        soil_p10_6: "[Đất đá nhanh chóng nén chặt lại, trở nên dày đặc và sừng sững.]\n\nTa không còn là lớp bùn đất rời rạc.\nTa không còn chỉ là một lưỡi kiếm đơn thuần.",
        soil_p10_7: "[Toàn bộ cấu trúc bùng nổ thành một thanh cự kiếm tựa pháo đài khổng lồ.]\n\nTa chính là mặt đất dưới chân ngươi.\nLà bức tường thành chắn giữa kho báu của ngươi và mọi kẻ thù toan tính cướp đoạt.",
        soil_p10_8: "[Pháo đài chìm vào sự tĩnh lặng tuyệt đối.]\n\nĐến đây.\nHãy tự đập tan chính mình trước ta.",
        soil_p10_9: "Chừng nào ta còn đứng vững...\nKho báu của ngươi sẽ không bao giờ bị cướp đoạt.",
        metallic_unlock_1: "Tàn tro của năm nghìn trận chiến nung nóng chiếc đe rèn cổ đại.",
        metallic_unlock_2: "Ta từng bị vứt bỏ một lần. Sắt vụn. Phế liệu. Giờ đây, ta mang một sứ mệnh khác.",
        metallic_unlock_3: "Hãy cầm lấy thanh kiếm. Chúng ta sẽ cùng tôi luyện một ý chí không thể uốn cong hay gãy vỡ.",
        metallic_p10_1: "[Thanh kiếm nằm sâu trong một lò rèn khổng lồ.]\n\nTa còn nhớ thuở ta chỉ là hư vô.",
        metallic_p10_2: "[Lò rèn bùng cháy dữ dội.]\n\nSắt vụn. Phế liệu. Thứ chỉ đáng bị vứt bỏ.",
        metallic_p10_3: "[Lưỡi kiếm bắt đầu tan chảy.]\n\nHọ tin rằng ngọn lửa sẽ hủy diệt ta.",
        metallic_p10_4: "[Kim loại nóng chảy đột nhiên ngừng chảy.]\n\nNhưng lửa chưa từng là kẻ thù của ta.",
        metallic_p10_5: "[Kim loại nhanh chóng tái tạo lại.]\n\nLửa chính là người thầy của ta.",
        metallic_p10_6: "[Những phiến kim loại khổng lồ bao bọc quanh lưỡi kiếm.]\n\nTừng đòn búa đã rèn dạy ta.\nTừng thất bại đã tôi luyện ta.",
        metallic_p10_7: "[Toàn bộ lò rèn sụp đổ, hút trọn vào thanh kiếm.]\n\nGiờ đây không còn gì để rèn đúc nữa.",
        metallic_p10_8: "[Thanh kiếm trở nên khổng lồ và hoàn mỹ tuyệt đối.]\n\nBởi vì ta đã trở thành chính bản ngã mà ta phải trở thành.",
        metallic_p10_9: "Ta không uốn cong.\nTa không gãy vỡ.\nTa trường tồn.",
        flora_unlock_1: "Bảy nghìn kẻ thù ngã xuống nuôi dưỡng mảnh đất thiêng liêng.",
        flora_unlock_2: "Ta từng chỉ là một hạt mầm. Ngay cả hạt giống cũng biết cách sinh tồn.",
        flora_unlock_3: "Hãy nắm lấy những nhánh dây leo của ta. Dùng sức sống bất diệt... và chúng ta sẽ tồn tại lâu hơn tất cả.",
        flora_p10_1: "[Thanh kiếm cắm sâu xuống lòng đất.]\n\nHãy im lặng.",
        flora_p10_2: "[Chiến trường hoàn toàn chìm vào tĩnh mịch.]\n\nLắng nghe đi.",
        flora_p10_3: "[Một nhịp tim mờ nhạt bắt đầu đập sâu dưới lòng đất.]\n\nĐất mẹ đang sống.",
        flora_p10_4: "[Những mầm rễ li ti nhú lên quanh thanh kiếm.]\n\nNgươi dõi theo ta lớn lên.",
        flora_p10_5: "[Những nhánh rễ lan tỏa thần tốc khắp chiến trường.]\n\nNhưng ngươi chưa từng nhìn xem ta đã lan rộng tới tận đâu.",
        flora_p10_6: "[Những thân cổ thụ khổng lồ đội đất vươn lên.]\n\nDưới chân ngươi.\nDưới những dãy núi.",
        flora_p10_7: "[Toàn bộ môi trường bị bao phủ bởi thảm thực vật bạt ngàn.]\n\nVào những nơi ngươi nghĩ không gì có thể chạm tới.",
        flora_p10_8: "[Thanh kiếm biến mất dưới bóng một đại thụ cổ xưa sừng sững.]\n\nNgươi không thể giết chết một thứ...",
        flora_p10_9: "[Thân cổ thụ tách đôi.]\n\n...vốn đã trở thành vạn vật.",
        flora_p10_10: "Chặt hạ ta đi.\nTa sẽ lại đâm chồi.",
        hellfire_unlock_1: "Mười nghìn linh hồn bị thiêu rụi trong lò luyện địa ngục.",
        hellfire_unlock_2: "Một tàn lửa nhỏ. Đó là tất cả những gì ta cần.",
        hellfire_unlock_3: "Ngươi khao khát sức mạnh? Vậy thì hãy đối mặt với lửa thiêng. Cầm lấy ta... và để tất cả cháy rụi.",
        hellfire_p10_1: "[Chiến trường đột ngột rơi vào im bặt.]\n\nNgươi đã nuôi dưỡng ta.",
        hellfire_p10_2: "[Từng ngọn lửa trong khu vực bắt đầu chuyển động cuộn về phía thanh kiếm.]\n\nTừng trận chiến.\nTừng mạng ngã xuống.\nTừng tàn lửa.",
        hellfire_p10_3: "[Ngọn lửa xoáy cuộn dữ dội vào lưỡi kiếm.]\n\nNgươi cứ nghĩ rằng ta đang hấp thụ chúng.",
        hellfire_p10_4: "[Bầu trời chuyển sang màu đỏ thẫm quỷ dị.]\n\nChúng đang vỗ béo ta.",
        hellfire_p10_5: "[Thanh kiếm bắt đầu rạn nứt.]\n\nVà giờ đây...",
        hellfire_p10_6: "[Dung nham phun trào từ bên dưới chân người chơi.]\n\n...không còn thứ gì có thể kìm hãm ta nữa.",
        hellfire_p10_7: "[Thanh kiếm nổ tung trong ngọn lửa đen-đỏ địa ngục.]\n\nTA KHÔNG PHẢI LÀ NGỌN LỬA.",
        hellfire_p10_8: "[Hào quang hỏa ngục khổng lồ bùng nổ khắp chiến trường.]\n\nTA CHÍNH LÀ ĐỊA NGỤC HỎA.",
        hellfire_p10_9: "Chạy đi.",
        hint: "[PHÍM CÁCH] hoặc Nhấp để tiếp tục",
        btn_skip: "BỎ QUA [ESC]"
      },
      toasts: {
        entered_combat_title: "Đã Vào Thảo Nguyên Rộng Lớn",
        entered_combat_desc: "Tấn công lính canh tại các bãi săn mồi!",
        weapon_locked_title: "VŨ KHÍ ĐANG KHÓA",
        weapon_locked_desc: "Cần 1,250 Mạng Tích Lũy để trang bị Overdrive!",
        weapon_locked_req_desc: "Cần {req} Mạng tích lũy để trang bị {name}!",
        weapon_aquatic_locked_desc: "Cần 2,500 Mạng Tích Lũy để trang bị Aquatic!",
        weapon_soil_locked_desc: "Cần 3,500 Mạng Tích Lũy để trang bị Soil!",
        weapon_metallic_locked_desc: "Cần 5,000 Mạng Tích Lũy để trang bị Metallic!",
        weapon_flora_locked_desc: "Cần 7,000 Mạng Tích Lũy để trang bị Flora!",
        weapon_hellfire_locked_desc: "Cần 10,000 Mạng Tích Lũy để trang bị Hellfire!",
        aquatic_unlock_title: "VŨ KHÍ MỚI ĐÃ MỞ",
        aquatic_unlock_desc: "Aquatic — Thủy Triều Nhấn Chìm hiện đã sẵn sàng!",
        aquatic_p13_title: "THĂNG HOA CỰC HẠN",
        aquatic_p13_desc: "Giai đoạn 13: Omnitidal — Đã chạm tới cảnh giới đại dương nguyên thủy!",
        soil_unlock_title: "VŨ KHÍ MỚI ĐÃ MỞ",
        soil_unlock_desc: "Soil — Pháo Đài Bất Diệt hiện đã sẵn sàng!",
        soil_p10_title: "PHÁO ĐÀI BẤT DIỆT",
        soil_p10_desc: "Giai đoạn 10: Soil — Hoàn tất biến đổi Pháo Đài Bất Diệt!",
        metallic_unlock_title: "VŨ KHÍ MỚI ĐÃ MỞ",
        metallic_unlock_desc: "Metallic — Ý Chí Kim Thép hiện đã sẵn sàng!",
        metallic_p10_title: "THÉP VĨNH HẰNG",
        metallic_p10_desc: "Giai đoạn 10: Metallic — Hoàn tất tôi luyện Thép Vĩnh Hằng!",
        flora_unlock_title: "VŨ KHÍ MỚI ĐÃ MỞ",
        flora_unlock_desc: "Flora — Vạn Vật Sinh Sôi hiện đã sẵn sàng!",
        flora_p10_title: "VẠN VẬT TÁI SINH",
        flora_p10_desc: "Giai đoạn 10: Flora — Sự tái sinh bất diệt bùng nở!",
        hellfire_unlock_title: "VŨ KHÍ MỚI ĐÃ MỞ",
        hellfire_unlock_desc: "Hellfire — Chúa Tể Hỏa Ngục hiện đã sẵn sàng!",
        hellfire_p10_title: "CHÚA TỂ HỎA NGỤC",
        hellfire_p10_desc: "Giai đoạn 10: Hellfire — Hỏa ngục tuyệt diệt xuất thế!",
        overdrive_up_title: "OVERDRIVE LÊN GIAI ĐOẠN",
        overdrive_up_desc: "Đã đạt {name}",
        aquatic_up_title: "AQUATIC TIẾN HÓA",
        aquatic_up_desc: "Đã đạt {name}",
        soil_up_title: "SOIL TIẾN HÓA",
        soil_up_desc: "Đã đạt {name}",
        metallic_up_title: "METALLIC TÔI LUYỆN",
        metallic_up_desc: "Đã đạt {name}",
        flora_up_title: "FLORA LAN TỎA",
        flora_up_desc: "Đã đạt {name}",
        hellfire_up_title: "HELLFIRE BÙNG CHÁY",
        hellfire_up_desc: "Đã đạt {name}",
        devourer_up_title: "DEVOURER THỨC TỈNH",
        devourer_up_desc: "GIAI ĐOẠN: {name}",
        achievement_unlocked_title: "Mở Khóa Thành Tựu!",
        sword_equipped_title: "Đã Trang Bị {name}",
        sword_equipped_desc: "Sẵn sàng chiến đấu trên thảo nguyên.",
        sword_unequipped_title: "Đã Tháo Kiếm",
        sword_unequipped_desc: "Đã đặt lại lên bệ vũ khí.",
        save_reset_title: "Đã Đặt Lại Bản Lưu",
        save_reset_desc: "Toàn bộ tiến trình đã được đặt lại.",
        invalid_amount_title: "Số Lượng Không Hợp Lệ",
        invalid_amount_desc: "Tổng số mạng phải từ 0 trở lên.",
        invalid_input_title: "Nhập Liệu Không Hợp Lệ",
        invalid_input_desc: "Vui lòng nhập số chuỗi hạ gục.",
        invalid_streak_title: "Chuỗi Không Hợp Lệ",
        invalid_streak_desc: "Chuỗi hạ gục phải từ 0 trở lên.",
        dev_mode_title: "Chế Độ Nhà Phát Triển",
        dev_mode_desc: "Truy cập thành công. Bảng điều khiển debug đã sẵn sàng.",
        debug_kills_add_title: "Debug: Đã Thêm Mạng Tích Lũy",
        debug_kills_add_desc: "Đã thêm +{count} Mạng Tích Lũy (Tổng: {total})",
        debug_kills_set_title: "Debug: Đã Đặt Mạng Tích Lũy",
        debug_kills_set_desc: "Tổng mạng tích lũy đặt thành {count}",
        debug_streak_set_title: "Debug: Đã Đặt Chuỗi Hạ Gục",
        debug_streak_set_desc: "Chuỗi hạ gục hiện tại đặt thành {val}",
        debug_badge_title: "Debug: Đã Cấp Huy Hiệu",
        debug_badges_title: "Debug: Đã Cấp Nhiều Huy Hiệu",
        debug_badges_desc: "Đã cấp {count} huy hiệu. Toàn bộ thành tựu đã mở khóa.",
        debug_badges_all_unlocked: "Tất cả thành tựu đã được mở khóa từ trước."
      },
      maps: {
        LOBBY: "Sảnh Thánh Địa",
        COMBAT: "Thảo Nguyên Rộng Lớn",
        portal_combat: "VÀO THẢO NGUYÊN",
        portal_lobby: "TRỞ VỀ SẢNH",
        pedestal_overdrive_locked: "OVERDRIVE (ĐANG KHÓA)",
        pedestal_overdrive_req: "[ CẦN 1,250 MẠNG TÍCH LŨY ]",
        pedestal_aquatic_locked: "AQUATIC (ĐANG KHÓA)",
        pedestal_aquatic_req: "[ CẦN 2,500 MẠNG TÍCH LŨY ]",
        pedestal_soil_locked: "SOIL (ĐANG KHÓA)",
        pedestal_soil_req: "[ CẦN 3,500 MẠNG TÍCH LŨY ]",
        pedestal_metallic_locked: "METALLIC (ĐANG KHÓA)",
        pedestal_metallic_req: "[ CẦN 5,000 MẠNG TÍCH LŨY ]",
        pedestal_flora_locked: "FLORA (ĐANG KHÓA)",
        pedestal_flora_req: "[ CẦN 7,000 MẠNG TÍCH LŨY ]",
        pedestal_hellfire_locked: "HELLFIRE (ĐANG KHÓA)",
        pedestal_hellfire_req: "[ CẦN 10,000 MẠNG TÍCH LŨY ]"
      },
      map: {
        modal_tag: "ĐỊNH VỊ CHIẾN THUẬT",
        full_title: "🗺️ BẢN ĐỒ THẾ GIỚI",
        player_coords_label: "TỌA ĐỘ:",
        legend_player: "Người chơi",
        legend_zone: "Khu vực Quái",
        hint: "Kéo để di chuyển • Cuộn để phóng to • Rê chuột xem thông tin",
        btn_close: "Đóng [Esc / M]"
      },
      zones: {
        zone_north: "BÃI SĂN MỒI PHÍA BẮC",
        zone_south: "BÃI SĂN MỒI PHÍA NAM",
        zone_fairy_north: "RỪNG TIÊN PHÍA BẮC",
        zone_fairy_south: "RỪNG TIÊN PHÍA NAM",
        zone_thug_camp: "TRẠI CÔN ĐỒ",
        zone_guard: "TIỀN ĐỒN THỦ VỆ",
        zone_swordman: "DOANH TRẠI KIẾM SĨ",
        zone_buff_man: "ĐẤU TRƯỜNG LỰC SĨ",
        zone_elf: "THÁNH ĐỊA TINH LINH",
        zone_ironborn: "TRẠI THIẾT CHIẾN",
        zone_bloodfang: "BÃI HUYẾT NHAM",
        zone_arcanist: "RỪNG HUYỀN THUẬT",
        zone_colossus: "CÁnh ĐỒNG PHÙ ĐIÊU",
        zone_starforged: "PHế TÍCH SAO RÈNH",
        zone_grizzlehorn: "MỎM ĐÁ SỪNG XÁM",
        zone_brambleback: "RỪNG GAI BỤI",
        zone_embermane: "SỐNG NÚI TÀN LỬA",
        zone_duskhorn: "VÙNG HOANG HOÀNG HÔN",
        zone_mirewalker: "ĐẦM LẦY SÂU THẲM",
        zone_thunderhoof: "THẢO NGUYÊN SẤM SÉT",
        zone_gloomscale: "HỐ VẢY HẮC ÁM",
        zone_wildtusk: "TRẢNG NANH HOANG",
        zone_moonmane: "CAO NGUYÊN NGUYỆT BỜM",
        zone_crimsonhide: "VÙNG ĐẤT XÍCH BÌ",
        unit_active_format: "{unit} đang hoạt động: {count}/{max}",
        unit_sentry: "Lính canh [100 Máu • 1 Chuỗi]",
        unit_fairy: "Tiên [250 Máu • 2 Chuỗi]",
        unit_thug: "Côn đồ [750 Máu • 5 Chuỗi]",
        unit_guard: "Thủ vệ [2,000 Máu • 10 Chuỗi]",
        unit_swordman: "Kiếm sĩ [4,500 Máu • 20 Chuỗi]",
        unit_buff_man: "Lực sĩ [10,000 Máu • 50 Chuỗi]",
        unit_elf: "Tinh linh [15,275 Máu • 100 Chuỗi]",
        unit_ironborn: "Thiết Chiến [28,000 Máu • 150 Chuỗi]",
        unit_bloodfang: "Huyết Nham [45,000 Máu • 200 Chuỗi]",
        unit_arcanist: "Pháp Sư [72,000 Máu • 300 Chuỗi]",
        unit_colossus: "Phù Điêu [110,000 Máu • 450 Chuỗi]",
        unit_starforged: "Sao Rènh [190,000 Máu • 650 Chuỗi]",
        unit_grizzlehorn: "Sừng Xám [300,000 Máu • 850 Chuỗi]",
        unit_brambleback: "Gai Bụi [475,000 Máu • 1,200 Chuỗi]",
        unit_embermane: "Tàn Lửa [750,000 Máu • 1,750 Chuỗi]",
        unit_duskhorn: "Hoàng Hôn [1,150,000 Máu • 2,500 Chuỗi]",
        unit_mirewalker: "Đầm Lầy [1,800,000 Máu • 3,600 Chuỗi]",
        unit_thunderhoof: "Sấm Sét [2,800,000 Máu • 5,000 Chuỗi]",
        unit_gloomscale: "Vảy Hắc Ám [4,300,000 Máu • 7,000 Chuỗi]",
        unit_wildtusk: "Nanh Hoang [6,700,000 Máu • 10,000 Chuỗi]",
        unit_moonmane: "Bờm Nguyệt Quang [10,500,000 Máu • 14,500 Chuỗi]",
        unit_crimsonhide: "Xích Bì [17,000,000 Máu • 21,000 Chuỗi]"
      },
      npcs: {
        normal: { name: "Lính Gác Thường", desc: "Lính canh cơ bản canh giữ các bãi săn mồi ban đầu." },
        fairy: { name: "Tiên Rừng", desc: "Sinh linh có cánh nhanh nhẹn, bay lượn lẩn tránh đòn đánh." },
        thug: { name: "Côn Đồ", desc: "Kẻ cướp hung hãn tuần tra với vũ khí cận chiến thô sơ." },
        guard: { name: "Vệ Binh", desc: "Chiến binh hoàng gia trang bị giáp trụ bảo vệ tiền đồn." },
        swordman: { name: "Kiếm Sĩ", desc: "Bậc thầy kiếm thuật với những đường kiếm dứt khoát và chuẩn xác." },
        buff_man: { name: "Lực Sĩ", desc: "Kẻ khổng lồ cơ bắp sở hữu những đòn giáng uy lực kinh hoàng." },
        elf: { name: "Tinh Linh", desc: "Cung thủ thần rừng nhanh nhẹn sử dụng cung tên ma thuật." },
        ironborn: { name: "Thiết Tộc", desc: "Sinh vật tôi luyện dưới lòng đất với lớp giáp sắt kiên cố." },
        bloodfang: { name: "Huyết Nham", desc: "Thú săn mồi khát máu hình sói hung tợn và tàn bạo." },
        arcanist: { name: "Bí Thuật Sư", desc: "Pháp sư bí thuật điều khiển nguồn năng lượng ma thuật hỗn mang." },
        colossus: { name: "Khổng Lồ Cổ Đại", desc: "Cự nhân đá nguyên thủy khổng lồ từ thời hồng hoang." },
        starforged: { name: "Tinh Thần Binh", desc: "Cỗ máy chiến tranh vũ trụ tôi luyện từ mảnh vỡ sao băng." },
        grizzlehorn: { name: "Sừng Xám", desc: "Quái thú bọc giáp đồng với cặp sừng cong đồ sộ." },
        brambleback: { name: "Gai Rừng", desc: "Quái vật bụi gai bao phủ gai nhọn tẩm độc tố sắc bén." },
        embermane: { name: "Bờm Lửa", desc: "Mãnh thú họ mèo bốc cháy dữ dội tỏa nhiệt lượng nham thạch." },
        duskhorn: { name: "Sừng Hoàng Hôn", desc: "Linh thú bóng đêm sở hữu cặp sừng hắc diện thạch huyền bí." },
        mirewalker: { name: "Hành Giả Đầm Lầy", desc: "Cự thú đầm lầy độc hại bao quanh bởi các bào tử phát sáng." },
        thunderhoof: { name: "Móng Lôi Đình", desc: "Thần thú sấm sét phóng ra những tia điện hủy diệt." },
        gloomscale: { name: "Vảy U Ám", desc: "Giao long vực thẳm bọc lớp vảy rồng bóng tối đa tầng." },
        wildtusk: { name: "Nanh Dã Thú", desc: "Dã trư tiền sử hung bạo sở hữu cặp ngà sắc bén chết chóc." },
        moonmane: { name: "Bờm Nguyệt Quang", desc: "Thần thú ánh trăng tỏa hào quang nguyệt hoa thuần khiết." },
        crimsonhide: { name: "Xích Bì", desc: "Bá chủ tận thế bọc giáp tinh thể huyết long hủy diệt." }
      },
      swords: {
        devourer: {
          name: "Devourer",
          tag: "VŨ KHÍ ĐẦU TIÊN",
          description: "Một lưỡi kiếm săn mồi vô độ nuốt chửng linh hồn kẻ thù để cường hóa người sử dụng, tiến hóa qua 17 giai đoạn lên tới 75,000 chuỗi hạ gục."
        },
        overdrive: {
          name: "Overdrive",
          tag: "VŨ KHÍ TỐC ĐỘ",
          description: "Lưỡi kiếm tốc độ siêu vận tốc với dao động cộng hưởng sắc trắng và đỏ thẫm xen kẽ. Tiến hóa qua 7 giai đoạn từ kiếm liễu sắc nhọn thành katana thần tốc tối thượng, đạt tốc độ di chuyển 300."
        },
        aquatic: {
          name: "Aquatic",
          tag: "THỦY TRIỀU TIẾN HÓA",
          description: "Thanh kiếm nước khởi đầu từ giọt nước vô hại, dần chuyển hóa thành đại hồng thủy diệt thế qua 13 giai đoạn với kỹ năng Tsunami cuồng nộ."
        },
        soil: {
          name: "Soil",
          tag: "PHÁO ĐÀI ĐỊA LINH",
          description: "Thanh kiếm phòng thủ tập trung vào Máu, dần tiến hóa từ một lưỡi đất thô sơ thành một pháo đài thổ nhưỡng bất diệt qua 10 giai đoạn. Sở hữu kỹ năng tạo khiên Fortitude [Z]."
        },
        metallic: {
          name: "Metallic",
          tag: "Ý CHÍ KIM THÉP",
          description: "Sinh ra từ kim loại thô và dần được tôi luyện thành một tạo tác không thể uốn cong hay phá vỡ. Sở hữu tư thế phòng ngự Iron Will [Z]."
        },
        flora: {
          name: "Flora",
          tag: "VẠN VẬT SINH SÔI",
          description: "Thanh kiếm sống lớn mạnh qua từng trận chiến, dần trở thành hiện thân của sự phát triển tự nhiên không thể ngăn cản. Sở hữu kỹ năng Worldroot [Z]."
        },
        hellfire: {
          name: "Hellfire",
          tag: "CHÚA TỂ HỎA NGỤC",
          description: "Vũ khí địa ngục nuôi dưỡng bởi sự hủy diệt và ngày càng trở nên khó kìm hãm. Sở hữu kỹ năng hủy diệt Cataclysm [Z]."
        }
      },
      phases: {
        devourer: {
          1: {
            name: "Giai đoạn 1: Hunger",
            shortName: "Hunger",
            effects: "Lưỡi thép xương thô sơ. Cơ bản 5 Sát thương và 100 Máu. Nuốt chửng linh hồn khi hạ gục kẻ địch để tăng tiến trong giai đoạn hiện tại."
          },
          2: {
            name: "Giai đoạn 2: Feast",
            shortName: "Feast",
            effects: "Lưỡi kiếm no nê. Cơ bản 18 Sát thương và 180 Máu. Chém xuyên da thịt kẻ địch với cơn cuồng nộ đói khát."
          },
          3: {
            name: "Giai đoạn 3: Devourer",
            shortName: "Devourer",
            effects: "Thực thể săn mồi thức tỉnh. Cơ bản 32 Sát thương và 280 Máu. Hút cạn sinh lực kẻ thù bằng dao động vực thẳm."
          },
          4: {
            name: "Giai đoạn 4: Voracity",
            shortName: "Voracity",
            effects: "Cơn cuồng nuốt chửng tham tàn. Cơ bản 55 Sát thương và 450 Máu. Rực cháy với cơn đói thiêu đốt mọi vật."
          },
          5: {
            name: "Giai đoạn 5: Apex Maw",
            shortName: "Apex Maw",
            effects: "Thống trị đỉnh cao săn mồi. Cơ bản 95 Sát thương và 750 Máu với nhát chém quét rộng 180° uy lực."
          },
          6: {
            name: "Giai đoạn 6: World Eater",
            shortName: "World Eater",
            effects: "Thảm họa nuốt chửng cõi trần. Cơ bản 160 Sát thương và 1,200 Máu. Tiêu hóa vạn vật trên vòng quét cực đại."
          },
          7: {
            name: "Giai đoạn 7: Cosmic Calamity",
            shortName: "Cosmic Calamity",
            effects: "Linh hồn thiên hà bị nuốt trọn. Cơ bản 260 Sát thương và 1,800 Máu. Vệt chém xé toạc các vết nứt vũ trụ."
          },
          8: {
            name: "Giai đoạn 8: Void Singularity",
            shortName: "Void Singularity",
            effects: "Chân trời sự kiện đói khát không đáy. Cơ bản 400 Sát thương và 2,600 Máu với lực kéo hư không nghiền nát."
          },
          9: {
            name: "Giai đoạn 9: Starved Husk",
            shortName: "Starved Husk",
            effects: "Xác khô đói lả kiệt quệ. Giác quan mờ nhạt xuống cơ bản 40 Sát thương, 58 Máu và 17 Tốc độ. Cần chính xác +250 mạng để thức tỉnh."
          },
          10: {
            name: "Giai đoạn 10: Ascended Behemoth",
            shortName: "Ascended Behemoth",
            effects: "Sự hồi sinh chấn động cõi giới! Cơ bản 650 Sát thương và 4,000 Máu. Mở khóa tia năng lượng Gluttony [Z]."
          },
          11: {
            name: "Giai đoạn 11: Cosmic Devourer",
            shortName: "Cosmic Devourer",
            effects: "Kẻ nuốt chửng vũ trụ thức giấc. Cơ bản 1,000 Sát thương, 6,000 Máu và 126 Tốc độ cùng các nhát chém thái dương rực sáng."
          },
          12: {
            name: "Giai đoạn 12: Abyssal Sovereign",
            shortName: "Abyssal Sovereign",
            effects: "Bá chủ của vực sâu thăm thẳm. Song kiếm hai lưỡi khổng lồ gây cơ bản 1,550 Sát thương tàn phá và 9,000 Máu."
          },
          13: {
            name: "Giai đoạn 13: Singularity Core",
            shortName: "Singularity Core",
            effects: "Chân trời hấp dẫn cực hạn. Lõi lỗ đen quay quanh gây cơ bản 2,300 Sát thương hư không và 13,500 Máu trên cung chém rộng."
          },
          14: {
            name: "Giai đoạn 14: Eldritch Eclipse",
            shortName: "Eldritch Eclipse",
            effects: "Lưỡi hái nhật thực hai sừng cổ xưa. Thiêu rụi đội hình địch với cơ bản 3,400 Sát thương hỏa ngục và 19,000 Máu."
          },
          15: {
            name: "Giai đoạn 15: Cosmic Oblivion",
            shortName: "Cosmic Oblivion",
            effects: "Lưỡi kiếm chòm sao tinh vân siêu phàm. Cơ bản 4,800 Sát thương và 25,000 Máu đập vỡ cấu trúc không gian."
          },
          16: {
            name: "Giai đoạn 16: Ashen Dormancy",
            shortName: "Ashen Dormancy",
            effects: "Giấc ngủ vùi quá độ trước khi thăng hoa tối thượng. Giác quan lắng xuống cơ bản 138 Sát thương và 345 Máu. Cần chính xác +1,000 mạng để chạm đỉnh cao."
          },
          17: {
            name: "Giai đoạn 17: The All Devourer",
            shortName: "The All Devourer",
            effects: "BIẾN ĐỔI TỐI HẬU. Đỉnh cao tuyệt đối của vạn vật. Cơ bản 6,500 Sát thương, 30,000 Máu, hào quang thần thánh và vĩnh viễn nhận huy hiệu All Devourer. Mở khóa Engulf [X]."
          }
        },
        overdrive: {
          1: {
            name: "Giai đoạn 1: Quick Silver",
            shortName: "Quick Silver",
            effects: "Kiếm liễu trắng thanh mảnh với điểm xuyết đỏ thẫm. Cơ bản 8 Sát thương, 120 Máu và 50 Tốc độ.",
            notification: "Mũi kim cựa mình với tiềm năng động năng."
          },
          2: {
            name: "Giai đoạn 2: Velocity Sting",
            shortName: "Velocity Sting",
            effects: "Kiếm liễu vận tốc đỏ thẫm cường hóa cùng gia tốc chớp nhoáng. Cơ bản 24 Sát thương, 260 Máu và 80 Tốc độ.",
            notification: "Cảm nhận gia tốc bắt đầu bùng nổ."
          },
          3: {
            name: "Giai đoạn 3: Sonic Piercer",
            shortName: "Sonic Piercer",
            effects: "Kiếm liễu siêu thanh tinh xảo rít qua bức tường âm thanh. Cơ bản 65 Sát thương, 550 Máu và 115 Tốc độ.",
            notification: "Nhanh hơn mắt thường có thể theo dõi."
          },
          4: {
            name: "Giai đoạn 4: Tachyon Edge",
            shortName: "Tachyon Edge",
            effects: "Lưỡi kiếm tốc độ tachyon bóp méo nhận thức. Cơ bản 180 Sát thương, 1,400 Máu và 155 Tốc độ.",
            notification: "Thế giới xung quanh bắt đầu chậm lại."
          },
          5: {
            name: "Giai đoạn 5: Flash Katana",
            shortName: "Flash Katana",
            effects: "Hóa hình Katana! Vòng chém như những tia sét trắng rực lửa. Cơ bản 650 Sát thương, 4,500 Máu và 200 Tốc độ.",
            notification: "Lưỡi thép lóe sáng tựa sấm sét đỏ thẫm."
          },
          6: {
            name: "Giai đoạn 6: Godspeed Blade",
            shortName: "Godspeed Blade",
            effects: "Katana thượng cấp phá vỡ mọi giới hạn âm thanh. Cơ bản 2,100 Sát thương, 12,000 Máu và 250 Tốc độ.",
            notification: "Hiện thực rạn nứt dưới làn sóng xung kích."
          },
          7: {
            name: "Giai đoạn 7: Apex Godspeed",
            shortName: "Apex Godspeed",
            effects: "BIẾN ĐỔI OVERDRIVE TỐI HẬU. Katana thần tốc uy nghi thần thánh. Cơ bản 5,500 Sát thương, 25,500 Máu và 300 Tốc độ.",
            notification: "Bạn đã hóa thân thành tốc độ vượt trên cả thần linh."
          }
        },
        aquatic: {
          1: {
            name: "Giai đoạn 1: Droplet",
            shortName: "Droplet",
            effects: "Một giọt nước run rẩy đọng trên lưỡi kiếm. Cơ bản 15 Sát thương và 150 Máu.",
            notification: "Một giọt nước duy nhất đọng lại trên lưỡi kiếm."
          },
          2: {
            name: "Giai đoạn 2: Ripple",
            shortName: "Ripple",
            effects: "Nước bắt đầu luân chuyển với động lượng. Tạo ra các gợn sóng hình tròn khi đánh trúng.",
            notification: "Dòng nước bắt đầu chuyển động."
          },
          3: {
            name: "Giai đoạn 3: Stream",
            shortName: "Stream",
            effects: "Một dòng suối mềm mại chảy quanh lưỡi kiếm. Để lại vệt nước ngắn khi vung chém.",
            notification: "Gợn sóng hóa thành dòng suối."
          },
          4: {
            name: "Giai đoạn 4: Current",
            shortName: "Current",
            effects: "Hải lưu tăng tốc với lưỡi kiếm lam ngọc và lõi trắng. Nước xoáy cuộn đầy uy lực.",
            notification: "Dòng suối đã tìm thấy hải lưu của chính mình."
          },
          5: {
            name: "Giai đoạn 5: Undertow",
            shortName: "Undertow",
            effects: "Vòng xoáy nước liên tục cuộn trào dưới chân người chơi. Cơ bản 300 Sát thương và 3,500 Máu.",
            notification: "Dưới mặt nước... có thứ gì đó đang lôi kéo."
          },
          6: {
            name: "Giai đoạn 6: Maelstrom",
            shortName: "Maelstrom",
            effects: "Song hoàn nước xoay tròn cùng lốc xoáy nuốt chửng vật chất. Cơ bản 550 Sát thương và 6,000 Máu.",
            notification: "Dòng chảy bắt đầu xoắn ốc dữ dội."
          },
          7: {
            name: "Giai đoạn 7: Deep",
            shortName: "Deep",
            effects: "Áp suất vực sâu thẳm. Để lại vệt nước khi di chuyển và hào quang nước tối nghiền nát. Cơ bản 900 Sát thương và 9,000 Máu.",
            notification: "Bạn đã chạm tới vùng nước sâu thẳm."
          },
          8: {
            name: "Giai đoạn 8: Drought",
            shortName: "Drought",
            effects: "SỰ SỤP ĐỔ NĂNG LƯỢNG. Giác quan mờ nhạt xuống 30 Sát thương và 300 Máu. Giọt nước bốc hơi. Cần +750 mạng để thức tỉnh.",
            notification: "Đại dương chìm vào thinh lặng."
          },
          9: {
            name: "Giai đoạn 9: Flood",
            shortName: "Flood",
            effects: "BÙNG NỔ DỮ DỘI! Cơ bản 2,000 Sát thương và 15,000 Máu. Mở khóa kỹ năng đặc trưng: TSUNAMI [Z] (Sát thương gấp 4 lần = 8,000).",
            notification: "Sự thinh lặng tan vỡ. ĐẠI HỒNG THỦY ĐÃ BẮT ĐẦU."
          },
          10: {
            name: "Giai đoạn 10: Monsoon",
            shortName: "Monsoon",
            effects: "Tạo bão cuồng nộ. Mưa rơi xối xả từ bầu trời. Cơ bản 4,000 Sát thương, 25,000 Máu. Tsunami gây 16,000 Sát thương.",
            notification: "Một ngọn sóng hóa thành cơn bão. GIÓ MÙA TRỖI DẬY."
          },
          11: {
            name: "Giai đoạn 11: Cataclysm",
            shortName: "Cataclysm",
            effects: "Biển cả vượt khỏi ranh giới. Rung màn hình khi tấn công. Cơ bản 7,000 Sát thương, 38,000 Máu. Tsunami gây 28,000 Sát thương.",
            notification: "Biển cả đã thoát khỏi bờ cõi. ĐẠI ĐỊA CHẤN."
          },
          12: {
            name: "Giai đoạn 12: Leviathan",
            shortName: "Leviathan",
            effects: "Ảo ảnh thủy quái Leviathan cổ đại hiện hình phía sau chủ nhân. Cơ bản 11,500 Sát thương, 50,000 Máu. Tsunami gây 46,000 Sát thương.",
            notification: "Có thứ gì đó dưới đáy đại dương đang thức giấc. LEVIATHAN TRỖI DẬY."
          },
          13: {
            name: "Giai đoạn 13: Omnitidal",
            shortName: "Omnitidal",
            effects: "BIẾN ĐỔI TỐI HẬU: THIÊN TAI DI ĐỘNG. Cơ bản 18,000 Sát thương, 62,000 Máu. Tsunami gây 72,000 Sát thương hủy diệt.",
            notification: "Không còn đại dương nào để chinh phục. Bởi vì bạn đã hóa thân thành chính nó. OMNITIDAL."
          }
        },
        soil: {
          1: {
            name: "Giai đoạn 1: Dirt Blade",
            shortName: "Dirt Blade",
            effects: "Lưỡi đất nén từ bùn đất ẩm thô sơ. Cơ bản 3 Sát thương, 250 Máu và 10 Tốc độ.",
            notification: "Ngươi đang cầm ta, yếu ớt và dễ vỡ vụn. Nhưng sâu bên trong... là một hạt mầm."
          },
          2: {
            name: "Giai đoạn 2: Packed Earth",
            shortName: "Packed Earth",
            effects: "Thổ nhưỡng nén chặt bện chặt rễ cây. Cơ bản 15 Sát thương, 800 Máu và 15 Tốc độ.",
            notification: "Rễ cây siết chặt lại. Ta sẽ không để bất cứ thứ gì chạm được vào ngươi."
          },
          3: {
            name: "Giai đoạn 3: Clay Shard",
            shortName: "Clay Shard",
            effects: "Lưỡi đất nung khô cứng cáp với gờ đất sét. Cơ bản 50 Sát thương, 2,200 Máu và 21 Tốc độ.",
            notification: "Sức nóng tôi luyện chúng ta thành một khối vững chắc. Ngươi an toàn sau lưng ta."
          },
          4: {
            name: "Giai đoạn 4: Loam Edge",
            shortName: "Loam Edge",
            effects: "Đất cổ đại kết tinh mạch khoáng sản sống. Cơ bản 150 Sát thương, 5,500 Máu và 28 Tốc độ. Mở khóa khiên hộ thân Fortitude [Z].",
            notification: "Uống trọn sinh khí từ lòng đất! Giữ vững trận địa — ta chính là tấm khiên của ngươi!"
          },
          5: {
            name: "Giai đoạn 5: Stoneheart",
            shortName: "Stoneheart",
            effects: "Lưỡi đất hóa đá nặng trĩu hòa quyện mạch đá hoa cương. Cơ bản 400 Sát thương, 13,000 Máu và 36 Tốc độ.",
            notification: "Cứ để chúng đánh tới. Mỗi đòn giáng chỉ càng làm đất nén chặt hơn."
          },
          6: {
            name: "Giai đoạn 6: Terrene Bastion",
            shortName: "Terrene Bastion",
            effects: "Bức tường địa tầng rung chuyển nhịp đập địa chấn. Cơ bản 950 Sát thương, 28,000 Máu và 47 Tốc độ.",
            notification: "Một pháo đài không thể xây xong trong một ngày. Chúng ta chính là nền móng."
          },
          7: {
            name: "Giai đoạn 7: Bedrock Cleaver",
            shortName: "Bedrock Cleaver",
            effects: "Lưỡi đá nền bất hoại bao bọc cổ ngữ hộ vệ. Cơ bản 2,100 Sát thương, 58,000 Máu và 60 Tốc độ.",
            notification: "Đá nền không bao giờ vỡ vụn. Chúng ta cũng vậy."
          },
          8: {
            name: "Giai đoạn 8: Mountain's Will",
            shortName: "Mountain's Will",
            effects: "Pháo đài thổ nhưỡng sừng sững cùng các phiến đá hộ thân quay quanh. Cơ bản 4,200 Sát thương, 115,000 Máu và 76 Tốc độ.",
            notification: "Không gì lay chuyển được ngọn núi. Giữ vững, kho báu của ta."
          },
          9: {
            name: "Giai đoạn 9: Crumbling Husk",
            shortName: "Crumbling Husk",
            effects: "SỰ SỤP ĐỔ CÓ CHỦ ĐÍCH. Lớp vỏ thổ nhưỡng nứt vỡ, giảm xuống cơ bản 135 Sát thương, 5,000 Máu và 96 Tốc độ. Trải qua 40,000 mạng để lộ chân tâm.",
            notification: "Khoan đã... lớp vỏ bên ngoài đang rơi rụng... hãy bám chắc, tin ta, ĐỪNG BUÔNG TAY—"
          },
          10: {
            name: "Giai đoạn 10: Indestructible Soil Fortress",
            shortName: "Soil Fortress",
            effects: "BIẾN ĐỔI TỐI HẬU. Thành lũy đại lục bất khả xâm phạm. Cơ bản 8,500 Sát thương, 315,000 Máu và 120 Tốc độ. Vĩnh viễn nhận huy hiệu Pháo Đài Thổ Nhưỡng Bất Diệt.",
            notification: "HẠT MẦM ĐÃ NẢY CHỒI. TA CHÍNH LÀ PHÁO ĐÀI. KHÔNG GÌ CÒN CÓ THỂ LÀM HẠI KHO BÁU CỦA TA."
          }
        },
        metallic: {
          1: {
            name: "Giai đoạn 1: Scrap",
            shortName: "Scrap",
            effects: "Mảnh phế liệu kim loại thô sơ. Cơ bản 5 Sát thương và 180 Máu.",
            notification: "Ta từng bị vứt bỏ một lần. Giờ đây, ta mang một sứ mệnh khác."
          },
          2: {
            name: "Giai đoạn 2: Forged",
            shortName: "Forged",
            effects: "Kim loại đã đi qua ngọn lửa rèn dữ dội. Cơ bản 22 Sát thương và 650 Máu.",
            notification: "Sức nóng đã biến đổi ta. Ta sẽ không mãi yếu hèn."
          },
          3: {
            name: "Giai đoạn 3: Tempered",
            shortName: "Tempered",
            effects: "Được đập búa và tôi nước, thép kết tinh thành hình. Cơ bản 70 Sát thương và 1,800 Máu.",
            notification: "Mỗi đòn đánh đều để lại dấu vết. Mỗi vết hằn chỉ làm ta cứng cáp hơn."
          },
          4: {
            name: "Giai đoạn 4: Steelbound",
            shortName: "Steelbound",
            effects: "Phiến thép kiên cố. Mở khóa Ý Chí Thép [Z] (Giảm 40% sát thương nhận vào & phản kích mảnh thép trong 6s). Cơ bản 200 Sát thương và 4,800 Máu.",
            notification: "Ta đã học được cách nhẫn nại. Hãy đánh ta lần nữa đi."
          },
          5: {
            name: "Giai đoạn 5: Reinforced",
            shortName: "Reinforced",
            effects: "Nhiều tầng thép cán nhiều lớp gia cố sống kiếm. Cơ bản 480 Sát thương và 11,000 Máu.",
            notification: "Thêm một tầng thép. Bớt đi một điểm yếu. Ta đang trở nên mạnh mẽ hơn."
          },
          6: {
            name: "Giai đoạn 6: Hardened",
            shortName: "Hardened",
            effects: "Mật độ luyện kim vô song tôi luyện dưới áp suất nghiền nát. Cơ bản 1,000 Sát thương và 24,000 Máu.",
            notification: "Áp lực không làm ta sợ hãi. Áp lực tạo nên ta."
          },
          7: {
            name: "Giai đoạn 7: Forgemaster",
            shortName: "Forgemaster",
            effects: "Lưỡi kiếm chỉ huy ngọn lửa cổ xưa và đe rèn thần thánh. Cơ bản 2,100 Sát thương và 50,000 Máu.",
            notification: "Đất mẹ ban cho ta chất liệu. Lò rèn ban cho ta mục đích sống."
          },
          8: {
            name: "Giai đoạn 8: Iron Fortress",
            shortName: "Iron Fortress",
            effects: "Giáp thành lũy bao bọc người dùng trong lớp phòng ngự bất khả lay chuyển. Cơ bản 4,200 Sát thương và 110,000 Máu.",
            notification: "Ta không còn cần đến một chiếc khiên. Chính ta là khiên."
          },
          9: {
            name: "Giai đoạn 9: Unyielding",
            shortName: "Unyielding",
            effects: "Bất khả xâm phạm trước mọi ngoại lực toan tính bẻ cong hay phá vỡ. Cơ bản 7,500 Sát thương và 210,000 Máu.",
            notification: "Ngươi không thể bẻ cong ta. Ngươi không thể phá vỡ ta."
          },
          10: {
            name: "Giai đoạn 10: Eternal Steel",
            shortName: "Eternal Steel",
            effects: "BIẾN ĐỔI TỐI HẬU: THÉP VĨNH HẰNG. Thần kiếm cự thạch tinh luyện hoàn mỹ tuyệt đối. Cơ bản 11,500 Sát thương, 360,000 Máu và 125 Tốc độ.",
            notification: "Ta không uốn cong. Ta không gãy vỡ. Ta trường tồn."
          }
        },
        flora: {
          1: {
            name: "Giai đoạn 1: Sprout",
            shortName: "Sprout",
            effects: "Lưỡi mầm non mỏng manh nhưng dẻo dai tràn đầy sức sống. Cơ bản 4 Sát thương và 220 Máu.",
            notification: "Ta từng chỉ là một hạt mầm. Ngay cả hạt giống cũng biết cách sinh tồn."
          },
          2: {
            name: "Giai đoạn 2: Rooted",
            shortName: "Rooted",
            effects: "Các sợi rễ đâm sâu gắn kết lưỡi kiếm thẳng vào lòng đất. Cơ bản 18 Sát thương và 750 Máu.",
            notification: "Rễ của ta đang lan tỏa. Ta đang bắt đầu bén rễ."
          },
          3: {
            name: "Giai đoạn 3: Growing",
            shortName: "Growing",
            effects: "Những thân gỗ cường tráng quấn chặt lấy sống kiếm. Cơ bản 60 Sát thương và 2,100 Máu.",
            notification: "Mỗi trận chiến nuôi dưỡng ta. Mỗi thắng lợi khiến ta vươn cao."
          },
          4: {
            name: "Giai đoạn 4: Thorned",
            shortName: "Thorned",
            effects: "Gai nhọn sắc lẹm phủ dọc lưỡi chém. Mở khóa Thế Giới Căn [Z] (Trói chân kẻ địch và hồi 20% Máu tối đa). Cơ bản 180 Sát thương và 5,600 Máu.",
            notification: "Chỉ phát triển thôi là chưa đủ. Đến hoa cũng cần có gai nhọn."
          },
          5: {
            name: "Giai đoạn 5: Wild",
            shortName: "Wild",
            effects: "Thảm thực vật rừng rậm hoang dã bùng nổ sức sống nguyên thủy. Cơ bản 440 Sát thương và 13,000 Máu.",
            notification: "Ngươi gọi đây là um tùm ư? Ta chỉ mới bắt đầu thôi."
          },
          6: {
            name: "Giai đoạn 6: Ancient",
            shortName: "Ancient",
            effects: "Ký ức ngàn năm của đại thụ hóa thân kiếm thành thiết mộc bất hoại. Cơ bản 950 Sát thương và 28,000 Máu.",
            notification: "Ta đã sống sót qua vô vàn mùa luân chuyển. Ngươi không thể tồn tại lâu hơn ta đâu."
          },
          7: {
            name: "Giai đoạn 7: Overgrown",
            shortName: "Overgrown",
            effects: "Tán lá sinh mệnh tỏa rộng từ kiếm phủ kín mặt đất. Cơ bản 2,000 Sát thương và 60,000 Máu.",
            notification: "Mảnh đất dưới chân ngươi vốn thuộc về ta. Ngươi chỉ là chưa nhận ra mà thôi."
          },
          8: {
            name: "Giai đoạn 8: Colossus",
            shortName: "Colossus",
            effects: "Cự kiếm đại thụ khổng lồ, tỏa ra sinh khí hành tinh cổ đại. Cơ bản 4,000 Sát thương và 130,000 Máu.",
            notification: "Ta đã vượt xa hình hài của một thanh kiếm. Ta đang trở thành thứ vĩ đại hơn."
          },
          9: {
            name: "Giai đoạn 9: Worldroot",
            shortName: "Worldroot",
            effects: "Mạng lưới rễ cây của cả hành tinh đập rộn ràng qua lưỡi kiếm. Cơ bản 7,800 Sát thương và 240,000 Máu.",
            notification: "Rễ của ta đã vươn xa hơn tầm mắt ngươi thấy. Nơi nào có đất, nơi đó có ta."
          },
          10: {
            name: "Giai đoạn 10: Evergrowth",
            shortName: "Evergrowth",
            effects: "BIẾN ĐỔI TỐI HẬU: VẠN VẬT TÁI SINH. Hiện thân vĩ đại của tự nhiên không thể ngăn cản. Cơ bản 12,000 Sát thương, 400,000 Máu và 130 Tốc độ.",
            notification: "Chặt hạ ta đi. Ta sẽ lại đâm chồi."
          }
        },
        hellfire: {
          1: {
            name: "Giai đoạn 1: Ember",
            shortName: "Ember",
            effects: "Một tàn than hồng bám chặt trên thép hắc thạch. Cơ bản 7 Sát thương và 140 Máu.",
            notification: "Một tàn lửa nhỏ. Đó là tất cả những gì ta cần."
          },
          2: {
            name: "Giai đoạn 2: Flame",
            shortName: "Flame",
            effects: "Lửa địa ngục cháy rực bao bọc sống kiếm. Cơ bản 28 Sát thương và 500 Máu.",
            notification: "Giờ ta bùng cháy. Hãy cho ta thứ gì đó để thiêu rụi."
          },
          3: {
            name: "Giai đoạn 3: Blazing",
            shortName: "Blazing",
            effects: "Ngọn lửa cuồng bạo phóng ra sau mỗi nhát chém. Cơ bản 90 Sát thương và 1,500 Máu.",
            notification: "Mỗi mạng hạ gục tiếp thêm nhiên liệu cho ngọn lửa. Hãy tiếp tục đem chúng tới."
          },
          4: {
            name: "Giai đoạn 4: Infernal",
            shortName: "Infernal",
            effects: "Ngọn lửa địa ngục bùng phát mãnh liệt. Mở khóa Đại Họa Diệt Thế [Z] (Cột dung nham gây sát thương gấp 5 lần). Cơ bản 260 Sát thương và 4,200 Máu.",
            notification: "Ngươi khao khát sức mạnh? Vậy thì hãy đối mặt với lửa thiêng."
          },
          5: {
            name: "Giai đoạn 5: Hellborn",
            shortName: "Hellborn",
            effects: "Cổ ngữ núi lửa sâu thẳm bốc cháy dọc theo thân kiếm hắc diện thạch. Cơ bản 650 Sát thương và 10,000 Máu.",
            notification: "Ngọn lửa biết rõ danh tính của ta. Còn ngươi thì sao?"
          },
          6: {
            name: "Giai đoạn 6: Magma",
            shortName: "Magma",
            effects: "Dung nham nóng chảy rỉ ra từ các khe nứt rực cháy trên kiếm. Cơ bản 1,400 Sát thương và 22,000 Máu.",
            notification: "Ngọn lửa của ta đã chạm tới lòng đất. Giờ ngay cả mặt đất cũng phải rực cháy."
          },
          7: {
            name: "Giai đoạn 7: Devastation",
            shortName: "Devastation",
            effects: "Xóa sổ thiêu rụi toàn diện mọi vật chất trước mặt kiếm chủ. Cơ bản 2,800 Sát thương và 48,000 Máu.",
            notification: "Ta không còn thiêu rụi những kẻ đứng trước mặt. Ta xóa sổ chúng."
          },
          8: {
            name: "Giai đoạn 8: Cataclysm",
            shortName: "Cataclysm",
            effects: "Bão lửa địa ngục vây quanh lưỡi kiếm; không nơi nào an toàn. Cơ bản 5,600 Sát thương và 100,000 Máu.",
            notification: "Hãy nhìn quanh đi. Không còn nơi nào để chạy trốn nữa đâu."
          },
          9: {
            name: "Giai đoạn 9: Apocalypse",
            shortName: "Apocalypse",
            effects: "Lưỡi kiếm gầm vang sức nóng thiêu đốt của vũ trụ tàn lụi. Cơ bản 10,500 Sát thương và 190,000 Máu.",
            notification: "Ngươi có nghe thấy không? Đó là âm thanh của vạn vật đang cháy rụi."
          },
          10: {
            name: "Giai đoạn 10: Hellfire",
            shortName: "The Infernal",
            effects: "BIẾN ĐỔI TỐI HẬU: CHÚA TỂ HỎA NGỤC. Hỏa ngục diệt thế không thể kìm hãm. Cơ bản 16,800 Sát thương, 320,000 Máu và 145 Tốc độ.",
            notification: "Chạy đi."
          }
        }
      },
      bloodmoon: {
        title: "TRĂNG MÁU",
        subtitle: "Vầng trăng đỏ thẫm mọc lên — bóng tối bao phủ cả thảo nguyên!"
      }
    }
  };

  let currentLang = "en";
  const listeners = [];

  function getNestedValue(obj, keyPath) {
    if (!obj || !keyPath) return null;
    const parts = keyPath.split(".");
    let curr = obj;
    for (const part of parts) {
      if (curr == null || typeof curr !== "object") return null;
      curr = curr[part];
    }
    return curr;
  }

  const I18n = {
    currentLang: "en",
    translations,

    init(lang = "en") {
      this.setLanguage(lang, false);
    },

    getLanguage() {
      return currentLang;
    },

    setLanguage(lang, notify = true) {
      if (lang !== "en" && lang !== "vi") {
        lang = "en";
      }
      currentLang = lang;
      this.currentLang = lang;

      // Update HTML lang attribute
      if (document.documentElement) {
        document.documentElement.setAttribute("lang", lang);
      }

      this.applyToDOM();

      if (notify) {
        listeners.forEach(fn => {
          try {
            fn(currentLang);
          } catch (err) {
            console.error("[I18n Listener Error]", err);
          }
        });
      }
    },

    onLanguageChange(callback) {
      if (typeof callback === "function") {
        listeners.push(callback);
      }
    },

    t(key, params = {}) {
      if (!key) return "";

      // 1. Check current language
      let val = getNestedValue(translations[currentLang], key);

      // 2. Fallback to English
      if (val === null || val === undefined) {
        val = getNestedValue(translations.en, key);
      }

      // 3. Fallback to key itself
      if (val === null || val === undefined) {
        return key;
      }

      if (typeof val !== "string") {
        return val;
      }

      // 4. Interpolate {param}
      return val.replace(/\{([a-zA-Z0-9_]+)\}/g, (match, pName) => {
        return params[pName] !== undefined ? params[pName] : match;
      });
    },

    applyToDOM(root = document) {
      if (!root || !root.querySelectorAll) return;

      // 1. data-i18n (textContent)
      root.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.getAttribute("data-i18n");
        if (key) {
          const text = this.t(key);
          if (text) el.textContent = text;
        }
      });

      // 2. data-i18n-title (title tooltip attribute)
      root.querySelectorAll("[data-i18n-title]").forEach(el => {
        const key = el.getAttribute("data-i18n-title");
        if (key) {
          const text = this.t(key);
          if (text) el.setAttribute("title", text);
        }
      });

      // 3. data-i18n-placeholder (placeholder attribute)
      root.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
        const key = el.getAttribute("data-i18n-placeholder");
        if (key) {
          const text = this.t(key);
          if (text) el.setAttribute("placeholder", text);
        }
      });
    },

    // Localization Helpers for Dynamic Content
    getSwordInfo(swordId) {
      const sId = (swordId || "devourer").toLowerCase();
      const sData = (translations[currentLang].swords && translations[currentLang].swords[sId])
        || translations.en.swords[sId];
      if (sData) return sData;

      const swDef = window.Killstreak && window.Killstreak.Config && window.Killstreak.Config.SWORDS && window.Killstreak.Config.SWORDS[sId];
      if (swDef) {
        return {
          name: swDef.name,
          tag: swDef.tag || "WEAPON",
          description: swDef.description || ""
        };
      }
      return { name: swordId, tag: "WEAPON", description: "" };
    },

    getPhaseInfo(swordId, phaseNumber) {
      const sId = (swordId || "devourer").toLowerCase();
      const pNum = Number(phaseNumber) || 1;
      const phasesDict = (translations[currentLang].phases && translations[currentLang].phases[sId])
        || translations.en.phases[sId]
        || {};
      let phaseData = phasesDict[pNum] || (translations.en.phases[sId] && translations.en.phases[sId][pNum]);
      if (!phaseData) {
        const swDef = window.Killstreak && window.Killstreak.Config && window.Killstreak.Config.SWORDS && window.Killstreak.Config.SWORDS[sId];
        const match = swDef && swDef.phases && swDef.phases.find(p => p.phase === pNum);
        if (match) {
          phaseData = {
            name: match.name,
            shortName: match.shortName,
            effects: match.effects,
            notification: match.notification
          };
        }
      }
      return phaseData || {
        name: `Phase ${pNum}`,
        shortName: `Phase ${pNum}`,
        effects: ""
      };
    },

    getAchievementInfo(achId) {
      const items = (translations[currentLang].achievements && translations[currentLang].achievements.items)
        || translations.en.achievements.items;
      return items[achId] || translations.en.achievements.items[achId] || { title: achId, description: "" };
    },

    getZoneLabel(zoneId) {
      const zones = translations[currentLang].zones || translations.en.zones;
      return zones[zoneId] || translations.en.zones[zoneId] || zoneId;
    },

    getNpcInfo(npcId) {
      if (!npcId) return null;
      const npcs = translations[currentLang].npcs || translations.en.npcs;
      return (npcs && npcs[npcId]) || (translations.en.npcs && translations.en.npcs[npcId]) || null;
    },

    getMapName(mapId) {
      if (!mapId) return "";
      const maps = translations[currentLang].maps || translations.en.maps;
      let upper = String(mapId).toUpperCase();
      if (upper === "GRASSLAND") upper = "COMBAT";
      return maps[upper] || maps[mapId] || (translations.en.maps && (translations.en.maps[upper] || translations.en.maps[mapId])) || mapId;
    }
  };

  window.Killstreak.I18n = I18n;
})(window);

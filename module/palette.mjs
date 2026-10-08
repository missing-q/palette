// Import document classes.
import { PaletteActor } from './documents/actor.mjs';
import { PaletteItem } from './documents/item.mjs';
// Import sheet classes.
import { PaletteActorSheet } from './sheets/actor-sheet.mjs';
import { PaletteItemSheet } from './sheets/item-sheet.mjs';
// Import helper/utility classes and constants.
import { PALETTE } from './helpers/config.mjs';
import { PaletteHbsHelpers } from './helpers/handlebars.mjs';
// Import DataModel classes
import * as models from './data/_module.mjs';
//import color dice and command
import { ColorDie } from './dice/die.mjs';
import { ColorRoll } from './dice/roll.mjs';
import { addToHand, handleColorCommand } from './dice/command.mjs';

const collections = foundry.documents.collections;
const sheets = foundry.appv1.sheets;

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

// Add key classes to the global scope so they can be more easily used
// by downstream developers
globalThis.palette = {
  documents: {
    PaletteActor,
    PaletteItem,
  },
  applications: {
    PaletteActorSheet,
    PaletteItemSheet,
  },
  utils: {
    rollItemMacro,
  },
  models,
};

Hooks.once('init', function () {
  // Add custom constants for configuration.
  CONFIG.PALETTE = PALETTE;

  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  CONFIG.Combat.initiative = {
    formula: '1d20 + @abilities.dex.mod',
    decimals: 2,
  };

  // Define custom Document and DataModel classes
  CONFIG.Actor.documentClass = PaletteActor;

  // Note that you don't need to declare a DataModel
  // for the base actor/item classes - they are included
  // with the Character/NPC as part of super.defineSchema()
  CONFIG.Actor.dataModels = {
    character: models.PaletteCharacter,
    npc: models.PaletteNPC,
  };
  CONFIG.Item.documentClass = PaletteItem;
  CONFIG.Item.dataModels = {
    gear: models.PaletteGear,
    feature: models.PaletteFeature,
    spell: models.PaletteSpell,
    hue : models.PaletteHue,
  };

  // Active Effects are never copied to the Actor,
  // but will still apply to the Actor from within the Item
  // if the transfer property on the Active Effect is true.
  CONFIG.ActiveEffect.legacyTransferral = false;
  CONFIG.statusEffects = PALETTE.statusEffects;

  // Register sheet application classes
  collections.Actors.unregisterSheet('core', sheets.ActorSheet);
  collections.Actors.registerSheet('palette', PaletteActorSheet, {
    makeDefault: true,
    label: 'PALETTE.SheetLabels.Actor',
  });
  collections.Items.unregisterSheet('core', sheets.ItemSheet);
  collections.Items.registerSheet('palette', PaletteItemSheet, {
    makeDefault: true,
    label: 'PALETTE.SheetLabels.Item',
  });

  CONFIG.Dice.terms["c"] = ColorDie; 
  CONFIG.Dice.types.push(ColorDie); // add color dice
  CONFIG.Dice.rolls.push(ColorRoll);
  //register color chat command
    ChatLog.CHAT_COMMANDS.rc = {
      rgx: /^\/rc(?:\s+(\d+)(h?|c?))?\s*$/i, //fuck regex all my homies hate regex
      fn: handleColorCommand,
  };
  //register handlebars helpers
  PaletteHbsHelpers.init();

});

/* -------------------------------------------- */
/*  Handlebars Helpers                          */
/* -------------------------------------------- */

// If you need to add Handlebars helpers, here is a useful example:
Handlebars.registerHelper('toLowerCase', function (str) {
  return str.toLowerCase();
});

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once('ready', function () {
  
  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on('hotbarDrop', (bar, data, slot) => createDocMacro(data, slot));

  /** Render Actor Sheet Hook */

  Hooks.on('renderActorSheetV2', (app, html, context) => {
    //Chroma overflow buttons
    html.querySelectorAll('.chroma-overflow').forEach(el => {
      el.addEventListener('click', ev => {
        var color = ev.target.dataset.color
        let actor = context.actor;
        let data = {
          "system.points.chroma": actor.system.points.chroma + 1
        }
        data[`system.wheel.${color}.value`] = "2"
        console.log(data)
        actor.update(data) //reset to default
      })
    });
    //Taint underflow buttons
    html.querySelectorAll('.taint-underflow').forEach(el => {
      el.addEventListener('click', async ev => {
        let color = ev.target.dataset.color
        let actor = context.actor;
        let data = {}
        data[`system.wheel.${color}.value`] = "2" //reset value
        console.log(data)
        actor.update(data) //reset to default

        //create taint ae
        const effect = await ActiveEffect.fromStatusEffect('taint');
        const style = getComputedStyle(document.body);
        const hex = style.getPropertyValue(`--chromatic-${color}`);
        effect.updateSource({ tint: hex || "#ffffff", });
        await actor.createEmbeddedDocuments("ActiveEffect", [effect]);
      })
    });
  });

  /** HTML Hooks */
  Hooks.on('renderChatMessageHTML', (message, html, context={}) => {
    //Add to Hand
    html.querySelectorAll('.hand-button').forEach(el => {
      el.addEventListener('click', ev => { 
        addToHand(message)
      })
    });
  })
  
});

/* -------------------------------------------- */
/*  Localization Hook                           */
/* -------------------------------------------- */

Hooks.once('i18nInit', () => {
  //adds in localized descriptions for statuses
  for (const [key, obj] of Object.entries(CONFIG.statusEffects)) {
    const base = `PALETTE.Statuses.${key}`;
    const benefit = game.i18n.localize(`${base}.benefit`);
    const consequence = game.i18n.localize(`${base}.consequence`);
    const heal = game.i18n.localize(`${base}.heal`);

    obj.description = `
      <b>${game.i18n.localize('PALETTE.Statuses.labels.benefit')}:</b> ${benefit}<br>
      <b>${game.i18n.localize('PALETTE.Statuses.labels.consequence')}:</b> ${consequence}<br>
      <b>${game.i18n.localize('PALETTE.Statuses.labels.heal')}:</b> ${heal}
    `;
  }
});

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
async function createDocMacro(data, slot) {
  // First, determine if this is a valid owned item.
  if (data.type !== 'Item') return;
  if (!data.uuid.includes('Actor.') && !data.uuid.includes('Token.')) {
    return ui.notifications.warn(
      'You can only create macro buttons for owned Items'
    );
  }
  // If it is, retrieve it based on the uuid.
  const item = await Item.fromDropData(data);

  // Create the macro command using the uuid.
  const command = `game.palette.rollItemMacro("${data.uuid}");`;
  let macro = game.macros.find(
    (m) => m.name === item.name && m.command === command
  );
  if (!macro) {
    macro = await Macro.create({
      name: item.name,
      type: 'script',
      img: item.img,
      command: command,
      flags: { 'palette.itemMacro': true },
    });
  }
  game.user.assignHotbarMacro(macro, slot);
  return false;
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemUuid
 */
function rollItemMacro(itemUuid) {
  // Reconstruct the drop data so that we can load the item.
  const dropData = {
    type: 'Item',
    uuid: itemUuid,
  };
  // Load the item from the uuid.
  Item.fromDropData(dropData).then((item) => {
    // Determine if the item loaded and if it's an owned item.
    if (!item || !item.parent) {
      const itemName = item?.name ?? itemUuid;
      return ui.notifications.warn(
        `Could not find item ${itemName}. You may need to delete and recreate this macro.`
      );
    }

    // Trigger the item roll
    item.roll();
  });
}

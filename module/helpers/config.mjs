export const PALETTE = {};

/**
 * The set of Ability Scores used within the system.
 * @type {Object}
 */
PALETTE.abilities = {
  str: 'PALETTE.Ability.Str.long',
  dex: 'PALETTE.Ability.Dex.long',
  con: 'PALETTE.Ability.Con.long',
  int: 'PALETTE.Ability.Int.long',
  wis: 'PALETTE.Ability.Wis.long',
  cha: 'PALETTE.Ability.Cha.long',
};

PALETTE.abilityAbbreviations = {
  str: 'PALETTE.Ability.Str.abbr',
  dex: 'PALETTE.Ability.Dex.abbr',
  con: 'PALETTE.Ability.Con.abbr',
  int: 'PALETTE.Ability.Int.abbr',
  wis: 'PALETTE.Ability.Wis.abbr',
  cha: 'PALETTE.Ability.Cha.abbr',
};

PALETTE.colors = ["white", "black", "red", "blue", "green", "yellow" ];

PALETTE.colorMap = //map values to labels
{
  white: 'PALETTE.Colors.White',
  black: 'PALETTE.Colors.Black',
  red: 'PALETTE.Colors.Red',
  blue: 'PALETTE.Colors.Blue',
  green: 'PALETTE.Colors.Green',
  yellow: 'PALETTE.Colors.Yellow',
}

PALETTE.statusEffects = {
  shock: {
    name: 'PALETTE.Statuses.shock.label',
    id: 'shock',
    img: 'systems/palette/assets/shock.svg',
    changes: [
      { key: "system.attributes.stress.max", mode: 'add', value: '-@surge' }
    ]
  },
  wound: {
    name: 'PALETTE.Statuses.wound.label',
    id: 'wound',
    img: 'systems/palette/assets/wound.svg',
    changes: [
      { }
    ]
  },
  mortality: {
    name: 'PALETTE.Statuses.mortality.label',
    id: 'mortality',
    img: 'systems/palette/assets/mortality.svg',
    changes: [
      { }
    ]
  },
  taint: {
    name: 'PALETTE.Statuses.taint.label',
    id: 'taint',
    img: 'systems/palette/assets/taint.svg',
    changes: [
      { }
    ]
  },
  broken: {
    name: 'PALETTE.Statuses.broken.label',
    id: 'broken',
    img: 'systems/palette/assets/broken.svg',
    changes: [
      { }
    ]
  }
}

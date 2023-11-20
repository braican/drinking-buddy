export const states = {
  AL: 'Alabama',
  AK: 'Alaska',
  AZ: 'Arizona',
  AR: 'Arkansas',
  CA: 'California',
  CO: 'Colorado',
  CT: 'Connecticut',
  DE: 'Delaware',
  DC: 'District Of Columbia',
  FL: 'Florida',
  GA: 'Georgia',
  HI: 'Hawaii',
  ID: 'Idaho',
  IL: 'Illinois',
  IN: 'Indiana',
  IA: 'Iowa',
  KS: 'Kansas',
  KY: 'Kentucky',
  LA: 'Louisiana',
  ME: 'Maine',
  MD: 'Maryland',
  MA: 'Massachusetts',
  MI: 'Michigan',
  MN: 'Minnesota',
  MS: 'Mississippi',
  MO: 'Missouri',
  MT: 'Montana',
  NE: 'Nebraska',
  NV: 'Nevada',
  NH: 'New Hampshire',
  NJ: 'New Jersey',
  NM: 'New Mexico',
  NY: 'New York',
  NC: 'North Carolina',
  ND: 'North Dakota',
  OH: 'Ohio',
  OK: 'Oklahoma',
  OR: 'Oregon',
  PA: 'Pennsylvania',
  RI: 'Rhode Island',
  SC: 'South Carolina',
  SD: 'South Dakota',
  TN: 'Tennessee',
  TX: 'Texas',
  UT: 'Utah',
  VT: 'Vermont',
  VA: 'Virginia',
  WA: 'Washington',
  WV: 'West Virginia',
  WI: 'Wisconsin',
  WY: 'Wyoming',
};

/**
 * This is a mapping of styles from user-friendly selectable options in a dropdown
 * to the styles that are present in Untappd checkins. You can view the available
 * styles by running `npm run get-styles`.
 *
 * Style map draws some insipration from the definitions on craftbeer.com.
 * @link https://www.craftbeer.com/beer-styles
 */
export const styles = {
  'English Ale': [
    'Bitter - Extra Special / Strong (ESB)',
    'Bitter - Session / Ordinary',
    'English Bitter',
    'English Mild Ale',
    'Extra Special / Strong Bitter',
    'Mild - Dark',
    'Mild - Other',
    'Old Ale',
    'Scotch Ale / Wee Heavy',
    'Scottish Ale',
    'Scottish Export Ale',
  ],
  Belgian: [
    'Belgian Blonde',
    'Belgian Dubbel',
    'Belgian Quadrupel',
    'Belgian Strong Dark Ale',
    'Belgian Strong Golden Ale',
    'Belgian Tripel',
    'Patersbier',
  ],
  // Traaditionally German
  Bock: [
    'Bock - Doppelbock',
    'Bock - Eisbock',
    'Bock - Eisbock (Traditional)',
    'Bock - Hell / Maibock / Lentebock',
    'Bock - Single / Traditional',
    'Bock - Weizenbock',
  ],
  Kölsch: ['Kölsch'],
  Altbier: ['Altbier'],
  Oktoberfest: ['Märzen', 'Festbier'],
  Schwarzbier: ['Schwarzbier'],
  Dunkelweizen: ['Dunkelweizen', 'Wheat Beer - Dunkelweizen'],
  Hefeweizen: ['Hefeweizen', 'Wheat Beer - Hefeweizen', 'Kristallweizen'],
  Roggenbier: ['Roggenbier'],
  Kellerbier: ['Kellerbier / Zwickelbier'],
  Dunkel: ['Lager - Munich Dunkel'],

  // Pale ales
  IPA: [
    'IPA - American',
    'IPA - Belgian',
    'IPA - Black / Cascadian Dark Ale',
    'IPA - Brett',
    'IPA - Brut',
    'IPA - Cold',
    'IPA - English',
    'IPA - Farmhouse',
    'IPA - Imperial / Double',
    'IPA - Imperial / Double Black',
    'IPA - Imperial / Double Milkshake',
    'IPA - Imperial / Double New England',
    'IPA - Imperial / Double New England / Hazy',
    'IPA - International',
    'IPA - Milkshake',
    'IPA - New England',
    'IPA - New England / Hazy',
    'IPA - New Zealand',
    'IPA - Other',
    'IPA - Quadruple',
    'IPA - Red',
    'IPA - Rye',
    'IPA - Session',
    'IPA - Session / India Session Ale',
    'IPA - Sour',
    'IPA - Triple',
    'IPA - Triple New England',
    'IPA - Triple New England / Hazy',
    'IPA - White    ',
  ],
  'Pale Ale': [
    'Pale Ale - American',
    'Pale Ale - Australian',
    'Pale Ale - Belgian',
    'Pale Ale - English',
    'Pale Ale - International',
    'Pale Ale - New England',
    'Pale Ale - New England / Hazy',
    'Pale Ale - New Zealand',
    'Pale Ale - Other',
  ],
  'Blonde Ale': ['Blonde Ale', 'Golden Ale', 'Golden Ale - English', 'Golden Ale - Other'],

  // Sours and funk
  Sour: [
    'Fruit Beer',
    'American Wild Ale',
    'Brett Beer',
    'Wild Ale - American',
    'Wild Ale - Other',
    'Sour - Berliner Weisse',
    'Sour - Flanders Oud Bruin',
    'Sour - Flanders Red Ale',
    'Sour - Fruited',
    'Sour - Fruited Berliner Weisse',
    'Sour - Fruited Gose',
    'Sour - Gose',
    'Sour - Other',
    'Sour - Smoothie / Pastry',
  ],
  Farmhouse: [
    'Farmhouse Ale - Bière de Coupage',
    'Farmhouse Ale - Bière de Garde',
    'Farmhouse Ale - Grisette',
    'Farmhouse Ale - Other',
    'Farmhouse Ale - Saison',
    'Grisette',
  ],
  Lambic: ['Lambic - Fruit', 'Lambic - Gueuze', 'Lambic - Kriek', 'Lambic - Traditional'],

  // Lagers and pilsners
  'Amber Lager': [
    'Lager - Amber',
    'Lager - Amber / Red',
    'Lager - American Amber / Red',
    'Lager - Red',
  ],
  Lager: [
    'Lager - American',
    'Lager - American Light',
    'Lager - Euro Pale',
    'Lager - Other',
    'Lager - Pale',
  ],
  'Dark Lager': ['Lager - Dark', 'Lager - Euro Dark'],
  'Export Lager': ['Lager - Dortmunder / Export'],
  'Helles Lager': ['Lager - Helles'],
  IPL: ['Lager - IPL (India Pale Lager)'],
  'Japanese Lager': ['Lager - Japanese Rice'],
  'Mexican Lager': ['Lager - Mexican'],
  'Vienna Lager': ['Lager - Vienna'],
  Pilsner: [
    'Pilsner - Czech',
    'Pilsner - Czech / Bohemian',
    'Pilsner - German',
    'Pilsner - Imperial / Double',
    'Pilsner - Italian',
    'Pilsner - New Zealand',
    'Pilsner - Other',
  ],

  // Dark ales
  Stout: [
    'Stout - American',
    'Stout - Coffee',
    'Stout - Foreign / Export',
    'Stout - Imperial / Double',
    'Stout - Imperial / Double Coffee',
    'Stout - Imperial / Double Milk',
    'Stout - Imperial / Double Oatmeal',
    'Stout - Imperial / Double Pastry',
    'Stout - Irish Dry',
    'Stout - Milk / Sweet',
    'Stout - Oatmeal',
    'Stout - Other',
    'Stout - Oyster',
    'Stout - Pastry',
    'Stout - Russian Imperial',
  ],
  'White Stout': ['Stout - White', 'Stout - White / Golden', 'Stout - Imperial / Double White'],
  Porter: [
    'Porter - American',
    'Porter - Baltic',
    'Porter - Coffee',
    'Porter - English',
    'Porter - Imperial / Double',
    'Porter - Imperial / Double Baltic',
    'Porter - Imperial / Double Coffee',
    'Porter - Other',
  ],
  'Dark Ale': ['Dark Ale'],

  // Hybrids
  'Cream Ale': ['Cream Ale'],
  'California Common': ['California Common'],
  'Spice Beer': ['Gruit / Ancient Herbed Ale', 'Spiced / Herbed Beer'],
  'Smoked Beer': ['Smoked Beer', 'Grätzer / Grodziskie', 'Grodziskie / Grätzer', 'Rauchbier'],
  'Black & Tan': ['Black & Tan'],
  'Shandy / Radler': ['Shandy / Radler'],
  'Table Beer': ['Table Beer'],
  'Strong Ale': ['Strong Ale - American', 'Strong Ale - English', 'Strong Ale - Other'],

  // Wheat beers
  'Wheat Beer': [
    'Wheat Beer - American Pale Wheat',
    'Wheat Beer - Other',
    'Wheat Beer - Witbier',
    'Wheat Beer - Witbier / Blanche',
  ],
  'Wheat Wine': ['Wheat Beer - Wheat Wine'],

  // Other styles
  'Brown Ale': [
    'Brown Ale - American',
    'Brown Ale - Belgian',
    'Brown Ale - English',
    'Brown Ale - Imperial / Double',
    'Brown Ale - Other',
  ],
  'Red Ale': [
    'Red Ale - American Amber / Red',
    'Red Ale - Imperial / Double',
    'Red Ale - Irish',
    'Red Ale - Other',
  ],
  Rye: ['Rye Beer'],
  Barleywine: ['Barleywine - American', 'Barleywine - English', 'Barleywine - Other', 'Rye Wine'],
  'Bière de Champagne': ['Bière de Champagne / Bière Brut'],
  'Gluten-Free Beer': ['Gluten-Free'],
  Kvass: ['Kvass'],
  'Historical Beer': ['Historical Beer - Adambier', 'Historical Beer - Kottbusser'],
  'Non-alcoholic': ['Non-Alcoholic Beer - Lager', 'Non-Alcoholic Beer - Other'],

  // Seasonals
  'Pumpkin Beer': ['Pumpkin / Yam Beer'],
  'Winter Beer': ['Winter Ale', 'Winter Warmer', 'Lager - Winter'],

  // Not beer
  Mead: ['Mead - Braggot'],
  Cider: [
    'Cider - Dry',
    'Cider - Graff',
    'Cider - Herbed / Spiced / Hopped',
    'Cider - Traditional',
  ],
  'Malt Liquor': ['Malt Liquor ', 'Malt Liquor'],
  'Hard Seltzer': ['Hard Seltzer'],
};

/**
 * This map is used to organize and group the different styles into optgroups to
 * to make the <select> dropdown easier to parse.
 */
export const styleOptGroups = [
  {
    group: 'Pale Lagers',
    styles: [
      'Lager',
      'Pilsner',
      'Amber Lager',
      'Export Lager',
      'Helles Lager',
      'IPL',
      'Japanese Lager',
      'Mexican Lager',
      'Vienna Lager',
    ],
  },
  {
    group: 'Dark Lagers',
    styles: ['Dark Lager', 'Schwarzbier'],
  },
  {
    group: 'Ales',
    styles: ['IPA', 'Pale Ale', 'Blonde Ale', 'Brown Ale', 'Red Ale'],
  },
  {
    group: 'Stouts and Porters',
    styles: ['Stout', 'White Stout', 'Porter', 'Dark Ale'],
  },
  {
    group: 'Sour and funk',
    styles: ['Sour', 'Farmhouse', 'Lambic'],
  },
  {
    group: 'Wheat Beers',
    styles: ['Wheat Beer'],
  },
  {
    group: 'Strong Styles',
    styles: ['Strong Ale', 'Wheat Wine', 'Barleywine'],
  },
  {
    group: 'Hybrid and Specialty styles',
    styles: [
      'Rye',
      'Cream Ale',
      'California Common',
      'Spice Beer',
      'Smoked Beer',
      'Black & Tan',
      'Shandy / Radler',
      'Table Beer',
      'Bière de Champagne',
      'Kvass',
      'Historical Beer',
    ],
  },
  {
    group: 'Seasonal Styles',
    styles: ['Oktoberfest', 'Pumpkin Beer', 'Winter Beer'],
  },
  {
    group: 'English Styles',
    styles: ['English Ale'],
  },
  {
    group: 'Belgian Styles',
    styles: ['Belgian'],
  },
  {
    group: 'German Styles',
    styles: [
      'Bock',
      'Kölsch',
      'Altbier',
      'Dunkelweizen',
      'Hefeweizen',
      'Roggenbier',
      'Kellerbier',
      'Dunkel',
    ],
  },
  {
    group: 'Other Styles',
    styles: ['Gluten-Free Beer', 'Non-alcoholic', 'Mead', 'Ciider', 'Malt Liquor', 'Hard Seltzer'],
  },
];
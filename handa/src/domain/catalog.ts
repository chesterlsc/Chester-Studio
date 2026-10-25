import type { CatalogItem } from './types';

/**
 * The item catalog. Names are plain words. personDaysPerUnit is against the
 * baseline of 4 L water / person / day and ~2,100 kcal / person / day.
 */
export const CATALOG: CatalogItem[] = [
  // ---- WATER ----
  { id: 'water-bottle-1l', category: 'water', name: { en: 'Bottled water 1 L', tl: 'Bottled water 1 L' }, unit: 'bottle', personDaysPerUnit: 0.25, shape: 'bottle', shelfLifeDays: 365, step: 6, buy: 'bottled water 1L', tip: { en: '4 liters per person per day: 3 to drink, 1 to wash.', tl: '4 litro kada tao kada araw: 3 pang-inom, 1 panghugas.' } },
  { id: 'water-gallon-5', category: 'water', name: { en: 'Water gallon 5 gal (19 L)', tl: 'Galon ng tubig 5 gal (19 L)' }, unit: 'pc', personDaysPerUnit: 4.75, shape: 'gallon', shelfLifeDays: 180, step: 1, buy: 'water gallon container 5 gallons', tip: { en: 'Refill at a water station before the storm hits.', tl: 'Mag-refill sa water station bago dumating ang bagyo.' } },
  { id: 'water-drum', category: 'water', name: { en: 'Water drum 200 L (filled)', tl: 'Drum ng tubig 200 L (puno)' }, unit: 'pc', personDaysPerUnit: 50, shape: 'drum', shelfLifeDays: 180, step: 1, buy: 'water drum 200L food grade', tip: { en: 'Cover it. Use this water for washing and flushing.', tl: 'Takpan. Gamitin ito panghugas at pang-flush.' } },
  { id: 'water-purifier-tabs', category: 'water', name: { en: 'Water purification tablets', tl: 'Tableta pang-linis ng tubig' }, unit: 'pack', neededPerHousehold: 1, perDays: 30, shape: 'pouch', shelfLifeDays: 1095, buy: 'water purification tablets', scenarioWeight: { flood: 2, typhoon: 1.5, zombie: 2, earthquake: 1.5 } },
  { id: 'water-filter', category: 'water', name: { en: 'Portable water filter', tl: 'Portable water filter' }, unit: 'pc', neededPerHousehold: 1, shape: 'bottle', buy: 'portable water filter straw', scenarioWeight: { flood: 2, zombie: 2, water: 1.5 } },

  // ---- FOOD ----
  { id: 'rice-kg', category: 'food', name: { en: 'Rice (1 kg)', tl: 'Bigas (1 kilo)' }, unit: 'kg', personDaysPerUnit: 1.6, shape: 'sack', shelfLifeDays: 365, step: 2, buy: 'rice 5kg', tip: { en: 'Needs water and fuel to cook. Pair with a butane stove.', tl: 'Kailangan ng tubig at gas para lutuin. Ipares sa butane stove.' } },
  { id: 'canned-sardines', category: 'food', name: { en: 'Canned sardines', tl: 'De-latang sardinas' }, unit: 'can', personDaysPerUnit: 0.2, shape: 'can', shelfLifeDays: 730, step: 6, buy: 'sardines can pack' },
  { id: 'canned-meat', category: 'food', name: { en: 'Canned meat / corned beef', tl: 'De-latang karne / corned beef' }, unit: 'can', personDaysPerUnit: 0.25, shape: 'can', shelfLifeDays: 1095, step: 6, buy: 'corned beef can' },
  { id: 'instant-noodles', category: 'food', name: { en: 'Instant noodles', tl: 'Instant noodles' }, unit: 'pack', personDaysPerUnit: 0.18, shape: 'pouch', shelfLifeDays: 240, step: 10, buy: 'instant noodles pack' },
  { id: 'biscuits', category: 'food', name: { en: 'Biscuits / crackers', tl: 'Biskwit / crackers' }, unit: 'pack', personDaysPerUnit: 0.4, shape: 'box', shelfLifeDays: 240, step: 4, buy: 'crackers biscuits pack', tip: { en: 'No cooking needed. Good for day one.', tl: 'Hindi na kailangan lutuin. Mabuti sa unang araw.' } },
  { id: 'canned-beans', category: 'food', name: { en: 'Canned beans / vegetables', tl: 'De-latang beans / gulay' }, unit: 'can', personDaysPerUnit: 0.2, shape: 'can', shelfLifeDays: 1095, step: 6, buy: 'canned beans' },
  { id: 'peanut-butter', category: 'food', name: { en: 'Peanut butter', tl: 'Peanut butter' }, unit: 'jar', personDaysPerUnit: 1.2, shape: 'jar', shelfLifeDays: 365, step: 1, buy: 'peanut butter jar' },
  { id: 'butane-stove', category: 'food', name: { en: 'Butane stove + canisters', tl: 'Butane stove + lata ng gas' }, unit: 'set', neededPerHousehold: 1, shape: 'tool', buy: 'portable butane stove', scenarioWeight: { brownout: 2, typhoon: 1.5, zombie: 1.5 } },
  { id: 'dried-fish', category: 'food', name: { en: 'Dried fish / tuyo', tl: 'Tuyo / daing' }, unit: 'pack', personDaysPerUnit: 0.5, shape: 'pouch', shelfLifeDays: 120, step: 2, buy: 'dried fish tuyo' },

  // ---- CANNING & PRESERVATION ----
  { id: 'mason-jars', category: 'canning', name: { en: 'Glass jars with lids', tl: 'Garapon na may takip' }, unit: 'pc', neededPerHousehold: 6, shape: 'jar', buy: 'mason jars set' },
  { id: 'salt-sugar', category: 'canning', name: { en: 'Salt + sugar (1 kg each)', tl: 'Asin + asukal (1 kilo bawat isa)' }, unit: 'set', neededPerHousehold: 1, perDays: 90, shape: 'sack', shelfLifeDays: 1095, buy: 'rock salt 1kg' },
  { id: 'vinegar', category: 'canning', name: { en: 'Vinegar (1 L)', tl: 'Suka (1 L)' }, unit: 'bottle', neededPerHousehold: 1, perDays: 60, shape: 'bottle', shelfLifeDays: 730, buy: 'vinegar 1L' },
  { id: 'cooking-oil', category: 'canning', name: { en: 'Cooking oil (1 L)', tl: 'Mantika (1 L)' }, unit: 'bottle', neededPerHousehold: 1, perDays: 30, shape: 'bottle', shelfLifeDays: 365, buy: 'cooking oil 1L' },
  { id: 'ziplock', category: 'canning', name: { en: 'Sealable bags / containers', tl: 'Ziplock / lalagyan na may takip' }, unit: 'pack', neededPerHousehold: 1, shape: 'box', buy: 'food storage containers set' },

  // ---- MEDICINE & FIRST AID ----
  { id: 'first-aid-kit', category: 'medicine', name: { en: 'First aid kit', tl: 'First aid kit' }, unit: 'set', neededPerHousehold: 1, shape: 'kit', buy: 'first aid kit', tip: { en: 'Bandages, gauze, tape, antiseptic, gloves, scissors.', tl: 'Bandage, gauze, tape, antiseptic, gloves, gunting.' } },
  { id: 'paracetamol', category: 'medicine', name: { en: 'Fever/pain reliever (paracetamol)', tl: 'Gamot sa lagnat (paracetamol)' }, unit: 'pack', neededPerHousehold: 1, perDays: 30, shape: 'box', shelfLifeDays: 730, buy: 'paracetamol 500mg', tip: { en: 'Follow the label. Ask a pharmacist for kids and seniors.', tl: 'Sundin ang label. Magtanong sa parmasyutiko para sa bata at matanda.' } },
  { id: 'ors', category: 'medicine', name: { en: 'Oral rehydration salts', tl: 'Oral rehydration salts (ORS)' }, unit: 'pack', neededPerPerson: 2, perDays: 30, shape: 'pouch', shelfLifeDays: 730, buy: 'oral rehydration salts', scenarioWeight: { flood: 2, heat: 2, water: 2 } },
  { id: 'maintenance-meds', category: 'medicine', name: { en: 'Maintenance meds (extra supply)', tl: 'Maintenance na gamot (dagdag na supply)' }, unit: 'pack', neededPerPerson: 1, perDays: 30, requires: ['seniors'], shape: 'box', buy: 'pill organizer', tip: { en: 'Ask your doctor for a 1-month buffer.', tl: 'Humingi sa doktor ng 1-buwang dagdag.' } },
  { id: 'antiseptic', category: 'medicine', name: { en: 'Antiseptic + alcohol', tl: 'Antiseptic + alcohol' }, unit: 'bottle', neededPerHousehold: 1, perDays: 30, shape: 'bottle', shelfLifeDays: 730, buy: 'betadine alcohol' },
  { id: 'masks-n95', category: 'medicine', name: { en: 'Face masks (N95 or surgical)', tl: 'Face mask (N95 o surgical)' }, unit: 'pack', neededPerHousehold: 1, perDays: 30, shape: 'mask', buy: 'N95 mask box', scenarioWeight: { flood: 1.5, earthquake: 2, zombie: 1.5 } },
  { id: 'insect-repellent', category: 'medicine', name: { en: 'Insect repellent', tl: 'Pang-tanggal ng lamok' }, unit: 'bottle', neededPerHousehold: 1, perDays: 30, shape: 'bottle', buy: 'insect repellent lotion', scenarioWeight: { flood: 2, typhoon: 1.5 } },

  // ---- BABY & CHILD ----
  { id: 'formula', category: 'baby', name: { en: 'Milk formula', tl: 'Gatas (formula)' }, unit: 'can', personDaysPerUnit: 6, requires: ['babies'], shape: 'can', shelfLifeDays: 365, step: 1, buy: 'infant formula' },
  { id: 'diapers', category: 'baby', name: { en: 'Diapers', tl: 'Diaper' }, unit: 'pack', neededPerPerson: 1, perDays: 7, requires: ['babies'], shape: 'box', buy: 'diapers pack', tip: { en: 'About 6 a day for a baby.', tl: 'Mga 6 kada araw para sa sanggol.' } },
  { id: 'wipes', category: 'baby', name: { en: 'Baby wipes', tl: 'Baby wipes' }, unit: 'pack', neededPerPerson: 1, perDays: 7, requires: ['babies', 'kids'], shape: 'pouch', buy: 'baby wipes' },
  { id: 'kids-meds', category: 'baby', name: { en: 'Kids fever drops / syrup', tl: 'Gamot sa lagnat ng bata (drops / syrup)' }, unit: 'bottle', neededPerHousehold: 1, requires: ['babies', 'kids'], shape: 'bottle', shelfLifeDays: 365, buy: 'paracetamol drops' },
  { id: 'comfort-item', category: 'baby', name: { en: 'Comfort toy + small games', tl: 'Laruan at pampalipas-oras' }, unit: 'set', neededPerHousehold: 1, requires: ['babies', 'kids'], shape: 'box', buy: 'kids activity book' },
  { id: 'bottles-sterile', category: 'baby', name: { en: 'Feeding bottles + sterilizing tabs', tl: 'Bote ng sanggol + sterilizing tabs' }, unit: 'set', neededPerHousehold: 1, requires: ['babies'], shape: 'bottle', buy: 'baby bottle sterilizer tablets' },

  // ---- POWER & LIGHTS ----
  { id: 'flashlight', category: 'power', name: { en: 'Flashlight / LED lamp', tl: 'Flashlight / LED lamp' }, unit: 'pc', neededPerHousehold: 2, shape: 'lamp', buy: 'rechargeable LED lantern', tip: { en: 'Never candles near kids or when there is gas.', tl: 'Huwag kandila malapit sa bata o kung may gas.' } },
  { id: 'batteries', category: 'power', name: { en: 'Batteries (AA/AAA)', tl: 'Baterya (AA/AAA)' }, unit: 'pack', neededPerHousehold: 2, perDays: 14, shape: 'battery', shelfLifeDays: 1825, buy: 'AA batteries pack' },
  { id: 'powerbank', category: 'power', name: { en: 'Power bank (20,000 mAh)', tl: 'Power bank (20,000 mAh)' }, unit: 'pc', neededPerHousehold: 1, perDays: 7, shape: 'powerbank', buy: 'power bank 20000mAh', scenarioWeight: { brownout: 2, typhoon: 1.5 } },
  { id: 'solar-panel', category: 'power', name: { en: 'Solar charger / panel', tl: 'Solar charger / panel' }, unit: 'pc', neededPerHousehold: 1, shape: 'panel', buy: 'solar panel charger foldable', scenarioWeight: { brownout: 2, heat: 1.5, zombie: 2 } },
  { id: 'rechargeable-fan', category: 'power', name: { en: 'Rechargeable fan', tl: 'Rechargeable na bentilador' }, unit: 'pc', neededPerHousehold: 1, shape: 'tool', buy: 'rechargeable fan', scenarioWeight: { heat: 3, brownout: 2 } },
  { id: 'extension-cord', category: 'power', name: { en: 'Extension cord + USB cables', tl: 'Extension cord + USB cable' }, unit: 'set', neededPerHousehold: 1, shape: 'rope', buy: 'extension cord USB' },

  // ---- SHELTER & REPAIR ----
  { id: 'tarp', category: 'shelter', name: { en: 'Tarpaulin / trapal', tl: 'Trapal' }, unit: 'pc', neededPerHousehold: 1, shape: 'tarp', buy: 'tarpaulin heavy duty', scenarioWeight: { typhoon: 2, earthquake: 1.5 } },
  { id: 'rope', category: 'shelter', name: { en: 'Rope (20 m)', tl: 'Lubid (20 m)' }, unit: 'roll', neededPerHousehold: 1, shape: 'rope', buy: 'nylon rope 20m' },
  { id: 'duct-tape', category: 'shelter', name: { en: 'Duct tape', tl: 'Duct tape' }, unit: 'roll', neededPerHousehold: 2, shape: 'roll', buy: 'duct tape' },
  { id: 'tools', category: 'shelter', name: { en: 'Basic tools (hammer, pliers, nails)', tl: 'Mga gamit (martilyo, plais, pako)' }, unit: 'set', neededPerHousehold: 1, shape: 'tool', buy: 'tool set home' },
  { id: 'plywood', category: 'shelter', name: { en: 'Plywood / boards for windows', tl: 'Plywood para sa bintana' }, unit: 'pc', neededPerHousehold: 4, shape: 'box', buy: 'marine plywood', scenarioWeight: { typhoon: 2, unrest: 1.5, zombie: 2 } },
  { id: 'sleeping-mat', category: 'shelter', name: { en: 'Sleeping mat + blanket', tl: 'Banig + kumot' }, unit: 'set', neededPerPerson: 1, shape: 'roll', buy: 'foldable sleeping mat', scenarioWeight: { earthquake: 2, flood: 1.5 } },

  // ---- HYGIENE & SANITATION ----
  { id: 'soap', category: 'hygiene', name: { en: 'Soap + shampoo', tl: 'Sabon + shampoo' }, unit: 'set', neededPerHousehold: 1, perDays: 14, shape: 'box', buy: 'bath soap pack' },
  { id: 'tissue', category: 'hygiene', name: { en: 'Toilet paper / tissue', tl: 'Tissue' }, unit: 'roll', neededPerPerson: 1, perDays: 5, shape: 'roll', buy: 'toilet paper 12 rolls' },
  { id: 'trash-bags', category: 'hygiene', name: { en: 'Trash bags (heavy duty)', tl: 'Trash bag (makapal)' }, unit: 'pack', neededPerHousehold: 1, perDays: 14, shape: 'roll', buy: 'heavy duty trash bags', tip: { en: 'Also works as an emergency toilet liner.', tl: 'Puwede rin pang-emergency toilet liner.' } },
  { id: 'sanitary-pads', category: 'hygiene', name: { en: 'Sanitary pads', tl: 'Napkin' }, unit: 'pack', neededPerHousehold: 1, perDays: 30, shape: 'pouch', buy: 'sanitary napkin pack' },
  { id: 'bleach', category: 'hygiene', name: { en: 'Bleach (disinfecting)', tl: 'Zonrox / bleach' }, unit: 'bottle', neededPerHousehold: 1, perDays: 30, shape: 'bottle', buy: 'bleach 1L', scenarioWeight: { flood: 2, water: 1.5 } },
  { id: 'hand-sanitizer', category: 'hygiene', name: { en: 'Hand sanitizer', tl: 'Hand sanitizer' }, unit: 'bottle', neededPerHousehold: 1, perDays: 30, shape: 'bottle', buy: 'hand sanitizer 500ml' },
  { id: 'bucket', category: 'hygiene', name: { en: 'Bucket + dipper (timba at tabo)', tl: 'Timba at tabo' }, unit: 'set', neededPerHousehold: 1, shape: 'bowl', buy: 'pail with cover', scenarioWeight: { water: 2, flood: 1.5 } },

  // ---- COMMS & DOCUMENTS ----
  { id: 'radio', category: 'comms', name: { en: 'Battery / hand-crank radio', tl: 'Radyo (de-baterya / hand-crank)' }, unit: 'pc', neededPerHousehold: 1, shape: 'radio', buy: 'emergency radio hand crank', tip: { en: 'When data is down, AM radio still works.', tl: 'Kapag walang signal, gumagana pa ang AM radio.' } },
  { id: 'documents', category: 'comms', name: { en: 'IDs + documents in a waterproof bag', tl: 'ID at dokumento sa waterproof bag' }, unit: 'set', neededPerHousehold: 1, shape: 'doc', buy: 'waterproof document bag', tip: { en: 'Photos of IDs saved on your phone too.', tl: 'Kuhanan din ng litrato ang mga ID at i-save sa phone.' } },
  { id: 'whistle', category: 'comms', name: { en: 'Whistle', tl: 'Pito' }, unit: 'pc', neededPerPerson: 1, shape: 'whistle', buy: 'emergency whistle', scenarioWeight: { earthquake: 2, flood: 2 } },
  { id: 'contact-card', category: 'comms', name: { en: 'Printed contacts + meeting point', tl: 'Nakalimbag na contacts + tagpuan' }, unit: 'pc', neededPerHousehold: 1, shape: 'doc' },
  { id: 'phone-charged', category: 'comms', name: { en: 'Spare phone / SIM', tl: 'Ekstrang phone / SIM' }, unit: 'pc', neededPerHousehold: 1, shape: 'powerbank', scenarioWeight: { unrest: 1.5, zombie: .5 } },

  // ---- CASH ----
  { id: 'cash-small', category: 'cash', name: { en: 'Cash in small bills (₱500)', tl: 'Cash na barya at maliit na papel (₱500)' }, unit: 'php', neededPerPerson: 1, perDays: 1, shape: 'cash', tip: { en: 'ATMs and GCash die with the power.', tl: 'Walang ATM at GCash kung walang kuryente.' } },
  { id: 'coins', category: 'cash', name: { en: 'Coins for sari-sari / jeep', tl: 'Barya para sa sari-sari / jeep' }, unit: 'set', neededPerHousehold: 1, shape: 'cash' },

  // ---- EDC ----
  { id: 'go-bag', category: 'edc', name: { en: 'Go-bag (backpack)', tl: 'Go-bag (backpack)' }, unit: 'pc', neededPerPerson: 1, shape: 'bag', buy: 'backpack 30L', tip: { en: 'One per person. Kids carry a light one.', tl: 'Isa kada tao. Magaan lang para sa bata.' } },
  { id: 'multitool', category: 'edc', name: { en: 'Multi-tool / knife', tl: 'Multi-tool / kutsilyo' }, unit: 'pc', neededPerHousehold: 1, shape: 'tool', buy: 'multitool' },
  { id: 'headlamp', category: 'edc', name: { en: 'Headlamp', tl: 'Headlamp' }, unit: 'pc', neededPerHousehold: 1, shape: 'lamp', buy: 'headlamp rechargeable' },
  { id: 'rain-gear', category: 'edc', name: { en: 'Raincoat + boots', tl: 'Kapote + bota' }, unit: 'set', neededPerPerson: 1, shape: 'bag', buy: 'raincoat set', scenarioWeight: { typhoon: 2, flood: 2 } },
  { id: 'lighter', category: 'edc', name: { en: 'Lighter / waterproof matches', tl: 'Lighter / posporo' }, unit: 'pc', neededPerHousehold: 2, shape: 'tool', buy: 'waterproof matches' },

  // ---- PETS ----
  { id: 'pet-food', category: 'pets', name: { en: 'Pet food (1 kg)', tl: 'Pagkain ng alaga (1 kilo)' }, unit: 'kg', personDaysPerUnit: 4, requires: ['pets'], shape: 'sack', shelfLifeDays: 365, step: 1, buy: 'dog food 1kg' },
  { id: 'pet-leash', category: 'pets', name: { en: 'Leash / carrier', tl: 'Tali / carrier' }, unit: 'pc', neededPerPerson: 1, requires: ['pets'], shape: 'bag', buy: 'pet carrier' },
  { id: 'pet-bowl', category: 'pets', name: { en: 'Pet bowl + meds', tl: 'Mangkok ng alaga + gamot' }, unit: 'set', neededPerHousehold: 1, requires: ['pets'], shape: 'bowl', buy: 'pet bowl' },

  // ---- SECURITY & SAFETY ----
  { id: 'fire-extinguisher', category: 'security', name: { en: 'Fire extinguisher', tl: 'Fire extinguisher' }, unit: 'pc', neededPerHousehold: 1, shape: 'bottle', buy: 'fire extinguisher 2kg', scenarioWeight: { earthquake: 2, brownout: 1.5 } },
  { id: 'door-lock', category: 'security', name: { en: 'Extra door lock / bar', tl: 'Dagdag na kandado / trangka' }, unit: 'pc', neededPerHousehold: 1, shape: 'lock', buy: 'door security bar', scenarioWeight: { unrest: 3, zombie: 3 } },
  { id: 'smoke-alarm', category: 'security', name: { en: 'Smoke alarm', tl: 'Smoke alarm' }, unit: 'pc', neededPerHousehold: 1, shape: 'radio', buy: 'smoke detector battery' },
  { id: 'blackout-curtain', category: 'security', name: { en: 'Blackout curtain (hide your lights)', tl: 'Makapal na kurtina (itago ang ilaw)' }, unit: 'pc', neededPerHousehold: 2, shape: 'tarp', buy: 'blackout curtain', scenarioWeight: { unrest: 2, zombie: 3, brownout: .5 } },
  { id: 'gloves-safety', category: 'security', name: { en: 'Work gloves + goggles', tl: 'Guwantes + goggles' }, unit: 'pair', neededPerHousehold: 2, shape: 'mask', buy: 'work gloves', scenarioWeight: { earthquake: 2, typhoon: 1.5 } },
];

const byId = new Map(CATALOG.map((i) => [i.id, i]));
export function catalogById(id: string): CatalogItem | undefined { return byId.get(id); }
export function catalogByCategory(cat: CatalogItem['category']): CatalogItem[] { return CATALOG.filter((i) => i.category === cat); }

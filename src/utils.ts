import { Rarity, Weapon, Crate } from './types';
import { WEAPON_TYPES, SKINS_BY_RARITY, RARITY_VALUES } from './constants';

export const generateId = () => Math.random().toString(36).substring(2, 11);

export const getRandomRarity = (probabilities: Record<Rarity, number>): Rarity => {
  const rand = Math.random();
  let cumulative = 0;
  for (const [rarity, prob] of Object.entries(probabilities)) {
    cumulative += prob;
    if (rand <= cumulative) {
      return rarity as Rarity;
    }
  }
  return 'Common';
};

export const generateWeapon = (rarity: Rarity, valueMultiplier: number = 1): Weapon => {
  const type = WEAPON_TYPES[Math.floor(Math.random() * WEAPON_TYPES.length)];
  const skins = SKINS_BY_RARITY[rarity];
  const skin = skins[Math.floor(Math.random() * skins.length)];
  
  // Add some variance to value (+/- 20%)
  const baseValue = RARITY_VALUES[rarity];
  const variance = baseValue * 0.2;
  const value = Math.floor((baseValue - variance + Math.random() * (variance * 2)) * valueMultiplier);
  
  return {
    id: generateId(),
    name: `${type} | ${skin}`,
    type,
    rarity,
    value: Math.max(1, value)
  };
};

export const generateSpecificWeapon = (type: string, skin: string, rarity: Rarity): Weapon => {
  const baseValue = RARITY_VALUES[rarity];
  const variance = baseValue * 0.1;
  const value = Math.floor(baseValue - variance + Math.random() * (variance * 2));
  
  return {
    id: generateId(),
    name: `${type} | ${skin}`,
    type,
    rarity,
    value: Math.max(1, value)
  };
};

export const openCrate = (crate: Crate): Weapon => {
  const rarity = getRandomRarity(crate.probabilities);
  return generateWeapon(rarity, crate.valueMultiplier || 1);
};

export const getXpForLevel = (level: number) => {
  return Math.floor(100 * Math.pow(1.5, level - 1));
};

export const getLevelInfo = (totalXp: number) => {
  let lvl = 1;
  let req = 100;
  let currentXp = totalXp;
  
  while (currentXp >= req) {
    currentXp -= req;
    lvl++;
    req = getXpForLevel(lvl);
  }
  
  return { level: lvl, currentLevelXp: currentXp, requiredXp: req };
};

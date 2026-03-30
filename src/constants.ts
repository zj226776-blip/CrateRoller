import { Rarity, Crate } from './types';

export const WEAPON_TYPES = [
  "Glock-18", "USP-S", "P250", "Desert Eagle", "Five-SeveN", "Tec-9",
  "MAC-10", "MP7", "UMP-45", "P90", "Vector", "MP5-SD",
  "FAMAS", "M4A4", "M4A1-S", "AK-47", "AUG", "SG 553", "SCAR-L", "Galil AR",
  "Nova", "XM1014", "MAG-7", "M249", "Negev",
  "SSG 08", "AWP", "G3SG1", 
  "Karambit", "Butterfly Knife", "M9 Bayonet", "Combat Knife", "Tactical Axe", "Katana", "Huntsman Knife"
];

export const TACTICAL_WEAPONS = [
  "Glock-18", "USP-S", "P250", "Desert Eagle", "Five-SeveN", "Tec-9",
  "MAC-10", "MP7", "UMP-45", "P90", "Vector", "MP5-SD",
  "Karambit", "Butterfly Knife", "M9 Bayonet", "Combat Knife", "Tactical Axe", "Katana", "Huntsman Knife"
];

export const COMBAT_WEAPONS = [
  "FAMAS", "M4A4", "M4A1-S", "AK-47", "AUG", "SG 553", "SCAR-L", "Galil AR",
  "Nova", "XM1014", "MAG-7", "M249", "Negev",
  "SSG 08", "AWP", "G3SG1"
];

export const getWeaponCategory = (type: string): 'Combat' | 'Tactical' => {
  if (TACTICAL_WEAPONS.includes(type)) return 'Tactical';
  return 'Combat';
};

export const SKINS_BY_RARITY: Record<Rarity, string[]> = {
  Common: ["Sand Dune", "Safari Mesh", "Boreal Forest", "Contractor", "Colony", "Mudder", "Storm", "Tornado"],
  Uncommon: ["Night", "Urban DDPAT", "Scorched", "Blue Spruce", "Dry Season", "Candy Apple", "Metallic DDPAT"],
  Rare: ["Redline", "Frontside Misty", "Vulcan", "Water Elemental", "Cyrex", "Guardian", "Neon Rider"],
  Epic: ["Asiimov", "Hyper Beast", "Neo-Noir", "Kill Confirmed", "Bloodsport", "Printstream", "Mecha Industries", "Birthday Wrap"],
  Legendary: ["Dragon Lore", "Fade", "Crimson Web", "Howl", "Medusa", "Emerald", "Sapphire", "Ruby", "Blue Gem"],
  Prismatic: ["Gungnir", "Wild Lotus", "Vice", "Pandora's Box", "King Snake", "Slingshot", "Fire Serpent"]
};

export const RARITY_COLORS: Record<Rarity, string> = {
  Common: "bg-zinc-400 border-zinc-500",
  Uncommon: "bg-emerald-500 border-emerald-600",
  Rare: "bg-blue-500 border-blue-600",
  Epic: "bg-purple-500 border-purple-600",
  Legendary: "bg-amber-400 border-amber-500",
  Prismatic: "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 border-pink-400"
};

export const RARITY_TEXT_COLORS: Record<Rarity, string> = {
  Common: "text-zinc-400",
  Uncommon: "text-emerald-500",
  Rare: "text-blue-500",
  Epic: "text-purple-500",
  Legendary: "text-amber-400",
  Prismatic: "text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 font-black drop-shadow-sm"
};

export const RARITY_VALUES: Record<Rarity, number> = {
  Common: 2,
  Uncommon: 5,
  Rare: 15,
  Epic: 50,
  Legendary: 250,
  Prismatic: 1500
};

export const CRATES: Crate[] = [
  {
    id: "basic",
    name: "Basic Crate",
    cost: 10,
    color: "bg-zinc-700",
    minLevel: 1,
    category: 'Weapon',
    probabilities: {
      Common: 0.60,
      Uncommon: 0.25,
      Rare: 0.10,
      Epic: 0.04,
      Legendary: 0.009,
      Prismatic: 0.001
    }
  },
  {
    id: "advanced",
    name: "Advanced Crate",
    cost: 50,
    color: "bg-blue-900",
    minLevel: 3,
    category: 'Weapon',
    probabilities: {
      Common: 0.40,
      Uncommon: 0.30,
      Rare: 0.18,
      Epic: 0.09,
      Legendary: 0.025,
      Prismatic: 0.005
    }
  },
  {
    id: "premium",
    name: "Premium Crate",
    cost: 200,
    color: "bg-purple-900",
    minLevel: 5,
    category: 'Weapon',
    probabilities: {
      Common: 0.0,
      Uncommon: 0.45,
      Rare: 0.30,
      Epic: 0.15,
      Legendary: 0.08,
      Prismatic: 0.02
    }
  },
  {
    id: "legendary",
    name: "Legendary Crate",
    cost: 1000,
    color: "bg-amber-900",
    minLevel: 10,
    category: 'Weapon',
    probabilities: {
      Common: 0.0,
      Uncommon: 0.0,
      Rare: 0.45,
      Epic: 0.30,
      Legendary: 0.18,
      Prismatic: 0.07
    }
  },
  {
    id: "basic-skin",
    name: "Basic Skin Crate",
    cost: 50,
    color: "bg-zinc-800 border-2 border-emerald-500/30",
    minLevel: 2,
    category: 'Skin',
    valueMultiplier: 6,
    probabilities: {
      Common: 0.60,
      Uncommon: 0.25,
      Rare: 0.10,
      Epic: 0.04,
      Legendary: 0.009,
      Prismatic: 0.001
    }
  },
  {
    id: "advanced-skin",
    name: "Advanced Skin Crate",
    cost: 250,
    color: "bg-slate-900 border-2 border-blue-500/50",
    minLevel: 4,
    category: 'Skin',
    valueMultiplier: 6,
    probabilities: {
      Common: 0.40,
      Uncommon: 0.30,
      Rare: 0.18,
      Epic: 0.09,
      Legendary: 0.025,
      Prismatic: 0.005
    }
  },
  {
    id: "premium-skin",
    name: "Premium Skin Crate",
    cost: 1000,
    color: "bg-fuchsia-950 border-2 border-purple-500/50",
    minLevel: 7,
    category: 'Skin',
    valueMultiplier: 6,
    probabilities: {
      Common: 0.0,
      Uncommon: 0.45,
      Rare: 0.30,
      Epic: 0.15,
      Legendary: 0.08,
      Prismatic: 0.02
    }
  },
  {
    id: "legendary-skin",
    name: "Legendary Skin Crate",
    cost: 5000,
    color: "bg-orange-950 border-2 border-amber-500/50",
    minLevel: 12,
    category: 'Skin',
    valueMultiplier: 6,
    probabilities: {
      Common: 0.0,
      Uncommon: 0.0,
      Rare: 0.45,
      Epic: 0.30,
      Legendary: 0.18,
      Prismatic: 0.07
    }
  }
];

export const BATTLE_PASS_REWARDS: import('./types').BPReward[] = Array.from({ length: 50 }, (_, i) => {
  const level = i + 1;
  
  // Specific Weapon Rewards
  if (level === 5) return { level, type: 'weapon', weaponType: 'Glock-18', skin: 'Candy Apple', rarity: 'Uncommon' };
  if (level === 10) return { level, type: 'weapon', weaponType: 'AK-47', skin: 'Redline', rarity: 'Rare' };
  if (level === 15) return { level, type: 'weapon', weaponType: 'USP-S', skin: 'Neo-Noir', rarity: 'Epic' };
  if (level === 20) return { level, type: 'weapon', weaponType: 'M4A4', skin: 'Asiimov', rarity: 'Epic' };
  if (level === 25) return { level, type: 'weapon', weaponType: 'AWP', skin: 'Hyper Beast', rarity: 'Epic' };
  if (level === 30) return { level, type: 'weapon', weaponType: 'Desert Eagle', skin: 'Printstream', rarity: 'Epic' };
  if (level === 35) return { level, type: 'weapon', weaponType: 'Butterfly Knife', skin: 'Fade', rarity: 'Legendary' };
  if (level === 40) return { level, type: 'weapon', weaponType: 'Karambit', skin: 'Crimson Web', rarity: 'Legendary' };
  if (level === 45) return { level, type: 'weapon', weaponType: 'M9 Bayonet', skin: 'Sapphire', rarity: 'Legendary' };
  if (level === 50) return { level, type: 'weapon', weaponType: 'AWP', skin: 'Dragon Lore', rarity: 'Legendary' };
  
  // Birthday Wraps
  if (level === 7) return { level, type: 'weapon', weaponType: 'MAC-10', skin: 'Birthday Wrap', rarity: 'Epic' };
  if (level === 17) return { level, type: 'weapon', weaponType: 'P90', skin: 'Birthday Wrap', rarity: 'Epic' };
  if (level === 27) return { level, type: 'weapon', weaponType: 'SSG 08', skin: 'Birthday Wrap', rarity: 'Epic' };
  if (level === 37) return { level, type: 'weapon', weaponType: 'AK-47', skin: 'Birthday Wrap', rarity: 'Epic' };
  if (level === 47) return { level, type: 'weapon', weaponType: 'AWP', skin: 'Birthday Wrap', rarity: 'Epic' };

  // Default credits
  return { level, type: 'credits', amount: level * 25 };
});

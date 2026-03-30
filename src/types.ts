export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Prismatic';

export interface Weapon {
  id: string;
  name: string;
  type: string;
  rarity: Rarity;
  value: number;
}

export interface Crate {
  id: string;
  name: string;
  cost: number;
  color: string;
  probabilities: Record<Rarity, number>;
  minLevel: number;
  category?: 'Weapon' | 'Skin';
  valueMultiplier?: number;
}

export interface BPReward {
  level: number;
  type: 'credits' | 'weapon';
  amount?: number;
  weaponType?: string;
  skin?: string;
  rarity?: Rarity;
}

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Package, Grid, ArrowUpCircle, Pickaxe, Coins, Award, TrendingUp, Zap, Trash2, Sparkles, User, LogOut } from 'lucide-react';
import { Rarity, Weapon, Crate, BPReward } from './types';
import { CRATES, RARITY_COLORS, RARITY_TEXT_COLORS, BATTLE_PASS_REWARDS, getWeaponCategory } from './constants';
import { openCrate, getLevelInfo, generateWeapon, generateSpecificWeapon } from './utils';
import { WeaponIcon } from './components/WeaponIcon';
import { TargetPractice3D } from './components/TargetPractice3D';
import { Target } from 'lucide-react';

const loadState = <T,>(profile: string, key: string, defaultValue: T): T => {
  try {
    const saved = localStorage.getItem(`csgo_clicker_${profile}_${key}`);
    if (saved !== null) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error("Failed to load state", e);
  }
  return defaultValue;
};

function ResetButton({ profile }: { profile: string }) {
  const [isConfirming, setIsConfirming] = useState(false);

  return (
    <button
      onClick={() => {
        if (isConfirming) {
          const keys = ['credits', 'inventory', 'totalXp', 'claimedBpRewards', 'lastRewardedLevel', 'equippedWeapon', 'clickLevel', 'botLevel', 'luckyDrawLastPlayedHour'];
          keys.forEach(k => localStorage.removeItem(`csgo_clicker_${profile}_${k}`));
          window.location.reload();
        } else {
          setIsConfirming(true);
          setTimeout(() => setIsConfirming(false), 3000);
        }
      }}
      className={`px-6 py-3 font-bold rounded-lg transition whitespace-nowrap ${isConfirming ? 'bg-red-700 text-white animate-pulse' : 'bg-red-600 hover:bg-red-500 text-white'}`}
    >
      {isConfirming ? 'Click again to confirm!' : 'Reset Progress'}
    </button>
  );
}

function MainGame({ profile, onSignOut }: { profile: string, onSignOut: () => void }) {
  const [credits, setCredits] = useState(() => loadState(profile, 'credits', 10));
  const [inventory, setInventory] = useState<Weapon[]>(() => loadState(profile, 'inventory', []));
  const [totalXp, setTotalXp] = useState(() => loadState(profile, 'totalXp', 0));
  const [activeTab, setActiveTab] = useState<'crates' | 'inventory' | 'tradeup' | 'battlepass' | 'upgrades' | 'range'>('crates');
  const [claimedBpRewards, setClaimedBpRewards] = useState<number[]>(() => loadState(profile, 'claimedBpRewards', []));
  
  const [isWorking, setIsWorking] = useState(false);
  const [lastRewardedLevel, setLastRewardedLevel] = useState(() => loadState(profile, 'lastRewardedLevel', 1));
  
  // Loadout State
  const [equippedWeapon, setEquippedWeapon] = useState<Weapon | null>(() => loadState(profile, 'equippedWeapon', null));
  
  // Upgrades State
  const [clickLevel, setClickLevel] = useState(() => loadState(profile, 'clickLevel', 1));
  const [botLevel, setBotLevel] = useState(() => loadState(profile, 'botLevel', 0));

  useEffect(() => {
    localStorage.setItem(`csgo_clicker_${profile}_credits`, JSON.stringify(credits));
    localStorage.setItem(`csgo_clicker_${profile}_inventory`, JSON.stringify(inventory));
    localStorage.setItem(`csgo_clicker_${profile}_totalXp`, JSON.stringify(totalXp));
    localStorage.setItem(`csgo_clicker_${profile}_claimedBpRewards`, JSON.stringify(claimedBpRewards));
    localStorage.setItem(`csgo_clicker_${profile}_lastRewardedLevel`, JSON.stringify(lastRewardedLevel));
    localStorage.setItem(`csgo_clicker_${profile}_equippedWeapon`, JSON.stringify(equippedWeapon));
    localStorage.setItem(`csgo_clicker_${profile}_clickLevel`, JSON.stringify(clickLevel));
    localStorage.setItem(`csgo_clicker_${profile}_botLevel`, JSON.stringify(botLevel));
  }, [profile, credits, inventory, totalXp, claimedBpRewards, lastRewardedLevel, equippedWeapon, clickLevel, botLevel]);

  // Roulette State
  const [openingCrate, setOpeningCrate] = useState<Crate | null>(null);
  const [activeRoulettes, setActiveRoulettes] = useState<{ items: Weapon[], offset: number }[]>([]);
  const [currentBatchWon, setCurrentBatchWon] = useState<Weapon[]>([]);
  const [allWonItems, setAllWonItems] = useState<Weapon[]>([]);
  const [pendingCratesCount, setPendingCratesCount] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);

  // Trade Up State
  const [tradeUpSelection, setTradeUpSelection] = useState<string[]>([]);

  // Inventory Filter State
  const [inventoryFilter, setInventoryFilter] = useState<'All' | 'Combat' | 'Tactical'>('All');
  const [inventorySort, setInventorySort] = useState<'Newest' | 'Value'>('Newest');
  const [inventoryRarityFilter, setInventoryRarityFilter] = useState<'All' | Rarity>('All');

  // Lucky Draw State
  const [luckyDrawState, setLuckyDrawState] = useState<'idle' | 'showing' | 'shuffling' | 'waiting' | 'revealed'>('idle');
  const [luckyDrawWeapons, setLuckyDrawWeapons] = useState<Weapon[]>([]);
  const [luckyDrawChoice, setLuckyDrawChoice] = useState<string | null>(null);
  const [luckyDrawLastPlayedHour, setLuckyDrawLastPlayedHour] = useState(() => loadState(profile, 'luckyDrawLastPlayedHour', 0));

  const currentHour = Math.floor(Date.now() / 3600000);
  const canPlayLuckyDraw = luckyDrawLastPlayedHour < currentHour;
  const nextDrawMinutes = 60 - Math.floor((Date.now() % 3600000) / 60000);

  useEffect(() => {
    localStorage.setItem(`csgo_clicker_${profile}_luckyDrawLastPlayedHour`, JSON.stringify(luckyDrawLastPlayedHour));
  }, [profile, luckyDrawLastPlayedHour]);

  const { level, currentLevelXp, requiredXp } = getLevelInfo(totalXp);

  // Level up rewards
  useEffect(() => {
    if (level > lastRewardedLevel) {
      const levelsGained = level - lastRewardedLevel;
      let reward = 0;
      for(let i=1; i<=levelsGained; i++) {
        reward += (lastRewardedLevel + i) * 50;
      }
      setCredits(c => c + reward);
      setLastRewardedLevel(level);
    }
  }, [level, lastRewardedLevel]);

  // Passive Income (Trading Bot)
  useEffect(() => {
    if (botLevel > 0) {
      const interval = setInterval(() => {
        setCredits(c => c + (botLevel * 5));
        setTotalXp(x => x + botLevel);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [botLevel]);

  const handleWork = () => {
    if (isWorking) return;
    setIsWorking(true);
    const earned = (Math.floor(Math.random() * 3) + 1) * clickLevel;
    setCredits(c => c + earned);
    setTotalXp(prev => prev + (2 * clickLevel));
    setTimeout(() => setIsWorking(false), Math.max(100, 1000 - (clickLevel * 50)));
  };

  const startBatch = (crate: Crate, amountLeft: number, currentAllWon: Weapon[]) => {
    const batchSize = Math.min(amountLeft, 5);
    const remaining = amountLeft - batchSize;
    
    const newRoulettes = [];
    const newBatchWon = [];
    
    for (let r = 0; r < batchSize; r++) {
      const items: Weapon[] = [];
      for(let i=0; i<50; i++) {
        items.push(openCrate(crate));
      }
      newBatchWon.push(items[45]);
      newRoulettes.push({
        items,
        offset: Math.random() * 80 - 40
      });
    }
    
    setPendingCratesCount(remaining);
    setActiveRoulettes(newRoulettes);
    setCurrentBatchWon(newBatchWon);
    setAllWonItems(currentAllWon);
    setIsSpinning(true);
  };

  const handleOpenCrate = (crate: Crate, amount: number = 1) => {
    const totalCost = crate.cost * amount;
    if (credits < totalCost) return;
    if (level < crate.minLevel) return;

    setCredits(c => c - totalCost);
    setOpeningCrate(crate);
    startBatch(crate, amount, []);
  };

  const handleNextBatch = () => {
    startBatch(openingCrate!, pendingCratesCount, [...allWonItems, ...currentBatchWon]);
  };

  const handleClaim = () => {
    const finalItems = [...allWonItems, ...currentBatchWon];
    if (finalItems.length > 0) {
      setInventory(prev => [...finalItems, ...prev]);
      setTotalXp(prev => prev + (10 * finalItems.length));
    }
    setOpeningCrate(null);
    setActiveRoulettes([]);
    setCurrentBatchWon([]);
    setAllWonItems([]);
  };

  const handleSellWon = () => {
    const finalItems = [...allWonItems, ...currentBatchWon];
    if (finalItems.length > 0) {
      const totalValue = finalItems.reduce((sum, item) => sum + item.value, 0);
      setCredits(c => c + totalValue);
      setTotalXp(prev => prev + (10 * finalItems.length));
    }
    setOpeningCrate(null);
    setActiveRoulettes([]);
    setCurrentBatchWon([]);
    setAllWonItems([]);
  };

  const handleSellInventory = (item: Weapon) => {
    setInventory(prev => prev.filter(i => i.id !== item.id));
    setCredits(c => c + item.value);
    
    // Remove from trade up selection if it was there
    if (tradeUpSelection.includes(item.id)) {
      setTradeUpSelection(prev => prev.filter(id => id !== item.id));
    }
  };

  const handleStartLuckyDraw = () => {
    if (!canPlayLuckyDraw) return;
    
    // Generate and immediately shuffle the initial weapons
    // so the Legendary isn't always in the first slot
    const initialWeapons = [
      generateWeapon('Legendary'),
      generateWeapon('Rare'),
      generateWeapon('Uncommon'),
      generateWeapon('Common'),
      generateWeapon('Common')
    ].sort(() => Math.random() - 0.5);
    
    setLuckyDrawWeapons(initialWeapons);
    setLuckyDrawState('showing');
    
    setTimeout(() => {
      setLuckyDrawState('shuffling');
      
      // First turn them face down
      setTimeout(() => {
        let shuffleCount = 0;
        const maxShuffles = 5;
        let currentWeapons = [...initialWeapons];

        // Then shuffle them multiple times to mix them up visually
        const shuffleInterval = setInterval(() => {
          // Fisher-Yates shuffle to ensure good mixing
          const array = [...currentWeapons];
          for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
          }
          currentWeapons = array;
          setLuckyDrawWeapons(currentWeapons);
          shuffleCount++;

          if (shuffleCount >= maxShuffles) {
            clearInterval(shuffleInterval);
            setTimeout(() => {
              setLuckyDrawState('waiting');
            }, 600); // Wait for final shuffle animation to finish
          }
        }, 300); // 300ms per shuffle step
      }, 400); // Faster 0.4s wait for flip animation
    }, 1500); // Faster 1.5s showing
  };

  const handleChooseLuckyDraw = (weaponId: string) => {
    if (luckyDrawState !== 'waiting') return;
    
    setLuckyDrawChoice(weaponId);
    setLuckyDrawState('revealed');
    const chosenWeapon = luckyDrawWeapons.find(w => w.id === weaponId)!;
    setInventory(prev => [chosenWeapon, ...prev]);
    setTotalXp(prev => prev + 10);
    setLuckyDrawLastPlayedHour(currentHour);
  };

  const handleCloseLuckyDraw = () => {
    setLuckyDrawState('idle');
    setLuckyDrawChoice(null);
    setLuckyDrawWeapons([]);
  };

  const handleSellAll = (rarity: Rarity | 'All') => {
    const itemsToSell = rarity === 'All' 
      ? inventory.filter(i => !equippedWeapon || i.id !== equippedWeapon.id)
      : inventory.filter(i => i.rarity === rarity);
      
    const totalValue = itemsToSell.reduce((sum, item) => sum + item.value, 0);
    
    if (itemsToSell.length > 0) {
      setInventory(prev => rarity === 'All' 
        ? (equippedWeapon ? [equippedWeapon] : [])
        : prev.filter(i => i.rarity !== rarity)
      );
      setCredits(c => c + totalValue);
      setTradeUpSelection(prev => {
        const remainingIds = rarity === 'All'
          ? (equippedWeapon ? [equippedWeapon.id] : [])
          : inventory.filter(i => i.rarity !== rarity).map(i => i.id);
        return prev.filter(id => remainingIds.includes(id));
      });
    }
  };

  const handleTradeSelect = (item: Weapon) => {
    if (tradeUpSelection.includes(item.id)) {
      setTradeUpSelection(prev => prev.filter(id => id !== item.id));
      return;
    }
    
    if (tradeUpSelection.length >= 5) return;
    
    if (tradeUpSelection.length > 0) {
      const firstSelected = inventory.find(i => i.id === tradeUpSelection[0]);
      if (firstSelected && firstSelected.rarity !== item.rarity) {
        setTradeUpSelection([item.id]);
        return;
      }
    }
    
    setTradeUpSelection(prev => [...prev, item.id]);
  };

  const handleExecuteTrade = () => {
    if (tradeUpSelection.length !== 5) return;
    
    const itemsToTrade = inventory.filter(i => tradeUpSelection.includes(i.id));
    const rarity = itemsToTrade[0].rarity;
    const rarities: Rarity[] = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Prismatic'];
    const nextRarityIndex = rarities.indexOf(rarity) + 1;
    
    if (nextRarityIndex >= rarities.length) return;
    
    const nextRarity = rarities[nextRarityIndex];
    const newItem = generateWeapon(nextRarity);
    
    setInventory(prev => [...prev.filter(i => !tradeUpSelection.includes(i.id))]);
    setTotalXp(prev => prev + 50);
    setTradeUpSelection([]);
    
    setWonItem(newItem);
    setOpeningCrate({ id: 'trade', name: `TRADE-UP CONTRACT`, cost: 0, color: 'bg-amber-500', minLevel: 1, probabilities: {} as any });
    setIsSpinning(false);
    setRouletteItems([]);
  };

  const handleClaimBpReward = (reward: BPReward) => {
    if (level < reward.level || claimedBpRewards.includes(reward.level)) return;

    if (reward.type === 'credits') {
      setCredits(c => c + (reward.amount || 0));
    } else if (reward.type === 'weapon') {
      const weapon = generateSpecificWeapon(reward.weaponType!, reward.skin!, reward.rarity!);
      setWonItem(weapon);
      setOpeningCrate({ id: 'bp', name: `BATTLE PASS REWARD`, cost: 0, color: 'bg-yellow-500', minLevel: 1, probabilities: {} as any });
      setIsSpinning(false);
      setRouletteItems([]);
    }

    setClaimedBpRewards(prev => [...prev, reward.level]);
  };

  const tradeableItems = inventory.filter(i => i.rarity !== 'Prismatic');
  const selectedRarity = tradeUpSelection.length > 0 ? inventory.find(i => i.id === tradeUpSelection[0])?.rarity : null;

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Header */}
      <header className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6 text-amber-500" />
            <h1 className="text-xl font-black tracking-tight">CRATE ROLLER</h1>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <div className="text-sm font-bold">Level {level}</div>
              <div className="w-32 h-2 bg-zinc-800 rounded-full overflow-hidden mt-1">
                <div 
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${(currentLevelXp / requiredXp) * 100}%` }}
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-zinc-800 px-4 py-2 rounded-lg border border-zinc-700">
              <Coins className="w-5 h-5 text-yellow-400" />
              <span className="font-mono font-bold text-lg">{credits}</span>
            </div>
            
            <button 
              onClick={handleWork}
              disabled={isWorking}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white px-4 py-2 rounded-lg font-bold transition"
            >
              <Pickaxe className="w-4 h-4" />
              {isWorking ? 'Working...' : 'Scavenge'}
            </button>

            <div className="flex items-center gap-3 bg-zinc-800 px-4 py-2 rounded-lg border border-zinc-700">
              <div className="flex items-center gap-2 text-zinc-300">
                <User className="w-4 h-4" />
                <span className="font-bold text-sm hidden sm:inline">{profile}</span>
              </div>
              <div className="w-px h-4 bg-zinc-700"></div>
              <button onClick={onSignOut} className="text-zinc-400 hover:text-red-400 transition" title="Sign Out">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 flex flex-col gap-6">
        
        {/* Navigation Tabs */}
        <div className="flex gap-2 p-1 bg-zinc-900 rounded-lg border border-zinc-800 w-fit">
          <button 
            onClick={() => setActiveTab('crates')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-md font-bold transition ${activeTab === 'crates' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}
          >
            <Package className="w-4 h-4" />
            Store
          </button>
          <button 
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-md font-bold transition ${activeTab === 'inventory' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}
          >
            <Grid className="w-4 h-4" />
            Inventory ({inventory.length})
          </button>
          <button 
            onClick={() => setActiveTab('tradeup')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-md font-bold transition ${activeTab === 'tradeup' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}
          >
            <ArrowUpCircle className="w-4 h-4" />
            Trade-Up
          </button>
          <button 
            onClick={() => setActiveTab('battlepass')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-md font-bold transition ${activeTab === 'battlepass' ? 'bg-yellow-500/20 text-yellow-500' : 'text-zinc-400 hover:text-yellow-500 hover:bg-yellow-500/10'}`}
          >
            <Award className="w-4 h-4" />
            Battle Pass
          </button>
          <button 
            onClick={() => setActiveTab('upgrades')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-md font-bold transition ${activeTab === 'upgrades' ? 'bg-emerald-500/20 text-emerald-500' : 'text-zinc-400 hover:text-emerald-500 hover:bg-emerald-500/10'}`}
          >
            <TrendingUp className="w-4 h-4" />
            Upgrades
          </button>
          <button 
            onClick={() => setActiveTab('range')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-md font-bold transition ${activeTab === 'range' ? 'bg-red-500/20 text-red-500' : 'text-zinc-400 hover:text-red-500 hover:bg-red-500/10'}`}
          >
            <Target className="w-4 h-4" />
            Range
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1">
          {activeTab === 'crates' && (
            <div className="space-y-12">
              <div>
                <h2 className="text-2xl font-black mb-6 flex items-center gap-2 text-zinc-100">
                  <Package className="w-6 h-6 text-zinc-400" />
                  WEAPON CRATES
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {CRATES.filter(c => c.category !== 'Skin').map(crate => {
                    const isLocked = level < crate.minLevel;
                    const canAfford = credits >= crate.cost;
                    
                    return (
                      <div key={crate.id} className={`relative bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 flex flex-col ${isLocked ? 'opacity-75' : ''}`}>
                        <div className={`h-32 ${crate.color} flex items-center justify-center relative overflow-hidden`}>
                          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-16 h-16 text-white/70 drop-shadow-xl z-10">
                            <rect x="3" y="8" width="18" height="12" rx="2" strokeWidth="2" />
                            <path d="M7 8v12" strokeWidth="2" />
                            <path d="M17 8v12" strokeWidth="2" />
                            <path d="M3 14h18" strokeWidth="2" />
                            <path d="M8 4h8l1 4H7l1-4z" strokeWidth="2" strokeLinejoin="round" />
                          </svg>
                        </div>
                        
                        <div className="p-6 flex-1 flex flex-col">
                          <h3 className="text-xl font-bold mb-1">{crate.name}</h3>
                          <p className="text-zinc-400 text-sm mb-4">Unlocks at Level {crate.minLevel}</p>
                          
                          <div className="space-y-1 mb-6 flex-1">
                            {(['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Prismatic'] as Rarity[]).map(rarity => {
                              const prob = crate.probabilities[rarity];
                              if (!prob || prob <= 0) return null;
                              return (
                                <div key={rarity} className="flex justify-between text-xs font-medium">
                                  <span className={RARITY_TEXT_COLORS[rarity]}>{rarity}</span>
                                  <span className="text-zinc-300">{Number((prob * 100).toFixed(1))}%</span>
                                </div>
                              );
                            })}
                          </div>
                          
                          {isLocked ? (
                            <button disabled className="w-full py-3 bg-zinc-800 text-zinc-500 font-bold rounded cursor-not-allowed">
                              Locked
                            </button>
                          ) : (
                            <div className="flex flex-col gap-2">
                              <button 
                                onClick={() => handleOpenCrate(crate, 1)}
                                disabled={credits < crate.cost}
                                className={`w-full py-2 font-bold rounded transition ${credits >= crate.cost ? 'bg-zinc-100 text-zinc-900 hover:bg-white' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}`}
                              >
                                {credits >= crate.cost ? `Open 1 (${crate.cost} CR)` : `Need ${crate.cost} CR`}
                              </button>
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => handleOpenCrate(crate, 5)}
                                  disabled={credits < crate.cost * 5}
                                  className={`flex-1 py-2 text-sm font-bold rounded transition ${credits >= crate.cost * 5 ? 'bg-zinc-700 text-zinc-100 hover:bg-zinc-600' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}`}
                                >
                                  Open 5
                                </button>
                                <button 
                                  onClick={() => handleOpenCrate(crate, 10)}
                                  disabled={credits < crate.cost * 10}
                                  className={`flex-1 py-2 text-sm font-bold rounded transition ${credits >= crate.cost * 10 ? 'bg-zinc-700 text-zinc-100 hover:bg-zinc-600' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}`}
                                >
                                  Open 10
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-black flex items-center gap-2 text-emerald-400">
                    <Package className="w-6 h-6" />
                    SKIN CRATES
                  </h2>
                  <p className="text-zinc-400 mt-1">More expensive to open, but items sell for 6x more credits!</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {CRATES.filter(c => c.category === 'Skin').map(crate => {
                    const isLocked = level < crate.minLevel;
                    const canAfford = credits >= crate.cost;
                    
                    return (
                      <div key={crate.id} className={`relative bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 flex flex-col ${isLocked ? 'opacity-75' : ''}`}>
                        <div className={`h-32 ${crate.color} flex items-center justify-center relative overflow-hidden`}>
                          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-16 h-16 text-white/70 drop-shadow-xl z-10">
                            <path d="M12 2L2 7l10 5 10-5-10-5z" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
                            <path d="M2 17l10 5 10-5M2 12l10 5 10-5" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
                          </svg>
                        </div>
                        
                        <div className="p-6 flex-1 flex flex-col">
                          <h3 className="text-xl font-bold mb-1">{crate.name}</h3>
                          <p className="text-zinc-400 text-sm mb-4">Unlocks at Level {crate.minLevel}</p>
                          
                          <div className="space-y-1 mb-6 flex-1">
                            {(['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Prismatic'] as Rarity[]).map(rarity => {
                              const prob = crate.probabilities[rarity];
                              if (!prob || prob <= 0) return null;
                              return (
                                <div key={rarity} className="flex justify-between text-xs font-medium">
                                  <span className={RARITY_TEXT_COLORS[rarity]}>{rarity}</span>
                                  <span className="text-zinc-300">{Number((prob * 100).toFixed(1))}%</span>
                                </div>
                              );
                            })}
                          </div>
                          
                          {isLocked ? (
                            <button disabled className="w-full py-3 bg-zinc-800 text-zinc-500 font-bold rounded cursor-not-allowed">
                              Locked
                            </button>
                          ) : (
                            <div className="flex flex-col gap-2">
                              <button 
                                onClick={() => handleOpenCrate(crate, 1)}
                                disabled={credits < crate.cost}
                                className={`w-full py-2 font-bold rounded transition ${credits >= crate.cost ? 'bg-zinc-100 text-zinc-900 hover:bg-white' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}`}
                              >
                                {credits >= crate.cost ? `Open 1 (${crate.cost} CR)` : `Need ${crate.cost} CR`}
                              </button>
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => handleOpenCrate(crate, 5)}
                                  disabled={credits < crate.cost * 5}
                                  className={`flex-1 py-2 text-sm font-bold rounded transition ${credits >= crate.cost * 5 ? 'bg-zinc-700 text-zinc-100 hover:bg-zinc-600' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}`}
                                >
                                  Open 5
                                </button>
                                <button 
                                  onClick={() => handleOpenCrate(crate, 10)}
                                  disabled={credits < crate.cost * 10}
                                  className={`flex-1 py-2 text-sm font-bold rounded transition ${credits >= crate.cost * 10 ? 'bg-zinc-700 text-zinc-100 hover:bg-zinc-600' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}`}
                                >
                                  Open 10
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Lucky Draw Section */}
              <div>
                <div className="mb-6 mt-12">
                  <h2 className="text-2xl font-black flex items-center gap-2 text-purple-400">
                    <Sparkles className="w-6 h-6" />
                    LUCKY DRAW
                  </h2>
                  <p className="text-zinc-400 mt-1">Free draw every hour! 1 Legendary, 1 Rare, 1 Uncommon, 2 Commons.</p>
                </div>
                
                <div className="bg-zinc-900 rounded-xl p-8 border border-zinc-800 flex flex-col items-center">
                  {luckyDrawState === 'idle' ? (
                    <>
                      <div className="flex gap-4 mb-8">
                        {/* Show 5 empty card slots */}
                        {[0,1,2,3,4].map(i => (
                          <div key={i} className="w-24 h-32 md:w-32 md:h-48 bg-zinc-800 rounded-xl border-2 border-zinc-700 border-dashed flex items-center justify-center">
                            <span className="text-4xl text-zinc-700">?</span>
                          </div>
                        ))}
                      </div>
                      
                      {canPlayLuckyDraw ? (
                        <button 
                          onClick={handleStartLuckyDraw}
                          className="px-12 py-4 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-lg transition text-xl shadow-[0_0_20px_rgba(147,51,234,0.5)]"
                        >
                          PLAY FREE DRAW
                        </button>
                      ) : (
                        <button 
                          disabled
                          className="px-12 py-4 bg-zinc-800 text-zinc-500 font-black rounded-lg cursor-not-allowed text-xl"
                        >
                          NEXT DRAW IN {nextDrawMinutes} MINS
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="w-full max-w-4xl">
                      <h3 className="text-2xl font-bold text-center mb-8">
                        {luckyDrawState === 'showing' && "Memorize the cards!"}
                        {luckyDrawState === 'shuffling' && "Shuffling..."}
                        {luckyDrawState === 'waiting' && "Pick a card!"}
                        {luckyDrawState === 'revealed' && "You won!"}
                      </h3>
                      
                      <div className="flex justify-center gap-4 mb-8" style={{ perspective: 1000 }}>
                        {luckyDrawWeapons.map((weapon) => {
                          const isRevealed = luckyDrawState === 'showing' || luckyDrawState === 'revealed';
                          const isChosen = luckyDrawChoice === weapon.id;
                          const isNotChosen = luckyDrawState === 'revealed' && luckyDrawChoice !== weapon.id;
                          
                          return (
                            <motion.div 
                              key={weapon.id}
                              layout
                              onClick={() => handleChooseLuckyDraw(weapon.id)}
                              className={`w-24 h-32 md:w-32 md:h-48 rounded-xl cursor-pointer relative ${luckyDrawState === 'waiting' ? 'hover:-translate-y-2 transition-transform' : ''} ${isNotChosen ? 'opacity-50' : ''}`}
                              animate={{
                                rotateY: isRevealed ? 0 : 180,
                                scale: isChosen ? 1.1 : 1,
                                zIndex: isChosen ? 10 : 1
                              }}
                              transition={{ duration: 0.3, type: 'spring', bounce: 0.2 }}
                              style={{ transformStyle: 'preserve-3d' }}
                            >
                              {/* Front of card */}
                              <div 
                                className={`absolute inset-0 flex flex-col items-center justify-center border-4 rounded-xl bg-zinc-900 ${RARITY_COLORS[weapon.rarity]}`}
                                style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                              >
                                <WeaponIcon type={weapon.type} skin={weapon.name.split(' | ')[1]} className="w-16 h-8 md:w-20 md:h-10 mb-2 text-zinc-300 drop-shadow-md" />
                                <span className={`text-[10px] md:text-xs font-bold text-center px-1 ${RARITY_TEXT_COLORS[weapon.rarity]}`}>{weapon.name}</span>
                                <span className="text-[10px] text-zinc-400 mt-1">{weapon.rarity}</span>
                              </div>
                              
                              {/* Back of card */}
                              <div 
                                className="absolute inset-0 flex items-center justify-center border-4 border-purple-500 rounded-xl bg-zinc-800"
                                style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                              >
                                <Sparkles className="w-8 h-8 text-purple-500" />
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                      
                      {luckyDrawState === 'revealed' && (
                        <div className="flex justify-center">
                          <button 
                            onClick={handleCloseLuckyDraw}
                            className="px-8 py-3 bg-zinc-100 text-zinc-900 font-bold rounded hover:bg-white transition"
                          >
                            Claim & Close
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-zinc-900 p-4 rounded-lg border border-zinc-800">
                <div className="flex flex-wrap items-center gap-4">
                  <h2 className="text-xl font-bold">Your Items</h2>
                  <div className="flex bg-zinc-800 rounded-lg p-1">
                    <button onClick={() => setInventoryFilter('All')} className={`px-3 py-1 text-sm rounded-md transition ${inventoryFilter === 'All' ? 'bg-zinc-700 text-white font-bold shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}>All</button>
                    <button onClick={() => setInventoryFilter('Combat')} className={`px-3 py-1 text-sm rounded-md transition ${inventoryFilter === 'Combat' ? 'bg-zinc-700 text-white font-bold shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}>Combat</button>
                    <button onClick={() => setInventoryFilter('Tactical')} className={`px-3 py-1 text-sm rounded-md transition ${inventoryFilter === 'Tactical' ? 'bg-zinc-700 text-white font-bold shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}>Tactical</button>
                  </div>
                  <div className="flex bg-zinc-800 rounded-lg p-1 overflow-x-auto max-w-full">
                    <button onClick={() => setInventoryRarityFilter('All')} className={`px-3 py-1 text-sm rounded-md transition ${inventoryRarityFilter === 'All' ? 'bg-zinc-700 text-white font-bold shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}>All Rarities</button>
                    {(['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Prismatic'] as Rarity[]).map(rarity => (
                      <button key={rarity} onClick={() => setInventoryRarityFilter(rarity)} className={`px-3 py-1 text-sm rounded-md transition ${inventoryRarityFilter === rarity ? 'bg-zinc-700 text-white font-bold shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}>{rarity}</button>
                    ))}
                  </div>
                  <div className="flex bg-zinc-800 rounded-lg p-1">
                    <button onClick={() => setInventorySort('Newest')} className={`px-3 py-1 text-sm rounded-md transition ${inventorySort === 'Newest' ? 'bg-zinc-700 text-white font-bold shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}>Newest</button>
                    <button onClick={() => setInventorySort('Value')} className={`px-3 py-1 text-sm rounded-md transition ${inventorySort === 'Value' ? 'bg-zinc-700 text-white font-bold shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}>Highest Value</button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleSellAll('All')} className="px-4 py-2 bg-red-900/50 text-red-400 border border-red-900/50 text-sm font-bold rounded hover:bg-red-900/80 transition whitespace-nowrap">Sell All</button>
                  <button onClick={() => handleSellAll('Common')} className="px-4 py-2 bg-zinc-800 text-sm font-bold rounded hover:bg-zinc-700 transition whitespace-nowrap">Sell Commons</button>
                  <button onClick={() => handleSellAll('Uncommon')} className="px-4 py-2 bg-zinc-800 text-sm font-bold rounded hover:bg-zinc-700 transition whitespace-nowrap">Sell Uncommons</button>
                </div>
              </div>
              
              {inventory.length === 0 ? (
                <div className="text-center py-20 text-zinc-500 bg-zinc-900/50 rounded-xl border border-zinc-800 border-dashed">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Your inventory is empty. Go open some crates!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {inventory
                    .filter(item => inventoryFilter === 'All' || getWeaponCategory(item.type) === inventoryFilter)
                    .filter(item => inventoryRarityFilter === 'All' || item.rarity === inventoryRarityFilter)
                    .sort((a, b) => inventorySort === 'Value' ? b.value - a.value : 0)
                    .map(item => (
                    <div key={item.id} className={`relative group bg-zinc-900 border-b-4 rounded-lg p-4 flex flex-col items-center justify-center h-48 ${RARITY_COLORS[item.rarity]}`}>
                      <WeaponIcon type={item.type} skin={item.name.split(' | ')[1]} className="w-20 h-10 mb-3 text-zinc-300 drop-shadow-md" />
                      <span className={`text-sm font-bold text-center ${RARITY_TEXT_COLORS[item.rarity]}`}>{item.name}</span>
                      <span className="text-xs text-zinc-500 mt-1">{item.rarity} • {getWeaponCategory(item.type)}</span>
                      <span className="text-xs font-mono text-zinc-400 mt-2">{item.value} CR</span>
                      
                      <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 rounded-lg">
                        <button onClick={() => setEquippedWeapon(item)} className="px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded hover:bg-blue-500 transition">
                          {equippedWeapon?.id === item.id ? 'Equipped' : 'Equip'}
                        </button>
                        <button onClick={() => handleSellInventory(item)} className="px-6 py-2 bg-red-600 text-white text-sm font-bold rounded hover:bg-red-500 transition">
                          Sell
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'tradeup' && (
            <div className="space-y-6">
              <div className="bg-zinc-900 p-8 rounded-xl border border-zinc-800 text-center">
                <h2 className="text-2xl font-black mb-2">TRADE-UP CONTRACT</h2>
                <p className="text-zinc-400 mb-8 max-w-lg mx-auto">Select 5 weapons of the same rarity to receive 1 weapon of the next rarity. Prismatic items cannot be traded up.</p>
                
                <div className="flex justify-center gap-4 mb-8">
                  {[0,1,2,3,4].map(i => (
                    <div key={i} className={`w-20 h-20 rounded-lg border-2 flex items-center justify-center transition-colors ${i < tradeUpSelection.length ? RARITY_COLORS[selectedRarity!] : 'border-dashed border-zinc-700 bg-zinc-800/50'}`}>
                      {i < tradeUpSelection.length && <span className="text-2xl">✓</span>}
                    </div>
                  ))}
                </div>
                
                <button 
                  onClick={handleExecuteTrade}
                  disabled={tradeUpSelection.length < 5}
                  className="px-12 py-4 bg-amber-500 text-amber-950 font-black rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-400 transition"
                >
                  EXECUTE CONTRACT
                </button>
              </div>

              {tradeableItems.length === 0 ? (
                <div className="text-center py-12 text-zinc-500">
                  You don't have any tradeable items.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {tradeableItems.map(item => {
                    const isSelected = tradeUpSelection.includes(item.id);
                    const isDisabled = tradeUpSelection.length > 0 && selectedRarity !== item.rarity && !isSelected;
                    
                    return (
                      <div 
                        key={item.id} 
                        onClick={() => !isDisabled && handleTradeSelect(item)}
                        className={`relative cursor-pointer bg-zinc-900 border-b-4 rounded-lg p-4 flex flex-col items-center justify-center h-48 transition-all
                          ${RARITY_COLORS[item.rarity]}
                          ${isSelected ? 'ring-4 ring-white scale-105 z-10' : ''}
                          ${isDisabled ? 'opacity-30 grayscale' : 'hover:brightness-110'}
                        `}
                      >
                        <WeaponIcon type={item.type} skin={item.name.split(' | ')[1]} className="w-20 h-10 mb-3 text-zinc-300 drop-shadow-md" />
                        <span className={`text-sm font-bold text-center ${RARITY_TEXT_COLORS[item.rarity]}`}>{item.name}</span>
                        <span className="text-xs text-zinc-500 mt-1">{item.rarity}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'battlepass' && (
            <div className="max-w-4xl mx-auto pb-20">
              <h2 className="text-2xl font-black mb-6 flex items-center gap-2 text-zinc-100">
                <Award className="w-6 h-6 text-yellow-400" /> 
                BATTLE PASS
              </h2>
              <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
                <div className="mb-8">
                  <div className="flex justify-between text-sm text-zinc-400 mb-2 font-bold">
                    <span>Current Level: {level}</span>
                    <span>XP to next: {requiredXp - currentLevelXp}</span>
                  </div>
                  <div className="h-4 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700">
                    <div 
                      className="h-full bg-yellow-500 transition-all duration-500"
                      style={{ width: `${(currentLevelXp / requiredXp) * 100}%` }}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  {BATTLE_PASS_REWARDS.map(reward => {
                    const isUnlocked = level >= reward.level;
                    const isClaimed = claimedBpRewards.includes(reward.level);
                    
                    return (
                      <div key={reward.level} className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${isUnlocked ? (isClaimed ? 'bg-zinc-800/30 border-zinc-800/50' : 'bg-zinc-800 border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.1)]') : 'bg-zinc-900 border-zinc-800 opacity-50'}`}>
                        <div className="flex items-center gap-6">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-xl border-2 ${isUnlocked && !isClaimed ? 'bg-yellow-500/20 border-yellow-500 text-yellow-500' : 'bg-zinc-950 border-zinc-800 text-zinc-500'}`}>
                            {reward.level}
                          </div>
                          <div>
                            {reward.type === 'credits' ? (
                              <div className="flex items-center gap-2 font-bold text-yellow-400 text-lg">
                                <Coins className="w-5 h-5" /> {reward.amount} Credits
                              </div>
                            ) : (
                              <div className="flex items-center gap-4">
                                <WeaponIcon type={reward.weaponType!} skin={reward.skin} className="w-16 h-8 text-zinc-300 drop-shadow-md" />
                                <div>
                                  <div className={`font-bold text-lg ${RARITY_TEXT_COLORS[reward.rarity!]}`}>{reward.weaponType} | {reward.skin}</div>
                                  <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{reward.rarity} Reward</div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <button 
                          disabled={!isUnlocked || isClaimed}
                          onClick={() => handleClaimBpReward(reward)}
                          className={`px-8 py-3 rounded-lg font-black tracking-wider transition-all ${isClaimed ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' : isUnlocked ? 'bg-yellow-500 text-yellow-950 hover:bg-yellow-400 hover:scale-105 active:scale-95 shadow-lg' : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'}`}
                        >
                          {isClaimed ? 'CLAIMED' : isUnlocked ? 'CLAIM' : 'LOCKED'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'upgrades' && (
            <div className="max-w-4xl mx-auto pb-20">
              <h2 className="text-2xl font-black mb-6 flex items-center gap-2 text-zinc-100">
                <TrendingUp className="w-6 h-6 text-emerald-400" /> 
                UPGRADES & PASSIVE INCOME
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Click Upgrade */}
                <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 flex flex-col">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                      <Pickaxe className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Better Tools</h3>
                      <p className="text-sm text-zinc-400">Level {clickLevel}</p>
                    </div>
                  </div>
                  <p className="text-zinc-300 mb-6 flex-1">Increases credits earned from scavenging and reduces the cooldown time.</p>
                  
                  <button 
                    onClick={() => {
                      const cost = 50 * Math.pow(2, clickLevel - 1);
                      if (credits >= cost) {
                        setCredits(c => c - cost);
                        setClickLevel(l => l + 1);
                      }
                    }}
                    disabled={credits < 50 * Math.pow(2, clickLevel - 1)}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold rounded-lg transition"
                  >
                    Upgrade ({50 * Math.pow(2, clickLevel - 1)} CR)
                  </button>
                </div>

                {/* Bot Upgrade */}
                <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 flex flex-col">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <Zap className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Trading Bot</h3>
                      <p className="text-sm text-zinc-400">Level {botLevel}</p>
                    </div>
                  </div>
                  <p className="text-zinc-300 mb-6 flex-1">Generates {botLevel * 5} credits and {botLevel} XP per second automatically.</p>
                  
                  <button 
                    onClick={() => {
                      const cost = 250 * Math.pow(2, botLevel);
                      if (credits >= cost) {
                        setCredits(c => c - cost);
                        setBotLevel(l => l + 1);
                      }
                    }}
                    disabled={credits < 250 * Math.pow(2, botLevel)}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold rounded-lg transition"
                  >
                    {botLevel === 0 ? 'Buy Bot' : 'Upgrade Bot'} ({250 * Math.pow(2, botLevel)} CR)
                  </button>
                </div>
                
                {/* Reset Progress */}
                <div className="col-span-1 md:col-span-2 mt-8 bg-red-950/30 rounded-xl p-6 border border-red-900/50 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-bold text-red-400 flex items-center gap-2">
                      <Trash2 className="w-5 h-5" />
                      Danger Zone
                    </h3>
                    <p className="text-zinc-400 text-sm mt-1">
                      Permanently delete all your progress, credits, and inventory. This cannot be undone.
                    </p>
                  </div>
                  <ResetButton profile={profile} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'range' && (
            <div className="space-y-6">
              <div className="bg-zinc-900 p-8 rounded-xl border border-zinc-800">
                <h2 className="text-2xl font-black mb-2">TARGET PRACTICE</h2>
                <p className="text-zinc-400 mb-6">
                  Test your equipped weapon. Earn credits and XP based on your score.
                </p>
                
                <TargetPractice3D 
                  equippedWeapon={equippedWeapon} 
                  onGameOver={(score, wave) => {
                    const earnedCredits = Math.floor(score / 10);
                    const earnedXp = Math.floor(score / 5);
                    setCredits(c => c + earnedCredits);
                    setTotalXp(x => x + earnedXp);
                  }} 
                />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Roulette Modal */}
      {openingCrate && (
        <div className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-4 overflow-y-auto">
          <h2 className="text-3xl font-black text-white mb-8 tracking-tight mt-8">
            {isSpinning ? `OPENING ${openingCrate.name.toUpperCase()}` : 'WHAT YOU WON'}
          </h2>
          
          {isSpinning && activeRoulettes.length > 0 && (
            <div className="w-full max-w-6xl flex flex-col gap-2">
              {activeRoulettes.map((roulette, idx) => {
                const isSingle = activeRoulettes.length === 1;
                const itemWidth = isSingle ? 160 : 104; // w-36(144) + gap-4(16) OR w-24(96) + gap-2(8)
                const centerOffset = isSingle ? 72 : 48; // half of w-36 OR w-24
                const targetX = -(45 * itemWidth) - centerOffset + roulette.offset;

                return (
                  <div key={idx} className={`w-full overflow-hidden relative bg-zinc-900 border-y-2 border-zinc-700 ${isSingle ? 'py-12' : 'py-4'} shadow-2xl`}>
                    <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-amber-400 z-10 -translate-x-1/2 shadow-[0_0_15px_rgba(251,191,36,1)]"></div>
                    
                    <motion.div 
                      className={`flex ${isSingle ? 'gap-4' : 'gap-2'} pl-[50%]`}
                      initial={{ x: 0 }}
                      animate={{ x: isSpinning ? targetX : 0 }}
                      transition={{ duration: 5 + idx * 0.5, ease: [0.1, 0.7, 0.1, 1] }}
                      onAnimationComplete={() => {
                        if (idx === activeRoulettes.length - 1) {
                          setIsSpinning(false);
                        }
                      }}
                    >
                      {roulette.items.map((item, i) => (
                        <div key={i} className={`${isSingle ? 'w-36 h-36' : 'w-24 h-24'} shrink-0 flex flex-col items-center justify-center border-b-4 bg-zinc-800 rounded ${RARITY_COLORS[item.rarity]}`}>
                          <WeaponIcon type={item.type} skin={item.name.split(' | ')[1]} className={`${isSingle ? 'w-20 h-10 mb-2' : 'w-12 h-6 mb-1'} text-zinc-300 drop-shadow-md`} />
                          <span className={`${isSingle ? 'text-sm' : 'text-[10px] leading-tight'} font-bold text-center px-1 ${RARITY_TEXT_COLORS[item.rarity]}`}>{item.name}</span>
                          {isSingle && <span className="text-xs text-zinc-400 mt-1">{item.rarity}</span>}
                        </div>
                      ))}
                    </motion.div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="min-h-[12rem] mt-8 flex flex-col items-center justify-center w-full">
            {!isSpinning && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center w-full max-w-5xl"
              >
                <div className="flex flex-wrap justify-center gap-4 mb-8">
                  {[...allWonItems, ...currentBatchWon].map((item, i) => (
                    <div key={i} className={`w-32 h-32 flex flex-col items-center justify-center border-b-4 bg-zinc-800 rounded ${RARITY_COLORS[item.rarity]}`}>
                      <WeaponIcon type={item.type} skin={item.name.split(' | ')[1]} className="w-16 h-8 mb-2 text-zinc-300 drop-shadow-md" />
                      <span className={`text-xs font-bold text-center px-2 ${RARITY_TEXT_COLORS[item.rarity]}`}>{item.name}</span>
                      <span className="text-xs text-zinc-400 mt-1">{item.value} CR</span>
                    </div>
                  ))}
                </div>

                {pendingCratesCount > 0 ? (
                  <button onClick={handleNextBatch} className="px-8 py-3 bg-amber-500 text-zinc-900 font-black rounded hover:bg-amber-400 transition text-xl">
                    NEXT {Math.min(pendingCratesCount, 5)} CRATES
                  </button>
                ) : (
                  <div className="flex gap-4">
                    <button onClick={handleClaim} className="px-8 py-3 bg-zinc-100 text-zinc-900 font-bold rounded hover:bg-white transition">
                      Keep All ({allWonItems.length + currentBatchWon.length})
                    </button>
                    <button onClick={handleSellWon} className="px-8 py-3 bg-zinc-800 text-zinc-100 font-bold rounded border border-zinc-700 hover:bg-zinc-700 transition">
                      Sell All for {[...allWonItems, ...currentBatchWon].reduce((sum, item) => sum + item.value, 0)} CR
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function LoginScreen({ profiles, onLogin, onDelete }: { profiles: string[], onLogin: (name: string) => void, onDelete: (name: string) => void }) {
  const [newName, setNewName] = useState('');
  const [mode, setMode] = useState<'login' | 'delete'>('login');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4 font-sans">
      <div className="bg-zinc-900 p-8 rounded-xl border border-zinc-800 w-full max-w-md shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center">
            <User className="w-8 h-8 text-emerald-400" />
          </div>
        </div>
        <h1 className="text-3xl font-black mb-2 text-center text-white">Choose Account</h1>
        <p className="text-zinc-400 text-center mb-6">Select a profile or create a new one to start playing.</p>
        
        {profiles.length > 0 && (
          <div className="flex gap-2 mb-6 bg-zinc-950 p-1 rounded-lg">
            <button 
              onClick={() => { setMode('login'); setConfirmDelete(null); }}
              className={`flex-1 py-2 rounded-md font-bold text-sm transition ${mode === 'login' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Play
            </button>
            <button 
              onClick={() => setMode('delete')}
              className={`flex-1 py-2 rounded-md font-bold text-sm transition ${mode === 'delete' ? 'bg-red-900/50 text-red-400' : 'text-zinc-500 hover:text-red-400/50'}`}
            >
              Delete Account
            </button>
          </div>
        )}

        {mode === 'login' ? (
          <>
            {profiles.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xs font-bold text-zinc-500 mb-3 uppercase tracking-wider">Existing Profiles</h2>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {profiles.map(p => (
                    <button key={p} onClick={() => onLogin(p)} className="w-full p-4 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-bold transition flex items-center justify-between group border border-zinc-700 hover:border-zinc-600">
                      <span className="text-zinc-200 group-hover:text-white">{p}</span>
                      <ArrowUpCircle className="w-5 h-5 text-zinc-500 group-hover:text-emerald-400 transition-colors rotate-90" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h2 className="text-xs font-bold text-zinc-500 mb-3 uppercase tracking-wider">Create New Profile</h2>
              <form onSubmit={(e) => { e.preventDefault(); if(newName.trim()) onLogin(newName.trim()); }} className="flex gap-2">
                <input 
                  type="text" 
                  value={newName} 
                  onChange={e => setNewName(e.target.value)} 
                  placeholder="Enter username..."
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 text-white placeholder:text-zinc-600"
                  maxLength={16}
                />
                <button type="submit" disabled={!newName.trim()} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold rounded-xl transition">
                  Play
                </button>
              </form>
            </div>
          </>
        ) : (
          <div>
            <h2 className="text-xs font-bold text-red-500 mb-3 uppercase tracking-wider">Delete Profiles</h2>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
              {profiles.map(p => (
                <div key={p} className="w-full p-4 bg-zinc-800 rounded-xl font-bold flex items-center justify-between border border-zinc-700">
                  <span className="text-zinc-200">{p}</span>
                  {confirmDelete === p ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-400 mr-2">Sure?</span>
                      <button 
                        onClick={() => {
                          onDelete(p);
                          if (profiles.length === 1) setMode('login');
                        }}
                        className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-sm transition"
                      >
                        Yes
                      </button>
                      <button 
                        onClick={() => setConfirmDelete(null)}
                        className="px-3 py-1 bg-zinc-700 hover:bg-zinc-600 text-white rounded text-sm transition"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setConfirmDelete(p)}
                      className="p-2 bg-red-900/30 text-red-400 hover:bg-red-600 hover:text-white rounded-lg transition"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const migrateOldSave = (profileName: string) => {
  const oldCredits = localStorage.getItem('csgo_clicker_credits');
  if (oldCredits !== null) {
    const keys = ['credits', 'inventory', 'totalXp', 'claimedBpRewards', 'lastRewardedLevel', 'equippedWeapon', 'clickLevel', 'botLevel', 'luckyDrawLastPlayedHour'];
    keys.forEach(k => {
      const val = localStorage.getItem(`csgo_clicker_${k}`);
      if (val !== null) {
        localStorage.setItem(`csgo_clicker_${profileName}_${k}`, val);
        localStorage.removeItem(`csgo_clicker_${k}`);
      }
    });
  }
};

export default function App() {
  const [currentProfile, setCurrentProfile] = useState<string | null>(() => localStorage.getItem('csgo_clicker_current_profile'));
  const [profiles, setProfiles] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('csgo_clicker_profiles') || '[]');
    } catch { return []; }
  });

  const login = (name: string) => {
    if (!profiles.includes(name)) {
      const newProfiles = [...profiles, name];
      setProfiles(newProfiles);
      localStorage.setItem('csgo_clicker_profiles', JSON.stringify(newProfiles));
      if (profiles.length === 0) {
        migrateOldSave(name);
      }
    }
    localStorage.setItem('csgo_clicker_current_profile', name);
    setCurrentProfile(name);
  };

  const logout = () => {
    localStorage.removeItem('csgo_clicker_current_profile');
    setCurrentProfile(null);
  };

  const deleteProfile = (name: string) => {
    const newProfiles = profiles.filter(p => p !== name);
    setProfiles(newProfiles);
    localStorage.setItem('csgo_clicker_profiles', JSON.stringify(newProfiles));
    
    const keys = ['credits', 'inventory', 'totalXp', 'claimedBpRewards', 'lastRewardedLevel', 'equippedWeapon', 'clickLevel', 'botLevel', 'luckyDrawLastPlayedHour'];
    keys.forEach(k => {
      localStorage.removeItem(`csgo_clicker_${name}_${k}`);
    });
  };

  if (!currentProfile) {
    return <LoginScreen profiles={profiles} onLogin={login} onDelete={deleteProfile} />;
  }

  return <MainGame profile={currentProfile} onSignOut={logout} />;
}

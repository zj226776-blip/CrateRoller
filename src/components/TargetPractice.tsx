import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Weapon } from '../types';
import { WeaponIcon } from './WeaponIcon';
import { Crosshair, RefreshCw } from 'lucide-react';

interface Target {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  createdAt: number;
}

interface TargetPracticeProps {
  equippedWeapon: Weapon | null;
  onGameOver: (score: number, wave: number) => void;
}

const getWeaponStats = (type: string) => {
  const isPistol = ["Glock-18", "USP-S", "P250", "Desert Eagle", "Five-SeveN", "Tec-9"].includes(type);
  const isSMG = ["MAC-10", "MP7", "UMP-45", "P90", "Vector", "MP5-SD"].includes(type);
  const isSniper = ["SSG 08", "AWP", "G3SG1"].includes(type);
  const isHeavy = ["Nova", "XM1014", "MAG-7", "M249", "Negev"].includes(type);
  const isKnife = ["Karambit", "Butterfly Knife", "M9 Bayonet", "Combat Knife", "Tactical Axe", "Katana", "Huntsman Knife"].includes(type);

  if (isPistol) return { fireRate: 300, magSize: 12, reloadTime: 1500, scoreMultiplier: 1, name: "Pistol" };
  if (isSMG) return { fireRate: 100, magSize: 30, reloadTime: 2000, scoreMultiplier: 0.8, name: "SMG" };
  if (isSniper) return { fireRate: 1200, magSize: 10, reloadTime: 3000, scoreMultiplier: 3, name: "Sniper" };
  if (isHeavy) return { fireRate: 200, magSize: 50, reloadTime: 3500, scoreMultiplier: 1.2, name: "Heavy" };
  if (isKnife) return { fireRate: 400, magSize: 999, reloadTime: 0, scoreMultiplier: 2, name: "Melee" };
  
  return { fireRate: 150, magSize: 30, reloadTime: 2500, scoreMultiplier: 1.5, name: "Rifle" };
};

export const TargetPractice: React.FC<TargetPracticeProps> = ({ equippedWeapon, onGameOver }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [wave, setWave] = useState(1);
  const [lives, setLives] = useState(3);
  const [targets, setTargets] = useState<Target[]>([]);
  
  const stats = equippedWeapon ? getWeaponStats(equippedWeapon.type) : getWeaponStats("Glock-18");
  
  const [ammo, setAmmo] = useState(stats.magSize);
  const [isReloading, setIsReloading] = useState(false);
  
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>();
  const lastSpawnRef = useRef<number>(0);
  const lastShotRef = useRef<number>(0);
  const targetsRef = useRef<Target[]>([]);
  const livesRef = useRef(3);
  const waveRef = useRef(1);
  const scoreRef = useRef(0);

  const startGame = () => {
    setIsPlaying(true);
    setScore(0);
    setWave(1);
    setLives(3);
    setTargets([]);
    setAmmo(stats.magSize);
    setIsReloading(false);
    targetsRef.current = [];
    livesRef.current = 3;
    waveRef.current = 1;
    scoreRef.current = 0;
    lastSpawnRef.current = performance.now();
  };

  const reload = useCallback(() => {
    if (isReloading || ammo === stats.magSize) return;
    setIsReloading(true);
    setTimeout(() => {
      setAmmo(stats.magSize);
      setIsReloading(false);
    }, stats.reloadTime);
  }, [isReloading, ammo, stats.magSize, stats.reloadTime]);

  const handleShoot = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isPlaying || isReloading) return;
    
    const now = performance.now();
    if (now - lastShotRef.current < stats.fireRate) return;
    
    if (ammo <= 0) {
      reload();
      return;
    }

    lastShotRef.current = now;
    setAmmo(prev => prev - 1);

    if (!gameAreaRef.current) return;
    const rect = gameAreaRef.current.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    let hitTargetId: number | null = null;
    
    for (let i = targetsRef.current.length - 1; i >= 0; i--) {
      const t = targetsRef.current[i];
      const dx = x - t.x;
      const dy = y - t.y;
      if (Math.sqrt(dx * dx + dy * dy) <= t.size / 2) {
        hitTargetId = t.id;
        break;
      }
    }

    if (hitTargetId !== null) {
      targetsRef.current = targetsRef.current.filter(t => t.id !== hitTargetId);
      setTargets([...targetsRef.current]);
      
      const points = Math.floor(10 * stats.scoreMultiplier * (1 + waveRef.current * 0.1));
      scoreRef.current += points;
      setScore(scoreRef.current);
      
      if (scoreRef.current > waveRef.current * 200) {
        waveRef.current += 1;
        setWave(waveRef.current);
      }
    }
  };

  const updateGame = useCallback((time: number) => {
    if (!isPlaying) return;

    const currentWave = waveRef.current;
    const spawnInterval = Math.max(400, 2000 - currentWave * 150);
    const targetLifetime = Math.max(800, 3000 - currentWave * 200);
    
    if (time - lastSpawnRef.current > spawnInterval) {
      if (gameAreaRef.current) {
        const rect = gameAreaRef.current.getBoundingClientRect();
        const size = Math.max(30, 80 - currentWave * 5);
        
        const speed = currentWave * 0.5;
        const vx = (Math.random() - 0.5) * speed;
        const vy = (Math.random() - 0.5) * speed;

        const newTarget: Target = {
          id: Math.random(),
          x: size/2 + Math.random() * (rect.width - size),
          y: size/2 + Math.random() * (rect.height - size),
          vx,
          vy,
          size,
          createdAt: time
        };
        targetsRef.current.push(newTarget);
        lastSpawnRef.current = time;
      }
    }

    let missed = 0;
    if (gameAreaRef.current) {
      const rect = gameAreaRef.current.getBoundingClientRect();
      targetsRef.current = targetsRef.current.filter(t => {
        if (time - t.createdAt > targetLifetime) {
          missed++;
          return false;
        }
        
        t.x += t.vx;
        t.y += t.vy;
        
        if (t.x - t.size/2 < 0 || t.x + t.size/2 > rect.width) t.vx *= -1;
        if (t.y - t.size/2 < 0 || t.y + t.size/2 > rect.height) t.vy *= -1;
        
        return true;
      });
    }

    if (missed > 0) {
      livesRef.current -= missed;
      setLives(Math.max(0, livesRef.current));
      if (livesRef.current <= 0) {
        setIsPlaying(false);
        onGameOver(scoreRef.current, waveRef.current);
        return;
      }
    }

    setTargets([...targetsRef.current]);
    requestRef.current = requestAnimationFrame(updateGame);
  }, [isPlaying, onGameOver]);

  useEffect(() => {
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(updateGame);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, updateGame]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') {
        reload();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [reload]);

  // Reset ammo when weapon changes
  useEffect(() => {
    setAmmo(stats.magSize);
    setIsReloading(false);
  }, [equippedWeapon]);

  return (
    <div className="flex flex-col h-[600px] bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden select-none">
      <div className="flex justify-between items-center p-4 bg-zinc-950 border-b border-zinc-800">
        <div className="flex items-center gap-4">
          <div className="text-xl font-black text-white">WAVE {wave}</div>
          <div className="text-zinc-400">Score: <span className="text-white font-mono">{score}</span></div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex gap-1">
            {[...Array(3)].map((_, i) => (
              <div key={i} className={`w-4 h-4 rounded-full ${i < lives ? 'bg-red-500' : 'bg-zinc-800'}`} />
            ))}
          </div>
          
          <div className="flex items-center gap-3 bg-zinc-900 px-4 py-2 rounded-lg border border-zinc-800">
            {equippedWeapon ? (
              <WeaponIcon type={equippedWeapon.type} skin={equippedWeapon.name.split(' | ')[1]} className="w-12 h-6 text-zinc-300" />
            ) : (
              <Crosshair className="w-5 h-5 text-zinc-500" />
            )}
            <div className="flex flex-col">
              <span className="text-xs text-zinc-500 font-bold">{stats.name}</span>
              <div className="flex items-center gap-2">
                <span className={`font-mono font-bold ${ammo === 0 ? 'text-red-500' : 'text-white'}`}>
                  {isReloading ? 'RELOADING...' : `${ammo} / ${stats.magSize}`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div 
        ref={gameAreaRef}
        className="flex-1 relative bg-zinc-800 cursor-crosshair overflow-hidden"
        onMouseDown={handleShoot}
        onTouchStart={handleShoot}
      >
        {!isPlaying && lives > 0 && score === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-10">
            <h2 className="text-3xl font-black mb-2 text-white">TARGET PRACTICE</h2>
            <p className="text-zinc-300 mb-6 text-center max-w-md">
              Test your loadout. Targets move faster and disappear quicker each wave. Don't let them escape!
            </p>
            <button 
              onClick={(e) => { e.stopPropagation(); startGame(); }}
              className="px-8 py-4 bg-blue-600 text-white font-black text-xl rounded-lg hover:bg-blue-500 transition shadow-lg shadow-blue-900/20"
            >
              START TRAINING
            </button>
          </div>
        )}

        {!isPlaying && lives <= 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md z-10">
            <h2 className="text-4xl font-black mb-2 text-red-500">GAME OVER</h2>
            <div className="text-2xl text-white mb-2">Wave Reached: <span className="font-bold text-blue-400">{wave}</span></div>
            <div className="text-xl text-zinc-300 mb-8">Final Score: <span className="font-mono font-bold text-amber-400">{score}</span></div>
            <button 
              onClick={(e) => { e.stopPropagation(); startGame(); }}
              className="px-8 py-4 bg-white text-black font-black text-xl rounded-lg hover:bg-zinc-200 transition flex items-center gap-2"
            >
              <RefreshCw className="w-6 h-6" /> PLAY AGAIN
            </button>
          </div>
        )}

        {targets.map(t => {
          const age = performance.now() - t.createdAt;
          const targetLifetime = Math.max(800, 3000 - wave * 200);
          const opacity = 1 - (age / targetLifetime);
          
          return (
            <div 
              key={t.id}
              className="absolute rounded-full border-4 border-red-500 bg-red-500/20 flex items-center justify-center pointer-events-none"
              style={{
                left: t.x - t.size/2,
                top: t.y - t.size/2,
                width: t.size,
                height: t.size,
                opacity: Math.max(0, opacity)
              }}
            >
              <div className="w-1/3 h-1/3 rounded-full bg-red-500" />
            </div>
          );
        })}
        
        {ammo === 0 && !isReloading && isPlaying && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-red-500 font-black text-2xl animate-pulse pointer-events-none">
            PRESS 'R' TO RELOAD
          </div>
        )}
      </div>
    </div>
  );
};

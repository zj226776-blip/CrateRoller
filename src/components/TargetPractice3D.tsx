import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls, Sky, Box } from '@react-three/drei';
import * as THREE from 'three';
import { Weapon } from '../types';
import { WeaponIcon } from './WeaponIcon';
import { Crosshair, RefreshCw, MousePointer2 } from 'lucide-react';

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

interface TargetData {
  id: number;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  size: number;
  createdAt: number;
}

const WeaponHUD = ({ type, recoil }: { type: string, recoil: number }) => {
  const { camera } = useThree();
  const parentRef = useRef<THREE.Group>(null);
  const weaponRef = useRef<THREE.Group>(null);
  
  useFrame(() => {
    if (parentRef.current) {
      parentRef.current.position.copy(camera.position);
      parentRef.current.quaternion.copy(camera.quaternion);
    }
    if (weaponRef.current) {
      weaponRef.current.position.z = THREE.MathUtils.lerp(weaponRef.current.position.z, recoil * 0.5, 0.2);
      weaponRef.current.rotation.x = THREE.MathUtils.lerp(weaponRef.current.rotation.x, recoil * 0.2, 0.2);
    }
  });

  const isPistol = ["Glock-18", "USP-S", "P250", "Desert Eagle", "Five-SeveN", "Tec-9"].includes(type);
  const isSniper = ["SSG 08", "AWP", "G3SG1"].includes(type);
  const isKnife = ["Karambit", "Butterfly Knife", "M9 Bayonet", "Combat Knife", "Tactical Axe", "Katana", "Huntsman Knife"].includes(type);

  return (
    <group ref={parentRef}>
      <group position={[0.3, -0.3, -0.8]} ref={weaponRef}>
        {isKnife ? (
          <Box args={[0.02, 0.4, 0.08]} position={[0, 0.2, 0]} rotation={[0.5, 0, 0]}>
            <meshStandardMaterial color="#888" metalness={0.8} roughness={0.2} />
          </Box>
        ) : isPistol ? (
          <group>
            <Box args={[0.06, 0.1, 0.3]} position={[0, 0.1, 0]}>
              <meshStandardMaterial color="#333" />
            </Box>
            <Box args={[0.05, 0.15, 0.08]} position={[0, -0.02, 0.08]} rotation={[0.2, 0, 0]}>
              <meshStandardMaterial color="#222" />
            </Box>
          </group>
        ) : isSniper ? (
          <group>
            <Box args={[0.08, 0.12, 1.2]} position={[0, 0.1, -0.2]}>
              <meshStandardMaterial color="#222" />
            </Box>
            <Box args={[0.06, 0.2, 0.1]} position={[0, -0.05, 0.2]} rotation={[0.2, 0, 0]}>
              <meshStandardMaterial color="#111" />
            </Box>
            <Box args={[0.04, 0.04, 0.3]} position={[0, 0.22, 0]}>
              <meshStandardMaterial color="#111" />
            </Box>
          </group>
        ) : (
          <group>
            <Box args={[0.08, 0.12, 0.8]} position={[0, 0.1, 0]}>
              <meshStandardMaterial color="#333" />
            </Box>
            <Box args={[0.06, 0.2, 0.1]} position={[0, -0.05, 0.2]} rotation={[0.2, 0, 0]}>
              <meshStandardMaterial color="#222" />
            </Box>
          </group>
        )}
      </group>
    </group>
  );
};

const GameScene = ({ 
  isPlaying, 
  stats, 
  equippedWeapon,
  onHit, 
  onMiss, 
  wave,
  ammo,
  setAmmo,
  isReloading,
  reload
}: any) => {
  const { camera, scene, gl } = useThree();
  const [targets, setTargets] = useState<TargetData[]>([]);
  const [recoil, setRecoil] = useState(0);
  
  const lastShotRef = useRef(0);
  const lastSpawnRef = useRef(0);

  useEffect(() => {
    if (!isPlaying) {
      setTargets([]);
    }
  }, [isPlaying]);

  const handleShoot = useCallback(() => {
    if (!isPlaying || isReloading || document.pointerLockElement !== gl.domElement) return;
    
    const now = performance.now();
    if (now - lastShotRef.current < stats.fireRate) return;
    
    if (ammo <= 0) {
      reload();
      return;
    }

    lastShotRef.current = now;
    setAmmo((prev: number) => prev - 1);
    setRecoil(1);
    setTimeout(() => setRecoil(0), 100);

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    
    const intersects = raycaster.intersectObjects(scene.children, true);
    
    let hitId = null;
    for (const hit of intersects) {
      if (hit.object.userData?.isTarget) {
        hitId = hit.object.userData.id;
        break;
      }
    }

    if (hitId !== null) {
      setTargets(prev => prev.filter(t => t.id !== hitId));
      onHit();
    }
  }, [isPlaying, isReloading, gl.domElement, stats.fireRate, ammo, reload, camera, scene, onHit, setAmmo]);

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 0) handleShoot();
    };
    window.addEventListener('mousedown', onMouseDown);
    return () => window.removeEventListener('mousedown', onMouseDown);
  }, [handleShoot]);

  useFrame((state, delta) => {
    if (!isPlaying) return;

    const time = state.clock.getElapsedTime() * 1000;
    const currentWave = wave;
    const spawnInterval = Math.max(400, 2000 - currentWave * 150);
    const targetLifetime = Math.max(1000, 4000 - currentWave * 200);
    
    if (time - lastSpawnRef.current > spawnInterval) {
      const size = Math.max(0.5, 2 - currentWave * 0.1);
      const speed = currentWave * 0.02;
      
      const distance = 10 + Math.random() * 15;
      const angle = (Math.random() - 0.5) * Math.PI * 0.8;
      const height = 1 + Math.random() * 5;
      
      const x = Math.sin(angle) * distance;
      const z = -Math.cos(angle) * distance;

      const newTarget: TargetData = {
        id: Math.random(),
        position: new THREE.Vector3(x, height, z),
        velocity: new THREE.Vector3((Math.random() - 0.5) * speed, (Math.random() - 0.5) * speed, 0),
        size,
        createdAt: time
      };
      
      setTargets(prev => [...prev, newTarget]);
      lastSpawnRef.current = time;
    }

    let missed = 0;
    setTargets(prev => {
      const next = prev.filter(t => {
        if (time - t.createdAt > targetLifetime) {
          missed++;
          return false;
        }
        return true;
      });
      
      next.forEach(t => {
        t.position.add(t.velocity);
        if (t.position.y < 0.5 || t.position.y > 8) t.velocity.y *= -1;
        if (t.position.x < -20 || t.position.x > 20) t.velocity.x *= -1;
      });
      
      return next;
    });

    if (missed > 0) {
      onMiss(missed);
    }
  });

  return (
    <>
      <Sky sunPosition={[100, 20, 100]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.8} />
      </mesh>

      {/* Shooting Range Walls */}
      <mesh position={[0, 10, -30]} receiveShadow>
        <boxGeometry args={[60, 20, 1]} />
        <meshStandardMaterial color="#333" roughness={0.9} />
      </mesh>
      <mesh position={[-30, 10, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[60, 20, 1]} />
        <meshStandardMaterial color="#333" roughness={0.9} />
      </mesh>
      <mesh position={[30, 10, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[60, 20, 1]} />
        <meshStandardMaterial color="#333" roughness={0.9} />
      </mesh>
      <mesh position={[0, 20, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#222" roughness={0.9} />
      </mesh>

      {/* Range Lanes / Tables */}
      <mesh position={[0, 0.5, -2]} receiveShadow castShadow>
        <boxGeometry args={[60, 1, 2]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
      </mesh>

      <gridHelper args={[100, 100, '#444', '#222']} position={[0, 0.01, 0]} />

      {targets.map(t => (
        <group key={t.id} position={t.position} rotation={[Math.PI / 2, 0, 0]}>
          <mesh userData={{ isTarget: true, id: t.id }} castShadow>
            <cylinderGeometry args={[t.size, t.size, 0.1, 32]} />
            <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.2} />
          </mesh>
          <mesh position={[0, 0.06, 0]} userData={{ isTarget: true, id: t.id }}>
            <cylinderGeometry args={[t.size * 0.6, t.size * 0.6, 0.02, 32]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0, 0.08, 0]} userData={{ isTarget: true, id: t.id }}>
            <cylinderGeometry args={[t.size * 0.2, t.size * 0.2, 0.02, 32]} />
            <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.2} />
          </mesh>
        </group>
      ))}

      <WeaponHUD type={equippedWeapon?.type || "Glock-18"} recoil={recoil} />
      
      {isPlaying && <PointerLockControls />}
    </>
  );
};

export const TargetPractice3D: React.FC<{ equippedWeapon: Weapon | null, onGameOver: (score: number, wave: number) => void }> = ({ equippedWeapon, onGameOver }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [wave, setWave] = useState(1);
  const [lives, setLives] = useState(3);
  
  const stats = equippedWeapon ? getWeaponStats(equippedWeapon.type) : getWeaponStats("Glock-18");
  
  const [ammo, setAmmo] = useState(stats.magSize);
  const [isReloading, setIsReloading] = useState(false);

  const startGame = () => {
    setIsPlaying(true);
    setScore(0);
    setWave(1);
    setLives(3);
    setAmmo(stats.magSize);
    setIsReloading(false);
  };

  const reload = useCallback(() => {
    if (isReloading || ammo === stats.magSize) return;
    setIsReloading(true);
    setTimeout(() => {
      setAmmo(stats.magSize);
      setIsReloading(false);
    }, stats.reloadTime);
  }, [isReloading, ammo, stats.magSize, stats.reloadTime]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') reload();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [reload]);

  useEffect(() => {
    setAmmo(stats.magSize);
    setIsReloading(false);
  }, [equippedWeapon]);

  const handleHit = useCallback(() => {
    setScore(s => {
      const newScore = s + Math.floor(10 * stats.scoreMultiplier * (1 + wave * 0.1));
      if (newScore > wave * 200) {
        setWave(w => w + 1);
      }
      return newScore;
    });
  }, [stats.scoreMultiplier, wave]);

  const handleMiss = useCallback((count: number) => {
    setLives(l => {
      const newLives = Math.max(0, l - count);
      if (newLives === 0) {
        setIsPlaying(false);
        if (document.pointerLockElement) {
          document.exitPointerLock();
        }
        onGameOver(score, wave);
      }
      return newLives;
    });
  }, [onGameOver, score, wave]);

  return (
    <div className="flex flex-col h-[600px] bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden select-none relative">
      {/* HUD */}
      <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-center p-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
        <div className="flex items-center gap-4">
          <div className="text-xl font-black text-white drop-shadow-md">WAVE {wave}</div>
          <div className="text-zinc-300 drop-shadow-md">Score: <span className="text-white font-mono">{score}</span></div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex gap-1">
            {[...Array(3)].map((_, i) => (
              <div key={i} className={`w-4 h-4 rounded-full shadow-md ${i < lives ? 'bg-red-500' : 'bg-zinc-800/80'}`} />
            ))}
          </div>
          
          <div className="flex items-center gap-3 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/10">
            {equippedWeapon ? (
              <WeaponIcon type={equippedWeapon.type} skin={equippedWeapon.name.split(' | ')[1]} className="w-12 h-6 text-zinc-300" />
            ) : (
              <Crosshair className="w-5 h-5 text-zinc-500" />
            )}
            <div className="flex flex-col">
              <span className="text-xs text-zinc-400 font-bold">{stats.name}</span>
              <div className="flex items-center gap-2">
                <span className={`font-mono font-bold ${ammo === 0 ? 'text-red-500' : 'text-white'}`}>
                  {isReloading ? 'RELOADING...' : `${ammo} / ${stats.magSize}`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Crosshair */}
      {isPlaying && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
          <div className="w-1 h-1 bg-green-400 rounded-full shadow-[0_0_4px_#4ade80]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 border-2 border-green-400/50 rounded-full" />
        </div>
      )}

      {/* 3D Canvas */}
      <div className="flex-1 relative bg-zinc-800 cursor-crosshair">
        <Canvas camera={{ position: [0, 1.6, 0], fov: 75 }}>
          <GameScene 
            isPlaying={isPlaying}
            stats={stats}
            equippedWeapon={equippedWeapon}
            onHit={handleHit}
            onMiss={handleMiss}
            wave={wave}
            ammo={ammo}
            setAmmo={setAmmo}
            isReloading={isReloading}
            reload={reload}
          />
        </Canvas>

        {/* Overlays */}
        {!isPlaying && lives > 0 && score === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-20">
            <h2 className="text-3xl font-black mb-2 text-white">3D TARGET PRACTICE</h2>
            <p className="text-zinc-300 mb-6 text-center max-w-md">
              Click to lock mouse and look around. Shoot the red targets before they disappear!
            </p>
            <button 
              onClick={(e) => { e.stopPropagation(); startGame(); }}
              className="px-8 py-4 bg-blue-600 text-white font-black text-xl rounded-lg hover:bg-blue-500 transition shadow-lg shadow-blue-900/20 flex items-center gap-3"
            >
              <MousePointer2 className="w-6 h-6" /> CLICK TO START
            </button>
          </div>
        )}

        {!isPlaying && lives <= 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md z-20">
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
        
        {ammo === 0 && !isReloading && isPlaying && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-red-500 font-black text-2xl animate-pulse pointer-events-none z-10">
            PRESS 'R' TO RELOAD
          </div>
        )}
      </div>
    </div>
  );
};

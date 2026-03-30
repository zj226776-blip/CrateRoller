import React from 'react';

interface WeaponIconProps {
  type: string;
  skin?: string;
  className?: string;
}

const SkinDefs = () => (
  <defs>
    {/* Birthday Wrap */}
    <pattern id="skin-birthday" patternUnits="userSpaceOnUse" width="20" height="20">
      <rect width="20" height="20" fill="#ff99cc" />
      <circle cx="5" cy="5" r="3" fill="#ffea00" />
      <circle cx="15" cy="12" r="4" fill="#00e5ff" />
      <path d="M5,8 Q5,12 3,15" stroke="#fff" fill="none" strokeWidth="1" />
      <path d="M15,16 Q15,18 13,20" stroke="#fff" fill="none" strokeWidth="1" />
      <rect x="8" y="2" width="2" height="6" fill="#ff3d00" transform="rotate(45 9 5)" />
      <rect x="2" y="15" width="2" height="6" fill="#00e676" transform="rotate(-30 3 18)" />
    </pattern>

    {/* Asiimov */}
    <pattern id="skin-asiimov" patternUnits="userSpaceOnUse" width="40" height="40">
      <rect width="40" height="40" fill="#ffffff" />
      <path d="M0,0 L20,0 L0,20 Z" fill="#ff6600" />
      <path d="M20,40 L40,40 L40,20 Z" fill="#222222" />
      <rect x="15" y="15" width="10" height="10" fill="#ff6600" />
      <path d="M30,0 L40,0 L40,10 Z" fill="#222222" />
    </pattern>

    {/* Fade */}
    <linearGradient id="skin-fade" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="#ffeb3b" />
      <stop offset="40%" stopColor="#e91e63" />
      <stop offset="100%" stopColor="#673ab7" />
    </linearGradient>

    {/* Dragon Lore */}
    <linearGradient id="skin-dragon-lore" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#d4af37" />
      <stop offset="40%" stopColor="#b8860b" />
      <stop offset="70%" stopColor="#8b0000" />
      <stop offset="100%" stopColor="#556b2f" />
    </linearGradient>

    {/* Redline */}
    <pattern id="skin-redline" patternUnits="userSpaceOnUse" width="10" height="10">
      <rect width="10" height="10" fill="#222222" />
      <path d="M0,10 L10,0" stroke="#111111" strokeWidth="2" />
      <rect x="0" y="4" width="10" height="1.5" fill="#ff0000" />
    </pattern>

    {/* Hyper Beast */}
    <linearGradient id="skin-hyper-beast" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#00ffcc" />
      <stop offset="33%" stopColor="#ff0066" />
      <stop offset="66%" stopColor="#9900ff" />
      <stop offset="100%" stopColor="#0033cc" />
    </linearGradient>

    {/* Neon Rider */}
    <linearGradient id="skin-neon-rider" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="#ff00ff" />
      <stop offset="50%" stopColor="#00ffff" />
      <stop offset="100%" stopColor="#ff0055" />
    </linearGradient>

    {/* Safari Mesh */}
    <pattern id="skin-safari-mesh" patternUnits="userSpaceOnUse" width="8" height="8">
      <rect width="8" height="8" fill="#8B7D6B" />
      <path d="M0,0 L8,8 M8,0 L0,8" stroke="#5C5448" strokeWidth="1" />
    </pattern>

    {/* Sand Dune */}
    <pattern id="skin-sand-dune" patternUnits="userSpaceOnUse" width="10" height="10">
      <rect width="10" height="10" fill="#C2B280" />
      <circle cx="5" cy="5" r="1" fill="#A89F75" />
    </pattern>

    {/* Sapphire */}
    <linearGradient id="skin-sapphire" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#4facfe" />
      <stop offset="100%" stopColor="#00f2fe" />
    </linearGradient>

    {/* Emerald */}
    <linearGradient id="skin-emerald" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#0ba360" />
      <stop offset="100%" stopColor="#3cba92" />
    </linearGradient>

    {/* Ruby */}
    <linearGradient id="skin-ruby" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#ff0844" />
      <stop offset="100%" stopColor="#ffb199" />
    </linearGradient>

    {/* Crimson Web */}
    <pattern id="skin-crimson-web" patternUnits="userSpaceOnUse" width="20" height="20">
      <rect width="20" height="20" fill="#800000" />
      <circle cx="10" cy="10" r="8" stroke="#000000" strokeWidth="0.5" fill="none" />
      <circle cx="10" cy="10" r="4" stroke="#000000" strokeWidth="0.5" fill="none" />
      <path d="M10,0 L10,20 M0,10 L20,10 M3,3 L17,17 M3,17 L17,3" stroke="#000000" strokeWidth="0.5" />
    </pattern>

    {/* Default Pattern */}
    <linearGradient id="skin-default" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#666" />
      <stop offset="100%" stopColor="#333" />
    </linearGradient>
  </defs>
);

const getSkinFill = (skin?: string) => {
  if (!skin) return "currentColor";
  
  const s = skin.toLowerCase();
  if (s.includes("birthday")) return "url(#skin-birthday)";
  if (s.includes("asiimov")) return "url(#skin-asiimov)";
  if (s.includes("fade")) return "url(#skin-fade)";
  if (s.includes("dragon lore")) return "url(#skin-dragon-lore)";
  if (s.includes("redline")) return "url(#skin-redline)";
  if (s.includes("hyper beast")) return "url(#skin-hyper-beast)";
  if (s.includes("neon rider")) return "url(#skin-neon-rider)";
  if (s.includes("sand dune")) return "url(#skin-sand-dune)";
  if (s.includes("safari mesh")) return "url(#skin-safari-mesh)";
  if (s.includes("blue gem") || s.includes("sapphire")) return "url(#skin-sapphire)";
  if (s.includes("emerald")) return "url(#skin-emerald)";
  if (s.includes("ruby")) return "url(#skin-ruby)";
  if (s.includes("crimson web")) return "url(#skin-crimson-web)";
  
  return "url(#skin-default)";
};

export const WeaponIcon: React.FC<WeaponIconProps> = ({ type, skin, className = "w-16 h-8" }) => {
  const isPistol = ["Glock-18", "USP-S", "P250", "Desert Eagle", "Five-SeveN", "Tec-9"].includes(type);
  const isSMG = ["MAC-10", "MP7", "UMP-45", "P90", "Vector", "MP5-SD"].includes(type);
  const isSniper = ["SSG 08", "AWP", "G3SG1"].includes(type);
  const isKnife = ["Karambit", "Butterfly Knife", "M9 Bayonet", "Combat Knife", "Tactical Axe", "Katana", "Huntsman Knife"].includes(type);

  const fill = getSkinFill(skin);

  return (
    <svg viewBox="0 0 100 50" className={className}>
      <SkinDefs />
      
      {isPistol && (
        <g>
          {/* Main Body */}
          <path d="M25,15 L65,15 C66,15 67,16 67,17 L67,21 L62,21 L55,39 C54,41 52,41 50,41 L42,41 C40,41 41,39 42,37 L48,21 L25,21 C23,21 22,20 22,19 L22,17 C22,16 23,15 25,15 Z" fill={fill} />
          {/* Slide Details */}
          <path d="M22,15 L67,15 L67,18 L22,18 Z" fill="rgba(255,255,255,0.15)" />
          {/* Trigger Guard */}
          <path d="M40,21 L40,27 C40,29 46,29 46,27 L46,21 Z" fill="none" stroke="rgba(0,0,0,0.6)" strokeWidth="1.5" />
          {/* Trigger */}
          <path d="M43,21 L42,25" stroke="rgba(0,0,0,0.8)" strokeWidth="1.5" />
          {/* Grip Texture */}
          <path d="M45,25 L52,39 L44,39 L39,25 Z" fill="rgba(0,0,0,0.2)" />
        </g>
      )}

      {isSMG && (
        <g>
          {/* Main Body */}
          <path d="M25,18 L65,18 L65,25 L55,25 L55,38 L45,38 L45,25 L35,25 L35,38 L28,38 L28,25 L25,25 Z" fill={fill} />
          {/* Barrel */}
          <path d="M65,20 L75,20 L75,22 L65,22 Z" fill="rgba(0,0,0,0.8)" />
          {/* Top Rail */}
          <path d="M25,15 L60,15 L60,18 L25,18 Z" fill="rgba(0,0,0,0.6)" />
          {/* Mag detail */}
          <path d="M45,25 L55,25 L55,38 L45,38 Z" fill="rgba(0,0,0,0.3)" />
          {/* Trigger Guard */}
          <path d="M35,25 L35,29 L40,29 L40,25 Z" fill="none" stroke="rgba(0,0,0,0.6)" strokeWidth="1" />
        </g>
      )}

      {isSniper && (
        <g>
          {/* Stock & Body */}
          <path d="M10,25 L30,23 L55,23 L60,27 L40,27 L35,33 L20,33 L15,29 Z" fill={fill} />
          {/* Barrel */}
          <path d="M55,23 L95,23 L95,25 L55,25 Z" fill="rgba(0,0,0,0.8)" />
          {/* Scope */}
          <path d="M35,17 L60,17 L60,20 L35,20 Z" fill="rgba(0,0,0,0.9)" />
          <path d="M38,20 L38,23 M57,20 L57,23" stroke="rgba(0,0,0,0.9)" strokeWidth="2" />
          <path d="M33,15 L37,15 L37,22 L33,22 Z" fill="rgba(0,0,0,0.9)" />
          <path d="M58,15 L62,15 L62,22 L58,22 Z" fill="rgba(0,0,0,0.9)" />
          {/* Magazine */}
          <path d="M42,27 L44,35 L50,35 L50,27 Z" fill="rgba(0,0,0,0.8)" />
          {/* Bipod */}
          <path d="M70,25 L65,33 M70,25 L75,33" stroke="rgba(0,0,0,0.8)" strokeWidth="1.5" />
        </g>
      )}

      {isKnife && (
        <g>
          {/* Handle */}
          <path d="M30,28 C35,28 40,23 45,18 L50,21 C45,28 40,33 35,33 Z" fill="rgba(0,0,0,0.8)" />
          {/* Ring */}
          <circle cx="28" cy="30" r="3" stroke="rgba(0,0,0,0.8)" strokeWidth="2" fill="none" />
          {/* Blade */}
          <path d="M45,18 C55,13 70,13 80,28 C70,18 55,21 50,21 Z" fill={fill} />
        </g>
      )}

      {!isPistol && !isSMG && !isSniper && !isKnife && (
        <g>
          {/* Stock */}
          <path d="M10,25 L25,23 L25,30 L15,33 Z" fill={fill} />
          {/* Receiver */}
          <path d="M25,22 L55,22 L55,28 L25,28 Z" fill={fill} />
          {/* Magazine */}
          <path d="M40,28 L45,43 C47,45 52,45 53,43 L55,28 Z" fill={fill} />
          {/* Barrel & Handguard */}
          <path d="M55,23 L85,23 L85,25 L55,25 Z" fill="rgba(0,0,0,0.7)" />
          <path d="M55,25 L75,25 L75,27 L55,27 Z" fill={fill} />
          {/* Sight & Gas tube */}
          <path d="M65,21 L75,21 L75,23 L65,23 Z" fill="rgba(0,0,0,0.7)" />
          <path d="M80,21 L82,21 L82,23 L80,23 Z" fill="rgba(0,0,0,0.7)" />
          {/* Grip */}
          <path d="M25,28 L30,38 L25,40 L20,30 Z" fill={fill} />
          {/* Trigger Guard */}
          <path d="M35,28 L35,32 L40,32 L40,28 Z" fill="none" stroke="rgba(0,0,0,0.6)" strokeWidth="1.5" />
        </g>
      )}
    </svg>
  );
};

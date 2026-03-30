import React from 'react';
import { Crosshair, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

export function MobileControls() {
  // In your actual Vercel code, you would pass functions like `onMoveForward`, `onShoot`, etc.
  // and call them on `onTouchStart` and `onTouchEnd` instead of `onClick`.

  return (
    <div className="fixed bottom-8 left-0 right-0 px-8 flex justify-between items-end z-50 lg:hidden pointer-events-none select-none">
      {/* Movement D-Pad (Left) */}
      <div className="pointer-events-auto flex flex-col items-center gap-2 opacity-60">
        <button className="w-14 h-14 bg-zinc-800/80 border-2 border-zinc-500 rounded-full flex items-center justify-center active:bg-zinc-600 active:scale-95 transition-all">
          <ArrowUp className="w-8 h-8 text-white" />
        </button>
        <div className="flex gap-2">
          <button className="w-14 h-14 bg-zinc-800/80 border-2 border-zinc-500 rounded-full flex items-center justify-center active:bg-zinc-600 active:scale-95 transition-all">
            <ArrowLeft className="w-8 h-8 text-white" />
          </button>
          <button className="w-14 h-14 bg-zinc-800/80 border-2 border-zinc-500 rounded-full flex items-center justify-center active:bg-zinc-600 active:scale-95 transition-all">
            <ArrowDown className="w-8 h-8 text-white" />
          </button>
          <button className="w-14 h-14 bg-zinc-800/80 border-2 border-zinc-500 rounded-full flex items-center justify-center active:bg-zinc-600 active:scale-95 transition-all">
            <ArrowRight className="w-8 h-8 text-white" />
          </button>
        </div>
      </div>

      {/* Action Buttons (Right) */}
      <div className="pointer-events-auto flex flex-col items-end gap-4 opacity-60">
        <button className="w-14 h-14 bg-zinc-800/80 border-2 border-zinc-500 rounded-full flex items-center justify-center active:bg-zinc-600 active:scale-95 transition-all mb-2 mr-4">
          <span className="text-white font-bold text-xs">JUMP</span>
        </button>
        <button className="w-20 h-20 bg-red-600/80 border-2 border-red-400 rounded-full flex items-center justify-center active:bg-red-500 active:scale-95 transition-all shadow-[0_0_15px_rgba(220,38,38,0.5)]">
          <Crosshair className="w-10 h-10 text-white" />
        </button>
      </div>
    </div>
  );
}

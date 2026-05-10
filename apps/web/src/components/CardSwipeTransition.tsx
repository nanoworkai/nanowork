import { useEffect } from "react";

export default function CardSwipeTransition({ onComplete }: { onComplete?: () => void }) {
  useEffect(() => {
    console.log('🎴 Card animation starting');

    const timer = setTimeout(() => {
      console.log('🎴 Card animation complete');
      onComplete?.();
    }, 2800);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900"
      style={{
        animation: "fadeOverlay 2.8s ease-in-out forwards"
      }}
    >
      {/* Credit Card */}
      <div
        className="relative"
        style={{
          width: "420px",
          height: "260px",
          animation: "swipeCard 2.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards"
        }}
      >
        {/* Card Body */}
        <div className="w-full h-full rounded-2xl bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 shadow-2xl relative overflow-hidden">

          {/* Subtle shine */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background: "linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)",
              animation: "swipeShine 2.8s ease-out forwards"
            }}
          />

          {/* Card Content */}
          <div className="relative z-10 h-full p-7 flex flex-col justify-between">

            {/* Top Row */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                {/* Chip */}
                <div className="w-12 h-10 rounded-lg bg-gradient-to-br from-amber-300 to-amber-500 shadow-lg" />
                <div>
                  <div className="text-white text-sm font-bold tracking-wide">NANOWORK</div>
                  <div className="text-white/60 text-xs font-medium tracking-wide">AGENT CARD</div>
                </div>
              </div>
              <div className="text-white/40 text-xs font-bold tracking-widest">VIRTUAL</div>
            </div>

            {/* Middle - Card Number */}
            <div className="flex-1 flex items-center">
              <div className="text-white text-2xl font-bold tracking-[0.25em] font-mono">
                •••• •••• •••• 4892
              </div>
            </div>

            {/* Bottom Row */}
            <div className="flex justify-between items-end">
              <div>
                <div className="text-white/50 text-[9px] font-bold mb-1 tracking-widest">DEPT</div>
                <div className="text-white text-sm font-bold tracking-wide">FINANCE</div>
              </div>
              <div>
                <div className="text-white/50 text-[9px] font-bold mb-1 tracking-widest">VALID THRU</div>
                <div className="text-white text-sm font-bold tracking-wider font-mono">12/28</div>
              </div>
              {/* Card Network */}
              <div className="flex items-center -space-x-2">
                <div className="w-7 h-7 rounded-full bg-red-500 opacity-90" />
                <div className="w-7 h-7 rounded-full bg-amber-400 opacity-90" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inline styles for animations */}
      <style>{`
        @keyframes fadeOverlay {
          0% { opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { opacity: 0; }
        }

        @keyframes swipeCard {
          0% {
            transform: translateX(-150vw) rotate(-25deg) scale(0.6);
            opacity: 0;
          }
          20% {
            transform: translateX(0) rotate(-3deg) scale(1);
            opacity: 1;
          }
          80% {
            transform: translateX(0) rotate(-3deg) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateX(150vw) rotate(25deg) scale(0.6);
            opacity: 0;
          }
        }

        @keyframes swipeShine {
          0% {
            transform: translateX(-200%) skewX(-20deg);
          }
          100% {
            transform: translateX(200%) skewX(-20deg);
          }
        }
      `}</style>
    </div>
  );
}

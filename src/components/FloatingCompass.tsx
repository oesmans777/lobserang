import React, { useRef } from 'react';

export const FloatingCompass: React.FC = () => {
  const scrollAnimRef = useRef<number | null>(null);

  const startScroll = (dx: number, dy: number) => {
    const target = document.querySelector('.content-body') as HTMLElement;
    if (!target) return;

    const step = () => {
      target.scrollBy({ left: dx, top: dy, behavior: 'auto' });
      scrollAnimRef.current = requestAnimationFrame(step);
    };
    step();
  };

  const stopScroll = () => {
    if (scrollAnimRef.current) {
      cancelAnimationFrame(scrollAnimRef.current);
      scrollAnimRef.current = null;
    }
  };

  return (
    <div className="hidden lg:grid fixed bottom-6 left-6 w-20 h-20 bg-white/60 backdrop-blur-md rounded-full border border-slate-300 shadow-xl grid-cols-3 grid-rows-3 z-40 select-none overflow-hidden">
      <div className="col-start-2 row-start-1">
        <button
          onMouseDown={() => startScroll(0, -18)}
          onMouseUp={stopScroll}
          onMouseLeave={stopScroll}
          onTouchStart={e => { e.preventDefault(); startScroll(0, -18); }}
          onTouchEnd={stopScroll}
          className="w-full h-full flex items-center justify-center text-xs font-black text-slate-800 hover:bg-black/10 active:bg-black/20 cursor-pointer"
        >
          ▲
        </button>
      </div>

      <div className="col-start-1 row-start-2">
        <button
          onMouseDown={() => startScroll(-18, 0)}
          onMouseUp={stopScroll}
          onMouseLeave={stopScroll}
          onTouchStart={e => { e.preventDefault(); startScroll(-18, 0); }}
          onTouchEnd={stopScroll}
          className="w-full h-full flex items-center justify-center text-xs font-black text-slate-800 hover:bg-black/10 active:bg-black/20 cursor-pointer"
        >
          ◀
        </button>
      </div>

      <div className="col-start-2 row-start-2 flex items-center justify-center opacity-30 text-sm font-bold text-slate-800 pointer-events-none">
        ✛
      </div>

      <div className="col-start-3 row-start-2">
        <button
          onMouseDown={() => startScroll(18, 0)}
          onMouseUp={stopScroll}
          onMouseLeave={stopScroll}
          onTouchStart={e => { e.preventDefault(); startScroll(18, 0); }}
          onTouchEnd={stopScroll}
          className="w-full h-full flex items-center justify-center text-xs font-black text-slate-800 hover:bg-black/10 active:bg-black/20 cursor-pointer"
        >
          ▶
        </button>
      </div>

      <div className="col-start-2 row-start-3">
        <button
          onMouseDown={() => startScroll(0, 18)}
          onMouseUp={stopScroll}
          onMouseLeave={stopScroll}
          onTouchStart={e => { e.preventDefault(); startScroll(0, 18); }}
          onTouchEnd={stopScroll}
          className="w-full h-full flex items-center justify-center text-xs font-black text-slate-800 hover:bg-black/10 active:bg-black/20 cursor-pointer"
        >
          ▼
        </button>
      </div>
    </div>
  );
};

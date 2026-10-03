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
    <div className="hidden lg:grid fixed bottom-6 left-6 w-20 h-20 bg-[#013A40]/90 backdrop-blur-md shape-cyber-card border-2 border-[#038C8C]/50 shadow-2xl grid-cols-3 grid-rows-3 z-40 select-none overflow-hidden">
      <div className="col-start-2 row-start-1">
        <button
          onMouseDown={() => startScroll(0, -18)}
          onMouseUp={stopScroll}
          onMouseLeave={stopScroll}
          onTouchStart={e => { e.preventDefault(); startScroll(0, -18); }}
          onTouchEnd={stopScroll}
          className="w-full h-full flex items-center justify-center text-xs font-black text-[#B2DCE5] hover:text-[#F8B700] hover:bg-[#038C8C]/40 active:bg-[#038C8C]/60 cursor-pointer transition"
          title="Scroll Ke Atas"
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
          className="w-full h-full flex items-center justify-center text-xs font-black text-[#B2DCE5] hover:text-[#F8B700] hover:bg-[#038C8C]/40 active:bg-[#038C8C]/60 cursor-pointer transition"
          title="Scroll Ke Kiri"
        >
          ◀
        </button>
      </div>

      <div className="col-start-2 row-start-2 flex items-center justify-center text-xs font-black text-[#F8B700] pointer-events-none drop-shadow-[0_0_6px_#F8B700]">
        ✛
      </div>

      <div className="col-start-3 row-start-2">
        <button
          onMouseDown={() => startScroll(18, 0)}
          onMouseUp={stopScroll}
          onMouseLeave={stopScroll}
          onTouchStart={e => { e.preventDefault(); startScroll(18, 0); }}
          onTouchEnd={stopScroll}
          className="w-full h-full flex items-center justify-center text-xs font-black text-[#B2DCE5] hover:text-[#F8B700] hover:bg-[#038C8C]/40 active:bg-[#038C8C]/60 cursor-pointer transition"
          title="Scroll Ke Kanan"
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
          className="w-full h-full flex items-center justify-center text-xs font-black text-[#B2DCE5] hover:text-[#F8B700] hover:bg-[#038C8C]/40 active:bg-[#038C8C]/60 cursor-pointer transition"
          title="Scroll Ke Bawah"
        >
          ▼
        </button>
      </div>
    </div>
  );
};

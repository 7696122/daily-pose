interface GridOverlayProps {
  show: boolean;
}

export const GridOverlay = ({ show }: GridOverlayProps) => {
  if (!show) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {/* 3분할 그리드 (Rule of Thirds) */}
      <div className="absolute inset-0">
        {/* 세로선 */}
        <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/30" />
        <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/30" />
        {/* 가로선 */}
        <div className="absolute top-1/3 left-0 right-0 h-px bg-white/30" />
        <div className="absolute top-2/3 left-0 right-0 h-px bg-white/30" />
      </div>

      {/* 코너 마크 */}
      <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-white/50" />
      <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-white/50" />
      <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-white/50" />
      <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-white/50" />

      {/* 중앙 십자선 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12">
        <div className="absolute top-1/2 left-0 right-0 h-px bg-white/40 -translate-y-1/2" />
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/40 -translate-x-1/2" />
      </div>
    </div>
  );
};

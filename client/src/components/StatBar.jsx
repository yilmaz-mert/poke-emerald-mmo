// client/src/components/StatBar.jsx
export default function StatBar({ statName, baseStat, color }) {
  return (
    <div>
      <div className="flex justify-between font-pixel text-[8px] text-[#34441c] uppercase mb-1">
        <span>{statName.replace('-', ' ')}</span>
        <span>{baseStat}</span>
      </div>
      <div className="h-2 w-full bg-black/10 border-2 border-[#081820] rounded-full overflow-hidden">
        <div 
          className="h-full transition-all duration-1000 ease-out"
          style={{ width: `${Math.min(100, (baseStat / 150) * 100)}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
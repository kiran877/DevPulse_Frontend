import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const MetricCard = ({ title, value, unit, trend, icon: Icon, color, subText }) => {
  const [flash, setFlash] = useState(false);

  // Trigger flash animation when value changes
  useEffect(() => {
    // Only flash if value is greater than 0 to avoid flashing on initial load
    if (value !== undefined && value !== null) {
      setFlash(true);
      const timer = setTimeout(() => setFlash(false), 1500); // 1.5s flash duration
      return () => clearTimeout(timer);
    }
  }, [value]);

  const isPositiveTrend = trend >= 0;

  return (
    <div className={`relative overflow-hidden group transition-all duration-500 ${flash ? 'scale-[1.03] shadow-2xl ring-2 ring-emerald-500/30' : 'hover:scale-[1.02] shadow-2xl shadow-slate-950/50'} bg-slate-900/40 backdrop-blur-2xl p-4 sm:p-5 rounded-2xl border-none flex flex-col justify-between h-full`}>
      {/* Dynamic Background Glow */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${color || 'from-emerald-500 to-teal-600'} opacity-5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500`} />

      {/* Flash overlay */}
      <div className={`absolute inset-0 bg-emerald-500/5 pointer-events-none transition-opacity duration-500 ${flash ? 'opacity-100' : 'opacity-0'}`} />

      <div className="flex items-start justify-between relative z-10 w-full">
        <div className="min-w-0 flex-1 pr-2">
          <p className="text-slate-400 font-bold mb-1 text-[10px] sm:text-xs uppercase tracking-widest truncate" title={title}>{title}</p>
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <h3 className={`text-2xl sm:text-3xl font-black tracking-tight transition-colors duration-500 ${flash ? 'text-emerald-400' : 'text-white'}`}>{value}</h3>
            <span className="text-slate-500 text-[10px] sm:text-xs font-bold whitespace-nowrap">{unit}</span>
          </div>
          {subText && <p className="text-slate-400 text-[10px] sm:text-xs mt-3 font-medium leading-tight">{subText}</p>}
        </div>

        {Icon && (
          <div className={`p-2 sm:p-3 rounded-xl bg-gradient-to-br ${color || 'from-emerald-500 to-teal-600'} shadow-lg shadow-black/20 ring-1 ring-white/10 transition-transform duration-500 flex-shrink-0 ${flash ? 'scale-110 rotate-3' : ''}`}>
            <Icon className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
          </div>
        )}
      </div>

      {trend !== undefined && trend !== null && (
        <div className="mt-4 flex items-center gap-2 relative z-10">
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold ${isPositiveTrend ? 'bg-emerald-950/50 text-emerald-400' : 'bg-rose-950/50 text-rose-400'
            }`}>
            {isPositiveTrend ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(trend)}%
          </div>
          <span className="text-slate-500 text-[10px] sm:text-xs font-medium">vs yesterday</span>
        </div>
      )}
    </div>
  );
};

export default MetricCard;

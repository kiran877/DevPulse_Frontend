import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const MetricCard = ({ title, value, unit, trend, description, color = 'indigo' }) => {
  const isPositiveTrend = trend >= 0;
  
  // Map color names to Tailwind classes
  const colorMap = {
    indigo: 'border-indigo-500 shadow-indigo-100',
    rose: 'border-rose-500 shadow-rose-100',
    amber: 'border-amber-500 shadow-amber-100',
    red: 'border-red-500 shadow-red-100',
  };

  const badgeMap = {
    indigo: 'bg-indigo-50 text-indigo-600',
    rose: 'bg-rose-50 text-rose-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <div className={`bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border-t-4 ${colorMap[color] || colorMap.indigo} hover:scale-[1.02] transition-all duration-300 group relative overflow-hidden`}>
      <div className="flex justify-between items-start mb-4 relative z-10">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</h3>
        <div className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold ${badgeMap[color] || 'bg-green-50 text-green-600'}`}>
          {isPositiveTrend ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          <span>{Math.abs(trend)}%</span>
        </div>
      </div>
      <div className="flex items-baseline space-x-2 relative z-10">
        <span className="text-4xl font-black text-slate-900 tracking-tight">{value}</span>
        <span className="text-sm font-bold text-slate-400">{unit}</span>
      </div>
      <p className="mt-3 text-xs font-medium text-slate-500 leading-relaxed relative z-10">{description}</p>
      
      {/* Decorative background element */}
      <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-5 blur-2xl ${color === 'rose' ? 'bg-rose-500' : color === 'amber' ? 'bg-amber-500' : color === 'red' ? 'bg-red-500' : 'bg-indigo-500'}`}></div>
    </div>
  );
};

export default MetricCard;

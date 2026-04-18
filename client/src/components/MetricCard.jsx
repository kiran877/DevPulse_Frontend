import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const MetricCard = ({ title, value, unit, trend, description }) => {
  const isPositiveTrend = trend >= 0;
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</h3>
        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-semibold ${
          isPositiveTrend ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
        }`}>
          {isPositiveTrend ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          <span>{Math.abs(trend)}%</span>
        </div>
      </div>
      <div className="flex items-baseline space-x-2">
        <span className="text-3xl font-bold text-gray-900">{value}</span>
        <span className="text-sm font-medium text-gray-400">{unit}</span>
      </div>
      <p className="mt-2 text-xs text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
};

export default MetricCard;

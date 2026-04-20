import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const TrendChart = ({ data, metric, color = "#6366f1", title = "Trend" }) => {
  // Use a softer version of the color for the gradient
  const gradientId = `color${metric}`;

  return (
    <div className="h-[350px] w-full mt-6 bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-slate-100 shadow-xl group">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">{title}</h3>
        <div className="h-1.5 w-12 rounded-full" style={{ backgroundColor: color }}></div>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="date" 
            tickFormatter={(str) => {
              try {
                return new Date(str).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
              } catch (e) {
                return str;
              }
            }}
            tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
            dy={10}
          />
          <YAxis 
            tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip 
            contentStyle={{ 
              borderRadius: '12px', 
              border: 'none', 
              boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
              padding: '12px'
            }}
            labelStyle={{ fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}
            itemStyle={{ fontWeight: 600, fontSize: '12px' }}
            labelFormatter={(label) => {
              try {
                return new Date(label).toLocaleDateString(undefined, { dateStyle: 'long' });
              } catch (e) {
                return label;
              }
            }}
          />
          <Area 
            type="monotone" 
            dataKey={metric} 
            stroke={color} 
            strokeWidth={4} 
            fillOpacity={1} 
            fill={`url(#${gradientId})`}
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrendChart;

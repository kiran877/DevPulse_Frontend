import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const TrendChart = ({ data, metric, color = "#10b981", title = "Trend" }) => {
  // Use a softer version of the color for the gradient
  const gradientId = `color${metric}`;

  return (
    <div className="h-[350px] w-full mt-6 bg-slate-900/40 backdrop-blur-2xl p-8 rounded-2xl border-none shadow-2xl shadow-slate-950/50 group">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">{title}</h3>
        <div className="h-1.5 w-12 rounded-full" style={{ backgroundColor: color }}></div>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.2} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
          <XAxis
            dataKey="date"
            tickFormatter={(str) => {
              try {
                return new Date(str).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
              } catch (e) {
                return str;
              }
            }}
            tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
            dy={10}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              borderRadius: '12px',
              border: 'none',
              backgroundColor: '#0f172a',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              padding: '12px'
            }}
            labelStyle={{ fontWeight: 800, color: '#f1f5f9', marginBottom: '4px' }}
            itemStyle={{ fontWeight: 600, fontSize: '12px', color: '#34d399' }}
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

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const TrendChart = ({ data, metric, color = "#6366f1" }) => {
  return (
    <div className="h-[300px] w-full mt-6 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 mb-6 uppercase tracking-wider">30-Day Trend: {metric}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
          <XAxis 
            dataKey="date" 
            tickFormatter={(str) => {
              try {
                return new Date(str).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
              } catch (e) {
                return str;
              }
            }}
            tick={{ fontSize: 12, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            labelFormatter={(label) => {
              try {
                return new Date(label).toLocaleDateString(undefined, { dateStyle: 'long' });
              } catch (e) {
                return label;
              }
            }}
          />
          <Line 
            type="monotone" 
            dataKey={metric} 
            stroke={color} 
            strokeWidth={3} 
            dot={false}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrendChart;

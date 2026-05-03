'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { day: 'Mon', revenue: 2800 },
  { day: 'Tue', revenue: 3200 },
  { day: 'Wed', revenue: 2900 },
  { day: 'Thu', revenue: 4100 },
  { day: 'Fri', revenue: 3800 },
  { day: 'Sat', revenue: 4500 },
  { day: 'Sun', revenue: 4800 },
];

export function RevenueChart() {
  return (
    <div className="rounded-lg border border-[#27272A] bg-[#111111] p-4">
      <h3 className="mb-4 text-lg font-semibold text-white">Revenue Trend</h3>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FACC15" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#FACC15" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272A" vertical={false} />
            <XAxis dataKey="day" tick={{ fill: '#71717A', fontSize: 12 }} axisLine={{ stroke: '#27272A' }} tickLine={false} />
            <YAxis tick={{ fill: '#71717A', fontSize: 12 }} axisLine={{ stroke: '#27272A' }} tickLine={false} />
            <Tooltip
              contentStyle={{ background: '#1A1A1A', border: '1px solid #27272A', borderRadius: '8px', color: '#fff' }}
              formatter={(value: number | undefined) => [`€${(value ?? 0).toLocaleString()}`, 'Revenue']}
            />
            <Area type="monotone" dataKey="revenue" stroke="#FACC15" strokeWidth={2} fill="url(#revenueGradient)" dot={{ fill: '#FACC15', r: 4 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

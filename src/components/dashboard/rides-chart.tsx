'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { day: 'Mon', rides: 65 },
  { day: 'Tue', rides: 45 },
  { day: 'Wed', rides: 78 },
  { day: 'Thu', rides: 92 },
  { day: 'Fri', rides: 88 },
  { day: 'Sat', rides: 54 },
  { day: 'Sun', rides: 40 },
];

export function RidesChart() {
  return (
    <div className="rounded-lg border border-[#27272A] bg-[#111111] p-4">
      <h3 className="mb-4 text-lg font-semibold text-white">Rides This Week</h3>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272A" vertical={false} />
            <XAxis dataKey="day" tick={{ fill: '#71717A', fontSize: 12 }} axisLine={{ stroke: '#27272A' }} tickLine={false} />
            <YAxis tick={{ fill: '#71717A', fontSize: 12 }} axisLine={{ stroke: '#27272A' }} tickLine={false} />
            <Tooltip
              contentStyle={{ background: '#1A1A1A', border: '1px solid #27272A', borderRadius: '8px', color: '#fff' }}
              cursor={{ fill: 'rgba(250,204,21,0.1)' }}
            />
            <Bar dataKey="rides" fill="#FACC15" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

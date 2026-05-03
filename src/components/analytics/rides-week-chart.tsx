'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { WeeklyChartPoint } from '@/types';

interface RidesWeekChartProps {
  data: WeeklyChartPoint[];
}

export function RidesWeekChart({ data }: RidesWeekChartProps) {
  return (
    <div className="rounded-lg border border-[#27272A] bg-[#111111] p-4">
      <h3 className="mb-4 font-semibold text-white">Rides This Week</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272A" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fill: '#71717A', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#71717A', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1A1A1A',
              border: '1px solid #27272A',
              borderRadius: 8,
            }}
            labelStyle={{ color: '#A1A1AA', fontSize: 12 }}
            formatter={(value: number | undefined) => [value ?? 0, 'Rides']}
          />
          <Bar dataKey="value" fill="#FACC15" radius={[4, 4, 0, 0]} barSize={30} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

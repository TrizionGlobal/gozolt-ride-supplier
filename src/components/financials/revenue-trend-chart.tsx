'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { RevenueTrendPoint } from '@/types';

interface RevenueTrendChartProps {
  data: RevenueTrendPoint[];
  isLoading: boolean;
}

export function RevenueTrendChart({ data, isLoading }: RevenueTrendChartProps) {
  return (
    <div className="rounded-lg border border-[#27272A] bg-[#111111] p-6">
      <h3 className="mb-4 text-lg font-semibold text-white">Revenue Trend</h3>

      {isLoading ? (
        <div className="h-[300px] rounded bg-[#27272A] animate-pulse" />
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FACC15" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#FACC15" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272A" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fill: '#71717A', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#71717A', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `€${((v ?? 0) / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1A1A1A',
                border: '1px solid #27272A',
                borderRadius: 8,
              }}
              labelStyle={{ color: '#A1A1AA', fontSize: 12 }}
              formatter={(value: number | undefined) => [`€${(value ?? 0).toLocaleString('en-IE')}`, 'Revenue']}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#FACC15"
              strokeWidth={2}
              fill="url(#revGradient)"
              dot={{ fill: '#FACC15', stroke: '#FACC15', r: 4 }}
              activeDot={{ r: 6, fill: '#FACC15' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

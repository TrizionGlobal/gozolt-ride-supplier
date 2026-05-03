'use client';

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const RIDES_COUNT = 340;
const data = [
  { name: 'Completed', value: RIDES_COUNT },
  { name: 'Remaining', value: 100 },
];

export function RidesTab() {
  return (
    <div className="rounded-lg border border-[#27272A] bg-[#111111] p-6">
      <p className="mb-4 text-sm text-[#A1A1AA]">Total rides completed this month:</p>
      <div className="flex items-center justify-start">
        <div className="relative h-[180px] w-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                startAngle={90}
                endAngle={-270}
                dataKey="value"
                strokeWidth={0}
              >
                <Cell fill="#FACC15" />
                <Cell fill="#27272A" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-white">{RIDES_COUNT}</span>
            <span className="text-xs text-[#A1A1AA]">Rides</span>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import type { PieLabelRenderProps } from 'recharts';
import type { SystemDistSegment } from '@/types';

interface SystemDistributionChartProps {
  data: SystemDistSegment[];
}

const COLORS = ['#FACC15', '#22C55E', '#EF4444', '#3B82F6', '#A855F7', '#F97316'];

function renderLabel(props: PieLabelRenderProps) {
  const { cx, cy, midAngle, outerRadius, index, percent, name } = props;
  const cxNum = Number(cx ?? 0);
  const cyNum = Number(cy ?? 0);
  const RADIAN = Math.PI / 180;
  const radius = Number(outerRadius ?? 90) + 25;
  const x = cxNum + radius * Math.cos(-(midAngle ?? 0) * RADIAN);
  const y = cyNum + radius * Math.sin(-(midAngle ?? 0) * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill={COLORS[(index ?? 0) % COLORS.length]}
      textAnchor={x > cxNum ? 'start' : 'end'}
      dominantBaseline="central"
      fontSize={12}
      fontWeight={500}
    >
      {`${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
    </text>
  );
}

export function SystemDistributionChart({ data }: SystemDistributionChartProps) {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="rounded-lg border border-[#27272A] bg-[#111111] p-4">
      <h3 className="mb-4 font-semibold text-white">Vehicle Types Distribution</h3>
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={90}
              dataKey="value"
              nameKey="name"
              label={renderLabel}
              labelLine={false}
              strokeWidth={0}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            {/* Center text */}
            <text
              x="50%"
              y="45%"
              textAnchor="middle"
              dominantBaseline="central"
              fill="#A1A1AA"
              fontSize={12}
              fontWeight={500}
            >
              Total
            </text>
            <text
              x="50%"
              y="53%"
              textAnchor="middle"
              dominantBaseline="central"
              fill="white"
              fontSize={18}
              fontWeight={700}
            >
              {total}
            </text>
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex h-[260px] items-center justify-center text-sm text-[#71717A]">
          No vehicle data available.
        </div>
      )}
    </div>
  );
}

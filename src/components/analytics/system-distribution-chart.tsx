'use client';

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import type { PieLabelRenderProps } from 'recharts';
import type { SystemDistSegment } from '@/types';

interface SystemDistributionChartProps {
  data: SystemDistSegment[];
}

const COLORS = ['#FACC15', '#22C55E', '#EF4444', '#3B82F6'];

function renderLabel(props: PieLabelRenderProps) {
  const { cx, cy, midAngle, outerRadius, index, percent } = props;
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
      {`System ${((percent ?? 0) * 100).toFixed(0)}%`}
    </text>
  );
}

export function SystemDistributionChart({ data }: SystemDistributionChartProps) {
  return (
    <div className="rounded-lg border border-[#27272A] bg-[#111111] p-4">
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={90}
            dataKey="value"
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
            y="48%"
            textAnchor="middle"
            dominantBaseline="central"
            fill="white"
            fontSize={14}
            fontWeight={700}
          >
            System 100%
          </text>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

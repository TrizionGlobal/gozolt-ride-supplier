'use client';

import { ConfigProvider, theme } from 'antd';
import { ReactNode } from 'react';

export function AntdProvider({ children }: { children: ReactNode }) {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#FACC15', // Matches our Tailwind yellow-400
          colorBgContainer: '#111111', // Matches our dark panel background
          colorBorderSecondary: '#27272A', // Matches our zinc-800 borders
          colorText: '#ffffff',
          colorTextSecondary: '#A1A1AA', // Matches zinc-400
          borderRadius: 8,
          fontFamily: 'inherit', // Uses our custom fonts
        },
        components: {
          Table: {
            headerBg: '#0A0A0A', // Even darker for table headers
            headerColor: '#71717A',
            rowHoverBg: 'rgba(26, 26, 26, 0.3)',
            borderColor: '#27272A',
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}

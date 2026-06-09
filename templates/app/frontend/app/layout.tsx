import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Master App',
  description: 'Built with the Master framework — Next.js + MasterController + MasterRecord.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
          background: '#0b0b12',
          color: '#e8e8f0',
        }}
      >
        {children}
      </body>
    </html>
  );
}

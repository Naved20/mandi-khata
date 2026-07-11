import { Inter } from 'next/font/google';
import './globals.css';

export const metadata = {
  title: '🌾 Mandi Khata - Complete Mandi Management System',
  description: 'Mandi Management System with real-time financial tracking, sales and purchase management, udhar tracking.',
  keywords: ['mandi khata', 'mandi', 'wholesale market', 'agriculture', 'dashboard'],
  icons: {
    icon: '/logo01.png',
  },
  manifest: '/manifest.json',
  themeColor: '#16a34a',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#16a34a" />
      </head>
      <body className="bg-gray-50">
        {children}
      </body>
    </html>
  );
}

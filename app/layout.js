import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Mandi Khata - Complete Mandi Management System',
  description:
    'Complete Mandi Management System with real-time financial tracking, sales and purchase management, udhar tracking, and operational expense monitoring.',
  keywords: [
    'mandi khata',
    'mandi',
    'wholesale market',
    'agriculture',
    'dashboard',
    'financial tracking',
    'udhar management',
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50`}>{children}</body>
    </html>
  );
}

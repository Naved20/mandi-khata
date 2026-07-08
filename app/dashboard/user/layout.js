'use client';

import Sidebar from '@/components/Sidebar';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function UserDashboardLayout({ children }) {
  return (
    <ProtectedRoute>
      <div className="flex">
        <Sidebar />
        <div className="flex-1">
          {children}
        </div>
      </div>
    </ProtectedRoute>
  );
}

import Sidebar from '@/components/Sidebar';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export const metadata = {
  title: 'MandiGrow - Dashboard',
  description: 'Mandi Management Dashboard - Agricultural Wholesale Market',
};

export default function DashboardLayout({ children }) {
  return (
    <ProtectedRoute>
      <Sidebar />
      {children}
    </ProtectedRoute>
  );
}

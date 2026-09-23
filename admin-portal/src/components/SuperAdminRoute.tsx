import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';

export default function SuperAdminRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useAuthStore((state) => state.user);

  if (user?.role !== 'SUPER_ADMIN') {
    return <Navigate to="/users/alumni-students" replace />;
  }

  return <>{children}</>;
}

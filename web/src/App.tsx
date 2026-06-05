import { Navigate, Route, Routes } from 'react-router-dom';
import { useAppSelector } from '@/hooks/useAppSelector';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppLayout } from '@/components/layout/AppLayout';
import DashboardPage from '@/pages/DashboardPage';
import HeadquartersPage from '@/pages/HeadquartersPage';
import LoginPage from '@/pages/LoginPage';
import StudentsPage from '@/pages/StudentsPage';
import UsersPage from '@/pages/UsersPage';

function PublicOnlyRoute() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return <LoginPage />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<PublicOnlyRoute />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="students" element={<StudentsPage />} />
          <Route element={<ProtectedRoute adminOnly />}>
            <Route path="users" element={<UsersPage />} />
            <Route path="headquarters" element={<HeadquartersPage />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

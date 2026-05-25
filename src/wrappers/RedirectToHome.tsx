import { PATHS } from '@/constants';
import { useAuth } from '@/hooks/useAuth';
import { Navigate, Outlet } from '@umijs/max';

export default function RedirectToHome() {
  const { isLogin } = useAuth();

  if (isLogin) {
    return <Navigate to={PATHS.HOME} />;
  } else {
    return <Outlet />;
  }
}

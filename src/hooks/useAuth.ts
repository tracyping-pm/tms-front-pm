import { getTokenKey } from '@/constants';
import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';

export function useAuth() {
  const [isLogin, setIsLogin] = useState(false);

  useEffect(() => {
    // 检查是否存在 token
    const token = Cookies.get(getTokenKey());
    // 更新登录状态
    setIsLogin(!!token);
  }, []);

  return { isLogin };
}

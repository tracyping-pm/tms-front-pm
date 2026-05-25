import { useCallback, useEffect } from 'react';

export const useScrollPenetration = () => {
  const disableScroll = useCallback(() => {
    const scrollTop = window.scrollY;
    document.body.dataset.scrollTop = scrollTop.toString();
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollTop}px`;
    document.body.style.bottom = '0';
  }, []);

  const enableScroll = useCallback(() => {
    const scrollTop = Number(document.body.dataset.scrollTop || 0);
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.bottom = '';
    document.body.scrollTop = scrollTop;
    document.documentElement.scrollTop = scrollTop;
  }, []);

  useEffect(() => {
    return () => {
      enableScroll();
    };
  }, []);

  return {
    disableScroll,
    enableScroll,
  };
};

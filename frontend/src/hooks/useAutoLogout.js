import { useEffect, useRef, useCallback } from 'react';

export function useAutoLogout({ isAuthenticated, onLogout, timeoutMs = 15 * 60 * 1000 }) {
  const lastActive = useRef(0);
  const triggered = useRef(false);

  const check = useCallback(() => {
    if (!triggered.current && lastActive.current && Date.now() - lastActive.current >= timeoutMs) {
      triggered.current = true;
      onLogout?.('inactivity');
    }
  }, [onLogout, timeoutMs]);

  useEffect(() => {
    if (!isAuthenticated) {
      triggered.current = false;
      return;
    }
    lastActive.current = Date.now();
    triggered.current = false;

    const reset = () => { lastActive.current = Date.now(); };
    const evts = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    evts.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    document.addEventListener('visibilitychange', check);
    window.addEventListener('focus', check);
    const timer = setInterval(check, 10000);

    return () => {
      evts.forEach((e) => window.removeEventListener(e, reset));
      document.removeEventListener('visibilitychange', check);
      window.removeEventListener('focus', check);
      clearInterval(timer);
    };
  }, [isAuthenticated, check]);
}

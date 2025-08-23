import { useRef, useCallback } from 'react';

export function useSinglePress(delay = 700) {
  const lockedRef = useRef(false);

  return useCallback(<T extends any[]>(fn: (...args: T) => void) => {
    return (...args: T) => {
      if (lockedRef.current) return;   
      lockedRef.current = true;
      try {
        fn(...args);
      } finally {
        setTimeout(() => { lockedRef.current = false; }, delay);
      }
    };
  }, [delay]);
}

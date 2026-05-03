import { useCallback, useRef } from 'react';

/**
 * Returns a throttled version of the callback that can only be invoked
 * once per `delay` ms. Subsequent calls within the window are ignored.
 */
export function useThrottle<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay = 1000,
): (...args: Parameters<T>) => void {
  const lastCall = useRef(0);

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCall.current >= delay) {
        lastCall.current = now;
        callback(...args);
      }
    },
    [callback, delay],
  );
}

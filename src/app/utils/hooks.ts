/* eslint-disable no-unused-vars */
/* eslint-disable import/prefer-default-export */
import { h } from 'preact';
import { useEffect } from 'preact/hooks';

export const useWindowEvent = <K extends keyof WindowEventMap>
  (event: K, callback: (this: Window, ev: WindowEventMap[K]) => any, enabled: boolean) => {
  useEffect(() => {
    if (enabled) window.addEventListener(event, callback);
    return () => window.removeEventListener(event, callback);
  }, [event, callback, enabled]);
};

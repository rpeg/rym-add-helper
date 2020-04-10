/* eslint-disable no-unused-vars */
/* eslint-disable import/prefer-default-export */
import { h } from 'preact';
import { useEffect } from 'preact/hooks';

export const useWindowEvent = (event, callback, enabled) => {
  useEffect(() => {
    if (enabled) window.addEventListener(event, callback);
    return () => window.removeEventListener(event, callback);
  }, [event, callback, enabled]);
};

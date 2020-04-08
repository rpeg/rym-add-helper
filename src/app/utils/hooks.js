
/* eslint-disable import/prefer-default-export */
import { useEffect } from 'preact';

export const useWindowEvent = (event, callback) => {
  useEffect(() => {
    window.addEventListener(event, callback);
    return () => window.removeEventListener(event, callback);
  }, [event, callback]);
};

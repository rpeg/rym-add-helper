import { h } from 'preact';
import { useEffect } from 'preact/hooks';

export const useDocumentEvent = <K extends keyof DocumentEventMap>
  (event: K, callback: (this: Document, ev: DocumentEventMap[K]) => any, enabled: boolean) => {
  useEffect(() => {
    if (enabled) document.addEventListener(event, callback);
    return () => document.removeEventListener(event, callback);
  }, [event, callback, enabled]);
};

export const useParentDocumentEvent = <K extends keyof DocumentEventMap>
  (event: K, callback: (this: Document, ev: DocumentEventMap[K]) => any, enabled: boolean) => {
  useEffect(() => {
    if (enabled) window.parent.document.addEventListener(event, callback);
    return () => window.parent.document.removeEventListener(event, callback);
  }, [event, callback, enabled]);
};


export const useWindowEvent = <K extends keyof WindowEventMap>
  (event: K, callback: (this: Window, ev: WindowEventMap[K]) => any, enabled: boolean) => {
  useEffect(() => {
    if (enabled) window.addEventListener(event, callback);
    return () => window.removeEventListener(event, callback);
  }, [event, callback, enabled]);
};

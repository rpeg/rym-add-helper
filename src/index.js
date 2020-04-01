/* eslint-disable */
!(() => {
  const global = window.__rym = window.__rym || {};

  if (global.isInit) {
    toggle(global);
  } else {
    console.log('[RYMSelector]: Injected');
    init(global);
    toggle(global);
  }
})();

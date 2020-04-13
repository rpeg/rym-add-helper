import { h, render } from 'preact';
import App from './app/app';

let root = null;

/**
 * Toggle app render on demand
 */
window.addEventListener('message', ({ data }) => {
  if (data.isActive) {
    root = render(<App />, document.body);
  } else {
    render(null, document.body, root);
  }
}, false);

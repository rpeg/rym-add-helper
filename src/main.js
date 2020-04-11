/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-filename-extension */
import { h, render } from 'preact';
import App from './app/app';

let root = null;

window.addEventListener('message', ({ data }) => {
  if (data.isActive) {
    root = render(<App />, document.body);
  } else {
    render(null, document.body, root);
  }
}, false);

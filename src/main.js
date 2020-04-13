import { h, render } from 'preact';
import $ from 'jquery';
import App from './app/app';

let root = null;

window.addEventListener('message', ({ data }) => {
  console.log(data);

  $(document).ready(() => {
    if (data.isActive) {
      root = render(<App />, document.body);
    } else {
      render(null, document.body, root);
    }
  });
}, false);

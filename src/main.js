/* eslint-disable react/prop-types */
/* eslint-disable react/destructuring-assignment */
import { h, render, Component } from 'preact';
import App from './app/app';

let root = null;

class Frame extends Component {
  componentDidMount() {
    render(<body>{this.props.children}</body>,
      this.iframe.contentDocument.documentElement,
      this.iframe.contentDocument.body);
  }

  render() {
    return (
      <iframe
        id="rym__frame"
        title="rym__"
        style={{
          zIndex: 10000,
          position: 'fixed',
          height: '100vh',
          top: 0,
          right: 0,
          width: '250px',
          overflowY: 'scroll',
          backgroundColor: 'white',
        }}
        ref={(node) => {
          (this.iframe = node);
        }}
      />
    );
  }
}

/**
 * Toggle app render on demand
 */
window.addEventListener('message', ({ data }) => {
  if (data.isActive) {
    root = render(<Frame><App /></Frame>, document.body);
  } else {
    render(null, document.body, root);
  }
}, false);

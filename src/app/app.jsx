/* eslint-disable react/prop-types */
import { h, render, Component } from 'preact';
import $ from 'jquery';
import Helper from './Helper';

let root = null;

class Frame extends Component {
  componentDidMount() {
    const { children } = this.props;
    render(<body>{children}</body>,
      this.iframe.contentDocument.documentElement,
      this.iframe.contentDocument.body);
  }

  render() {
    return (
      <iframe
        id="rym__frame"
        title="rym__"
        style={{
          zIndex: 999999,
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
  if (data.type !== 'toggle') return;

  if (data.isActive) {
    root = render(<Frame><Helper storedTemplate={data.storedTemplate} /></Frame>, document.body);
    console.log('rendered');
  } else {
    $('a').off('click');
    render(null, document.body, root);
  }
}, false);

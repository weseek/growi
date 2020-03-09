import React from 'react';
import PropTypes from 'prop-types';
import i18next from 'i18next';

export default class DrawioIFrame extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      shown: false,
      drawioMxFile: '',
      style: {
        zIndex: 9999,
        top: 0,
        left: 0,
        bottom: 0,
      },
    };

    this.drawioIFrame = React.createRef();

    this.headerColor = '#334455';
    this.fontFamily = "Lato, -apple-system, BlinkMacSystemFont, 'Hiragino Kaku Gothic ProN', Meiryo, sans-serif";

    this.init = this.init.bind(this);
    this.cancel = this.cancel.bind(this);
    this.receiveFromDrawio = this.receiveFromDrawio.bind(this);
    this.onResizeWindow = this.onResizeWindow.bind(this);
    this.drawioURL = this.drawioURL.bind(this);
  }

  init(drawioMxFile) {
    const initDrawioMxFile = drawioMxFile;
    this.setState(
      {
        drawioMxFile: initDrawioMxFile,
      },
    );
  }

  show(drawioMxFile) {
    this.init(drawioMxFile);

    this.setState({
      style: Object.assign({}, this.state.style, {
        width: window.innerWidth,
        height: window.innerHeight,
      }),
    });

    window.addEventListener('resize', this.onResizeWindow);
    window.addEventListener('message', this.receiveFromDrawio);
    this.setState({ shown: true });
  }

  hide() {
    this.setState({
      shown: false,
    });
  }

  cancel() {
    this.hide();
  }

  receiveFromDrawio(event) {
    if (event.data === 'ready') {
      event.source.postMessage(this.state.drawioMxFile, '*');
      return;
    }

    if (event.data === '{"event":"configure"}') {
      if (event.source == null) {
        return;
      }

      // refs:
      //  * https://desk.draw.io/support/solutions/articles/16000103852-how-to-customise-the-draw-io-interface
      //  * https://desk.draw.io/support/solutions/articles/16000042544-how-does-embed-mode-work-
      //  * https://desk.draw.io/support/solutions/articles/16000058316-how-to-configure-draw-io-
      event.source.postMessage(JSON.stringify({
        action: 'configure',
        config: {
          css: `
          .geMenubarContainer { background-color: ${this.headerColor} !important; }
          .geMenubar { background-color: ${this.headerColor} !important; }
          .geEditor { font-family: ${this.fontFamily} !important; }
          html td.mxPopupMenuItem {
            font-family: ${this.fontFamily} !important;
            font-size: 8pt !important;
          }
          `,
          customFonts: ['Lato', 'Charter'],
        },
      }), '*');

      return;
    }

    if (typeof event.data === 'string' && event.data.match(/mxfile/)) {
      if (event.data.length > 0) {
        const parser = new DOMParser();
        const dom = parser.parseFromString(event.data, 'text/xml');
        const value = dom.getElementsByTagName('diagram')[0].innerHTML;
        this.props.onSave(value);
      }

      window.removeEventListener('resize', this.onResizeWindow);
      window.removeEventListener('message', this.receiveFromDrawio);
      this.hide();

      return;
    }

    if (typeof event.data === 'string' && event.data.length === 0) {
      window.removeEventListener('resize', this.onResizeWindow);
      window.removeEventListener('message', this.receiveFromDrawio);
      this.hide();

      return;
    }

    // NOTHING DONE. (Receive unknown iframe message.)
  }

  onResizeWindow(event) {
    this.setState({
      style: Object.assign({}, this.state.style, {
        width: window.innerWidth,
        height: window.innerHeight,
      }),
    });
  }

  drawioURL() {
    const url = new URL('https://www.draw.io/');

    // refs: https://desk.draw.io/support/solutions/articles/16000042546-what-url-parameters-are-supported-
    url.searchParams.append('spin', 1);
    url.searchParams.append('embed', 1);
    url.searchParams.append('lang', i18next.language);
    url.searchParams.append('ui', 'atlas');
    url.searchParams.append('configure', 1);

    return url;
  }

  render() {
    return (
      <div>
        {
          this.state.shown
          && (
            <iframe
              ref={(c) => { this.drawioIFrame = c }}
              src={this.drawioURL()}
              className="position-fixed"
              style={this.state.style}
            >
            </iframe>
          )
        }
      </div>
    );
  }

}

DrawioIFrame.propTypes = {
  onSave: PropTypes.func,
};

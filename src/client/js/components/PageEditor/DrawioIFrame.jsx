import React from 'react';
import PropTypes from 'prop-types';

export default class DrawioIFrame extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      shown: false,
      drawioMxFile: '',
      style: {
        position: 'fixed',
        zIndex: 9999,
        top: 0,
        left: 0,
        bottom: 0,
      },
    };

    this.drawioIFrame = React.createRef();

    this.init = this.init.bind(this);
    this.cancel = this.cancel.bind(this);
    this.receiveFromDrawio = this.receiveFromDrawio.bind(this);
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
    const navHeaderHeight = Math.floor(document.querySelector('.navbar-header').getBoundingClientRect().height);

    this.setState({
      style: Object.assign({}, this.state.style, {
        top: `${navHeaderHeight}px`,
        width: document.body.clientWidth,
        height: document.body.clientHeight - navHeaderHeight,
      }),
    });

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
    }
    else {
      if (event.data.length > 0) {
        const parser = new DOMParser();
        const dom = parser.parseFromString(event.data, 'text/xml');
        const value = dom.getElementsByTagName('diagram')[0].innerHTML;
        this.props.onSave(value);
      }

      window.removeEventListener('message', this.receiveFromDrawio);
      this.hide();
    }
  }

  render() {
    return (
      <div>
        {
          this.state.shown
          && <iframe ref={(c) => { this.drawioIFrame = c }} src="https://www.draw.io/?embed=1" style={this.state.style}></iframe>
        }
      </div>
    );
  }

}

DrawioIFrame.propTypes = {
  onSave: PropTypes.func,
};

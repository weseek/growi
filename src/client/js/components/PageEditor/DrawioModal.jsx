import React from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-bootstrap/es/Modal';
import Button from 'react-bootstrap/es/Button';

export default class DrawioModal extends React.PureComponent {

  constructor(props) {
    super(props);

    /*
     * ## Note ##
     * Currently, this component try to synchronize the cells data and alignment data of state.markdownTable with these of the HotTable.
     * However, changes made by the following operations are not synchronized.
     *
     * 1. move columns: Alignment changes are synchronized but data changes are not.
     * 2. move rows: Data changes are not synchronized.
     * 3. insert columns or rows: Data changes are synchronized but alignment changes are not.
     * 4. delete columns or rows: Data changes are synchronized but alignment changes are not.
     *
     * However, all operations are reflected in the data to be saved because the HotTable data is used when the save method is called.
     */
    this.state = {
      show: false,
      drawioMxFileOnInit: '',
      drawioMxFile: '',
      drawioIFrame: null,
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

    const iframe = document.createElement('iframe');
    iframe.src = 'https://www.draw.io/?embed=1&lang=ja&title=FUGA&diagramName=HOGE';
    iframe.style = 'position: absolute; z-index: 9999; top: 0; left: 0;';
    iframe.width = document.body.clientWidth;
    iframe.height = document.body.clientHeight;

    window.addEventListener('message', this.receiveFromDrawio);
    this.setState({ show: true });

    this.setState(
      {
        drawioIFrame: iframe,
      },
    );

    document.body.appendChild(iframe);
  }

  hide() {
    this.setState({
      show: false,
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
        console.log(value);
        this.props.onSave(value);
      }

      // window.removeEventListener('resize', resize);
      window.removeEventListener('message', this.receiveFromDrawio);
      document.body.removeChild(this.state.drawioIFrame);
    }
  }

  render() {
    const dialogClassNames = ['handsontable-modal'];
    if (this.state.isWindowExpanded) {
      dialogClassNames.push('handsontable-modal-expanded');
    }

    return (
      <div />
    );
  }

}

DrawioModal.propTypes = {
  onSave: PropTypes.func,
};

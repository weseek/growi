import React from 'react';
import PropTypes from 'prop-types';

export default class Drawio extends React.Component {

  constructor(props) {
    super(props);

    this.drawioContainer = React.createRef();
    const DrawioViewer = window.GraphViewer;
    if (DrawioViewer != null) {
      // viewer.min.js の Resize による Scroll イベントを抑止するために無効化する
      DrawioViewer.useResizeSensor = false;
    }
  }

  componentDidMount() {
    const DrawioViewer = window.GraphViewer;
    if (DrawioViewer != null) {
      DrawioViewer.processElements();
    }
  }

  renderContents() {
    return this.props.drawioContent;
  }

  render() {
    return (
      <div
        className="drawio"
        ref={(c) => { this.drawioContainer = c }}
        onScroll={(event) => {
          event.preventDefault();
        }}
        dangerouslySetInnerHTML={{ __html: this.renderContents() }}
      >
      </div>
    );
  }

}

Drawio.propTypes = {
  appContainer: PropTypes.object.isRequired,
  drawioContent: PropTypes.any,
  isPreview: PropTypes.bool,
};

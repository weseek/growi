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

    this.style = {
      borderRadius: 3,
      border: '1px solid #d7d7d7',
      margin: '20px 0',
    };

    this.onEdit = this.onEdit.bind(this);
  }

  onEdit() {
    if (window.crowi != null) {
      window.crowi.launchDrawioIFrame('page',
        this.props.rangeLineNumberOfMarkdown.beginLineNumber,
        this.props.rangeLineNumberOfMarkdown.endLineNumber);
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
      <div className="editable-with-drawio">
        <button type="button" className="drawio-iframe-trigger btn" onClick={this.onEdit}>
          <i className="icon-note"></i> Edit
        </button>
        <div
          className="drawio"
          style={this.style}
          ref={(c) => { this.drawioContainer = c }}
          onScroll={(event) => {
            event.preventDefault();
          }}
          dangerouslySetInnerHTML={{ __html: this.renderContents() }}
        >
        </div>
      </div>
    );
  }

}

Drawio.propTypes = {
  appContainer: PropTypes.object.isRequired,
  drawioContent: PropTypes.any.isRequired,
  isPreview: PropTypes.bool,
  rangeLineNumberOfMarkdown: PropTypes.object.isRequired,
};

import React from 'react';
import PropTypes from 'prop-types';

export default class HackmdEditor extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = {
    };

    this.listenMessages = this.listenMessages.bind(this);
    this.notifyBodyChangesHandler = this.notifyBodyChangesHandler.bind(this);

    this.loadHandler = this.loadHandler.bind(this);
  }

  componentDidMount() {
    const contentWindow = this.refs.iframe.contentWindow;
    this.listenMessages(contentWindow);
  }

  /**
   *
   * @param {object} targetWindow
   */
  listenMessages(targetWindow) {
    window.addEventListener('message', (e) => {
      if (targetWindow !== e.source) {
        return;
      }

      const data = JSON.parse(e.data);
      const operation = data.operation;
      const body = data.body;

      if (operation === 'notifyBodyChanges') {
        this.notifyBodyChangesHandler(body);
      }
    });
  }

  notifyBodyChangesHandler(body) {
    // dispatch onChange()
    if (this.props.onChange != null) {
      this.props.onChange(body);
    }
  }

  loadHandler() {
    // this.refs.iframe.postMessage('initialize', )
  }

  render() {
    const src = `${this.props.hackmdUri}/${this.props.pageIdOnHackmd}?both`;
    return (
      <iframe id='iframe-hackmd'
        ref='iframe'
        src={src}
        onLoad={this.loadHandler}
      >
      </iframe>
    );
  }
}

HackmdEditor.propTypes = {
  markdown: PropTypes.string.isRequired,
  hackmdUri: PropTypes.string.isRequired,
  pageIdOnHackmd: PropTypes.string.isRequired,
  onChange: PropTypes.func,
};

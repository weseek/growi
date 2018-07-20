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
    this.saveHandler = this.saveHandler.bind(this);
  }

  componentDidMount() {
    const contentWindow = this.refs.iframe.contentWindow;
    this.listenMessages(contentWindow);
  }

  setValue(newValue) {
    const data = { operation: 'setValue' };
    if (newValue != null) {
      data.document = newValue;
    }
    this.postMessageToHackmd(data);
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

      switch (operation) {
        case 'notifyBodyChanges':
          this.notifyBodyChangesHandler(body);
          break;
        case 'save':
          this.saveHandler(body);
          break;
      }
    });
  }

  /**
   *
   * @param {object} data
   */
  postMessageToHackmd(data) {
    this.refs.iframe.contentWindow.postMessage(JSON.stringify(data), this.props.hackmdUri);
  }

  notifyBodyChangesHandler(body) {
    // dispatch onChange()
    if (this.props.onChange != null) {
      this.props.onChange(body);
    }
  }

  loadHandler() {
    this.setValue(this.props.initializationMarkdown);
  }

  saveHandler(document) {
    if (this.props.onSaveWithShortcut != null) {
      this.props.onSaveWithShortcut(document);
    }
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
  hackmdUri: PropTypes.string.isRequired,
  pageIdOnHackmd: PropTypes.string.isRequired,
  initializationMarkdown: PropTypes.string,
  onChange: PropTypes.func,
  onSaveWithShortcut: PropTypes.func,
};

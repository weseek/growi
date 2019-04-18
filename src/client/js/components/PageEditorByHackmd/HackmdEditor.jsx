import React from 'react';
import PropTypes from 'prop-types';

import connectToChild from 'penpal/lib/connectToChild';

const DEBUG_PENPAL = false;

export default class HackmdEditor extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = {
    };

    this.hackmd = null;

    this.initHackmdWithPenpal = this.initHackmdWithPenpal.bind(this);

    this.notifyBodyChangesHandler = this.notifyBodyChangesHandler.bind(this);
    this.saveWithShortcutHandler = this.saveWithShortcutHandler.bind(this);
  }

  componentDidMount() {
    // append iframe with penpal
    this.initHackmdWithPenpal();
  }

  initHackmdWithPenpal() {
    const _this = this; // for in methods scope

    const iframe = document.createElement('iframe');
    iframe.src = `${this.props.hackmdUri}/${this.props.pageIdOnHackmd}?both`;
    this.iframeContainer.appendChild(iframe);

    const connection = connectToChild({
      iframe,
      methods: { // expose methods to HackMD
        notifyBodyChanges(document) {
          _this.notifyBodyChangesHandler(document);
        },
        saveWithShortcut(document) {
          _this.saveWithShortcutHandler(document);
        },
      },
      debug: DEBUG_PENPAL,
    });
    connection.promise.then((child) => {
      this.hackmd = child;
      if (this.props.initializationMarkdown != null) {
        child.setValueOnInit(this.props.initializationMarkdown);
      }
    });
  }

  /**
   * return markdown document of HackMD
   * @return {Promise<string>}
   */
  getValue() {
    return this.hackmd.getValue();
  }

  setValue(newValue) {
    this.hackmd.setValue(newValue);
  }

  notifyBodyChangesHandler(body) {
    // dispatch onChange() when there is difference from 'initializationMarkdown' props
    if (this.props.onChange != null && body !== this.props.initializationMarkdown) {
      this.props.onChange(body);
    }
  }

  saveWithShortcutHandler(document) {
    if (this.props.onSaveWithShortcut != null) {
      this.props.onSaveWithShortcut(document);
    }
  }

  render() {
    return (
      // will be rendered in componentDidMount
      <div id="iframe-hackmd-container" ref={(c) => { this.iframeContainer = c }}></div>
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

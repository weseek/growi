import React from 'react';
import PropTypes from 'prop-types';
import loggerFactory from '@alias/logger';

import connectToChild from 'penpal/lib/connectToChild';

const DEBUG_PENPAL = false;

const logger = loggerFactory('growi:HackmdEditor');

export default class HackmdEditor extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      hasPenpalError: true,
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

  async initHackmdWithPenpal() {
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
      timeout: 15000,
      debug: DEBUG_PENPAL,
    });

    try {
      const child = await connection.promise;
      this.hackmd = child;
      if (this.props.initializationMarkdown != null) {
        child.setValueOnInit(this.props.initializationMarkdown);
      }
    }
    catch (err) {
      logger.error(err);
      this.setState({ hasPenpalError: true });
    }
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
      <div className="position-relative">
        {/* will be rendered in componentDidMount */}
        <div id="iframe-hackmd-container" ref={(c) => { this.iframeContainer = c }}></div>

        { this.state.hasPenpalError && (
          <div className="hackmd-error position-absolute d-flex flex-column justify-content-center align-items-center">
            <div className="white-box text-center">
              <h2 className="text-warning"><i className="icon-fw icon-exclamation"></i> HackMD Integration failed</h2>
              <p>
                GROWI system could not connect to GROWI agent for HackMD.<br />
                Check your configuration following <a href="https://docs.growi.org/guide/admin-cookbook/integrate-with-hackmd.html">the manual</a>.
              </p>
            </div>
          </div>
        ) }
      </div>
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

import React from 'react';
import PropTypes from 'prop-types';

import { Subscribe } from 'unstated';

import Modal from 'react-bootstrap/es/Modal';
import Dropzone from 'react-dropzone';

import EditorContainer from '../../services/EditorContainer';

import Cheatsheet from './Cheatsheet';
import AbstractEditor from './AbstractEditor';
import CodeMirrorEditor from './CodeMirrorEditor';
import TextAreaEditor from './TextAreaEditor';

import pasteHelper from './PasteHelper';

export default class Editor extends AbstractEditor {

  constructor(props) {
    super(props);

    this.state = {
      isComponentDidMount: false,
      dropzoneActive: false,
      isUploading: false,
      isCheatsheetModalShown: false,
    };

    this.getEditorSubstance = this.getEditorSubstance.bind(this);

    this.pasteFilesHandler = this.pasteFilesHandler.bind(this);

    this.dragEnterHandler = this.dragEnterHandler.bind(this);
    this.dragLeaveHandler = this.dragLeaveHandler.bind(this);
    this.dropHandler = this.dropHandler.bind(this);

    this.showMarkdownHelp = this.showMarkdownHelp.bind(this);

    this.getAcceptableType = this.getAcceptableType.bind(this);
    this.getDropzoneClassName = this.getDropzoneClassName.bind(this);
    this.renderDropzoneOverlay = this.renderDropzoneOverlay.bind(this);
  }

  componentDidMount() {
    this.setState({ isComponentDidMount: true });
  }

  getEditorSubstance() {
    return this.props.isMobile
      ? this.taEditor
      : this.cmEditor;
  }

  /**
   * @inheritDoc
   */
  forceToFocus() {
    this.getEditorSubstance().forceToFocus();
  }

  /**
   * @inheritDoc
   */
  setValue(newValue) {
    this.getEditorSubstance().setValue(newValue);
  }

  /**
   * @inheritDoc
   */
  setGfmMode(bool) {
    this.getEditorSubstance().setGfmMode(bool);
  }

  /**
   * @inheritDoc
   */
  setCaretLine(line) {
    this.getEditorSubstance().setCaretLine(line);
  }

  /**
   * @inheritDoc
   */
  setScrollTopByLine(line) {
    this.getEditorSubstance().setScrollTopByLine(line);
  }

  /**
   * @inheritDoc
   */
  insertText(text) {
    this.getEditorSubstance().insertText(text);
  }

  /**
   * remove overlay and set isUploading to false
   */
  terminateUploadingState() {
    this.setState({
      dropzoneActive: false,
      isUploading: false,
    });
  }

  /**
   * dispatch onUpload event
   */
  dispatchUpload(files) {
    if (this.props.onUpload != null) {
      this.props.onUpload(files);
    }
  }

  /**
   * get acceptable(uploadable) file type
   */
  getAcceptableType() {
    let accept = 'null'; // reject all
    if (this.props.isUploadable) {
      if (!this.props.isUploadableFile) {
        accept = 'image/*'; // image only
      }
      else {
        accept = ''; // allow all
      }
    }

    return accept;
  }

  pasteFilesHandler(event) {
    const items = event.clipboardData.items || event.clipboardData.files || [];

    // abort if length is not 1
    if (items.length < 1) {
      return;
    }

    for (let i = 0; i < items.length; i++) {
      try {
        const file = items[i].getAsFile();
        // check file type (the same process as Dropzone)
        if (file != null && pasteHelper.isAcceptableType(file, this.getAcceptableType())) {
          this.dispatchUpload(file);
          this.setState({ isUploading: true });
        }
      }
      catch (e) {
        this.logger.error(e);
      }
    }
  }

  dragEnterHandler(event) {
    const dataTransfer = event.dataTransfer;

    // do nothing if contents is not files
    if (!dataTransfer.types.includes('Files')) {
      return;
    }

    this.setState({ dropzoneActive: true });
  }

  dragLeaveHandler() {
    this.setState({ dropzoneActive: false });
  }

  dropHandler(accepted, rejected) {
    // rejected
    if (accepted.length !== 1) { // length should be 0 or 1 because `multiple={false}` is set
      this.setState({ dropzoneActive: false });
      return;
    }

    const file = accepted[0];
    this.dispatchUpload(file);
    this.setState({ isUploading: true });
  }

  showMarkdownHelp() {
    this.setState({ isCheatsheetModalShown: true });
  }

  getDropzoneClassName(isDragAccept, isDragReject) {
    let className = 'dropzone';
    if (!this.props.isUploadable) {
      className += ' dropzone-unuploadable';
    }
    else {
      className += ' dropzone-uploadable';

      if (this.props.isUploadableFile) {
        className += ' dropzone-uploadablefile';
      }
    }

    // uploading
    if (this.state.isUploading) {
      className += ' dropzone-uploading';
    }

    if (isDragAccept) {
      className += ' dropzone-accepted';
    }

    if (isDragReject) {
      className += ' dropzone-rejected';
    }

    return className;
  }

  renderDropzoneOverlay() {
    return (
      <div className="overlay overlay-dropzone-active">
        {this.state.isUploading
          && (
          <span className="overlay-content">
            <div className="speeding-wheel d-inline-block"></div>
            <span className="sr-only">Uploading...</span>
          </span>
          )
        }
        {!this.state.isUploading && <span className="overlay-content"></span>}
      </div>
    );
  }

  renderNavbar() {
    return (
      <div className="m-0 navbar navbar-default navbar-editor" style={{ minHeight: 'unset' }}>
        <ul className="pl-2 nav nav-navbar">
          { this.getNavbarItems() != null && this.getNavbarItems().map((item, idx) => {
            // eslint-disable-next-line react/no-array-index-key
            return <li key={`navbarItem-${idx}`}>{item}</li>;
          }) }
        </ul>
      </div>
    );
  }

  getNavbarItems() {
    // set navbar items(react elements) here that are common in CodeMirrorEditor or TextAreaEditor
    const navbarItems = [];

    // concat common items and items specific to CodeMirrorEditor or TextAreaEditor
    return navbarItems.concat(this.getEditorSubstance().getNavbarItems());
  }

  renderCheatsheetModal() {
    const hideCheatsheetModal = () => {
      this.setState({ isCheatsheetModalShown: false });
    };

    return (
      <Modal className="modal-gfm-cheatsheet" show={this.state.isCheatsheetModalShown} onHide={() => { hideCheatsheetModal() }}>
        <Modal.Header closeButton>
          <Modal.Title><i className="icon-fw icon-question" />Markdown Help</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-1">
          <Cheatsheet />
        </Modal.Body>
      </Modal>
    );
  }

  render() {
    const flexContainer = {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    };

    const isMobile = this.props.isMobile;

    return (
      <div style={flexContainer} className="editor-container">
        <Dropzone
          ref={(c) => { this.dropzone = c }}
          accept={this.getAcceptableType()}
          noClick
          noKeyboard
          multiple={false}
          onDragLeave={this.dragLeaveHandler}
          onDrop={this.dropHandler}
        >
          {({
            getRootProps,
            getInputProps,
            isDragAccept,
            isDragReject,
          }) => {
            return (
              <div className={this.getDropzoneClassName(isDragAccept, isDragReject)} {...getRootProps()}>
                { this.state.dropzoneActive && this.renderDropzoneOverlay() }

                { this.state.isComponentDidMount && this.renderNavbar() }

                {/* for PC */}
                { !isMobile && (
                  <Subscribe to={[EditorContainer]}>
                    { editorContainer => (
                      // eslint-disable-next-line arrow-body-style
                      <CodeMirrorEditor
                        ref={(c) => { this.cmEditor = c }}
                        editorOptions={editorContainer.state.editorOptions}
                        onPasteFiles={this.pasteFilesHandler}
                        onDragEnter={this.dragEnterHandler}
                        onMarkdownHelpButtonClicked={this.showMarkdownHelp}
                        {...this.props}
                      />
                    )}
                  </Subscribe>
                )}

                {/* for mobile */}
                { isMobile && (
                  <TextAreaEditor
                    ref={(c) => { this.taEditor = c }}
                    onPasteFiles={this.pasteFilesHandler}
                    onDragEnter={this.dragEnterHandler}
                    {...this.props}
                  />
                )}

                <input {...getInputProps()} />
              </div>
            );
          }}
        </Dropzone>

        { this.props.isUploadable
          && (
          <button
            type="button"
            className="btn btn-default btn-block btn-open-dropzone"
            onClick={() => { this.dropzone.open() }}
          >

            <i className="icon-paper-clip" aria-hidden="true"></i>&nbsp;
            Attach files
            <span className="d-none d-sm-block">
              &nbsp;by dragging &amp; dropping,&nbsp;
              <span className="btn-link">selecting them</span>,&nbsp;
              or pasting from the clipboard.
            </span>
          </button>
          )
        }

        { this.renderCheatsheetModal() }

      </div>
    );
  }

}

Editor.propTypes = Object.assign({
  noCdn: PropTypes.bool,
  isMobile: PropTypes.bool,
  isUploadable: PropTypes.bool,
  isUploadableFile: PropTypes.bool,
  emojiStrategy: PropTypes.object,
  onChange: PropTypes.func,
  onUpload: PropTypes.func,
}, AbstractEditor.propTypes);

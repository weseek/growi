import React from 'react';
import PropTypes from 'prop-types';

import path from 'path';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from 'reactstrap';
import Preview from './Preview';
import PagePathAutoComplete from '../PagePathAutoComplete';

import AppContainer from '../../services/AppContainer';
import PageContainer from '../../services/PageContainer';

import { withUnstatedContainers } from '../UnstatedUtils';

class LinkEditModal extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      show: false,
      isUseRelativePath: false,
      isUsePermanentLink: false,
      linkInputValue: '/',
      labelInputValue: '',
      linkerType: 'mdLink',
      markdown: '',
    };

    this.isApplyPukiwikiLikeLinkerPlugin = window.growiRenderer.preProcessors.some(process => process.constructor.name === 'PukiwikiLikeLinker');

    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
    this.cancel = this.cancel.bind(this);
    this.inputChangeHandler = this.inputChangeHandler.bind(this);
    this.submitHandler = this.submitHandler.bind(this);
    this.handleChangeLabelInput = this.handleChangeLabelInput.bind(this);
    this.handleSelecteLinkerType = this.handleSelecteLinkerType.bind(this);
    this.toggleIsUseRelativePath = this.toggleIsUseRelativePath.bind(this);
    this.setMarkdown = this.setMarkdown.bind(this);
    this.toggleIsUsePamanentLink = this.toggleIsUsePamanentLink.bind(this);
    this.save = this.save.bind(this);
    this.generateLink = this.generateLink.bind(this);
  }

  componentDidUpdate(prevState) {
    const { linkInputValue: prevLinkInputValue } = prevState;
    const { linkInputValue } = this.state;
    if (linkInputValue !== prevLinkInputValue) {
      this.setMarkdown(linkInputValue);
    }
  }

  show(defaultLabelInputValue = '') {
    this.setState({ show: true, labelInputValue: defaultLabelInputValue });
  }

  cancel() {
    this.hide();
  }

  hide() {
    this.setState({
      show: false,
    });
  }

  toggleIsUseRelativePath() {
    if (this.state.linkerType === 'growiLink') {
      return;
    }
    this.setState({ isUseRelativePath: !this.state.isUseRelativePath });
  }

  toggleIsUsePamanentLink() {
    this.setState({ isUsePermanentLink: !this.state.isUsePermanentLink });
  }

  renderPreview() {
    return (
      <div className="linkedit-preview">
        <Preview
          markdown={this.state.markdown}
        />
      </div>
    );
  }

  insertLinkIntoEditor() {
    // TODO GW-2659
  }

  async setMarkdown(path) {
    let markdown = '';
    try {
      await this.props.appContainer.apiGet('/pages.get', { path }).then((res) => {
        markdown = res.page.revision.body;
      });
    }
    catch (err) {
      markdown = `<div class="alert alert-warning" role="alert"><strong>${err.message}</strong></div>`;
    }
    this.setState({ markdown });
  }

  handleChangeLabelInput(label) {
    this.setState({ labelInputValue: label });
  }

  handleSelecteLinkerType(linkerType) {
    if (this.state.isUseRelativePath && linkerType === 'growiLink') {
      this.toggleIsUseRelativePath();
    }
    this.setState({ linkerType });
  }

  save() {
    const output = this.generateLink();

    if (this.props.onSave != null) {
      this.props.onSave(output);
    }

    this.hide();
  }

  inputChangeHandler(inputChangeValue) {
    this.setState({ linkInputValue: inputChangeValue });
  }

  submitHandler(submitValue) {
    this.setState({ linkInputValue: submitValue });
  }

  generateLink() {
    const { pageContainer } = this.props;
    const {
      linkInputValue,
      labelInputValue,
      linkerType,
      isUseRelativePath,
    } = this.state;

    let reshapedLink = linkInputValue;

    if (isUseRelativePath && linkInputValue.match(/^\//)) {
      reshapedLink = path.relative(pageContainer.state.path, linkInputValue);
    }

    if (linkerType === 'pukiwikiLink') {
      return `[[${labelInputValue}>${reshapedLink}]]`;
    }
    if (linkerType === 'growiLink') {
      return `[${reshapedLink}]`;
    }
    if (linkerType === 'mdLink') {
      return `[${labelInputValue}](${reshapedLink})`;
    }
  }

  render() {
    return (
      <Modal isOpen={this.state.show} toggle={this.cancel} size="lg">
        <ModalHeader tag="h4" toggle={this.cancel} className="bg-primary text-light">
          Edit Links
        </ModalHeader>

        <ModalBody className="container">
          <div className="row">
            <div className="col">
              <form className="form-group">
                <div className="form-gorup my-3">
                  <label htmlFor="linkInput">Link</label>
                  <div className="input-group">
                    <PagePathAutoComplete
                      onInputChange={this.inputChangeHandler}
                      onSubmit={this.submitHandler}
                    />
                  </div>
                </div>
                <div className="form-inline">
                  <div className="custom-control custom-checkbox custom-checkbox-info">
                    <input
                      className="custom-control-input"
                      id="permanentLink"
                      type="checkbox"
                      checked={this.state.isUsePamanentLink}
                    />
                    <label className="custom-control-label" htmlFor="permanentLink" onClick={this.toggleIsUsePamanentLink}>
                      Use permanent link
                    </label>
                  </div>
                </div>
              </form>

              <div className="d-block d-lg-none mb-3 overflow-auto">
                {this.renderPreview()}
              </div>

              <div className="card">
                <div className="card-body">
                  <form className="form-group">
                    <div className="form-group btn-group d-flex" role="group" aria-label="type">
                      <button
                        type="button"
                        name="mdLink"
                        className={`btn btn-outline-secondary w-100 ${this.state.linkerType === 'mdLink' && 'active'}`}
                        onClick={e => this.handleSelecteLinkerType(e.target.name)}
                      >
                        Markdown
                      </button>
                      <button
                        type="button"
                        name="growiLink"
                        className={`btn btn-outline-secondary w-100 ${this.state.linkerType === 'growiLink' && 'active'}`}
                        onClick={e => this.handleSelecteLinkerType(e.target.name)}
                      >
                        Growi Original
                      </button>
                      {this.isApplyPukiwikiLikeLinkerPlugin && (
                        <button
                          type="button"
                          name="pukiwikiLink"
                          className={`btn btn-outline-secondary w-100 ${this.state.linkerType === 'pukiwikiLink' && 'active'}`}
                          onClick={e => this.handleSelecteLinkerType(e.target.name)}
                        >
                          Pukiwiki
                        </button>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="label">Label</label>
                      <input
                        type="text"
                        className="form-control"
                        id="label"
                        value={this.state.labelInputValue}
                        onChange={e => this.handleChangeLabelInput(e.target.value)}
                        disabled={this.state.linkerType === 'growiLink'}
                      />
                    </div>
                    <div className="form-inline">
                      <div className="custom-control custom-checkbox custom-checkbox-info">
                        <input
                          className="custom-control-input"
                          id="relativePath"
                          type="checkbox"
                          checked={this.state.isUseRelativePath}
                          disabled={this.state.linkerType === 'growiLink'}
                        />
                        <label className="custom-control-label" htmlFor="relativePath" onClick={this.toggleIsUseRelativePath}>
                          Use relative path
                        </label>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            <div className="col d-none d-lg-block pr-0 mr-3 overflow-auto">
              {this.renderPreview()}
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={this.hide}>
            Cancel
          </button>
          <button type="submit" className="btn btn-sm btn-primary" onClick={this.save}>
            Done
          </button>
        </ModalFooter>
      </Modal>
    );
  }

}

LinkEditModal.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
  onSave: PropTypes.func,
};

/**
 * Wrapper component for using unstated
 */
const LinkEditModalWrapper = withUnstatedContainers(LinkEditModal, [AppContainer, PageContainer]);

export default LinkEditModalWrapper;

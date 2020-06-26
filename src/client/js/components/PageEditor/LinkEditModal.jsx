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

import AppContainer from '../../services/AppContainer';
import PageContainer from '../../services/PageContainer';

import SearchTypeahead from '../SearchTypeahead';

import { withUnstatedContainers } from '../UnstatedUtils';

class LinkEditModal extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      show: false,
      isUseRelativePath: false,
      isUsePermanentLink: false,
      linkInputValue: 'ss',
      labelInputValue: '',
      linkerType: 'mdLink',
      markdown: '',
      permalink: '',
      isEnablePermanentLink: false,
    };

    this.isApplyPukiwikiLikeLinkerPlugin = window.growiRenderer.preProcessors.some(process => process.constructor.name === 'PukiwikiLikeLinker');

    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
    this.cancel = this.cancel.bind(this);
    this.parseMakdownLink = this.parseMakdownLink.bind(this);
    this.handleChangeLinkInput = this.handleChangeLinkInput.bind(this);
    this.handleChangeLabelInput = this.handleChangeLabelInput.bind(this);
    this.handleChangeTypeahead = this.handleChangeTypeahead.bind(this);
    this.handleSelecteLinkerType = this.handleSelecteLinkerType.bind(this);
    this.toggleIsUseRelativePath = this.toggleIsUseRelativePath.bind(this);
    this.toggleIsUsePamanentLink = this.toggleIsUsePamanentLink.bind(this);
    this.save = this.save.bind(this);
    this.generateLink = this.generateLink.bind(this);
    this.getPageWithLinkInputValue = this.getPageWithLinkInputValue.bind(this);
    this.renderPreview = this.renderPreview.bind(this);
  }

  componentDidUpdate(prevState) {
    const { linkInputValue: prevLinkInputValue } = prevState;
    const { linkInputValue } = this.state;
    if (linkInputValue !== prevLinkInputValue) {
      this.getPageWithLinkInputValue(linkInputValue);
    }
  }

  show(defaultMarkdownLink = '') {
    const { labelInputValue, linkInputValue, linkerType } = this.parseMakdownLink(defaultMarkdownLink);

    this.setState({
      show: true,
      labelInputValue,
      linkInputValue,
      linkerType,
    });
  }

  parseMakdownLink(MarkdownLink) {
    let labelInputValue = MarkdownLink;
    let linkInputValue = '';
    let linkerType = 'mdLink';

    if (MarkdownLink.match(/^\[\[.*\]\]$/)) {
    // if (MarkdownLink.match(/^\[\[.*\]\]$/) && this.isApplyPukiwikiLikeLinkerPlugin) {
      linkerType = 'pukiwikiLink';
      const value = MarkdownLink.slice(2, -2);
      const indexOfSplit = value.lastIndexOf('>');
      if (indexOfSplit < 0) {
        labelInputValue = value;
        linkInputValue = value;
      }
      labelInputValue = value.slice(0, indexOfSplit);
      linkInputValue = value.slice(indexOfSplit + 1);
    }
    else if (MarkdownLink.match(/^\[\/.*\]$/)) {
      linkerType = 'growiLink';
      const value = MarkdownLink.slice(1, -1);
      labelInputValue = value;
      linkInputValue = value;
    }
    else if (MarkdownLink.match(/^\[.*\]\(.*\)$/)) {
      const value = MarkdownLink.slice(1, -1);
      const indexOfSplit = value.lastIndexOf('](');
      labelInputValue = value.slice(0, indexOfSplit);
      linkInputValue = value.slice(indexOfSplit + 2);
    }

    return { labelInputValue, linkInputValue, linkerType };
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

    // User can't use both relativePath and permalink at the same time
    this.setState({ isUseRelativePath: !this.state.isUseRelativePath, isUsePermanentLink: false });
  }

  toggleIsUsePamanentLink() {
    if (!this.state.isEnablePermanentLink) {
      return;
    }

    // User can't use both relativePath and permalink at the same time
    this.setState({ isUsePermanentLink: !this.state.isUsePermanentLink, isUseRelativePath: false });
  }

  renderPreview() {
    return (
      <div className="linkedit-preview">
        <Preview markdown={this.state.markdown} inputRef={() => {}} />
      </div>
    );
  }

  handleChangeLinkInput(inputChangeValue) {
    this.setState({ linkInputValue: inputChangeValue, isEnablePermanentLink: false, isUsePermanentLink: false });
  }

  handleChangeLabelInput(label) {
    this.setState({ labelInputValue: label });
  }

  handleChangeTypeahead(submitedValues) {
    const page = submitedValues[0]; // should be single page selected

    if (page != null) {
      this.handleChangeLinkInput(page.path);
    }
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

  async getPageWithLinkInputValue(path) {
    let markdown = '';
    let permalink = '';
    let isEnablePermanentLink = false;
    try {
      const res = await this.props.appContainer.apiGet('/pages.get', { path });
      markdown = res.page.revision.body;
      permalink = `${window.location.origin}/${res.page.id}`;
      isEnablePermanentLink = true;
    } catch (err) {
      markdown = `<div class="alert alert-warning" role="alert"><strong>${err.message}</strong></div>`;
    }
    this.setState({ markdown, permalink, isEnablePermanentLink });
  }

  generateLink() {
    const { pageContainer } = this.props;
    const { linkInputValue, labelInputValue, linkerType, isUseRelativePath, isUsePermanentLink } = this.state;

    let reshapedLink = linkInputValue;

    if (isUseRelativePath && linkInputValue.match(/^\//)) {
      reshapedLink = path.relative(pageContainer.state.path, linkInputValue);
    }
    if (isUsePermanentLink) {
      reshapedLink = this.state.permalink;
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
            <div className="col-12 col-lg-6">
              <form className="form-group">
                <div className="form-gorup my-3">
                  <label htmlFor="linkInput">Link</label>
                  <div className="input-group">
                    <SearchTypeahead
                      onChange={this.handleChangeTypeahead}
                      onInputChange={this.handleChangeLinkInput}
                      inputName="link"
                      placeholder="Input page path or URL"
                      keywordOnInit={this.state.linkInputValue}
                    />
                  </div>
                </div>
              </form>

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
                    <div className="form-inline">
                      <div className="custom-control custom-checkbox custom-checkbox-info">
                        <input
                          className="custom-control-input"
                          id="permanentLink"
                          type="checkbox"
                          checked={this.state.isUsePermanentLink}
                          disabled={!this.state.isEnablePermanentLink}
                        />
                        <label className="custom-control-label" htmlFor="permanentLink" onClick={this.toggleIsUsePamanentLink}>
                          Use permanent link
                        </label>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
            <div className="col-12 col-lg-6">
              <div className="d-block mb-3">{this.renderPreview()}</div>
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

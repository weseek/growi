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
import Linker from '../../models/Linker';

import { withUnstatedContainers } from '../UnstatedUtils';

class LinkEditModal extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      show: false,
      isUseRelativePath: false,
      isUsePermanentLink: false,
      linkInputValue: '',
      labelInputValue: '',
      linkerType: Linker.types.markdownLink,
      markdown: '',
    };

    this.isApplyPukiwikiLikeLinkerPlugin = window.growiRenderer.preProcessors.some(process => process.constructor.name === 'PukiwikiLikeLinker');

    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
    this.cancel = this.cancel.bind(this);
    this.handleChangeTypeahead = this.handleChangeTypeahead.bind(this);
    this.handleChangeLabelInput = this.handleChangeLabelInput.bind(this);
    this.handleChangeLinkInput = this.handleChangeLinkInput.bind(this);
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

  // defaultMarkdownLink is an instance of Linker
  show(defaultMarkdownLink = null) {
    // if defaultMarkdownLink is null, set default value in inputs.
    const { label = '', link = '' } = defaultMarkdownLink;
    let { type = Linker.types.markdownLink } = defaultMarkdownLink;

    // if type of defaultMarkdownLink is pukiwikiLink when pukiwikiLikeLinker plugin is disable, change type(not change label and link)
    if (type === Linker.types.pukiwikiLink && !this.isApplyPukiwikiLikeLinkerPlugin) {
      type = Linker.types.markdownLink;
    }

    this.setState({
      show: true,
      labelInputValue: label,
      linkInputValue: link,
      linkerType: type,
    });
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
    if (this.state.linkerType === Linker.types.growiLink) {
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

  handleChangeTypeahead(selected) {
    const page = selected[0];
    this.setState({ linkInputValue: page.path });
  }

  handleChangeLabelInput(label) {
    this.setState({ labelInputValue: label });
  }

  handleChangeLinkInput(link) {
    this.setState({ linkInputValue: link });
  }

  handleSelecteLinkerType(linkerType) {
    if (this.state.isUseRelativePath && linkerType === Linker.types.growiLink) {
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

    if (linkerType === Linker.types.pukiwikiLink) {
      return `[[${labelInputValue}>${reshapedLink}]]`;
    }
    if (linkerType === Linker.types.growiLink) {
      return `[${reshapedLink}]`;
    }
    if (linkerType === Linker.types.markdownLink) {
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
                    <SearchTypeahead
                      onChange={this.handleChangeTypeahead}
                      onInputChange={this.handleChangeLinkInput}
                      inputName="link"
                      placeholder="Input page path or URL"
                      keywordOnInit={this.state.linkInputValue}
                    />
                  </div>
                </div>
                <div className="form-inline">
                  <div className="custom-control custom-checkbox custom-checkbox-info">
                    <input className="custom-control-input" id="permanentLink" type="checkbox" checked={this.state.isUsePamanentLink} />
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
                        name={Linker.types.markdownLink}
                        className={`btn btn-outline-secondary w-100 ${this.state.linkerType === Linker.types.markdownLink && 'active'}`}
                        onClick={e => this.handleSelecteLinkerType(e.target.name)}
                      >
                        Markdown
                      </button>
                      <button
                        type="button"
                        name={Linker.types.growiLink}
                        className={`btn btn-outline-secondary w-100 ${this.state.linkerType === Linker.types.growiLink && 'active'}`}
                        onClick={e => this.handleSelecteLinkerType(e.target.name)}
                      >
                        Growi Original
                      </button>
                      {this.isApplyPukiwikiLikeLinkerPlugin && (
                        <button
                          type="button"
                          name={Linker.types.pukiwikiLink}
                          className={`btn btn-outline-secondary w-100 ${this.state.linkerType === Linker.types.pukiwikiLink && 'active'}`}
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
                        disabled={this.state.linkerType === Linker.types.growiLink}
                      />
                    </div>
                    <div className="form-inline">
                      <div className="custom-control custom-checkbox custom-checkbox-info">
                        <input
                          className="custom-control-input"
                          id="relativePath"
                          type="checkbox"
                          checked={this.state.isUseRelativePath}
                          disabled={this.state.linkerType === Linker.types.growiLink}
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

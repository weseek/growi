import React from 'react';
import PropTypes from 'prop-types';

import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from 'reactstrap';

import { debounce } from 'throttle-debounce';

import path from 'path';
import validator from 'validator';
import Preview from './Preview';
import PagePreviewIcon from '../Icons/PagePreviewIcon';

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
      permalink: '',
      linkText: '',
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
    this.toggleIsUsePamanentLink = this.toggleIsUsePamanentLink.bind(this);
    this.save = this.save.bind(this);
    this.generateLink = this.generateLink.bind(this);
    this.renderPreview = this.renderPreview.bind(this);
    this.getRootPath = this.getRootPath.bind(this);

    this.generateAndSetPreviewDebounced = debounce(200, this.generateAndSetPreview.bind(this));
  }

  componentDidUpdate(prevProps, prevState) {
    const { linkInputValue: prevLinkInputValue } = prevState;
    const { linkInputValue } = this.state;
    if (linkInputValue !== prevLinkInputValue) {
      this.generateAndSetPreviewDebounced(linkInputValue);
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

    this.parseLinkAndSetState(link, type);

    this.setState({
      show: true,
      labelInputValue: label,
      isUsePermanentLink: false,
      permalink: '',
      linkerType: type,
    });
  }

  // parse link, link is ...
  // case-1. url of this growi's page (ex. 'http://localhost:3000/hoge/fuga')
  // case-2. absolute path of this growi's page (ex. '/hoge/fuga')
  // case-3. relative path of this growi's page (ex. '../fuga', 'hoge')
  // case-4. external link (ex. 'https://growi.org')
  // case-5. the others (ex. '')
  parseLinkAndSetState(link, type) {
    // create url from link, add dummy origin if link is not valid url.
    // ex-1. link = 'https://growi.org/' -> url = 'https://growi.org/' (case-1,4)
    // ex-2. link = 'hoge' -> url = 'http://example.com/hoge' (case-2,3,5)
    const url = new URL(link, 'http://example.com');
    const isUrl = url.origin !== 'http://example.com';

    let isUseRelativePath = false;
    let reshapedLink = link;

    // if case-1, reshapedLink becomes page path
    reshapedLink = this.convertUrlToPathIfPageUrl(reshapedLink, url);

    // case-3
    if (!isUrl && !reshapedLink.startsWith('/') && reshapedLink !== '') {
      isUseRelativePath = true;
      const rootPath = this.getRootPath(type);
      reshapedLink = path.resolve(rootPath, reshapedLink);
    }

    this.setState({
      linkInputValue: reshapedLink,
      isUseRelativePath,
    });
  }

  // return path name of link if link is this growi page url, else return original link.
  convertUrlToPathIfPageUrl(link, url) {
    // when link is this growi's page url, url.origin === window.location.origin and return path name
    return url.origin === window.location.origin ? decodeURI(url.pathname) : link;
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
    if (!this.state.linkInputValue.startsWith('/') || this.state.linkerType === Linker.types.growiLink) {
      return;
    }

    // User can't use both relativePath and permalink at the same time
    this.setState({ isUseRelativePath: !this.state.isUseRelativePath, isUsePermanentLink: false });
  }

  toggleIsUsePamanentLink() {
    if (this.state.permalink === '' || this.state.linkerType === Linker.types.growiLink) {
      return;
    }

    // User can't use both relativePath and permalink at the same time
    this.setState({ isUsePermanentLink: !this.state.isUsePermanentLink, isUseRelativePath: false });
  }

  renderPreview() {
    return (
      <div className="linkedit-preview">
        <Preview markdown={this.state.markdown} />
      </div>
    );
  }

  async generateAndSetPreview(path) {
    let markdown = '';
    let permalink = '';

    if (path.startsWith('/')) {
      const pathWithoutFragment = new URL(path, 'http://dummy').pathname;
      const isPermanentLink = validator.isMongoId(pathWithoutFragment.slice(1));
      const pageId = isPermanentLink ? pathWithoutFragment.slice(1) : null;

      try {
        const { page } = await this.props.appContainer.apiGet('/pages.get', { path: pathWithoutFragment, page_id: pageId });
        markdown = page.revision.body;
        // create permanent link only if path isn't permanent link because checkbox for isUsePermanentLink is disabled when permalink is ''.
        permalink = !isPermanentLink ? `${window.location.origin}/${page.id}` : '';
      }
      catch (err) {
        markdown = `<div class="alert alert-warning" role="alert"><strong>${err.message}</strong></div>`;
      }
    }
    else {
      markdown = '<div class="alert alert-success" role="alert">Page preview here.</div>';
    }
    this.setState({ markdown, permalink });
  }

  renderLinkPreview() {
    const linker = this.generateLink();

    if (this.isUsePermanentLink && this.permalink != null) {
      linker.link = this.permalink;
    }

    if (linker.label === '') {
      linker.label = linker.link;
    }

    const linkText = linker.generateMarkdownText();
    return (
      <div>{linkText} &gt; <a href={linker.link}>{linker.label}</a></div>
    );
  }

  handleChangeTypeahead(selected) {
    const page = selected[0];
    if (page != null) {
      this.setState({ linkInputValue: page.path });
    }
  }

  handleChangeLabelInput(label) {
    this.setState({ labelInputValue: label });
  }

  handleChangeLinkInput(link) {
    let isUseRelativePath = this.state.isUseRelativePath;
    if (!this.state.linkInputValue.startsWith('/') || this.state.linkerType === Linker.types.growiLink) {
      isUseRelativePath = false;
    }
    this.setState({ linkInputValue: link, isUseRelativePath, isUsePermanentLink: false });
  }

  handleSelecteLinkerType(linkerType) {
    let { isUseRelativePath, isUsePermanentLink } = this.state;
    if (linkerType === Linker.types.growiLink) {
      isUseRelativePath = false;
      isUsePermanentLink = false;
    }
    this.setState({ linkerType, isUseRelativePath, isUsePermanentLink });
  }

  save() {
    if (this.props.onSave != null) {
      this.props.onSave(this.state.linkText);
    }

    this.hide();
  }

  generateLink() {
    const {
      linkInputValue, labelInputValue, linkerType, isUseRelativePath, isUsePermanentLink, permalink,
    } = this.state;

    let reshapedLink = linkInputValue;
    if (isUseRelativePath) {
      const rootPath = this.getRootPath(linkerType);
      reshapedLink = rootPath === linkInputValue ? '.' : path.relative(rootPath, linkInputValue);
    }

    if (isUsePermanentLink && permalink != null) {
      reshapedLink = permalink;
    }

    return new Linker(linkerType, labelInputValue, reshapedLink);
  }

  getRootPath(type) {
    const { pageContainer } = this.props;
    const pagePath = pageContainer.state.path;
    // rootPaths of md link and pukiwiki link are different
    return type === Linker.types.markdownLink ? path.dirname(pagePath) : pagePath;
  }

  render() {
    return (
      <Modal isOpen={this.state.show} toggle={this.cancel}>
        <ModalHeader tag="h4" toggle={this.cancel} className="bg-primary text-light">
          Edit Links
        </ModalHeader>

        <ModalBody className="container">
          <div className="row">
            <div className="col-12">
              <h2>Set link and label</h2>
              <form className="form-group">
                <div className="form-gorup my-3">
                  <div className="input-group flex-nowrap">
                    <div className="input-group-prepend">
                      <span className="input-group-text">link</span>
                    </div>
                    <SearchTypeahead
                      onChange={this.handleChangeTypeahead}
                      onInputChange={this.handleChangeLinkInput}
                      inputName="link"
                      placeholder="Input page path or URL"
                      keywordOnInit={this.state.linkInputValue}
                    />
                    <div className="input-group-append" onClick="">
                      <button type="button" className="btn btn-info btn-page-preview">
                        <PagePreviewIcon />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="form-gorup my-3">
                  <div className="input-group flex-nowrap">
                    <div className="input-group-prepend">
                      <span className="input-group-text">label</span>
                    </div>
                    <input
                      type="text"
                      className="form-control"
                      id="label"
                      value={this.state.labelInputValue}
                      onChange={e => this.handleChangeLabelInput(e.target.value)}
                      disabled={this.state.linkerType === Linker.types.growiLink}
                    />
                  </div>
                </div>
              </form>
              <div className="card bg-light">
                <div className="card-body">
                  <form className="form-group mb-0">
                    <div className="form-group row">
                      <label className="col-sm-3">Path format</label>
                      <div className="custom-control custom-checkbox custom-checkbox-info custom-control-inline">
                        <input
                          className="custom-control-input"
                          id="relativePath"
                          type="checkbox"
                          checked={this.state.isUseRelativePath}
                          disabled={!this.state.linkInputValue.startsWith('/') || this.state.linkerType === Linker.types.growiLink}
                        />
                        <label className="custom-control-label" htmlFor="relativePath" onClick={this.toggleIsUseRelativePath}>
                          Use relative path
                        </label>
                      </div>
                      <div className="custom-control custom-checkbox custom-checkbox-info custom-control-inline">
                        <input
                          className="custom-control-input"
                          id="permanentLink"
                          type="checkbox"
                          checked={this.state.isUsePermanentLink}
                          disabled={this.state.permalink === '' || this.state.linkerType === Linker.types.growiLink}
                        />
                        <label className="custom-control-label" htmlFor="permanentLink" onClick={this.toggleIsUsePamanentLink}>
                          Use permanent link
                        </label>
                      </div>
                    </div>
                    <div className="form-group row mb-0">
                      <label className="col-sm-3">Notation</label>
                      <div className="custom-control custom-radio custom-control-inline">
                        <input
                          type="radio"
                          className="custom-control-input"
                          id="markdownType"
                          checked={this.state.linkerType === Linker.types.markdownLink}
                          onClick={() => this.handleSelecteLinkerType(Linker.types.markdownLink)}
                        />
                        <label className="custom-control-label" htmlFor="markdownType">
                          Markdown
                        </label>
                      </div>
                      <div className="custom-control custom-radio custom-control-inline">
                        <input
                          type="radio"
                          className="custom-control-input"
                          id="growiType"
                          checked={this.state.linkerType === Linker.types.growiLink}
                          onClick={() => this.handleSelecteLinkerType(Linker.types.growiLink)}
                        />
                        <label className="custom-control-label" htmlFor="growiType">
                          Growi original
                        </label>
                      </div>
                      <div className="custom-control custom-radio custom-control-inline">
                        <input
                          type="radio"
                          className="custom-control-input"
                          id="pukiwikiType"
                          checked={this.state.linkerType === Linker.types.pukiwikiLink}
                          onClick={() => this.handleSelecteLinkerType(Linker.types.pukiwikiLink)}
                        />
                        <label className="custom-control-label" htmlFor="pukiwikiType">
                          Pukiwiki
                        </label>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
              {/* TODO GW-3448 fix layout */}
            </div>
          </div>
          <div className="row">
            <div className="col-12">
              <h2>Set link and label</h2>
              <div className="row">
                <div className="col"></div>
              </div>
              {this.renderLinkPreview()}
            </div>

            <div className="col d-none d-lg-block pr-0 mr-3 overflow-auto">{this.renderPreview()}</div>
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

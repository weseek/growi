import React from 'react';

import path from 'path';

import { useTranslation } from 'next-i18next';
import PropTypes from 'prop-types';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Popover,
  PopoverBody,
} from 'reactstrap';
import validator from 'validator';


import Linker from '~/client/models/Linker';
import { apiv3Get } from '~/client/util/apiv3-client';
import { useCurrentPagePath } from '~/stores/context';

import PagePreviewIcon from './Icons/PagePreviewIcon';
import Preview from './PageEditor/Preview';
import SearchTypeahead from './SearchTypeahead';


import styles from './PageEditor/LinkEditPreview.module.scss';

const presetA = {
  name: 'presetA',
  value: '## Preset',
};

const presetB = {
  name: 'presetB',
  value: '### Preset',
};

const presetC = {
  name: 'presetC',
  value: '#### Preset',
};

const templates = [presetA, presetB, presetC];

class TemplateModal extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      show: false,
      isUseRelativePath: false,
      isUsePermanentLink: false,
      linkInputValue: '',
      labelInputValue: '',
      linkerType: '',
      markdown: null,
      pagePath: null,
      previewError: '',
      permalink: '',
      isPreviewOpen: false,
    };

    // this.isApplyPukiwikiLikeLinkerPlugin = window.growiRenderer.preProcessors.some(process => process.constructor.name === 'PukiwikiLikeLinker');

    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
    this.cancel = this.cancel.bind(this);
    this.handleChangeTypeahead = this.handleChangeTypeahead.bind(this);
    this.handleChangeLabelInput = this.handleChangeLabelInput.bind(this);
    this.handleChangeLinkInput = this.handleChangeLinkInput.bind(this);
    // this.handleSelecteLinkerType = this.handleSelecteLinkerType.bind(this);
    this.toggleIsUseRelativePath = this.toggleIsUseRelativePath.bind(this);
    this.toggleIsUsePamanentLink = this.toggleIsUsePamanentLink.bind(this);
    this.save = this.save.bind(this);
    this.generateLink = this.generateLink.bind(this);
    this.getRootPath = this.getRootPath.bind(this);
    this.toggleIsPreviewOpen = this.toggleIsPreviewOpen.bind(this);
    this.setMarkdown = this.setMarkdown.bind(this);
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
      linkerType: 'type',
    });
  }

  // getCodeMirror() {
  //   return this.cm.current?.editor;
  // }

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

  async setMarkdown() {
    const { t } = this.props;
    const path = this.state.linkInputValue;
    let markdown = null;
    let pagePath = null;
    let permalink = '';
    let previewError = '';

    if (path.startsWith('/')) {
      const pathWithoutFragment = new URL(path, 'http://dummy').pathname;
      const isPermanentLink = validator.isMongoId(pathWithoutFragment.slice(1));
      const pageId = isPermanentLink ? pathWithoutFragment.slice(1) : null;

      try {
        const { data } = await apiv3Get('/page', { path: pathWithoutFragment, page_id: pageId });
        const { page } = data;
        markdown = page.revision.body;
        pagePath = page.path;
        permalink = page.id;
      }
      catch (err) {
        previewError = err.message;
      }
    }
    else {
      previewError = t('link_edit.page_not_found_in_preview', { path });
    }
    this.setState({
      markdown, pagePath, previewError, permalink,
    });
  }

  renderLinkPreview() {
    const linker = this.generateLink();
    return (
      <div className="d-flex justify-content-between mb-3 flex-column flex-sm-row">
        <div className="card card-disabled w-100 p-1 mb-0">
          <p className="text-left text-muted mb-1 small">Markdown</p>
          <p className="text-center text-truncate text-muted">{linker.generateMarkdownText()}</p>
        </div>
        <div className="d-flex align-items-center justify-content-center">
          <span className="lead mx-3">
            <i className="d-none d-sm-block fa fa-caret-right"></i>
            <i className="d-sm-none fa fa-caret-down"></i>
          </span>
        </div>
        <div className="card w-100 p-1 mb-0">
          <p className="text-left text-muted mb-1 small">HTML</p>
          <p className="text-center text-truncate">
            <a href={linker.link}>{linker.label}</a>
          </p>
        </div>
      </div>
    );
  }

  handleChangeTypeahead(selected) {
    const pageWithMeta = selected[0];
    if (pageWithMeta != null) {
      const page = pageWithMeta.data;
      const permalink = `${window.location.origin}/${page.id}`;
      this.setState({ linkInputValue: page.path, permalink });
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
    this.setState({
      linkInputValue: link, isUseRelativePath, isUsePermanentLink: false, permalink: '',
    });
  }

  handleSelecteLinkerType(linkerType) {
    // let { isUseRelativePath, isUsePermanentLink } = this.state;
    // if (linkerType === Linker.types.growiLink) {
    //   isUseRelativePath = false;
    //   isUsePermanentLink = false;
    // }

    this.setState({ linkerType });
  }

  save() {
    const { linkerType } = this.state;

    if (this.props.onSave != null) {
      this.props.onSave(linkerType);
    }

    this.hide();
  }

  generateLink() {
    const {
      linkInputValue, labelInputValue, linkerType, isUseRelativePath, isUsePermanentLink, permalink,
    } = this.state;

    // let reshapedLink = linkInputValue;
    // if (isUseRelativePath) {
    //   const rootPath = this.getRootPath(linkerType);
    //   reshapedLink = rootPath === linkInputValue ? '.' : path.relative(rootPath, linkInputValue);
    // }

    // if (isUsePermanentLink && permalink != null) {
    //   reshapedLink = permalink;
    // }

    return linkerType;
  }

  getRootPath(type) {
    const { pagePath } = this.props;
    // rootPaths of md link and pukiwiki link are different
    return type === Linker.types.markdownLink ? path.dirname(pagePath) : pagePath;
  }

  async toggleIsPreviewOpen() {
    // open popover
    if (this.state.isPreviewOpen === false) {
      this.setMarkdown();
    }
    this.setState({ isPreviewOpen: !this.state.isPreviewOpen });
  }

  renderLinkAndLabelForm() {
    const { t } = this.props;
    const { pagePath } = this.state;

    return (
      <>
        <h3 className="grw-modal-head">{t('link_edit.set_link_and_label')}</h3>
        <form className="form-group">
          <div className="form-gorup my-3">
            <div className="input-group flex-nowrap">
              <div className="input-group-prepend">
                <span className="input-group-text">{t('link_edit.link')}</span>
              </div>
              <SearchTypeahead
                onChange={this.handleChangeTypeahead}
                onInputChange={this.handleChangeLinkInput}
                inputName="link"
                placeholder={t('link_edit.placeholder_of_link_input')}
                keywordOnInit={this.state.linkInputValue}
                autoFocus
              />
              <div className="d-none d-sm-block input-group-append">
                <button type="button" id="preview-btn" className={`btn btn-info btn-page-preview ${styles['btn-page-preview']}`}>
                  <PagePreviewIcon />
                </button>
                <Popover trigger="focus" placement="right" isOpen={this.state.isPreviewOpen} target="preview-btn" toggle={this.toggleIsPreviewOpen}>
                  <PopoverBody>
                    {this.state.markdown != null && pagePath != null
                    && <div className={`linkedit-preview ${styles['linkedit-preview']}`}>
                      <Preview markdown={this.state.markdown} pagePath={pagePath} />
                    </div>
                    }
                  </PopoverBody>
                </Popover>
              </div>
            </div>
          </div>
          <div className="form-gorup my-3">
            <div className="input-group flex-nowrap">
              <div className="input-group-prepend">
                <span className="input-group-text">{t('link_edit.label')}</span>
              </div>
              <input
                type="text"
                className="form-control"
                id="label"
                value={this.state.labelInputValue}
                onChange={e => this.handleChangeLabelInput(e.target.value)}
                disabled={this.state.linkerType === Linker.types.growiLink}
                placeholder={this.state.linkInputValue}
              />
            </div>
          </div>
        </form>
      </>
    );
  }

  // /**
  //  * return a function to add prefix to selected each lines
  //  *
  //  * The cursor after editing is inserted between the end of the selection.
  //  */
  // createAddPrefixToEachLinesHandler(prefix) {
  //   return () => {
  //     const cm = this.getCodeMirror();
  //     const startLineNum = cm.getCursor('from').line;
  //     const endLineNum = cm.getCursor('to').line;

  //     const lines = [];
  //     for (let i = startLineNum; i <= endLineNum; i++) {
  //       lines.push(prefix + cm.getDoc().getLine(i));
  //     }
  //     const replacement = `${lines.join('\n')}\n`;
  //     cm.getDoc().replaceRange(replacement, { line: startLineNum, ch: 0 }, { line: endLineNum + 1, ch: 0 });

  //     cm.setCursor(endLineNum, cm.getDoc().getLine(endLineNum).length);
  //     cm.focus();
  //   };
  // }

  element(template) {
    return (
      <div key={template.name} className="custom-control custom-radio">
        <input
          type="radio"
          className="custom-control-input"
          id="string"
          value={template.value}
          // checked={this.state.linkerType === template.value}
          onChange={this.handleSelecteLinkerType(template.value)}
        />
        <label className="custom-control-label" htmlFor="string">
          {template.name}
        </label>
      </div>
    );
  }

  renderPathFormatForm() {
    const { t } = this.props;
    return (
      <div className="card well pt-3">
        {/* <form className="form-group mb-0">
          <div className="form-group row mb-0"> */}
        <label className="col-sm-3">Templates</label>
        <div className="col-sm-9">
          {/* <div key={templates[0].name} className="custom-control custom-radio custom-control-inline">
            <input
              type="radio"
              className="custom-control-input"
              id="markdownType"
              value={templates[0].value}
              // checked={this.state.linkerType === Linker.types.markdownLink}
              onChange={e => this.handleSelecteLinkerType(e.target.value)}
            />
            <label className="custom-control-label" htmlFor="markdownType">
              {templates[0].name}
            </label>
          </div>
          <div key={templates[1].name} className="custom-control custom-radio custom-control-inline">
            <input
              type="radio"
              className="custom-control-input"
              id="markdownType"
              value={templates[1].value}
              // checked={this.state.linkerType === Linker.types.markdownLink}
              onChange={e => this.handleSelecteLinkerType(e.target.value)}
            />
            <label className="custom-control-label" htmlFor="markdownType">
              {templates[1].name}
            </label>
          </div> */}

          { templates.map((template) => {
            return (
              this.element(template)
            );
          })}

        </div>
        {/* </div>
        </form> */}
      </div>
    );
  }

  render() {
    const { t } = this.props;
    return (
      <Modal className="link-edit-modal" isOpen={this.state.show} toggle={this.cancel} size="lg" autoFocus={false}>
        <ModalHeader tag="h4" toggle={this.cancel} className="bg-primary text-light">
          Template
        </ModalHeader>

        <ModalBody className="container">
          <div className="row">
            <div className="col-12">
              {this.renderPathFormatForm()}
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <button type="button" className="btn btn-sm btn-outline-secondary mx-1" onClick={this.hide}>
            {t('Cancel')}
          </button>
          <button type="submit" className="btn btn-sm btn-primary mx-1" onClick={this.save}>
            {t('Done')}
          </button>
        </ModalFooter>
      </Modal>
    );
  }

}

const TemplateModalFc = React.forwardRef((props, ref) => {
  const { t } = useTranslation();
  const { data: currentPath } = useCurrentPagePath();
  return <TemplateModal t={t} ref={ref} pagePath={currentPath} {...props} />;
});

TemplateModal.propTypes = {
  t: PropTypes.func.isRequired,
  pagePath: PropTypes.string,
  onSave: PropTypes.func,
};


export default TemplateModalFc;

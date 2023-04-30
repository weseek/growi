import React, { forwardRef, useImperativeHandle, useState } from 'react';

import path from 'path';

import { useTranslation } from 'next-i18next';
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
import { useCurrentPagePath } from '~/stores/page';
import { usePreviewOptions } from '~/stores/renderer';
import loggerFactory from '~/utils/logger';

import PagePreviewIcon from '../Icons/PagePreviewIcon';
import SearchTypeahead from '../SearchTypeahead';

import Preview from './Preview';


import styles from './LinkEditPreview.module.scss';


const logger = loggerFactory('growi:components:LinkEditModal');

type Props = {
  onSave: (linkText: string) => void
}

export const LinkEditModal = forwardRef((props: Props, ref): JSX.Element => {
  const { t } = useTranslation();
  const { data: currentPath } = useCurrentPagePath();
  const { data: rendererOptions } = usePreviewOptions();

  useImperativeHandle(ref, () => ({
    show: (defaultMarkdownLink: Linker) => {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      show(defaultMarkdownLink);
    },
  }));

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isUseRelativePath, setIsUseRelativePath] = useState<boolean>(false);
  const [isUsePermanentLink, setIsUsePermanentLink] = useState<boolean>(false);
  const [linkInputValue, setLinkInputValue] = useState<string>('');
  const [labelInputValue, setLabelInputValue] = useState<string>('');
  const [linkerType, setLinkerType] = useState<string>('');
  const [markdown, setMarkdown] = useState<string>('');
  const [pagePath, setPagePath] = useState<string>('');
  const [previewError, setPreviewError] = useState<string>('');
  const [permalink, setPermalink] = useState<string>('');
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);

  const getRootPath = (type: string) => {
    // rootPaths of md link and pukiwiki link are different
    if (currentPath == null) return ''; // TODO: think
    return type === Linker.types.markdownLink ? path.dirname(currentPath) : currentPath;
  };

  // parse link, link is ...
  // case-1. url of this growi's page (ex. 'http://localhost:3000/hoge/fuga')
  // case-2. absolute path of this growi's page (ex. '/hoge/fuga')
  // case-3. relative path of this growi's page (ex. '../fuga', 'hoge')
  // case-4. external link (ex. 'https://growi.org')
  // case-5. the others (ex. '')
  const parseLinkAndSetState = (link: string, type: string) => {
    // create url from link, add dummy origin if link is not valid url.
    // ex-1. link = 'https://growi.org/' -> url = 'https://growi.org/' (case-1,4)
    // ex-2. link = 'hoge' -> url = 'http://example.com/hoge' (case-2,3,5)
    let isFqcn = false;
    let isUseRelativePath = false;
    let url;
    try {
      const url = new URL(link, 'http://example.com');
      isFqcn = url.origin !== 'http://example.com';
    }
    catch (err) {
      logger.debug(err);
    }

    // case-1: when link is this growi's page url, return pathname only
    let reshapedLink = url != null && url.origin === window.location.origin
      ? decodeURIComponent(url.pathname)
      : link;

    // case-3
    if (!isFqcn && !reshapedLink.startsWith('/') && reshapedLink !== '') {
      isUseRelativePath = true;
      const rootPath = getRootPath(type);
      reshapedLink = path.resolve(rootPath, reshapedLink);
    }

    setLinkInputValue(reshapedLink);
    setIsUseRelativePath(isUseRelativePath);
  };

  const show = (defaultMarkdownLink: Linker) => {
    // if defaultMarkdownLink is null, set default value in inputs.
    const { label = '', link = '' } = defaultMarkdownLink;
    const { type = Linker.types.markdownLink } = defaultMarkdownLink;

    parseLinkAndSetState(link, type);

    setIsOpen(true);
    setLabelInputValue(label);
    setIsUsePermanentLink(false);
    setPermalink('');
    setLinkerType(type);
  };

  const hide = () => {
    setIsOpen(false);
  };

  const toggleIsUseRelativePath = () => {
    if (!linkInputValue.startsWith('/') || linkerType === Linker.types.growiLink) {
      return;
    }

    // User can't use both relativePath and permalink at the same time
    setIsUseRelativePath(!isUseRelativePath);
    setIsUsePermanentLink(false);
  };

  const toggleIsUsePamanentLink = () => {
    if (permalink === '' || linkerType === Linker.types.growiLink) {
      return;
    }

    // User can't use both relativePath and permalink at the same time
    setIsUsePermanentLink(!isUsePermanentLink);
    setIsUseRelativePath(false);
  };

  const setMarkdownHandler = async() => {
    const path = linkInputValue;
    let markdown = '';
    let pagePath = '';
    let permalink = '';
    let previewError = '';

    if (path.startsWith('/')) {
      try {
        const pathWithoutFragment = new URL(path, 'http://dummy').pathname;
        const isPermanentLink = validator.isMongoId(pathWithoutFragment.slice(1));
        const pageId = isPermanentLink ? pathWithoutFragment.slice(1) : null;

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

    setMarkdown(markdown);
    setPagePath(pagePath);
    setPreviewError(previewError);
    setPermalink(permalink);
  };

  const generateLink = () => {

    let reshapedLink = linkInputValue;
    if (isUseRelativePath) {
      const rootPath = getRootPath(linkerType);
      reshapedLink = rootPath === linkInputValue ? '.' : path.relative(rootPath, linkInputValue);
    }

    if (isUsePermanentLink && permalink != null) {
      reshapedLink = permalink;
    }

    return new Linker(linkerType, labelInputValue, reshapedLink);
  };

  const renderLinkPreview = (): JSX.Element => {
    const linker = generateLink();
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
  };

  const handleChangeTypeahead = (selected) => {
    const pageWithMeta = selected[0];
    if (pageWithMeta != null) {
      const page = pageWithMeta.data;
      const permalink = `${window.location.origin}/${page.id}`;
      setLinkInputValue(page.path);
      setPermalink(permalink);
    }
  };

  const handleChangeLabelInput = (label: string) => {
    setLabelInputValue(label);
  };

  const handleChangeLinkInput = (link) => {
    let useRelativePath = isUseRelativePath;
    if (!linkInputValue.startsWith('/') || linkerType === Linker.types.growiLink) {
      useRelativePath = false;
    }
    setLinkInputValue(link);
    setIsUseRelativePath(useRelativePath);
    setIsUsePermanentLink(false);
    setPermalink('');
  };

  const save = () => {
    const linker = generateLink();

    if (props.onSave != null) {
      props.onSave(linker.generateMarkdownText() ?? '');
    }

    hide();
  };

  const toggleIsPreviewOpen = async() => {
    // open popover
    if (!isPreviewOpen) {
      setMarkdownHandler();
    }
    setIsPreviewOpen(!isPreviewOpen);
  };

  const renderLinkAndLabelForm = (): JSX.Element => {
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
                onChange={handleChangeTypeahead}
                onInputChange={handleChangeLinkInput}
                placeholder={t('link_edit.placeholder_of_link_input')}
                keywordOnInit={linkInputValue}
                autoFocus
              />
              <div className="d-none d-sm-block input-group-append">
                <button type="button" id="preview-btn" className={`btn btn-info btn-page-preview ${styles['btn-page-preview']}`}>
                  <PagePreviewIcon />
                </button>
                <Popover trigger="focus" placement="right" isOpen={isPreviewOpen} target="preview-btn" toggle={toggleIsPreviewOpen}>
                  <PopoverBody>
                    {markdown != null && pagePath != null && rendererOptions != null
                    && <div className={`linkedit-preview ${styles['linkedit-preview']}`}>
                      <Preview markdown={markdown} pagePath={pagePath} rendererOptions={rendererOptions} />
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
                value={labelInputValue}
                onChange={e => handleChangeLabelInput(e.target.value)}
                disabled={linkerType === Linker.types.growiLink}
                placeholder={linkInputValue}
              />
            </div>
          </div>
        </form>
      </>
    );
  };

  const renderPathFormatForm = (): JSX.Element => {
    return (
      <div className="card well pt-3">
        <form className="form-group mb-0">
          <div className="form-group mb-0 row">
            <label className="col-sm-3">{t('link_edit.path_format')}</label>
            <div className="col-sm-9">
              <div className="custom-control custom-checkbox custom-checkbox-info custom-control-inline">
                <input
                  className="custom-control-input"
                  id="relativePath"
                  type="checkbox"
                  checked={isUseRelativePath}
                  onChange={toggleIsUseRelativePath}
                  disabled={!linkInputValue.startsWith('/') || linkerType === Linker.types.growiLink}
                />
                <label className="custom-control-label" htmlFor="relativePath">
                  {t('link_edit.use_relative_path')}
                </label>
              </div>
              <div className="custom-control custom-checkbox custom-checkbox-info custom-control-inline">
                <input
                  className="custom-control-input"
                  id="permanentLink"
                  type="checkbox"
                  checked={isUsePermanentLink}
                  onChange={toggleIsUsePamanentLink}
                  disabled={permalink === '' || linkerType === Linker.types.growiLink}
                />
                <label className="custom-control-label" htmlFor="permanentLink">
                  {t('link_edit.use_permanent_link')}
                </label>
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  };


  return (
    <Modal className="link-edit-modal" isOpen={isOpen} toggle={hide} size="lg" autoFocus={false}>
      <ModalHeader tag="h4" toggle={hide} className="bg-primary text-light">
        {t('link_edit.edit_link')}
      </ModalHeader>

      <ModalBody className="container">
        <div className="row">
          <div className="col-12">
            {renderLinkAndLabelForm()}
            {renderPathFormatForm()}
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            <h3 className="grw-modal-head">{t('link_edit.preview')}</h3>
            {renderLinkPreview()}
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <button type="button" className="btn btn-sm btn-outline-secondary mx-1" onClick={hide}>
          {t('Cancel')}
        </button>
        <button type="submit" className="btn btn-sm btn-primary mx-1" onClick={save}>
          {t('Done')}
        </button>
      </ModalFooter>
    </Modal>
  );
});

LinkEditModal.displayName = 'LinkEditModal';

import React from 'react';

import { IRevisionHasPageId, pathUtils } from '@growi/core';
import { createPatch } from 'diff';
import { html, Diff2HtmlConfig } from 'diff2html';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import urljoin from 'url-join';

import UserDate from '../User/UserDate';

import styles from './RevisionDiff.module.scss';

import 'diff2html/bundles/css/diff2html.min.css';

type RevisioinDiffProps = {
  currentRevision: IRevisionHasPageId,
  previousRevision: IRevisionHasPageId,
  revisionDiffOpened: boolean,
  currentPageId: string,
  currentPagePath: string,
  onClose: () => void,
}

export const RevisionDiff = (props: RevisioinDiffProps): JSX.Element => {
  const { t } = useTranslation();

  const {
    currentRevision, previousRevision, revisionDiffOpened, currentPageId, currentPagePath, onClose,
  } = props;

  const { returnPathForURL } = pathUtils;

  const previousText = (currentRevision._id === previousRevision._id) ? '' : previousRevision.body;

  const patch = createPatch(
    currentRevision.pageId, // currentRevision.path is DEPRECATED
    previousText,
    currentRevision.body,
  );

  const option: Diff2HtmlConfig = {
    outputFormat: 'side-by-side',
    drawFileList: false,
  };

  const diffViewHTML = (currentRevision.body && previousRevision.body && revisionDiffOpened) ? html(patch, option) : '';

  const diffView = { __html: diffViewHTML };

  return (
    <div className={`${styles['revision-diff-container']}`}>
      <div className='comparison-header'>
        <div className="container pt-1 pr-0">
          <div className="row">
            <div className="col comparison-source-wrapper pt-1 px-0">
              <span className="comparison-source pr-3">{t('page_history.comparing_source')}</span><UserDate dateTime={previousRevision.createdAt} />
              <Link
                href={urljoin(returnPathForURL(currentPagePath, currentPageId), `?revisionId=${previousRevision._id}`)}
                className="ml-3"
                onClick={onClose}
                prefetch={false}
              >
                <i className="icon-login"></i>
              </Link>
            </div>
            <div className="col comparison-target-wrapper pt-1">
              <span className="comparison-target pr-3">{t('page_history.comparing_target')}</span><UserDate dateTime={currentRevision.createdAt} />
              <Link
                href={urljoin(returnPathForURL(currentPagePath, currentPageId), `?revisionId=${currentRevision._id}`)}
                className="ml-3"
                onClick={onClose}
                prefetch={false}
              >
                <i className="icon-login"></i>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="revision-history-diff pb-1" dangerouslySetInnerHTML={diffView} />
    </div>
  );

};

import React from 'react';

import { IRevisionHasPageId } from '@growi/core';
import { createPatch } from 'diff';
import { html, Diff2HtmlConfig } from 'diff2html';
import { useTranslation } from 'next-i18next';

import UserDate from '../User/UserDate';

import styles from './RevisionDiff.module.scss';

import 'diff2html/bundles/css/diff2html.min.css';

type RevisioinDiffProps = {
  currentRevision: IRevisionHasPageId,
  previousRevision: IRevisionHasPageId,
  revisionDiffOpened: boolean,
}

export const RevisionDiff = (props: RevisioinDiffProps): JSX.Element => {
  const { t } = useTranslation();

  const { currentRevision, previousRevision, revisionDiffOpened } = props;

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
              <a href={`?revisionId=${previousRevision._id}`} className="ml-3">
                <i className="icon-login"></i>
              </a>

            </div>
            <div className="col comparison-target-wrapper pt-1">
              <span className="comparison-target pr-3">{t('page_history.comparing_target')}</span><UserDate dateTime={currentRevision.createdAt} />
              <a href={`?revisionId=${currentRevision._id}`} className="ml-3">
                <i className="icon-login"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="revision-history-diff pb-1" dangerouslySetInnerHTML={diffView} />
    </div>
  );

};

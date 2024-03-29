import { useMemo } from 'react';

import type { IRevisionHasPageId } from '@growi/core';
import { returnPathForURL } from '@growi/core/dist/utils/path-utils';
import { createPatch } from 'diff';
import type { Diff2HtmlConfig } from 'diff2html';
import { html } from 'diff2html';
import { ColorSchemeType } from 'diff2html/lib/types';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import urljoin from 'url-join';

import { Themes, useNextThemes } from '~/stores/use-next-themes';

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

  const { theme } = useNextThemes();

  const colorScheme: ColorSchemeType = useMemo(() => {
    switch (theme) {
      case Themes.DARK:
        return ColorSchemeType.DARK;
      case Themes.LIGHT:
        return ColorSchemeType.LIGHT;
      default:
        return ColorSchemeType.AUTO;
    }
  }, [theme]);

  const previousText = (currentRevision._id === previousRevision._id) ? '' : previousRevision.body;

  const patch = createPatch(
    currentRevision.pageId, // currentRevision.path is DEPRECATED
    previousText,
    currentRevision.body,
  );

  const option: Diff2HtmlConfig = {
    outputFormat: 'side-by-side',
    drawFileList: false,
    colorScheme,
  };

  const diffViewHTML = revisionDiffOpened ? html(patch, option) : '';

  const diffView = { __html: diffViewHTML };

  return (
    <div className={`${styles['revision-diff-container']}`}>
      <div className="container">
        <div className="row mt-2">
          <div className="col px-0 py-2">
            <span className="fw-bold">{t('page_history.comparing_source')}</span>
            <Link
              href={urljoin(returnPathForURL(currentPagePath, currentPageId), `?revisionId=${previousRevision._id}`)}
              className="small ms-2
                link-created-at
                link-secondary link-opacity-75 link-opacity-100-hover
                link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover"
              onClick={onClose}
              prefetch={false}
            >
              <UserDate dateTime={previousRevision.createdAt} />
            </Link>
          </div>
          <div className="col px-0 py-2">
            <span className="fw-bold">{t('page_history.comparing_target')}</span>
            <Link
              href={urljoin(returnPathForURL(currentPagePath, currentPageId), `?revisionId=${currentRevision._id}`)}
              className="small ms-2
                link-created-at
                link-secondary link-opacity-75 link-opacity-100-hover
                link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover"
              onClick={onClose}
              prefetch={false}
            >
              <UserDate dateTime={currentRevision.createdAt} />
            </Link>
          </div>
        </div>
      </div>
      {/* eslint-disable-next-line react/no-danger */}
      <div className="revision-history-diff pb-1" dangerouslySetInnerHTML={diffView} />
    </div>
  );

};

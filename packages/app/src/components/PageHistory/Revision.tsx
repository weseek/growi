import React from 'react';

import { IRevisionHasId } from '@growi/core';
import { UserPicture } from '@growi/ui';
import { useTranslation } from 'next-i18next';

import UserDate from '../User/UserDate';
import Username from '../User/Username';

import styles from './Revision.module.scss';

type RevisionProps = {
  revision: IRevisionHasId,
  isLatestRevision: boolean,
  hasDiff: boolean,
}

export const Revision = (props: RevisionProps): JSX.Element => {
  const { t } = useTranslation();

  const { revision, isLatestRevision, hasDiff } = props;

  const renderSimplifiedNodiff = (revision: IRevisionHasId) => {

    const author = revision.author;

    const pic = (typeof author === 'object') ? <UserPicture user={author} size="sm" /> : <></>;

    return (
      <div className={`${styles['revision-history-main']} ${styles['revision-history-main-nodiff']}
        revision-history-main revision-history-main-nodiff my-1 d-flex align-items-center`}>
        <div className="picture-container">
          { pic }
        </div>
        <div className="ml-3">
          <span className="text-muted small">
            <UserDate dateTime={revision.createdAt} /> ({ t('No diff') })
          </span>
        </div>
      </div>
    );
  };

  const renderFull = (revision: IRevisionHasId) => {

    const author = revision.author;

    const pic = (typeof author === 'object') ? <UserPicture user={author} size="lg" /> : <></>;

    return (
      <div className={`${styles['revision-history-main']} revision-history-main d-flex`}>
        <div className="picture-container">
          { pic }
        </div>
        <div className="ml-2">
          <div className="revision-history-author mb-1">
            <strong><Username user={author}></Username></strong>
            { isLatestRevision && <span className="badge badge-info ml-2">Latest</span> }
          </div>
          <div className="mb-1">
            <UserDate dateTime={revision.createdAt} />
            <br className="d-xl-none d-block" />
            <a className="ml-xl-3" href={`?revisionId=${revision._id}`}>
              <i className="icon-login"></i> { t('Go to this version') }
            </a>
          </div>
        </div>
      </div>
    );
  };

  if (!hasDiff) {
    return renderSimplifiedNodiff(revision);
  }

  return renderFull(revision);
};

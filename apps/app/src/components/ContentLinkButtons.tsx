import React from 'react';

import { USER_STATUS, type IUserHasId } from '@growi/core';
import { useTranslation } from 'next-i18next';
import { Link as ScrollLink } from 'react-scroll';

const BookMarkLinkButton = React.memo(({ fontSize }: { fontSize: number }) => {
  const { t } = useTranslation();
  return (
    <ScrollLink to="bookmarks-list" offset={-120}>
      <button
        type="button"
        className="btn btn-sm btn-outline-neutral-secondary rounded-pill d-flex align-items-center"
        style={{ fontSize }}
      >
        <span className="material-symbols-outlined p-0">bookmark</span>
        <span>{t('footer.bookmarks')}</span>
      </button>
    </ScrollLink>
  );
});

BookMarkLinkButton.displayName = 'BookMarkLinkButton';

const RecentlyCreatedLinkButton = React.memo(({ fontSize }: { fontSize: number }) => {
  const { t } = useTranslation();
  return (
    <ScrollLink to="recently-created-list" offset={-120}>
      <button
        type="button"
        className="btn btn-sm btn-outline-neutral-secondary rounded-pill d-flex align-items-center"
        style={{ fontSize }}
      >
        <span className="growi-custom-icons me-1">recently_created</span>
        <span>{t('footer.recently_created')}</span>
      </button>
    </ScrollLink>
  );
});

RecentlyCreatedLinkButton.displayName = 'RecentlyCreatedLinkButton';


export type ContentLinkButtonsProps = {
  author?: IUserHasId,
}

export const ContentLinkButtons = (props: ContentLinkButtonsProps): JSX.Element => {
  const { author } = props;
  const fontSize = 10;

  if (author == null || author.status === USER_STATUS.DELETED) {
    return <></>;
  }

  return (
    <div className="container">
      <div className="row">
        <div className="col-5 p-0 d-flex align-items-center justify-content-center">
          <BookMarkLinkButton fontSize={fontSize} />
        </div>
        <div className="col-7 p-0 d-flex align-items-center justify-content-center">
          <RecentlyCreatedLinkButton fontSize={fontSize} />
        </div>
      </div>
    </div>
  );
};

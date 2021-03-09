import React from 'react';

import loggerFactory from '~/utils/logger';

import { useTranslation } from '~/i18n';
import DevidedPagePath from '~/models/devided-page-path';
import LinkedPagePath from '~/models/linked-page-path';
import PagePathHierarchicalLink from '~/components/PagePathHierarchicalLink';
import { useRecentlyUpdatedSWR } from '~/stores/page';

import { toastError } from '../../util/apiNotification';

import FormattedDistanceDate from '../FormattedDistanceDate';
import UserPicture from '../User/UserPicture';

const logger = loggerFactory('growi:cli:RecentChanges');


type Props = {
  page: any,
}

const PageItem = ({ page }: Props): JSX.Element => {
  const dPagePath = new DevidedPagePath(page.path, false, true);
  const linkedPagePathFormer = new LinkedPagePath(dPagePath.former);
  const linkedPagePathLatter = new LinkedPagePath(dPagePath.latter);
  const FormerLink = () => (
    <div className="grw-page-path-text-muted-container small">
      <PagePathHierarchicalLink linkedPagePath={linkedPagePathFormer} />
    </div>
  );

  return (
    <li className="list-group-item p-2">
      <div className="d-flex w-100">
        <UserPicture user={page.lastUpdateUser} size="md" noTooltip />
        <div className="flex-grow-1 ml-2">
          { !dPagePath.isRoot && <FormerLink /> }
          <h5 className="mb-1">
            <PagePathHierarchicalLink linkedPagePath={linkedPagePathLatter} basePath={dPagePath.isRoot ? undefined : dPagePath.former} />
          </h5>
          <div className="text-right small">
            <FormattedDistanceDate id={page.id} date={page.updatedAt} />
          </div>
        </div>
      </div>
    </li>
  );
};


const RecentChanges = (): JSX.Element => {

  const { t } = useTranslation();
  const { data: pages, error, mutate } = useRecentlyUpdatedSWR();

  if (error != null) {
    logger.error('failed to save', error);
    toastError(error, 'Error occurred in updating History');
  }

  const recentlyUpdatedPages: any[] = pages || [];

  return (
    <>
      <div className="grw-sidebar-content-header p-3 d-flex">
        <h3 className="mb-0">{t('Recent Changes')}</h3>
        {/* <h3 className="mb-0">{t('Recent Created')}</h3> */} {/* TODO: impl switching */}
        <button type="button" className="btn btn-sm btn-outline-secondary ml-auto" onClick={() => mutate()}>
          <i className="icon icon-reload"></i>
        </button>
      </div>
      <div className="grw-sidebar-content-body p-3">
        <ul className="list-group list-group-flush">
          { recentlyUpdatedPages.map(page => <PageItem key={page.id} page={page} />) }
        </ul>
      </div>
    </>
  );

};

export default RecentChanges;

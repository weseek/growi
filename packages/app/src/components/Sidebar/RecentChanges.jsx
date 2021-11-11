import React, {
  useCallback, useEffect, useState,
} from 'react';
import PropTypes from 'prop-types';

import { useTranslation, withTranslation } from 'react-i18next';

import { UserPicture, FootstampIcon } from '@growi/ui';
import { DevidedPagePath } from '@growi/core';

import PagePathHierarchicalLink from '~/components/PagePathHierarchicalLink';
import { apiv3Get } from '~/client/util/apiv3-client';
import { toastError } from '~/client/util/apiNotification';
import { useSWRxRecentlyUpdated } from '~/stores/page';
import loggerFactory from '~/utils/logger';

import LinkedPagePath from '~/models/linked-page-path';


import FormattedDistanceDate from '../FormattedDistanceDate';

const logger = loggerFactory('growi:History');

function PageItemLower({ page }) {
  return (
    <div className="d-flex justify-content-between grw-recent-changes-item-lower pt-1">
      <div className="d-flex">
        <div className="footstamp-icon mr-1 d-inline-block"><FootstampIcon /></div>
        <div className="mr-2 grw-list-counts d-inline-block">{page.seenUsers.length}</div>
        <div className="icon-bubble mr-1 d-inline-block"></div>
        <div className="mr-2 grw-list-counts d-inline-block">{page.commentCount}</div>
      </div>
      <div className="grw-formatted-distance-date small mt-auto">
        <FormattedDistanceDate id={page._id} date={page.updatedAt} />
      </div>
    </div>
  );
}
PageItemLower.propTypes = {
  page: PropTypes.any,
};
function LargePageItem({ page }) {
  const dPagePath = new DevidedPagePath(page.path, false, true);
  const linkedPagePathFormer = new LinkedPagePath(dPagePath.former);
  const linkedPagePathLatter = new LinkedPagePath(dPagePath.latter);
  const FormerLink = () => (
    <div className="grw-page-path-text-muted-container small">
      <PagePathHierarchicalLink linkedPagePath={linkedPagePathFormer} />
    </div>
  );

  let locked;
  if (page.grant !== 1) {
    locked = <span><i className="icon-lock ml-2" /></span>;
  }

  const tags = page.tags;
  const tagElements = tags.map((tag) => {
    return (
      <a key={tag.name} href={`/_search?q=tag:${tag.name}`} className="grw-tag-label badge badge-secondary mr-2 small">
        {tag.name}
      </a>
    );
  });

  return (
    <li className="list-group-item py-3 px-0">
      <div className="d-flex w-100">
        <UserPicture user={page.lastUpdateUser} size="md" noTooltip />
        <div className="flex-grow-1 ml-2">
          { !dPagePath.isRoot && <FormerLink /> }
          <h5 className="my-2">
            <PagePathHierarchicalLink linkedPagePath={linkedPagePathLatter} basePath={dPagePath.isRoot ? undefined : dPagePath.former} />
            {locked}
          </h5>
          <div className="grw-tag-labels mt-1 mb-2">
            { tagElements }
          </div>
          <PageItemLower page={page} />
        </div>
      </div>
    </li>
  );
}
LargePageItem.propTypes = {
  page: PropTypes.any,
};

function SmallPageItem({ page }) {
  const dPagePath = new DevidedPagePath(page.path, false, true);
  const linkedPagePathFormer = new LinkedPagePath(dPagePath.former);
  const linkedPagePathLatter = new LinkedPagePath(dPagePath.latter);
  const FormerLink = () => (
    <div className="grw-page-path-text-muted-container small">
      <PagePathHierarchicalLink linkedPagePath={linkedPagePathFormer} />
    </div>
  );

  let locked;
  if (page.grant !== 1) {
    locked = <span><i className="icon-lock ml-2" /></span>;
  }

  return (
    <li className="list-group-item py-2 px-0">
      <div className="d-flex w-100">
        <UserPicture user={page.lastUpdateUser} size="md" noTooltip />
        <div className="flex-grow-1 ml-2">
          { !dPagePath.isRoot && <FormerLink /> }
          <h5 className="my-0">
            <PagePathHierarchicalLink linkedPagePath={linkedPagePathLatter} basePath={dPagePath.isRoot ? undefined : dPagePath.former} />
            {locked}
          </h5>
          <PageItemLower page={page} />
        </div>
      </div>
    </li>
  );
}
SmallPageItem.propTypes = {
  page: PropTypes.any,
};


const RecentChanges = () => {

  const { t } = useTranslation();
  const { data: pages, error, mutate } = useSWRxRecentlyUpdated();

  if (error != null) {
    toastError(error, 'Error occurred in updating History');
  }

  const [isRecentChangesSidebarSmall, setIsRecentChangesSidebarSmall] = useState(false);

  const retrieveSizePreferenceFromLocalStorage = useCallback(() => {
    if (window.localStorage.isRecentChangesSidebarSmall === 'true') {
      setIsRecentChangesSidebarSmall(true);
    }
  });

  const changeSizeHandler = useCallback((e) => {
    setIsRecentChangesSidebarSmall(e.target.checked);
    window.localStorage.setItem('isRecentChangesSidebarSmall', e.target.checked);
  }, []);

  // componentDidMount
  useEffect(() => {
    retrieveSizePreferenceFromLocalStorage();
  }, [retrieveSizePreferenceFromLocalStorage]);

  return (
    <>
      <div className="grw-sidebar-content-header p-3 d-flex">
        <h3 className="mb-0  text-nowrap">{t('Recent Changes')}</h3>
        <button type="button" className="btn btn-sm ml-auto grw-btn-reload" onClick={() => mutate()}>
          <i className="icon icon-reload"></i>
        </button>
        <div className="d-flex align-items-center">
          <div className="grw-recent-changes-resize-button custom-control custom-switch ml-1">
            <input
              id="recentChangesResize"
              className="custom-control-input"
              type="checkbox"
              checked={isRecentChangesSidebarSmall}
              onChange={changeSizeHandler}
            />
            <label className="custom-control-label" htmlFor="recentChangesResize">
            </label>
          </div>
        </div>
      </div>
      <div className="grw-sidebar-content-body grw-recent-changes p-3">
        <ul className="list-group list-group-flush">
          {(pages || []).map(page => (isRecentChangesSidebarSmall
            ? <SmallPageItem key={page._id} page={page} />
            : <LargePageItem key={page._id} page={page} />))}
        </ul>
      </div>
    </>
  );

};

// export default RecentChanges;


class DeprecatedRecentChanges extends React.Component {

  static propTypes = {
    t: PropTypes.func.isRequired, // i18next
  };

  constructor(props) {
    super(props);
    this.state = {
      isRecentChangesSidebarSmall: false,
      recentlyUpdatedPages: [],
    };
    this.reloadData = this.reloadData.bind(this);
  }

  componentWillMount() {
    this.retrieveSizePreferenceFromLocalStorage();
  }

  async componentDidMount() {
    this.reloadData();
  }

  async reloadData() {
    try {
      const { data } = await apiv3Get('/pages/recent');
      this.setState({ recentlyUpdatedPages: data.pages });
    }
    catch (error) {
      logger.error('failed to save', error);
      toastError(error, 'Error occurred in updating History');
    }
  }

  retrieveSizePreferenceFromLocalStorage() {
    if (window.localStorage.isRecentChangesSidebarSmall === 'true') {
      this.setState({
        isRecentChangesSidebarSmall: true,
      });
    }
  }

  changeSizeHandler = (e) => {
    this.setState({
      isRecentChangesSidebarSmall: e.target.checked,
    });
    window.localStorage.setItem('isRecentChangesSidebarSmall', e.target.checked);
  }

  render() {
    const { t } = this.props;

    return (
      <>
        <div className="grw-sidebar-content-header p-3 d-flex">
          <h3 className="mb-0">{t('Recent Changes')}</h3>
          {/* <h3 className="mb-0">{t('Recent Created')}</h3> */} {/* TODO: impl switching */}
          <button type="button" className="btn btn-sm ml-auto grw-btn-reload-rc" onClick={this.reloadData}>
            <i className="icon icon-reload"></i>
          </button>
          <div className="grw-recent-changes-resize-button custom-control custom-switch ml-2">
            <input
              id="recentChangesResize"
              className="custom-control-input"
              type="checkbox"
              checked={this.state.isRecentChangesSidebarSmall}
              onChange={this.changeSizeHandler}
            />
            <label className="custom-control-label" htmlFor="recentChangesResize">
            </label>
          </div>
        </div>
        <div className="grw-sidebar-content-body grw-recent-changes p-3">
          <ul className="list-group list-group-flush">
            {this.state.recentlyUpdatedPages.map(page => (this.state.isRecentChangesSidebarSmall
              ? <SmallPageItem key={page._id} page={page} />
              : <LargePageItem key={page._id} page={page} />))}
          </ul>
        </div>
      </>
    );
  }

}


export default withTranslation()(DeprecatedRecentChanges);

import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import { UserPicture } from '@growi/ui';
import { DevidedPagePath } from '@growi/core';
import PagePathHierarchicalLink from '~/components/PagePathHierarchicalLink';
import loggerFactory from '~/utils/logger';

import LinkedPagePath from '~/models/linked-page-path';

import FootstampIcon from '../FootstampIcon';

import { withUnstatedContainers } from '../UnstatedUtils';
import AppContainer from '~/client/services/AppContainer';
import { toastError } from '~/client/util/apiNotification';

import FormattedDistanceDate from '../FormattedDistanceDate';

const logger = loggerFactory('growi:History');
class RecentChanges extends React.Component {

  static propTypes = {
    t: PropTypes.func.isRequired, // i18next
    appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      // TODO: 7092 connect to state
      // eslint-disable-next-line react/no-unused-state
      isRecentChangesSidebarSmall: false,
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
    const { appContainer } = this.props;

    try {
      await appContainer.retrieveRecentlyUpdated();
    }
    catch (error) {
      logger.error('failed to save', error);
      toastError(error, 'Error occurred in updating History');
    }
  }

  retrieveSizePreferenceFromLocalStorage() {
    if (window.localStorage.isRecentChangesSidebarSmall === 'true') {
      this.setState({
        // TODO: 7092 connect to state
        // eslint-disable-next-line react/no-unused-state
        isRecentChangesSidebarSmall: true,
      });
    }
  }

  changeSizeHandler = (e) => {
    this.setState({
      // TODO: 7092 connect to state
      // eslint-disable-next-line react/no-unused-state
      isRecentChangesSidebarSmall: e.target.checked,
    });
    window.localStorage.setItem('isRecentChangesSidebarSmall', e.target.checked);
  }

  PageItem = ({ page }) => {
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
        <a key={tag} href={`/_search?q=tag:${tag.name}`} className="grw-tag-label badge badge-secondary mr-2 small">
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
            <div className="mt-1 mb-2">
              { tagElements }
            </div>
            <div className="d-flex justify-content-between grw-recent-changes-item-lower pt-1">
              <div className="d-flex">
                <div className="footstamp-icon mr-1 d-inline-block"><FootstampIcon /></div>
                <div className="mr-2 grw-list-counts d-inline-block">{page.seenUsers.length}</div>
                <div className="icon-bubble mr-1 d-inline-block"></div>
                <div className="mr-2 grw-list-counts d-inline-block">{page.commentCount}</div>
              </div>
              <div className="grw-formatted-distance-date small mt-auto">
                <FormattedDistanceDate id={page.id} date={page.updatedAt} />
              </div>
            </div>
          </div>
        </div>
      </li>
    );
  }

  render() {
    const { PageItem } = this;
    const { t } = this.props;
    const { recentlyUpdatedPages } = this.props.appContainer.state;

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
              // checked={}
              // disabled={}
              // onChange={e => userPreferenceSwitchModifiedHandler(e.target.checked)}
            />
            <label className="custom-control-label" htmlFor="recentChangesResize">
            </label>
          </div>
        </div>
        <div className="grw-sidebar-content-body grw-recent-changes p-3">
          <ul className="list-group list-group-flush">
            { recentlyUpdatedPages.map(page => <PageItem key={page.id} page={page} />) }
          </ul>
        </div>
      </>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const RecentChangesWrapper = withUnstatedContainers(RecentChanges, [AppContainer]);


export default withTranslation()(RecentChangesWrapper);

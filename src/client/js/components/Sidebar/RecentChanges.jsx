import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import loggerFactory from '@alias/logger';

import DevidedPagePath from '~/models/devided-page-path';
import LinkedPagePath from '~/models/linked-page-path';
import PagePathHierarchicalLink from '~/components/PagePathHierarchicalLink';

import { withUnstatedContainers } from '../UnstatedUtils';
import AppContainer from '../../services/AppContainer';
import { toastError } from '../../util/apiNotification';

import FormattedDistanceDate from '../FormattedDistanceDate';
import UserPicture from '../User/UserPicture';

const logger = loggerFactory('growi:History');
class RecentChanges extends React.Component {

  static propTypes = {
    t: PropTypes.func.isRequired, // i18next
    appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  };

  constructor(props) {
    super(props);

    this.reloadData = this.reloadData.bind(this);
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

  PageItem = ({ page }) => {
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
          <button type="button" className="btn btn-sm btn-outline-secondary ml-auto" onClick={this.reloadData}>
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
  }

}

/**
 * Wrapper component for using unstated
 */
const RecentChangesWrapper = withUnstatedContainers(RecentChanges, [AppContainer]);

export default withTranslation()(RecentChangesWrapper);

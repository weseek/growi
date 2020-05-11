import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import { format, formatDistanceStrict } from 'date-fns';
import { UncontrolledTooltip } from 'reactstrap';

import {
  HeaderSection,
  MenuSection,
} from '@atlaskit/navigation-next';

import loggerFactory from '@alias/logger';

import DevidedPagePath from '@commons/models/devided-page-path';
import LinkedPagePath from '@commons/models/linked-page-path';
import PagePathHierarchicalLink from '@commons/components/PagePathHierarchicalLink';

import { createSubscribedElement } from '../UnstatedUtils';
import AppContainer from '../../services/AppContainer';
import { toastError } from '../../util/apiNotification';

import UserPicture from '../User/UserPicture';

const logger = loggerFactory('growi:History');
class History extends React.Component {

  static propTypes = {
    t: PropTypes.func.isRequired, // i18next
    appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  };

  constructor(props) {
    super(props);

    this.reloadData = this.reloadData.bind(this);
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

    const date = new Date(page.updatedAt);
    const baseDate = new Date();
    const updatedDateId = `commentDate-${page._id}`;
    const updatedDate = <span id={updatedDateId}>{formatDistanceStrict(date, baseDate)}</span>;
    const updatedDateFormatted = format(date, 'yyyy/MM/dd HH:mm');

    return (
      <li className="list-group-item">
        <div className="d-flex w-100">
          <UserPicture user={page.lastUpdatedUser} size="md" />
          <div className="flex-grow-1 ml-2">
            { !dPagePath.isRoot && <FormerLink /> }
            <h4 className="mb-1">
              <PagePathHierarchicalLink linkedPagePath={linkedPagePathLatter} basePath={dPagePath.isRoot ? undefined : dPagePath.former} />
            </h4>
            <div className="text-right small">{updatedDate}</div>
            <UncontrolledTooltip placement="bottom" fade={false} target={updatedDateId}>{updatedDateFormatted}</UncontrolledTooltip>
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
      <div className="grw-sidebar-history">
        <HeaderSection>
          { () => (
            <div className="grw-sidebar-header-container p-3 d-flex">
              <h3>{t('History')}</h3>
              <button type="button" className="btn xs btn-secondary ml-auto" onClick={this.reloadData}>
                <i className="icon icon-reload"></i>
              </button>
            </div>
          ) }
        </HeaderSection>
        <MenuSection>
          { () => (
            <div className="grw-sidebar-content-container p-3">
              <ul className="list-group list-group-flush">
                { recentlyUpdatedPages.map(page => <PageItem key={page.id} page={page} />) }
              </ul>
            </div>
          ) }
        </MenuSection>
      </div>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const HistoryWrapper = (props) => {
  return createSubscribedElement(History, props, [AppContainer]);
};

export default withTranslation()(HistoryWrapper);

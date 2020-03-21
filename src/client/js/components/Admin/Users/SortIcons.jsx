import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';
import AdminUsersContainer from '../../../services/AdminUsersContainer';

class SortIcons extends React.Component {

  constructor(props) {
    super(props);

    this.state = {

    };

  }

  /**
   *  sorting
   */
  renderSortIcon(columnName) {
    return (
      <div className="d-flex flex-column text-center">
        { this.generateSorting(columnName, 'asc') }
        { this.generateSorting(columnName, 'desc') }
      </div>
    );
  }

  generateSorting(columnName, sorting) {
    const { adminUsersContainer } = this.props;
    const upOrDown = (sorting === 'asc' ? 'up' : 'down');
    return (
      <a
        className={`fa ${(
        adminUsersContainer.state.sort === columnName)
        && (adminUsersContainer.state.sortOrder === sorting) ? `fa-chevron-${upOrDown}` : `fa-angle-${upOrDown}`}`}
        aria-hidden="true"
        onClick={() => adminUsersContainer.onClickSort(columnName, sorting === 'asc')}
      >
      </a>
    );

  }

  render() {
    const { t } = this.props;

    return (
      <Fragment>
        <thead>
          <tr>
            <th width="100px">#</th>
            <th>
              <div className="d-flex align-items-center">
                <div className="mr-3">
                  {t('status')}
                </div>
                { this.renderSortIcon('status') }
              </div>
            </th>
            <th>
              <div className="d-flex align-items-center">
                <div className="mr-3">
                  <code>username</code>
                </div>
                { this.renderSortIcon('username') }
              </div>
            </th>
            <th>
              <div className="d-flex align-items-center">
                <div className="mr-3">
                  {t('Name')}
                </div>
                { this.renderSortIcon('name')}
              </div>
            </th>
            <th>
              <div className="d-flex align-items-center">
                <div className="mr-3">
                  {t('Email')}
                </div>
                { this.renderSortIcon('email')}
              </div>
            </th>
            <th width="100px">
              <div className="d-flex align-items-center">
                <div className="mr-3">
                  {t('Created')}
                </div>
                { this.renderSortIcon('createdAt')}
              </div>
            </th>
            <th width="150px">
              <div className="d-flex align-items-center">
                <div className="mr-3">
                  {t('Last_Login')}
                </div>
                { this.renderSortIcon('lastLoginAt')}
              </div>
            </th>
            <th width="70px"></th>
          </tr>
        </thead>

      </Fragment>
    );
  }

}


SortIcons.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminUsersContainer: PropTypes.instanceOf(AdminUsersContainer).isRequired,
};

const SortIconsWrapper = (props) => {
  return createSubscribedElement(SortIcons, props, [AppContainer, AdminUsersContainer]);
};

export default withTranslation()(SortIconsWrapper);

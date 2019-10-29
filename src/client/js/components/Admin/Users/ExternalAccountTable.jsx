import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import dateFnsFormat from 'date-fns/format';

import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';
import AdminExternalAccountsContainer from '../../../services/AdminExternalAccountsContainer';

class ExternalAccountTable extends React.Component {

  constructor(props) {
    super(props);

    this.state = {

    };

    this.getUserStatusLabel = this.getUserStatusLabel.bind(this);
  }

  /**
   * user.statusをみてステータスのラベルを返す
   * @param {string} userStatus
   * @return ステータスラベル
   */
  getUserStatusLabel(userStatus) {
    let additionalClassName;
    let text;

    switch (userStatus) {
      case 1:
        additionalClassName = 'label-info';
        text = 'Approval Pending';
        break;
      case 2:
        additionalClassName = 'label-success';
        text = 'Active';
        break;
      case 3:
        additionalClassName = 'label-warning';
        text = 'Suspended';
        break;
      case 4:
        additionalClassName = 'label-danger';
        text = 'Deleted';
        break;
      case 5:
        additionalClassName = 'label-info';
        text = 'Invited';
        break;
    }

    return (
      <span className={`label ${additionalClassName}`}>
        {text}
      </span>
    );
  }

  render() {
    const { t, adminExternalAccountsContainer } = this.props;

    return (
      <Fragment>
        <table className="table table-bordered table-user-list">
          <thead>
            <tr>
              <th width="120px">{ t('user_management.authentication_provider') }</th>
              <th><code>accountId</code></th>
              <th>{ t('user_management.related_username', 'username') }</th>
              <th>
                { t('user_management.password_setting') }
                <div
                  className="text-muted"
                  data-toggle="popover"
                  data-placement="top"
                  data-trigger="hover focus"
                  tabIndex="0"
                  role="button"
                  data-animation="false"
                  data-html="true"
                  data-content={t('user_management.password_setting_help')}
                >
                  <small>
                    <i className="icon-question" aria-hidden="true"></i>
                  </small>
                </div>
              </th>
              <th width="100px">{ t('Created') }</th>
              <th width="70px"></th>
            </tr>
          </thead>
          <tbody>
            {adminExternalAccountsContainer.state.exteranalAccounts.map((ea) => {
              const { externalAccount } = ea;
              return (
                <tr>
                  <td>{externalAccount.providerType}</td>
                  <td>
                    <strong>{externalAccount.accountId}</strong>
                  </td>
                  <td>
                    <strong>{externalAccount.user.username}</strong>
                  </td>
                  <td>
                    { externalAccount.password
                      ? (
                        <span className="label label-info">
                          { t('user_management.set') }
                        </span>
                      )
                      : (
                        <span className="label label-warning">
                          { t('user_management.unset') }
                        </span>
                      )
                    }
                  </td>
                  <td>{dateFnsFormat(new Date(externalAccount.createdAt), 'yyyy-MM-dd')}</td>
                  <td>
                    <div className="btn-group admin-user-menu">
                      <button type="button" className="btn btn-default btn-sm dropdown-toggle" data-toggle="dropdown">
                        <i className="icon-settings"></i> <span className="caret"></span>
                      </button>
                      <ul className="dropdown-menu" role="menu">
                        <li className="dropdown-header">{ t('user_management.edit_menu') }</li>
                        <li>
                          <a onClick={() => { return this.removeExtenalAccount(externalAccount.accountId) }}>
                            <i className="icon-fw icon-fire text-danger"></i> { t('Delete') }
                          </a>
                        </li>
                      </ul>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Fragment>
    );
  }

}

ExternalAccountTable.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminExternalAccountsContainer: PropTypes.instanceOf(AdminExternalAccountsContainer).isRequired,
};

const ExternalAccountTableWrapper = (props) => {
  return createSubscribedElement(ExternalAccountTable, props, [AppContainer, AdminExternalAccountsContainer]);
};


export default withTranslation()(ExternalAccountTableWrapper);

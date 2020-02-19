import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import dateFnsFormat from 'date-fns/format';

import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';
import AdminExternalAccountsContainer from '../../../services/AdminExternalAccountsContainer';

import { toastSuccess, toastError } from '../../../util/apiNotification';

class ExternalAccountTable extends React.Component {

  constructor(props) {
    super(props);

    this.state = {

    };
    this.removeExtenalAccount = this.removeExtenalAccount.bind(this);
  }

  // remove external-account
  async removeExtenalAccount(externalAccountId) {
    const { t } = this.props;

    try {
      const accountId = await this.props.adminExternalAccountsContainer.removeExternalAccountById(externalAccountId);
      toastSuccess(t('toaster.remove_external_user_success', { accountId }));
    }
    catch (err) {
      toastError(err);
    }
  }


  render() {
    const { t, adminExternalAccountsContainer } = this.props;
    return (
      <Fragment>
        <table className="table table-bordered table-user-list">
          <thead>
            <tr>
              <th width="120px">{t('admin:user_management.authentication_provider')}</th>
              <th><code>accountId</code></th>
              <th>{t('admin:user_management.related_username')}<code>username</code></th>
              <th>
                {t('admin:user_management.password_setting')}
                <div
                  className="text-muted"
                  data-toggle="popover"
                  data-placement="top"
                  data-trigger="hover focus"
                  tabIndex="0"
                  role="button"
                  data-animation="false"
                  data-html="true"
                  data-content={t('admin:user_management.password_setting_help')}
                >
                  <small>
                    <i className="icon-question" aria-hidden="true"></i>
                  </small>
                </div>
              </th>
              <th width="100px">{t('Created')}</th>
              <th width="70px"></th>
            </tr>
          </thead>
          <tbody>
            {adminExternalAccountsContainer.state.externalAccounts.map((ea) => {
              return (
                <tr key={ea._id}>
                  <td>{ea.providerType}</td>
                  <td>
                    <strong>{ea.accountId}</strong>
                  </td>
                  <td>
                    <strong>{ea.user.username}</strong>
                  </td>
                  <td>
                    {ea.user.password
                      ? (
                        <span className="label label-info">
                          {t('admin:user_management.set')}
                        </span>
                      )
                      : (
                        <span className="label label-warning">
                          {t('admin:user_management.unset')}
                        </span>
                      )
                    }
                  </td>
                  <td>{dateFnsFormat(new Date(ea.createdAt), 'yyyy-MM-dd')}</td>
                  <td>
                    <div className="btn-group admin-user-menu">
                      <button type="button" className="btn btn-default btn-sm dropdown-toggle" data-toggle="dropdown">
                        <i className="icon-settings"></i> <span className="caret"></span>
                      </button>
                      <ul className="dropdown-menu" role="menu">
                        <li className="dropdown-header">{t('admin:user_management.user_table.edit_menu')}</li>
                        <li>
                          <a role="button" onClick={() => { return this.removeExtenalAccount(ea._id) }}>
                            <i className="icon-fw icon-fire text-danger"></i> {t('Delete')}
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

import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';


class ManageExternalAccount extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
    }
  }


  render() {
    const { t } = this.props;
    return (
    <Fragment>
    <div class="col-md-9">
      <p>
        <a class="btn btn-default" href="/admin/users">
          <i class="icon-fw ti-arrow-left" aria-hidden="true"></i>
          { t('user_management.back_to_user_management') }
        </a>
      </p>

      <h2>{ t('user_management.external_account_list') }</h2>

      <table class="table table-bordered table-user-list">
        <thead>
          <tr>
            <th width="120px">{ t('user_management.authentication_provider') }</th>
            <th><code>accountId</code></th>
            <th>{ t('user_management.related_username', 'username') }</th>

            <th>
              { t('user_management.password_setting') }
              <a class="text-muted"
                  data-toggle="popover" data-placement="top"
                  data-trigger="hover focus" tabindex="0" role="button"
                  data-animation="false" data-html="true"
                  data-content="<small>{ t('user_management.password_setting_help') }</small>">
                <small>
                  <i class="icon-question" aria-hidden="true"></i>
                </small>
              </a>
            </th>
            <th width="100px">{ t('Created') }</th>
            <th width="70px"></th>
          </tr>
        </thead>
        <tbody>
            <td>
              <div class="btn-group admin-user-menu">
                <button type="button" class="btn btn-default btn-sm dropdown-toggle" data-toggle="dropdown">
                  <i class="icon-settings"></i> <span class="caret"></span>
                </button>
                <ul class="dropdown-menu" role="menu">
                  <li class="dropdown-header">{ t('user_management.edit_menu') }</li>
                  <form id="form_remove_{{ loop.index }}" action="/admin/users/external-accounts/{{ account._id.toString() }}/remove" method="post">
                    <input type="hidden" name="_csrf" value="{{ csrf() }}" />
                  </form>
                  <li>
                    <a href="javascript:form_remove_{{ loop.index }}.submit()">
                      <i class="icon-fw icon-fire text-danger"></i>
                      { t('Delete') }
                    </a>
                  </li>
                </ul>
              </div>
            </td>
          </tbody>
        </table>
      </div>
    </Fragment>
    );
  }
}

const ManageExternalAccountWrapper = (props) => {
  return createSubscribedElement(FullTextSearchManagement, props, [AppContainer]);
};

ManageExternalAccount.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
};

export default withTranslation()(ManageExternalAccountWrapper);

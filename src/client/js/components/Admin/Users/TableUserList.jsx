import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';

class TableUserList extends React.Component {

  constructor(props) {
    super(props);
  }


  render() {
    return (
      <Fragment>
        <table className="table table-default table-bordered table-user-list">
        <thead>
          <tr>
            <th width="100px">#</th>
            <th>{ t('status') }</th>
            <th><code>{ t('User') }</code></th>
            <th>{ t('Name') }</th>
            <th>{ t('Email') }</th>
            <th width="100px">{ t('Created') }</th>
            <th width="150px">{ t('Last_Login') }</th>
            <th width="70px"></th>
          </tr>
        </thead>
        <tbody>
          {% for sUser in users %}
          {% set sUserId = sUser._id.toString() %}
          <tr>
            <td>
              <img src="{{ sUser|picture }}" className="picture img-circle" />
              {% if sUser.admin %}
              <span className="label label-inverse label-admin">
              { t('administrator') }
              </span>
              {% endif %}
            </td>
            <td>
              <span className="label {{ css.userStatus(sUser) }}">
                {{ consts.userStatus[sUser.status] }}
              </span>
            </td>
            <td>
              <strong>{{ sUser.username }}</strong>
            </td>
            <td>{{ sUser.name }}</td>
            <td>{{ sUser.email }}</td>
            <td>{{ sUser.createdAt|date('Y-m-d', sUser.createdAt.getTimezoneOffset()) }}</td>
            <td>
              {% if sUser.lastLoginAt %}
                {{ sUser.lastLoginAt|date('Y-m-d H:i', sUser.createdAt.getTimezoneOffset()) }}
              {% endif %}
            </td>
            <td>
              <div className="btn-group admin-user-menu">
                <button type="button" className="btn btn-sm btn-default dropdown-toggle" data-toggle="dropdown">
                  <i className="icon-settings"></i> <span className="caret"></span>
                </button>
                <ul className="dropdown-menu" role="menu">
                  <li className="dropdown-header">{ t('user_management.edit_menu') }</li>
                  <li>
                    <a href="#"
                        data-user-id="{{ sUserId }}"
                        data-user-email="{{ sUser.email }}"
                        data-target="#admin-password-reset-modal"
                        data-toggle="modal">
                      <i class="icon-fw icon-key"></i>
                      { t('user_management.reset_password') }
                    </a>
                  </li>
                  <li className="divider"></li>
                  <li className="dropdown-header">{ t('status') }</li>

                  {% if sUser.status == 1 %}
                  <form id="form_activate_{{ sUserId }}" action="/admin/user/{{ sUserId }}/activate" method="post">
                    <input type="hidden" name="_csrf" value="{{ csrf() }}">
                  </form>
                  <li>
                    <a href="javascript:form_activate_{{ sUserId }}.submit()">
                      <i className="icon-fw icon-user-following"></i> { t('user_management.accept') }
                    </a>
                  </li>
                  {% endif  %}

                  {% if sUser.status == 2 %}
                  <li>
                    {% if sUser.username != user.username %}
                    <a href="javascript:form_suspend_{{ sUserId }}.submit()">
                      <i className="icon-fw icon-ban"></i>
                      { t('user_management.deactivate_account') }
                    </a>
                    {% else %}
                    <a disabled>
                      <i className="icon-fw icon-ban"></i>
                      { t('user_management.deactivate_account') }
                    </a>
                    <p className="alert alert-danger m-l-10 m-r-10 p-10">{ t("user_management.your_own") }</p>
                    {% endif %}
                  </li>
                  {% endif %}

                  {% if sUser.status == 3 %}
                  <form id="form_activate_{{ sUserId }}" action="/admin/user/{{ sUserId }}/activate" method="post">
                    <input type="hidden" name="_csrf" value="{{ csrf() }}">
                  </form>
                  <form id="form_remove_{{ sUserId }}" action="/admin/user/{{ sUserId }}/remove" method="post">
                    <input type="hidden" name="_csrf" value="{{ csrf() }}">
                  </form>
                  <li>
                    <a href="javascript:form_activate_{{ sUserId }}.submit()">
                      <i className="icon-fw icon-action-redo"></i> { t('Undo') }
                    </a>
                  </li>
                  <li>
                    {# label は同じだけど、こっちは論理削除 #}
                    <a href="javascript:form_remove_{{ sUserId }}.submit()">
                      <i className="icon-fw icon-fire text-danger"></i> { t('Delete') }
                    </a>
                  </li>
                  {% endif %}

                  {% if sUser.status == 1 || sUser.status == 5 %}
                  <form id="form_removeCompletely_{{ sUserId }}" action="/admin/user/{{ sUser._id.toString() }}/removeCompletely" method="post">
                    <input type="hidden" name="_csrf" value="{{ csrf() }}">
                  </form>
                  <li class="dropdown-button">
                    {# label は同じだけど、こっちは物理削除 #}
                    <a href="javascript:form_removeCompletely_{{ sUserId }}.submit()">
                      <i className="icon-fw icon-fire text-danger"></i> { t('Delete') }
                    </a>
                  </li>
                  {% endif %}

                  {% if sUser.status == 2 %} {# activated な人だけこのメニューを表示 #}
                  <li className="divider"></li>
                  <li className="dropdown-header">{ t('user_management.administrator_menu') }</li>

                  {% if sUser.admin %}
                  <form id="form_removeFromAdmin_{{ sUserId }}" action="/admin/user/{{ sUser._id.toString() }}/removeFromAdmin" method="post">
                    <input type="hidden" name="_csrf" value="{{ csrf() }}">
                  </form>
                  <li>
                    {% if sUser.username != user.username %}
                      <a href="javascript:form_removeFromAdmin_{{ sUserId }}.submit()">
                        <i className="icon-fw icon-user-unfollow"></i> { t('user_management.remove_admin_access') }
                      </a>
                    {% else %}
                      <a disabled>
                        <i className="icon-fw icon-user-unfollow"></i> { t('user_management.remove_admin_access') }
                      </a>
                      <p className="alert alert-danger m-l-10 m-r-10 p-10">{ t('user_management.cannot_remove') }</p>
                    {% endif %}
                  </li>
                  {% else %}
                  <form id="form_makeAdmin_{{ sUserId }}" action="/admin/user/{{ sUser._id.toString() }}/makeAdmin" method="post">
                    <input type="hidden" name="_csrf" value="{{ csrf() }}">
                  </form>
                  <li>
                    <a href="javascript:form_makeAdmin_{{ sUserId }}.submit()">
                      <i className="icon-fw icon-magic-wand"></i> { t('user_management.give_admin_access') }
                    </a>
                  </li>
                  {% endif %}

                  {% endif %}
                </ul>
              </div>
            </td>
          </tr>
          {% endfor %}
        </tbody>
      </table>
      </Fragment>
    );
  }
}

const TableUserListWrapper = (props) => {
  return createSubscribedElement(TableUserList, props, [AppContainer]);
};

TableUserList.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
};

export default withTranslation()(TableUserListWrapper);

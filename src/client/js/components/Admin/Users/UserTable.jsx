import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import dateFnsFormat from 'date-fns/format';

import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';

class UserTable extends React.Component {

  constructor(props) {
    super(props);

    this.state = {

    };
  }


  render() {
    const { t } = this.props;

    return (
      <Fragment>
        <h2>{ t('User_Management') }</h2>

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
            {this.props.users.map((user) => {
              return (
                <tr key={user._id}>
                  <td>
                    <img src={this.props.user} className="picture img-circle" />
                  </td>
                  <td>
                    <span className="label">
                      {user.status}
                    </span>
                  </td>
                  <td>
                    <strong>{user.username}</strong>
                  </td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{dateFnsFormat(new Date(user.createdAt), 'YYYY-MM-DD')}</td>
                  <td>
                    { user.lastLoginAt && <span>{dateFnsFormat(new Date(user.lastLoginAt), 'YYYY-MM-DD HH:MM')}</span> }
                  </td>
                  <td>
                    <div className="btn-group admin-user-menu">
                      <button type="button" className="btn btn-sm btn-default dropdown-toggle" data-toggle="dropdown">
                        <i className="icon-settings"></i> <span className="caret"></span>
                      </button>
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

const UserTableWrapper = (props) => {
  return createSubscribedElement(UserTable, props, [AppContainer]);
};

UserTable.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,

  users: PropTypes.array,
  user: PropTypes.object.isRequired,

};

export default withTranslation()(UserTableWrapper);

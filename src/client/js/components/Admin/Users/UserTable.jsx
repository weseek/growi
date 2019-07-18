import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';

class UserTable extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      users: this.props.users,
    };

    this.onDelete = this.onDelete.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      users: nextProps.users,
    });
  }

  onDelete(e) {
    const { target } = e;
    const userId = target.getAttribute('data-user-id');
    const user = this.state.users.find((user) => {
      return user._id === userId;
    });

    this.props.onDelete(user);
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
              <th width="70px">
                <div className="btn-group admin-user-menu">
                  <button type="button" className="btn btn-sm btn-default dropdown-toggle" data-toggle="dropdown">
                    <i className="icon-settings"></i> <span className="caret"></span>
                  </button>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {this.state.users.map((user) => {
              return (
                <tr key={user._id}>
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

  users: PropTypes.arrayOf(PropTypes.object).isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default withTranslation()(UserTableWrapper);

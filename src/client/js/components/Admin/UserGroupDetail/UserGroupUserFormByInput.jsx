import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { toastSuccess, toastError } from '../../../util/apiNotification';

class UserGroupUserFormByInput extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      username: '',
    };

    this.xss = window.xss;

    this.changeUsername = this.changeUsername.bind(this);
    this.addUserBySubmit = this.addUserBySubmit.bind(this);
  }

  changeUsername(e) {
    this.setState({ username: e.target.value });
  }

  async addUserBySubmit(e) {
    e.preventDefault();
    const { username } = this.state;

    try {
      const res = await this.props.addUserByUsername(username);
      const { user, userGroup, userGroupRelation } = res.data;
      this.props.onAdd(user, userGroup, userGroupRelation);
      toastSuccess(`Added "${this.xss.process(username)}"`);
      this.setState({ username: '' });
      this.props.onClose();
    }
    catch (err) {
      toastError(new Error(`Unable to add "${this.xss.process(username)}"`));
    }
  }

  render() {
    const { t } = this.props;

    return (
      <form className="form-inline" onSubmit={this.addUserBySubmit}>
        <div className="form-group">
          <input
            type="text"
            name="username"
            className="form-control input-sm"
            placeholder={t('User Name')}
            value={this.state.username}
            onChange={this.changeUsername}
          />
        </div>
        <button type="submit" className="btn btn-sm btn-success">{ t('Add') }</button>
      </form>
    );
  }

}

UserGroupUserFormByInput.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  onClose: PropTypes.func.isRequired,
  addUserByUsername: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
};

export default withTranslation()(UserGroupUserFormByInput);

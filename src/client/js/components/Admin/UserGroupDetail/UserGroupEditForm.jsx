import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import dateFnsFormat from 'date-fns/format';

import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';
import { toastSuccess, toastError } from '../../../util/apiNotification';

class UserGroupEditForm extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      name: props.userGroup.name,
    };

    this.xss = window.xss;

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.validateForm = this.validateForm.bind(this);
  }

  handleChange(event) {
    this.setState({
      name: event.target.value,
    });
  }

  async handleSubmit(e) {
    e.preventDefault();

    try {
      const res = await this.props.appContainer.apiv3.put(`/user-groups/${this.props.userGroup._id}`, {
        name: this.state.name,
      });

      toastSuccess(`Updated the group name to "${this.xss.process(res.data.userGroup.name)}"`);
    }
    catch (err) {
      toastError(new Error('Unable to update the group name'));
    }
  }

  validateForm() {
    return this.state.name !== '';
  }

  render() {
    const { t } = this.props;

    return (
      <div className="m-t-20 form-box">
        <form className="form-horizontal" onSubmit={this.handleSubmit}>
          <fieldset>
            <legend>基本情報</legend>
            <div className="form-group">
              <label htmlFor="name" className="col-sm-2 control-label">{ t('Name') }</label>
              <div className="col-sm-4">
                <input className="form-control" type="text" name="name" value={this.state.name} onChange={this.handleChange} disabled={!this.validateForm()} />
              </div>
            </div>
            <div className="form-group">
              <label className="col-sm-2 control-label">{ t('Created') }</label>
              <div className="col-sm-4">
                <input className="form-control" type="text" disabled value={dateFnsFormat(new Date(this.props.userGroup.createdAt), 'yyyy-MM-dd')} />
              </div>
            </div>
            <div className="form-group">
              <div className="col-sm-offset-2 col-sm-10">
                <button type="submit" className="btn btn-primary">{ t('Update') }</button>
              </div>
            </div>
          </fieldset>
        </form>
      </div>
    );
  }

}

UserGroupEditForm.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  userGroup: PropTypes.object.isRequired,
};

/**
 * Wrapper component for using unstated
 */
const UserGroupEditFormWrapper = (props) => {
  return createSubscribedElement(UserGroupEditForm, props, [AppContainer]);
};

export default withTranslation()(UserGroupEditFormWrapper);

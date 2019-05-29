import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { apiErrorHandler, apiSuccessHandler } from '../../../util/apiNotification';

class UserGroupCreateForm extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      name: '',
    };

    this.xss = window.xss;

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.validateForm = this.validateForm.bind(this);
  }

  handleChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value,
    });
  }

  async handleSubmit(e) {
    e.preventDefault();

    try {
      const res = await this.props.crowi.apiPost('/v3/user-groups/create', {
        name: this.state.name,
      });

      if (res.ok) {
        const { userGroup, userGroupRelation } = res;
        this.props.onCreate(userGroup, userGroupRelation);
        this.setState({ name: '' });
        apiSuccessHandler({ body: `Created ${this.xss.process(userGroup.name)}` });
      }
      else {
        throw new Error('Unable to create a group');
      }
    }
    catch (err) {
      apiErrorHandler(err);
    }
  }

  validateForm() {
    return this.state.name !== '';
  }

  render() {
    const { t } = this.props;

    return (
      <div>
        <p>
          {this.props.isAclEnabled
            ? (
              <button type="button" data-toggle="collapse" className="btn btn-default" href="#createGroupForm">
                { t('user_group_management.create_group') }
              </button>
            )
            : (
              t('user_group_management.deny_create_group')
            )
          }
        </p>
        <form onSubmit={this.handleSubmit}>
          <div id="createGroupForm" className="collapse">
            <div className="form-group">
              <label htmlFor="name">{ t('user_group_management.group_name') }</label>
              <textarea
                id="name"
                name="name"
                className="form-control"
                placeholder={t('user_group_management.group_example')}
                value={this.state.name}
                onChange={this.handleChange}
              >
              </textarea>
            </div>
            <button type="submit" className="btn btn-primary" disabled={!this.validateForm()}>{ t('Create') }</button>
          </div>
          <input type="hidden" name="_csrf" defaultValue={this.props.crowi.csrfToken} />
        </form>
      </div>
    );
  }

}

UserGroupCreateForm.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  crowi: PropTypes.object.isRequired,
  isAclEnabled: PropTypes.bool,
  onCreate: PropTypes.func.isRequired,
};

export default withTranslation()(UserGroupCreateForm);

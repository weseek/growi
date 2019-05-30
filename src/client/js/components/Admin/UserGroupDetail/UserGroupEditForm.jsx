import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import dateFnsFormat from 'date-fns/format';

class UserGroupEditForm extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      name: props.userGroup.name,
    };

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
    alert(`new name is ${this.state.name}`);
    this.setState({ name: '' });

    // try {
    //   // action="/admin/user-group/{{userGroup.id}}/update"
    //   const res = await this.props.crowi.apiGet('/admin/user-groups');
    //   if (res.ok) {
    //     groups = res.userGroups;
    //   }
    //   else {
    //     throw new Error('Unable to fetch groups from server');
    //   }
    // }
    // catch (err) {
    //   this.handleError(err);
    // }
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
                <input className="form-control" type="text" disabled value={dateFnsFormat(new Date(this.props.userGroup.createdAt), 'YYYY-MM-DD')} />
              </div>
            </div>
            <div className="form-group">
              <div className="col-sm-offset-2 col-sm-10">
                <input type="hidden" name="_csrf" value="{{ csrf() }}" />
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
  userGroup: PropTypes.object.isRequired,
};

export default withTranslation()(UserGroupEditForm);

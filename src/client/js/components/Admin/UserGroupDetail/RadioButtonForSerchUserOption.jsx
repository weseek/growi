
import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

class RadioButtonForSerchUserOption extends React.Component {

  render() {
    const { t, searchType } = this.props;
    return (
      <div className="radio" key={`${searchType}Match`}>
        <input
          type="radio"
          id={`${searchType}Match`}
          className="form-check-radio"
          checked={this.props.checked}
          onChange={this.props.onChange}
        />
        <label className="text-capitalize form-check-label ml-3" htmlFor={`${searchType}Match`}>
          {t(`admin:user_group_management.add_modal.${searchType}_match`)}
        </label>
      </div>
    );
  }

}


RadioButtonForSerchUserOption.propTypes = {
  t: PropTypes.func.isRequired, // i18next

  searchType: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default withTranslation()(RadioButtonForSerchUserOption);

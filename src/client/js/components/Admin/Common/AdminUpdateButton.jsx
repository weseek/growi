import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

class AdminUpdateButton extends React.PureComponent {

  render() {
    const { t } = this.props;

    return (
      <div className="form-group my-3">
        <div className="col-xs-offset-4 col-xs-5">
          <div className="btn btn-primary" onClick={this.props.onClick}>{ t('Update') }</div>
        </div>
      </div>
    );
  }

}

AdminUpdateButton.propTypes = {
  t: PropTypes.func.isRequired, // i18next

  onClick: PropTypes.func.isRequired,
};

export default withTranslation()(AdminUpdateButton);

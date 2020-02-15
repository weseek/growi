import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

class AdminUpdateButtonRow extends React.PureComponent {

  render() {
    const { t } = this.props;

    return (
      <div className="row my-3">
          <button type="button" className="btn btn-primary" onClick={this.props.onClick} disabled={this.props.disabled}>{ t('Update') }</button>
        </div>
      <div className="offset-4 col-5">
      </div>
    );
  }

}

AdminUpdateButtonRow.propTypes = {
  t: PropTypes.func.isRequired, // i18next

  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired,
};

export default withTranslation()(AdminUpdateButtonRow);

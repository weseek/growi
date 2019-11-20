import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

class AdminUpdateButtonRow extends React.PureComponent {

  render() {
    const { t } = this.props;

    return (
      <div className="row my-3">
        <div className="col-xs-offset-4 col-xs-5">
          <button type="button" className="btn btn-primary" onClick={this.props.onClick}>{ t('Update') }</button>
        </div>
      </div>
    );
  }

}

AdminUpdateButtonRow.propTypes = {
  t: PropTypes.func.isRequired, // i18next

  onClick: PropTypes.func.isRequired,
};

export default withTranslation()(AdminUpdateButtonRow);

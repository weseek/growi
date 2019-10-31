import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import CustomizeLayoutOption from './CustomizeLayoutOption';

class CustomizeLayoutSetting extends React.Component {

  render() {
    const { t } = this.props;

    return (
      <form>
        <CustomizeLayoutOption />
        {/* TODO GW-245 create themeForm Component */}
        <div className="form-group my-3">
          <div className="col-xs-offset-4 col-xs-5">
            <div className="btn btn-primary" onClick={this.onClickSubmit}>{ t('Update') }</div>
          </div>
        </div>
      </form>
    );
  }

}

CustomizeLayoutSetting.propTypes = {
  t: PropTypes.func.isRequired, // i18next
};

export default withTranslation()(CustomizeLayoutSetting);

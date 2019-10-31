import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import loggerFactory from '@alias/logger';

import { createSubscribedElement } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import AppContainer from '../../../services/AppContainer';
import AdminCustomizeContainer from '../../../services/AdminCustomizeContainer';

import CustomizeLayoutForm from './CustomizeLayoutForm';

const logger = loggerFactory('growi:importer');


class CustomizeLayoutSetting extends React.Component {

  async onClickSubmit() {
    const { t } = this.props;

    try {
      this.props.adminCustomizeContainer.updateCustomizeLayout();
      toastSuccess(t('customize_page.update_layout_success'));
    }
    catch (err) {
      toastError(err);
      logger.error(err);
    }
  }

  render() {
    const { t } = this.props;

    return (
      <React.Fragment>
        <CustomizeLayoutForm />
        {/* TODO GW-245 create themeForm Component */}
        <div className="form-group my-3">
          <div className="col-xs-offset-4 col-xs-5">
            <div className="btn btn-primary" onClick={this.onClickSubmit}>{ t('Update') }</div>
          </div>
        </div>
      </React.Fragment>
    );
  }

}

const CustomizeLayoutSettingWrapper = (props) => {
  return createSubscribedElement(CustomizeLayoutSetting, props, [AppContainer, AdminCustomizeContainer]);
};

CustomizeLayoutSetting.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminCustomizeContainer: PropTypes.instanceOf(AdminCustomizeContainer).isRequired,
};

export default withTranslation()(CustomizeLayoutSettingWrapper);

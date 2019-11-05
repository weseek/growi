import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import loggerFactory from '@alias/logger';

import { createSubscribedElement } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import AppContainer from '../../../services/AppContainer';

import AdminCustomizeContainer from '../../../services/AdminCustomizeContainer';
import AdminUpdateButtonRow from '../Common/AdminUpdateButtonRow';
import CustomizeFunctionOption from './CustomizeFunctionOption';

const logger = loggerFactory('growi:importer');

class CustomizeBehaviorSetting extends React.Component {

  constructor(props) {
    super(props);

    this.onClickSubmit = this.onClickSubmit.bind(this);
  }

  async onClickSubmit() {
    const { t, adminCustomizeContainer } = this.props;

    try {
      await adminCustomizeContainer.updateCustomizeFunction();
      toastSuccess(t('customize_page.update_function_success'));
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
        <h2>{t('customize_page.Function')}</h2>
        <p className="well">{ t('customize_page.function_choose') }</p>
        <CustomizeFunctionOption />
        <AdminUpdateButtonRow onClick={this.onClickSubmit} />
      </React.Fragment>
    );
  }

}

const CustomizeBehaviorSettingWrapper = (props) => {
  return createSubscribedElement(CustomizeBehaviorSetting, props, [AppContainer, AdminCustomizeContainer]);
};

CustomizeBehaviorSetting.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminCustomizeContainer: PropTypes.instanceOf(AdminCustomizeContainer).isRequired,
};

export default withTranslation()(CustomizeBehaviorSettingWrapper);

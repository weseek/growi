import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import loggerFactory from '@alias/logger';

import { createSubscribedElement } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import AppContainer from '../../../services/AppContainer';

import CustomizeLayoutOptions from './CustomizeLayoutOptions';
import CustomizeThemeOptions from './CustomizeThemeOptions';
import AdminCustomizeContainer from '../../../services/AdminCustomizeContainer';
import AdminUpdateButton from '../Common/AdminUpdateButton';

const logger = loggerFactory('growi:importer');


class CustomizeLayoutSetting extends React.Component {

  constructor(props) {
    super(props);

    this.onClickSubmit = this.onClickSubmit.bind(this);
  }

  async onClickSubmit() {
    const { t, adminCustomizeContainer } = this.props;

    try {
      await adminCustomizeContainer.updateCustomizeLayoutAndTheme();
      toastSuccess(t('customize_page.update_layout_success'));
    }
    catch (err) {
      toastError(err);
      logger.error(err);
    }
  }

  renderDevAlert() {
    if (process.env.NODE_ENV === 'development') {
      return (
        <div className="alert alert-warning">
          <strong>DEBUG MESSAGE:</strong> development build では、リアルタイムプレビューが無効になります
        </div>
      );
    }
  }


  render() {
    const { t } = this.props;

    return (
      <React.Fragment>
        <h2>{t('customize_page.Layout')}</h2>
        <CustomizeLayoutOptions />
        <h2>{ t('customize_page.Theme') }</h2>
        {this.renderDevAlert()}
        <CustomizeThemeOptions />
        <AdminUpdateButton onClick={this.onClickSubmit} />
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

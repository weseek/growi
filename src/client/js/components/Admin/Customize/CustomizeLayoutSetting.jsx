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

const logger = loggerFactory('growi:importer');


class CustomizeLayoutSetting extends React.Component {

  constructor(props) {
    super(props);

    this.onClickSubmit = this.onClickSubmit.bind(this);
  }

  async onClickSubmit() {
    const { t, adminCustomizeContainer } = this.props;

    try {
      await adminCustomizeContainer.updateCustomizeLayout();
      toastSuccess(t('customize_page.update_layout_success'));
    }
    catch (err) {
      toastError(err);
      logger.error(err);
    }
  }

  renderDevAlert() {
    return (
      <div className="alert alert-warning">
        <strong>DEBUG MESSAGE:</strong> development build では、リアルタイムプレビューが無効になります
      </div>
    );
  }

  render() {
    const { t } = this.props;
    const { NODE_ENV } = this.props.appContainer.config.env;

    return (
      <React.Fragment>
        <h2>{t('customize_page.Layout')}</h2>
        <CustomizeLayoutOptions />
        <h2>{ t('customize_page.Theme') }</h2>
        {NODE_ENV === 'development' && (this.renderDevAlert())}
        <CustomizeThemeOptions />
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

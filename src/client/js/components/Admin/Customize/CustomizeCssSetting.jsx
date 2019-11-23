import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import loggerFactory from '@alias/logger';

import { createSubscribedElement } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import AppContainer from '../../../services/AppContainer';

import AdminCustomizeContainer from '../../../services/AdminCustomizeContainer';
import AdminUpdateButtonRow from '../Common/AdminUpdateButtonRow';
import CustomCssEditor from '../CustomCssEditor';

const logger = loggerFactory('growi:Customize');

class CustomizeCssSetting extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      editorInputValue: '',
    };

    this.onClickSubmit = this.onClickSubmit.bind(this);
  }

  componentDidMount() {
    const { customizeCss } = this.props.appContainer.getConfig();
    this.setState({ editorInputValue: customizeCss || '' });
  }

  async onClickSubmit() {
    const { t, adminCustomizeContainer } = this.props;

    try {
      await adminCustomizeContainer.updateCustomizeCss();
      toastSuccess(t('customize_page.update_customCss_success'));
    }
    catch (err) {
      toastError(err);
      logger.error(err);
    }
  }

  render() {
    const { t, adminCustomizeContainer } = this.props;

    return (
      <React.Fragment>
        <h2>{t('customize_page.Custom CSS')}</h2>
        <p className="well">
          { t('customize_page.write_CSS') }<br />
          { t('customize_page.reflect_change') }
        </p>
        <div className="form-group">
          <div className="col-xs-12">
            <CustomCssEditor
              // The value passed must be immutable
              value={this.state.editorInputValue}
              onChange={(inputValue) => { adminCustomizeContainer.changeCustomizeCss(inputValue) }}
            />
          </div>
          <div className="col-xs-12">
            <p className="help-block text-right">
              <i className="fa fa-fw fa-keyboard-o" aria-hidden="true" />
              { t('customize_page.ctrl_space') }
            </p>
          </div>
        </div>

        <AdminUpdateButtonRow onClick={this.onClickSubmit} />
      </React.Fragment>
    );
  }

}

const CustomizeCssSettingWrapper = (props) => {
  return createSubscribedElement(CustomizeCssSetting, props, [AppContainer, AdminCustomizeContainer]);
};

CustomizeCssSetting.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminCustomizeContainer: PropTypes.instanceOf(AdminCustomizeContainer).isRequired,
};

export default withTranslation()(CustomizeCssSettingWrapper);

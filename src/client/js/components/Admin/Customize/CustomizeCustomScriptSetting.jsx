import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import loggerFactory from '@alias/logger';

import { createSubscribedElement } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import AppContainer from '../../../services/AppContainer';

import AdminCustomizeContainer from '../../../services/AdminCustomizeContainer';
import AdminUpdateButtonRow from '../Common/AdminUpdateButtonRow';
import CustomScriptEditor from '../CustomScriptEditor';

const logger = loggerFactory('growi:customizeScript');

class CustomizeCustomScriptSetting extends React.Component {

  constructor(props) {
    super(props);

    this.onClickSubmit = this.onClickSubmit.bind(this);
  }

  async onClickSubmit() {
    const { t, adminCustomizeContainer } = this.props;

    try {
      await adminCustomizeContainer.updateCustomizeScript();
      toastSuccess(t('customize_page.update_script_success'));
    }
    catch (err) {
      toastError(err);
      logger.error(err);
    }
  }

  getExampleCode() {
    return `console.log($('.main-container'));
    window.addEventListener('load', (event) => {
      console.log('config: ', appContainer.config);
    });
    `;
  }

  render() {
    const { t, appContainer, adminCustomizeContainer } = this.props;

    return (
      <React.Fragment>
        <h2>{t('customize_page.Custom script')}</h2>
        <p className="well">
          { t('customize_page.write_java') }<br />
          { t('customize_page.reflect_change') }
        </p>

        <p className="help-block">
          Placeholders:<br />
          (Available after <code>load</code> event)
          <dl className="dl-horizontal">
            <dt><code>$</code></dt>
            <dd>jQuery instance</dd>
            <dt><code>appContainer</code></dt>
            <dd>GROWI App <a href="https://github.com/jamiebuilds/unstated">Unstated Container</a></dd>
            <dt><code>growiRenderer</code></dt>
            <dd>GROWI Renderer origin instance</dd>
            <dt><code>growiPlugin</code></dt>
            <dd>GROWI Plugin Manager instance</dd>
            <dt><code>Crowi</code></dt>
            <dd>Crowi legacy instance (jQuery based)</dd>
          </dl>
        </p>

        <p className="help-block">
          Examples:
          <pre className="hljs"><code>{this.getExampleCode()}</code></pre>
        </p>

        <div className="form-group">
          <div className="col-xs-12">
            <CustomScriptEditor
              // The value passed must be immutable
              value={appContainer.config.customizeScript}
              onChange={(inputValue) => { adminCustomizeContainer.changeCustomizeScript(inputValue) }}
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

const CustomizeCustomScriptSettingWrapper = (props) => {
  return createSubscribedElement(CustomizeCustomScriptSetting, props, [AppContainer, AdminCustomizeContainer]);
};

CustomizeCustomScriptSetting.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminCustomizeContainer: PropTypes.instanceOf(AdminCustomizeContainer).isRequired,
};

export default withTranslation()(CustomizeCustomScriptSettingWrapper);

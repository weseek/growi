import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import AppContainer from '../../../services/AppContainer';

import AdminCustomizeContainer from '../../../services/AdminCustomizeContainer';
import AdminUpdateButtonRow from '../Common/AdminUpdateButtonRow';
import CustomScriptEditor from '../CustomScriptEditor';

class CustomizeScriptSetting extends React.Component {

  constructor(props) {
    super(props);

    this.onClickSubmit = this.onClickSubmit.bind(this);
  }

  async onClickSubmit() {
    const { t, adminCustomizeContainer } = this.props;

    try {
      await adminCustomizeContainer.updateCustomizeScript();
      toastSuccess(t('toaster.update_successed', { target: t('admin:customize_setting.custom_script') }));
    }
    catch (err) {
      toastError(err);
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
    const { t, adminCustomizeContainer } = this.props;

    return (
      <React.Fragment>
        <h2 className="admin-setting-header">{t('admin:customize_setting.custom_script')}</h2>
        <p className="well">
          {t('admin:customize_setting.write_java')}<br />
          {t('admin:customize_setting.reflect_change')}
        </p>

        <div className="help-block">
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
        </div>

        <div className="help-block">
          Examples:
          <pre className="hljs"><code>{this.getExampleCode()}</code></pre>
        </div>

        <div className="form-group">
          <div className="col-xs-12">
            <CustomScriptEditor
              value={adminCustomizeContainer.state.currentCustomizeScript || ''}
              onChange={(inputValue) => { adminCustomizeContainer.changeCustomizeScript(inputValue) }}
            />
          </div>
          <div className="col-xs-12">
            <p className="help-block text-right">
              <i className="fa fa-fw fa-keyboard-o" aria-hidden="true" />
              {t('admin:customize_setting.ctrl_space')}
            </p>
          </div>
        </div>

        <AdminUpdateButtonRow onClick={this.onClickSubmit} disabled={adminCustomizeContainer.state.retrieveError != null} />
      </React.Fragment>
    );
  }

}

const CustomizeScriptSettingWrapper = (props) => {
  return createSubscribedElement(CustomizeScriptSetting, props, [AppContainer, AdminCustomizeContainer]);
};

CustomizeScriptSetting.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminCustomizeContainer: PropTypes.instanceOf(AdminCustomizeContainer).isRequired,
};

export default withTranslation()(CustomizeScriptSettingWrapper);

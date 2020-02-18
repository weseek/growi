import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { Card, CardBody } from 'reactstrap';

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
        <Card className="card well">
          <CardBody className="px-0 py-2">
            {t('admin:customize_setting.write_java')}<br />
            {t('admin:customize_setting.reflect_change')}
          </CardBody>
        </Card>

        <div className="form-text text-muted">
          Placeholders:<br />
          (Available after <code>load</code> event)
          <dl className="row">
            <dt className="col-2 text-right"><code>$</code></dt>
            <dd className="col-10">jQuery instance</dd>
            <dt className="col-2 text-right"><code>appContainer</code></dt>
            <dd className="col-10">GROWI App <a href="https://github.com/jamiebuilds/unstated">Unstated Container</a></dd>
            <dt className="col-2 text-right"><code>growiRenderer</code></dt>
            <dd className="col-10">GROWI Renderer origin instance</dd>
            <dt className="col-2 text-right"><code>growiPlugin</code></dt>
            <dd className="col-10">GROWI Plugin Manager instance</dd>
            <dt className="col-2 text-right"><code>Crowi</code></dt>
            <dd className="col-10">Crowi legacy instance (jQuery based)</dd>
          </dl>
        </div>

        <div className="form-text text-muted">
          Examples:
          <pre className="hljs"><code>{this.getExampleCode()}</code></pre>
        </div>

        <div className="form-group">
          <div className="col-12">
            <CustomScriptEditor
              value={adminCustomizeContainer.state.currentCustomizeScript || ''}
              onChange={(inputValue) => { adminCustomizeContainer.changeCustomizeScript(inputValue) }}
            />
          </div>
          <div className="col-12">
            <p className="form-text text-muted text-right">
              <i className="fa fa-fw fa-keyboard-o" aria-hidden="true" />
              {t('admin:customize_setting.ctrl_space')}
            </p>
          </div>
        </div>

        <div className="form-group col-12 m-3">
          <div className="offset-4 col-8">
            <AdminUpdateButtonRow onClick={this.onClickSubmit} disabled={adminCustomizeContainer.state.retrieveError != null} />
          </div>
        </div>
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

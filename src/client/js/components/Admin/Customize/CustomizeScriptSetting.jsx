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
        <div className="row">
          <div className="col-12">
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
            </div>
            <table className="table table-borderless table-sm form-text text-muted offset-1 col-11">
              <tbody>
                <tr>
                  <th className="text-right"><code>$</code></th>
                  <td>jQuery instance</td>
                </tr>
                <tr>
                  <th className="text-right"><code>appContainer</code></th>
                  <td>GROWI App <a href="https://github.com/jamiebuilds/unstated">unstated container</a></td>
                </tr>
                <tr>
                  <th className="text-right"><code>growiRenderer</code></th>
                  <td>GROWI Renderer origin instance</td>
                </tr>
                <tr>
                  <th className="text-right"><code>growiPlugin</code></th>
                  <td>GROWI Plugin Manager instance</td>
                </tr>
                <tr>
                  <th className="text-right"><code>Crowi</code></th>
                  <td>Crowi legacy instance (jQuery based)</td>
                </tr>
              </tbody>
            </table>

            <div className="form-text text-muted">
              Examples:
              <pre className="hljs"><code>{this.getExampleCode()}</code></pre>
            </div>

            <div className="form-group">
              <CustomScriptEditor
                value={adminCustomizeContainer.state.currentCustomizeScript || ''}
                onChange={(inputValue) => { adminCustomizeContainer.changeCustomizeScript(inputValue) }}
              />
              <p className="form-text text-muted text-right">
                <i className="fa fa-fw fa-keyboard-o" aria-hidden="true" />
                {t('admin:customize_setting.ctrl_space')}
              </p>
            </div>

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

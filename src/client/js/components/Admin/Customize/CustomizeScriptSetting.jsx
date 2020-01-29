import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { Card, CardBody } from 'reactstrap';

import loggerFactory from '@alias/logger';

import { createSubscribedElement } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import AppContainer from '../../../services/AppContainer';

import AdminCustomizeContainer from '../../../services/AdminCustomizeContainer';
import AdminUpdateButtonRow from '../Common/AdminUpdateButtonRow';
import CustomScriptEditor from '../CustomScriptEditor';

const logger = loggerFactory('growi:customizeScript');

class CustomizeScriptSetting extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      editorInputValue: '',
    };

    this.onClickSubmit = this.onClickSubmit.bind(this);
  }

  componentDidMount() {
    const { customizeScript } = this.props.appContainer.getConfig();
    this.setState({ editorInputValue: customizeScript || '' });
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
    const { t, adminCustomizeContainer } = this.props;

    return (
      <React.Fragment>
        <h2 className="admin-setting-header">{t('customize_page.Custom script')}</h2>
        <Card className="card-well my-3">
          <CardBody>
            { t('customize_page.write_java') }<br />
            { t('customize_page.reflect_change') }
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

        <div className="form-text">
          Examples:
          <pre className="hljs"><code>{this.getExampleCode()}</code></pre>
        </div>

        <div className="form-group">
          <div className="col-12">
            <CustomScriptEditor
              // The value passed must be immutable
              value={this.state.editorInputValue}
              onChange={(inputValue) => { adminCustomizeContainer.changeCustomizeScript(inputValue) }}
            />
          </div>
          <div className="col-12">
            <p className="help-block text-right">
              <i className="fa fa-fw fa-keyboard-o" aria-hidden="true" />
              { t('customize_page.ctrl_space') }
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

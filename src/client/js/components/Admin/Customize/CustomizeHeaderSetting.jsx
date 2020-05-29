import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { Card, CardBody } from 'reactstrap';

import { createSubscribedElement } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import AppContainer from '../../../services/AppContainer';

import AdminCustomizeContainer from '../../../services/AdminCustomizeContainer';
import AdminUpdateButtonRow from '../Common/AdminUpdateButtonRow';
import CustomHeaderEditor from '../CustomHeaderEditor';

class CustomizeHeaderSetting extends React.Component {

  constructor(props) {
    super(props);

    this.onClickSubmit = this.onClickSubmit.bind(this);
  }

  async onClickSubmit() {
    const { t, adminCustomizeContainer } = this.props;

    try {
      await adminCustomizeContainer.updateCustomizeHeader();
      toastSuccess(t('toaster.update_successed', { target: t('admin:customize_setting.custom_header') }));
    }
    catch (err) {
      toastError(err);
    }
  }

  render() {
    const { t, adminCustomizeContainer } = this.props;

    return (
      <React.Fragment>
        <div className="row">
          <div className="col-12">
            <h2 className="admin-setting-header">{t('admin:customize_setting.custom_header')}</h2>

            <Card className="card well my-3">
              <CardBody className="px-0 py-2">
                <span
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{ __html: t('admin:customize_setting.custom_header_detail') }}
                />
              </CardBody>
            </Card>
            <div className="form-text text-muted">
              { t('Example') }:
              <pre className="hljs">
                {/* eslint-disable-next-line react/no-unescaped-entities */}
                <code className="text-wrap">&lt;script src="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@9.13.0/build/languages/yaml.min.js"
                defer&gt;&lt;/script&gt;
                </code>
              </pre>
            </div>

            <div className="form-group">
              <CustomHeaderEditor
                value={adminCustomizeContainer.state.currentCustomizeHeader || ''}
                onChange={(inputValue) => { adminCustomizeContainer.changeCustomizeHeader(inputValue) }}
              />
              <p className="form-text text-muted text-right">
                <i className="fa fa-fw fa-keyboard-o" aria-hidden="true"></i>
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

const CustomizeHeaderSettingWrapper = (props) => {
  return createSubscribedElement(CustomizeHeaderSetting, props, [AppContainer, AdminCustomizeContainer]);
};

CustomizeHeaderSetting.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminCustomizeContainer: PropTypes.instanceOf(AdminCustomizeContainer).isRequired,
};

export default withTranslation()(CustomizeHeaderSettingWrapper);

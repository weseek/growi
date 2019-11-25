import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import loggerFactory from '@alias/logger';

import { createSubscribedElement } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import AppContainer from '../../../services/AppContainer';

import AdminCustomizeContainer from '../../../services/AdminCustomizeContainer';
import AdminUpdateButtonRow from '../Common/AdminUpdateButtonRow';
import CustomHeaderEditor from '../CustomHeaderEditor';

const logger = loggerFactory('growi:Customize');

class CustomizeHeaderSetting extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      editorInputValue: '',
    };

    this.onClickSubmit = this.onClickSubmit.bind(this);
  }

  componentDidMount() {
    const { customizeHeader } = this.props.appContainer.getConfig();
    this.setState({ editorInputValue: customizeHeader || '' });
  }

  async onClickSubmit() {
    const { t, adminCustomizeContainer } = this.props;

    try {
      await adminCustomizeContainer.updateCustomizeHeader();
      toastSuccess(t('customize_page.update_customHeader_success'));
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
        <h2 className="admin-setting-header">{t('customize_page.custom_header')}</h2>

        <p
          className="well"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: t('customize_page.custom_header_detail') }}
        />

        <div className="help-block">
          { t('Example') }:
          <pre className="hljs">
            {/* eslint-disable-next-line react/no-unescaped-entities */}
            <code>&lt;script src="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@9.13.0/build/languages/yaml.min.js" defer&gt;&lt;/script&gt;</code>
          </pre>
        </div>

        <div className="col-xs-12">
          <CustomHeaderEditor
            // The value passed must be immutable
            value={this.state.editorInputValue}
            onChange={(inputValue) => { adminCustomizeContainer.changeCustomizeHeader(inputValue) }}
          />
        </div>
        <div className="col-xs-12">
          <p className="help-block text-right">
            <i className="fa fa-fw fa-keyboard-o" aria-hidden="true"></i>
            { t('customize_page.ctrl_space') }
          </p>
        </div>

        <AdminUpdateButtonRow onClick={this.onClickSubmit} />
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

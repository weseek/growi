/* eslint-disable react/no-danger */
import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import loggerFactory from '@alias/logger';

import { createSubscribedElement } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import AppContainer from '../../../services/AppContainer';

import AdminCustomizeContainer from '../../../services/AdminCustomizeContainer';
import AdminUpdateButtonRow from '../Common/AdminUpdateButtonRow';
import AdminDropdownOption from '../Common/AdminDropdownOption';

const logger = loggerFactory('growi:importer');

class CustomizeHighlightSetting extends React.Component {

  constructor(props) {
    super(props);

    this.onClickSubmit = this.onClickSubmit.bind(this);
  }

  async onClickSubmit() {
    const { t } = this.props;

    try {
      // await adminCustomizeContainer.updateCustomizeFunction();
      toastSuccess(t('customize_page.update_highlight_success'));
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
        <h2>{t('customize_page.Code Highlight')}</h2>
        <AdminDropdownOption
          label={t('customize_page.Theme')}
          value={adminCustomizeContainer.state.currenthighlightJsStyle}
          onChange={(value) => { adminCustomizeContainer.switchRecentCreatedLimit(value) }}
          options={[10, 30, 50]}
        >
          <p className="help-block text-warning"><span dangerouslySetInnerHTML={{ __html:  t('customize_page.nocdn_desc') }} /></p>
        </AdminDropdownOption>
        <div className="form-group row">
          <div className="col-xs-offset-3 col-xs-9 text-left">
            <div className="checkbox checkbox-success">
              <input
                type="checkbox"
                id="highlightBorder"
                checked={adminCustomizeContainer.state.isHighlightJsStyleBorderEnabled}
                onChange={() => { adminCustomizeContainer.switchHighlightJsStyleBorder() }}
              />
              <label htmlFor="highlightBorder">
                <strong>Border</strong>
              </label>
            </div>
          </div>
        </div>
        <p className="help-block">
            Examples:
          <div className="wiki">
            <pre className={`hljs ${adminCustomizeContainer.highlightJsStyleBorder && 'hljs-no-border'}`}>
              <code className="highlightjs-demo">
                highlight
              </code>
            </pre>
          </div>
        </p>

        <AdminUpdateButtonRow onClick={this.onClickSubmit} />
      </React.Fragment>
    );
  }

}

const CustomizeHighlightSettingWrapper = (props) => {
  return createSubscribedElement(CustomizeHighlightSetting, props, [AppContainer, AdminCustomizeContainer]);
};

CustomizeHighlightSetting.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminCustomizeContainer: PropTypes.instanceOf(AdminCustomizeContainer).isRequired,
};

export default withTranslation()(CustomizeHighlightSettingWrapper);

/* eslint-disable no-useless-escape */
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

const logger = loggerFactory('growi:customizeHighlight');

class CustomizeHighlightSetting extends React.Component {

  constructor(props) {
    super(props);

    this.onClickSubmit = this.onClickSubmit.bind(this);
  }

  componentDidMount() {
    // TODO GW-524 fetch highlightTheme option
  }

  async onClickSubmit() {
    const { t, adminCustomizeContainer } = this.props;

    try {
      await adminCustomizeContainer.updateHighlightJsStyle();
      toastSuccess(t('customize_page.update_highlight_success'));
    }
    catch (err) {
      toastError(err);
      logger.error(err);
    }
  }

  getDemoFunction() {
    return `function $initHighlight(block, cls) {
    try {

      if (cls.search(/\bno\-highlight\b/) !== -1) {
        return \`\${process(block, true, 0x0F)} class="\${cls}"\`;
      }
    }
    catch (e) {
      /* handle exception */
    }
    for (let i = 0 / 2; i < classes.length; i++) {
      if (checkCondition(classes[i]) === undefined) { console.log('undefined') }
    }
  };`;
  }

  render() {
    const { t, adminCustomizeContainer } = this.props;

    return (
      <React.Fragment>
        <h2>{t('customize_page.Code Highlight')}</h2>

        <div className="form-group row">
          <div className="col-xs-offset-2 col-xs-8 text-left">
            <AdminDropdownOption
              label={t('customize_page.Theme')}
              selectedValue={adminCustomizeContainer.state.currentHighlightJsStyle}
              onChangeValue={(value) => { adminCustomizeContainer.switchHighlightJsStyle(value) }}
              // TODO GW-524 hand over theme option
              options={[10, 30, 50]}
            >
              {/* eslint-disable-next-line react/no-danger */}
              <p className="help-block text-warning"><span dangerouslySetInnerHTML={{ __html:  t('customize_page.nocdn_desc') }} /></p>
            </AdminDropdownOption>
          </div>
        </div>

        <div className="form-group row">
          <div className="col-xs-offset-2 col-xs-8 text-left">
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

        <div className="help-block">
          <label>Examples:</label>
          <div className="wiki">
            <pre className={`hljs ${!adminCustomizeContainer.state.isHighlightJsStyleBorderEnabled && 'hljs-no-border'}`}>
              <code className="highlightjs-demo">
                {this.getDemoFunction()}
              </code>
            </pre>
          </div>
        </div>

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

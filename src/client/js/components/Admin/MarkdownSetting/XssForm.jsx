import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import loggerFactory from '@alias/logger';

import { createSubscribedElement } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';
import { tags, attrs } from '../../../../../lib/service/xss/recommended-whitelist';

import AppContainer from '../../../services/AppContainer';
import AdminMarkDownContainer from '../../../services/AdminMarkDownContainer';

import WhiteListInput from './WhiteListInput';

const logger = loggerFactory('growi:importer');

class XssForm extends React.Component {

  constructor(props) {
    super(props);

    this.onClickSubmit = this.onClickSubmit.bind(this);
  }

  async onClickSubmit() {
    const { t } = this.props;

    try {
      await this.props.adminMarkDownContainer.updateXssSetting();
      toastSuccess(t('toaster.update_successed', { target: t('admin:markdown_setting.xss_header') }));
    }
    catch (err) {
      toastError(err);
      logger.error(err);
    }
  }

  xssOptions() {
    const { t, adminMarkDownContainer } = this.props;
    const { xssOption } = adminMarkDownContainer.state;

    return (
      <fieldset className="row col-xs-12 my-3">
        <div className="col-xs-4 radio radio-primary">
          <input
            type="radio"
            id="xssOption1"
            name="XssOption"
            checked={xssOption === 1}
            onChange={() => { adminMarkDownContainer.setState({ xssOption: 1 }) }}
          />
          <label htmlFor="xssOption1">
            <p className="font-weight-bold">{t('admin:markdown_setting.xss_options.ignore_all_tags')}</p>
            <div className="m-t-15">
              {t('admin:markdown_setting.xss_options.ignore_all_tags_desc')}
            </div>
          </label>
        </div>

        <div className="col-xs-4 radio radio-primary">
          <input
            type="radio"
            id="xssOption2"
            name="XssOption"
            checked={xssOption === 2}
            onChange={() => { adminMarkDownContainer.setState({ xssOption: 2 }) }}
          />
          <label htmlFor="xssOption2">
            <p className="font-weight-bold">{t('admin:markdown_setting.xss_options.recommended_setting')}</p>
            <div className="m-t-15">
              <div className="d-flex justify-content-between">
                {t('admin:markdown_setting.xss_options.tag_names')}
              </div>
              <textarea
                className="form-control xss-list"
                name="recommendedTags"
                rows="6"
                cols="40"
                readOnly
                defaultValue={tags}
              />
            </div>
            <div className="m-t-15">
              <div className="d-flex justify-content-between">
                {t('admin:markdown_setting.xss_options.tag_attributes')}
              </div>
              <textarea
                className="form-control xss-list"
                name="recommendedAttrs"
                rows="6"
                cols="40"
                readOnly
                defaultValue={attrs}
              />
            </div>
          </label>
        </div>

        <div className="col-xs-4 radio radio-primary">
          <input
            type="radio"
            id="xssOption3"
            name="XssOption"
            checked={xssOption === 3}
            onChange={() => { adminMarkDownContainer.setState({ xssOption: 3 }) }}
          />
          <label htmlFor="xssOption3">
            <p className="font-weight-bold">{t('admin:markdown_setting.xss_options.custom_whitelist')}</p>
            <WhiteListInput />
          </label>
        </div>
      </fieldset>
    );
  }

  render() {
    const { t, adminMarkDownContainer } = this.props;
    const { isEnabledXss } = adminMarkDownContainer.state;

    return (
      <React.Fragment>
        <form className="row">
          <div className="form-group">
            <div className="col-xs-offset-4 col-xs-4 text-left">
              <div className="checkbox checkbox-success">
                <input
                  type="checkbox"
                  id="XssEnable"
                  className="form-check-input"
                  name="isEnabledXss"
                  checked={isEnabledXss}
                  onChange={adminMarkDownContainer.switchEnableXss}
                />
                <label htmlFor="XssEnable">
                  {t('admin:markdown_setting.xss_options.enable_xss_prevention')}
                </label>
              </div>
            </div>
            {isEnabledXss && this.xssOptions()}
          </div>
          <div className="form-group my-3">
            <div className="col-xs-offset-4 col-xs-5">
              <div className="btn btn-primary" onClick={this.onClickSubmit} disabled={adminMarkDownContainer.state.retrieveError != null}> {t('Update')}</div>
            </div>
          </div>
        </form>
      </React.Fragment>
    );
  }

}

const XssFormWrapper = (props) => {
  return createSubscribedElement(XssForm, props, [AppContainer, AdminMarkDownContainer]);
};

XssForm.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminMarkDownContainer: PropTypes.instanceOf(AdminMarkDownContainer).isRequired,
};

export default withTranslation()(XssFormWrapper);

import React from 'react';

import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import loggerFactory from '@alias/logger';

import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';
import { tags, attrs } from '../../../../../lib/service/xss/recommended-whitelist';

import AppContainer from '../../../services/AppContainer';
import AdminMarkDownContainer from '../../../services/AdminMarkDownContainer';
import AdminUpdateButtonRow from '../Common/AdminUpdateButtonRow';

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
      <div className="form-group col-12 my-3">
        <div className="row">
          <div className="col-md-4 col-sm-12 align-self-start mb-4">
            <div className="custom-control custom-radio ">
              <input
                type="radio"
                className="custom-control-input"
                id="xssOption1"
                name="XssOption"
                checked={xssOption === 1}
                onChange={() => { adminMarkDownContainer.setState({ xssOption: 1 }) }}
              />
              <label className="custom-control-label w-100" htmlFor="xssOption1">
                <p className="font-weight-bold">{t('admin:markdown_setting.xss_options.remove_all_tags')}</p>
                <div className="mt-4">
                  {t('admin:markdown_setting.xss_options.remove_all_tags_desc')}
                </div>
              </label>
            </div>
          </div>

          <div className="col-md-4 col-sm-12 align-self-start mb-4">
            <div className="custom-control custom-radio">
              <input
                type="radio"
                className="custom-control-input"
                id="xssOption2"
                name="XssOption"
                checked={xssOption === 2}
                onChange={() => { adminMarkDownContainer.setState({ xssOption: 2 }) }}
              />
              <label className="custom-control-label w-100" htmlFor="xssOption2">
                <p className="font-weight-bold">{t('admin:markdown_setting.xss_options.recommended_setting')}</p>
                <div className="mt-4">
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
                <div className="mt-4">
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
          </div>

          <div className="col-md-4 col-sm-12 align-self-start mb-4">
            <div className="custom-control custom-radio">
              <input
                type="radio"
                className="custom-control-input"
                id="xssOption3"
                name="XssOption"
                checked={xssOption === 3}
                onChange={() => { adminMarkDownContainer.setState({ xssOption: 3 }) }}
              />
              <label className="custom-control-label w-100" htmlFor="xssOption3">
                <p className="font-weight-bold">{t('admin:markdown_setting.xss_options.custom_whitelist')}</p>
                <WhiteListInput customizable />
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { t, adminMarkDownContainer } = this.props;
    const { isEnabledXss } = adminMarkDownContainer.state;

    return (
      <React.Fragment>
        <fieldset className="col-12">
          <div className="form-group">
            <div className="col-8 offset-4 my-3">
              <div className="custom-control custom-switch custom-checkbox-success">
                <input
                  type="checkbox"
                  className="custom-control-input"
                  id="XssEnable"
                  name="isEnabledXss"
                  checked={isEnabledXss}
                  onChange={adminMarkDownContainer.switchEnableXss}
                />
                <label className="custom-control-label w-100" htmlFor="XssEnable">
                  {t('admin:markdown_setting.xss_options.enable_xss_prevention')}
                </label>
              </div>
            </div>
          </div>

          <div className="col-12">
            {isEnabledXss && this.xssOptions()}
          </div>
        </fieldset>
        <AdminUpdateButtonRow onClick={this.onClickSubmit} disabled={adminMarkDownContainer.state.retrieveError != null} />
      </React.Fragment>
    );
  }

}

const XssFormWrapper = withUnstatedContainers(XssForm, [AppContainer, AdminMarkDownContainer]);

XssForm.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminMarkDownContainer: PropTypes.instanceOf(AdminMarkDownContainer).isRequired,
};

export default withTranslation()(XssFormWrapper);

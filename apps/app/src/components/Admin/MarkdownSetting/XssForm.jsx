import React from 'react';

import { useTranslation } from 'next-i18next';
import PropTypes from 'prop-types';
import { defaultSchema as sanitizeDefaultSchema } from 'rehype-sanitize';

import AdminMarkDownContainer from '~/client/services/AdminMarkDownContainer';
import { toastSuccess, toastError } from '~/client/util/toastr';
import { RehypeSanitizeOption } from '~/interfaces/rehype';
import loggerFactory from '~/utils/logger';

import { withUnstatedContainers } from '../../UnstatedUtils';
import AdminUpdateButtonRow from '../Common/AdminUpdateButtonRow';

// change module from WhiteListInput
import WhitelistInput from './WhitelistInput';

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
      toastSuccess(t('toaster.update_successed', { target: t('markdown_settings.xss_header'), ns: 'commons' }));
    }
    catch (err) {
      toastError(err);
      logger.error(err);
    }
  }

  xssOptions() {
    const { t, adminMarkDownContainer } = this.props;
    const { xssOption } = adminMarkDownContainer.state;

    const rehypeRecommendedTags = sanitizeDefaultSchema.tagNames;
    const rehypeRecommendedAttributes = JSON.stringify(sanitizeDefaultSchema.attributes);

    return (
      <div className="form-group col-12 my-3">
        <div className="row">

          <div className="col-md-6 col-sm-12 align-self-start mb-4">
            <div className="custom-control custom-radio">
              <input
                type="radio"
                className="custom-control-input"
                id="xssOption1"
                name="XssOption"
                checked={xssOption === RehypeSanitizeOption.RECOMMENDED}
                onChange={() => { adminMarkDownContainer.setState({ xssOption: RehypeSanitizeOption.RECOMMENDED }) }}
              />
              <label className="custom-control-label w-100" htmlFor="xssOption1">
                <p className="font-weight-bold">{t('markdown_settings.xss_options.recommended_setting')}</p>
                <div className="mt-4">
                  <div className="d-flex justify-content-between">
                    {t('markdown_settings.xss_options.tag_names')}
                  </div>
                  <textarea
                    className="form-control xss-list"
                    name="recommendedTags"
                    rows="6"
                    cols="40"
                    readOnly
                    defaultValue={rehypeRecommendedTags}
                  />
                </div>
                <div className="mt-4">
                  <div className="d-flex justify-content-between">
                    {t('markdown_settings.xss_options.tag_attributes')}
                  </div>
                  <textarea
                    className="form-control xss-list"
                    name="recommendedAttrs"
                    rows="6"
                    cols="40"
                    readOnly
                    defaultValue={rehypeRecommendedAttributes}
                  />
                </div>
              </label>
            </div>
          </div>

          <div className="col-md-6 col-sm-12 align-self-start mb-4">
            <div className="custom-control custom-radio">
              <input
                type="radio"
                className="custom-control-input"
                id="xssOption2"
                name="XssOption"
                checked={xssOption === RehypeSanitizeOption.CUSTOM}
                onChange={() => { adminMarkDownContainer.setState({ xssOption: RehypeSanitizeOption.CUSTOM }) }}
              />
              <label className="custom-control-label w-100" htmlFor="xssOption2">
                <p className="font-weight-bold">{t('markdown_settings.xss_options.custom_whitelist')}</p>
                <WhitelistInput customizable />
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
                  {t('markdown_settings.xss_options.enable_xss_prevention')}
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


XssForm.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  adminMarkDownContainer: PropTypes.instanceOf(AdminMarkDownContainer).isRequired,
};

const XssFormWrapperFC = (props) => {
  const { t } = useTranslation('admin');

  return <XssForm t={t} {...props} />;
};

const XssFormWrapper = withUnstatedContainers(XssFormWrapperFC, [AdminMarkDownContainer]);

export default XssFormWrapper;

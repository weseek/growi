import React, { useState } from 'react';

import PropTypes from 'prop-types';
import loggerFactory from '@alias/logger';
import { useTranslation } from '~/i18n';

import { tags, attrs } from '~/service/xss/recommended-whitelist';

import AdminUpdateButtonRow from '../Common/AdminUpdateButtonRow';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import WhiteListInput from './WhiteListInput';
import { apiv3Put } from '../../../util/apiv3-client';

const logger = loggerFactory('growi:importer');

const XssForm = (props) => {
  const { t } = useTranslation();

  const [isEnabledXss, setIsEnabledXss] = useState(props.isEnabledXss);
  const [xssOption, setXssOption] = useState(props.xssOption);
  const [tagWhiteList, setTagWhiteList] = useState(props.tagWhiteList || []);
  const [attrWhiteList, setAttrWhiteList] = useState(props.attrWhiteList || []);

  async function onClickSubmit() {
    const formattedTagWhiteList = Array.isArray(tagWhiteList) ? tagWhiteList : tagWhiteList.split(',');
    const formattedAttrWhiteList = Array.isArray(attrWhiteList) ? attrWhiteList : attrWhiteList.split(',');

    try {
      await apiv3Put('/markdown-setting/xss', {
        xssOption, isEnabledXss, tagWhiteList: formattedTagWhiteList, attrWhiteList: formattedAttrWhiteList,
      });
      toastSuccess(t('toaster.update_successed', { target: t('admin:markdown_setting.xss_header') }));
    }
    catch (err) {
      toastError(err);
      logger.error(err);
    }
  }

  function onTagWhiteListChange(tags) {
    setTagWhiteList(tags);
  }

  function onAttrWhiteListChange(attrs) {
    setAttrWhiteList(attrs);
  }

  function xssOptions() {
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
                onChange={() => { setXssOption(1) }}
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
                onChange={() => { setXssOption(2) }}
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
                onChange={() => { setXssOption(3) }}
              />
              <label className="custom-control-label w-100" htmlFor="xssOption3">
                <p className="font-weight-bold">{t('admin:markdown_setting.xss_options.custom_whitelist')}</p>
                <WhiteListInput
                  customizable
                  tagWhiteList={tagWhiteList}
                  attrWhiteList={attrWhiteList}
                  onTagWhiteListChange={onTagWhiteListChange}
                  onAttrWhiteListChange={onAttrWhiteListChange}
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                onChange={() => { setIsEnabledXss(!isEnabledXss) }}
              />
              <label className="custom-control-label w-100" htmlFor="XssEnable">
                {t('admin:markdown_setting.xss_options.enable_xss_prevention')}
              </label>
            </div>
          </div>
        </div>

        <div className="col-12">
          {isEnabledXss && xssOptions()}
        </div>
      </fieldset>
      <AdminUpdateButtonRow onClick={onClickSubmit} disabled={false} />
    </React.Fragment>
  );

};

XssForm.propTypes = {
  isEnabledXss: PropTypes.bool,
  xssOption: PropTypes.number,
  tagWhiteList: PropTypes.array,
  attrWhiteList: PropTypes.array,
};

export default XssForm;

import React from 'react';
import { useFormContext } from 'react-hook-form';

import { useTranslation } from '~/i18n';

import { tags, attrs } from '~/service/xss/recommended-whitelist';

const WhiteListInput = (props) => {
  const { t } = useTranslation();
  const xssFormMethods = useFormContext();

  const onClickRecommendTagButton = () => {
    xssFormMethods.setValue('tagWhiteList', tags);
  };

  const onClickRecommendAttrButton = () => {
    xssFormMethods.setValue('attrWhiteList', attrs);
  };


  return (
    <>
      <div className="mt-4">
        <div className="d-flex justify-content-between">
          {t('admin:markdown_setting.xss_options.tag_names')}
          <p id="btn-import-tags" className="btn btn-sm btn-primary mb-0" onClick={onClickRecommendTagButton}>
            {t('admin:markdown_setting.xss_options.import_recommended', { target: 'Tags' })}
          </p>
        </div>
        <textarea
          className="form-control xss-list"
          name="tagWhiteList"
          rows="6"
          cols="40"
          ref={xssFormMethods.register}
        />
      </div>
      <div className="mt-4">
        <div className="d-flex justify-content-between">
          {t('admin:markdown_setting.xss_options.tag_attributes')}
          <p id="btn-import-tags" className="btn btn-sm btn-primary mb-0" onClick={onClickRecommendAttrButton}>
            {t('admin:markdown_setting.xss_options.import_recommended', { target: 'Attrs' })}
          </p>
        </div>
        <textarea
          className="form-control xss-list"
          name="attrWhiteList"
          rows="6"
          cols="40"
          ref={xssFormMethods.register}
        />
      </div>
    </>
  );

};

export default WhiteListInput;

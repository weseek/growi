import React, { FC } from 'react';
import { useFormContext } from 'react-hook-form';

import { useTranslation } from '~/i18n';

import { tags, attrs } from '~/service/xss/recommended-whitelist';

const tagWhiteListInputName = 'tagWhiteList';
const attrWhiteListInputName = 'attrWhiteList';

export const WhiteListInput:FC = () => {
  const { t } = useTranslation();
  const { register, setValue } = useFormContext();

  const onClickRecommendTagButton = () => {
    setValue(tagWhiteListInputName, tags);
  };

  const onClickRecommendAttrButton = () => {
    setValue(attrWhiteListInputName, attrs);
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
          name={tagWhiteListInputName}
          rows={6}
          cols={40}
          ref={register}
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
          name={attrWhiteListInputName}
          rows={6}
          cols={40}
          ref={register}
        />
      </div>
    </>
  );

};

import React from 'react';
import { Card, CardBody } from 'reactstrap';

import { useTranslation } from '~/i18n';
import { useMarkdownSettingsSWR } from '~/stores/admin';
import { apiv3Get } from '~/client/js/util/apiv3-client';
import LineBreakForm from './LineBreakForm';
import PresentationForm from './PresentationForm';
import XssForm from './XssForm';

type Props = {
  // markdownSettingParams: any,
};

const MarkDownSettingContents = (props: Props): JSX.Element => {
  const { t } = useTranslation();
  const { data: markdownSettingParams, error, isValidating } = useMarkdownSettingsSWR();

  if (error) {
    return <></>;
  }

  if (isValidating) {
    return (
      <div className="my-5 text-center">
        <i className="fa fa-lg fa-spinner fa-pulse mx-auto text-muted"></i>
      </div>
    );
  }
  return (
    <React.Fragment>
      {/* Line Break Setting */}
      <h2 className="admin-setting-header">{t('admin:markdown_setting.lineBreak_header')}</h2>
      <Card className="card well my-3">
        <CardBody className="px-0 py-2">{ t('admin:markdown_setting.lineBreak_desc') }</CardBody>
      </Card>
      <LineBreakForm
        isEnabledLinebreaks={markdownSettingParams?.isEnabledLinebreaks}
        isEnabledLinebreaksInComments={markdownSettingParams?.isEnabledLinebreaksInComments}
      />

      {/* Presentation Setting */}
      <h2 className="admin-setting-header">{ t('admin:markdown_setting.presentation_header') }</h2>
      <Card className="card well my-3">
        <CardBody className="px-0 py-2">{ t('admin:markdown_setting.presentation_desc') }</CardBody>
      </Card>
      <PresentationForm
        pageBreakSeparator={markdownSettingParams?.pageBreakSeparator}
        pageBreakCustomSeparator={markdownSettingParams?.pageBreakCustomSeparator}
      />

      {/* XSS Setting */}
      <h2 className="admin-setting-header">{ t('admin:markdown_setting.xss_header') }</h2>
      <Card className="card well my-3">
        <CardBody className="px-0 py-2">{ t('admin:markdown_setting.xss_desc') }</CardBody>
      </Card>
      <XssForm
        isEnabledXss={markdownSettingParams?.isEnabledXss}
        xssOption={markdownSettingParams?.xssOption}
        tagWhiteList={markdownSettingParams?.tagWhiteList}
        attrWhiteList={markdownSettingParams?.attrWhiteList}
      />
    </React.Fragment>
  );
};

export default MarkDownSettingContents;

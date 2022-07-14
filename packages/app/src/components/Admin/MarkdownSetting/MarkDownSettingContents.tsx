import React from 'react';

import { useTranslation } from 'next-i18next';
import { Card, CardBody } from 'reactstrap';

import IndentForm from './IndentForm';
import LineBreakForm from './LineBreakForm';
import PresentationForm from './PresentationForm';
import XssForm from './XssForm';

const MarkDownSettingContents = React.memo((): JSX.Element => {
  const { t } = useTranslation();

  return (
    <div data-testid="admin-markdown">
      {/* Line Break Setting */}
      <h2 className="admin-setting-header">{t('admin:markdown_setting.lineBreak_header')}</h2>
      <Card className="card well my-3">
        <CardBody className="px-0 py-2">{ t('admin:markdown_setting.lineBreak_desc') }</CardBody>
      </Card>
      <LineBreakForm />

      {/* Indent Setting */}
      <h2 className="admin-setting-header">{t('admin:markdown_setting.indent_header')}</h2>
      <Card className="card well my-3">
        <CardBody className="px-0 py-2">{t('admin:markdown_setting.indent_desc') }</CardBody>
      </Card>
      <IndentForm />

      {/* Presentation Setting */}
      <h2 className="admin-setting-header">{ t('admin:markdown_setting.presentation_header') }</h2>
      <Card className="card well my-3">
        <CardBody className="px-0 py-2">{ t('admin:markdown_setting.presentation_desc') }</CardBody>
      </Card>
      <PresentationForm />

      {/* XSS Setting */}
      <h2 className="admin-setting-header">{ t('admin:markdown_setting.xss_header') }</h2>
      <Card className="card well my-3">
        <CardBody className="px-0 py-2">{ t('admin:markdown_setting.xss_desc') }</CardBody>
      </Card>
      <XssForm />
    </div>
  );
});
MarkDownSettingContents.displayName = 'MarkDownSettingContents';

export default MarkDownSettingContents;

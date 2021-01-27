import React from 'react';
import { Card, CardBody } from 'reactstrap';

import { useTranslation } from '~/i18n';

import LineBreakForm from './LineBreakForm';
import PresentationForm from './PresentationForm';
import XssForm from './XssForm';

type Props = {
};

const MarkDownSettingContents = (props: Props): JSX.Element => {
  const { t } = useTranslation();

  return (
    <React.Fragment>
      {/* Line Break Setting */}
      <h2 className="admin-setting-header">{t('admin:markdown_setting.lineBreak_header')}</h2>
      <Card className="card well my-3">
        <CardBody className="px-0 py-2">{ t('admin:markdown_setting.lineBreak_desc') }</CardBody>
      </Card>
      <LineBreakForm />

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
    </React.Fragment>
  );
};

export default MarkDownSettingContents;

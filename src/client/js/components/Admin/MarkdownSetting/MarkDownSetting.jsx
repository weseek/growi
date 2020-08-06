import React, { Suspense } from 'react';
import { Card, CardBody } from 'reactstrap';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import loggerFactory from '@alias/logger';

import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastError } from '../../../util/apiNotification';

import LineBreakForm from './LineBreakForm';
import PresentationForm from './PresentationForm';
import XssForm from './XssForm';
import AdminMarkDownContainer from '../../../services/AdminMarkDownContainer';

const logger = loggerFactory('growi:MarkDown');

function MarkdownSetting(props) {
  return (
    <Suspense
      fallback={(
        <div className="row">
          <i className="fa fa-5x fa-spinner fa-pulse mx-auto text-muted"></i>
        </div>
      )}
    >
      <RenderMarkdownSettingWrapper />
    </Suspense>
  );
}

function RenderMarkdownSetting(props) {
  const { t, adminMarkDownContainer } = props;

  if (adminMarkDownContainer.state.isEnabledLinebreaks === adminMarkDownContainer.dummyIsEnabledLinebreaks) {
    throw new Promise(async() => {
      try {
        await adminMarkDownContainer.retrieveMarkdownData();
      }
      catch (err) {
        toastError(err);
        adminMarkDownContainer.setState({ retrieveError: err.message });
        logger.error(err);
      }
    });
  }

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
}

const RenderMarkdownSettingWrapper = withUnstatedContainers(MarkdownSetting, [AdminMarkDownContainer]);

RenderMarkdownSetting.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  adminMarkDownContainer: PropTypes.instanceOf(AdminMarkDownContainer).isRequired,

};

export default withTranslation()(RenderMarkdownSettingWrapper);

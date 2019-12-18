import React from 'react';
import { Card, CardBody } from 'reactstrap';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';

import AppContainer from '../../../services/AppContainer';
import LineBreakForm from './LineBreakForm';
import PresentationForm from './PresentationForm';
import XssForm from './XssForm';

class MarkdownSetting extends React.Component {

  render() {
    const { t } = this.props;

    return (
      <React.Fragment>
        {/* Line Break Setting */}
        <div className="row mb-5">
          <h2 className="border-bottom col-12">{ t('markdown_setting.line_break_setting') }</h2>
          {/* <div className="well w-100">{ t('markdown_setting.line_break_setting_desc') }</div> */}
          <Card className="well col-12">
            <CardBody className="px-2 py-3">{ t('markdown_setting.line_break_setting_desc') }</CardBody>
          </Card>
          <LineBreakForm />
        </div>

        {/* Presentation Setting */}
        <div className="row mb-5">
          <h2 className="border-bottom col-12">{ t('markdown_setting.presentation_setting') }</h2>
          <Card className="well col-12">
            <CardBody className="px-2 py-3">{ t('markdown_setting.presentation_setting_desc') }</CardBody>
          </Card>
          <PresentationForm />
        </div>

        {/* XSS Setting */}
        <div className="row mb-5">
          <h2 className="border-bottom col-12">{ t('markdown_setting.XSS_setting') }</h2>
          <Card className="well col-12">
            <CardBody className="px-2 py-3">{ t('markdown_setting.XSS_setting_desc') }</CardBody>
          </Card>
          <XssForm />
        </div>
      </React.Fragment>
    );
  }

}

const MarkdownSettingWrapper = (props) => {
  return createSubscribedElement(MarkdownSetting, props, [AppContainer]);
};

MarkdownSetting.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,

};

export default withTranslation()(MarkdownSettingWrapper);

/* eslint-disable react/no-danger */
/* eslint-disable max-len */
import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import loggerFactory from '@alias/logger';

import { createSubscribedElement } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import AppContainer from '../../../services/AppContainer';
import MarkDownSettingContainer from '../../../services/MarkDownSettingContainer';

const logger = loggerFactory('growi:importer');

class LineBreakForm extends React.Component {

  constructor(props) {
    super(props);

    this.onClickSubmit = this.onClickSubmit.bind(this);
  }


  async onClickSubmit() {
    const { t } = this.props;

    try {
      await this.props.markDownSettingContainer.updateLineBreakSetting();
      toastSuccess(t('markdown_setting.updated_lineBreak'));
    }
    catch (err) {
      toastError(err);
      logger.error(err);
    }
  }

  renderLineBreakOption() {
    const { t, markDownSettingContainer } = this.props;
    const { isEnabledLinebreaks } = markDownSettingContainer.state;

    const helpLineBreak = { __html: t('markdown_setting.Enable Line Break desc') };

    return (
      <div className="form-group row">
        <div className="col-xs-offset-4 col-xs-6 text-left">
          <div className="checkbox checkbox-success">
            <input
              type="checkbox"
              id="isEnabledLinebreaks"
              checked={isEnabledLinebreaks}
              onChange={() => { markDownSettingContainer.setState({ isEnabledLinebreaks: !isEnabledLinebreaks }) }}
            />
            <label htmlFor="isEnabledLinebreaks">
              { t('markdown_setting.Enable Line Break') }
            </label>
          </div>
          <p className="help-block" dangerouslySetInnerHTML={helpLineBreak} />
        </div>
      </div>
    );
  }

  renderLineBreakInCommentOption() {
    const { t, markDownSettingContainer } = this.props;
    const { isEnabledLinebreaksInComments } = markDownSettingContainer.state;

    const helpLineBreakInComment = { __html: t('markdown_setting.Enable Line Break for comment desc') };

    return (
      <div className="form-group row">
        <div className="col-xs-offset-4 col-xs-6 text-left">
          <div className="checkbox checkbox-success">
            <input
              type="checkbox"
              id="isEnabledLinebreaksInComments"
              checked={isEnabledLinebreaksInComments}
              onChange={() => { markDownSettingContainer.setState({ isEnabledLinebreaksInComments: !isEnabledLinebreaksInComments }) }}
            />
            <label htmlFor="isEnabledLinebreaksInComments">
              { t('markdown_setting.Enable Line Break') }
            </label>
          </div>
          <p className="help-block" dangerouslySetInnerHTML={helpLineBreakInComment} />
        </div>
      </div>
    );
  }

  render() {
    const { t } = this.props;

    return (
      <React.Fragment>
        <fieldset className="row">
          {this.renderLineBreakOption()}
          {this.renderLineBreakInCommentOption()}
        </fieldset>
        <div className="form-group my-3">
          <div className="col-xs-offset-4 col-xs-5">
            <button type="submit" className="btn btn-primary" onClick={this.onClickSubmit}>{ t('Update') }</button>
          </div>
        </div>
      </React.Fragment>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const LineBreakFormWrapper = (props) => {
  return createSubscribedElement(LineBreakForm, props, [AppContainer, MarkDownSettingContainer]);
};

LineBreakForm.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  markDownSettingContainer: PropTypes.instanceOf(MarkDownSettingContainer).isRequired,
};

export default withTranslation()(LineBreakFormWrapper);

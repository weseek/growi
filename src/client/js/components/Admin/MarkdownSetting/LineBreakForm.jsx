/* eslint-disable react/no-danger */
import React from 'react';

import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import loggerFactory from '@alias/logger';

import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';


import AppContainer from '../../../services/AppContainer';
import AdminMarkDownContainer from '../../../services/AdminMarkDownContainer';
import AdminUpdateButtonRow from '../Common/AdminUpdateButtonRow';

const logger = loggerFactory('growi:importer');

class LineBreakForm extends React.Component {

  constructor(props) {
    super(props);

    this.onClickSubmit = this.onClickSubmit.bind(this);
  }


  async onClickSubmit() {
    const { t } = this.props;

    try {
      await this.props.adminMarkDownContainer.updateLineBreakSetting();
      toastSuccess(t('toaster.update_successed', { target: t('admin:markdown_setting.lineBreak_header') }));
    }
    catch (err) {
      toastError(err);
      logger.error(err);
    }
  }

  renderLineBreakOption() {
    const { t, adminMarkDownContainer } = this.props;
    const { isEnabledLinebreaks } = adminMarkDownContainer.state;

    const helpLineBreak = { __html: t('admin:markdown_setting.lineBreak_options.enable_lineBreak_desc') };

    return (
      <div className="col">
        <div className="custom-control custom-checkbox custom-checkbox-success">
          <input
            type="checkbox"
            className="custom-control-input"
            id="isEnabledLinebreaks"
            checked={isEnabledLinebreaks}
            onChange={() => { adminMarkDownContainer.setState({ isEnabledLinebreaks: !isEnabledLinebreaks }) }}
          />
          <label className="custom-control-label" htmlFor="isEnabledLinebreaks">
            {t('admin:markdown_setting.lineBreak_options.enable_lineBreak') }
          </label>
        </div>
        <p className="form-text text-muted" dangerouslySetInnerHTML={helpLineBreak} />
      </div>
    );
  }

  renderLineBreakInCommentOption() {
    const { t, adminMarkDownContainer } = this.props;
    const { isEnabledLinebreaksInComments } = adminMarkDownContainer.state;

    const helpLineBreakInComment = { __html: t('admin:markdown_setting.lineBreak_options.enable_lineBreak_for_comment_desc') };

    return (
      <div className="col">
        <div className="custom-control custom-checkbox custom-checkbox-success">
          <input
            type="checkbox"
            className="custom-control-input"
            id="isEnabledLinebreaksInComments"
            checked={isEnabledLinebreaksInComments}
            onChange={() => { adminMarkDownContainer.setState({ isEnabledLinebreaksInComments: !isEnabledLinebreaksInComments }) }}
          />
          <label className="custom-control-label" htmlFor="isEnabledLinebreaksInComments">
            {t('admin:markdown_setting.lineBreak_options.enable_lineBreak_for_comment') }
          </label>
        </div>
        <p className="form-text text-muted" dangerouslySetInnerHTML={helpLineBreakInComment} />
      </div>
    );
  }

  render() {
    const { adminMarkDownContainer } = this.props;

    return (
      <React.Fragment>
        <fieldset className="form-group row row-cols-1 row-cols-md-2 mx-3">
          {this.renderLineBreakOption()}
          {this.renderLineBreakInCommentOption()}
        </fieldset>
        <AdminUpdateButtonRow onClick={this.onClickSubmit} disabled={adminMarkDownContainer.state.retrieveError != null} />
      </React.Fragment>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const LineBreakFormWrapper = withUnstatedContainers(LineBreakForm, [AppContainer, AdminMarkDownContainer]);

LineBreakForm.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminMarkDownContainer: PropTypes.instanceOf(AdminMarkDownContainer).isRequired,
};

export default withTranslation()(LineBreakFormWrapper);

/* eslint-disable react/no-danger */
import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import loggerFactory from '@alias/logger';

import { createSubscribedElement } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import AppContainer from '../../../services/AppContainer';
import AdminMarkDownContainer from '../../../services/AdminMarkDownContainer';

const logger = loggerFactory('growi:importer');

class LineBreakForm extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isEnabledLinebreaks: false,
      isEnabledLinebreaksInComments: false,
    };

    this.onClickSubmit = this.onClickSubmit.bind(this);
    this.onChangeIsEnabledLinebreaks = this.onChangeIsEnabledLinebreaks.bind(this);
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

  onChangeIsEnabledLinebreaks() {
    const bool = !this.state.isEnabledLinebreaksInComments;

    this.setState({ isEnabledLinebreaksInComments: bool });
    this.props.adminMarkDownContainer.setState({ isEnabledLinebreaksInComments: bool });
  }


  onChangeIsEnabledLinebreaksInComments() {
    const bool = !this.state.isEnabledLinebreaks;

    this.setState({ isEnabledLinebreaks: bool });
    this.props.adminMarkDownContainer.setState({ isEnabledLinebreaks: bool });
  }

  render() {
    const { t, adminMarkDownContainer } = this.props;
    const { isEnabledLinebreaks, isEnabledLinebreaksInComments } = this.state;

    return (
      <React.Fragment>
        <fieldset className="row">
          <div className="form-group row">
            <div className="col-xs-offset-4 col-xs-6 text-left">
              <div className="checkbox checkbox-success">
                <input
                  type="checkbox"
                  id="isEnabledLinebreaks"
                  checked={isEnabledLinebreaks}
                  onChange={this.onChangeIsEnabledLinebreaks}
                />
                <label htmlFor="isEnabledLinebreaks">
                  {t('admin:markdown_setting.lineBreak_options.enable_lineBreak')}
                </label>
              </div>
              <p className="help-block" dangerouslySetInnerHTML={{ __html: t('admin:markdown_setting.lineBreak_options.enable_lineBreak_desc') }} />
            </div>
          </div>
          <div className="form-group row">
            <div className="col-xs-offset-4 col-xs-6 text-left">
              <div className="checkbox checkbox-success">
                <input
                  type="checkbox"
                  id="isEnabledLinebreaksInComments"
                  checked={isEnabledLinebreaksInComments}
                  onChange={this.onChangeIsEnabledLinebreaksInComments}
                />
                <label htmlFor="isEnabledLinebreaksInComments">
                  {t('admin:markdown_setting.lineBreak_options.enable_lineBreak')}
                </label>
              </div>
              <p className="help-block" dangerouslySetInnerHTML={{ __html: t('admin:markdown_setting.lineBreak_options.enable_lineBreak_for_comment_desc') }} />
            </div>
          </div>
        </fieldset>
        <div className="form-group my-3">
          <div className="col-xs-offset-4 col-xs-5">
            <button
              type="submit"
              className="btn btn-primary"
              onClick={this.onClickSubmit}
              disabled={adminMarkDownContainer.state.retrieveError != null}
            >
              {t('Update')}
            </button>
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
  return createSubscribedElement(LineBreakForm, props, [AppContainer, AdminMarkDownContainer]);
};

LineBreakForm.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminMarkDownContainer: PropTypes.instanceOf(AdminMarkDownContainer).isRequired,
};

export default withTranslation()(LineBreakFormWrapper);

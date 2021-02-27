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
import PagingSizeUncontrolledDropdown from '../Customize/PagingSizeUncontrolledDropdown';

const logger = loggerFactory('growi:importer');

class IndentForm extends React.Component {
  constructor(props) {
    super(props);

    this.onClickSubmit = this.onClickSubmit.bind(this);
  }

  async onClickSubmit() {
    const { t } = this.props;

    try {
      await this.props.adminMarkDownContainer.updateIndentSetting();
      toastSuccess(t('toaster.update_successed', { target: t('admin:markdown_setting.indent_header') }));
    } catch (err) {
      toastError(err);
      logger.error(err);
    }
  }

  renderIndentSizeOption() {
    const { t, adminMarkDownContainer } = this.props;
    const { adminPreferredIndentSize } = adminMarkDownContainer.state;

    const helpIndent = { __html: t('admin:markdown_setting.indent_options.indentSize_desc') };

    return (
      <div className="col">
        <div className="custom-control custom-checkbox custom-checkbox-success">
          <PagingSizeUncontrolledDropdown
            label={t('admin:markdown_setting.indent_options.indentSize')}
            desc={t('admin:markdown_setting.indent_options.indentSize_desc')}
            toggleLabel={adminPreferredIndentSize || 4}
            dropdownItemSize={[2, 4]}
            onChangeDropdownItem={adminMarkDownContainer.setAdminPreferredIndentSize}
          />
        </div>
        {/* <p className="form-text text-muted" dangerouslySetInnerHTML={helpIndent} /> */}
      </div>
    );
  }

  renderIndentForceOption() {
    const { t, adminMarkDownContainer } = this.props;
    const { isIndentSizeForced } = adminMarkDownContainer.state;

    const helpIndentInComment = { __html: t('admin:markdown_setting.indent_options.disallow_indent_change_desc') };

    return (
      <div className="col">
        <div className="custom-control custom-checkbox custom-checkbox-success">
          <input
            type="checkbox"
            className="custom-control-input"
            id="isIndentSizeForced"
            checked={isIndentSizeForced}
            onChange={() => {
              adminMarkDownContainer.setState({ isIndentSizeForced: !isIndentSizeForced });
            }}
          />
          <label className="custom-control-label" htmlFor="isIndentSizeForced">
            {t('admin:markdown_setting.indent_options.disallow_indent_change')}
          </label>
        </div>
        <p className="form-text text-muted" dangerouslySetInnerHTML={helpIndentInComment} />
      </div>
    );
  }

  render() {
    const { adminMarkDownContainer } = this.props;

    return (
      <React.Fragment>
        <fieldset className="form-group row row-cols-1 row-cols-md-2 mx-3">
          {this.renderIndentSizeOption()}
          {this.renderIndentForceOption()}
        </fieldset>
        <AdminUpdateButtonRow onClick={this.onClickSubmit} disabled={adminMarkDownContainer.state.retrieveError != null} />
      </React.Fragment>
    );
  }
}

/**
 * Wrapper component for using unstated
 */
const IndentFormWrapper = withUnstatedContainers(IndentForm, [AppContainer, AdminMarkDownContainer]);

IndentForm.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminMarkDownContainer: PropTypes.instanceOf(AdminMarkDownContainer).isRequired,
};

export default withTranslation()(IndentFormWrapper);

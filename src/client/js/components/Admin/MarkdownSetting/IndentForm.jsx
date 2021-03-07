/* eslint-disable react/no-danger */
import React from 'react';

import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import loggerFactory from '@alias/logger';

import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import AdminMarkDownContainer from '../../../services/AdminMarkDownContainer';
import AdminUpdateButtonRow from '../Common/AdminUpdateButtonRow';
import PagingSizeUncontrolledDropdown from '../Customize/PagingSizeUncontrolledDropdown';

const logger = loggerFactory('growi:importer');

const IndentForm = (props) => {
  const onClickSubmit = async(props) => {
    const { t } = props;

    try {
      await props.adminMarkDownContainer.updateIndentSetting();
      toastSuccess(t('toaster.update_successed', { target: t('admin:markdown_setting.indent_header') }));
    }
    catch (err) {
      toastError(err);
      logger.error(err);
    }
  };

  const renderIndentSizeOption = (props) => {
    const { t, adminMarkDownContainer } = props;
    const { adminPreferredIndentSize } = adminMarkDownContainer.state;

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
  };

  const renderIndentForceOption = (props) => {
    const { t, adminMarkDownContainer } = props;
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
  };

  const { adminMarkDownContainer } = props;

  return (
    <React.Fragment>
      <fieldset className="form-group row row-cols-1 row-cols-md-2 mx-3">
        {renderIndentSizeOption(props)}
        {renderIndentForceOption(props)}
      </fieldset>
      <AdminUpdateButtonRow onClick={() => onClickSubmit(props)} disabled={adminMarkDownContainer.state.retrieveError != null} />
    </React.Fragment>
  );
};

/**
 * Wrapper component for using unstated
 */
const IndentFormWrapper = withUnstatedContainers(IndentForm, [AdminMarkDownContainer]);

IndentForm.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  adminMarkDownContainer: PropTypes.instanceOf(AdminMarkDownContainer).isRequired,
};

export default withTranslation()(IndentFormWrapper);

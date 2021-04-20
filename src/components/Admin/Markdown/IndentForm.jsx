/* eslint-disable react/no-danger */
import React from 'react';

import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import {
  UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem,
} from 'reactstrap';

import loggerFactory from '~/utils/logger';


import { toastSuccess, toastError } from '../../../client/js/util/apiNotification';

// import AdminMarkDownContainer from '../../../services/AdminMarkDownContainer';
import AdminUpdateButtonRow from '../Common/AdminUpdateButtonRow';

const logger = loggerFactory('growi:importer');

const IndentForm = (props) => {
  const onClickSubmit = async(props) => {
    const { t } = props;

    try {
      // await props.adminMarkDownContainer.updateIndentSetting();
      toastSuccess(t('toaster.update_successed', { target: t('admin:markdown_setting.indent_header') }));
    }
    catch (err) {
      toastError(err);
      logger.error(err);
    }
  };

  const renderIndentSizeOption = (props) => {
    const { t /* adminMarkDownContainer */ } = props;
    // const { adminPreferredIndentSize } = adminMarkDownContainer.state;

    return (
      <div className="col">
        <div>
          <label htmlFor="adminPreferredIndentSize">{t('admin:markdown_setting.indent_options.indentSize')}</label>
          {/* <UncontrolledDropdown id="adminPreferredIndentSize">
            <DropdownToggle caret className="col-3 col-sm-2 col-md-5 col-lg-5 col-xl-3 text-right">
              <span className="float-left">
                {adminPreferredIndentSize || 4}
              </span>
            </DropdownToggle>
            <DropdownMenu className="dropdown-menu" role="menu">
              {[2, 4].map((num) => {
                return (
                  <DropdownItem key={num} role="presentation" onClick={() => adminMarkDownContainer.setAdminPreferredIndentSize(num)}>
                    <a role="menuitem">{num}</a>
                  </DropdownItem>
                );
              })}
            </DropdownMenu>
          </UncontrolledDropdown> */}
        </div>
        <p className="form-text text-muted">
          {/* {t('admin:markdown_setting.indent_options.indentSize_desc')} */}
        </p>
      </div>
    );
  };

  const renderIndentForceOption = (props) => {
    const { t } = props;
    // const { t, adminMarkDownContainer } = props;
    // const { isIndentSizeForced } = adminMarkDownContainer.state;

    const helpIndentInComment = { __html: t('admin:markdown_setting.indent_options.disallow_indent_change_desc') };

    return (
      <div className="col">
        <div className="custom-control custom-checkbox custom-checkbox-success">
          {/* <input
            type="checkbox"
            className="custom-control-input"
            id="isIndentSizeForced"
            checked={isIndentSizeForced || false}
            onChange={() => {
              adminMarkDownContainer.setState({ isIndentSizeForced: !isIndentSizeForced });
            }}
          /> */}
          <label className="custom-control-label" htmlFor="isIndentSizeForced">
            {t('admin:markdown_setting.indent_options.disallow_indent_change')}
          </label>
        </div>
        <p className="form-text text-muted" dangerouslySetInnerHTML={helpIndentInComment} />
      </div>
    );
  };

  // const { adminMarkDownContainer } = props;

  return (
    <React.Fragment>
      <fieldset className="form-group row row-cols-1 row-cols-md-2 mx-3">
        {renderIndentSizeOption(props)}
        {renderIndentForceOption(props)}
      </fieldset>
      {/* <AdminUpdateButtonRow onClick={() => onClickSubmit(props)} disabled={adminMarkDownContainer.state.retrieveError != null} /> */}
    </React.Fragment>
  );
};

IndentForm.propTypes = {
  t: PropTypes.func.isRequired, // i18next
};

export default withTranslation()(IndentForm);

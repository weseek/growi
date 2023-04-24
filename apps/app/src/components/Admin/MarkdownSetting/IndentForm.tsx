/* eslint-disable react/no-danger */
import React, { useCallback } from 'react';

import { useTranslation } from 'next-i18next';
import {
  UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem,
} from 'reactstrap';

import AdminMarkDownContainer from '~/client/services/AdminMarkDownContainer';
import { toastSuccess, toastError } from '~/client/util/toastr';
import loggerFactory from '~/utils/logger';

import { withUnstatedContainers } from '../../UnstatedUtils';
import AdminUpdateButtonRow from '../Common/AdminUpdateButtonRow';

const logger = loggerFactory('growi:importer');


type Props = {
  adminMarkDownContainer: AdminMarkDownContainer;
}

const IndentForm = (props: Props) => {
  const { t } = useTranslation('admin');

  const onClickSubmit = useCallback(async(props) => {
    try {
      await props.adminMarkDownContainer.updateIndentSetting();
      toastSuccess(t('toaster.update_successed', { target: t('markdown_settings.indent_header'), ns: 'commons' }));
    }
    catch (err) {
      toastError(err);
      logger.error(err);
    }
  }, [t]);

  const renderIndentSizeOption = (props) => {
    const { adminMarkDownContainer } = props;
    const { adminPreferredIndentSize } = adminMarkDownContainer.state;

    return (
      <div className="col">
        <div>
          <label htmlFor="adminPreferredIndentSize">{t('markdown_settings.indent_options.indentSize')}</label>
          <UncontrolledDropdown id="adminPreferredIndentSize">
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
          </UncontrolledDropdown>
        </div>
        <p className="form-text text-muted">
          {t('markdown_settings.indent_options.indentSize_desc')}
        </p>
      </div>
    );
  };

  const renderIndentForceOption = (props) => {
    const { adminMarkDownContainer } = props;
    const { isIndentSizeForced } = adminMarkDownContainer.state;

    const helpIndentInComment = { __html: t('markdown_settings.indent_options.disallow_indent_change_desc') };

    return (
      <div className="col">
        <div className="custom-control custom-checkbox custom-checkbox-success">
          <input
            type="checkbox"
            className="custom-control-input"
            id="isIndentSizeForced"
            checked={isIndentSizeForced || false}
            onChange={() => {
              adminMarkDownContainer.setState({ isIndentSizeForced: !isIndentSizeForced });
            }}
          />
          <label className="custom-control-label" htmlFor="isIndentSizeForced">
            {t('markdown_settings.indent_options.disallow_indent_change')}
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

export default IndentFormWrapper;

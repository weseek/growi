/* eslint-disable no-useless-escape */
import React, { useCallback, useState } from 'react';


import { useTranslation } from 'next-i18next';
import {
  Dropdown, DropdownToggle, DropdownMenu, DropdownItem,
} from 'reactstrap';

import AdminCustomizeContainer from '~/client/services/AdminCustomizeContainer';
import { toastSuccess, toastError } from '~/client/util/apiNotification';
import { DemoCodeBlock } from '~/components/ReactMarkdownComponents/CodeBlock';
import { IHighlightJsCssSelectorOptions } from '~/interfaces/customize';

import { withUnstatedContainers } from '../../UnstatedUtils';
import AdminUpdateButtonRow from '../Common/AdminUpdateButtonRow';

import styles from './CustomizeHighlightSetting.module.scss';

type Props = {
  adminCustomizeContainer: AdminCustomizeContainer
}

const HIGHLIGHT_DEMO_CODE_STRING = `function MersenneTwister(seed) {
  if (arguments.length == 0) {
    seed = new Date().getTime();
  }

  this._mt = new Array(624);
  this.setSeed(seed);
}`;

const CustomizeHighlightSetting = (props: Props): JSX.Element => {
  const { adminCustomizeContainer } = props;
  const { t } = useTranslation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const options: IHighlightJsCssSelectorOptions = adminCustomizeContainer.state.highlightJsCssSelectorOptions;

  const onToggleDropdown = useCallback(() => {
    setIsDropdownOpen(!isDropdownOpen);
  }, [isDropdownOpen]);

  const onClickSubmit = useCallback(async() => {
    try {
      await adminCustomizeContainer.updateHighlightJsStyle();
      toastSuccess(t('toaster.update_successed', { target: t('admin:customize_settings.code_highlight') }));
    }
    catch (err) {
      toastError(err);
    }
  }, [t, adminCustomizeContainer]);

  const renderMenuItems = useCallback(() => {

    const items = Object.entries(options).map((option) => {
      const styleId = option[0];
      const styleName = option[1].name;
      const isBorderEnable = option[1].border;

      return (
        <DropdownItem
          key={styleId}
          role="presentation"
          onClick={() => adminCustomizeContainer.switchHighlightJsStyle(styleId, styleName, isBorderEnable)}
        >
          <a role="menuitem">{styleName}</a>
        </DropdownItem>
      );
    });
    return items;
  }, [adminCustomizeContainer, options]);

  return (
    <React.Fragment>
      <div className="row">
        <div className="col-12">
          <h2 className="admin-setting-header">{t('admin:customize_settings.code_highlight')}</h2>

          <div className="form-group row">
            <div className="offset-md-3 col-md-6 text-left">
              <div className="my-0">
                <label>{t('admin:customize_settings.theme')}</label>
              </div>
              <Dropdown isOpen={isDropdownOpen} toggle={onToggleDropdown}>
                <DropdownToggle className="text-right col-6" caret>
                  <span className="float-left">{adminCustomizeContainer.state.currentHighlightJsStyleName}</span>
                </DropdownToggle>
                <DropdownMenu className="dropdown-menu" role="menu">
                  {renderMenuItems()}
                </DropdownMenu>
              </Dropdown>
            </div>
          </div>

          <div className="form-group row">
            <div className="offset-md-3 col-md-6 text-left">
              <div className="custom-control custom-switch custom-checkbox-success">
                <input
                  type="checkbox"
                  className="custom-control-input"
                  id="highlightBorder"
                  checked={adminCustomizeContainer.state.isHighlightJsStyleBorderEnabled}
                  onChange={() => { adminCustomizeContainer.switchHighlightJsStyleBorder() }}
                />
                <label className="custom-control-label" htmlFor="highlightBorder">
                  <strong>Border</strong>
                </label>
              </div>
            </div>
          </div>

          <div className="form-text text-muted">
            <label>Examples:</label>
            <div className="wiki">
              <DemoCodeBlock
                styleKey={adminCustomizeContainer.state.currentHighlightJsStyleId}
                lang='javascript'
                classNames={`hljs ${styles['code-highlight-demo']} ${!adminCustomizeContainer.state.isHighlightJsStyleBorderEnabled && 'hljs-no-border'}`}
              >
                {HIGHLIGHT_DEMO_CODE_STRING}
              </DemoCodeBlock>
            </div>
          </div>

          <AdminUpdateButtonRow onClick={onClickSubmit} disabled={adminCustomizeContainer.state.retrieveError != null} />
        </div>
      </div>
    </React.Fragment>
  );
};

const CustomizeHighlightSettingWrapper = withUnstatedContainers(CustomizeHighlightSetting, [AdminCustomizeContainer]);

export default CustomizeHighlightSettingWrapper;

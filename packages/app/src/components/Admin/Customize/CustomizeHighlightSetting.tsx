/* eslint-disable no-useless-escape */
import React, { useCallback, useState } from 'react';


import { useTranslation } from 'next-i18next';
import {
  Dropdown, DropdownToggle, DropdownMenu, DropdownItem,
} from 'reactstrap';

import AdminCustomizeContainer from '~/client/services/AdminCustomizeContainer';
import { toastSuccess, toastError } from '~/client/util/apiNotification';
import { IHighlightJsCssSelectorOptions } from '~/interfaces/customize';

import { withUnstatedContainers } from '../../UnstatedUtils';
import AdminUpdateButtonRow from '../Common/AdminUpdateButtonRow';

type Props = {
  adminCustomizeContainer: AdminCustomizeContainer
}

type HljsDemoProps = {
  isHighlightJsStyleBorderEnabled: boolean
}

const HljsDemo = React.memo((props: HljsDemoProps): JSX.Element => {

  const { isHighlightJsStyleBorderEnabled } = props;

  /* eslint-disable max-len */
  const html = `<span class="hljs-function"><span class="hljs-keyword">function</span> <span class="hljs-title">MersenneTwister</span>(<span class="hljs-params">seed</span>) </span>{
<span class="hljs-keyword">if</span> (<span class="hljs-built_in">arguments</span>.length == <span class="hljs-number">0</span>) {
  seed = <span class="hljs-keyword">new</span> <span class="hljs-built_in">Date</span>().getTime();
}

<span class="hljs-keyword">this</span>._mt = <span class="hljs-keyword">new</span> <span class="hljs-built_in">Array</span>(<span class="hljs-number">624</span>);
<span class="hljs-keyword">this</span>.setSeed(seed);
}</span>`;
  /* eslint-enable max-len */

  return (
    <pre className={`hljs ${!isHighlightJsStyleBorderEnabled && 'hljs-no-border'}`}>
      {/* eslint-disable-next-line react/no-danger */}
      <code dangerouslySetInnerHTML={{ __html: html }}></code>
    </pre>
  );
});
HljsDemo.displayName = 'HljsDemo';

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
              <p className="form-text text-warning">
                {/* eslint-disable-next-line react/no-danger */}
                <span dangerouslySetInnerHTML={{ __html: t('admin:customize_settings.nocdn_desc') }} />
              </p>
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
              <HljsDemo isHighlightJsStyleBorderEnabled={adminCustomizeContainer.state.isHighlightJsStyleBorderEnabled} />
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

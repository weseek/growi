import { useCallback } from 'react';

import { useTranslation } from 'react-i18next';
import { UncontrolledTooltip } from 'reactstrap';

import { useCollapsedContentsOpened, usePreferCollapsedMode, useSidebarMode } from '~/stores/ui';

import SidebarCollapsedIcon from './SidebarCollapsedIcon';
import SidebarDockIcon from './SidebarDockIcon';

import styles from './UISettings.module.scss';

const IconWithTooltip = ({
  id, label, children, additionalClasses,
}: {
id: string,
label: string,
children: JSX.Element,
additionalClasses: string
}) => (
  <>
    <div id={id} className={`${additionalClasses != null ? additionalClasses : ''}`}>{children}</div>
    <UncontrolledTooltip placement="bottom" fade={false} target={id}>{label}</UncontrolledTooltip>
  </>
);

export const UISettings = (): JSX.Element => {
  const { t } = useTranslation();
  const {
    data: sidebarMode, isDrawerMode, isDockMode, isCollapsedMode,
  } = useSidebarMode();
  const { mutateAndSave: mutatePreferCollapsedMode } = usePreferCollapsedMode();
  const { mutate: mutateCollapsedContentsOpened } = useCollapsedContentsOpened();

  const toggleCollapsed = useCallback(() => {
    mutatePreferCollapsedMode(!isCollapsedMode());
    mutateCollapsedContentsOpened(false);
  }, [isCollapsedMode, mutateCollapsedContentsOpened, mutatePreferCollapsedMode]);

  const renderSidebarModeSwitch = () => {
    return (
      <>
        <div className="d-flex align-items-start">
          <div className="d-flex align-items-center">
            <IconWithTooltip
              id="iwt-sidebar-collapsed"
              label="Collapsed"
              additionalClasses={styles['grw-sidebar-mode-icon']}
            >
              <SidebarCollapsedIcon />
            </IconWithTooltip>
            <div className="form-check form-switch ms-2">

              <input
                id="swSidebarMode"
                className="form-check-input"
                type="checkbox"
                checked={isDockMode()}
                onChange={toggleCollapsed}
              />
              <label className="form-label form-check-label" htmlFor="swSidebarMode"></label>
            </div>
            <IconWithTooltip id="iwt-sidebar-dock" label="Dock" additionalClasses={styles['grw-sidebar-mode-icon']}>
              <SidebarDockIcon />
            </IconWithTooltip>
          </div>
          <div className="ms-2">
            <label className="form-label form-check-label" htmlFor="swSidebarMode">
              {t('ui_settings.side_bar_mode.side_bar_mode_setting')}
            </label>
            <p className="form-text text-muted small">{t('ui_settings.side_bar_mode.description')}</p>
          </div>
        </div>
      </>
    );
  };

  return (
    <>
      { sidebarMode != null && !isDrawerMode() && (
        <>
          <h2 className="border-bottom mb-4">{t('ui_settings.ui_settings')}</h2>

          <div className="row justify-content-center">
            <div className="col-md-6">

              { renderSidebarModeSwitch() }

              <div>
              </div>
            </div>
          </div>

          <div className="row my-3">
            <div className="offset-4 col-5">
              <button data-testid="" type="button" className="btn btn-primary" onClick={() => {}}>
                {t('Update')}
              </button>
            </div>
          </div>
        </>
      ) }

    </>
  );
};

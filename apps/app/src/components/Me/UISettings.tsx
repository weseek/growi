import { useTranslation } from 'react-i18next';
import { UncontrolledTooltip } from 'reactstrap';

import SidebarDockIcon from './SidebarDockIcon';
import SidebarDrawerIcon from './SidebarDrawerIcon';

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

  const renderSidebarModeSwitch = () => {
    return (
      <>
        <div className="d-flex align-items-start">
          <div className="d-flex align-items-center">
            <IconWithTooltip
              id="iwt-sidebar-drawer"
              label="Drawer"
              additionalClasses={styles['grw-sidebar-mode-icon']}
            >
              <SidebarDrawerIcon />
            </IconWithTooltip>
            <div className="form-check form-switch ms-2">

              <input
                id="swSidebarMode"
                className="form-check-input"
                type="checkbox"
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

  const renderEditSidebarModeSwitch = () => {
    return (
      <>
        <div className="d-flex align-items-start">
          <div className="d-flex align-items-center">
            <IconWithTooltip
              id="iwt-sidebar-editor-drawer"
              label="Drawer"
              additionalClasses={styles['grw-sidebar-mode-icon']}
            >
              <SidebarDrawerIcon />
            </IconWithTooltip>
            <div className="form-check form-switch ms-2">

              <input
                id="swSidebarModeOnEditor"
                className="form-check-input"
                type="checkbox"
              />
              <label className="form-label form-check-label" htmlFor="swSidebarModeOnEditor"></label>
            </div>
            <IconWithTooltip id="iwt-sidebar-editor-dock" label="Dock" additionalClasses={styles['grw-sidebar-mode-icon']}>
              <SidebarDockIcon />
            </IconWithTooltip>
          </div>
          <div className="ms-2">
            <label className="form-label form-check-label" htmlFor="swSidebarModeOnEditor">
              {t('ui_settings.edit_side_bar_mode.side_bar_mode_setting')}
            </label>
            <p className="form-text text-muted small">{t('ui_settings.edit_side_bar_mode.description')}</p>
          </div>
        </div>
      </>
    );
  };

  return (
    <>
      <h2 className="border-bottom mb-4">{t('ui_settings.ui_settings')}</h2>

      <div className="row justify-content-center">
        <div className="col-md-6">

          { renderSidebarModeSwitch() }

          <div className="mt-5">
            { renderEditSidebarModeSwitch() }
          </div>

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
  );
};

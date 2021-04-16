import React, { FC, useCallback } from 'react';
import { UncontrolledTooltip } from 'reactstrap';

import { useTranslation } from '~/i18n';
import { useCurrentUser, useHackmdUri } from '~/stores/context';
import { EditorMode, useEditorMode, useIsDeviceSmallerThanMd } from '~/stores/ui';


type PageEditorModeButtonProps = {
  targetMode: EditorMode,
  isBtnDisabled: boolean,
  onClick: (EditorMode) => void,
  icon: JSX.Element,
  label: string,
  id?: string,
}

const PageEditorModeButton: FC<PageEditorModeButtonProps> = ({
  isBtnDisabled, onClick, targetMode, icon, label, id,
}: PageEditorModeButtonProps) => {

  const { data: editorMode } = useEditorMode();

  const classNames = [`btn btn-outline-primary ${targetMode}-button px-1`];
  if (editorMode === targetMode) {
    classNames.push('active');
  }
  if (isBtnDisabled) {
    classNames.push('disabled');
  }

  return (
    <button
      type="button"
      className={classNames.join(' ')}
      onClick={() => { onClick(targetMode) }}
      id={id}
    >
      <span className="d-flex flex-column flex-md-row justify-content-center">
        <span className="grw-page-editor-mode-manager-icon mr-md-1">{icon}</span>
        <span className="grw-page-editor-mode-manager-label">{label}</span>
      </span>
    </button>
  );
};


type Props = {
  isBtnDisabled: boolean,
}

const PageEditorModeManager: FC<Props> = ({ isBtnDisabled }: Props) => {

  const { t } = useTranslation();
  const { data: currentUser } = useCurrentUser();
  const { data: editorMode, mutate: mutateEditorMode } = useEditorMode();
  const { data: isDeviceSmallerThanMd } = useIsDeviceSmallerThanMd();
  const { data: hackmdUri } = useHackmdUri();

  const isAdmin = currentUser?.admin;
  const isHackmdEnabled = hackmdUri != null;
  const showHackmdBtn = isHackmdEnabled || isAdmin;
  const showHackmdDisabledTooltip = isAdmin && !isHackmdEnabled && editorMode !== 'hackmd';

  const isEditorMode = editorMode !== EditorMode.View;

  const pageEditorModeButtonClickedHandler = useCallback((selectedEditorMode) => {
    if (isBtnDisabled) {
      return;
    }

    mutateEditorMode(selectedEditorMode);

  }, [isBtnDisabled, mutateEditorMode]);

  return (
    <>
      <div
        className="btn-group grw-page-editor-mode-manager"
        role="group"
        aria-label="page-editor-mode-manager"
        id="grw-page-editor-mode-manager"
      >
        {(!isDeviceSmallerThanMd || isEditorMode) && (
          <PageEditorModeButton
            targetMode={EditorMode.View}
            isBtnDisabled={isBtnDisabled}
            onClick={pageEditorModeButtonClickedHandler}
            icon={<i className="icon-control-play" />}
            label={t('view')}
          />
        )}
        {(!isDeviceSmallerThanMd || !isEditorMode) && (
          <PageEditorModeButton
            targetMode={EditorMode.Editor}
            isBtnDisabled={isBtnDisabled}
            onClick={pageEditorModeButtonClickedHandler}
            icon={<i className="icon-note" />}
            label={t('Edit')}
          />
        )}
        {(!isDeviceSmallerThanMd || editorMode === 'view') && showHackmdBtn && (
          <PageEditorModeButton
            targetMode={EditorMode.HackMD}
            isBtnDisabled={isBtnDisabled}
            onClick={pageEditorModeButtonClickedHandler}
            icon={<i className="fa fa-file-text-o" />}
            label={t('hackmd.hack_md')}
            id="grw-page-editor-mode-manager-hackmd-button"
          />
        )}
      </div>
      {isBtnDisabled && (
        <UncontrolledTooltip placement="top" target="grw-page-editor-mode-manager" fade={false}>
          {t('Not available for guest')}
        </UncontrolledTooltip>
      )}
      {!isBtnDisabled && showHackmdDisabledTooltip && (
        <UncontrolledTooltip placement="top" target="grw-page-editor-mode-manager-hackmd-button" fade={false}>
          {t('hackmd.not_set_up')}
        </UncontrolledTooltip>
      )}
    </>
  );

};

PageEditorModeManager.defaultProps = {
  isBtnDisabled: false,
};

export default PageEditorModeManager;

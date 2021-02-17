import React, { FC, useCallback } from 'react';
import { UncontrolledTooltip } from 'reactstrap';

import { useTranslation } from '~/i18n';
import { EditorMode, useEditorMode, useIsDeviceSmallerThanMd } from '~/stores/ui';


type PageEditorModeButtonProps = {
  targetMode: EditorMode,
  isBtnDisabled: boolean,
  onClick: (EditorMode) => void,
  icon: JSX.Element,
  label: string,
}

const PageEditorModeButton: FC<PageEditorModeButtonProps> = ({
  isBtnDisabled, onClick, targetMode, icon, label,
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
  const { data: editorMode, mutate: mutateEditorMode } = useEditorMode();
  const { data: isDeviceSmallerThanMd } = useIsDeviceSmallerThanMd();

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
        {(!isDeviceSmallerThanMd || !isEditorMode) && (
          <PageEditorModeButton
            targetMode={EditorMode.HackMD}
            isBtnDisabled={isBtnDisabled}
            onClick={pageEditorModeButtonClickedHandler}
            icon={<i className="fa fa-file-text-o" />}
            label={t('hackmd.hack_md')}
          />
        )}
      </div>
      {isBtnDisabled && (
        <UncontrolledTooltip placement="top" target="grw-page-editor-mode-manager" fade={false}>
          {t('Not available for guest')}
        </UncontrolledTooltip>
      )}
    </>
  );

};

PageEditorModeManager.defaultProps = {
  isBtnDisabled: false,
};

export default PageEditorModeManager;

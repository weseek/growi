import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { UncontrolledTooltip } from 'reactstrap';

import { EditorMode, useEditorMode } from '~/stores/ui';


type Props = {
  isGuestUserMode?: boolean,
}

const NotFoundAlert = (props: Props): JSX.Element => {
  const { t } = useTranslation();
  const { isGuestUserMode } = props;

  const { data: editorMode, mutate: mutateEditorMode } = useEditorMode();

  const isEditorMode = editorMode !== EditorMode.View;

  const clickHandler = useCallback(() => {
    // check guest user,
    // disabled of button cannot be used for using tooltip.
    if (isGuestUserMode) {
      return;
    }

    mutateEditorMode(EditorMode.Editor);

  }, [isGuestUserMode, mutateEditorMode]);

  if (isEditorMode) {
    return <></>;
  }

  return (
    <div className="border border-info p-3">
      <div
        className="col-md-12 p-0"
      >
        <h2 className="text-info lead">
          <i className="icon-info pr-2 font-weight-bold" aria-hidden="true"></i>
          {t('not_found_page.page_not_exist_alert')}
        </h2>
        <div id="create-page-btn-wrapper-for-tooltip" className="d-inline-block">
          <button
            type="button"
            className={`pl-3 pr-3 btn bg-info text-white ${isGuestUserMode ? 'disabled' : ''}`}
            onClick={clickHandler}
          >
            <i className="icon-note icon-fw" />
            {t('not_found_page.Create Page')}
          </button>
        </div>


        {isGuestUserMode && (
          <UncontrolledTooltip placement="bottom" target="create-page-btn-wrapper-for-tooltip" fade={false}>
            {t('Not available for guest')}
          </UncontrolledTooltip>
        )}
      </div>
    </div>
  );
};


export default NotFoundAlert;

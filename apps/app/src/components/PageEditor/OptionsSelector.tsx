import React, {
  memo, useCallback, useMemo, useState,
} from 'react';

import { useTranslation } from 'next-i18next';
import {
  Dropdown, DropdownToggle, DropdownMenu, DropdownItem,
} from 'reactstrap';

import { useIsIndentSizeForced } from '~/stores/context';
import { useEditorSettings, useCurrentIndentSize } from '~/stores/editor';

import { DEFAULT_THEME, KeyMapMode } from '../../interfaces/editor-settings';


const AVAILABLE_THEMES = [
  'eclipse', 'elegant', 'neo', 'mdn-like', 'material', 'dracula', 'monokai', 'twilight',
];

const TYPICAL_INDENT_SIZE = [2, 4];


const ThemeSelector = (): JSX.Element => {

  const { data: editorSettings, update } = useEditorSettings();

  const menuItems = useMemo(() => (
    <>
      { AVAILABLE_THEMES.map((theme) => {
        return <button key={theme} className="dropdown-item" type="button" onClick={() => update({ theme })}>{theme}</button>;
      }) }
    </>
  ), [update]);

  const selectedTheme = editorSettings?.theme ?? DEFAULT_THEME;

  return (
    <div className="input-group flex-nowrap">
      <div>
        <span className="input-group-text" id="igt-theme">Theme</span>
      </div>
      <div className="dropup">
        <button
          type="button"
          className="btn btn-outline-secondary dropdown-toggle"
          data-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded="false"
          aria-describedby="igt-theme"
        >
          {selectedTheme}
        </button>
        <div className="dropdown-menu" aria-labelledby="dropdownMenuLink">
          {menuItems}
        </div>
      </div>
    </div>
  );
};


type KeyMapModeToLabel = {
  [key in KeyMapMode]: string;
}

const KEYMAP_LABEL_MAP: KeyMapModeToLabel = {
  default: 'Default',
  vim: 'Vim',
  emacs: 'Emacs',
  sublime: 'Sublime Text',
};

const KeymapSelector = memo((): JSX.Element => {

  const { data: editorSettings, update } = useEditorSettings();

  Object.keys(KEYMAP_LABEL_MAP);
  const menuItems = useMemo(() => (
    <>
      { (Object.keys(KEYMAP_LABEL_MAP) as KeyMapMode[]).map((keymapMode) => {
        const keymapLabel = KEYMAP_LABEL_MAP[keymapMode];
        const icon = (keymapMode !== 'default')
          ? <img src={`/images/icons/${keymapMode}.png`} width="16px" className="mr-2"></img>
          : null;
        return <button key={keymapMode} className="dropdown-item" type="button" onClick={() => update({ keymapMode })}>{icon}{keymapLabel}</button>;
      }) }
    </>
  ), [update]);

  const selectedKeymapMode = editorSettings?.keymapMode ?? 'default';

  return (
    <div className="input-group flex-nowrap">
      <div>
        <span className="input-group-text" id="igt-keymap">Keymap</span>
      </div>
      <div className="dropup">
        <button
          type="button"
          className="btn btn-outline-secondary dropdown-toggle"
          data-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded="false"
          aria-describedby="igt-keymap"
        >
          { editorSettings != null && selectedKeymapMode}
        </button>
        <div className="dropdown-menu" aria-labelledby="dropdownMenuLink">
          {menuItems}
        </div>
      </div>
    </div>
  );

});

KeymapSelector.displayName = 'KeymapSelector';

type IndentSizeSelectorProps = {
  isIndentSizeForced: boolean,
  selectedIndentSize: number,
  onChange: (indentSize: number) => void,
}

const IndentSizeSelector = memo(({ isIndentSizeForced, selectedIndentSize, onChange }: IndentSizeSelectorProps): JSX.Element => {
  const menuItems = useMemo(() => (
    <>
      { TYPICAL_INDENT_SIZE.map((indent) => {
        return <button key={indent} className="dropdown-item" type="button" onClick={() => onChange(indent)}>{indent}</button>;
      }) }
    </>
  ), [onChange]);

  return (
    <div className="input-group flex-nowrap">
      <div>
        <span className="input-group-text" id="igt-indent">Indent</span>
      </div>
      <div className="dropup">
        <button
          type="button"
          className="btn btn-outline-secondary dropdown-toggle"
          data-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded="false"
          aria-describedby="igt-indent"
          disabled={isIndentSizeForced}
        >
          {selectedIndentSize}
        </button>
        <div className="dropdown-menu" aria-labelledby="dropdownMenuLink">
          {menuItems}
        </div>
      </div>
    </div>
  );

});

IndentSizeSelector.displayName = 'IndentSizeSelector';


const ConfigurationDropdown = memo((): JSX.Element => {
  const { t } = useTranslation();

  const [isCddMenuOpened, setCddMenuOpened] = useState(false);

  const { data: editorSettings, update } = useEditorSettings();

  const renderActiveLineMenuItem = useCallback(() => {
    if (editorSettings == null) {
      return <></>;
    }

    const isActive = editorSettings.styleActiveLine;

    const iconClasses = ['text-info'];
    if (isActive) {
      iconClasses.push('ti ti-check');
    }
    const iconClassName = iconClasses.join(' ');

    return (
      <DropdownItem toggle={false} onClick={() => update({ styleActiveLine: !isActive })}>
        <div className="d-flex justify-content-between">
          <span className="icon-container"></span>
          <span className="menuitem-label">{ t('page_edit.Show active line') }</span>
          <span className="icon-container"><i className={iconClassName}></i></span>
        </div>
      </DropdownItem>
    );
  }, [editorSettings, update, t]);

  const renderMarkdownTableAutoFormattingMenuItem = useCallback(() => {
    if (editorSettings == null) {
      return <></>;
    }

    const isActive = editorSettings.autoFormatMarkdownTable;

    const iconClasses = ['text-info'];
    if (isActive) {
      iconClasses.push('ti ti-check');
    }
    const iconClassName = iconClasses.join(' ');

    return (
      <DropdownItem toggle={false} onClick={() => update({ autoFormatMarkdownTable: !isActive })}>
        <div className="d-flex justify-content-between">
          <span className="icon-container"></span>
          <span className="menuitem-label">{ t('page_edit.auto_format_table') }</span>
          <span className="icon-container"><i className={iconClassName}></i></span>
        </div>
      </DropdownItem>
    );
  }, [editorSettings, t, update]);

  return (
    <div className="my-0">
      <Dropdown
        direction="up"
        className="grw-editor-configuration-dropdown"
        isOpen={isCddMenuOpened}
        toggle={() => setCddMenuOpened(!isCddMenuOpened)}
      >

        <DropdownToggle color="outline-secondary" caret>
          <i className="icon-settings"></i>
        </DropdownToggle>

        <DropdownMenu>
          {renderActiveLineMenuItem()}
          {renderMarkdownTableAutoFormattingMenuItem()}
          {/* <DropdownItem divider /> */}
        </DropdownMenu>

      </Dropdown>
    </div>
  );

});

ConfigurationDropdown.displayName = 'ConfigurationDropdown';


export const OptionsSelector = (): JSX.Element => {
  const { data: editorSettings } = useEditorSettings();
  const { data: isIndentSizeForced } = useIsIndentSizeForced();
  const { data: currentIndentSize, mutate: mutateCurrentIndentSize } = useCurrentIndentSize();

  if (editorSettings == null || isIndentSizeForced == null || currentIndentSize == null) {
    return <></>;
  }

  return (
    <>
      <div className="d-flex flex-row">
        <span>
          <ThemeSelector />
        </span>
        <span className="d-none d-sm-block ml-2 ml-sm-4">
          <KeymapSelector />
        </span>
        <span className="ml-2 ml-sm-4">
          <IndentSizeSelector
            isIndentSizeForced={isIndentSizeForced}
            selectedIndentSize={currentIndentSize}
            onChange={newValue => mutateCurrentIndentSize(newValue)}
          />
        </span>
        <span className="ml-2 ml-sm-4">
          <ConfigurationDropdown />
        </span>
      </div>
    </>
  );

};

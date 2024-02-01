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
  'DefaultLight', 'Eclipse', 'Basic', 'Ayu', 'Rosé Pine', 'DefaultDark', 'Material', 'Nord', 'Cobalt', 'Kimbie',
];

const TYPICAL_INDENT_SIZE = [2, 4];


const ThemeSelector = (): JSX.Element => {

  const [isThemeMenuOpened, setIsThemeMenuOpened] = useState(false);

  const { data: editorSettings, update } = useEditorSettings();

  const menuItems = useMemo(() => (
    <>
      { AVAILABLE_THEMES.map((theme) => {
        return (
          <DropdownItem className="menuitem-label" onClick={() => update({ theme })}>
            {theme}
          </DropdownItem>
        );
      }) }
    </>
  ), [update]);

  const selectedTheme = editorSettings?.theme ?? DEFAULT_THEME;

  return (
    <div className="input-group flex-nowrap">
      <div>
        <span className="input-group-text" id="igt-theme">Theme</span>
      </div>

      <Dropdown
        direction="up"
        isOpen={isThemeMenuOpened}
        toggle={() => setIsThemeMenuOpened(!isThemeMenuOpened)}
      >
        <DropdownToggle color="outline-secondary" caret>
          {selectedTheme}
        </DropdownToggle>

        <DropdownMenu container="body">
          {menuItems}
        </DropdownMenu>

      </Dropdown>
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
  vscode: 'Visual Studio Code',
};

const KeymapSelector = memo((): JSX.Element => {

  const [isKeyMenuOpened, setIsKeyMenuOpened] = useState(false);

  const { data: editorSettings, update } = useEditorSettings();

  const menuItems = useMemo(() => (
    <>
      { (Object.keys(KEYMAP_LABEL_MAP) as KeyMapMode[]).map((keymapMode) => {
        const keymapLabel = KEYMAP_LABEL_MAP[keymapMode];
        const icon = (keymapMode !== 'default')
          ? <img src={`/images/icons/${keymapMode}.png`} width="16px" className="me-2"></img>
          : null;
        return (
          <DropdownItem className="menuitem-label" onClick={() => update({ keymapMode })}>
            {icon}{keymapLabel}
          </DropdownItem>
        );
      }) }
    </>
  ), [update]);

  const selectedKeymapMode = editorSettings?.keymapMode ?? 'default';

  return (
    <div className="input-group flex-nowrap">
      <span className="input-group-text" id="igt-keymap">Keymap</span>
      <Dropdown
        direction="up"
        isOpen={isKeyMenuOpened}
        toggle={() => setIsKeyMenuOpened(!isKeyMenuOpened)}
      >
        <DropdownToggle color="outline-secondary" caret>
          {selectedKeymapMode}
        </DropdownToggle>

        <DropdownMenu container="body">
          {menuItems}
        </DropdownMenu>

      </Dropdown>
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

  const [isIndentMenuOpened, setIsIndentMenuOpened] = useState(false);

  const menuItems = useMemo(() => (
    <>
      { TYPICAL_INDENT_SIZE.map((indent) => {
        return (
          <DropdownItem className="menuitem-label" onClick={() => onChange(indent)}>
            {indent}
          </DropdownItem>
        );
      }) }
    </>
  ), [onChange]);

  return (
    <div className="input-group flex-nowrap">
      <span className="input-group-text" id="igt-indent">Indent</span>
      <Dropdown
        direction="up"
        isOpen={isIndentMenuOpened}
        toggle={() => setIsIndentMenuOpened(!isIndentMenuOpened)}
        disabled={isIndentSizeForced}
      >
        <DropdownToggle color="outline-secondary" caret>
          {selectedIndentSize}
        </DropdownToggle>

        <DropdownMenu container="body">
          {menuItems}
        </DropdownMenu>

      </Dropdown>
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

        <DropdownMenu container="body">
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
      <div className="d-flex flex-row zindex-dropdown">
        <span>
          <ThemeSelector />
        </span>
        <span className="d-none d-sm-block ms-2 ms-sm-4">
          <KeymapSelector />
        </span>
        <span className="ms-2 ms-sm-4">
          <IndentSizeSelector
            isIndentSizeForced={isIndentSizeForced}
            selectedIndentSize={currentIndentSize}
            onChange={newValue => mutateCurrentIndentSize(newValue)}
          />
        </span>
        <span className="ms-2 ms-sm-4">
          <ConfigurationDropdown />
        </span>
      </div>
    </>
  );

};

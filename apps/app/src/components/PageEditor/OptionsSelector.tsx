import React, {
  memo, useCallback, useMemo, useState,
} from 'react';

import { useTranslation } from 'next-i18next';
import Image from 'next/image';
import {
  Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Input, FormGroup,
} from 'reactstrap';

import { useIsIndentSizeForced } from '~/stores/context';
import { useEditorSettings, useCurrentIndentSize } from '~/stores/editor';

import {
  type EditorTheme, type KeyMapMode, DEFAULT_THEME, DEFAULT_KEYMAP,
} from '../../interfaces/editor-settings';


type RaitoListProps = {
  onClick: () => void,
  icon?: React.ReactNode,
  text: string,
  checked?: boolean
}

const RaitoListItem = (props: RaitoListProps): JSX.Element => {
  const {
    onClick, icon, text, checked,
  } = props;
  return (
    <li className="list-group-item border-0 d-flex align-items-center">
      <input
        onClick={onClick}
        className="form-check-input me-3"
        type="radio"
        name="listGroupRadio"
        id={`editor_config_radio_item_${text}`}
        checked={checked}
      />
      {icon}
      <label className="form-check-label stretched-link fs-6" htmlFor={`editor_config_radio_item_${text}`}>{text}</label>
    </li>
  );
};


type SelectorProps = {
  header: string,
  onClickBefore: () => void,
  items: JSX.Element,
}

const Selector = (props: SelectorProps): JSX.Element => {

  const { header, onClickBefore, items } = props;
  return (
    <div className="d-flex flex-column w-100">
      <button type="button" className="btn border-0 d-flex align-items-center text-muted ms-2" onClick={onClickBefore}>
        <span className="material-symbols-outlined fs-5 py-0 me-1">navigate_before</span>
        <label>{header}</label>
      </button>
      <hr className="my-1" />
      <ul className="list-group d-flex ms-2">
        { items }
      </ul>
    </div>
  );

};


type EditorThemeToLabel = {
  [key in EditorTheme]: string;
}

const EDITORTHEME_LABEL_MAP: EditorThemeToLabel = {
  defaultlight: 'DefaultLight',
  eclipse: 'Eclipse',
  basic: 'Basic',
  ayu: 'Ayu',
  rosepine: 'Rosé Pine',
  defaultdark: 'DefaultDark',
  material: 'Material',
  nord: 'Nord',
  cobalt: 'Cobalt',
  kimbie: 'Kimbie',
};

const ThemeSelector = memo(({ onClickBefore }: {onClickBefore: () => void}): JSX.Element => {

  const { data: editorSettings, update } = useEditorSettings();
  const selectedTheme = editorSettings?.theme ?? DEFAULT_THEME;

  const listItems = useMemo(() => (
    <>
      { (Object.keys(EDITORTHEME_LABEL_MAP) as EditorTheme[]).map((theme) => {
        const themeLabel = EDITORTHEME_LABEL_MAP[theme];
        return (
          <RaitoListItem onClick={() => update({ theme })} text={themeLabel} checked={theme === selectedTheme} />
        );
      }) }
    </>
  ), [update, selectedTheme]);

  return (
    <Selector header="Theme" onClickBefore={onClickBefore} items={listItems} />
  );
});
ThemeSelector.displayName = 'ThemeSelector';


type KeyMapModeToLabel = {
  [key in KeyMapMode]: string;
}

const KEYMAP_LABEL_MAP: KeyMapModeToLabel = {
  default: 'Default',
  vim: 'Vim',
  emacs: 'Emacs',
  vscode: 'Visual Studio Code',
};

const KeymapSelector = memo(({ onClickBefore }: {onClickBefore: () => void}): JSX.Element => {

  const { data: editorSettings, update } = useEditorSettings();
  const selectedKeymapMode = editorSettings?.keymapMode ?? DEFAULT_KEYMAP;

  const listItems = useMemo(() => (
    <>
      { (Object.keys(KEYMAP_LABEL_MAP) as KeyMapMode[]).map((keymapMode) => {
        const keymapLabel = KEYMAP_LABEL_MAP[keymapMode];
        const icon = (keymapMode !== 'default')
          ? <Image src={`/images/icons/${keymapMode}.png`} width={16} height={16} className="me-2" alt={keymapMode} />
          : null;
        return (
          <RaitoListItem onClick={() => update({ keymapMode })} icon={icon} text={keymapLabel} checked={keymapMode === selectedKeymapMode} />
        );
      }) }
    </>
  ), [update, selectedKeymapMode]);


  return (
    <Selector header="Keymap" onClickBefore={onClickBefore} items={listItems} />
  );
});
KeymapSelector.displayName = 'KeymapSelector';


const TYPICAL_INDENT_SIZE = [2, 4];

const IndentSizeSelector = memo(({ onClickBefore }: {onClickBefore: () => void}): JSX.Element => {

  const { data: currentIndentSize, mutate: mutateCurrentIndentSize } = useCurrentIndentSize();

  const listItems = useMemo(() => (
    <>
      { TYPICAL_INDENT_SIZE.map((indent) => {
        return (
          <RaitoListItem onClick={() => mutateCurrentIndentSize(indent)} text={indent.toString()} checked={indent === currentIndentSize} />
        );
      }) }
    </>
  ), [currentIndentSize, mutateCurrentIndentSize]);

  return (
    <Selector header="Indent" onClickBefore={onClickBefore} items={listItems} />
  );
});
IndentSizeSelector.displayName = 'IndentSizeSelector';


type SwitchItemProps = {
  onClick: () => void,
  checked: boolean,
  text: string,
};
const SwitchItem = memo((props: SwitchItemProps): JSX.Element => {
  const { onClick, checked, text } = props;
  return (
    <FormGroup switch>
      <Input type="switch" checked={checked} onClick={onClick} />
      <label>{text}</label>
    </FormGroup>

  );
});

const ConfigurationSelector = memo((): JSX.Element => {
  const { t } = useTranslation();

  const { data: editorSettings, update } = useEditorSettings();

  const renderActiveLineMenuItem = useCallback(() => {
    if (editorSettings == null) {
      return <></>;
    }

    const isActive = editorSettings.styleActiveLine;

    return (
      <SwitchItem onClick={() => update({ styleActiveLine: !isActive })} checked={isActive} text={t('page_edit.Show active line')} />
    );
  }, [editorSettings, update, t]);

  const renderMarkdownTableAutoFormattingMenuItem = useCallback(() => {
    if (editorSettings == null) {
      return <></>;
    }

    const isActive = editorSettings.autoFormatMarkdownTable;

    return (
      <SwitchItem onClick={() => update({ autoFormatMarkdownTable: !isActive })} checked={isActive} text={t('page_edit.auto_format_table')} />
    );
  }, [editorSettings, t, update]);

  return (
    <div className="mx-2 mt-1">
      {renderActiveLineMenuItem()}
      {renderMarkdownTableAutoFormattingMenuItem()}
    </div>
  );
});
ConfigurationSelector.displayName = 'ConfigurationSelector';


type ChangeStateButtonProps = {
  onClick: () => void,
  header: string,
  data: string,
  disabled?: boolean,
}
const ChangeStateButton = memo((props: ChangeStateButtonProps): JSX.Element => {
  const {
    onClick, header, data, disabled,
  } = props;
  return (
    <button type="button" className="d-flex align-items-center btn btn-sm border-0 my-1" disabled={disabled} onClick={onClick}>
      <label className="ms-2 me-auto">{header}</label>
      <label className="text-muted d-flex align-items-center me-1">
        {data}
        <span className="material-symbols-outlined fs-5 py-0">navigate_next</span>
      </label>
    </button>
  );
});


type OptionStatus = 'home' | 'theme' | 'keymap' | 'indent';
export const OptionsSelector = (): JSX.Element => {

  const [dropdownOpen, setDropdownOpen] = useState(true);

  const [status, setStatus] = useState<OptionStatus>('home');
  const { data: editorSettings } = useEditorSettings();
  const { data: currentIndentSize } = useCurrentIndentSize();
  const { data: isIndentSizeForced } = useIsIndentSizeForced();

  if (editorSettings == null || currentIndentSize == null || isIndentSizeForced == null) {
    return <></>;
  }

  return (
    <Dropdown isOpen={dropdownOpen} toggle={() => { setStatus('home'); setDropdownOpen(!dropdownOpen) }} direction="up" className="">
      <DropdownToggle color="transparent" className="btn border border-secondary text-muted d-flex align-items-center justify-content-center p-1 m-1">
        <span className="material-symbols-outlined py-0 fs-5"> settings </span>
        <label className="ms-1 me-1">Editor Config</label>
      </DropdownToggle>
      <DropdownMenu container="body" className="d-flex">
        {
          status === 'home' && (
            <div className="d-flex flex-column">
              <label className="text-muted ms-2">
                Editor Config
              </label>
              <hr className="my-1" />
              <ChangeStateButton onClick={() => setStatus('theme')} header="Theme" data={editorSettings.theme ?? ''} />
              <hr className="my-1" />
              <ChangeStateButton onClick={() => setStatus('keymap')} header="Keymap" data={editorSettings.keymapMode ?? ''} />
              <hr className="my-1" />
              <ChangeStateButton disabled={isIndentSizeForced} onClick={() => setStatus('indent')} header="Indent" data={currentIndentSize.toString() ?? ''} />
              <hr className="my-1" />
              <ConfigurationSelector />
            </div>
          )
        }
        { status === 'theme' && (
          <ThemeSelector onClickBefore={() => setStatus('home')} />
        )
        }
        { status === 'keymap' && (
          <KeymapSelector onClickBefore={() => setStatus('home')} />
        )
        }
        { status === 'indent' && (
          <IndentSizeSelector onClickBefore={() => setStatus('home')} />
        )
        }
      </DropdownMenu>
    </Dropdown>
  );
};

import React, {
  memo, useCallback, useMemo, useState,
} from 'react';

import { useTranslation } from 'next-i18next';
import Image from 'next/image';
import {
  Dropdown, DropdownToggle, DropdownMenu, DropdownItem,
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
    <li className="list-group-item border-0">
      <input onClick={onClick} className="form-check-input me-1" type="radio" name="listGroupRadio" id={`editor_config_radio_item_${text}`} checked={checked} />
      {icon}
      <label className="form-check-label stretched-link" htmlFor={`editor_config_radio_item_${text}`}>{text}</label>
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
    <div className="d-flex flex-column">
      <button type="button" className="btn btn-sm" onClick={onClickBefore}>
        <span className="material-symbols-outlined">navigate_before</span>
        {header}
      </button>
      <ul className="list-group">
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

type OptionStatus = 'home' | 'theme' | 'keymap' | 'indent';

export const OptionsSelector = (): JSX.Element => {


  const [dropdownOpen, setDropdownOpen] = useState(true);
  const [status, setStatus] = useState<OptionStatus>('home');

  const [count, setCount] = useState(0);

  return (
    <Dropdown isOpen={dropdownOpen} toggle={() => { setStatus('home'); setDropdownOpen(!dropdownOpen) }} direction="up" className="">
      <DropdownToggle color="transparent" className="btn btn-sm border d-flex align-items-center justify-content-center">
        <span className="material-symbols-outlined py-0"> settings </span>
        Editor Config
      </DropdownToggle>
      <DropdownMenu container="body">
        {
          status === 'home' && (
            <>
              <div>
                Editor Config
              </div>
              <button type="button" className="btn btn-sm border-0" onClick={() => setStatus('theme')}>
                Theme
              </button>
              <button type="button" className="btn btn-sm border-0" onClick={() => setStatus('keymap')}>
                Keymap
              </button>
              <button type="button" className="btn btn-sm border-0" onClick={() => setStatus('indent')}>
                Indent
              </button>
            </>
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


  // return (
  //   <>
  //     <div className="d-flex flex-row zindex-dropdown">
  //       <span>
  //         <ThemeSelector />
  //       </span>
  //       <span className="d-none d-sm-block ms-2 ms-sm-4">
  //         <KeymapSelector />
  //       </span>
  //       <span className="ms-2 ms-sm-4">
  //         <IndentSizeSelector
  //           isIndentSizeForced={isIndentSizeForced}
  //           selectedIndentSize={currentIndentSize}
  //           onChange={newValue => mutateCurrentIndentSize(newValue)}
  //         />
  //       </span>
  //       <span className="ms-2 ms-sm-4">
  //         <ConfigurationDropdown />
  //       </span>
  //     </div>
  //   </>
  // );

};

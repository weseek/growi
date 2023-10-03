import { FC, useState, CSSProperties } from 'react';

import { Picker } from 'emoji-mart';
import i18n from 'i18next';
import { Modal } from 'reactstrap';

import { useNextThemes } from '~/stores/use-next-themes';

import type { UseCodeMirrorEditor } from 'src';

import 'emoji-mart/css/emoji-mart.css';

type Props = {
  codeMirrorEditor: UseCodeMirrorEditor | undefined
}

type Translation = {
  search: string
  clear: string
  notfound: string
  skintext: string
  categories: object
  categorieslabel: string
  skintones: object
  title: string
}

const getEmojiTranslation = (): Translation => {

  const categories: { [key: string]: string } = {};
  [
    'search',
    'recent',
    'smileys',
    'people',
    'nature',
    'foods',
    'activity',
    'places',
    'objects',
    'symbols',
    'flags',
    'custom',
  ].forEach((category) => {
    categories[category] = i18n.t(`emoji.categories.${category}`);
  });

  const skintones: { [key: string]: string} = {};
  (Array.from(Array(6).keys())).forEach((tone) => {
    skintones[tone + 1] = i18n.t(`emoji.skintones.${tone + 1}`);
  });

  const translation = {
    search: i18n.t('emoji.search'),
    clear: i18n.t('emoji.clear'),
    notfound: i18n.t('emoji.notfound'),
    skintext: i18n.t('emoji.skintext'),
    categories,
    categorieslabel: i18n.t('emoji.categorieslabel'),
    skintones,
    title: i18n.t('emoji.title'),
  };

  return translation;
};

export const EmojiButton: FC<Props> = (props) => {
  const [isOpen, setIsOpen] = useState(false);

  const { resolvedTheme } = useNextThemes();

  const { codeMirrorEditor } = props;
  const view = codeMirrorEditor?.view;

  if (view == null) {
    return <></>;
  }

  const cursorIndex = view?.state.selection.main.head;

  const translation = getEmojiTranslation();

  const toggle = () => setIsOpen(!isOpen);

  const selectEmoji = (emoji: { colons: string }): void => {

    if (cursorIndex == null) {
      return;
    }

    view?.dispatch({
      changes: {
        from: cursorIndex,
        insert: emoji.colons,
      },
    });

    toggle();
  };

  const setStyle = (): CSSProperties => {
    const offset = 20;
    const emojiPickerHeight = 420;
    // const cursorPos = this.editor.cursorCoords(true);
    const cursorRect = view.coordsAtPos(cursorIndex);
    const editorRect = view.dom.getBoundingClientRect();

    if (cursorRect == null) {
      return {};
    }

    // Emoji Picker bottom position exceed editor's bottom position
    if (cursorRect.bottom + emojiPickerHeight > editorRect.bottom) {
      return {
        top: editorRect.bottom - emojiPickerHeight,
        left: cursorRect.left + offset,
        position: 'fixed',
      };
    }
    return {
      top: cursorRect.top + offset,
      left: cursorRect.left + offset,
      position: 'fixed',
    };
  };

  return (
    <>
      <button type="button" className="btn btn-toolbar-button" onClick={toggle}>
        <span className="material-icons-outlined fs-6">emoji_emotions</span>
      </button>
      <div className="mb-2 d-none d-md-block">
        <Modal isOpen={isOpen} toggle={toggle} backdropClassName="emoji-picker-modal" fade={false}>
          <Picker
            onSelect={(emoji: any) => selectEmoji(emoji)}
            i18n={translation}
            title={translation.title}
            emojiTooltip
            style={setStyle()}
            theme={resolvedTheme}
          />
        </Modal>
      </div>
    </>
  );
};

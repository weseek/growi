import React, { FC, useState } from 'react';

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

  const categories = {};
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

  const skintones = {};
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

  const { codeMirrorEditor } = props;

  const { resolvedTheme } = useNextThemes();
  const translation = getEmojiTranslation();

  const toggle = () => setIsOpen(!isOpen);

  const selectEmoji = (emoji: { colons: string }): void => {
    const view = codeMirrorEditor?.view;
    const currentPos = view?.state.selection.main.head;

    if (currentPos == null) {
      return;
    }

    view?.dispatch({
      changes: {
        from: currentPos,
        insert: emoji.colons,
      },
    });
  };

  return (
    <>
      <button type="button" className="btn btn-toolbar-button" onClick={toggle}>
        <span className="material-icons-outlined fs-6">emoji_emotions</span>
      </button>
      <Modal isOpen={isOpen} toggle={toggle} backdropClassName="emoji-picker-modal" fade={false}>
        <Picker
          onSelect={(emoji: any) => selectEmoji(emoji)}
          i18n={translation}
          title={translation.title}
          emojiTooltip
          theme={resolvedTheme}
        />
      </Modal>
    </>
  );
};

import {
  type ComponentType,
  type JSX,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { Modal } from 'reactstrap';

type EmojiMartSelection = { id: string; skin?: number };

type PickerProps = {
  onEmojiSelect: (emoji: EmojiMartSelection) => void;
  theme: string | undefined;
  data: unknown;
  skinTonePosition: 'preview' | 'search' | 'none';
};

export type EmojiPickerProps = {
  isOpen: boolean;
  onSelect: (selection: { id: string; skin?: number }) => void;
  onClose: () => void;
  theme?: 'light' | 'dark' | 'auto';
};

export const EmojiPicker = (props: EmojiPickerProps): JSX.Element | null => {
  const { isOpen, onSelect, onClose, theme } = props;

  const [Picker, setPicker] = useState<ComponentType<PickerProps> | null>(null);
  const [emojiData, setEmojiData] = useState<unknown>(null);

  useEffect(() => {
    if (!isOpen || Picker != null) return;

    let cancelled = false;
    Promise.all([import('@emoji-mart/react'), import('@emoji-mart/data')]).then(
      ([pickerMod, dataMod]) => {
        if (cancelled) return;
        setPicker(() => pickerMod.default as ComponentType<PickerProps>);
        setEmojiData(dataMod.default);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [isOpen, Picker]);

  const handleEmojiSelect = useCallback(
    (emoji: EmojiMartSelection): void => {
      onSelect({ id: emoji.id, skin: emoji.skin });
    },
    [onSelect],
  );

  if (!isOpen || Picker == null || emojiData == null) {
    return null;
  }

  return (
    <Modal
      isOpen
      toggle={onClose}
      centered
      fade={false}
      backdropClassName="emoji-picker-modal"
      contentClassName="border-0 bg-transparent align-items-center"
    >
      <Picker
        onEmojiSelect={handleEmojiSelect}
        theme={theme}
        data={emojiData}
        skinTonePosition="search"
      />
    </Modal>
  );
};

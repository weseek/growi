import { Emoji } from 'emoji-mart';
import data from 'emoji-mart/data/apple.json';

const DEFAULT_EMOJI_SIZE = 24;


type EmojiMap = {
  [key: string]: string,
};

/**
 *
 * Get native emoji with skin tone
 * @param skin number
 * @returns emoji data with skin tone
 */
const getEmojiSkinTone = (emojiName: string): EmojiMap => {
  const emojiData = {};
  [...Array(6).keys()].forEach((index) => {
    if (index > 0) {
      const elem = Emoji({
        emoji: emojiName,
        skin: index + 1,
        size: DEFAULT_EMOJI_SIZE,
      });
      if (elem) {
        emojiData[`${emojiName}::skin-tone-${index + 1}`] = elem.props['aria-label'].split(',')[0];
      }
    }
  });
  return emojiData;
};

/**
 * Get native emoji from emoji array
 * @returns emoji data
 */

const getNativeEmoji = (): EmojiMap => {
  const emojiData = {};
  Object.entries(data.emojis).forEach((emoji) => {
    const emojiName = emoji[0];
    const hasSkinVariation = 'skin_variations' in emoji[1];

    const elem = Emoji({
      emoji: emojiName,
      size: DEFAULT_EMOJI_SIZE,
    });

    if (elem != null) {
      emojiData[emojiName] = elem.props['aria-label'].split(',')[0];
      if (hasSkinVariation) {
        const emojiWithSkinTone = getEmojiSkinTone(emojiName);
        Object.assign(emojiData, emojiWithSkinTone);
      }
    }
  });

  return emojiData;
};

/**
 * Get native emoji mart data
 * @returns native emoji mart data
 */
export const emojiMartData = getNativeEmoji();

import data from 'emoji-mart/data/all.json';
import { Emoji } from 'emoji-mart';

const DEFAULT_EMOJI_SIZE = 24;

/**
 *
 * Get native emoji with skin tone
 * @param emoji Emoji object
 * @param skin number
 * @returns emoji data with skin tone
 */
const emojiSkinTone = async(emoji) => {
  const emojiData = {};
  [...Array(6).keys()].forEach((index) => {
    if (index > 0) {
      const elem = Emoji({
        set: 'apple',
        emoji,
        skin: index + 1,
        size: DEFAULT_EMOJI_SIZE,
      });
      if (elem) {
        emojiData[`${emoji}::skin-tone-${index + 1}`] = elem.props['aria-label'].split(',')[0];
      }
    }
  });
  return emojiData;
};

/**
 * Get native emoji from emoji array
 * @param emojis array of emoji
 * @returns emoji data
 */

const getNativeEmoji = async(emojis) => {
  const emojiData = {};
  emojis.forEach(async(emoji) => {
    const elem = Emoji({
      set: 'apple',
      emoji: emoji[0],
      size: DEFAULT_EMOJI_SIZE,
    });
    if (elem) {
      emojiData[emoji[0]] = elem.props['aria-label'].split(',')[0];
      if (emoji[1].skin_variations) {
        const emojiWithSkinTone = await emojiSkinTone(emoji[0]);
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

export const emojiMartData = () => {
  const emojis = Object.entries(data.emojis).map((emoji) => {
    return emoji;
  });
  return getNativeEmoji(emojis);
};

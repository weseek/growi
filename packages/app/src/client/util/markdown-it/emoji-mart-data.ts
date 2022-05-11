import { Emoji } from 'emoji-mart';
import data from 'emoji-mart/data/apple.json';

// Custom mapping for unavailable emoji name
const customEmojiAliasesMapping = {
  family_man_boy: 'man-boy',
  family_man_girl: 'man-girl',
  family_man_girl_girl: 'man-girl-girl',
  family_man_girl_boy: 'man-girl-boy',
  family_man_boy_boy: 'man-boy-boy',
  family_woman_boy: 'woman-boy',
  family_woman_girl: 'woman-girl',
  family_woman_girl_girl: 'woman-girl-girl',
  family_woman_girl_boy: 'woman-girl-boy',
  family_woman_boy_boy: 'woman-boy-boy',
};

const DEFAULT_EMOJI_SIZE = 24;

/**
 *
 * Get native emoji with skin tone
 * @param emoji Emoji object
 * @param skin number
 * @returns emoji data with skin tone
 */
const getEmojiSkinTone = async(emoji) => {
  const emojiData = {};
  [...Array(6).keys()].forEach((index) => {
    if (index > 0) {
      const elem = Emoji({
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
    const emojiName = emoji[0];
    const hasSkinVariation = emoji[1].skin_variations;
    const elem = Emoji({
      emoji: emojiName,
      size: DEFAULT_EMOJI_SIZE,
    });
    if (elem != null) {
      emojiData[emojiName] = elem.props['aria-label'].split(',')[0];
      if (hasSkinVariation) {
        const emojiWithSkinTone = await getEmojiSkinTone(emojiName);
        Object.assign(emojiData, emojiWithSkinTone);
      }
    }
    // Get emoji by alias if emoji not available
    else {
      const elem = Emoji({
        emoji: customEmojiAliasesMapping[emojiName],
        size: DEFAULT_EMOJI_SIZE,
      });
      emojiData[emojiName] = elem.props['aria-label'].split(',')[0];
      if (hasSkinVariation) {
        const emojiWithSkinTone = await getEmojiSkinTone(emojiName);
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
  const emojiData = data;
  Object.assign(emojiData.aliases, customEmojiAliasesMapping);
  const emojis = Object.entries(emojiData.emojis).map((emoji) => {
    return emoji;
  });

  Object.entries(emojiData.aliases).forEach((alias) => {
    const emoji = emojis.filter(emoji => emoji[0] === alias[1]);
    emojis.push([alias[0], emoji[0][1]]);
  });
  return getNativeEmoji(emojis);
};

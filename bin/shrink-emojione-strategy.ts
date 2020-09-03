/**
 * the tool to shrink emojione/emoji_strategy.json and output
 *
 * @author Yuki Takei <yuki@weseek.co.jp>
 */
import axios, { AxiosResponse } from 'axios';
import fs from 'graceful-fs';
import markdownItEmojiFull from 'markdown-it-emoji/lib/data/full.json';

import { resolveFromRoot } from '~/utils/project-dir-utils';

const OUT: string = resolveFromRoot('tmp/emoji_strategy_shrinked.json');
const EMOJI_STRATEGY_URI = 'https://cdn.jsdelivr.net/npm/emojione@3.1.2/emoji_strategy.json';

async function main() {
  // download emojione/emoji_strategy.json
  const response: AxiosResponse = await axios.get(EMOJI_STRATEGY_URI);
  const emojiStrategy = response.data;

  const shrinkedMap = {};
  Object.keys(emojiStrategy).forEach((unicode) => {
    const data = emojiStrategy[unicode];
    const shortname = data.shortname.replace(/:/g, '');

    // ignore if it isn't included in markdownItEmojiFull
    if (markdownItEmojiFull[shortname] == null) {
      return;
    }

    // add
    shrinkedMap[unicode] = data;
  });

  // write
  fs.writeFileSync(OUT, JSON.stringify(shrinkedMap));
}

main();

import markdownItEmojiMart from 'markdown-it-emoji-mart';
import markdownItToc from 'markdown-it-toc-and-anchor-with-slugid';

import { emojiMartData } from './emoji-mart-data';

export default class TocAndAnchorConfigurer {

  constructor(crowi, setHtml) {
    this.crowi = crowi;
    this.setHtml = setHtml;
  }

  configure(md) {
    md.use(markdownItEmojiMart, { defs: emojiMartData })
      .use(markdownItToc, {
        tocLastLevel: 3,
        anchorLinkBefore: false,
        anchorLinkSymbol: '',
        anchorLinkSymbolClassName: 'icon-link',
        anchorClassName: 'revision-head-link',
      });

    // set toc render function
    if (this.setHtml != null) {
      md.set({
        tocCallback: (tocMarkdown, tocArray, tocHtml) => {
          this.setHtml(tocHtml);
        },
      });
    }
  }

}

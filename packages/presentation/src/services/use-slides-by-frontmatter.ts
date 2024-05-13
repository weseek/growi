import { useEffect, useMemo, useState } from 'react';

import remarkFrontmatter from 'remark-frontmatter';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import { unified } from 'unified';


type ParseResult = {
  marp: boolean | undefined,
  slide: boolean | undefined,
}

const parseSlideFrontmatter = (frontmatter: string): ParseResult => {

  let marp;
  let slide;

  const lines = frontmatter.split('\n');
  lines.forEach((line) => {
    const [key, value] = line.split(':').map(part => part.trim());
    if (key === 'marp' && value === 'true') {
      marp = true;
    }
    if (key === 'slide' && value === 'true') {
      slide = true;
    }
  });

  return { marp, slide };
};


export type UseSlide = {
  marp?: boolean,
}

/**
 * Frontmatter parser for slide
 * @param markdown Markdwon document
 * @returns An UseSlide instance. If the markdown does not contain neither "marp" or "slide" attribute in frontmatter, it returns undefined.
 */
export const useSlidesByFrontmatter = (markdown?: string, isEnabledMarp?: boolean): UseSlide | undefined => {

  const [parseResult, setParseResult] = useState<UseSlide|undefined>();

  const processor = useMemo(() => {
    return unified()
      .use(remarkParse)
      .use(remarkStringify)
      .use(remarkFrontmatter, ['yaml'])
      .use(() => ((obj) => {
        if (obj.children[0]?.type === 'yaml') {
          const result = parseSlideFrontmatter(obj.children[0]?.value);
          setParseResult(result.marp || result.slide ? result : undefined);
        }
        else {
          setParseResult(undefined);
        }
      }));
  }, []);

  useEffect(() => {
    if (markdown == null) {
      return;
    }

    processor.process(markdown);
  }, [markdown, processor]);


  return parseResult != null
    ? { marp: isEnabledMarp && parseResult?.marp }
    : undefined;

};

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
export const parseSlideFrontmatterInMarkdown = async(markdown?: string): Promise<UseSlide | undefined> => {

  let result: ParseResult | undefined;

  await unified()
    .use(remarkParse)
    .use(remarkStringify)
    .use(remarkFrontmatter, ['yaml'])
    .use(() => ((obj) => {
      if (obj.children[0]?.type === 'yaml') {
        result = parseSlideFrontmatter(obj.children[0]?.value as string);
      }
    }))
    .process(markdown as string);

  if (result == null) {
    return;
  }

  const { marp, slide } = result;

  if (!marp && !slide) {
    return;
  }

  return { marp };

};

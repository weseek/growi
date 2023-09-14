import remarkFrontmatter from 'remark-frontmatter';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import { unified } from 'unified';


export const parseSlideFrontmatter = (frontmatter: string): [boolean, boolean] => {

  let marp = false;
  let slide = false;

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

  return [marp, slide];
};

export const parseSlideFrontmatterInMarkdown = (markdown?: string): [boolean, boolean] => {

  let marp = false;
  let slide = false;

  unified()
    .use(remarkParse)
    .use(remarkStringify)
    .use(remarkFrontmatter, ['yaml'])
    .use(() => ((obj) => {
      if (obj.children[0]?.type === 'yaml') {
        [marp, slide] = parseSlideFrontmatter(obj.children[0]?.value as string);
      }
    }))
    .process(markdown as string);

  return [marp, slide];
};

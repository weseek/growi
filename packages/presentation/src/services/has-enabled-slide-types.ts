export const hasEnabledSlideTypes = (markdown?: string): [boolean, boolean, boolean] => {

  if (markdown == null) {
    return [false, false, false];
  }

  const text = markdown.slice(0, 1000);

  const reStartFrontmatter = /^---\n/;
  const reEndFrontmatter = /\n---\n/;

  if (!reStartFrontmatter.test(text) && !reEndFrontmatter.test(text)) {
    return [false, false, false];
  }

  const reEnableMarp = /\nmarp\s*:\s+true\n/;
  const reEnableSlide = /\nslide\s*:\s+true\n/;

  const marp = reEnableMarp.test(text) && reEnableMarp.lastIndex < reEndFrontmatter.lastIndex;
  const slide = reEnableSlide.test(text) && reEnableSlide.lastIndex < reEndFrontmatter.lastIndex;

  const enable = marp || slide;

  return [enable, marp, slide];
};

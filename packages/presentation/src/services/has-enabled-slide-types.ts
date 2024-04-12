export const hasEnabledSlideTypes = (markdown?: string): [boolean, boolean, boolean] => {

  if (markdown == null) {
    return [false, false, false];
  }

  const text = markdown.slice(0, 300);

  const reStartFrontmatter = /^---\s*\n/g;
  const reEndFrontmatter = /\n---\s*\n/g;

  if (!reStartFrontmatter.test(text) || !reEndFrontmatter.test(text)) {
    return [false, false, false];
  }

  const reEnableMarp = /\nmarp\s*:\s+true\n/g;
  const reEnableSlide = /\nslide\s*:\s+true\n/g;

  const marp = reEnableMarp.test(text) && reEnableMarp.lastIndex < reEndFrontmatter.lastIndex;
  const slide = reEnableSlide.test(text) && reEnableSlide.lastIndex < reEndFrontmatter.lastIndex;

  const enable = marp || slide;

  return [enable, marp, slide];
};

/**
 * https://nextjs.org/docs/api-reference/next/image#loader
 */
export const nextImageLoader = ({ src, width, quality }: {src: string, width: number, quality: number}): string => {
  return `${src}?w=${width}&q=${quality}`;
};

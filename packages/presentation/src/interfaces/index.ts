export const SLIDE_STYLE = { true: 'true', marp: 'marp' } as const;
export type presentationSlideStyle = typeof SLIDE_STYLE[keyof typeof SLIDE_STYLE];

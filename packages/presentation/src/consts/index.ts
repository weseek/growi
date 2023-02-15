import type { ReactMarkdownOptions } from 'react-markdown/lib/react-markdown';
import type { Options as RevealOptions } from 'reveal.js';

export type PresentationOptions = {
  rendererOptions: ReactMarkdownOptions,
  revealOptions?: RevealOptions,
  isDarkMode?: boolean,
  disableSeparationByHeader?: boolean,
}

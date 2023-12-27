import localFont from 'next/font/local';

import { DefineStyle } from './types';

const growiCustomIconFont = localFont({
  src: '../../../../../packages/apps-font-icons/font/growi-custom-icon.woff2',
  adjustFontFallback: false,
});

export const useGrowiCustomIcon: DefineStyle = () => (
  <style jsx global>
    {`
      :root {
        --grw-font-family-custom-svg-font: ${growiCustomIconFont.style.fontFamily};
      }
    `}
  </style>
);

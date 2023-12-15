import { memo } from 'react';

import { useLatoFontFamily } from './use-lato';
import { useMaterialSymbolsOutlined } from './use-material-symbols-outlined';
import { useSourceHanCodeJP } from './use-source-han-code-jp';

/**
 * Define prefixed by '--grw-font-family'
 */
export const GlobalFonts = memo((): JSX.Element => {

  const latoFontFamily = useLatoFontFamily();
  const sourceHanCodeJPFontFamily = useSourceHanCodeJP();
  const materialSymbolsOutlinedFontFamily = useMaterialSymbolsOutlined();

  return (
    <>
      {latoFontFamily}
      {sourceHanCodeJPFontFamily}
      {materialSymbolsOutlinedFontFamily}
    </>
  );
});

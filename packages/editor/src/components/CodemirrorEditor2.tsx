import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { scrollPastEnd } from '@codemirror/view';
import CodeMirror from '@uiw/react-codemirror';


import style from './CodemirrorEditor2.module.scss';


export const CodemirrorEditor = (): JSX.Element => {
  return (
    <CodeMirror
      className={`${style['codemirror-editor']}`}
      extensions={[
        markdown({ base: markdownLanguage, codeLanguages: languages }),
        scrollPastEnd(),
      ]}
    />
  );
};

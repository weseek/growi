import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import CodeMirror from '@uiw/react-codemirror';

export const CodemirrorEditor = (): JSX.Element => {
  return (
    <CodeMirror
      extensions={[
        markdown({ base: markdownLanguage, codeLanguages: languages }),
      ]}
    />
  );
};
